// tests/scripts.spec.mjs — Part 3: scripts & hooks. Pure bash/node, no Claude needed.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawn, execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..');
const REPO_ROOT = path.resolve(ROOT, '..', '..');
const SCRIPTS = path.join(ROOT, 'scripts');
const toBash = (p) => p.split(path.sep).join('/');

function sh(script, { args = [], cwd, env, input } = {}) {
  return new Promise((resolve) => {
    const p = spawn('bash', [toBash(script), ...args], {
      cwd, env: { ...process.env, ...env },
    });
    let out = '', err = '';
    p.stdout.on('data', (d) => (out += d));
    p.stderr.on('data', (d) => (err += d));
    p.on('close', (code) => resolve({ code, out, err }));
    p.on('error', (e) => resolve({ code: -1, out, err: String(e) }));
    if (input != null) p.stdin.write(input);
    p.stdin.end();
  });
}

function tmp(tag) { return fs.mkdtempSync(path.join(os.tmpdir(), tag + '-')); }
function git(cwd, ...args) { return execFileSync('git', args, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }); }
function initRepo(dir) {
  fs.mkdirSync(dir, { recursive: true });
  git(dir, 'init', '-b', 'main');
  git(dir, 'config', 'user.email', 'test@example.com');
  git(dir, 'config', 'user.name', 'Test');
  git(dir, 'config', 'commit.gpgsign', 'false');
  fs.writeFileSync(path.join(dir, 'README.md'), '# repo\n');
  git(dir, 'add', '-A');
  git(dir, 'commit', '-m', 'init', '--no-verify');
  return dir;
}

// ---------------------------------------------------------------- worktree.sh
test('worktree.sh: new creates worktree with deterministic port in 3100-3999; list shows it; remove cleans it', async () => {
  const base = tmp('wt');
  const repo = initRepo(path.join(base, 'myrepo'));
  const wtRoot = path.join(base, 'myrepo-worktrees');

  const created = await sh(path.join(SCRIPTS, 'worktree.sh'), { args: ['new', 'feat-x'], cwd: repo });
  assert.equal(created.code, 0, 'new should succeed:\n' + created.err);
  const wt = path.join(wtRoot, 'feat-x');
  assert.ok(fs.existsSync(wt), 'worktree dir should exist at ../myrepo-worktrees/feat-x');

  const portFile = path.join(wt, '.worktree-port');
  assert.ok(fs.existsSync(portFile), '.worktree-port should be written');
  const port = Number(fs.readFileSync(portFile, 'utf8').trim());
  assert.ok(port >= 3100 && port <= 3999, `port ${port} must be in 3100-3999`);

  // deterministic: base 3100 + cksum(name) % 900, no collisions on a fresh tree
  const cksum = Number(execFileSync('bash', ['-c', "printf '%s' feat-x | cksum | cut -d' ' -f1"], { encoding: 'utf8' }).trim());
  assert.equal(port, 3100 + (cksum % 900), 'port must be the deterministic cksum-derived value');

  const listed = await sh(path.join(SCRIPTS, 'worktree.sh'), { args: ['list'], cwd: repo });
  assert.equal(listed.code, 0);
  assert.match(listed.out, /feat-x/, 'list should show the worktree');

  const removed = await sh(path.join(SCRIPTS, 'worktree.sh'), { args: ['remove', 'feat-x'], cwd: repo });
  assert.equal(removed.code, 0, 'remove should succeed:\n' + removed.err);
  assert.ok(!fs.existsSync(wt), 'worktree dir should be gone after remove');
});

test('worktree team resolution: git-common-dir from inside a worktree resolves to the primary checkout', async () => {
  const base = tmp('wtres');
  const repo = initRepo(path.join(base, 'myrepo'));
  // teams file created ONLY in the primary checkout
  fs.mkdirSync(path.join(repo, '.claude', 'teams'), { recursive: true });
  fs.writeFileSync(path.join(repo, '.claude', 'teams', 'foo.json'), '{"teamName":"foo"}');

  const created = await sh(path.join(SCRIPTS, 'worktree.sh'), { args: ['new', 'feat-res'], cwd: repo });
  assert.equal(created.code, 0, created.err);
  const wt = path.join(base, 'myrepo-worktrees', 'feat-res');

  // the exact rule used by agent-team-orc to locate the primary checkout's teams dir
  const resolved = execFileSync('bash', ['-c', 'dirname "$(git rev-parse --git-common-dir)"'], { cwd: wt, encoding: 'utf8' }).trim();
  const teamsFile = path.join(resolved, '.claude', 'teams', 'foo.json');
  assert.ok(fs.existsSync(teamsFile), `teams file created only in primary must be found from the worktree via ${resolved}`);
});

