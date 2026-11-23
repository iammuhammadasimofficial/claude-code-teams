# claude-code-teams

A home for my Claude Code tooling — plugins, agents, skills, hooks, and workflows.

This repo is a **Claude Code marketplace**. It ships our own plugin, **`claude-code-teams`**, and also lists Figma's official plugin so both install from one place. More custom Claude assets will be added over time.

## Contents

| Plugin | Source | What it is |
|---|---|---|
| `claude-code-teams` | [`plugins/claude-code-teams/`](plugins/claude-code-teams) (this repo) | Multi-agent feature-delivery pipeline for Claude Code (60 agents, 240 skills, hooks, coverage/PR gates). |
| `figma` | `figma/mcp-server-guide` (Figma, referenced not copied) | Figma's official plugin — Figma MCP server plus 12 first-party skills for design-to-code. Optional; install it if you do Figma work. |

## `claude-code-teams`

A multi-agent feature pipeline for our stack: **Next.js / Vercel / Tailwind / MongoDB / Redis**, with Paymob, WebEngage and LiteAPI integrations, plus legacy **Laravel/Vue** and **Node/NestJS** support — and now broad coverage beyond it: Angular, Vue/Nuxt, Svelte, Astro, React Native/Expo, Flutter, PostgreSQL/MySQL/MariaDB, AWS/Azure/GCP, Terraform/Kubernetes, SEO and Axiom observability.

It drives a feature end-to-end: BA & legacy analysis → prototyping → planning → parallel frontend / backend / integrations implementation → QA, security & performance review → PR gate.

### Agents (60)

**Core pipeline (13)** — `ba-analyst`, `legacy-analyst`, `prototype-builder`, `planner`, `frontend-dev`, `backend-dev`, `integrations-dev`, `unit-test-engineer`, `e2e-playwright`, `qa-reviewer`, `security-reviewer`, `performance-reviewer`, `devops-vercel`.

**Specialists (47)**, spawned only when needed — database (`database-architect`, `database-optimizer`, `sql-pro`), mobile (`mobile-developer`, `flutter-expert`, `ios-developer`), cloud/infra (`cloud-architect`, `kubernetes-architect`, `terraform-specialist`, `deployment-engineer`, `devops-troubleshooter`, `observability-engineer`, `incident-responder`), data/AI (`data-engineer`, `data-scientist`, `ai-engineer`, `ml-engineer`), quality (`code-reviewer`, `architect-review`, `debugger`, `error-detective`, `test-automator`, `tdd-orchestrator`, `accessibility-expert`), docs/design (`api-documenter`, `docs-architect`, `ui-ux-designer`), languages (`typescript-pro`, `javascript-pro`, `python-pro`, `php-pro`, `golang-pro`, `java-pro`, `csharp-pro`, `rust-pro`, `shell-pro`), frameworks (`django-pro`, `fastapi-pro`, `graphql-architect`), SEO/growth (`seo-structure-architect`, `seo-keyword-strategist`, `seo-meta-optimizer`, `seo-content-writer`, `seo-content-auditor`, `content-marketer`), and ops (`git-ops`, `clickup-ops`).

**Model tiering** — Opus is only 5 of 60 (`planner`, `qa-reviewer`, `security-reviewer`, `architect-review`, `incident-responder`); 43 run Sonnet/high, 8 Sonnet/medium, 1 Sonnet/low, and 3 Haiku/low. `git-ops` and `clickup-ops` exist so commits, pushes, branches, PR plumbing and ClickUp uploads run on Haiku instead of an expensive model.

### Skills (240)

All skill content is **vendored verbatim from upstream sources** — none of it is hand-written, so upstream fixes can be re-synced. Grouped roughly by area:

