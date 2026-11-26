---
name: help
description: Show what the claude-code-teams plugin can do — commands, skills, scripts, hooks. Use when the user asks "help", "list commands", "what can this plugin do", "show plugin commands", or /claude-code-teams:help.
---

# claude-code-teams — Help

Print this reference (compact, adapt to what they asked):

## Commands (type these)
| Command | What it does |
|---|---|
| `/claude-code-teams:agent-team-orc` | Team wizard menu (create/list/rename/delete, option-picker UI) |
| `/claude-code-teams:agent-team-orc list` | List teams in this project |
| `/claude-code-teams:agent-team-orc show <name>` | Show one team's config |
| `/claude-code-teams:agent-team-orc delete <name>` | Delete a team (keeps plans/KB) |
| `/claude-code-teams:agent-team-orc rename <old> <new>` | Rename a team |
| `/claude-code-teams:orchestrate-feature team <name>: <feature + docs>` | Full pipeline: KB → plan (gated) → parallel build → test wave (90%/100% coverage + Playwright) → reviews → PR → human gate → cleanup |
| `/claude-code-teams:review-pr team <name>: <pr#> [module]` | Multi-agent PR review with KB parity check; consolidated BLOCKER/MAJOR/MINOR verdict |
| `/claude-code-teams:pr-review-fix team <name>: <pr#> [module]` | Review a PR AND fix it until it's ready to merge: collects bot comments, unresolved human comments, failing checks and conflicts, fixes only inside the PR's own files, asks about anything business-related or ambiguous, shows fixes before pushing, re-checks, approves (or comments "ready to merge" on your own PR) and asks you to merge. Never merges |
| `/claude-code-teams:figma-to-ui <figma-url>` | Figma design → implemented UI: pulls design context via Figma MCP, maps it onto the existing design system, implements, verifies with screenshots |
| `/claude-code-teams:axiom-triage [dataset] [window]` | Pulls real production errors from an Axiom dataset, groups/ranks by impact, root-causes them, fixes with regression tests |
| `/claude-code-teams:kb [module]` | Build the product KB + the browsable `/kb` viewer in the project's own stack. Bare = full KB; with a module = add/refresh that module. Auto-updates when KB files change |
| `/claude-code-teams:status` | Show running teams/agents + task progress (read-only) |
| `/claude-code-teams:help` | This reference |

Run any command BARE (no arguments) to get a guided wizard — team, feature/PR, sources all as pickers. All plugin questions use the built-in option picker (arrow keys / multi-select) with "Other" for free text. Natural language works too: "list my teams", "delete team X", "review PR 142".

## Agents (60 — spawned by the lead per feature; 3–5 active max)
- **Core pipeline (13)**: ba-analyst, legacy-analyst, planner, prototype-builder, frontend-dev, backend-dev, integrations-dev, unit-test-engineer, e2e-playwright, qa-reviewer, security-reviewer, performance-reviewer, devops-vercel
- **Database (3)**: database-architect, database-optimizer, sql-pro
- **Mobile (3)**: mobile-developer, flutter-expert, ios-developer
- **Cloud / infra (7)**: cloud-architect, kubernetes-architect, terraform-specialist, deployment-engineer, devops-troubleshooter, observability-engineer, incident-responder
- **Data / AI (4)**: data-engineer, data-scientist, ai-engineer, ml-engineer
- **Quality (7)**: code-reviewer, architect-review, debugger, error-detective, test-automator, tdd-orchestrator, accessibility-expert
- **Docs / design (3)**: api-documenter, docs-architect, ui-ux-designer
- **Languages (9)**: typescript-pro, javascript-pro, python-pro, php-pro, golang-pro, java-pro, csharp-pro, rust-pro, shell-pro
- **Frameworks (3)**: django-pro, fastapi-pro, graphql-architect
- **SEO / growth (6)**: seo-structure-architect, seo-keyword-strategist, seo-meta-optimizer, seo-content-writer, seo-content-auditor, content-marketer
- **Ops — Haiku, mechanical work only (2)**: git-ops (commits, branches, pushes, PRs), clickup-ops (task updates, comments, uploads)

Model tiering: Opus only for the 5 judgment-critical agents (planner, qa-reviewer, security-reviewer, architect-review, incident-responder); everything else Sonnet, with Haiku for plumbing. Route commits/pushes/tracker updates to git-ops/clickup-ops.

