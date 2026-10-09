# Chapter 8: Team Workflows and Code Review
%Branching strategies, how pull requests are merged, commit messages, review practice and repository rules

## 8.1 Branching strategies

| Strategy | How it works | Suits | Costs |
|---|---|---|---|
| **Trunk-based development** | Everyone integrates small changes into `main` at least daily; unfinished features hidden behind **feature flags**; releases cut from `main` | Teams with strong CI and continuous delivery | Needs discipline, fast tests and flag management |
| **GitHub flow** | Short-lived feature branches, pull request, review, merge to `main`, deploy | Web services deploying often | Long-lived branches creep back if reviews are slow |
| **GitFlow** | `develop` plus `feature/*`, `release/*`, `hotfix/*` branches and a `main` holding releases | Software shipped in versions (installed apps, libraries with several supported releases) | Many long-lived branches, painful merges, slow integration |
| **Release branches** | `main` keeps moving; `release/2.3` is cut for stabilisation; fixes land on `main` and are cherry-picked | Products supporting several versions | Cherry-pick discipline (`-x`) and tracking which fixes went where |

The common thread in the research behind DevOps metrics (the DORA reports) is that **short-lived branches and frequent integration** correlate with better delivery performance. The reason is mechanical, as the simulation below shows: the longer a branch lives, the more of the code it touches changes underneath it.

```python run How conflicts grow with branch lifetime
import random

rnd = random.Random(8)
files, team, changes_per_day, files_per_change = 400, 12, 2, 3
def overlap(days):
    mine = set(rnd.sample(range(files), files_per_change * 2 * days))     # my branch's files
    theirs = set()
    for _ in range(team * changes_per_day * days):                         # merged meanwhile
        theirs.update(rnd.sample(range(files), files_per_change))
    return len(mine & theirs)

print('branch age   files I touched   also changed on main meanwhile')
for days in [1, 3, 7, 14, 30]:
    trials = [overlap(days) for _ in range(200)]
    touched = files_per_change * 2 * days
    print(f'{days:>4} days {touched:>14} {sum(trials) / len(trials):>22.1f}')
```

A one-day branch shares about one file with what landed meanwhile; a month-old branch collides with most of the files it touched, and each of those is a potential conflict to resolve by someone who no longer remembers the context. Integration pain grows faster than linearly with branch age, which is the practical argument for trunk-based development.

## 8.2 How pull requests are merged

Hosting platforms offer three ways to land a pull request, and each leaves different history:

```git run Merge commit, squash and rebase-merge of the same two-commit branch
mk() {
  rm -rf "$1" && git init -q "$1" && cd "$1"
  printf 'tea\n' > menu.txt && git add . && git commit -q -m "Menu"
  git switch -q -c feature
  printf 'cake\n' > desserts.txt && git add . && git commit -q -m "Add desserts"
  printf 'cake\npie\n' > desserts.txt && git commit -q -am "Add pie"
  git switch -q main
  printf 'Open 9-5\n' > hours.txt && git add . && git commit -q -m "Hours"
}
mk merged;  git merge -q --no-ff --no-edit feature
echo "merge commit:";  git log --oneline --graph; cd ..
mk squashed; git merge -q --squash feature > /dev/null
git commit -q -m "Add desserts (#12)"
echo "squash:";  git log --oneline --graph; cd ..
mk rebased; git switch -q feature && git rebase -q main
git switch -q main && git merge -q --ff-only feature
echo "rebase and merge:"; git log --oneline --graph
```

| Method | History on `main` | Pros | Cons |
|---|---|---|---|
| Merge commit | All branch commits plus a merge commit | Complete record; `git log --first-parent` shows one entry per PR | Noisy graph if branch commits are messy |
| Squash | One commit per PR | Clean, easy to revert a whole feature | Loses individual commits; the branch's commits are not "merged" from Git's point of view |
| Rebase and merge | Branch commits replayed linearly | Linear history with fine-grained commits | New hashes; every commit should build and pass tests |

