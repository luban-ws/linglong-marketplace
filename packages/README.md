# @linglongjs packages

`packages/` holds **CLI tools and libraries** for building Claude Code marketplaces — not plugin content (that lives in `plugins/`).

| Package | CLI | Purpose |
|---------|-----|---------|
| [`@linglongjs/skill-validator`](./skill-validator) | `ll-skills` | Validate `SKILL.md` + `marketplace.json` layout |
| [`@linglongjs/marketplace-build`](./marketplace) | `ll-catalog` | Export `catalog.json` / `manifest.json` for a browse site |

From the repo root:

```bash
pnpm skills      # ll-skills — validate this marketplace
pnpm catalog     # ll-catalog — write apps/site/public/catalog.json
pnpm check       # validate + test all packages
```

Publishable on npm: `@linglongjs/skill-validator` (and eventually `marketplace-build`).
