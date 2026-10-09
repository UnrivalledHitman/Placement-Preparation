# How to use this guide
%What this book covers, how its commands were run, and why Git internals come up in interviews

Most developers use a dozen Git commands by habit and panic when something unusual happens: a rebase goes wrong, a branch disappears, a merge produces conflicts in files nobody touched. Interviews probe exactly this: "What is the difference between merge and rebase?", "How would you undo a pushed commit?", "What does `git reset --hard` actually do?", "How does Git store a file?". This guide explains Git from the inside out, so that every command becomes a predictable operation on a small set of objects, and then covers the workflows teams use.

## How the commands were run

Every block marked with an output was executed with Git 2.55 in a fresh, empty directory, with a clean configuration (author **Asha Rao**, default branch `main`) and a fixed clock that advances one minute per Git command. That is why the commit hashes in this book are stable: run the same commands with the same name, e-mail and dates and you get the same hashes, which is itself a lesson in how Git works. On your machine the commit hashes will differ (your name and clock differ); blob and tree hashes, which depend only on content, will match.

> TIP: Make a scratch directory and type the commands yourself. Git is learned with the fingers: `git cat-file -p` and `git log --graph` after every step show what each command really did.

## Map of the guide

| Chapter | Topic | Typical interview question |
|---|---|---|
| 1 | Objects: blobs, trees, commits | "How does Git store files? Why is it fast?" |
| 2 | Refs, branches, tags and remotes | "What is a branch? What does detached HEAD mean? Fetch versus pull?" |
| 3 | The index and the three trees | "Soft, mixed and hard reset?" |
| 4 | Merging and conflicts | "Fast-forward versus three-way merge?" |
| 5 | Rewriting history | "Merge or rebase? How do you undo a pushed commit?" |
| 6 | Recovery and bisect | "I ran `reset --hard`; is my work gone?" |
| 7 | Hooks, configuration and large repositories | "How do you enforce checks before commits? How do you handle huge repos?" |
| 8 | Team workflows and code review | "Trunk-based or GitFlow? What makes a good pull request?" |
| 9 | Question bank and cheat sheet | Revision |

# Chapter 1: Objects: Blobs, Trees and Commits
%Git is a content-addressed object store with a version-control interface on top

## 1.1 Content addressing

Git stores everything as **objects** in `.git/objects`, each named by the SHA-1 hash of its content (SHA-256 repositories exist but SHA-1 is still the default). There are four kinds:

| Object | Holds | Analogy |
|---|---|---|
| **Blob** | The bytes of one file (no name, no permissions) | File contents |
| **Tree** | A list of entries: mode, type, hash and name | A directory listing |
| **Commit** | A tree hash, parent commit hashes, author, committer, message | A snapshot with history |
| **Tag** (annotated) | An object hash, tag name, tagger, message, optional signature | A named, signed pointer |

Because the name is the hash of the content, identical content is stored once, any corruption is detectable, and two repositories can tell which objects they share just by comparing names.

```git run Storing a file: the same content always gets the same name
git init -q shop && cd shop
printf 'hello\n' > greeting.txt
git hash-object -w greeting.txt
cp greeting.txt copy.txt
git hash-object -w copy.txt
find .git/objects -type f
git cat-file -t ce01362
git cat-file -p ce01362
```

Two files with the same content produced **one** object. The object's name is computed from a header plus the content, which we can reproduce without Git:

```python run The blob hash is SHA-1 of "blob <size>\0" followed by the bytes
import hashlib, zlib
content = b'hello\n'
store = b'blob ' + str(len(content)).encode() + b'\0' + content
print('sha1:', hashlib.sha1(store).hexdigest())
print('stored zlib-compressed on disk:', len(zlib.compress(store)), 'bytes for', len(store))
```

## 1.2 Trees and commits, built by hand

Normal commands (`add`, `commit`) are built from lower-level **plumbing** commands. Doing a commit by hand shows exactly what a commit is.

