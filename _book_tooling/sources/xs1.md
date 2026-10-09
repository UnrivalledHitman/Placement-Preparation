# Solutions
%Every scenario run in a fresh repository with the guide's configuration

## Part 1 solutions

### X1.1 Count the objects

First commit: three blobs (one per file), two trees (the root and `src`) and one commit: **six** objects. Second commit: a new blob for `util.py`, a new `src` tree (one entry changed), a new root tree (its `src` entry changed) and a commit: **four** objects. `README.md`'s blob and `app.py`'s blob are reused.

```git run Counting objects after each commit
git init -q shop && cd shop
mkdir src && printf '# Shop\n' > README.md && printf 'app\n' > src/app.py
printf 'util\n' > src/util.py
git add . && git commit -q -m "First"
echo "after first commit:  $(git count-objects | cut -d' ' -f1) objects"
printf 'util v2\n' > src/util.py && git commit -q -am "Second"
echo "after second commit: $(git count-objects | cut -d' ' -f1) objects"
```

A change deep in a directory tree creates one new tree per directory on the path to the root, which is how Git can tell instantly that every other directory is unchanged.

### X1.2 A tree hash by hand

```python run Building blob and tree objects byte for byte
import hashlib

def obj(kind, body):
    return hashlib.sha1(kind + b' ' + str(len(body)).encode() + b'\0' + body)

readme = obj(b'blob', b'# Shop\n').digest()
app = obj(b'blob', b'print("hi")\n').digest()
src = obj(b'tree', b'100644 app.py\0' + app)
root = obj(b'tree', b'100644 README.md\0' + readme + b'40000 src\0' + src.digest())
print('src tree: ', src.hexdigest())
print('root tree:', root.hexdigest())
print('matches the guide:', root.hexdigest().startswith('a4c85bd'))
```

Entries are sorted by name (`README.md` before `src`, since uppercase sorts first), each is `mode name\0` plus the raw 20-byte hash, and a subdirectory uses mode `40000` and type `tree`. Because nothing here depends on author or time, everyone gets these exact hashes for these exact files.

### X1.3 What changes a commit's hash?

All of them. The commit object contains the tree (so file changes), the message, author and committer lines **with timestamps**, and the parent list; changing any byte changes the hash.

```git run The same change committed a minute apart, and an amend that changes nothing
for n in 1 2; do
  rm -rf r$n && git init -q r$n && cd r$n
  [ $n = 2 ] && git status > /dev/null                 # one extra command: the clock moves on
  printf 'tea\n' > menu.txt && git add . && git commit -q -m "Menu"
  echo "repository $n: commit $(git rev-parse --short HEAD),"\
       "tree $(git rev-parse --short HEAD^{tree})"
  cd ..
done
cd r1
before=$(git rev-parse --short HEAD)
git commit -q --amend --no-edit
echo "amend with no changes: $before -> $(git rev-parse --short HEAD)"
git log -1 --format='author date %ad, committer date %cd' --date=format:%H:%M
```

Same tree, different time, different commit. `--amend --no-edit` keeps the author date but sets a new committer date, so even an "empty" amend creates a new commit, which is why amending a pushed commit is rewriting history.

### X1.4 Lost on a detached HEAD

```git run Rescuing two commits made on a detached HEAD
git init -q shop && cd shop
printf 'v1\n' > app.txt && git add . && git commit -q -m "Release 1" && git tag v1
printf 'v2\n' > app.txt && git commit -q -am "Work on main"
git switch -q --detach v1
printf 'spike 1\n' > spike.txt && git add . && git commit -q -m "Spike step 1"
printf 'spike 2\n' >> spike.txt && git commit -q -am "Spike step 2"
git switch -q main 2>/dev/null
git reflog -3 --format='%gd %h %gs'
git branch spike HEAD@{1}
git log --oneline --graph --all
```

`HEAD@{1}` is the position before the switch back to `main`, which was the second spike commit; the branch includes the first through its parent link.

### X1.5 Ahead 2, behind 3

You have **2** commits that `origin/main` does not, and `origin/main` has **3** that you do not (as of your last fetch). Options:

| Option | Command | History afterwards |
|---|---|---|
| Merge | `git pull --no-rebase` (or `git merge origin/main`) | Both lines kept, joined by a merge commit |
| Rebase your 2 commits | `git pull --rebase` (or `git rebase origin/main`) | Linear: your 2 commits replayed on top of the 3 (new hashes; fine because they are unpushed) |
| Discard your 2 commits | `git reset --hard origin/main` | Your commits leave the branch (still in the reflog for a while) |

Run `git fetch` first so the numbers are current, and `git log --oneline --graph HEAD origin/main` to see the commits before choosing.

## Part 2 solutions

### X2.1 Split a commit

```git run reset HEAD~1, then two focused commits
git init -q shop && cd shop
printf 'v1\n' > api.py && printf '# Docs\n' > README.md && git add .
git commit -q -m "Start"
printf 'v2\n' > api.py && printf '# Docs\nUsage\n' > README.md
git commit -q -am "API and docs"
git reset -q HEAD~1
git add api.py && git commit -q -m "Add pagination to the API"
git add README.md && git commit -q -m "Document API usage"
git log --format='%s:' --stat | grep -v '^$'
```

