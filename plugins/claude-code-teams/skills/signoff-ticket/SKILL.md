---
name: signoff-ticket
description: Close out a ticket with evidence. Checks that every acceptance criterion passed (from verify-ticket or the developer's own testing), that the PR, tests and reviews are in order, then posts a sign-off summary on the ticket in any tracker and moves it to the status the developer chooses. Never merges and never marks Done unless the developer explicitly says to. Use for "sign off PROJ-123", "close out this ticket", "mark this ready for release", or /claude-code-teams:signoff-ticket <ticket>.
argument-hint: <ticket link or ID>
---

# Sign off a ticket

The last step before the human release decision. Read `tracker-workflows` first for tracker detection and the safety rules.

## 1. Collect the evidence
- `get` the ticket and `comments`.
- Verification result: the report at `.claude/verification/<ticket-id>.md` if it exists; otherwise ask whether verification was done by hand, and if not, offer to run `verify-ticket` first.
- The PR: link, CI status, review status, open comments (use `gh pr view --json` or the host's tool). Confirm the PR targets the right base branch.
- Test and coverage results from the pipeline, if present in the plan's implementation log.

## 2. Gate check
Sign-off is allowed only when all of these hold. Report each as pass or fail:
1. Every acceptance criterion is **Pass** (no Fail, no unexplained Blocked).
2. CI is green and there are no unresolved review comments or merge conflicts.
3. No open bug tickets raised by this work remain unaddressed.
4. Nothing in the diff goes beyond the ticket's scope without being called out.

If any gate fails, list exactly what blocks sign-off and stop. Do not soften a failure into a pass.

## 3. Post the sign-off
Draft one comment and show it before posting:
```
Sign-off summary
- Scope: <one line>
- Acceptance criteria: <n of n passed> (report: <path or link>)
- PR: <link> (CI green, reviews resolved)
- Tests: <what ran, coverage if known>
- Known limitations / follow-ups: <list or "none">
```
On approval, `comment` it and `link` the PR if not already linked.

## 4. Move the ticket
Ask which status to set, with the tracker's real status names as options (use `statusMap` from `.claude/tracker.json` for the recommended one, usually *readyForQA* or *done*). Apply only the one the developer picks. **Never choose *Done* for them and never merge the PR.** Merging and release remain human decisions.

Finish with a three-line recap: gate result, comment posted, status set.
