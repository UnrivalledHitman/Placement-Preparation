# Hints
%Read only the hint for the exercise you are stuck on

## Part 1 hints

| Exercise | Hint |
|---|---|
| X1.1 | Count blobs, trees (one per directory) and commits; unchanged objects are reused |
| X1.2 | A tree entry is `mode name\0` followed by the 20 raw bytes of the hash; subtrees use mode `40000` |
| X1.3 | A commit's content includes the tree, parents, author and committer lines with timestamps, and the message |
| X1.4 | The HEAD reflog remembers the detached commits |
| X1.5 | Commits only on your side versus only on the remote's side; merge, rebase, or reset |

## Part 2 hints

| Exercise | Hint |
|---|---|
| X2.1 | `git reset HEAD~1` keeps the changes in the working tree |
| X2.2 | First letter: index versus HEAD; second letter: working tree versus index |
| X2.3 | Both sides inserted text at the same position relative to the base |
| X2.4 | One is a strategy option for conflicting hunks; the other is a whole merge strategy |
| X2.5 | The branch's original commits are already ancestors of `main`; the revert removed their effect |

## Part 3 hints

| Exercise | Hint |
|---|---|
| X3.1 | `GIT_SEQUENCE_EDITOR` can be any command that rewrites the todo file |
| X3.2 | Create the branch at the current commit first, then move `main` back |
| X3.3 | `ORIG_HEAD` or the branch's reflog entry from before the rebase |
| X3.4 | `git rm --cached`, `.gitignore`, `git commit --amend`; a pushed secret must be rotated |
| X3.5 | Exit code 125 from the test script means "skip this commit" |

## Part 4 hints

| Exercise | Hint |
|---|---|
| X4.1 | Supported versions need release branches; frequent deploys need trunk-based development |
| X4.2 | Summary in the imperative; body explains why; PR adds testing and risk |
| X4.3 | `git branch --contains`, `git tag --contains`, and the `-x` line for copies |
| X4.4 | Line endings: `.gitattributes` and `git add --renormalize` |
| X4.5 | Atomic cross-service changes and shared tooling versus independence and access control |
