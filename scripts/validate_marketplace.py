#!/usr/bin/env python3
"""
Validate .claude-plugin/marketplace.json and every registered skill directory.
Also ensure each plugins/<skill>/SKILL.md is listed in the manifest (no orphans / drift).
"""

from __future__ import annotations

import json
import re
import sys
from pathlib import Path

from scripts.skill_rules import validate_skill_frontmatter

REPO_ROOT = Path(__file__).resolve().parents[1]
MARKETPLACE_JSON = REPO_ROOT / ".claude-plugin" / "marketplace.json"
PLUGINS_DIR = REPO_ROOT / "plugins"
PLUGIN_NAME_RE = re.compile(r"^[a-z][a-z0-9-]*$")


def _resolve_skill_path(entry: str) -> Path:
    """Resolve ./plugins/foo style paths relative to repo root."""
    raw = entry.strip()
    if raw.startswith("./"):
        raw = raw[2:]
    return (REPO_ROOT / raw).resolve()


def collect_errors(root: Path | None = None) -> list[str]:
    """Return all validation errors for the marketplace repo."""
    base = root or REPO_ROOT
    errors: list[str] = []
    mp_path = base / ".claude-plugin" / "marketplace.json"
    if not mp_path.is_file():
        return [f"missing marketplace manifest: {mp_path}"]

    try:
        manifest = json.loads(mp_path.read_text(encoding="utf-8"))
    except json.JSONDecodeError as exc:
        return [f"invalid JSON in {mp_path}: {exc}"]

    if not isinstance(manifest, dict):
        return [f"{mp_path}: root must be a JSON object"]

    if "name" not in manifest:
        errors.append(f"{mp_path}: missing top-level 'name'")
    if "plugins" not in manifest:
        errors.append(f"{mp_path}: missing 'plugins' array")
        return errors

    plugins = manifest["plugins"]
    if not isinstance(plugins, list):
        errors.append(f"{mp_path}: 'plugins' must be an array")
        return errors

    registered: set[str] = set()
    for idx, plugin in enumerate(plugins):
        prefix = f"{mp_path} plugins[{idx}]"
        if not isinstance(plugin, dict):
            errors.append(f"{prefix}: must be an object")
            continue
        pname = plugin.get("name", "")
        if not isinstance(pname, str) or not pname:
            errors.append(f"{prefix}: missing plugin name")
        elif not PLUGIN_NAME_RE.match(pname):
            errors.append(
                f"{prefix}: plugin name should be kebab-case-ish: {pname!r}"
            )
        skills = plugin.get("skills")
        if skills is None:
            errors.append(f"{prefix}: missing 'skills' array")
            continue
        if not isinstance(skills, list):
            errors.append(f"{prefix}: 'skills' must be an array")
            continue
        for j, sk in enumerate(skills):
            if not isinstance(sk, str) or not sk.strip():
                errors.append(f"{prefix} skills[{j}]: must be non-empty string")
                continue
            resolved = _resolve_skill_path(sk)
            key = str(resolved.relative_to(base))
            if key in registered:
                errors.append(f"{prefix}: duplicate skill path {sk!r}")
            registered.add(key)
            if not resolved.is_dir():
                errors.append(f"skill directory missing: {resolved}")
                continue
            skill_md = resolved / "SKILL.md"
            if not skill_md.is_file():
                errors.append(f"missing SKILL.md: {skill_md}")
                continue
            rel = skill_md.relative_to(base)
            errors.extend(
                validate_skill_frontmatter(skill_md, rel_display=str(rel))
            )

    # Every plugin subfolder that has SKILL.md must appear in the manifest.
    plugins_root = base / "plugins"
    if plugins_root.is_dir():
        discovered = {
            str(p.parent.resolve().relative_to(base))
            for p in plugins_root.glob("*/SKILL.md")
        }
        missing_registration = discovered - registered
        for rel in sorted(missing_registration):
            errors.append(
                f"SKILL.md at {rel} is not listed in marketplace.json 'skills' arrays"
            )

    return errors


def main() -> int:
    errors = collect_errors()
    if errors:
        print("Marketplace validation failed:", file=sys.stderr)
        for line in errors:
            print(f"  - {line}", file=sys.stderr)
        return 1
    print("Marketplace OK: manifest and all skills valid.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