`git reset HEAD~1` (mixed) moved the branch back and unstaged the changes while keeping them on disk; staging one file at a time made two commits. For two unrelated changes inside one file, `git add -p` stages hunk by hunk.

### X2.2 Read the status codes

| File and what happened | Prediction |
|---|---|
| `a.txt` tracked, edited and staged | `M ` |
| `b.txt` tracked, edited, not staged | ` M` |
| `c.txt` new and staged | `A ` |
| `d.txt` removed with `git rm` | `D ` |
| `e.txt` deleted from disk only | ` D` |
| `f.txt` new, never added | `??` |
| `g.txt` edited, staged, edited again | `MM` |
| `h.txt` renamed with `git mv` | `R ` |

```git run Eight files in eight states
git init -q shop && cd shop
for f in a b d e g h; do printf '%s\n' "$f" > $f.txt; done
git add . && git commit -q -m "Start"
printf 'a2\n' > a.txt && git add a.txt
printf 'b2\n' > b.txt
printf 'c\n' > c.txt && git add c.txt
git rm -q d.txt
rm e.txt
printf 'f\n' > f.txt
printf 'g2\n' > g.txt && git add g.txt && printf 'g3\n' > g.txt
git mv h.txt h2.txt
git status --short
```

### X2.3 A conflict where both sides are right

```git run Two appends at the same place, resolved by keeping both
git init -q shop && cd shop
git config merge.conflictStyle zdiff3
printf 'tea\ncoffee\n' > menu.txt && git add . && git commit -q -m "Menu"
git switch -q -c cake && printf 'tea\ncoffee\ncake\n' > menu.txt
git commit -q -am "Add cake"
git switch -q main && printf 'tea\ncoffee\npie\n' > menu.txt && git commit -q -am "Add pie"
git merge cake > /dev/null || echo "conflict, as expected"
cat menu.txt
printf 'tea\ncoffee\npie\ncake\n' > menu.txt && git add menu.txt && git commit -q --no-edit
git show HEAD:menu.txt
```

Both branches inserted a line at the same position relative to the base (after `coffee`), and Git cannot know whether the right order is pie then cake, cake then pie, or only one of them, so it asks. Files that many people append to (changelogs, route lists, dependency lists) conflict constantly for this reason; keeping such lists sorted, or splitting them into one file per entry, reduces conflicts.

### X2.4 `-X ours` versus `-s ours`

```git run A strategy option versus a whole strategy
setup() {
  rm -rf r && git init -q r && cd r
  printf 'price 10\n' > f.txt && git add . && git commit -q -m "Base"
  git switch -q -c theirs
  printf 'price 12\n' > f.txt && printf 'new\n' > new.txt && git add .
  git commit -q -m "Theirs"
  git switch -q main && printf 'price 11\n' > f.txt && git commit -q -am "Ours"
}
has() { [ -f "$1" ] && echo yes || echo no; }
setup && git merge -q --no-edit -X ours theirs
echo "-X ours: f.txt says '$(cat f.txt)', new.txt exists: $(has new.txt)"
cd .. && setup && git merge -q --no-edit -s ours theirs
echo "-s ours: f.txt says '$(cat f.txt)', new.txt exists: $(has new.txt)"
```

`-X ours` is an **option** to the normal merge: it merges everything it can and resolves only the conflicting hunks in our favour, so their new file arrives. `-s ours` is a **strategy** that records a merge but keeps our tree unchanged, discarding everything from the other branch. It is used to mark a branch as merged without taking its changes (for example, superseded release work).

### X2.5 "Already up to date", but the feature is missing

```git run Re-merging after a reverted merge, and the fix: revert the revert
has() { [ -f "$1" ] && echo yes || echo no; }
git init -q shop && cd shop
printf 'header\nfooter\n' > app.txt && git add . && git commit -q -m "Base"
git switch -q -c feature
printf 'header\nfeature A\nfeature B\nfooter\n' > app.txt && git commit -q -am "Add feature"
git switch -q main && git merge -q --no-ff --no-edit feature
git revert --no-edit -m 1 HEAD > /dev/null            # the feature had a bug: back it out
git switch -q feature && printf 'flag=on\n' > config.txt && git add .
git commit -q -m "Fix feature"
git switch -q main && git merge -q --no-edit feature
echo "re-merge: config.txt present: $(has config.txt);" \
     "feature lines in app.txt: $(grep -c feature app.txt)"
git reset -q --hard HEAD~1                             # undo that merge and do it properly
git revert --no-edit HEAD > /dev/null                  # revert the revert
git merge -q --no-edit feature
echo "after reverting the revert: config.txt present: $(has config.txt);" \
     "feature lines in app.txt: $(grep -c feature app.txt)"
git log --oneline --graph
```

The second merge **succeeded**, brought in the fix, and silently left the feature out: zero feature lines. Reverting a merge removes its **changes** but not its **history**: the feature commits stay ancestors of `main`, so a later merge brings only commits not yet merged (the fix). The documented remedy is to **revert the revert** first (Git titles it "Reapply"), restoring the original feature, and then merge the fix, after which both are present. Teams that hit this often prefer to revert by fixing forward or by disabling a feature flag, which avoids the trap entirely.
