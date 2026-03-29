"""Integration test: marketplace.json and skill registration."""

from __future__ import annotations

import sys
import unittest
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[1]
if str(REPO_ROOT) not in sys.path:
    sys.path.insert(0, str(REPO_ROOT))

from scripts.validate_marketplace import collect_errors  # noqa: E402


class TestMarketplaceManifest(unittest.TestCase):
    def test_marketplace_has_no_validation_errors(self) -> None:
        errors = collect_errors(REPO_ROOT)
        self.assertEqual(
            errors,
            [],
            "marketplace validation errors:\n" + "\n".join(errors),
        )


if __name__ == "__main__":
    unittest.main()
