---
name: verify-ticket
description: Hands-on QA of a ticket's acceptance criteria against a running build (preview, staging or local dev server). Reads the ticket from any tracker, turns each acceptance criterion into concrete checks, drives the app with Playwright, records evidence per criterion, and reports pass, fail or blocked. With approval it raises bug tickets for failures and comments the verdict on the ticket. Use for "verify PROJ-123", "QA this ticket", "check the acceptance criteria", or /claude-code-teams:verify-ticket <ticket> [url].
argument-hint: <ticket link or ID> [preview or staging URL]
---

# Verify a ticket

Independent checking of what was built against what was asked. It reports; it does not fix. Read `tracker-workflows` first for tracker detection and the safety rules.

## 1. Gather inputs
- `get` the ticket and `comments`; extract every acceptance criterion (number them AC1, AC2, ...). If there are none, derive candidate criteria from the description, show them, and ask the developer to confirm before testing.
- The **target URL**: the one given, else the PR's preview deployment, else the local dev server (start it per the `.worktree-port` or the project's dev script). If no environment can be reached, stop and say what is needed.
- Test accounts and data: use only seed, fixture or test credentials the developer provided or the project documents. Never use real customer accounts, never enter real payment details, and never run destructive actions against a shared or production environment.

## 2. Plan the checks
For each AC write the smallest set of checks that proves it: the steps, the expected result, and the evidence to capture. Add the obvious neighbours: empty state, invalid input, permission boundaries, mobile width (400px), and a quick regression pass on the nearest existing flow. Keep the plan short and show it before running anything non-trivial.

## 3. Run
Use the `e2e-playwright` agent or the `webapp-testing` / `playwright-cli` skills. For each check capture a screenshot or short text evidence, and any console or network errors. Record results as they happen so a crash does not lose them.

## 4. Verdict per criterion
- **Pass:** every check for the criterion succeeded; evidence attached.
- **Fail:** a check failed; include steps to reproduce, expected, actual, environment and evidence.
- **Blocked:** it could not be tested (missing data, environment down); say exactly what is needed.

Write the report to `.claude/verification/<ticket-id>.md` with a table (AC, verdict, evidence, notes) and a one-paragraph summary. Findings that are not acceptance criteria (bugs next to the change, UX issues) go in a separate *Other findings* list, never mixed into the verdicts.

## 5. Report back
Show the table in chat. Then, with the developer's approval for each action:
- `comment` a concise verdict on the ticket (counts of pass, fail and blocked, link to the report),
- for each failure, offer to raise a bug through `raise-ticket` (linked to this ticket) with the reproduction details already filled in,
- do not change the ticket's status here; that is `signoff-ticket`.

If everything passes, say so plainly and offer `signoff-ticket`. If anything fails, list what blocks sign-off and stop.
