# Chapter 4: Merging and Conflicts
%Fast-forward and three-way merges, merge bases, what a conflict is inside the index, and conflicts Git cannot see

## 4.1 Fast-forward and three-way merges

If the current branch has not moved since the other branch split off, merging just moves the branch pointer forward: a **fast-forward**, with no new commit. If both branches have new commits, Git performs a **three-way merge** using the **merge base** (the best common ancestor) and records a **merge commit** with two parents.

```git run A fast-forward, then a true merge with two parents
git init -q shop && cd shop
printf 'tea\n' > menu.txt && git add . && git commit -q -m "Menu"
git switch -q -c coffee
printf 'tea\ncoffee\n' > menu.txt && git commit -q -am "Add coffee"
git switch -q main
git merge coffee | head -2
git switch -q -c prices
printf 'tea 10\n' > prices.txt && git add . && git commit -q -m "Prices"
git switch -q main
printf 'Open 9-5\n' > hours.txt && git add . && git commit -q -m "Hours"
echo "merge base: $(git merge-base main prices | cut -c1-7)"
git merge -q --no-edit prices
git log --oneline --graph
git cat-file -p HEAD | grep parent
```

The first merge printed `Fast-forward`; the second created a commit with **two** `parent` lines. Teams that want every feature visible as a merge commit use `git merge --no-ff`, which creates a merge commit even when a fast-forward was possible.

## 4.2 What a conflict is

A three-way merge compares each file's base, "ours" and "theirs" versions. Changes to different parts merge automatically; changes to the **same lines** conflict. During a conflict the index holds all three versions of the file as **stages** 1 (base), 2 (ours) and 3 (theirs), and the working-tree file contains conflict markers.

```git run A conflict, seen in the index and in the file, then resolved
git init -q shop && cd shop
git config merge.conflictStyle zdiff3
printf 'tea 10\ncoffee 20\n' > prices.txt && git add . && git commit -q -m "Prices"
git switch -q -c raise
printf 'tea 12\ncoffee 20\n' > prices.txt && git commit -q -am "Raise tea"
git switch -q main
printf 'tea 11\ncoffee 20\n' > prices.txt && git commit -q -am "Tea at 11"
git merge raise || echo "exit status $?"
git status --short
git ls-files --stage
cat prices.txt
printf 'tea 12\ncoffee 20\n' > prices.txt          # the agreed price
git add prices.txt && git commit -q --no-edit
git log --oneline --graph
```

`UU` means both sides modified the file. The `zdiff3` conflict style shows the **base** (`||||||| `) between the two sides, which makes the right resolution much easier to see: the base said 10, we said 11, they said 12. Resolving means writing the correct content and `git add`, which collapses the three stages back to one; `git merge --abort` would instead return to the state before the merge.

| Situation | Command |
|---|---|
| Take our version of a conflicted file | `git checkout --ours file` (or `git restore --ours file`) |
| Take their version | `git checkout --theirs file` |
| Prefer one side for every conflicting hunk in the merge | `git merge -X ours branch` (not the same as `-s ours`, which ignores the other branch entirely) |
| Reuse a resolution you already made once | `git config rerere.enabled true` |

> TRAP: In a **rebase**, "ours" and "theirs" are swapped: "ours" is the branch you are rebasing onto, "theirs" is your commit being replayed. Read the conflict markers' labels rather than trusting memory.

## 4.3 Conflicts Git cannot see

Git merges text, not meaning. Two changes can merge cleanly and still break the program: one branch renames a function, the other adds a new call to its old name.

```git run A merge with no conflict that breaks the program
git init -q shop && cd shop
printf 'greet() { echo "Welcome"; }\n' > lib.sh
printf '. ./lib.sh\ngreet\n' > main.sh
git add . && git commit -q -m "Greeting"
git switch -q -c rename
printf 'welcome() { echo "Welcome"; }\n' > lib.sh
printf '. ./lib.sh\nwelcome\n' > main.sh
git commit -q -am "Rename greet to welcome"
git switch -q main
printf '. ./lib.sh\ngreet\necho "tea 10, coffee 20"\n' > prices.sh
git add . && git commit -q -m "Add a price list that greets first"
git merge --no-edit rename | tail -3
bash main.sh
bash prices.sh || echo "exit status $?"
```

Git reported a clean merge: the branches touched different files. Yet `prices.sh` calls `greet`, which the other branch renamed, so the merged program fails with `greet: command not found`, and, being a shell script without `set -e`, carries on and exits successfully, so nothing would even notice without a test that checks the output. The defence is not Git but **tests in CI on the merged result** (and merge queues that test each change against the latest `main` before it lands; Chapter 8).

## 4.4 Practical lessons

- Fast-forward moves a pointer; a three-way merge uses the merge base and records a commit with two parents.
- During a conflict the index holds base, ours and theirs as stages 1–3; resolving is writing the result and `git add`.
- Use the `zdiff3` conflict style to see the base; remember that ours and theirs swap during a rebase.
- A clean merge is not a correct program: run tests on the merged result.

# Chapter 5: Rewriting History
%Rebase, interactive rebase, cherry-pick, amend, revert, and the rules for rewriting shared history safely

## 5.1 Rebase replays commits

`git rebase main` (on a feature branch) takes the commits that are on the feature branch but not on `main`, and **replays** them one by one on top of `main`. The replayed commits have the same changes and messages but different parents, so they are **new commits with new hashes**; the old ones become unreachable.