// ---------------------------------------------------------- worktree-guard.sh
test('worktree-guard.sh: blocks code edits on main in the primary checkout (exit 2)', async () => {
  const base = tmp('guard');
  const repo = initRepo(path.join(base, 'myrepo'));
  const input = JSON.stringify({ tool_name: 'Edit', tool_input: { file_path: 'src/app.ts' } });
  const r = await sh(path.join(SCRIPTS, 'worktree-guard.sh'), { input, env: { CLAUDE_PROJECT_DIR: repo } });
  assert.equal(r.code, 2, 'edit on main in primary must be blocked');
  assert.match(r.err, /BLOCKED/i);
});

test('worktree-guard.sh: allows the same edit inside a linked worktree (exit 0)', async () => {
  const base = tmp('guard2');
  const repo = initRepo(path.join(base, 'myrepo'));
  const created = await sh(path.join(SCRIPTS, 'worktree.sh'), { args: ['new', 'feat-g'], cwd: repo });
  assert.equal(created.code, 0, created.err);
  const wt = path.join(base, 'myrepo-worktrees', 'feat-g');
  const input = JSON.stringify({ tool_name: 'Edit', tool_input: { file_path: 'src/app.ts' } });
  const r = await sh(path.join(SCRIPTS, 'worktree-guard.sh'), { input, env: { CLAUDE_PROJECT_DIR: wt } });
  assert.equal(r.code, 0, 'edits inside a worktree must be allowed');
});

test('worktree-guard.sh: allows .claude/ and plans/ paths on main (exit 0)', async () => {
  const base = tmp('guard3');
  const repo = initRepo(path.join(base, 'myrepo'));
  for (const fp of ['.claude/settings.json', 'plans/upcoming/feature.md', 'CLAUDE.md', 'README.md']) {
    const input = JSON.stringify({ tool_name: 'Write', tool_input: { file_path: fp } });
    const r = await sh(path.join(SCRIPTS, 'worktree-guard.sh'), { input, env: { CLAUDE_PROJECT_DIR: repo } });
    assert.equal(r.code, 0, `${fp} on main should be allowed`);
  }
});

// ------------------------------------------------------------ coverage-gate.sh
test('coverage-gate.sh: exits nonzero when coverage/tests fail', async () => {
  const dir = initRepo(path.join(tmp('cov'), 'app'));
  fs.writeFileSync(path.join(dir, 'package.json'), JSON.stringify({
    name: 'app', version: '1.0.0', scripts: { 'test:coverage': 'node -e "process.exit(1)"' },
  }));
  const r = await sh(path.join(SCRIPTS, 'coverage-gate.sh'), { cwd: dir });
  assert.equal(r.code, 2, 'below-threshold must block with exit 2');
});

test('coverage-gate.sh: exits zero when coverage passes', async () => {
  const dir = initRepo(path.join(tmp('cov2'), 'app'));
  fs.writeFileSync(path.join(dir, 'package.json'), JSON.stringify({
    name: 'app', version: '1.0.0', scripts: { 'test:coverage': 'node -e "process.exit(0)"' },
  }));
  git(dir, 'add', '-A');
  git(dir, 'commit', '-m', 'pkg', '--no-verify');
  const r = await sh(path.join(SCRIPTS, 'coverage-gate.sh'), { cwd: dir });
  assert.equal(r.code, 0, 'passing coverage must exit 0:\n' + r.err);
  assert.match(r.out, /Coverage gate passed/);
});

