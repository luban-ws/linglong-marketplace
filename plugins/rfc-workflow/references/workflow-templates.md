# RFC workflow — copy-paste templates

Use these blocks verbatim when presenting phases to the user so formatting stays consistent.

## Phase 1 — RFC analysis output

```markdown
## RFC Analysis: [RFC Title]

**Status**: [RFC Status]
**Dependencies**: [List any referenced RFCs or modules]

### Key Points
- [Point 1]
- [Point 2]

### Implementation Scope
- [File/Module 1]: [What needs to be created/modified]
- [File/Module 2]: [What needs to be created/modified]

### Questions/Clarifications Needed
- [Any ambiguities in the RFC]
```

## Phase 2 — implementation options

```markdown
## Implementation Options

1. **Full Implementation** - Implement all features in RFC
2. **Phased Implementation** - Break into smaller PRs
3. **Partial Implementation** - Implement specific sections only
4. **Analysis Only** - No implementation, just review

Select option (1-4):
```

## Phase 3 — detailed plan

```markdown
## Implementation Plan

### Files to Create
- `path/to/new/file.ts` - [Purpose]

### Files to Modify
- `path/to/existing/file.ts` - [Changes needed]

### Implementation Order
1. [Step 1 - Description]
2. [Step 2 - Description]

### Estimated Changes
- New files: X
- Modified files: Y
- Lines of code: ~Z

Proceed with implementation? (yes/no):
```

## Phase 4 — decision menu (during execution)

```markdown
Select next action:
1. Continue to next step
2. Modify current step
3. Skip this step
4. Abort and return to planning
```