```git run Rebasing a feature branch: same changes, new commits
git init -q shop && cd shop
printf 'tea\n' > menu.txt && git add . && git commit -q -m "Menu"
git switch -q -c feature
printf 'cake\n' > desserts.txt && git add . && git commit -q -m "Desserts"
printf 'cake\npie\n' > desserts.txt && git commit -q -am "More desserts"
git switch -q main
printf 'Open 9-5\n' > hours.txt && git add . && git commit -q -m "Hours"
echo "before:"; git log --oneline --graph --all
git switch -q feature && git rebase -q main
echo "after:"; git log --oneline --graph --all
```

Before the rebase, history forked; afterwards it is a straight line and the feature commits have new hashes (`Desserts` was rewritten because its parent changed, which changes the commit's content and therefore its name). Merging `feature` into `main` is now a fast-forward.

| | Merge | Rebase |
|---|---|---|
| History | True record, including when work diverged | Linear, as if work happened in sequence |
| Commits | Unchanged; adds a merge commit | Rewritten with new hashes |
| Conflicts | Resolved once, in the merge commit | Possibly once per replayed commit |
| Safe on shared branches | Yes | No: others still have the old commits |

## 5.2 Interactive rebase: cleaning up before review

`git rebase -i` lets you reorder, squash, edit and reword commits. A common flow is to make quick `fixup!` commits while working and fold them in before opening a pull request. (The editor is replaced here by `GIT_SEQUENCE_EDITOR=true`, which accepts the plan Git proposes.)

```git run Fixup commits folded in with autosquash
git init -q shop && cd shop
printf 'tea\n' > menu.txt && git add . && git commit -q -m "Menu"
printf 'def total(items):\n    return sum(items)\n' > cart.py
git add . && git commit -q -m "Add cart total"
printf '# Cart\n' > CART.md && git add . && git commit -q -m "Document cart"
printf 'def total(items):\n    return sum(i for i in items if i > 0)\n' > cart.py
git commit -q -a --fixup HEAD~1                       # a fix belonging to "Add cart total"
git log --oneline
GIT_SEQUENCE_EDITOR=true git rebase -q -i --autosquash HEAD~3
echo "after autosquash:"; git log --oneline
git show --stat --format=%s HEAD~1 | head -3
```

`--fixup HEAD~1` created a commit titled `fixup! Add cart total`; `--autosquash` moved it after its target and marked it `fixup`, so the final history has a single, correct "Add cart total" commit. Reviewers see clean, logical commits instead of "fix typo" noise.

| Instruction | Effect |
|---|---|
| `pick` | Keep the commit |
| `reword` | Keep it, edit the message |
| `edit` | Stop after it to amend or split it |
| `squash` / `fixup` | Combine with the previous commit (keeping / discarding this message) |
| `drop` | Remove it |
| `exec cmd` | Run a command (for example the tests) after the previous step |

## 5.3 Cherry-pick, amend and revert

```git run A hotfix cherry-picked to a release branch, then a bad commit reverted
git init -q shop && cd shop
printf 'tea 10\n' > prices.txt && git add . && git commit -q -m "Prices"
git branch release-1.0
printf 'tea 10\ncake 30\n' > prices.txt && git commit -q -am "Add cake"
printf 'tea 10\ncake 30\nfee 999\n' > prices.txt && git commit -q -am "Add service fee"
printf 'Allergens: nuts\n' > allergens.txt
git add . && git commit -q -m "Fix: allergen notice"
git switch -q release-1.0
git cherry-pick -x main | head -1
git log --oneline
git show -s --format=%b HEAD
git switch -q main
git revert --no-edit HEAD~1 | head -1
git log --oneline
cat prices.txt
```

`cherry-pick` copied the allergen fix (a new commit with the same change) onto the release branch; `-x` records the original hash in the message so the link is traceable. On `main`, `revert` created a **new commit that undoes** "Add service fee": history is preserved, which is the right way to undo a commit that others may already have. `git commit --amend` replaces the last commit (new hash), so like rebase it is for commits not yet shared.

## 5.4 Rewriting shared history safely

The rule: **do not rewrite commits that others have based work on.** If you must force-push your own branch after a rebase, use `--force-with-lease`, which refuses if the remote branch has moved since you last fetched it, so you cannot silently delete a teammate's commits.

```git run force-with-lease refuses to overwrite a teammate's push
git init -q --bare server.git
git clone -q server.git asha 2>/dev/null && cd asha
printf 'v1\n' > f.txt && git add . && git commit -q -m "One" && git push -q origin main
git switch -q -c feature
printf 'a\n' > a.txt && git add . && git commit -q -m "Asha's work"
git push -q -u origin feature
cd .. && git clone -q server.git ravi && cd ravi && git switch -q feature
printf 'r\n' > r.txt && git add . && git commit -q -m "Ravi's fix"
git push -q origin feature
cd ../asha
git commit -q --amend -m "Asha's work (reworded)"          # rewrite after Ravi pushed
git push --force-with-lease origin feature 2>&1 | grep -E 'rejected|stale' || true
git fetch -q && git log --oneline --graph --all | head -6
```

Asha's lease failed because `origin/feature` in her repository was out of date: Ravi had pushed since. A plain `--force` would have deleted Ravi's commit from the server. After fetching she can see his work and rebase onto it before pushing.

## 5.5 Practical lessons

- Rebase replays commits as new commits; it gives linear history but must not be used on shared commits.
- Interactive rebase with `fixup` and `--autosquash` cleans a branch before review.
- Cherry-pick copies a change (use `-x`); revert undoes a shared commit with a new commit; amend rewrites the last one.
- Force-push only your own branches, always with `--force-with-lease`.