// -------------------------------------------------- hooks + plugin manifests
test('hooks.json + plugin manifests: valid JSON, referenced scripts exist and are executable', () => {
  const hooks = JSON.parse(fs.readFileSync(path.join(ROOT, 'hooks', 'hooks.json'), 'utf8'));
  const plugin = JSON.parse(fs.readFileSync(path.join(ROOT, '.claude-plugin', 'plugin.json'), 'utf8'));
  const market = JSON.parse(fs.readFileSync(path.join(REPO_ROOT, '.claude-plugin', 'marketplace.json'), 'utf8'));
  assert.equal(plugin.name, 'claude-code-teams');
  assert.ok(Array.isArray(market.plugins) && market.plugins.length >= 1);
  // Local (string) sources must resolve on disk; external sources are objects
  // like {source:'github', repo:'owner/repo'} and are resolved by Claude Code
  // at install time, so only sanity-check their shape here.
  const local = market.plugins.filter((p) => typeof p.source === 'string');
  assert.ok(
    local.some((p) => p.name === 'claude-code-teams' && fs.existsSync(path.join(REPO_ROOT, p.source, '.claude-plugin', 'plugin.json'))),
    'marketplace.json must list claude-code-teams with a source resolving to its plugin.json'
  );
  for (const p of local) {
    assert.ok(fs.existsSync(path.join(REPO_ROOT, p.source)), `local plugin source must exist: ${p.source}`);
  }
  for (const p of market.plugins.filter((x) => typeof x.source === 'object')) {
    assert.equal(p.source.source, 'github', `${p.name}: only github external sources are used here`);
    assert.match(p.source.repo ?? '', /^[\w.-]+\/[\w.-]+$/, `${p.name}: repo must be owner/repo`);
  }

  const commands = [];
  for (const arr of Object.values(hooks.hooks)) {
    for (const group of arr) for (const h of group.hooks) commands.push(h.command);
  }
  assert.ok(commands.length >= 2, 'expected several hook commands');
  for (const cmd of commands) {
    const rel = cmd.replace('${CLAUDE_PLUGIN_ROOT}', '').replace(/^[/\\]/, '');
    const abs = path.join(ROOT, rel);
    assert.ok(fs.existsSync(abs), `hook script must exist: ${cmd}`);
    const first = fs.readFileSync(abs, 'utf8').split('\n')[0];
    assert.match(first, /^#!/, `hook script must have a shebang (executable): ${rel}`);
    if (process.platform !== 'win32') {
      assert.ok(fs.statSync(abs).mode & 0o111, `hook script must be executable: ${rel}`);
    }
  }
});

// ------------------------------------------------------------- kb-index.mjs
function kbFixture(dir) {
  const kb = path.join(dir, '.claude', 'knowledgebase');
  const w = (rel, body) => {
    const f = path.join(kb, rel);
    fs.mkdirSync(path.dirname(f), { recursive: true });
    fs.writeFileSync(f, body);
  };
  w('README.md', '# Example Knowledge Base\n');
  w('overview/README.md', '# Overview\n');
  w('overview/pricing-and-discounts.md', '# Pricing And Discounts\n');
  w('pages/README.md', '# Pages\n');
  w('pages/checkout.md', '# Checkout\n');
  w('pages/group-booking.md', 'no heading here\n');          // title falls back to slug
  w('pages/_wip.md', '# Draft\n');                            // underscore = hidden
  w('crm/README.md', '# CRM overview\n');                     // section label from H1
  w('assets/screenshots/hotels/search.png', 'not-really-a-png');
  return kb;
}
function kbRun(dir, args = []) {
  const r = execFileSync('node', [path.join(SCRIPTS, 'kb-index.mjs'), ...args], {
    cwd: dir, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'],
  });
  return r;
}

test('kb-index.mjs: builds nav from the KB tree, hides drafts, skips assets', () => {
  const dir = tmp('kbidx');
  const kb = kbFixture(dir);
  kbRun(dir);

  const nav = JSON.parse(fs.readFileSync(path.join(kb, 'nav.json'), 'utf8'));
  assert.equal(nav.home.title, 'Example Knowledge Base', 'home title comes from root README H1');

  const slugs = nav.sections.map((s) => s.slug);
  assert.equal(slugs[0], 'overview', 'overview must sort first — it is the read-first material');
  assert.ok(!slugs.includes('assets'), 'assets/ must never become a nav section');

  const pages = nav.sections.find((s) => s.slug === 'pages');
  const titles = pages.pages.map((p) => p.title);
  assert.ok(!titles.includes('Draft'), '_-prefixed pages must be hidden from the viewer');
  assert.ok(titles.includes('Checkout'), 'title should come from the H1');
  assert.ok(titles.includes('Group Booking'), 'title should fall back to Title Case of the slug');
  assert.equal(pages.pages.find((p) => p.slug === 'checkout').url, '/kb/pages/checkout');

  const crm = nav.sections.find((s) => s.slug === 'crm');
  assert.equal(crm.title, 'CRM overview', "section label should come from the folder README's H1");
});

test('kb-index.mjs: H1 detection ignores frontmatter and fenced code', () => {
  const dir = tmp('kbh1');
  const kb = kbFixture(dir);
  fs.writeFileSync(path.join(kb, 'pages', 'fenced.md'), '```sh\n# not a title\n```\n# Real Title\n');
  fs.writeFileSync(path.join(kb, 'pages', 'fm.md'), '---\ntitle: meta\n---\n# After Frontmatter\n');
  kbRun(dir);

  const nav = JSON.parse(fs.readFileSync(path.join(kb, 'nav.json'), 'utf8'));
  const byslug = Object.fromEntries(
    nav.sections.flatMap((s) => s.pages).map((p) => [p.slug, p.title])
  );
  assert.equal(byslug.fenced, 'Real Title', 'a # inside a code fence is not the title');
  assert.equal(byslug.fm, 'After Frontmatter', 'YAML frontmatter must be skipped');
});

test('kb-index.mjs: idempotent, --check detects drift, honours _order.json', () => {
  const dir = tmp('kbchk');
  const kb = kbFixture(dir);
  kbRun(dir);
  assert.match(kbRun(dir), /no change/, 'second run on an unchanged tree must not rewrite');

  // clean tree passes --check
  kbRun(dir, ['--check']);

  // adding a page makes nav.json stale -> --check must fail (this is the CI gate).
  // Assert on the exit code AND the reason, so this can't pass on an unrelated crash.
  fs.writeFileSync(path.join(kb, 'pages', 'brand-new.md'), '# Brand New\n');
  let drift;
  try {
    kbRun(dir, ['--check']);
    assert.fail('--check must fail once the tree has drifted from nav.json');
  } catch (e) {
    drift = e;
  }
  assert.equal(drift.status, 1, `--check must exit 1 on drift, got ${drift.status}`);
  assert.match(String(drift.stderr), /nav\.json is stale/, '--check must say why it failed');

  // ...and a plain run picks the new page up automatically
  kbRun(dir);
  const nav = JSON.parse(fs.readFileSync(path.join(kb, 'nav.json'), 'utf8'));
  assert.ok(
    nav.sections.flatMap((s) => s.pages).some((p) => p.slug === 'brand-new'),
    'a newly added .md file must appear in nav with no code change'
  );

  fs.writeFileSync(path.join(kb, '_order.json'), JSON.stringify(['pages', 'crm']));
  kbRun(dir);
  const ordered = JSON.parse(fs.readFileSync(path.join(kb, 'nav.json'), 'utf8')).sections.map((s) => s.slug);
  assert.deepEqual(ordered.slice(0, 3), ['overview', 'pages', 'crm'], '_order.json must drive section order');

  // a malformed _order.json must degrade, not explode
  fs.writeFileSync(path.join(kb, '_order.json'), 'NOT JSON');
  kbRun(dir);
});

// ---------------------------------------------------------------- kb-sync.sh
test('kb-sync.sh: refreshes nav only for KB writes, never blocks the tool call', async () => {
  const dir = tmp('kbsync');
  const kb = kbFixture(dir);
  const env = { CLAUDE_PROJECT_DIR: dir, CLAUDE_PLUGIN_ROOT: ROOT };
  const payload = (fp) => JSON.stringify({ tool_name: 'Write', tool_input: { file_path: fp } });

  // unrelated file -> no nav.json created at all
  let r = await sh(path.join(SCRIPTS, 'kb-sync.sh'), { input: payload('src/app/page.tsx'), env, cwd: dir });
  assert.equal(r.code, 0);
  assert.ok(!fs.existsSync(path.join(kb, 'nav.json')), 'a non-KB write must not trigger a nav build');

  // KB file -> nav gets built
  r = await sh(path.join(SCRIPTS, 'kb-sync.sh'), {
    input: payload('.claude/knowledgebase/pages/checkout.md'), env, cwd: dir,
  });
  assert.equal(r.code, 0, 'hook must never block the tool call');
  assert.ok(fs.existsSync(path.join(kb, 'nav.json')), 'a KB write must refresh nav.json');
  assert.match(r.err, /kb-sync/, 'should report what it did on stderr');

  // repeat -> silent, because nothing changed
  r = await sh(path.join(SCRIPTS, 'kb-sync.sh'), {
    input: payload('.claude/knowledgebase/pages/checkout.md'), env, cwd: dir,
  });
  assert.equal(r.code, 0);
  assert.equal(r.err.trim(), '', 'must stay quiet when the nav did not change');

  // project with no KB at all -> silent success, not an error
  const bare = tmp('kbbare');
  r = await sh(path.join(SCRIPTS, 'kb-sync.sh'), {
    input: payload('.claude/knowledgebase/x.md'),
    env: { CLAUDE_PROJECT_DIR: bare, CLAUDE_PLUGIN_ROOT: ROOT }, cwd: bare,
  });
  assert.equal(r.code, 0, 'a project without a KB must not error');
});

// --------------------------------------------- worktree-guard.sh regressions
// The guard must judge the FILE BEING WRITTEN, not the session cwd.
// CLAUDE_PROJECT_DIR is pinned to the primary checkout at session start, so a
// cwd-based guard blocked every legitimate write inside a linked worktree
// (reported from a real session) and let primary-checkout writes through
// whenever the session was cwd'd into a worktree.
function guardRepo(tag) {
  const base = tmp(tag);
  const repo = initRepo(path.join(base, 'repo'));
  git(repo, 'checkout', '-qb', 'develop');
  const wt = path.join(base, 'repo-worktrees', 'feature-x');
  git(repo, 'worktree', 'add', '-q', '-b', 'feature/permission-change-auto-logout', wt);
  return { repo, wt };
}
const guard = (input, env) => sh(path.join(SCRIPTS, 'worktree-guard.sh'), { input, env });
const payload = (fp) => JSON.stringify({ tool_name: 'Write', tool_input: { file_path: fp } });

test('worktree-guard.sh: allows writes inside a linked worktree even when CLAUDE_PROJECT_DIR points at the primary checkout', async () => {
  const { repo, wt } = guardRepo('grd-wt');
  // The file does not exist yet — that is the normal case for Write.
  const r = await guard(payload(path.join(wt, 'src', 'auth', 'logout.ts')), { CLAUDE_PROJECT_DIR: repo });
  assert.equal(r.code, 0, `must not block a worktree write; blocked with: ${r.err}`);
});

test('worktree-guard.sh: still blocks code writes into the primary checkout on a protected branch', async () => {
  const { repo } = guardRepo('grd-blk');
  const rel = await guard(payload('src/app.ts'), { CLAUDE_PROJECT_DIR: repo });
  assert.equal(rel.code, 2, 'relative path into primary on develop must block');
  assert.match(rel.err, /BLOCKED/);

  const abs = await guard(payload(path.join(repo, 'src', 'app.ts')), { CLAUDE_PROJECT_DIR: repo });
  assert.equal(abs.code, 2, 'absolute path into primary on develop must block');
});

test('worktree-guard.sh: blocks a primary-checkout write even when the session cwd is a worktree', async () => {
  const { repo, wt } = guardRepo('grd-hole');
  // Old cwd-based guard saw "inside a worktree" and allowed this.
  const r = await guard(payload(path.join(repo, 'src', 'sneak.ts')), { CLAUDE_PROJECT_DIR: wt });
  assert.equal(r.code, 2, 'target is the primary checkout on develop — must block regardless of cwd');
});

test('worktree-guard.sh: config/docs exemption works with Windows path separators', async () => {
  const { repo } = guardRepo('grd-win');
  // Git Bash hands over backslash paths; the exemption used to only match "/".
  const backslash = JSON.stringify({
    tool_name: 'Write',
    tool_input: { file_path: '.claude\\worktrees\\diag-probe-leader.tmp' },
  });
  const r = await guard(backslash, { CLAUDE_PROJECT_DIR: repo });
  assert.equal(r.code, 0, `.claude/ must stay exempt with backslashes; blocked with: ${r.err}`);

  for (const fp of ['.claude/settings.json', 'plans/x.md', 'CLAUDE.md', 'README.md']) {
    const ok = await guard(payload(fp), { CLAUDE_PROJECT_DIR: repo });
    assert.equal(ok.code, 0, `${fp} must stay exempt`);
  }
});

test('worktree-guard.sh: unparseable payload falls back to guarding the session dir', async () => {
  const { repo } = guardRepo('grd-fb');
  // No file_path at all -> must not silently disable the guard.
  const r = await guard(JSON.stringify({ tool_name: 'Write', tool_input: {} }), { CLAUDE_PROJECT_DIR: repo });
  assert.equal(r.code, 2, 'a payload with no path must fall back to the conservative check');
});

test('worktree-guard.sh: ignores files outside any git repo', async () => {
  const { repo } = guardRepo('grd-nogit');
  const outside = tmp('grd-outside');
  const r = await guard(payload(path.join(outside, 'notes.txt')), { CLAUDE_PROJECT_DIR: repo });
  assert.equal(r.code, 0, 'a non-repo target is none of the guard’s business');
});
