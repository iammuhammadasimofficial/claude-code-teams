---
name: pickup-ticket
description: Start work from a ticket link or ID in any tracker (Jira, ClickUp, Linear, Notion, GitHub Issues, Asana, Trello, Azure DevOps) or from pasted ticket text. Reads the ticket and its comments through the tracker-workflows adapter, checks it is clear enough to build, asks the ticket's author any open questions as a comment, then runs the full orchestrate-feature pipeline with the ticket as the source of truth and reports progress back. Use for "pick up PROJ-123", "work on this ticket", "start this story", or /claude-code-teams:pickup-ticket <link-or-id> [notes].
argument-hint: <ticket link or ID> [extra context]
---

# Pick up a ticket

Entry point for ticket-driven work. It adds the ticket handling around `orchestrate-feature`; it does not replace it. Read `tracker-workflows` first for tracker detection, the seven operations and the safety rules.

## 1. Load the ticket
1. Detect the tracker from the link or ID (or `.claude/tracker.json`). If nothing is connected, use local mode.
2. `get` the item, then `comments`. Also open every linked spec or doc the ticket points to (a Notion page, a wiki page, a design link) when a tool for it is available.
3. Check the ticket's state. If it is explicitly not ready (for example *Draft*, *Backlog*, *Needs refinement*, or a workflow that has an approval state you can see and the ticket has not reached it), say so and ask whether to continue anyway. Do not block when the workflow gives no signal.

## 2. Readiness check (spec, not code)
Normalise the ticket into the plan's inputs: goal, users, acceptance criteria, out of scope, dependencies, open questions. Use `frd-builder` / `to-spec` formats for the written spec and record the ticket ID in its header.

A ticket is **ready** when each acceptance criterion is testable and nothing essential is ambiguous. Otherwise list the gaps as **numbered questions**, each with your suggested default.

## 3. Ask before guessing
- If the gaps are business decisions for the ticket's author, `comment` on the ticket with the numbered questions in plain language (and mention the author if the tracker supports mentions), set the ticket to the mapped waiting state only if the workflow has one, and **stop**. Tell the developer you are waiting and what to say to resume.
- If the developer is present and can answer, ask with AskUserQuestion (selectable options, "Other" last) instead.
- Never invent requirements to fill a gap.

## 4. Run the pipeline
Hand off to `orchestrate-feature` with: the normalised spec as the source of truth, the work type inferred from the ticket (new feature, change, bug fix), and the team from `.claude/teams/` if one exists. Pass the `skip-worktree` flag through if the developer used it.

While it runs, use `tracker-workflows` to:
- `transition` to the mapped *inProgress* status when the plan is approved (once),
- `comment` once per phase change: spec ready, plan approved, PR ready (with the PR link via `link`),
- create subtasks or a checklist mirroring the plan's task breakdown only if the developer wants them.

## 5. Finish line
Present the PR link, preview URL, and test and review results, move the ticket to the mapped *inReview* status, and **stop**. Never merge the PR and never mark the ticket Done: both stay with the human. After the developer confirms the merge, offer to `transition` the ticket to the status they choose (ask with the tracker's real status names as options), then clean up.

If the developer then wants hands-on checking, continue with `verify-ticket`, then `signoff-ticket`. To run all of it unattended up to the human gates, use `autopilot`.