## 8.3 Commit messages

A good commit message lets someone running `git log` or `git blame` a year later understand **why** a change was made.

```text
Reject negative quantities in the cart                     <- imperative summary, <= 50 chars

The checkout endpoint accepted quantity = -1, which produced a negative
total and a refund through the payment provider. Validate quantities at
the API boundary and return 400 with a clear message.

Fixes: #482                                                 <- trailers for tools
```

**Conventional Commits** (`feat:`, `fix:`, `refactor:`, `docs:`, `feat!:` for breaking changes) add a machine-readable prefix that tools use to generate changelogs and choose the next **semantic version** (MAJOR for breaking changes, MINOR for features, PATCH for fixes).

## 8.4 Code review

| As an author | As a reviewer |
|---|---|
| Keep pull requests small (a few hundred lines); split refactoring from behaviour changes | Review within hours, not days: slow reviews create long-lived branches |
| Write a description: what, why, how it was tested, screenshots for UI | Check correctness, tests, readability, security and operability before style |
| Self-review the diff before requesting review | Ask questions rather than issue orders; explain the reason behind requests |
| Make each commit build and tell a story (interactive rebase helps) | Distinguish blocking issues from suggestions ("nit:") |
| Respond to every comment; resolve disagreements with data or a call | Approve when it is better than before and safe, not when it is perfect |

Automation removes the mechanical part of review: formatters and linters in CI, required status checks, and bots for dependency updates. The Senior Engineer Handbook (Chapter 3) covers review as a way of raising a team's quality.

## 8.5 Repository rules

| Rule | Purpose |
|---|---|
| Protected `main`: no direct pushes, no force pushes, required reviews | Every change is reviewed and history is never rewritten |
| Required status checks (build, tests, lint, security scan) | Nothing merges red |
| Merge queue | Each PR is tested against the latest `main` plus the PRs ahead of it, preventing "green PR, red main" from semantic conflicts (Chapter 4.3) |
| `CODEOWNERS` | Changes to sensitive paths (payments, infrastructure) need review by the owning team |
| Signed commits and tags | Prove who created a commit or release |
| Secret scanning and push protection | Block credentials before they reach the server |

## 8.6 Releases and changelogs from tags

Annotated tags mark releases, and the commits between two tags are the release's contents. With Conventional Commit prefixes, the changelog can be generated rather than written.

```git run A changelog between two release tags
git init -q shop && cd shop
printf 'tea\n' > menu.txt && git add . && git commit -q -m "feat: menu with tea"
git tag -a v1.0.0 -m "Release 1.0.0"
for msg in "feat: add coffee" "fix: correct tea price" "docs: opening hours" \
           "feat!: new menu format"; do
  printf '%s\n' "$msg" >> changes.txt && git add . && git commit -q -m "$msg"
done
git log --format='%s' v1.0.0..HEAD | sort
echo "breaking changes: $(git log --format=%s v1.0.0..HEAD | grep -c '!:')"
echo "feat commits:     $(git log --format=%s v1.0.0..HEAD | grep -c '^feat')"
git tag -a v2.0.0 -m "Release 2.0.0"
git describe --tags
git shortlog -sn v1.0.0..v2.0.0
```

A breaking change (`feat!:`) means the next version is **2.0.0** under semantic versioning, not 1.1.0. Release tooling (semantic-release, release-please) reads exactly these messages to pick the version and write the notes.

## 8.7 Practical lessons

- Prefer short-lived branches and frequent integration; conflicts grow quickly with branch age.
- Choose a PR merge method deliberately: merge commits keep everything, squash keeps `main` simple, rebase keeps it linear.
- Commit messages explain why; Conventional Commits enable changelogs and semantic versions.
- Small pull requests, fast reviews and protected branches with required checks keep `main` healthy.

# Chapter 9: Question Bank and Cheat Sheet
%Interview questions with the core of a good answer, and one-page reminders

## 9.1 Internals

