---
name: raise-ticket
description: Turn a described need into a well-formed ticket (feature, change request, bug or chore) in any tracker (Jira, ClickUp, Linear, Notion, GitHub Issues, Asana, Trello, Azure DevOps) or as a local markdown file. Asks only the questions the template needs, drafts the ticket, gets explicit approval, then creates it with the right type, labels and links. Use for "raise a ticket", "log a bug", "write this up as a story", "create an issue for this", or /claude-code-teams:raise-ticket <description>.
argument-hint: <what is needed> [bug | feature | change | chore]
---

# Raise a ticket

Creates a ticket that an engineer (or `pickup-ticket`) can start on without a follow-up conversation. Read `tracker-workflows` first for tracker detection and the safety rules.

## 1. Understand the need
Infer as much as possible from the description, the repo and the conversation. Decide the **type**: feature (new behaviour), change (altering existing behaviour), bug (something broken), or chore (maintenance with no user-visible change). Ask for a type only if it truly cannot be inferred.

Before drafting, `search` the tracker for likely duplicates. If one exists, show it and ask whether to comment on it instead.

## 2. Ask only what the template needs
Missing items, asked in one AskUserQuestion round where possible (selectable options, "Other" last):
- **Feature or change:** who it is for, the outcome they want, what is explicitly out of scope, how success is measured.
- **Bug:** steps to reproduce, expected result, actual result, environment or version, severity, evidence (error text, screenshot path, log excerpt with secrets removed).
- **Chore:** why now and what "done" looks like.

## 3. Draft with this template
```
Title: <verb + object, under 80 characters>
Type: <feature | change | bug | chore>

Summary: <one or two sentences>

Context: <why this matters, links to related items or docs>

Acceptance criteria:
- [ ] <testable, observable statement>
- [ ] <...>

Out of scope: <what this does not include>

Notes / risks: <edge cases, dependencies, data or security considerations>
(Bugs: Steps to reproduce / Expected / Actual / Environment replace Context.)
```
Every acceptance criterion must be checkable by someone who did not write it. Prefer "Given / When / Then" wording when it makes the check clearer.

## 4. Approval gate
Show the full draft and the destination (tracker, project or list or database, type, labels). Ask **Create it** / **Edit** / **Cancel**. Create nothing until the developer picks *Create it*.

## 5. Create and report
`create` the item with the mapped type and any labels the developer approved, then `link` related items. If the tracker is unreachable, write `tickets/<slug>.md` instead and say so. Reply with the ticket link or path and a one-line summary. Do not assign, prioritise or estimate unless asked.

To start building it right away, continue with `pickup-ticket`.
