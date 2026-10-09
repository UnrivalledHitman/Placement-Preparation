## Part 3 solutions

### X3.1 Reorder and drop

`git rebase -i` reads its plan from a todo file that `GIT_SEQUENCE_EDITOR` may edit. Here `sed` deletes the line for D, holds the line for B, and appends it after C.

```git run An interactive rebase scripted with sed
git init -q shop && cd shop
printf 'base\n' > base.txt && git add . && git commit -q -m "Base"
for c in A B C D; do
  printf '%s\n' "$c" > "$c.txt" && git add . && git commit -q -m "$c"
done
echo "before: $(git log --reverse --format=%s HEAD~4..HEAD | tr '\n' ' ')"
plan="sed -i -e '/ D\$/d' -e '/ B\$/{h;d}' -e '/ C\$/G'"    # drop D; move B after C
GIT_SEQUENCE_EDITOR="$plan" git rebase -q -i HEAD~4
echo "after:  $(git log --reverse --format=%s HEAD~3..HEAD | tr '\n' ' ')"
ls
```

Each commit touched its own file, so reordering caused no conflicts. When commits touch the same lines, reordering them can conflict, and the rebase stops for you to resolve each step.

### X3.2 Committed to the wrong branch

```git run Move three commits from main to a new branch
git init -q --bare server.git
git clone -q server.git app 2>/dev/null && cd app
printf 'v1\n' > app.txt && git add . && git commit -q -m "Base" && git push -q origin main
for n in 1 2 3; do
  printf 'receipt %s\n' "$n" >> receipts.txt && git add .
  git commit -q -m "Receipts step $n"
done
git branch feature/receipts                # keep the commits
git reset -q --hard origin/main            # put main back where the server has it
echo "main:";             git log --oneline main
echo "feature/receipts:"; git log --oneline feature/receipts
```

Creating the branch first is the important order: it keeps a name on the three commits before `main` moves away from them. If the commits had already been pushed to `main`, rewriting it would affect others; you would instead revert them on `main` or leave them and coordinate.

### X3.3 Undo a bad rebase

Before rewriting a branch, `rebase` (like `merge` and `reset`) stores the old tip in `ORIG_HEAD`, and the branch's reflog records it too.

```git run Returning a branch exactly to its pre-rebase state
git init -q shop && cd shop
printf 'tea\n' > menu.txt && git add . && git commit -q -m "Menu"
git switch -q -c feature
printf 'cake\n' > desserts.txt && git add . && git commit -q -m "Desserts"
git switch -q main && printf 'Open 9-5\n' > hours.txt && git add . && git commit -q -m "Hours"
git switch -q feature
before=$(git rev-parse --short HEAD)
git rebase -q main
echo "rebased tip: $(git rev-parse --short HEAD) (was $before)"
git reflog feature -2 --format='%gd %h %gs'
git reset -q --hard ORIG_HEAD
echo "restored tip: $(git rev-parse --short HEAD)"
git log --oneline --graph --all
```

`ORIG_HEAD` is overwritten by the next merge, reset or rebase, so use it immediately; the reflog (`feature@{1}`) keeps the old tip for weeks.

### X3.4 A secret in the last commit

```git run Remove .env from the last commit, keep it locally, ignore it from now on
git init -q shop && cd shop
printf 'print("app")\n' > app.py && printf 'API_KEY=example-not-a-real-key\n' > .env
git add . && git commit -q -m "App with configuration"
git rm -q --cached .env
printf '.env\n' >> .gitignore
git add .gitignore && git commit -q --amend --no-edit
git ls-tree --name-only HEAD
echo "still on disk: $(cat .env)"
git status --short --ignored
```

The amended commit no longer contains `.env`, the file stays on disk, and `.gitignore` stops it being added again (`!!` marks ignored files). **If the commit had been pushed**, treat the key as compromised: revoke and rotate it first, because anyone who fetched has it. Then, if policy requires, remove it from history with `git filter-repo --invert-paths --path .env`, force-push with everyone's agreement, and ask collaborators to re-clone. Secret-scanning push protection on the server prevents the problem in the first place.

### X3.5 Bisect with untestable commits

A test script that exits with **125** tells `git bisect run` to skip the commit, as if it could not be tested.

```git run Commits 20-23 do not build; the bug arrives in 25
git init -q shop && cd shop
for i in $(seq 1 40); do
  broken=no; [ "$i" -ge 20 ] && [ "$i" -le 23 ] && broken=yes
  bug=no; [ "$i" -ge 25 ] && bug=yes
  printf 'version %s\nbuild_broken %s\nbug %s\n' "$i" "$broken" "$bug" > state.txt
  git add . && git commit -q -m "Change $i"
done
cat > ../test.sh <<'EOF'
#!/bin/sh
grep -q 'build_broken yes' state.txt && exit 125      # cannot test this commit
! grep -q 'bug yes' state.txt
EOF
git bisect start HEAD HEAD~39 > ../log.txt
git bisect run sh ../test.sh >> ../log.txt 2>&1
echo "commits skipped: $(git bisect log | grep -c '^git bisect skip')"
echo "commits tested:  $(git bisect log | grep -c '^git bisect \(good\|bad\)')"
echo "first bad commit: $(git show -s --format=%s refs/bisect/bad)"
git bisect reset > /dev/null 2>&1
```

Bisect stepped around the broken commits and still found commit 25. If the bug had been introduced **inside** the untestable range, bisect would report that the first bad commit "could be any of" the skipped candidates, which is the honest answer.

