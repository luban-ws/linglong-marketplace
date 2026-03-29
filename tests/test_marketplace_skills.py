"""
Validate marketplace plugin SKILL.md frontmatter (shared rules with validate_marketplace).
"""

from __future__ import annotations

import sys
import unittest
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[1]
if str(REPO_ROOT) not in sys.path:
    sys.path.insert(0, str(REPO_ROOT))

from scripts.skill_rules import FRONTMATTER_PATTERN, parse_frontmatter  # noqa: E402
from scripts.skill_rules import validate_skill_frontmatter  # noqa: E402

PLUGINS_DIR = REPO_ROOT / "plugins"
SKILL_GLOB = "**/SKILL.md"


class TestMarketplaceSkills(unittest.TestCase):
    """Ensure each plugin SKILL.md remains packager-friendly."""

    def test_all_skills_have_valid_frontmatter(self) -> None:
        skill_files = sorted(PLUGINS_DIR.glob(SKILL_GLOB))
        self.assertTrue(skill_files, "expected at least one plugins/**/SKILL.md")

        for path in skill_files:
            with self.subTest(skill=path.relative_to(REPO_ROOT)):
                rel = str(path.relative_to(REPO_ROOT))
                errs = validate_skill_frontmatter(path, rel_display=rel)
                self.assertEqual(errs, [], errs)

    def test_parse_frontmatter_roundtrip(self) -> None:
        """Guardrail: frontmatter regex still parses sample file."""
        sample = next(iter(sorted(PLUGINS_DIR.glob(SKILL_GLOB))))
        text = sample.read_text(encoding="utf-8")
        self.assertIsNotNone(FRONTMATTER_PATTERN.match(text))
        fm = parse_frontmatter(sample)
        self.assertIn("name", fm)


if __name__ == "__main__":
    unittest.main()