```git run A commit from plumbing: stage, write a tree, write a commit, move the branch
git init -q shop && cd shop
mkdir src
printf 'print("hi")\n' > src/app.py
printf '# Shop\n' > README.md
git update-index --add README.md src/app.py      # stage two files
tree=$(git write-tree)                          # snapshot the index as tree objects
echo "tree:   $tree"
git cat-file -p "$tree"
commit=$(echo "Initial commit" | git commit-tree "$tree")
echo "commit: $commit"
git cat-file -p "$commit"
git update-ref refs/heads/main "$commit"         # point the branch at it
git log --oneline
```

The root tree lists `README.md` as a blob and `src` as another **tree**: directories are trees inside trees. The commit object is a few lines of text naming the root tree, the author and committer with timestamps, and the message. `git commit` does these same three steps (write tree, write commit, move branch) in one go.

## 1.3 History is a chain of snapshots

Each commit names its parent(s), so history is a **directed acyclic graph** of snapshots, not a list of diffs. Unchanged files and directories are shared between commits because their blobs and trees have the same hashes.

```git run Two commits share every unchanged object
git init -q shop && cd shop
mkdir src && printf 'print("hi")\n' > src/app.py && printf '# Shop\n' > README.md
git add . && git commit -q -m "Initial commit"
printf '# Shop\nSells tea.\n' > README.md
git commit -q -am "Describe the shop"
git cat-file -p HEAD
echo "--- first commit's tree:"
git cat-file -p HEAD~1^{tree}
echo "--- second commit's tree:"
git cat-file -p HEAD^{tree}
git count-objects -v | grep -E '^count'
```

The second commit has a `parent` line. Its tree points to a new `README.md` blob but to the **same** `src` tree as the first commit, because nothing in `src` changed, so the repository holds eight objects, not ten: two commits, two root trees, three blobs and one shared `src` tree. That sharing is why Git snapshots are cheap and why switching branches is fast: Git compares tree hashes and skips identical subtrees entirely. (Git also compresses similar objects as deltas inside **packfiles** during `git gc`; Chapter 7.)

> TRAP: "Git stores diffs" is the most common wrong answer in interviews. Git stores snapshots; diffs are computed on demand, and delta compression in packfiles is a storage optimisation invisible to the model.

## 1.4 Practical lessons

- Git is a content-addressed store: blobs (contents), trees (directories), commits (snapshots with parents), annotated tags.
- Identical content is one object; unchanged subtrees are shared between commits.
- A commit is tiny text naming a tree, parents, author, committer and message; its hash covers all of them, so changing anything (even a date) creates a different commit.
- `cat-file -p`, `write-tree`, `commit-tree` and `update-ref` expose what porcelain commands do.

# Chapter 2: Refs, Branches, Tags and Remotes
%Names for commits, what HEAD is, detached HEAD, and how fetch, pull and push move refs

## 2.1 A branch is a file containing a hash

A **ref** is a name for a commit. Branches live in `refs/heads/`, tags in `refs/tags/`, remote-tracking branches in `refs/remotes/`. **HEAD** names the current branch (a *symbolic* ref) or, in detached state, a commit directly.

```git run Branches are 41-byte files; HEAD points to one of them
git init -q shop && cd shop
printf 'v1\n' > menu.txt && git add . && git commit -q -m "Menu v1"
git branch feature
cat .git/HEAD
cat .git/refs/heads/main
cat .git/refs/heads/feature
git switch -q feature
printf 'v2\n' > menu.txt && git commit -q -am "Menu v2"
cat .git/HEAD
git log --oneline --all --graph
```

Creating a branch wrote one small file; committing on `feature` moved only that file. Branching is therefore essentially free, which is why Git workflows use so many short-lived branches.

## 2.2 Detached HEAD

Checking out a commit (or a tag) rather than a branch puts HEAD directly on a commit. New commits made there belong to no branch, so they become unreachable once you switch away, unless you give them a name.

```git run Commits on a detached HEAD and how to keep them
git init -q shop && cd shop
printf 'a\n' > f.txt && git add . && git commit -q -m "A"
printf 'b\n' > f.txt && git commit -q -am "B"
git switch -q --detach HEAD~1
cat .git/HEAD
printf 'experiment\n' > f.txt && git commit -q -am "Experiment"
git switch main 2>&1
git branch rescued HEAD@{1}
git log --oneline --all --graph
```

