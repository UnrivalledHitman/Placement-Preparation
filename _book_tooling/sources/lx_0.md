# How to use this guide
%Linux for software engineers, with every command actually executed

Almost every server you will deploy to, every container you will build, every CI runner that tests your code and every cloud virtual machine runs **Linux**. Interviews for backend, DevOps, SRE and even ML roles assume you can move around a shell, read logs, find what is using a port, fix a permission error and write a small script. This guide teaches exactly that, from first principles to the internals interviewers like to probe.

## How the examples were run

Every block titled with a run label below was **executed** on Ubuntu 24.04, and its output is shown exactly as produced. To make permission behaviour real, each block ran as the unprivileged user `nobody` (uid 65534), in a fresh, empty home directory shown as `/home/learner`, with the time zone set to UTC. That is why you will see `nobody` and `nogroup` as owners, and why commands that need administrator rights fail, as they would for you without `sudo`. Commands that need root (creating users, installing packages, managing services) are shown as plain listings without output, and are marked as such.

> NOTE: Output that would differ from machine to machine (process IDs, timestamps, disk sizes) has been avoided, fixed (with `touch -d`), or filtered in the commands themselves. When you run the commands, expect those details to differ.

## How to study

1. Open a Linux shell: a real Linux machine, WSL on Windows (`wsl --install`), a cloud VM, or `docker run -it ubuntu:24.04 bash`.
2. Type every command; do not paste. Predict the output first.
3. Break things on purpose: remove a permission, kill the wrong process, fill a pipe.
4. Solve the practice book. Its solutions are executed the same way.

## Map of the guide

| Chapter | Topic | You will be able to |
|---|---|---|
| 1 | What Linux is, and where it runs | Explain kernel, distribution, shell; say where Linux sits in a product |
| 2 | Files and the shell | Navigate, understand paths, inodes, links, globbing and quoting |
| 3 | Text processing | Answer questions from logs with grep, sed, awk, sort, uniq, cut, find, xargs |
| 4 | Users and permissions | Read and set rwx, octal modes, umask, special bits, ACLs, sudo |
| 5 | Processes and signals | Inspect processes, jobs, signals, exit codes, /proc, resources |
| 6 | Shell scripting | Write safe, robust scripts with functions, arrays, traps and options |
| 7 | Networking | Read addresses, ports and sockets; use curl and nc; generate SSH keys |
| 8 | Packages, services, logs and scheduling | Use apt, systemd units, journalctl, cron |
| 9 | Inside the kernel | System calls, file descriptors, page cache, namespaces and cgroups |
| 10 | Troubleshooting playbook and interview questions | Diagnose the ten most common production problems |

# Chapter 1: What Linux Is, and Where It Runs
%The kernel, the distribution, the shell, and the parts of a product that live on Linux

## 1.1 Kernel, distribution and shell

Three different things are casually called "Linux":

| Layer | What it is | Examples |
|---|---|---|
| **Kernel** | The program that owns the hardware: schedules processes, manages memory, drives disks and network cards, enforces permissions. Everything else asks it for services through **system calls** | Linux 6.x (written by Linus Torvalds in 1991, now thousands of contributors) |
| **Distribution** | The kernel plus a package manager, core utilities (GNU coreutils), an init system, libraries and defaults | Ubuntu and Debian (`apt`), Red Hat, Rocky, Fedora, Amazon Linux (`dnf`/`yum`), Alpine (`apk`, tiny, used in containers) |
| **Shell** | A program that reads commands and asks the kernel to run them | `bash` (the default almost everywhere), `zsh` (macOS default), `sh`/`dash` (minimal, used by scripts) |

```bash run Which kernel, distribution and shell is this?
uname -s -r | sed 's/-.*//'              # kernel name and version (build suffix removed)
. /etc/os-release && echo "$PRETTY_NAME"  # distribution
echo "$SHELL" "$BASH_VERSINFO"            # shell and its major version
```

**Unix** came first (Bell Labs, 1969). Linux is a free re-implementation of the Unix ideas, and macOS is a certified Unix, so almost everything in this guide also works in the macOS terminal (with small differences in flags such as `sed -i`).

## 1.2 Where Linux runs in a real product

Take a typical web product (say, a smart-energy dashboard: meters send readings, users log in and view charts, a model forecasts demand). Here is where Linux is, and what an engineer does with it at each place:

