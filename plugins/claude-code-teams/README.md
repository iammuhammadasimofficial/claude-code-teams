# claude-code-teams

Multi-agent feature pipeline for your projects, built on Claude Code **Agent Teams**.
One prompt → legacy analysis → plan → parallel FE/BE build → parallel QA/security/perf review → PR → cleanup — **fully autonomous**, only pausing for genuine business decisions and the final merge.

> [!IMPORTANT]
> **This is a Claude Code plugin, not an npm library — `npm install claude-code-teams` will not install it into your project.** This package is published to npm only so the name is reserved and the plugin is discoverable in npm search; the actual install mechanism is Claude Code's own `/plugin` command, pulling from the **GitHub repo**, not from the npm registry. Skip straight to [Install](#install-step-by-step) below.
>
> Source and marketplace manifest: **[github.com/iammuhammadasimofficial/claude-code-teams](https://github.com/iammuhammadasimofficial/claude-code-teams)** (this folder, `plugins/claude-code-teams/`, is one plugin inside that repo's marketplace — the marketplace manifest itself lives at the repo root).

---

## Requirements

- **Claude Code**, updated to a recent version (Agent Teams is required):
  ```bash
  claude update
  ```
- **git** on your PATH.
- **Node.js 18+** (only needed if you run the helper scripts in `scripts/`).
- **Agent Teams enabled** — see [step 2](#2-enable-agent-teams).

---

## Install (step by step)

The install flow is the **same on Windows, macOS and Linux**. Only the clone folder and shell differ. Do it once per machine.

### 1. Pick a folder and clone the repo

Clone the repo somewhere permanent (you'll keep the clone around and `git pull` it for updates — don't delete it after installing).

**Windows (PowerShell):**
```powershell
cd $HOME
git clone https://github.com/iammuhammadasimofficial/claude-code-teams.git
# → clone lands at C:\Users\<you>\claude-code-teams
```

**macOS / Linux (bash/zsh):**
```bash
cd ~
git clone https://github.com/iammuhammadasimofficial/claude-code-teams.git
# → clone lands at ~/claude-code-teams
```

The plugin itself lives at `claude-code-teams/plugins/claude-code-teams/`, but the marketplace manifest is at the **repo root**. Remember the full path to the `claude-code-teams` clone — you'll point Claude Code at it (not the plugin subfolder) in step 3.

### 2. Enable agent teams

Add the experimental flag to your **user** settings file:

- Windows: `C:\Users\<you>\.claude\settings.json`
- macOS / Linux: `~/.claude/settings.json`

```json
{
  "env": { "CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS": "1" }
}
```

If the file already has an `"env"` block, just add the key inside it.

### 3. Register the local marketplace and install the plugin

Open Claude Code (in any project), then run these **slash commands** inside the session. Point the marketplace at the **repo root** (the directory that contains `.claude-plugin/marketplace.json`) — not the plugin subfolder.

> **Use forward slashes `/` in the path on every OS** — including Windows. Give the **full absolute path** to the `claude-code-teams` clone.

**Windows** (adjust `<you>`):
```
/plugin marketplace add C:/Users/<you>/claude-code-teams
/plugin install claude-code-teams@claude-code-teams
```

**macOS / Linux:**
```
/plugin marketplace add ~/claude-code-teams
/plugin install claude-code-teams@claude-code-teams
```

- The `@claude-code-teams` suffix is the **marketplace** name (from `marketplace.json`'s `name` field) — it happens to match the **plugin** name (`claude-code-teams`) since this repo only hosts the one plugin, but they're separate identifiers (`/plugin install <plugin>@<marketplace>`).
- Tip: if you launched Claude Code from **inside** the clone, you can use a relative path instead: `/plugin marketplace add .`
- Tip: you can skip the manual clone and add the GitHub repo directly instead: `/plugin marketplace add iammuhammadasimofficial/claude-code-teams`.

### 4. Reload so the plugin activates

```
/reload-plugins
```

No restart needed. Verify it loaded:

```
/claude-code-teams:help
```

You should see the command/skill reference. Done.

---

## Updating to new changes

When new changes land in the repo, update your **existing clone** — do **not** re-clone into a new folder.

**Windows (PowerShell):**
```powershell
cd $HOME\claude-code-teams
git pull
```

**macOS / Linux:**
```bash
cd ~/claude-code-teams
git pull
```

Then, inside a Claude Code session, refresh the marketplace metadata and reload:

```
/plugin marketplace update claude-code-teams
/reload-plugins
```

If a reload alone doesn't pick up the new version, reinstall:

```
/plugin install claude-code-teams@claude-code-teams
/reload-plugins
```

## Reloading plugins

To re-apply plugin changes in a running session at any time (after an update, or after editing a skill/agent locally):

```
/reload-plugins
```

This reloads all active plugins without restarting Claude Code.

---

## Permissions (no "permission denied" on any OS)

The shell scripts used by this plugin's hooks are committed with the executable bit set, so hooks run cleanly on macOS and Linux out of the box. Windows ignores the exec bit and is unaffected.

If a macOS/Linux user ever sees a `permission denied` from a hook, restore the bit on the clone:

```bash
chmod +x ~/claude-code-teams/plugins/claude-code-teams/scripts/*.sh
```

---

## Running a feature

> [!IMPORTANT]
> **Launch it right, or it won't be autonomous.** Open your Claude Code terminal **in the root folder of the target project** (not a subfolder, not this plugin repo), and start it in **bypass-permissions mode** — e.g. `claude --dangerously-skip-permissions`, or set `"permissions": { "defaultMode": "bypassPermissions" }` in the *project's* `.claude/settings.json`. Bypass mode lets the team run its own commands (git, npm, playwright, worktrees, scripts) unattended instead of pausing on per-tool permission prompts. Only use bypass mode in repos you trust.

With the terminal opened at the project root in bypass-permissions mode:

```
/claude-code-teams:orchestrate-feature Policy Renewals module — legacy source ../legacy-app, FRD in ClickUp task ABC-123
```

Or just describe the feature in natural language; the lead follows the same pipeline and runs it hands-off to an open PR. The **final PR merge stays with you**; everything up to the open PR is automatic. Quality gates (≥90%/100% coverage, zero blockers, tests green) are enforced by looping, not by asking you.

**Models are pre-configured per agent** and deliberately tiered to keep weekly Opus usage low without dropping quality: Opus for the 5 judgment-critical agents only, Sonnet for all implementation and analysis, Haiku for mechanical plumbing. See [Agent roster](#agent-roster) for the full table. Override in an agent's frontmatter if you want.

**First time in a repo:** run `/claude-code-teams:agent-team-orc` once to pick a roster and save the team (`.claude/team.json`, commit it). After that every `orchestrate-feature`/`review-pr` uses it.

---

## Commands

Type these in Claude Code. Run any command **bare** (no args) for a guided wizard; natural language ("list my teams", "review PR 142") works too.

| Command | What it does |
|---|---|
| `/claude-code-teams:agent-team-orc` | Team wizard — create / list / show / rename / delete a team for this project |
| `/claude-code-teams:orchestrate-feature team <name>: <feature + docs>` | Full **autonomous** pipeline: BA/legacy → plan → parallel build → test wave (90%/100% coverage + Playwright) → QA/security/perf reviews → PR → cleanup. Only stops for genuine business decisions and the final merge |
| `/claude-code-teams:review-pr team <name>: <pr#> [module]` | Multi-agent PR review with KB parity; consolidated BLOCKER/MAJOR/MINOR verdict |
| `/claude-code-teams:pr-review-fix team <name>: <pr#> [module]` | Review a PR AND fix it until it's ready to merge: collects bot comments, unresolved human comments, failing checks and conflicts, fixes only inside the PR's own files, asks about anything business-related or ambiguous, shows fixes before pushing, re-checks, approves (or comments "ready to merge" on your own PR) and asks you to merge. Never merges |
| `/claude-code-teams:figma-to-ui <figma-url>` | Figma design → implemented UI. Pulls design context/tokens via the Figma MCP, maps them onto the project's **existing** design system, implements per framework, then verifies with Playwright screenshots against the design and reports deliberate deviations |
| `/claude-code-teams:axiom-triage [dataset] [window]` | Pulls real production errors from an Axiom dataset, groups them by normalised signature, ranks by user impact and regression-since-deploy, root-causes each group, and fixes with a failing regression test first |
| `/claude-code-teams:kb [module]` | Build the full product knowledge base and its browsable `/kb` viewer, in the project's **own stack** (not a separate docs site). Bare = full build; with a module name = add or refresh just that module. Sources from `knowledge-base/`, FRDs and the code; writes Markdown to `.claude/knowledgebase/`; new pages appear with no code change. `/kb` is **absent in production**, open elsewhere |
| `/claude-code-teams:status` | Running teams/agents + task progress (read-only, terminal) |
| `/claude-code-teams:help` | Full command/skill/script/hook reference |

### Skills (248 — model-invoked; force one with `/claude-code-teams:<skill>`)
The lead auto-loads whichever skills fit the task. All skill content is **vendored verbatim from upstream sources** (see [Skill provenance](#skill-provenance)) — none of it is hand-written.

| Area | Skills |
|---|---|
| Next.js / React | nextjs-app-router-patterns, nextjs-typescript, next-dev-loop, next-cache-components-optimizer, react-best-practices, react-state-management, tailwind-design-system, composition-patterns |
| Angular | 12 skills — angular-developer, angular-signals, angular-forms, angular-routing, angular-http, angular-di, angular-directives, angular-ssr, angular-testing, angular-tooling, angular-component, angular-new-app |
| Vue / Nuxt | 13 — vue-best-practices, vue-debug-guides, vue-pinia/router/testing/options-api/jsx-best-practices, vue-adaptable-composable, vueuse-functions, pinia, nuxt, nuxt-ui, nitro |
| Svelte / Astro | svelte-core-bestpractices, svelte-code-writer, astro-framework, astro-learning |
| React Native / Expo | react-native-best-practices (+tv, +brownfield), expo-* (11), eas-* (4), react-navigation, upgrading-react-native, assess-react-native-migration, create-react-native-library |
| Flutter / Dart | 22 — flutter-* (10) and dart-* (12) |
| Databases | mongodb-* (3), redis-* (3), postgresql-optimization, postgresql-code-review, postgres-operations, mysql-operations, vitess-scaling, mariadb-* (6), mysql-to-mariadb, oracle-to-mariadb, sql-optimization, sql-code-review, database-migration |
| Cloud | AWS (launch-with-aws, aws-* ×6, amazon-* ×3, rds-oss, querying-aws-cloudwatch), Azure (azure-* ×10), GCP (cloud-run-basics, cloud-sql-basics, alloydb-basics, gke-cluster-creation, google-cloud-* ×4, cloud-logging-configuration-basics) |
| IaC / CI / shell | terraform-* (5), multi-stage-dockerfile, github-actions-hardening, github-actions-efficiency, bash-pro, linux-shell-scripting, powershell-windows |
| Observability | axiom-sre, axiom-alerting, axiom-dashboards, axiom-query-metrics, axiom-metrics-chart, axiom-cost-control, axiom-spl-to-apl, axiom-writing-evals, sentry-security-review |
| SEO / web quality | seo-audit, seo-technical, seo-schema-markup, seo-content-strategy, ai-seo, programmatic-seo, core-web-vitals, web-performance, web-accessibility, web-quality-audit, web-quality-best-practices, web-design-guidelines, responsive-design, design-system-patterns, frontend-design |
| Build tooling | vite, vitest, unocss, vitepress, tsdown, pnpm, turborepo |
| Legacy / backend | laravel-* (5), php-best-practices, nestjs-best-practices, better-auth-* (4), architecture-patterns, api-design-principles, codebase-design, domain-modeling |
| Integrations | paymob-integration, webengage-integration, liteapi-integration |
| Security | security-audit, sast-configuration, gha-security-review, pci-compliance, threat-mitigation-mapping |
| Delivery | release-readiness, user-stories |
| Tickets (any tracker) | tracker-workflows (Jira, ClickUp, Linear, Notion, GitHub Issues, local files), pickup-ticket, raise-ticket, verify-ticket, signoff-ticket, autopilot |
| Process | kb-builder, product-kb, plan-lifecycle, writing-plans, executing-plans, to-spec, to-tickets, frd-builder, commit, pr-writer, clickup-workflows, git-worktree-discipline |

Full list: `/claude-code-teams:help`, or `ls skills/`.

### MCP servers (`.mcp.json`)
| Server | URL | Used by |
|---|---|---|
| `clickup` | `https://mcp.clickup.com/mcp` | FRDs/tasks, comments, attachments; **clickup-ops** |
| `figma` | `https://mcp.figma.com/mcp` | design context for **figma-to-ui**, prototype-builder, frontend-dev |
| `axiom` | `https://mcp.axiom.co/mcp` | error datasets for **axiom-triage**, observability/incident agents |

Figma and Axiom authenticate over **OAuth** — the first call in a session opens a browser authorization. ClickUp additionally needs `CLICKUP_API_TOKEN` (see [step 2](#2-enable-agent-teams)). If a server isn't connected, the dependent command says so and offers a fallback rather than inventing data.

### Figma's official skills (install alongside)

Figma publishes its own Claude Code plugin with **12 first-party skills** for driving the Figma MCP — `figma-use` (which Figma marks *mandatory* before any `use_figma` call), `figma-design-to-code`, `figma-generate-design`, `figma-generate-library`, `figma-code-connect`, `figma-implement-motion`, plus FigJam/Slides/diagram skills.

Our marketplace lists it, so it installs from Figma's repo in one line:

```
/plugin install figma@claude-code-teams
/reload-plugins
```

It is **referenced, not vendored** — deliberately. Figma's repo ships no LICENSE file, so copying its files into this repo would be an unlicensed redistribution; and because the skills track the MCP server's own version (currently 2.2.81), pointing at source keeps them current instead of frozen at a sync date. `figma-to-ui` detects them and defers to them for MCP mechanics, handling only the project-specific part: mapping onto the project's design system, picking the right agent, and checking its quality gates.

### Scripts (`scripts/`, run with node/bash)
| Script | Purpose |
|---|---|
| `node scripts/teams-monitor.mjs [--watch\|--json]` | Terminal view of running teams |
| `bash scripts/worktree.sh new <feature> [base] \| list \| remove <feature>` | Worktree + unique dev port |
| `bash scripts/coverage-gate.sh [base-branch]` | Blocks PR below 90% coverage |
| `node scripts/kb-index.mjs [--check]` | Rebuild the `/kb` nav manifest; `--check` fails on drift (CI gate) |
| `node scripts/kb-screenshots.mjs [baseURL]` | Playwright screenshots for the product KB |

### Hooks (always on)
- **worktree-guard** — blocks code edits on main/develop in the primary checkout (config/docs exempt).
- **task-gate** — blocks task completion if lint/typecheck fail.
- **kb-sync** — refreshes the `/kb` nav manifest whenever a file under `.claude/knowledgebase/` is written, so the KB can never drift behind its content. Silent unless it changed; never blocks a tool call.

---

## Monitoring

- Default (all OS): in-process panel — ↑/↓ selects a teammate, Enter opens its transcript, Esc interrupts, Ctrl+T toggles the task list.
- macOS/Linux optional split panes: install tmux, then `claude --teammate-mode auto` (or set `"teammateMode": "auto"`). Not supported in Windows Terminal — Windows devs use in-process mode or WSL+tmux.

## Layout expected in each project repo

```
knowledge-base/<module>/   # parity contract (kb-builder skill format)
plans/upcoming|in-progress|done/
CLAUDE.md                  # project conventions — teammates load it automatically
```

## Notes

- Agent Teams is experimental: if the terminal dies, in-process teammates are lost. All state (KB, plans, tasks) lives on disk, so re-run the skill and continue.
- Token cost scales per teammate. The pipeline runs phases sequentially and only parallelizes where it pays (FE+BE, the three reviewers).
- One feature = one worktree = one team. Multiple features → multiple lead sessions.

## Agent roster (60)

The lead spawns only what the feature needs — **3–5 active teammates max**. A specialist *replaces* a generalist in the wave; it doesn't stack on top. Adding agents to the plugin costs nothing until one is spawned.

**Core pipeline (13)** — ba-analyst, legacy-analyst, planner, prototype-builder, frontend-dev, backend-dev, integrations-dev, unit-test-engineer, e2e-playwright, qa-reviewer, security-reviewer, performance-reviewer, devops-vercel.

**Specialists (47)**, spawned on demand:

| Area | Agents |
|---|---|
| Database | database-architect, database-optimizer, sql-pro |
| Mobile | mobile-developer, flutter-expert, ios-developer |
| Cloud / infra | cloud-architect, kubernetes-architect, terraform-specialist, deployment-engineer, devops-troubleshooter, observability-engineer, incident-responder |
| Data / AI | data-engineer, data-scientist, ai-engineer, ml-engineer |
| Quality | code-reviewer, architect-review, debugger, error-detective, test-automator, tdd-orchestrator, accessibility-expert |
| Docs / design | api-documenter, docs-architect, ui-ux-designer |
| Languages | typescript-pro, javascript-pro, python-pro, php-pro, golang-pro, java-pro, csharp-pro, rust-pro, shell-pro |
| Frameworks | django-pro, fastapi-pro, graphql-architect |
| SEO / growth | seo-structure-architect, seo-keyword-strategist, seo-meta-optimizer, seo-content-writer, seo-content-auditor, content-marketer |
| Ops (mechanical) | git-ops, clickup-ops |

`database-architect`/`database-optimizer`/`sql-pro` and `backend-dev` have a documented handoff in both directions: backend-dev sends access patterns and slow-query plans; the database agents return the schema, index plan and migration steps, and never edit application code themselves.

### Model and effort tiering

Tiered to hold weekly Opus usage down without dropping quality. **Opus is 5 of 60 agents** — reserved for work where a wrong judgement is expensive and the volume is low. Everything that scales with feature size runs Sonnet. Plumbing runs Haiku. Agent frontmatter uses the `opus` / `sonnet` / `haiku` aliases, which Claude Code resolves to the latest model in each family (currently **Opus 5.5**, **Sonnet 5.5** and **Haiku 4.5**), so new releases are picked up without editing agents. **Opus 5.5 is the ceiling: no agent runs on Fable**, and `inherit` is not allowed (it would pick up the session model, which may be Fable).

| Tier | Count | Agents |
|---|---|---|
| **Opus / high** | 5 | planner, qa-reviewer, security-reviewer, architect-review, incident-responder |
| **Sonnet / high** | 43 | all implementation, analysis, database, cloud, mobile, data/AI, quality and language agents |
| **Sonnet / medium** | 8 | seo-keyword-strategist, seo-meta-optimizer, seo-content-writer, seo-content-auditor, content-marketer, api-documenter, docs-architect, shell-pro |
| **Sonnet / low** | 1 | prototype-builder (throwaway output) |
| **Haiku / low** | 3 | git-ops, clickup-ops, devops-vercel |

**Send mechanical work to Haiku.** `git-ops` handles staging, commit messages, branch creation, pushes, PR opening and worktree setup/teardown. `clickup-ops` handles task reads/updates, status transitions, comments and screenshot/attachment uploads. Neither has design authority — both have explicit escalation limits (merge conflicts, history rewrites, failing gates, ambiguous requirements, destructive operations) and hand back rather than guessing. Keeping this traffic off Sonnet/Opus is where most of the token saving comes from, because it is the highest-volume work in a run.

## Skill provenance

Every skill is vendored verbatim from an upstream source with a `<!-- Vendored from … -->` comment and a `license:` field in its frontmatter. Nothing is hand-written, so upstream fixes can be re-synced. Sources include the official first-party repos for Angular, Vue, Nuxt, Svelte, Expo, Flutter, Dart, MariaDB, PlanetScale, AWS, Microsoft/Azure, Google Cloud, HashiCorp, GitHub and Axiom, plus `wshobson/agents` for the agent definitions.

Licenses are **mixed** and attributed per file — check the frontmatter before reusing a skill outside this repo:

| License | Applies to |
|---|---|
| MIT | most skills; all agents (`wshobson/agents`) |
| Apache-2.0 | AWS (`aws/agent-toolkit-for-aws`), GCP (`google/skills`) |
| BSD-3-Clause | Flutter (`flutter/agent-plugins`), Dart (`dart-lang/skills`) — clause 3 forbids implying Flutter/Google endorsement |
| MPL-2.0 | Terraform (`hashicorp/agent-skills`) — weak file-level copyleft; keep modifications to those files MPL and retain notices |

One caveat worth knowing: **`vercel-labs/agent-skills` ships no `LICENSE` file** — MIT is asserted only in its README and in some of its skills' own frontmatter. We record those as MIT on that basis (`vercel-optimize`, `web-design-guidelines`, `react-best-practices`, `composition-patterns`, `nextjs-typescript`). Every other source has a real LICENSE file, verified at vendoring time.

Re-syncing a skill means re-copying from upstream and updating the synced date — review the upstream diff first. The test suite enforces that every vendored skill keeps a `license:` field and a `Vendored from … — synced <date>` comment, so attribution can't silently rot.