Git warned that the experiment commit was being left behind and printed its hash; `HEAD@{1}` (the reflog, Chapter 6) named it so it could be rescued into a branch.

## 2.3 Tags

| Kind | Command | Stored as | Use |
|---|---|---|---|
| Lightweight | `git tag v1.0` | A ref containing a commit hash | Private bookmarks |
| Annotated | `git tag -a v1.0 -m "Release 1.0"` | A tag **object** (tagger, date, message, optional GPG/SSH signature) plus a ref to it | Releases; `git describe` uses them |

```git run A lightweight tag is a ref; an annotated tag is an object
git init -q shop && cd shop
printf 'x\n' > f.txt && git add . && git commit -q -m "Release candidate"
git tag rc1
git tag -a v1.0 -m "Release 1.0"
git cat-file -t rc1
git cat-file -t v1.0
git cat-file -p v1.0
printf 'y\n' > f.txt && git commit -q -am "Fix after release"
git describe
```

`git describe` names the current commit relative to the nearest annotated tag: one commit after `v1.0`, with an abbreviated hash. Build systems use it to stamp version strings.

## 2.4 Remotes: fetch, pull and push

A **remote** is another repository, usually on a server. **Remote-tracking branches** (`origin/main`) record where the remote's branches were at the last fetch.

| Command | What moves |
|---|---|
| `git fetch` | Downloads missing objects and updates `origin/*` refs; never touches your branches or files |
| `git pull` | `fetch`, then merge (or rebase, with `pull.rebase=true`) `origin/main` into the current branch |
| `git push` | Uploads objects and asks the remote to move its branch; refused unless it is a fast-forward |

```git run Two clones of one bare repository, and a rejected push
git init -q --bare server.git
git clone -q server.git asha 2>/dev/null && cd asha     # (warns that the repository is empty)
printf 'v1\n' > menu.txt && git add . && git commit -q -m "Menu v1" && git push -q origin main
cd .. && git clone -q server.git ravi && cd ravi
printf 'v1\ncoffee\n' > menu.txt && git commit -q -am "Add coffee" && git push -q origin main
cd ../asha
printf 'v1\ntea\n' > notes.txt && git add . && git commit -q -m "Add notes"
git push origin main 2>&1 | grep -E 'rejected|hint: Updates' || true
git fetch -q
git status -sb | head -1
git pull -q --no-rebase origin main
git log --oneline --graph
git push -q origin main && echo "push accepted after integrating"
```

