#!/usr/bin/env python3
"""
Build a full static GitHub Pages site: catalog, install flows, search, copy helpers.
Emits index.html, styles.css, site.js, manifest.json, .nojekyll
"""

from __future__ import annotations

import argparse
import html
import json
import os
import re
import shutil
import sys
from datetime import datetime, timezone
from pathlib import Path

import yaml

REPO_ROOT = Path(__file__).resolve().parents[1]
MARKET_PATH = REPO_ROOT / ".claude-plugin" / "marketplace.json"
ASSETS_DIR = REPO_ROOT / "site" / "assets"
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


def W(s: str) -> str:
    return html.escape(s, quote=True)


def _collect_skills(manifest: dict, repo: str, branch: str) -> list[dict]:
    base_tree = f"https://github.com/{repo}/tree/{branch}"
    base_raw = f"https://github.com/{repo}/raw/{branch}"
    clone_url = f"https://github.com/{repo}.git"
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
            copy_cmd = (
                f"cp -R plugins/{folder_name} ~/.claude/skills/{folder_name}"
            )
            search_blob = f"{name} {desc} {rid} {folder_name}".lower()
            out.append(
                {
                    "id": name,
                    "folder": folder_name,
                    "path": rid,
                    "description": desc,
                    "folder_url": f"{base_tree}/{rid}",
                    "bundle_url": bundle_url,
                    "copy_command": copy_cmd,
                    "search": search_blob,
                }
            )
    return out


def _plugins_rows(plugins_summary: list[tuple[str, str, int]]) -> str:
    rows = []
    for pname, pdesc, count in plugins_summary:
        rows.append(
            "<tr><td><code>{}</code></td><td>{}</td><td>{}</td></tr>".format(
                W(pname), W(pdesc), str(count)
            )
        )
    return "\n".join(rows)