| Part of the product | Runs on | What you do there with Linux skills |
|---|---|---|
| Web servers, API servers (Spring Boot, Node, Django) | Linux VMs or containers in the cloud | Deploy, read logs, check ports, restart services, tune file-descriptor limits |
| Containers (Docker, Kubernetes) | A Linux kernel; containers are just Linux processes with namespaces and cgroups (Chapter 9) | Write Dockerfiles (they are shell commands), debug inside a container with `kubectl exec` |
| Databases (MySQL, PostgreSQL, Redis) | Linux servers | Check disk space, memory, slow-query logs, backups with cron |
| CI/CD pipelines (GitHub Actions, Jenkins) | Linux runners | Every pipeline step is a shell command |
| ML training and serving | Linux GPU servers | Run long jobs with `nohup`/`tmux`, watch `nvidia-smi`, manage Python environments |
| Edge and IoT devices (smart meters, gateways, Raspberry Pi) | Embedded Linux | Cross-compile, read sensor devices under `/dev`, run services at boot |
| Android phones | A modified Linux kernel | (Indirectly) app sandboxes are Linux users and permissions |
| Your laptop | WSL, a Linux VM, or macOS (Unix) | Local development identical to production |

> TIP: In an interview, when asked "have you used Linux?", answer with a concrete task: "I deployed my Spring Boot app on an Ubuntu VM, ran it as a systemd service, used `journalctl` to debug a startup failure, and `ss -tlnp` to find that port 8080 was taken."

## 1.3 Everything is a file

The central Unix idea: regular files, directories, devices, pipes, sockets and even process information appear as **files** in one tree, and the same small tools (`cat`, `grep`, redirection) work on all of them. You will see this repeatedly: `/proc` exposes processes as files, `/dev/null` is a file that discards everything, and a network socket is read and written with the same `read`/`write` system calls as a file.

The second idea: **small tools that do one thing, connected by pipes**. `grep` only filters lines; `sort` only sorts; `uniq -c` only counts adjacent duplicates. Chained together they answer questions no single tool was designed for (Chapter 3).

# Chapter 2: Files and the Shell
%Paths, the directory tree, inodes, links, globbing and quoting

## 2.1 The filesystem tree

There is a single tree rooted at `/`. Disks and partitions are **mounted** onto directories within it (there are no drive letters). The layout follows the Filesystem Hierarchy Standard:

| Directory | Contains |
|---|---|
| `/bin`, `/usr/bin` | Programs for everyone (`ls`, `grep`, `python3`) |
| `/sbin`, `/usr/sbin` | System administration programs (`ip`, `useradd`) |
| `/etc` | Configuration files (text): `/etc/passwd`, `/etc/hosts`, `/etc/nginx/` |
| `/home/<user>` | Users' home directories; `~` is shorthand for yours |
| `/root` | The administrator's home |
| `/var` | Variable data: `/var/log` (logs), `/var/lib` (databases, package state) |
| `/tmp` | Temporary files, often cleared at boot, writable by everyone |
| `/opt` | Optional, self-contained software |
| `/dev` | Device files: disks (`/dev/sda`), `/dev/null`, `/dev/zero`, `/dev/urandom` |
| `/proc`, `/sys` | Virtual files generated by the kernel describing processes and hardware |
| `/boot` | The kernel and boot loader files |
| `/lib`, `/usr/lib` | Shared libraries (`.so` files) and kernel modules |
| `/mnt`, `/media` | Mount points for extra disks and removable media |

```bash run The top of the tree, and where some familiar commands live
for d in /bin /etc /home /proc /tmp /usr /var; do stat -c '%-6n %F' "$d"; done
readlink /bin
for c in ls bash python3 ip; do printf '%-8s -> %s\n' "$c" "$(command -v "$c")"; done
head -3 /etc/passwd
```

## 2.2 Paths and navigation

An **absolute path** starts at `/` (`/var/log/syslog`). A **relative path** starts from the current directory (`logs/app.log`). Two special names exist in every directory: `.` (this directory) and `..` (the parent).

| Command | Meaning |
|---|---|
| `pwd` | Print the working directory |
| `cd dir`, `cd ..`, `cd`, `cd -` | Change directory; up one; home; previous directory |
| `ls -la`, `ls -lA` | List all files (including hidden ones starting with `.`) in long format; `-A` omits `.` and `..` |
| `mkdir -p a/b/c` | Create directories, including missing parents |
| `cp -r src dst`, `mv old new`, `rm -r dir` | Copy, move or rename, remove (there is no recycle bin) |
| `touch f` | Create an empty file, or update its timestamp |
| `tree`, `find . -type d` | Show structure |