Asha's push was rejected because the server's `main` had moved on (Ravi's commit) and accepting hers would have discarded his. After fetching, `status` showed her branch **ahead 1, behind 1**; pulling merged the two lines of work, and the push became a fast-forward for the server.

## 2.5 Practical lessons

- Branches and tags are tiny files holding hashes; HEAD names the current branch.
- Detached HEAD is safe for looking around; name any commits you want to keep.
- Annotated tags are objects with metadata and signatures; use them for releases.
- `fetch` is always safe; `pull` is fetch plus merge or rebase; pushes must be fast-forwards unless forced.

# Chapter 3: The Index and the Three Trees
%Working tree, index and HEAD, and what add, restore, reset and stash do to each

## 3.1 Three versions of every file

At any moment Git compares three snapshots:

| Tree | Where | Changed by |
|---|---|---|
| **HEAD** | The last commit on the current branch | `commit`, `reset`, `switch` |
| **Index** (staging area) | `.git/index`, the snapshot the next commit will contain | `add`, `restore --staged`, `reset` |
| **Working tree** | Files on disk | Your editor, `restore`, `switch`, `reset --hard` |

`git status` reports differences between them: "changes to be committed" are index versus HEAD; "changes not staged" are working tree versus index.

```git run One file in three different states at once
git init -q shop && cd shop
printf 'tea 10\n' > prices.txt && git add . && git commit -q -m "Prices"
printf 'tea 12\n' > prices.txt && git add prices.txt      # staged version
printf 'tea 15\n' > prices.txt                             # working-tree version
git status --short
echo "HEAD:    $(git show HEAD:prices.txt)"
echo "index:   $(git show :prices.txt)"
echo "on disk: $(cat prices.txt)"
git diff --stat --cached
git ls-files --stage
```

`MM` means modified in the index **and** in the working tree. `git diff` compares working tree to index; `git diff --cached` compares index to HEAD. The index stores, for each path, the blob hash that will be committed.

## 3.2 Reset: soft, mixed and hard

`git reset <commit>` moves the current **branch** to `<commit>`, then optionally updates the index and working tree:

| Mode | Branch moves | Index reset to commit | Working tree reset | Typical use |
|---|---|---|---|---|
| `--soft` | Yes | No | No | Squash the last few commits into one |
| `--mixed` (default) | Yes | Yes | No | Unstage everything; redo the commits differently |
| `--hard` | Yes | Yes | Yes | Throw away commits **and** uncommitted changes |

```git run The same reset in three modes
for mode in soft mixed hard; do
  rm -rf r && git init -q r && cd r
  printf '1\n' > f.txt && git add . && git commit -q -m "one"
  printf '2\n' > f.txt && git commit -q -am "two"
  git reset -q --$mode HEAD~1
  log=$(git log --format=%s | tr '\n' ' ')
  st=$(git status --short)
  printf '%-6s log: %s | status: %s | file: %s\n' "$mode" "$log" "$st" "$(cat f.txt)"
  cd ..
done
```

After `--soft` the change from commit "two" is still staged (`M `), ready to be recommitted; after `--mixed` it is unstaged (` M`); after `--hard` it is gone from the working tree too. Commit "two" itself is not deleted by any of them: it is still in the object store and the reflog (Chapter 6).

## 3.3 Restore, switch and stash

Git 2.23 split the overloaded `checkout` into clearer commands:

| Goal | Modern command | Old equivalent |
|---|---|---|
| Discard unstaged changes to a file | `git restore file` | `git checkout -- file` |
| Unstage a file | `git restore --staged file` | `git reset file` |
| Get a file as it was in another commit | `git restore --source=HEAD~2 file` | `git checkout HEAD~2 -- file` |
| Change branch | `git switch name` (`-c` to create) | `git checkout name` (`-b`) |

```git run Stash saves both the index and the working tree
git init -q shop && cd shop
printf 'v1\n' > menu.txt && printf 'x\n' > notes.txt && git add . && git commit -q -m "Start"
printf 'v2\n' > menu.txt && git add menu.txt
printf 'draft\n' > notes.txt
git stash push -q -m "half-done menu"
git status --short; echo "(clean after stash)"
git stash list
git stash show --stat
git stash pop -q --index
git status --short
```

A stash is stored as commits (one for the index, one for the working tree) referenced by `refs/stash`. `pop --index` restored the staged change as staged and the unstaged one as unstaged.

## 3.4 Staging part of a file

Because the index is a separate snapshot, you can commit **some** of the changes in a file and keep the rest for a later commit: `git add -p` shows each changed hunk and asks whether to stage it (here the answers are piped in: yes to the first hunk, no to the second).

```git run Two unrelated edits in one file, committed separately
git init -q shop && cd shop
seq 1 12 | sed 's/^/line /' > menu.txt && git add . && git commit -q -m "Menu"
sed -i 's/^line 2$/line 2 (typo fixed)/; s/^line 11$/line 11 (new price)/' menu.txt
printf 'y\nn\n' | git add -p menu.txt > /dev/null
git commit -q -m "Fix typo"
git diff --stat
git log --oneline
git show --format=%s HEAD | grep '^[-+]line'
```

| Command | Compares |
|---|---|
| `git diff` | Working tree with the index (what is not yet staged) |
| `git diff --cached` (`--staged`) | Index with HEAD (what will be committed) |
| `git diff HEAD` | Working tree with HEAD (everything uncommitted) |
| `git diff main...feature` | The feature branch with its merge base (what a pull request shows) |

## 3.5 Practical lessons

- Every file has a HEAD version, an index version and a working-tree version; `status` and `diff` compare them.
- `reset` moves the branch; `--soft`, `--mixed` and `--hard` decide how much of the index and working tree follow.
- Prefer `restore` and `switch` over the overloaded `checkout`.
- Stashes are commits; `pop --index` restores what was staged.
