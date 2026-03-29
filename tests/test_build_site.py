"""Site builder smoke test (Python data + Vite React bundle)."""

from __future__ import annotations

import json
import sys
import tempfile
import unittest
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[1]
if str(REPO_ROOT) not in sys.path:
    sys.path.insert(0, str(REPO_ROOT))

from scripts.build_site import build_site  # noqa: E402


class TestBuildSite(unittest.TestCase):
    def test_build_produces_full_site(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            out = Path(tmp) / "out"
            build_site(out, repo="acme/demo", branch="main")
            index = out / "index.html"
            self.assertTrue(index.is_file())
            html_text = index.read_text(encoding="utf-8")
            self.assertIn('id="root"', html_text)
            self.assertIn('type="module"', html_text)

            cat_path = out / "catalog.json"
            self.assertTrue(cat_path.is_file())
            catalog = json.loads(cat_path.read_text(encoding="utf-8"))
            skill_paths = [s.get("path", "") for s in catalog.get("skills") or []]
            self.assertTrue(
                any("macos-swiftpm-cli-app" in p for p in skill_paths),
                msg="expected macos-swiftpm-cli-app skill path in catalog.json",
            )

            js_assets = list(out.glob("assets/*.js"))
            css_assets = list(out.glob("assets/*.css"))
            self.assertTrue(js_assets, msg="Vite should emit hashed JS under assets/")
            self.assertTrue(css_assets, msg="Vite should emit hashed CSS under assets/")

            self.assertTrue((out / ".nojekyll").is_file())
            mf = out / "manifest.json"
            self.assertTrue(mf.is_file())
            data = json.loads(mf.read_text(encoding="utf-8"))
            self.assertEqual(data.get("repository"), "acme/demo")
            self.assertGreaterEqual(len(data.get("skills") or []), 1)


if __name__ == "__main__":
    unittest.main()
