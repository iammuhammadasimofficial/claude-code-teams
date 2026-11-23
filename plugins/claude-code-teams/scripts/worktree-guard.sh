#!/usr/bin/env bash
# PreToolUse guard: block file edits in the PRIMARY checkout on protected
# branches. Linked worktrees are always allowed. Exit 2 = block (stderr goes
# back to the agent).
#
# The guard judges THE FILE BEING WRITTEN, not the session's cwd. This matters:
# CLAUDE_PROJECT_DIR is fixed at session start to the primary checkout, so an
# agent working correctly inside a linked worktree still reports the primary
# checkout's branch. Trusting the env var blocked every legitimate write in a
# worktree, and let writes into the primary checkout through whenever the
# session happened to be cwd'd into a worktree. Resolving from the target path
# fixes both directions.
set -u
INPUT=$(cat)

# --- extract the target path from the payload -------------------------------
# Write/Edit/MultiEdit use file_path; NotebookEdit uses notebook_path.
# Pure sed so this stays dependency-free — it runs on every single edit.
raw=$(printf '%s' "$INPUT" | sed -nE \
  's/.*"(file_path|notebook_path)"[[:space:]]*:[[:space:]]*"([^"]*)".*/\2/p' | head -n1)

# Unescape the JSON string, then normalise Windows separators so one set of
# patterns matches on Git Bash and POSIX alike.
path=$(printf '%s' "$raw" | sed -e 's/\\\\/\\/g' -e 's/\\"/"/g' -e 's/\\\//\//g' -e 's/\\/\//g')

PROJECT="${CLAUDE_PROJECT_DIR:-$PWD}"
PROJECT=$(printf '%s' "$PROJECT" | sed 's/\\/\//g')

# --- decide which directory to interrogate ---------------------------------
is_abs() {
  case "$1" in
    /*) return 0 ;;          # POSIX absolute
    [A-Za-z]:/*) return 0 ;; # Windows drive-absolute (D:/...)
    *) return 1 ;;
  esac
}

# Walk up to the nearest directory that exists — the file itself usually does
# not yet (that is the whole point of a Write).
nearest_dir() {
  d="$1"; prev=""
  while [ -n "$d" ] && [ "$d" != "$prev" ] && [ ! -d "$d" ]; do
    prev="$d"; d=$(dirname "$d")
  done
  [ -d "$d" ] && printf '%s' "$d"
}

DIR=""
if [ -n "$path" ]; then
  if is_abs "$path"; then abs="$path"; else abs="$PROJECT/$path"; fi
  DIR=$(nearest_dir "$(dirname "$abs")")
fi
# No usable path -> fall back to the session dir. Conservative on purpose: the
# guard exists to protect the primary checkout, so an unparseable payload must
# not silently disable it.
[ -n "$DIR" ] || DIR="$PROJECT"

git -C "$DIR" rev-parse --is-inside-work-tree >/dev/null 2>&1 || exit 0

# --- linked worktree? then it is always fine -------------------------------
GD=$(git -C "$DIR" rev-parse --absolute-git-dir 2>/dev/null) || exit 0
GCD=$(git -C "$DIR" rev-parse --git-common-dir 2>/dev/null) || exit 0
# --git-common-dir can come back relative; resolve it before comparing.
case "$GCD" in
  /*|[A-Za-z]:/*) ;;
  *) GCD=$(cd "$DIR" && cd "$GCD" 2>/dev/null && pwd) || GCD="$GD" ;;
esac
[ "$GD" != "$GCD" ] && exit 0

# --- primary checkout: allow docs/config, block code on protected branches --
# Matched against the normalised path, so backslash separators work too.
case "/$path" in
  */.claude/*|*/plans/*|*/knowledge-base/*|*/prototypes/*|*/CLAUDE.md|*/README.md) exit 0 ;;
esac

BR=$(git -C "$DIR" branch --show-current 2>/dev/null)
case "$BR" in
  main|master|develop|staging|production)
    echo "BLOCKED by git-worktree-discipline: '$BR' in the primary checkout is read-only. Create a worktree first: bash \${CLAUDE_PLUGIN_ROOT}/scripts/worktree.sh new <feature>  — then work there." >&2
    exit 2 ;;
esac
exit 0
