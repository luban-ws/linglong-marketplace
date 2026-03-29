---
name: rfc-management
description: Use this skill whenever you create or maintain RFC-style proposals together with a project roadmap and a granular task log—adding numbered RFC files under a docs/rfc tree, syncing tables in ROADMAP.md or equivalent, mirroring tasks into TASK_TRACKING.md or team backlog files, advancing status Draft or Under Review or Approved, or archiving completed and rejected RFCs into completed and rejected subfolders. Prefer this over ad-hoc notes when the user mentions RFC numbering, roadmap milestones, task boards linked to specs, or keeping implementation and documentation aligned. If folder names differ from examples, discover the repo’s documented conventions first, then map paths.
---

# RFC and task management

Structured delivery stays legible when **RFCs** (or similarly named design docs), a **roadmap** narrative, and an **operational task list** stay in sync. This skill describes a common pattern; your repository may rename files—**always confirm** `README`, `CONTRIBUTING`, or `docs/` index first.

## Discover repo conventions (do this first)

1. Search for an RFC index, authoring guide, or `docs/rfc/README` (or `design/`, `rfc/` elsewhere).
2. Note the **numbering rule** (zero-padded digits, date-based slugs, ADR ids, etc.) and **required sections**.
3. Identify the canonical **roadmap** file (`ROADMAP.md`, `docs/roadmap.md`, project board export, …) and **task** file (`TASK_TRACKING.md`, `TODO.md`, issue templates).
4. If nothing is documented, propose a minimal layout and ask the user before inventing many new paths.

## RFC lifecycle (generic)

Treat one RFC as **one concern**—avoid mega-documents that bundle unrelated bets.

1. **Authoring**
   - Follow the project’s policy doc or team template.
   - Create `NNNN-short-slug.md` (or the repo’s pattern) in the RFC directory using the **next free** id.
   - Register the RFC in the roadmap artifact (table, milestone list, or link section) the same change set when that is the team norm.
   - Typical sections teams expect (adjust to local template):
     - **Summary**
     - **Motivation** or **Problem**
     - **Proposal** / **Technical design** (architecture, dependencies, rollout, risks)
     - **Tasks** or **Work breakdown** (items you can mirror into the task tracker)
     - **Status** (Draft | Under Review | Approved | Superseded — use the enum the project defines)

2. **Keeping tracking aligned**
   - Active RFCs should have visible rows in the roadmap **and** actionable lines in the task tracker when the team uses both.
   - When RFC status changes, update dependent docs in the same session so nobody reads stale **Approved** in one file and **Draft** in another.

3. **Completion**
   - Verify against acceptance criteria recorded in the RFC or linked issues.
   - Move or rename the file into an **archive** location (`docs/rfc/completed/`, `archive/rfc/`, …) per house rules.
   - Close or mark tasks **Done**, and collapse roadmap sections that finished so upcoming work stays obvious.

4. **Rejection or supersession**
   - Move to the project’s **rejected** or **superseded** area; note which newer RFC replaced it.
   - Cancel or strike tracker rows; leave a one-line reason so future readers understand the call.

## Roadmap habits

The roadmap answers **when** and **why** clusters of work ship. Group RFCs into phases or themes; refresh it when approvals land, scope cuts happen, or a phase completes.

## Task tracker habits

The tracker answers **who is doing what now**. Common columns or tags:

- **To do** — queued, unblocked.
- **In progress** — limit concurrency; some teams tag a single **`(CURRENT)`** focus.
- **Done** — link PRs, commits, or tickets for auditability.

## Working principle

Before expanding feature scope or renaming public APIs, confirm the RFC–roadmap–tracker triangle reflects the same story so downstream engineers and reviewers share one source of truth.
