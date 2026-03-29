"""Claude SKILL.md frontmatter checks (subset of skill-creator quick_validate)."""

from __future__ import annotations

import re
from pathlib import Path

import yaml

# Maximum length per common Claude skill packaging guidance.
DESCRIPTION_MAX_LEN = 1024

NAME_PATTERN = re.compile(r"^[a-z0-9-]+$")
FRONTMATTER_PATTERN = re.compile(r"^---\n(.*?)\n---", re.DOTALL)
ALLOWED_KEYS = frozenset(
    {"name", "description", "license", "allowed-tools", "metadata", "compatibility"}
)


def parse_frontmatter(skill_md: Path) -> dict:
    """Return YAML frontmatter dict from SKILL.md."""
    text = skill_md.read_text(encoding="utf-8")
    match = FRONTMATTER_PATTERN.match(text)
    if not match:
        raise ValueError(f"missing or invalid YAML frontmatter: {skill_md}")
    loaded = yaml.safe_load(match.group(1))
    if not isinstance(loaded, dict):
        raise ValueError(f"frontmatter must be a mapping: {skill_md}")
    return loaded


def validate_skill_frontmatter(skill_md: Path, *, rel_display: str | None = None) -> list[str]:
    """
    Validate a single SKILL.md. Returns a list of human-readable errors (empty if ok).
    """
    label = rel_display or str(skill_md)
    errors: list[str] = []
    try:
        fm = parse_frontmatter(skill_md)
    except (ValueError, yaml.YAMLError) as exc:
        return [f"{label}: {exc}"]

    unexpected = set(fm.keys()) - ALLOWED_KEYS
    if unexpected:
        errors.append(
            f"{label}: unexpected frontmatter key(s): {', '.join(sorted(unexpected))}"
        )

    name = fm.get("name", "")
    if not isinstance(name, str) or not name.strip():
        errors.append(f"{label}: 'name' must be a non-empty string")
    elif not NAME_PATTERN.match(name):
        errors.append(
            f"{label}: 'name' must be kebab-case (lowercase, digits, hyphens): {name!r}"
        )
    elif name.startswith("-") or name.endswith("-") or "--" in name:
        errors.append(f"{label}: invalid 'name' hyphen rules: {name!r}")
    elif len(name) > 64:
        errors.append(f"{label}: 'name' exceeds 64 characters")

    desc = fm.get("description", "")
    if not isinstance(desc, str):
        errors.append(f"{label}: 'description' must be a string")
    else:
        desc = desc.strip()
        if not desc:
            errors.append(f"{label}: 'description' must be non-empty")
        elif len(desc) > DESCRIPTION_MAX_LEN:
            errors.append(
                f"{label}: 'description' exceeds {DESCRIPTION_MAX_LEN} characters "
                f"({len(desc)})"
            )
        elif "<" in desc or ">" in desc:
            errors.append(f"{label}: 'description' must not contain angle brackets")

    return errors
