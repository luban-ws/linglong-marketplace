#!/usr/bin/env python3
"""
Build GitHub Pages output: emit catalog + manifest for the React (Vite) app, then run npm build.

The demo site lives in site/web (Vite + React). Python remains the source of truth for
marketplace.json + SKILL.md → structured data.
"""

from __future__ import annotations

import argparse
import json
import os
import re
import subprocess
import sys
from datetime import datetime, timezone
from pathlib import Path

import yaml

REPO_ROOT = Path(__file__).resolve().parents[1]
MARKET_PATH = REPO_ROOT / ".claude-plugin" / "marketplace.json"
SITE_WEB = REPO_ROOT / "site" / "web"
PUBLIC_DIR = SITE_WEB / "public"
DEFAULT_BRANCH = "main"
FRONTMATTER = re.compile(r"^---\n(.*?)\n---", re.DOTALL)


def _parse_frontmatter(skill_md: Path) -> dict:
    text = skill_md.read_text(encoding="utf-8")
    m = FRONTMATTER.match(text)
    if not m:
        raise ValueError(f"no frontmatter: {skill_md}")
    data = yaml.safe_load(m.group(1))
    if not isinstance(data, dict):
        raise ValueError(f"bad frontmatter: {skill_md}")
    return data


def _collect_skills(manifest: dict, repo: str, branch: str) -> list[dict]:
    base_tree = f"https://github.com/{repo}/tree/{branch}"
    base_raw = f"https://github.com/{repo}/raw/{branch}"
    out: list[dict] = []
    for plugin in manifest.get("plugins", []):
        if not isinstance(plugin, dict):
            continue
        for rel in plugin.get("skills") or []:
            if not isinstance(rel, str) or not rel.strip():
                continue
            rid = rel.removeprefix("./")
            skill_dir = REPO_ROOT / rid
            smd = skill_dir / "SKILL.md"
            fm = _parse_frontmatter(smd)
            name = str(fm.get("name", skill_dir.name))
            folder_name = skill_dir.name
            desc = str(fm.get("description", "")).strip()
            bundle = skill_dir.parent / f"{folder_name}.skill"
            bundle_url = (
                f"{base_raw}/{bundle.relative_to(REPO_ROOT).as_posix()}"
                if bundle.is_file()
                else ""
            )
            copy_cmd = f"cp -R plugins/{folder_name} ~/.claude/skills/{folder_name}"
            search_blob = f"{name} {desc} {rid} {folder_name}".lower()
            out.append(
                {
                    "id": name,
                    "folder": folder_name,
                    "path": rid,
                    "description": desc,
                    "folderUrl": f"{base_tree}/{rid}",
                    "bundleUrl": bundle_url,
                    "copyCommand": copy_cmd,
                    "search": search_blob,
                }
            )
    return out


def build_site_payload(
    manifest: dict, *, repo: str, branch: str, generated_at: str
) -> tuple[dict, dict]:
    """Return (catalog_json, manifest_public_json) for the React app and automation."""
    meta = manifest.get("metadata") if isinstance(manifest.get("metadata"), dict) else {}
    market_title = str(manifest.get("name", "marketplace"))
    meta_desc = str(meta.get("description", "Claude Code skill marketplace."))
    version = str(meta.get("version", "")) or None
    skills = _collect_skills(manifest, repo=repo, branch=branch)
    clone_url = f"https://github.com/{repo}.git"
    repo_name = repo.split("/")[-1] if "/" in repo else repo

    plugins_out: list[dict] = []
    marketplace_plugin_name = ""
    for p in manifest.get("plugins", []):
        if not isinstance(p, dict):
            continue
        pname = str(p.get("name", ""))
        if not marketplace_plugin_name and pname:
            marketplace_plugin_name = pname
        pdesc = str(p.get("description", ""))
        nskills = len([x for x in (p.get("skills") or []) if isinstance(x, str)])
        plugins_out.append(
            {"name": pname, "description": pdesc, "skillCount": nskills}
        )

    catalog = {
        "marketTitle": market_title,
        "metaDescription": meta_desc,
        "version": version,
        "generatedAt": generated_at,
        "repository": repo,
        "sourceBranch": branch,
        "cloneUrl": clone_url,
        "repoName": repo_name,
        "marketplacePluginName": marketplace_plugin_name or "linglong-skills",
        "plugins": plugins_out,
        "skills": skills,
    }

    manifest_public = {
        "name": market_title,
        "version": version,
        "description": meta_desc,
        "repository": repo,
        "sourceBranch": branch,
        "generatedAt": generated_at,
        "skills": [
            {
                "name": x["id"],
                "path": x["path"],
                "description": x["description"],
                "folderUrl": x["folderUrl"],
                "bundleUrl": x["bundleUrl"] or None,
                "copyCommand": x["copyCommand"],
            }
            for x in skills
        ],
    }
    return catalog, manifest_public