```bash run Navigating, creating and inspecting a small project
mkdir -p project/src/main project/logs
cd project
echo "hello" > notes.txt
touch -d '2026-01-15 10:00' README.md src/main/App.java logs/app.log notes.txt logs src
pwd
ls
ls -lA --time-style=+%Y-%m-%d | awk 'NR > 1 {print $1, $6, $7}'
cd src/main && pwd && cd ../.. && pwd
cd - >/dev/null && pwd                   # back to the previous directory
cd ~/project && find . | sort
```

The first character of each `ls -l` line is the **file type**: `-` regular file, `d` directory, `l` symbolic link, `c`/`b` character/block device, `p` named pipe, `s` socket. The next nine characters are the permissions (Chapter 4).

> TRAP: `rm -rf` does not ask and cannot be undone. A space in the wrong place, as in `rm -rf / tmp/old` instead of `rm -rf /tmp/old`, has destroyed real production systems. Prefer `rm -ri` while learning, and always quote variables: `rm -rf "$dir"` (Section 2.6).

## 2.3 Inodes, hard links and symbolic links

A file's **name** is just an entry in a directory that points to an **inode**: the on-disk record holding the file's metadata (owner, permissions, size, timestamps) and the location of its data. The name is not part of the inode.

- A **hard link** is a second name for the same inode. Both names are equal; the data is freed only when the last name is removed (the inode's **link count** drops to 0) and no process has it open.
- A **symbolic (soft) link** is a small file containing a **path**. It can point to directories and across filesystems, but it breaks if the target is moved or deleted.

```bash run Hard links share an inode; symbolic links store a path
echo "version 1" > data.txt
ln data.txt hard.txt                    # hard link
ln -s data.txt soft.txt                 # symbolic link
stat -c '%-9n inode-same-as-data=%i links=%h type=%F' data.txt hard.txt soft.txt \
  | sed "s/=$(stat -c %i data.txt) /=YES /; s/=[0-9]\{4,\} /=NO /"
echo "version 2" >> hard.txt
cat data.txt
rm data.txt
echo "after removing data.txt:"
cat hard.txt
cat soft.txt || echo "soft link is now dangling (exit status $?)"
readlink soft.txt
```

Writing through `hard.txt` changed `data.txt` because they are the same inode. After `data.txt` was removed, the hard link still holds the data, while the symbolic link points at a path that no longer exists.

> NOTE: Deleting a file that a running process still has open does not free the disk space until the process closes it. "The disk is full but `du` finds nothing" is usually a deleted log file still held open by a server; `lsof +L1` lists such files (Chapter 10).

## 2.4 Globbing: the shell expands wildcards

Before a command runs, the **shell** expands wildcard patterns into matching file names. The program never sees the `*`.

| Pattern | Matches |
|---|---|
| `*` | Any string (not starting with `.`) |
| `?` | Exactly one character |
| `[abc]`, `[0-9]`, `[!0-9]` | One character from (or not from) a set |
| `{a,b,c}` | **Brace expansion**: generates each alternative, whether or not files exist |
| `**` | Any depth of directories (with `shopt -s globstar`) |

```bash run The shell, not the program, expands patterns
touch report1.csv report2.csv report10.csv summary.txt .hidden
echo *.csv
echo report?.csv
echo report[0-9][0-9].csv
echo {jan,feb,mar}-2026.log
echo *.pdf                               # no match: the pattern is passed through unchanged
shopt -s nullglob; echo "with nullglob: [$(echo *.pdf)]"; shopt -u nullglob
printf '%s\n' * | wc -l                  # .hidden is not matched by *
```

## 2.5 Standard streams and redirection

Every process starts with three open **file descriptors**: 0 = **standard input**, 1 = **standard output**, 2 = **standard error**. The shell can point them at files or other processes.

| Syntax | Meaning |
|---|---|
| `cmd > file` | stdout to file (truncate) |
| `cmd >> file` | stdout to file (append) |
| `cmd 2> file` | stderr to file |
| `cmd > file 2>&1` | both to file (order matters: first stdout, then stderr to wherever stdout points) |
| `cmd &> file` | both to file (bash shorthand) |
| `cmd < file` | stdin from file |
| `cmd1 \| cmd2` | stdout of cmd1 becomes stdin of cmd2 (a **pipe**) |
| `cmd > /dev/null` | discard output |
| `cmd <<'EOF' ... EOF` | **here-document**: inline stdin |

```bash run Separating and combining stdout and stderr
ls /etc/hostname /nonexistent > out.txt 2> err.txt || true
echo "stdout file:"; cat out.txt
echo "stderr file:"; cat err.txt
ls /etc/hostname /nonexistent > both.txt 2>&1 || true
echo "combined:"; cat both.txt
ls /etc/hostname /nonexistent 2>&1 > only-out.txt | sed 's/^/via pipe: /' || true
wc -l <<'EOF'
line one
line two
EOF
```

The third command shows why order matters: `2>&1 > file` first copies stderr to where stdout points **at that moment** (the pipe), and only then redirects stdout to the file, so the error goes through the pipe.

## 2.6 Quoting

The shell splits unquoted text on spaces and expands `*`, `$var` and `$(cmd)`. Quoting controls this:

| Quoting | Effect |
|---|---|
| `'single'` | Completely literal: nothing is expanded |
| `"double"` | `$var`, `$(cmd)` and `` `cmd` `` are expanded; spaces and `*` are kept literally |
| `\x` | Escape one character |
| `$'...'` | ANSI-C quoting: `$'a\tb'` contains a real tab |

```bash run Why "$var" must be quoted
file="my report.txt"
touch "$file"
ls $file 2>&1 || true                       # unquoted: split into two words
ls "$file"
name=World
echo 'Hello $name' "Hello $name" "today is $(echo Thursday)"
pattern='*.txt'
echo $pattern "$pattern"
```

> TRAP: The rule for scripts is **always double-quote variable expansions**: `"$file"`, `"$@"`. An unquoted variable holding a file name with a space, or an empty variable, is the most common source of shell-script bugs, including the classic `rm -rf $DIR/` that becomes `rm -rf /` when `DIR` is empty.

## 2.7 Getting help

`man ls` opens the manual (search with `/word`, quit with `q`); `ls --help` prints a summary; `type cmd` says whether a name is a builtin, an alias, a function or a file; `apropos keyword` searches manual descriptions; `tldr cmd` (if installed) shows practical examples.

```bash run What kind of command is it?
type cd echo ls grep 2>&1 | sed 's/(.*)/(...)/'
```

`cd` must be a **shell builtin**: a separate program could only change its own working directory, not the shell's, because each process has its own.

## 2.8 Practical lessons

- One tree from `/`; config in `/etc`, logs in `/var/log`, programs in `/usr/bin`, devices in `/dev`, kernel views in `/proc` and `/sys`.
- Names point to inodes. Hard links are extra names; symbolic links are stored paths and can dangle.
- The shell expands globs and variables before the program runs; quote `"$vars"` always.
- fd 0, 1, 2 are stdin, stdout, stderr; `> file 2>&1` sends both to a file; order matters.

# Chapter 3: Text Processing
%Answering real questions from logs with small tools and pipes

## 3.1 The sample log

Production debugging is mostly reading text. This chapter uses an access log for an API (the format resembles nginx's): client IP, timestamp, method, path, status code, response bytes and response time in milliseconds.

Every example below starts with this file, `access.log`, in the home directory:

```text
10.0.0.5 2026-03-02T10:00:01Z GET /api/meters 200 512 35
10.0.0.7 2026-03-02T10:00:02Z POST /api/readings 201 64 120
10.0.0.5 2026-03-02T10:00:03Z GET /api/meters/42 200 256 22
10.0.0.9 2026-03-02T10:00:05Z GET /api/forecast 500 98 1480
10.0.0.7 2026-03-02T10:00:06Z POST /api/readings 201 64 110
10.0.0.5 2026-03-02T10:01:10Z GET /api/meters 200 512 31
10.0.0.11 2026-03-02T10:01:12Z POST /api/login 401 40 15
10.0.0.11 2026-03-02T10:01:13Z POST /api/login 401 40 14
10.0.0.11 2026-03-02T10:01:14Z POST /api/login 401 40 16
10.0.0.11 2026-03-02T10:01:15Z POST /api/login 200 380 95
10.0.0.9 2026-03-02T10:02:00Z GET /api/forecast 500 98 1510
10.0.0.5 2026-03-02T10:02:30Z GET /api/meters/7 404 30 9
10.0.0.7 2026-03-02T10:03:00Z POST /api/readings 201 64 105
10.0.0.9 2026-03-02T10:03:05Z GET /api/forecast 200 2048 870
10.0.0.5 2026-03-02T10:04:00Z GET /api/meters 200 512 33
```

```bash run First look at the sample access log
wc -l access.log
head -3 access.log
tail -2 access.log
```

## 3.2 grep: filter lines

`grep pattern file` prints the lines containing a match. Key options: `-i` ignore case, `-v` invert, `-c` count, `-n` line numbers, `-o` print only the match, `-E` extended regular expressions, `-w` whole words, `-r` recursive, `-l` file names only, `-A`/`-B`/`-C n` context lines.

| Regex | Meaning |
|---|---|
| `.` | Any character |
| `^`, `$` | Start, end of line |
| `[0-9]`, `[^ ]` | Character class, negated class |
| `*`, `+`, `?`, `{n,m}` | Repetition (`+ ? {}` need `-E`) |
| `(a\|b)` | Alternation (with `-E`) |
| `\b` | Word boundary |

```bash run grep questions on the log
echo "server errors?"; grep ' 5[0-9][0-9] ' access.log
echo "server errors, matching the status field only:"; awk '$5 ~ /^5/' access.log
echo "count of 4xx: $(grep -cE ' 4[0-9]{2} ' access.log)"
echo "non-GET lines: $(grep -vc ' GET ' access.log)"
echo "distinct meter ids requested:"; grep -oE '/api/meters/[0-9]+' access.log | sort -u
grep -n 'forecast' access.log | cut -c1-40
```

The first command is a real trap, kept on purpose: the pattern ` 5[0-9][0-9] ` also matches the **response size** 512 in the `/api/meters` lines, so three successful requests were reported as server errors. `grep` matches anywhere in the line; when a question is about one column, select that column (`awk '$5 ~ /^5/'` tests field 5 only). The 4xx count happens to be right, but only because no other field in this log looks like 4xx.

## 3.3 cut, sort, uniq, tr, wc

| Tool | Does |
|---|---|
| `cut -d' ' -f2,4` | Select fields by delimiter; `-c1-10` selects characters |
| `sort` | Sort lines; `-n` numeric, `-r` reverse, `-k3,3` by field 3, `-t,` delimiter, `-u` unique, `-h` human sizes |
| `uniq` | Collapse **adjacent** duplicates; `-c` count, `-d` duplicated only. Sort first! |
| `tr` | Translate or delete characters: `tr a-z A-Z`, `tr -d '\r'`, `tr -s ' '` |
| `wc` | Count lines (`-l`), words (`-w`), bytes (`-c`) |
| `head -n`, `tail -n`, `tail -f` | First or last lines; follow a growing file |

The single most useful pipeline in operations is **count and rank**: `... | sort | uniq -c | sort -rn | head`.

```bash run Top clients, status-code breakdown and the slowest requests
echo "requests per client:"
cut -d' ' -f1 access.log | sort | uniq -c | sort -rn
echo "status codes:"
awk '{print $5}' access.log | sort | uniq -c | sort -rn
echo "3 slowest requests (ms, path):"
sort -k7,7nr access.log | head -3 | awk '{print $7, $4}'
echo "without sort, uniq misses non-adjacent duplicates:"
cut -d' ' -f1 access.log | uniq | wc -l
```

## 3.4 awk: a small language for columns

`awk` reads each line, splits it into fields `$1, $2, ...` (`$0` is the whole line, `NF` the number of fields, `NR` the line number), and runs `pattern { action }` rules. `BEGIN` runs before the input and `END` after. Arrays are associative (hash maps).

```bash run Aggregations with awk: average latency per endpoint, error rate, bytes served
awk '{ n[$4]++; t[$4] += $7 }
     END { for (p in n) printf "%-18s %3d req  avg %7.1f ms\n", p, n[p], t[p] / n[p] }' \
  access.log | sort
awk '$5 >= 500 { e++ }
     END { printf "error rate: %d/%d = %.1f%%\n", e, NR, 100 * e / NR }' access.log
awk '{ b += $6 } END { printf "total bytes: %d (%.1f KiB)\n", b, b / 1024 }' access.log
awk -F'T' '{ split($2, t, ":"); m[t[1] ":" t[2]]++ } END { for (k in m) print k, m[k] }' \
  access.log | sort
```

The last command uses `-F'T'` to split on the `T` in the timestamp, then `split()` to get hours and minutes: requests per minute, the start of any traffic chart.

> TIP: A brute-force detector in one line: clients with three or more failed logins. `awk '$4=="/api/login" && $5==401 {f[$1]++} END {for (ip in f) if (f[ip]>=3) print ip, f[ip]}' access.log`. The practice book asks you to extend it.

## 3.5 sed: stream editing

`sed` applies editing commands to each line. The most used is substitution, `s/old/new/flags` (`g` = every match on the line). `-n` with `p` prints selected lines; `-i` edits a file in place (keep a backup: `-i.bak`); `-E` enables extended regexes; addresses restrict commands to lines (`3,5`, `/regex/`).

```bash run Substitution, masking, extraction and in-place editing
sed -n '4,5p' access.log
sed -E 's/^([0-9]+\.[0-9]+)\.[0-9]+\.[0-9]+/\1.x.x/' access.log | head -3
sed -nE 's|.* (/api/[a-z]+).* ([0-9]+)$|\1 \2|p' access.log | head -3
printf 'port=8080\nhost=localhost\n' > app.conf
sed -i.bak 's/^port=.*/port=9090/' app.conf
cat app.conf; echo "backup:"; cat app.conf.bak
```

The second command **masks IP addresses** (keeping the first two octets): a typical privacy step before sharing logs.

## 3.6 find and xargs

`find` walks a directory tree and selects files by name, type, size, time, permissions or owner, then prints or acts on them. `xargs` turns input lines into command-line arguments.

| Test | Selects |
|---|---|
| `-name '*.log'`, `-iname` | Name pattern (quote it so the shell does not expand it) |
| `-type f`, `-type d`, `-type l` | Files, directories, links |
| `-size +100M`, `-size -1k` | Larger or smaller than |
| `-mtime +7`, `-mmin -30` | Modified more than 7 days ago; within 30 minutes |
| `-perm -o=w` | World-writable |
| `-empty`, `-user nobody` | Empty; owned by a user |
| `-exec cmd {} +`, `-delete` | Run a command on matches; delete matches |

```bash run Finding old logs and acting on them safely
mkdir -p logs/2026 && cd logs
for d in 01 05 10 20; do touch -d "2026-02-$d 12:00" "2026/app-$d.log"; done
touch -d '2026-02-25 12:00' "2026/app with space.log"
echo "older than 2026-02-15:"
find . -name '*.log' ! -newer 2026/app-10.log | sort
echo "count of logs per directory:"; find . -name '*.log' -printf '%h\n' | sort | uniq -c
find . -name '*.log' -print0 | xargs -0 ls | wc -l
find . -name '*.log' | xargs ls 2>&1 | grep -c 'No such file' || true
```

The last two lines show the classic trap: plain `xargs` splits on spaces, so `app with space.log` becomes three non-existent files. `find -print0 | xargs -0` (or `find -exec ... {} +`) separates names with the NUL byte, which cannot appear in a file name.

## 3.7 Comparing files and other everyday tools

```bash run diff, comm, paste, column, tee
printf 'alice\nbob\ncarol\n' > before.txt
printf 'alice\ncarol\ndave\n' > after.txt
diff before.txt after.txt || true
echo "only in before: $(comm -23 before.txt after.txt)"
echo "only in after:  $(comm -13 before.txt after.txt)"
echo "in both:        $(comm -12 before.txt after.txt | tr '\n' ' ')"
paste -d, before.txt after.txt
printf 'name size\napp.jar 52M\nconfig.yml 4K\n' | column -t
echo "checkpoint" | tee copy.txt | tr a-z A-Z; cat copy.txt
```

`diff` reports line 2 deleted (`2d1`, `<` marks the old file) and a line added after line 3 (`3a3`, `>` marks the new file); `comm` needs sorted input and splits lines into only-first, only-second and both. `diff` exits with status 1 when files differ (which is why `|| true` is needed under strict scripts); `tee` writes to a file **and** passes the data on, useful for saving an intermediate step of a pipeline.

## 3.8 Practical lessons

- `grep` filters, `cut`/`awk` select columns, `sort | uniq -c | sort -rn` counts and ranks, `sed` rewrites.
- `awk` aggregates: sums, averages and group-by counts in one line.
- Use `find -print0 | xargs -0` or `-exec {} +` for file names with spaces.
- Read logs with `less` (search `/`, `n`, `G` to end) and `tail -f` (follow); never open a 10 GB log in an editor.
