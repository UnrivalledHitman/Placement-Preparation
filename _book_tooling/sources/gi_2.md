# Chapter 6: Recovery and Bisect
%The reflog, rescuing reset and deleted branches, finding dangling objects, and binary-searching history for a bug

## 6.1 Almost nothing is lost: the reflog

Every time a ref moves (commit, reset, rebase, switch, merge), Git appends a line to that ref's **reflog** in `.git/logs/`. Objects a ref used to point at stay in the database until garbage collection removes unreachable objects, and by default reflog entries keep them reachable for 90 days (30 days for entries no longer on the branch). So a commit that "disappeared" after a `reset --hard` or a bad rebase is almost always one command away.

```git run Undoing reset --hard with the reflog
git init -q shop && cd shop
for item in tea coffee cake; do
  printf '%s\n' "$item" >> menu.txt && git add . && git commit -q -m "Add $item"
done
git reset -q --hard HEAD~2
git log --oneline
git reflog | head -4
git reset -q --hard HEAD@{1}
echo "after recovery:"; git log --oneline
```

`HEAD@{1}` means "where HEAD was one move ago". The reflog is **local**: it is not pushed or cloned, so it rescues your own mistakes, not someone else's.

## 6.2 A deleted branch

```git run Recreating a branch deleted with -D
git init -q shop && cd shop
printf 'tea\n' > menu.txt && git add . && git commit -q -m "Menu"
git switch -q -c experiment
printf 'matcha\n' >> menu.txt && git commit -q -am "Try matcha"
printf 'chai\n' >> menu.txt && git commit -q -am "Try chai"
git switch -q main
git branch -D experiment
git log -g --format='%h %gs' HEAD | head -4
git branch experiment HEAD@{1}
git log --oneline experiment
```

`git branch -D` printed the hash it deleted (worth copying when you delete in a hurry). The HEAD reflog also remembered where we were before switching, so the branch can be recreated at that commit with all its history.

## 6.3 Objects with no ref at all

A dropped stash or a staged-but-never-committed file is not in any reflog, yet its objects were written to the database. `git fsck` lists **unreachable** objects, which can then be inspected and rescued.

```git run Rescuing a dropped stash and a file that was only ever staged
git init -q shop && cd shop
printf 'tea\n' > menu.txt && git add . && git commit -q -m "Menu"
printf 'tea\nsecret recipe\n' > menu.txt
git stash -q && git stash drop -q
printf 'draft prices\n' > prices.txt && git add prices.txt
git reset -q --hard                                   # the staged file is "gone"
git status --short; echo "(working tree clean)"
git fsck --no-reflogs --unreachable 2>/dev/null | sort
lost() {                                    # unreachable objects of one type
  git fsck --no-reflogs --unreachable 2>/dev/null | awk -v t="$1" '$2 == t {print $3}'
}
for c in $(lost commit); do git log -1 --format='commit %h: %s' "$c"; done
blob=$(for b in $(lost blob); do git cat-file -p "$b" | grep -q 'draft' && echo "$b"; done)
echo "staged file recovered: $(git cat-file -p "$blob")"
```

The dropped stash appears as unreachable commits (a stash is a commit for the working tree plus one for the index), and `prices.txt` survives as a blob because `git add` wrote it to the object store. The lesson: **staging is a save point**; anything that was ever `git add`-ed can be recovered until garbage collection runs. Truly uncommitted, unstaged edits are the only work Git cannot give back.

## 6.4 Finding when a bug appeared

When a bug exists now but did not in some older version, `git bisect` binary-searches the commits in between: about log₂(n) steps for n commits. With `git bisect run`, a script decides good (exit 0) or bad (non-zero) and the search is fully automatic.

```git run Bisecting 64 commits automatically
git init -q shop && cd shop
for i in $(seq 1 64); do
  if [ "$i" -ge 41 ]; then fee=999; else fee=0; fi        # commit 41 introduces the bug
  printf 'tea 10\nfee %s\nversion %s\n' "$fee" "$i" > prices.txt
  git add . && git commit -q -m "Change $i"
done
printf '#!/bin/sh\n! grep -q "fee 999" prices.txt\n' > ../check.sh
git bisect start HEAD HEAD~63 > ../bisect.log
git bisect run sh ../check.sh >> ../bisect.log 2>&1
grep -c '^Bisecting' ../bisect.log | sed 's/^/steps taken: /'
git show -s --format='%s' refs/bisect/bad
git bisect reset > /dev/null 2>&1
```

Bisect found the culprit among 64 commits in six steps (log₂ 64 = 6). Related tools: `git log -S"fee 999"` (the "pickaxe") lists commits that added or removed a string, and `git blame -L 2,2 prices.txt` shows which commit last changed a line.

| Tool | Question it answers |
|---|---|
| `git reflog`, `git log -g` | Where were my refs before? |
| `git fsck --unreachable` / `--lost-found` | Which objects exist but are not reachable from any ref? |
| `git bisect run` | Which commit introduced this behaviour? |
| `git log -S`, `git log -G` | Which commits added or removed this text (or regex)? |
| `git blame` | Which commit last changed each line? |

## 6.5 Practical lessons

- The reflog records every ref movement locally; `HEAD@{n}` rescues resets, rebases and deleted branches.
- Anything ever staged or stashed lives on as objects until garbage collection; `fsck --unreachable` finds them.
- Commit often, even locally: committed work is recoverable, unsaved edits are not.
- `git bisect run` finds a regression among thousands of commits in a dozen automated steps.

# Chapter 7: Hooks, Configuration and Large Repositories
%Client-side hooks, ignore and attribute files, configuration levels, packfiles, and techniques for huge repositories

## 7.1 Hooks

