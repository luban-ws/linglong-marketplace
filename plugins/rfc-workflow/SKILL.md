---
name: rfc-workflow
description: Use this skill whenever work ties to RFC-style specs—implementing from a numbered RFC file path, drafting NNN-feature-name.md proposals, phased rollout from a spec, or casual phrases like according to RFC or implement the RFC. Use for review-only passes on technical specs where repository edits must wait for explicit approval. Prefer this over jumping straight to code when requirements live in RFC documents so analysis, numbered plan options, and user-confirmed execution stay ordered. Also use when the user mentions RFC, technical specification document, approval-gated implementation, or wants a new RFC before coding starts.
---

# RFC workflow

RFC-driven work needs explicit human checkpoints: the cost of a wrong assumption is high, and specs often omit edge cases. This skill keeps the sequence **analyze → choose scope → plan → execute** visible so the user can steer before irreversible edits.

## Core principle

Do not treat silence as approval. RFC-related edits wait for explicit choices (numbered options or clear yes on a stated plan). That reduces surprise and keeps blameless rollback possible.

## Workflow (phases)

### Phase 1 — RFC analysis

When the user references an RFC file or RFC id:

1. Read the RFC end-to-end.
2. Extract Summary, Goals, Proposed Solution, Implementation Details, dependencies on other RFCs or modules.
3. Present structured analysis using the template in [references/workflow-templates.md](references/workflow-templates.md) (Phase 1 block).

### Phase 2 — implementation planning

After analysis, show implementation options using the Phase 2 template in [references/workflow-templates.md](references/workflow-templates.md). Stop until the user picks an option (1–4).

### Phase 3 — detailed planning

For options 1–3 (any path that changes code), produce a file-level plan with the Phase 3 template in [references/workflow-templates.md](references/workflow-templates.md). Stop until the user confirms proceeding (the template ends with yes or no).

### Phase 4 — controlled execution

After an explicit yes:

1. Work in one logical unit at a time.
2. Surface meaningful diffs or edits before applying them so the user can object early.
3. Track completed steps against the plan for easy rollback discussion.

### Decision menus during execution

When the user needs to steer mid-flight, reuse the Phase 4 menu in [references/workflow-templates.md](references/workflow-templates.md).

## RFC document map

| Section | Why it matters |
|--------|----------------|
| Summary | Anchor for scope |
| Context or Problem | Constraints and motivation |
| Goals | Acceptance lens |
| Proposed Solution | Architecture choices |
| Implementation Details | File and module touch points |
| Alternatives Considered | Rejected paths—avoid re-debate |
| Risks and Concerns | Test and rollout emphasis |
| Testing Strategy | Verification expectations |

## Creating new RFCs

1. Ask clarifying questions until goals and non-goals are crisp.
2. Mirror structure from an existing RFC in the repo when one exists.
3. Draft using naming `NNN-feature-name.md` with zero-padded NNN consistent with the repo.
4. Present the draft for review before writing it to the tree unless the user already asked you to save it.

## Safety habits (and why)

- Show substantive edits before applying them so the user can catch mismatches with the spec.
- Ask at branch points instead of guessing—RFCs are often ambiguous on ordering and migrations.
- Keep a short mental changelog of touched files so rollback discussion stays concrete.
- If interpretation is unclear, pause with questions rather than picking the most convenient reading.