## Part 4 solutions

### X4.1 Pick a workflow

| Case | Recommendation | Why |
|---|---|---|
| (a) Mobile banking app, monthly releases, two supported versions | Trunk-based on `main` with short feature branches and flags, plus `release/x.y` branches cut monthly; fixes land on `main` first and are cherry-picked (`-x`) to supported releases; releases tagged | App-store review and slow user upgrades mean old versions live on; release branches are the place to patch them |
| (b) SaaS back end deploying 20 times a day | Trunk-based development: small PRs reviewed within hours, merge queue, feature flags, continuous deployment with canaries | Long-lived branches would block the deploy rate; flags decouple deploy from release |
| (c) Open-source library | Fork-and-pull-request (contributors cannot push), `main` plus maintenance branches for supported major versions, signed release tags, semantic versioning with Conventional Commits | Untrusted contributors, users pinned to versions, automated changelogs |

### X4.2 A commit message and a PR description

```text
Extend password-reset links to 60 minutes and make them single-use

Links expired after 15 minutes, and support tickets showed users of slow
e-mail providers often received them too late. Raise the expiry to 60
minutes and invalidate a token as soon as it is used, so the longer
window does not let an intercepted link be replayed.

Refs: SUP-1182
```

The PR description adds what the commit message does not need: **how it was tested** (unit tests for expiry and reuse, a manual end-to-end reset), **risk** (the longer window, mitigated by single use), **rollout** (no migration; old 15-minute tokens remain valid until they expire) and a reviewer checklist (token table index, logging does not include tokens).

### X4.3 Which releases contain the fix?

```git run Following a fix and its cherry-picked copies
git init -q shop && cd shop
printf 'v1.4\n' > app.txt && git add . && git commit -q -m "Release 1.4"
git branch release/1.4
printf 'v1.5\n' > app.txt && git commit -q -am "Release 1.5" && git branch release/1.5
printf 'escape html\n' > security.txt && git add .
git commit -q -m "fix: escape user names in HTML"
fix=$(git rev-parse HEAD)
for r in 1.4 1.5; do
  git switch -q release/$r && git cherry-pick -x "$fix" > /dev/null
  git tag -a "v$r.1" -m "Patch $r.1"
done
git switch -q main
echo "branches containing the original: $(git branch --contains "$fix" | tr -d ' *')"
echo "copies (found by the -x line):"
git log --all --format='  %h on %D' --grep="cherry picked from commit $fix"
for c in $(git log --all --format=%h --grep="cherry picked from commit $fix"); do
  echo "  tags containing $c: $(git tag --contains "$c" | tr '\n' ' ')"
done
```

`git branch --contains` finds only `main`, because cherry-picks are **different commits**. The `-x` trailer is what links the copies back to the original, and `git tag --contains` on each copy answers "which released versions are patched?" (`v1.4.1` and `v1.5.1`). `git cherry` and `git log --cherry-mark` can also detect equivalent changes by patch content when `-x` was forgotten.

### X4.4 Every line changed

```git run CRLF line endings make every line differ; .gitattributes fixes it
git init -q shop && cd shop
printf 'tea 10\ncoffee 20\ncake 30\n' > prices.txt && git add . && git commit -q -m "Prices"
printf 'tea 12\r\ncoffee 20\r\ncake 30\r\n' > prices.txt     # Windows editor, one real change
git add prices.txt
echo "before the fix:"; git diff --cached --stat
printf '* text=auto eol=lf\n*.bat text eol=crlf\n*.png binary\n' > .gitattributes
git add .gitattributes && git add --renormalize .
echo "after .gitattributes and --renormalize:"; git diff --cached --stat
git diff --cached prices.txt | grep '^[-+]tea'
```

The teammate's editor saved CRLF line endings, so every line's bytes differ from the LF version in the repository. A committed `.gitattributes` with `* text=auto eol=lf` makes Git normalise text files to LF in the repository for **everyone**, whatever their `core.autocrlf` setting; `git add --renormalize .` re-stages files under the new rules, leaving only the real one-line change. Per-user `core.autocrlf` settings are the old fix and fail as soon as one person's setting differs; the attributes file travels with the repository.

### X4.5 Monorepo or polyrepo?

| Concern | Monorepo | Polyrepo (one per service) |
|---|---|---|
| Cross-service changes | One atomic commit and PR changes an API and all its callers | Coordinated releases across repositories and version bumps |
| Shared code and tooling | One build system, one linter config, shared libraries at head | Duplicated tooling; shared libraries versioned and published |
| Dependency versions | One version of each third-party library (enforceable) | Drift; diamond-dependency problems between services |
| Scale of Git operations | Needs partial and sparse clones, fsmonitor, and a build system that builds only what changed (Bazel, Nx, Pants, Gradle with caching) | Each repository small and fast |
| Ownership and access | `CODEOWNERS` per directory; fine-grained read access is hard | Natural boundaries and permissions per repository |
| CI | Must compute affected targets to stay fast | Simple per repository |
| Team autonomy | Shared conventions, central tooling team needed | Teams choose their own stack and pace |

**Recommendation for 200 engineers and 40 services:** a monorepo pays off if most services share a language and frequently change together, **and** the organisation can fund build and CI tooling (affected-target builds, remote caching, sparse checkouts). If services are owned by independent teams with different stacks and release cycles, polyrepos with well-versioned shared libraries and contract tests (Software Testing guide, Chapter 7) are simpler. Many organisations land in between: a few domain monorepos rather than one giant repository or 40 small ones.