def build_site(out_dir: Path, *, repo: str, branch: str) -> None:
    manifest = json.loads(MARKET_PATH.read_text(encoding="utf-8"))
    meta = manifest.get("metadata") if isinstance(manifest.get("metadata"), dict) else {}
    market_title = str(manifest.get("name", "marketplace"))
    meta_desc = str(
        meta.get("description", "Claude Code skill marketplace.")
    )
    version = str(meta.get("version", ""))
    skills = _collect_skills(manifest, repo=repo, branch=branch)
    generated_at = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")

    plugins_summary: list[tuple[str, str, int]] = []
    for p in manifest.get("plugins", []):
        if not isinstance(p, dict):
            continue
        pname = str(p.get("name", ""))
        pdesc = str(p.get("description", ""))
        nskills = len([x for x in (p.get("skills") or []) if isinstance(x, str)])
        plugins_summary.append((pname, pdesc, nskills))

    # --- skill cards HTML
    cards_html: list[str] = []
    copy_blocks: list[str] = []
    for s in skills:
        bundle_btn = ""
        if s["bundle_url"]:
            bundle_btn = (
                f'<a href="{W(s["bundle_url"])}">Raw .skill</a> '
                f'<button type="button" class="btn" data-copy="{W(s["bundle_url"])}">'
                f"Copy URL</button>"
            )
        copy_blocks.append(
            f'<div class="panel"><h3><code>{W(s["id"])}</code> '
            f'<span class="path-hint">({W(s["path"])})</span></h3>'
            f'<pre class="code-block" id="copy-cmd-{W(s["folder"])}">{W(s["copy_command"])}</pre>'
            f'<div class="copy-row">'
            f'<button type="button" class="btn" data-copy="{W(s["copy_command"])}">'
            f"Copy command</button></div></div>"
        )
        cards_html.append(
            f'<article class="card" id="skill-{W(s["id"])}" data-skill-card '
            f'data-search="{W(s["search"])}" aria-hidden="false">'
            f"<h3>{W(s['id'])}</h3>"
            f'<p class="path-hint">{W(s["path"])}</p>'
            f'<p class="desc">{W(s["description"])}</p>'
            f'<div class="links">'
            f'<a href="{W(s["folder_url"])}" target="_blank" rel="noopener">Source</a>'
            f"{bundle_btn}</div></article>"
        )

    clone_url = f"https://github.com/{repo}.git"
    repo_name = repo.split("/")[-1] if "/" in repo else repo

    manifest_public = {
        "name": market_title,
        "version": version or None,
        "description": meta_desc,
        "repository": repo,
        "sourceBranch": branch,
        "generatedAt": generated_at,
        "skills": [
            {
                "name": x["id"],
                "path": x["path"],
                "description": x["description"],
                "folderUrl": x["folder_url"],
                "bundleUrl": x["bundle_url"] or None,
                "copyCommand": x["copy_command"],
            }
            for x in skills
        ],
    }

    plugins_tbody = _plugins_rows(plugins_summary)

    clone_block = f"git clone {clone_url}\ncd {repo_name}"
    clone_one_liner = f"git clone {clone_url} && cd {repo_name}"
    copy_blocks_html = "".join(copy_blocks)
    bundle_items = "".join(
        f'<li><a href="{W(s["bundle_url"])}"><code>{W(s["folder"])}.skill</code></a></li>'
        for s in skills
        if s["bundle_url"]
    )
    if not bundle_items:
        bundle_items = '<li class="note" style="list-style:none;margin-left:0">No .skill archives found in this build.</li>'

    tab_panels = f"""
    <div role="tabpanel" id="panel-marketplace" class="tabpanel is-active">
      <p class="note">Point Claude Code at this GitHub repository as a <strong>marketplace</strong>, then install plugin <code>linglong-skills</code> (or the name in your manifest).</p>
      <ul style="color:var(--text-muted);margin:0.5rem 0 0 1rem;font-size:0.9rem">
        <li>Add marketplace source: <code>{W(repo)}</code></li>
        <li>Use manifest path: <code>.claude-plugin/marketplace.json</code></li>
      </ul>
    </div>
    <div role="tabpanel" id="panel-clone" class="tabpanel" hidden>
      <p class="note">Clone the repository, then register this folder as a Claude Code marketplace or copy skill directories.</p>
      <pre class="code-block">{W(clone_block)}</pre>
      <div class="copy-row">
        <button type="button" class="btn" data-copy="{W(clone_url)}">Copy HTTPS clone URL</button>
        <button type="button" class="btn" data-copy="{W(clone_one_liner)}">Copy one-liner</button>
      </div>
      <p class="note" style="margin-top:1rem">Docs: <a href="https://code.claude.com/docs/en/plugins">Claude Code plugins</a></p>
    </div>
    <div role="tabpanel" id="panel-copy" class="tabpanel" hidden>
      <p class="note">From the repo root, copy one skill into your global Claude skills folder (folder name may differ from <code>name:</code> in SKILL.md).</p>
      {copy_blocks_html}
    </div>
    <div role="tabpanel" id="panel-bundles" class="tabpanel" hidden>
      <p class="note">Pre-built <code>.skill</code> archives (zip) live under <code>plugins/</code>. Download raw files if your client supports skill bundles.</p>
      <ul style="color:var(--text-muted);margin:0;padding-left:1.1rem">
        {bundle_items}
      </ul>
    </div>
    """

    tablist = """
    <ul class="tablist" role="tablist" aria-label="Install methods">
      <li role="presentation">
        <button type="button" role="tab" id="tab-marketplace" aria-controls="panel-marketplace"
          aria-selected="true" tabindex="0">Marketplace</button>
      </li>
      <li role="presentation">
        <button type="button" role="tab" id="tab-clone" aria-controls="panel-clone"
          aria-selected="false" tabindex="-1">Clone</button>
      </li>
      <li role="presentation">
        <button type="button" role="tab" id="tab-copy" aria-controls="panel-copy"
          aria-selected="false" tabindex="-1">~/.claude/skills</button>
      </li>
      <li role="presentation">
        <button type="button" role="tab" id="tab-bundles" aria-controls="panel-bundles"
          aria-selected="false" tabindex="-1">.skill files</button>
      </li>
    </ul>
    """

    html_doc = f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>{W(market_title)} · Linglong</title>
  <meta name="description" content="{W(meta_desc)}" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600&family=Noto+Sans+SC:wght@400;600&family=Plus+Jakarta+Sans:wght@400;600;700&display=swap" rel="stylesheet" />
  <link rel="stylesheet" href="styles.css" />
