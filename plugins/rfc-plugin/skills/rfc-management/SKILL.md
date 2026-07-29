---
name: rfc-management
description: Manage RFC files, .spec/ROADMAP.md, and .spec/TASK_TRACKING.md—create numbered RFCs under .spec/rfc/, update status, archive completed work, and keep exactly three sources in sync (no README indexes under .spec/). Use when adding RFCs, changing RFC status, syncing roadmap phases, updating task boards, or archiving to completed/rejected. For implementing an approved RFC in code, pair with rfc-workflow. Default paths for linglong-marketplace; discover alternate paths only in other repos.
---

# RFC management

Manage **where RFC metadata lives** and **how files stay in sync**. Implementation checkpoints live in **rfc-workflow**; this skill owns the **document tree**.

## When to use which skill

| User intent | Skill |
|-------------|-------|
| New RFC, status change, ROADMAP row, TASK_TRACKING rows, archive | **rfc-management** (this skill) |
| Read RFC, plan code, get approval, then implement | **rfc-workflow** |
| Both (e.g. “add RFC 0004 and implement it”) | rfc-management first → rfc-workflow after **Approved** |

## Three files only — never duplicate

**linglong-marketplace (default):**

```
.spec/ROADMAP.md        → index, phases, status, conventions (THE index)
.spec/TASK_TRACKING.md  → all tasks and done items (THE tracker)
.spec/rfc/NNNN-slug.md  → proposal text only (THE spec body)
```

| Put it here | Never put it here |
|-------------|-------------------|
| RFC id, title, status, phase | `rfc/README.md`, `.spec/README.md`, root README |
| Checklists, in-progress, done | Inside RFC markdown files |
| Summary, motivation, design | ROADMAP tables (except one index row) |

No `.spec/README.md` or `.spec/rfc/README.md`. Archives: `.spec/rfc/completed/`, `.spec/rfc/rejected/`.

Other repos may use `docs/rfc/`, `design/` — discover paths; same **three-role** split (ROADMAP + TASK_TRACKING + `rfc/`).

## Discover paths (always first)

1. **Default:** `.spec/ROADMAP.md`, `.spec/TASK_TRACKING.md`, `.spec/rfc/`.
2. If missing, search for `ROADMAP.md` / `TASK_TRACKING.md` with the same directory prefix.
3. Read `.spec/ROADMAP.md` **RFC conventions** + one existing RFC for section shape.
4. Confirm next id = highest id in ROADMAP index + 1.

If ROADMAP is missing conventions, propose: `NNNN-kebab-slug.md`, status enum below, tasks only in `.spec/TASK_TRACKING.md`.

## Status enum

Use the **same label** in ROADMAP index, RFC header, and phase notes:

`Draft` → `Under Review` → `Approved` → `Implemented`  
Also: `Rejected`, `Superseded`

| Status | Meaning | RFC file location |
|--------|---------|-------------------|
| Draft | WIP spec | `.spec/rfc/NNNN-slug.md` |
| Under Review | Ready for feedback | `.spec/rfc/NNNN-slug.md` |
| Approved | Accepted; may implement | `.spec/rfc/NNNN-slug.md` |
| Implemented | Shipped | move to `.spec/rfc/completed/` |
| Rejected | Won't do | move to `.spec/rfc/rejected/` |
| Superseded | Replaced | move to `.spec/rfc/rejected/` or `completed/`; link new id in `.spec/ROADMAP.md` |

## Playbook A — Create a new RFC

Do **all steps in one change set** unless the user asked for draft-only review.

1. **`.spec/ROADMAP.md`** — pick next `NNNN`; add index row (id, linked title, `Draft`).
2. **RFC file** — create `.spec/rfc/NNNN-short-slug.md` with header `**Status:** Draft` and sections:
   - Summary
   - Motivation
   - Proposal
   - Implementation notes
   - Alternatives considered (optional)
3. **`.spec/TASK_TRACKING.md`** — add `- [ ] … (RFC NNNN)` lines for concrete work; **no** task lists inside the RFC.
4. **`.spec/ROADMAP.md`** — if new phase needed, add phase section referencing `NNNN`.

**Do not:** create README indexes, duplicate the index table in the RFC, or add tasks only in the RFC body.

## Playbook B — Advance status

| To status | Update in same session |
|-----------|------------------------|
| Under Review | `.spec/ROADMAP.md` row + RFC header |
| Approved | `.spec/ROADMAP.md` row + RFC header; ensure `.spec/TASK_TRACKING.md` has implementation tasks |
| Implemented | `.spec/ROADMAP.md` row + move file to `.spec/rfc/completed/` + mark TASK_TRACKING items done + note phase in ROADMAP |

Never leave ROADMAP saying `Approved` while the RFC header says `Draft`.

## Playbook C — Complete (Implemented)

1. Verify acceptance against RFC proposal (and `.spec/TASK_TRACKING.md`).
   - **Umbrella RFCs**: For large design specs serving as an umbrella, the completion/closure criterion is that **all sub-RFCs covering the detailed work breakdown have been successfully opened and tracking has begun**. The umbrella RFC itself is moved to completed/archive at this point, without waiting for the physical coding of the sub-RFCs to finish.
2. `git mv` RFC → `.spec/rfc/completed/NNNN-slug.md` (or repo’s archive path).
3. `.spec/ROADMAP.md`: set status `Implemented`; keep index row or move to a “completed” subsection per house style.
4. `.spec/TASK_TRACKING.md`: check off all related items; add PR/commit links if the team does that.
5. `.spec/ROADMAP.md`: mark phase done or shrink “next” section so upcoming work is obvious.

## Playbook D — Reject or supersede

1. `.spec/ROADMAP.md`: status `Rejected` or `Superseded`; if superseded, note replacement RFC id.
2. Move file to `.spec/rfc/rejected/` (or archive path).
3. `.spec/TASK_TRACKING.md`: cancel open items with one-line reason; do not delete history.
4. Do not leave orphaned tasks pointing at a rejected RFC without explanation.

## Playbook E — User asks to implement an RFC

1. Confirm RFC status is **Approved** (or user explicitly waives review).
2. Switch to **rfc-workflow** for analysis → options → plan → execution.
3. After merge: run **Playbook C** (Implemented) in the same PR or immediate follow-up.

## Pre-commit checklist (RFC changes)

- [ ] `.spec/ROADMAP.md` index matches every active RFC file under `.spec/rfc/`
- [ ] No task checklists inside RFC bodies
- [ ] No new README under `.spec/` or `rfc/` for indexing
- [ ] RFC header status matches ROADMAP row
- [ ] `.spec/TASK_TRACKING.md` updated for new or finished work
- [ ] Archived RFCs not left in active `.spec/rfc/` root

## Working principle

**`.spec/ROADMAP.md`** = what and when. **`.spec/TASK_TRACKING.md`** = who does what now. **`.spec/rfc/*.md`** = why and how. One story across three places.
