# How to use this practice book
%20 exercises matching the Git Internals and Team Workflows guide, with hints kept separate and every command executed

Each part matches chapters of the **Git Internals and Team Workflows** guide. Most exercises are scenarios: a repository gets into a state that happens in real teams, and you have to explain it, predict what Git will do, or get out of it safely. Every solution was run in a fresh repository with the same configuration as the guide (author Asha Rao, a fixed clock), so the hashes shown are reproducible.

| Type | What you do |
|---|---|
| Code | Run commands in a scratch repository to reach the goal |
| Concept | Explain what Git does and why |
| Debug | Find why Git behaved unexpectedly and fix it |
| Design | Choose a workflow or repository structure and justify it |

**Marking scheme.** Mark ✓ (solved alone), ~ (with the hint) or ✗ (needed the solution). For Code exercises, ✓ also requires that you checked the result with `git log --graph`, `git status` or `git cat-file` rather than assuming it. Redo every ~ and ✗ a week later.

| Part | Guide chapters | Topic | Exercises |
|---|---|---|---|
| 1 | 1–2 | Objects, refs and remotes | 5 |
| 2 | 3–4 | The index and merging | 5 |
| 3 | 5–6 | Rewriting history and recovery | 5 |
| 4 | 7–8 | Configuration, workflows and teams | 5 |

# Exercises

## Part 1: Objects, refs and remotes

**X1.1 · Easy · Concept · Count the objects.** A new repository's first commit contains `README.md`, `src/app.py` and `src/util.py` (all different contents). How many objects does the commit create, of which types? How many new objects does a second commit that changes only `src/util.py` create?

**X1.2 · Medium · Code · A tree hash by hand.** Compute, without Git, the hash of the root tree of the guide's first example (`README.md` containing `# Shop\n` and `src/app.py` containing `print("hi")\n`), and check it against the guide's `a4c85bd`.

**X1.3 · Medium · Concept · What changes a commit's hash?** Which of these give a commit a different hash: changing a file; rewording the message; the same commit made a minute later; a different parent with the same tree; amending with no changes at all? Verify the last two.

**X1.4 · Medium · Code · Lost on a detached HEAD.** You checked out a tag, made two commits, then switched back to `main`. Recover both commits onto a branch called `spike`.

**X1.5 · Medium · Concept · Ahead 2, behind 3.** `git status` says `Your branch and 'origin/main' have diverged, and have 2 and 3 different commits each`. Explain what each number means and list three ways to proceed, with their effects on history.

## Part 2: The index and merging

**X2.1 · Easy · Code · Split a commit.** Your last (unpushed) commit changes `api.py` and `README.md` but should have been two commits. Split it.

**X2.2 · Medium · Code · Read the status codes.** Predict the two-letter `git status --short` code of each file after a given sequence of edits, adds and deletions, then check.

**X2.3 · Medium · Code · A conflict where both sides are right.** Two branches each append a different item to the end of `menu.txt`. Merge them, keeping both items, and explain why appending at the same place conflicts.

**X2.4 · Medium · Concept · `-X ours` versus `-s ours`.** Explain the difference and demonstrate on a merge where the other branch changes one line in conflict and adds a new file.

**X2.5 · Medium · Debug · "Already up to date", but the feature is missing.** A feature branch was merged into `main`, then the merge was reverted because of a bug. After fixing the bug on the branch, merging it again brings back only the fix, not the feature. Explain and fix.

## Part 3: Rewriting history and recovery

**X3.1 · Medium · Code · Reorder and drop.** On a private branch with commits A, B, C, D (oldest first), produce A, C, B with D removed, without opening an editor.

**X3.2 · Medium · Code · Committed to the wrong branch.** You made three commits on `main` (not pushed) that belong on a feature branch. Move them to a new branch `feature/receipts` and return `main` to where `origin/main` is.

**X3.3 · Hard · Code · Undo a bad rebase.** A rebase finished but the result is wrong (you resolved conflicts badly). Return the branch exactly to its state before the rebase.

**X3.4 · Medium · Code · A secret in the last commit.** You committed `.env` containing an API key, not yet pushed. Remove it from the commit, keep the file locally but ignored, and say what you would do if it had been pushed.

**X3.5 · Medium · Code · Bisect with untestable commits.** Some commits in the range do not build. Make `git bisect run` skip them and still find the first bad commit.

## Part 4: Configuration, workflows and teams

**X4.1 · Medium · Design · Pick a workflow.** Choose and justify a branching strategy for: (a) a mobile banking app released monthly with the last two versions supported; (b) a SaaS back end deploying 20 times a day; (c) an open-source library with outside contributors.

**X4.2 · Easy · Concept · A commit message and a PR description.** Write both for this change: the password-reset link expired after 15 minutes, users on slow e-mail providers often received it too late, so the expiry becomes 60 minutes and the link becomes single-use.

**X4.3 · Medium · Code · Which releases contain the fix?** A security fix lands on `main` and is cherry-picked to `release/1.4` and `release/1.5`. Show which branches and tags contain it, including the cherry-picked copies.

**X4.4 · Medium · Debug · Every line changed.** A Windows teammate's commit shows every line of a file as changed although they edited one line. Diagnose and fix it for the whole team.

**X4.5 · Hard · Design · Monorepo or polyrepo?** An organisation with 200 engineers and 40 services is deciding between one repository and one per service. Compare and recommend.