- **Orchestration & workflow** — `agent-team-orc`, `orchestrate-feature`, `figma-to-ui`, `axiom-triage`, `kb`, `plan-lifecycle`, `writing-plans`, `executing-plans`, `subagent-driven-development`, `to-spec`, `to-tickets`, `frd-builder`, `status`, `help`.
- **Next.js / React** — `nextjs-app-router-patterns`, `nextjs-typescript`, `next-dev-loop`, `next-cache-components-optimizer`, `react-best-practices`, `react-state-management`, `composition-patterns`, `tailwind-design-system`.
- **Angular (12)** — `angular-developer`, `angular-signals`, `angular-component`, `angular-forms`, `angular-routing`, `angular-http`, `angular-di`, `angular-directives`, `angular-ssr`, `angular-testing`, `angular-tooling`, `angular-new-app`.
- **Vue / Nuxt (13)** — `vue-best-practices`, `vue-debug-guides`, `vue-pinia-best-practices`, `vue-router-best-practices`, `vue-testing-best-practices`, `vue-options-api-best-practices`, `vue-jsx-best-practices`, `vue-adaptable-composable`, `vueuse-functions`, `pinia`, `nuxt`, `nuxt-ui`, `nitro`.
- **Svelte / Astro** — `svelte-core-bestpractices`, `svelte-code-writer`, `astro-framework`, `astro-learning`.
- **Mobile (40)** — `react-native-best-practices` (+ TV, brownfield, migration, upgrade), `expo-*` (11), `eas-*` (4), `react-navigation`, `flutter-*` (10), `dart-*` (12).
- **Databases** — `mongodb-*` (3), `redis-*` (3), `postgresql-optimization`, `postgresql-code-review`, `postgres-operations`, `mysql-operations`, `vitess-scaling`, `mariadb-*` (6), `mysql-to-mariadb`, `oracle-to-mariadb`, `sql-optimization`, `sql-code-review`, `database-migration`.
- **Cloud** — AWS (`launch-with-aws`, `aws-*`, `amazon-*`, `rds-oss`, `querying-aws-cloudwatch`), Azure (`azure-*` ×10), GCP (`cloud-run-basics`, `cloud-sql-basics`, `alloydb-basics`, `gke-cluster-creation`, `google-cloud-*`).
- **IaC / CI / shell** — `terraform-*` (5), `multi-stage-dockerfile`, `github-actions-hardening`, `github-actions-efficiency`, `bash-pro`, `linux-shell-scripting`, `powershell-windows`.
- **Observability** — `axiom-sre`, `axiom-alerting`, `axiom-dashboards`, `axiom-query-metrics`, `axiom-metrics-chart`, `axiom-cost-control`, `axiom-spl-to-apl`, `axiom-writing-evals`, `sentry-security-review`.
- **SEO / web quality** — `seo-audit`, `seo-technical`, `seo-schema-markup`, `seo-content-strategy`, `ai-seo`, `programmatic-seo`, `core-web-vitals`, `web-performance`, `web-accessibility`, `web-quality-audit`, `web-quality-best-practices`, `web-design-guidelines`, `responsive-design`, `design-system-patterns`, `frontend-design`.
- **Build tooling** — `vite`, `vitest`, `unocss`, `vitepress`, `tsdown`, `pnpm`, `turborepo`.
- **Legacy / backend** — `laravel-*` (5), `nestjs-best-practices`, `php-best-practices`, `architecture-patterns`, `api-design-principles`, `codebase-design`, `codebase-research`, `domain-modeling`, `improve-codebase-architecture`.
- **Integrations** — `paymob-integration`, `webengage-integration`, `liteapi-integration`, `better-auth-*` (4).
- **Quality, testing & review** — `test-driven-development`, `webapp-testing`, `playwright-cli`, `find-bugs`, `diagnosing-bugs`, `systematic-debugging`, `requesting-code-review`, `receiving-code-review`, `pr-review-fix`, `review-pr`, `pr-writer`, `commit`, `verification-before-completion`, `setup-pre-commit`, `dependency-upgrade`.
- **Security** — `security-audit`, `sast-configuration`, `gha-security-review`, `pci-compliance`, `threat-mitigation-mapping`.
- **Knowledge & tooling** — `brainstorming`, `kb-builder`, `product-kb`, `skill-writer`, `skill-scanner`, `clickup-workflows`, `git-worktree-discipline`, `prototype`, `vercel-optimize`.

Licenses are mixed and attributed per skill (MIT, Apache-2.0, BSD-3-Clause for Flutter/Dart, MPL-2.0 for HashiCorp Terraform) — see [Skill provenance](plugins/claude-code-teams/README.md#skill-provenance).

### Knowledge base

`/claude-code-teams:kb` builds the product KB — Markdown under `.claude/knowledgebase/`, one folder per module — plus a browsable `/kb` viewer written in the project's **own stack** (Next.js route, Blade view, Nuxt page…), not a separate docs site. The viewer reads the KB tree at runtime, so a new `.md` file becomes a new page with no code change, and a `kb-sync` hook keeps the nav manifest in step. `/kb` is **not registered in production** and open, unauthenticated, everywhere else — the KB carries pricing and commission rules.

### MCP servers

`clickup` (tasks/FRDs), `figma` (design context for `figma-to-ui`), `axiom` (error datasets for `axiom-triage`). Figma and Axiom use OAuth.

This marketplace also lists **Figma's official plugin** (`/plugin install figma@claude-code-teams`, sourced from `figma/mcp-server-guide`) — 12 first-party Figma skills, referenced rather than copied so they stay current. `figma-to-ui` defers to them for MCP mechanics.

### Layout

```
claude-code-teams/
├── .claude-plugin/
│   └── marketplace.json     # marketplace catalog (this repo)
└── plugins/
    └── claude-code-teams/
        ├── .claude-plugin/
        │   └── plugin.json  # plugin manifest
        ├── agents/          # 60 subagent definitions
        ├── skills/          # 240 skills (vendored, license-attributed)
        ├── hooks/hooks.json # lifecycle hooks
        ├── scripts/         # coverage/task gates, worktree helpers, team monitor
        ├── tests/           # plugin tests
        └── .mcp.json        # MCP servers (ClickUp, Figma, Axiom)
```

## Installation

This repo **is** the marketplace — the manifest lives at the repo root, so point Claude Code at the repo itself (not a plugin subfolder). Install from a **local clone**:

```bash
# 1. clone (keep the clone — you'll git pull it for updates)
git clone https://github.com/iammuhammadasimofficial/claude-code-teams.git

# 2. inside a Claude Code session (use the full path to the clone):
/plugin marketplace add <path-to>/claude-code-teams
/plugin install claude-code-teams@claude-code-teams
/plugin install figma@claude-code-teams        # optional — only if you do Figma work
/reload-plugins
```

Or skip the manual clone and add the GitHub repo directly: `/plugin marketplace add iammuhammadasimofficial/claude-code-teams`.

You also need **Agent Teams** enabled and a **ClickUp token** — see the [full setup steps](plugins/claude-code-teams/README.md#install-step-by-step).

Full step-by-step instructions for Windows, macOS and Linux — plus how to update and reload — are in [`plugins/claude-code-teams/README.md`](plugins/claude-code-teams/README.md).

## Contributing

Add new Claude customizations (plugins, standalone skills, agents) under a clear top-level folder and update this README's contents table.