Hooks are scripts in `.git/hooks/` that Git runs at certain points: `pre-commit` (before a commit is created; non-zero exit aborts it), `commit-msg` (can check or rewrite the message), `pre-push`, and on servers `pre-receive` and `update`.

```git run A pre-commit hook that blocks debugging leftovers
git init -q shop && cd shop
cat > .git/hooks/pre-commit <<'EOF'
#!/bin/sh
if git diff --cached -U0 | grep -n '^+.*console\.log'; then
  echo "pre-commit: remove console.log before committing" >&2
  exit 1
fi
EOF
chmod +x .git/hooks/pre-commit
printf 'function total(a){ console.log(a); return a; }\n' > cart.js
git add cart.js
git commit -q -m "Cart total" || echo "exit status $?"
printf 'function total(a){ return a; }\n' > cart.js && git add cart.js
git commit -q -m "Cart total" && git log --oneline
```

| Fact | Consequence |
|---|---|
| Hooks are not cloned or pushed | Each developer must install them; tools such as the `pre-commit` framework or Husky install them from a committed config |
| Client hooks can be skipped (`git commit --no-verify`) | They are a convenience, not enforcement; real guarantees come from CI checks and protected branches on the server |
| Hooks should be fast | A slow pre-commit hook trains people to use `--no-verify`; run heavy checks in CI |

## 7.2 Ignore files, attributes and configuration levels

```git run Why is this file ignored? And where did this setting come from?
git init -q shop && cd shop
printf '*.log\nbuild/\n!important.log\n' > .gitignore
mkdir build && touch build/app.jar debug.log important.log
git status --short --untracked-files=all
git check-ignore -v debug.log build/app.jar
git config --local core.autocrlf input
git config --show-origin --get-all user.name
git config --show-origin core.autocrlf
```

| File | Purpose |
|---|---|
| `.gitignore` | Untracked files to ignore (build output, logs, secrets); later patterns and `!` negations override earlier ones |
| `.gitattributes` | Per-path behaviour: line endings (`* text=auto`, `*.sh text eol=lf`), binary files, diff and merge drivers, Git LFS tracking |
| Config levels | System (`--system`), user (`--global`, `~/.gitconfig`), repository (`--local`, `.git/config`), worktree; the most specific wins |

> TRAP: `.gitignore` does not affect files already tracked. To stop tracking a committed file, `git rm --cached file`, add it to `.gitignore` and commit. A secret that was committed must be **rotated**: removing it from history (with `git filter-repo`) does not remove it from existing clones or forks.

## 7.3 Packfiles and garbage collection

New objects are written as individual compressed files ("loose objects"). `git gc` (also run automatically) packs them into **packfiles**, storing similar objects as deltas against each other, and removes unreachable objects older than the expiry period.

```git run 200 versions of a growing file, before and after packing
git init -q shop && cd shop
git config gc.auto 0 && git config maintenance.auto false     # keep objects loose
for i in $(seq 1 200); do
  seq 1 $((i * 20)) | sed 's/$/ some fairly repetitive line of text/' > data.txt
  git add data.txt && git commit -q -m "Version $i"
done
git count-objects -vH | grep -E '^(count|size):'
git gc -q
git count-objects -vH | grep -E '^(count|size-pack|in-pack):'
```

The 600 loose objects (200 commits, 200 trees and 200 ever-larger blobs) take about 1 MiB; packed, they take about a tenth of that, because each version of `data.txt` is stored as a small delta against a similar one. This is why the "Git stores snapshots" model is affordable on disk.

## 7.4 Very large repositories

| Problem | Technique | Command |
|---|---|---|
| Long history you do not need (CI builds) | Shallow clone | `git clone --depth 1 url` |
| Many large historical blobs | Partial (blobless) clone: fetch file contents on demand | `git clone --filter=blob:none url` |
| A monorepo where you work in one directory | Sparse checkout | `git sparse-checkout set services/payments` |
| Large binary assets (models, videos) | Git LFS: the repository stores small pointer files; contents live on an LFS server | `git lfs track "*.psd"` |
| Several branches checked out at once | Worktrees share one object store | `git worktree add ../hotfix release-1.0` |
| Slow `status` in huge working trees | File-system monitor and untracked cache | `git config core.fsmonitor true` |

```git run A shallow clone, a blobless clone and a sparse checkout of the same repository
git init -q origin-repo && cd origin-repo
mkdir -p services/payments services/search docs
for i in $(seq 1 30); do
  printf 'v%s\n' "$i" > services/payments/app.txt
  printf 'v%s\n' "$i" > services/search/app.txt
  git add . && git commit -q -m "Release $i"
done
git config uploadpack.allowFilter true
cd ..
git clone -q --depth 1 "file://$PWD/origin-repo" shallow
echo "shallow: $(git -C shallow rev-list --count HEAD) commit(s) of history"
git clone -q --filter=blob:none --no-checkout "file://$PWD/origin-repo" sparse
cd sparse
git sparse-checkout set services/payments
git checkout -q main
find . -path ./.git -prune -o -type f -print | sort
git worktree add -q ../hotfix HEAD~5 && git worktree list
```

The shallow clone has one commit of history; the blobless, sparse clone checked out only `services/payments` and downloads other files' contents only if they are ever needed; the worktree gives a second working directory for an older commit without cloning again.

## 7.5 Practical lessons

- Hooks automate local checks but are optional; enforce rules in CI and with protected branches.
- Use `check-ignore -v` and `config --show-origin` to explain surprising behaviour.
- Packfiles store similar objects as deltas; `gc` keeps repositories compact.
- For large repositories: shallow, partial and sparse clones, LFS for binaries, worktrees for parallel branches.