def write_public_assets(catalog: dict, manifest_public: dict) -> None:
    PUBLIC_DIR.mkdir(parents=True, exist_ok=True)
    (PUBLIC_DIR / "catalog.json").write_text(
        json.dumps(catalog, indent=2, ensure_ascii=False) + "\n",
        encoding="utf-8",
    )
    (PUBLIC_DIR / "manifest.json").write_text(
        json.dumps(manifest_public, indent=2, ensure_ascii=False) + "\n",
        encoding="utf-8",
    )


def build_site(out_dir: Path, *, repo: str, branch: str) -> None:
    manifest = json.loads(MARKET_PATH.read_text(encoding="utf-8"))
    generated_at = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
    catalog, manifest_public = build_site_payload(
        manifest, repo=repo, branch=branch, generated_at=generated_at
    )
    write_public_assets(catalog, manifest_public)

    if not SITE_WEB.is_dir():
        raise FileNotFoundError(f"missing Vite app directory: {SITE_WEB}")

    env = os.environ.copy()
    env["LINGLONG_SITE_OUT"] = str(out_dir.resolve())

    if not (SITE_WEB / "node_modules").is_dir():
        subprocess.run(
            ["npm", "ci", "--prefix", str(SITE_WEB)],
            cwd=str(REPO_ROOT),
            check=True,
        )

    subprocess.run(
        ["npm", "run", "build", "--prefix", str(SITE_WEB)],
        cwd=str(REPO_ROOT),
        env=env,
        check=True,
    )

    out_dir.mkdir(parents=True, exist_ok=True)
    (out_dir / ".nojekyll").write_text("", encoding="utf-8")


def export_public_only(*, repo: str, branch: str) -> None:
    """Write catalog.json + manifest.json under site/web/public (for local Vite dev)."""
    manifest = json.loads(MARKET_PATH.read_text(encoding="utf-8"))
    generated_at = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
    catalog, manifest_public = build_site_payload(
        manifest, repo=repo, branch=branch, generated_at=generated_at
    )
    write_public_assets(catalog, manifest_public)


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Build Linglong GitHub Pages site (React + Vite)."
    )
    parser.add_argument(
        "--out",
        type=Path,
        default=REPO_ROOT / "_site",
        help="Output directory (default: _site)",
    )
    parser.add_argument(
        "--repo",
        default=os.environ.get("GITHUB_REPOSITORY", "OWNER/linglong-marketplace"),
        help="owner/repo for GitHub links",
    )
    parser.add_argument(
        "--branch",
        default=os.environ.get("GITHUB_REF_NAME", DEFAULT_BRANCH),
        help="branch name for tree/raw links",
    )
    parser.add_argument(
        "--export-public-only",
        action="store_true",
        help="Only write site/web/public/catalog.json and manifest.json (skip npm build).",
    )
    args = parser.parse_args()
    try:
        if args.export_public_only:
            export_public_only(repo=args.repo, branch=args.branch)
            print(f"Wrote public assets to {PUBLIC_DIR.resolve()}")
            return 0
        build_site(args.out, repo=args.repo, branch=args.branch)
    except (OSError, ValueError, json.JSONDecodeError, yaml.YAMLError) as exc:
        print(f"build_site failed: {exc}", file=sys.stderr)
        return 1
    except subprocess.CalledProcessError as exc:
        print(f"build_site failed (npm): {exc}", file=sys.stderr)
        return 1
    print(f"Wrote site to {args.out.resolve()}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