| Question | Core of a good answer |
|---|---|
| How does Git store a file? | As a blob named by the SHA-1 of a header plus its content, zlib-compressed; names and modes live in trees |
| Does Git store diffs? | No: commits are snapshots (a root tree); unchanged objects are shared; packfiles add delta compression as storage optimisation |
| What is in a commit object? | Tree hash, parent hash(es), author and committer with timestamps, message; its hash covers all of it |
| What is a branch? | A ref: a file containing a commit hash, moved forward by each commit |
| What is HEAD? Detached HEAD? | The current branch (symbolic ref); detached means HEAD names a commit directly, so new commits belong to no branch |
| Lightweight versus annotated tag? | A ref versus a tag object with tagger, date, message and optional signature |
| What is the index? | The staging area: the snapshot (path → blob) that the next commit will record |

## 9.2 Everyday operations

| Question | Core of a good answer |
|---|---|
| Fetch versus pull? | Fetch updates remote-tracking refs only; pull fetches and then merges or rebases |
| Soft, mixed and hard reset? | All move the branch; mixed also resets the index; hard also resets the working tree |
| Merge versus rebase? | Merge preserves history with a merge commit; rebase replays commits as new ones for linear history; never rebase shared commits |
| Fast-forward merge? | The branch pointer moves forward because no divergence exists; no merge commit |
| How do you undo a pushed commit? | `git revert`: a new commit that reverses it; do not rewrite shared history |
| How do you combine commits before review? | Interactive rebase with squash/fixup, or `--fixup` plus `--autosquash` |
| What does cherry-pick do? | Applies the change of a commit as a new commit on the current branch (`-x` records the source) |
| Why use `--force-with-lease`? | It refuses to overwrite remote work you have not seen, unlike `--force` |

## 9.3 Recovery, scale and teams

| Question | Core of a good answer |
|---|---|
| I ran `reset --hard`; is my work lost? | Committed work: no, find it in the reflog (`HEAD@{1}`); staged work: recoverable as blobs via `fsck`; unstaged edits: lost |
| How do you find which commit introduced a bug? | `git bisect`, ideally `bisect run` with a test script; about log₂(n) steps |
| How do you resolve a conflict? | Understand both sides and the base (`zdiff3`), write the correct result, test, `git add`, continue |
| How do you remove a committed secret? | Rotate it first; then rewrite history with `git filter-repo` and force-push, knowing clones may keep it |
| How do you handle a huge repository? | Shallow, partial and sparse clones, LFS for binaries, `fsmonitor`, monorepo tooling |
| Trunk-based or GitFlow? | Trunk-based with feature flags for continuous delivery; GitFlow-like release branches for versioned products |
| Squash, merge or rebase PRs? | Trade-off between complete history, simple history and linear fine-grained history; be consistent |
| What makes a good pull request? | Small, focused, described, tested, self-reviewed, each commit coherent |

## 9.4 Cheat sheet

| Task | Command |
|---|---|
| Inspect objects | `git cat-file -t/-p <obj>`, `git ls-tree HEAD`, `git ls-files -s` |
| See history | `git log --oneline --graph --all`, `git log --first-parent`, `git log -S text` |
| Stage parts of a file | `git add -p` |
| Unstage / discard | `git restore --staged f` / `git restore f` |
| Undo last commit, keep changes | `git reset --soft HEAD~1` |
| Undo a pushed commit | `git revert <commit>` |
| Update branch with main | `git fetch && git rebase origin/main` (private branch) or `git merge origin/main` |
| Clean up commits | `git commit --fixup <c>`, `git rebase -i --autosquash <base>` |
| Recover | `git reflog`, `git branch name HEAD@{n}`, `git fsck --unreachable` |
| Find a regression | `git bisect start BAD GOOD`, `git bisect run ./test.sh` |
| Save work temporarily | `git stash push -m msg`, `git stash pop --index`, or `git worktree add` |
| Safe force-push | `git push --force-with-lease` |
| Large repositories | `--depth 1`, `--filter=blob:none`, `git sparse-checkout set dir`, Git LFS |
