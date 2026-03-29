"""Site builder smoke test."""

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
            self.assertIn("Skill catalog", html_text)
            self.assertIn("manifest.json", html_text)
            self.assertIn("macos-swiftpm-cli-app", html_text)
            self.assertIn('id="skill-filter"', html_text)
            self.assertIn("site.js", html_text)
            self.assertTrue((out / "styles.css").is_file())
            self.assertTrue((out / "site.js").is_file())
            self.assertTrue((out / ".nojekyll").is_file())
            mf = out / "manifest.json"
            self.assertTrue(mf.is_file())
            data = json.loads(mf.read_text(encoding="utf-8"))
            self.assertEqual(data.get("repository"), "acme/demo")
            self.assertGreaterEqual(len(data.get("skills") or []), 1)


if __name__ == "__main__":
    unittest.main()