## Skills (240 — model-invoked automatically; force one with /claude-code-teams:<skill>)
- **Process**: kb-builder, product-kb, plan-lifecycle, git-worktree-discipline, clickup-workflows, frd-builder, to-spec, to-tickets, commit, pr-writer.
- **Next.js / React**: react-best-practices, nextjs-app-router-patterns, nextjs-typescript, next-dev-loop, next-cache-components-optimizer, react-state-management, tailwind-design-system, composition-patterns.
- **Angular (12)**: angular-developer, angular-signals, angular-component, angular-forms, angular-routing, angular-http, angular-di, angular-directives, angular-ssr, angular-testing, angular-tooling, angular-new-app.
- **Vue / Nuxt (13)**: vue-best-practices, vue-debug-guides, vue-pinia-best-practices, vue-router-best-practices, vue-testing-best-practices, vue-options-api-best-practices, vue-jsx-best-practices, vue-adaptable-composable, vueuse-functions, pinia, nuxt, nuxt-ui, nitro.
- **Svelte / Astro (4)**: svelte-core-bestpractices, svelte-code-writer, astro-framework, astro-learning.
- **Mobile (40)**: react-native-* (3), expo-* (11), eas-* (4), react-navigation, upgrading-react-native, assess-react-native-migration, create-react-native-library, flutter-* (10), dart-* (12).
- **Databases**: mongodb-* (3), redis-* (3), postgresql-optimization, postgresql-code-review, postgres-operations, mysql-operations, vitess-scaling, mariadb-* (6), mysql-to-mariadb, oracle-to-mariadb, sql-optimization, sql-code-review, database-migration.
- **Cloud**: launch-with-aws, aws-* (6), amazon-* (3), rds-oss, querying-aws-cloudwatch, azure-* (10), cloud-run-basics, cloud-sql-basics, alloydb-basics, gke-cluster-creation, google-cloud-* (4), cloud-logging-configuration-basics.
- **IaC / CI / shell**: terraform-* (5), multi-stage-dockerfile, github-actions-hardening, github-actions-efficiency, bash-pro, linux-shell-scripting, powershell-windows.
- **Observability**: axiom-sre, axiom-alerting, axiom-dashboards, axiom-query-metrics, axiom-metrics-chart, axiom-cost-control, axiom-spl-to-apl, axiom-writing-evals, sentry-security-review.
- **SEO / web quality**: seo-audit, seo-technical, seo-schema-markup, seo-content-strategy, ai-seo, programmatic-seo, core-web-vitals, web-performance, web-accessibility, web-quality-audit, web-quality-best-practices, web-design-guidelines, responsive-design, design-system-patterns, frontend-design.
- **Build tooling**: vite, vitest, unocss, vitepress, tsdown, pnpm, turborepo.
- **Legacy / backend**: laravel-* (5), php-best-practices, nestjs-best-practices, better-auth-* (4), architecture-patterns, api-design-principles, codebase-design, domain-modeling.
- **Security**: security-audit, sast-configuration, gha-security-review, pci-compliance, threat-mitigation-mapping.
- **Delivery**: release-readiness, user-stories.

Full list: `ls` the plugin's `skills/` directory.

## MCP servers (declared in the plugin's .mcp.json)
- **clickup** — `https://mcp.clickup.com/mcp` (tasks, FRDs, comments, attachments)
- **figma** — `https://mcp.figma.com/mcp` (design context for `figma-to-ui`)
- **axiom** — `https://mcp.axiom.co/mcp` (error datasets for `axiom-triage`)

Figma and Axiom use OAuth — the first call opens a browser authorization.

## Scripts (bash/node, in the plugin's scripts/)
- `worktree.sh new <feature> [base] | list | remove <feature> | port` — worktree + unique dev port
- `coverage-gate.sh [base-branch]` — blocks PR below 90% coverage
- `kb-index.mjs [--root <dir>] [--check]` — rebuild the `/kb` nav manifest from `.claude/knowledgebase/`; `--check` fails on drift (use in CI)
- `kb-screenshots.mjs [baseURL] [--only <module/>]` — Playwright screenshots for the product KB
- `teams-monitor.mjs [--watch|--json]` — terminal view of running teams

## Hooks (always on, enforce automatically)
- worktree-guard: blocks code edits on main/develop in the primary checkout (config/docs exempt)
- task-gate: blocks task completion if lint/typecheck fail
- kb-sync: refreshes the `/kb` nav whenever a file under `.claude/knowledgebase/` is written (silent unless it changed; never blocks)
