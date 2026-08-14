---
name: document-symbols
description: Add JSDoc comments to undocumented top-level symbols (classes, interfaces, types, functions, consts, and class members) in files changed on the current branch. Use when the user asks to document, add JSDoc to, or write doc comments for recently written or changed code in this repo.
---

# Document top-level symbols

Add JSDoc comments to top-level symbols in this repo that don't have one yet. This skill only
*adds* comments — it never rewrites or reformats a comment that already exists, even if that
comment doesn't follow the rules below.

## 1. Find the files in scope

Scope is the set of files changed on the current branch, not the whole repo. Build the file list
from the union of:

- Uncommitted changes: `git diff --name-only HEAD` plus untracked new files from
  `git ls-files --others --exclude-standard`.
- Committed changes not yet on `main`: `git diff --name-only $(git merge-base main HEAD)...HEAD`
  (skip this if the current branch *is* `main`).

Filter that list to `*.ts`, `*.tsx`, and `*.d.ts` files under `src/`, and drop anything under a
`__tests__/` directory or matching `*.test.ts`/`*.test.tsx`. Deleted files obviously drop out too.

If the resulting list is empty, say so and stop — there's nothing to document.

## 2. Find the top-level symbols in each file

A "top-level symbol" is any of the following, declared directly at module scope (not nested
inside a function body):

- `class` declarations
- `interface` declarations
- `type` aliases
- `function` declarations, and `const`/`let` bindings whose value is a function or arrow function
- Every other `const` (and `let`) binding
- Every member of a class found above: each method (including the constructor), each getter and
  setter, and each field — regardless of whether it's `public`, `private`, or unmarked. (This repo
  already documents private methods like `_reloadMaps` in
  [config.ts](../../../src/apis/audio/utils/config.ts) — keep doing that.)

Out of scope: anything declared inside a function body (local helpers, local consts), and
destructured bindings that just alias an already-documented import.

For each symbol, check whether it's immediately preceded by a `/** ... */` block. If it already
has one, leave it alone — move on. If it doesn't, decide whether it needs one (step 4) and, if so,
write it (step 3).

## 3. Comment syntax

Always use the multiline block form, even for a one-line description:

```ts
/**
 * Comment goes here.
 */
export const foo = 7
```

Never use `//` or a single-line `/** ... */` for symbol documentation.

- Reference other symbols with `{@link SymbolName}` — never a bare name in backticks and never a
  markdown link. Use the short symbol name (`{@link AudioConfigStorage}`), not an import path.
- Use `@param name` and `@returns` on functions when the parameter or return value needs
  explanation beyond its type — skip the tag entirely for a parameter that's already
  self-explanatory from its name and type (same judgment call as step 4).
- If a class member's job is to just satisfy a parent class or interface with no new behavior to
  explain, `@inheritdoc` is this repo's existing convention (see the getters/setters in
  [config.ts](../../../src/apis/audio/utils/config.ts)) — use it instead of repeating the parent's
  description.

## 4. What to write

**No outside jargon.** This is the most important rule. Describe things using words already used
in this codebase — "group", "board", "sound", "effect", "sequence", "config", and so on — not
general software vocabulary imported from elsewhere (design-pattern names, framework terms from
stacks this project doesn't use, generic CS theory). If a word wouldn't already make sense to
someone who's only ever read this repo, don't use it.

- Bad: "Implements the Singleton pattern to provide a memoized accessor for the audio config."
- Good (this is the real comment already in the repo):
  "The singleton instance of {@link AudioConfigStorage} used throughout the audio API."

**Wrap at 100 characters.** Every line of comment text — including the leading ` * ` — should be
reflowed to sit close to the 100-character mark, not wrapped short out of habit and not left as
one long unbroken line. Write the full description first, then hard-wrap it evenly.

**Don't restate the name, and skip symbols that don't need a comment at all.** If the symbol's
name and type signature already tell the reader everything the comment would, don't add one —
this repo's own convention (see `CLAUDE.md`) is that comments must add real information, not
restate what's already obvious. A comment that only paraphrases the identifier is worse than no
comment.

- Bad: `/** The group ID. */` above `export type GroupID = ...`
- Good (the real comment already in the repo): "An ID that refers to a particular sound group."

When in doubt, look at neighboring comments already in the file being edited — this repo already
documents most of its public API surface (see
[groups.d.ts](../../../src/apis/audio/types/groups.d.ts) and
[config.ts](../../../src/apis/audio/utils/config.ts)), so match the level of detail already
established there rather than inventing a new style.

## 5. After writing

Run `npm run typecheck` to confirm nothing was broken (a stray `/**` can occasionally shift
what TypeScript associates a comment with). This skill doesn't touch logic, so no test run is
needed unless files were changed for other reasons too.