</head>
<body>
  <div id="aria-live-polite" class="sr-only" role="status" aria-live="polite" aria-atomic="true"></div>
  <a class="skip-link" href="#skills">Skip to catalog</a>
  <div class="layout">
    <aside id="rail" aria-label="Section navigation">
      <p class="rail-title">Linglong</p>
      <nav>
        <a href="#overview">Overview</a>
        <a href="#install">Install</a>
        <a href="#plugins">Plugins</a>
        <a href="#skills">Catalog</a>
        <a href="#quality">Validate</a>
        <a href="https://github.com/{W(repo)}" target="_blank" rel="noopener">GitHub</a>
      </nav>
    </aside>
    <div class="main-col">
      <div class="topbar">
        <span class="topbar-title">Linglong</span>
        <button type="button" class="nav-toggle" data-nav-toggle aria-expanded="false" aria-controls="rail">Menu</button>
      </div>
      <header class="site">
        <div class="wrap">
          <div class="brand">
            <h1>{W(market_title)}</h1>
            <span class="tag">玲珑 · Claude Code</span>
          </div>
          <p class="lede">{W(meta_desc)}</p>
          <div class="meta-bar">
            <span>Repo <code>{W(repo)}</code></span>
            <span>Links target branch <code>{W(branch)}</code></span>
            <span>Built <code>{W(generated_at)}</code></span>
            {f'<span>Manifest <code>v{W(version)}</code></span>' if version else ""}
          </div>
        </div>
      </header>
      <main class="page-main">
        <div class="wrap">
          <section id="overview" aria-labelledby="ov-h">
            <h2 id="ov-h">Overview</h2>
            <div class="panel">
              <p class="note" style="margin:0">This page lists every skill shipped in the marketplace manifest, with installation paths and quick copy helpers. Data is generated from <code>.claude-plugin/marketplace.json</code> and each plugin <code>SKILL.md</code>.</p>
              <p class="note">Download machine-readable <a href="manifest.json">manifest.json</a> for automation.</p>
            </div>
          </section>
          <section id="install" aria-labelledby="in-h">
            <h2 id="in-h">Install</h2>
            <div class="install-tabs" data-install-tabs>
              {tablist}
              {tab_panels}
            </div>
          </section>
          <section id="plugins" aria-labelledby="pl-h">
            <h2 id="pl-h">Plugins</h2>
            <div class="data-table-wrap">
              <table class="data-table">
                <thead>
                  <tr><th>Plugin</th><th>Description</th><th>Skills</th></tr>
                </thead>
                <tbody>
                  {plugins_tbody}
                </tbody>
              </table>
            </div>
          </section>
          <section id="skills" aria-labelledby="sk-h">
            <h2 id="sk-h">Skill catalog</h2>
            <div class="skill-toolbar">
              <label for="skill-filter">Filter</label>
              <input type="search" id="skill-filter" name="q" placeholder="Search name, path, description…" autocomplete="off" />
            </div>
            <div class="skill-grid">
              {"".join(cards_html)}
            </div>
          </section>
          <section id="quality" aria-labelledby="qa-h">
            <h2 id="qa-h">Validate locally</h2>
            <div class="panel">
              <p class="note">Contributors: run the same checks as Husky before pushing.</p>
              <pre class="code-block">pip install -r requirements-dev.txt
npm install
npm run check</pre>
              <div class="copy-row">
                <button type="button" class="btn" data-copy="npm run check">Copy</button>
              </div>
            </div>
          </section>
        </div>
      </main>
      <footer class="site">
        <div class="wrap">
          <p><a href="https://github.com/{W(repo)}">{W(repo)}</a> · branch <code>{W(branch)}</code> · <a href="#overview">top</a></p>
        </div>
      </footer>
    </div>
  </div>
  <script src="site.js" defer></script>
</body>
</html>"""

    out_dir.mkdir(parents=True, exist_ok=True)
    (out_dir / "index.html").write_text(html_doc, encoding="utf-8")
    for name in ("linglong.css", "site.js"):
        src = ASSETS_DIR / name
        if not src.is_file():
            raise FileNotFoundError(f"missing asset: {src}")
        dest_name = "styles.css" if name == "linglong.css" else "site.js"
        shutil.copy(src, out_dir / dest_name)
    (out_dir / "manifest.json").write_text(
        json.dumps(manifest_public, indent=2, ensure_ascii=False) + "\n",
        encoding="utf-8",
    )
    (out_dir / ".nojekyll").write_text("", encoding="utf-8")


def main() -> int:
    parser = argparse.ArgumentParser(description="Build Linglong GitHub Pages site.")
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
    args = parser.parse_args()
    try:
        build_site(args.out, repo=args.repo, branch=args.branch)
    except (OSError, ValueError, json.JSONDecodeError, yaml.YAMLError) as exc:
        print(f"build_site failed: {exc}", file=sys.stderr)
        return 1
    print(f"Wrote site to {args.out.resolve()}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
