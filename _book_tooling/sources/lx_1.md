# Chapter 4: Users and Permissions
%Who may read, write and execute what, and how to change it safely

## 4.1 Users, groups and the root account

Every process runs as a **user** (a number, the UID) and belongs to one or more **groups** (GIDs). The kernel checks these numbers on every file access. Names are only labels stored in `/etc/passwd` and `/etc/group`; password hashes live in `/etc/shadow`, readable only by root.

| UID | Who |
|---|---|
| 0 | **root**, the administrator: permission checks are bypassed |
| 1–999 | System accounts for services (`www-data`, `mysql`, `nobody` = 65534), usually with no login shell |
| 1000+ | Human users |

```bash run Who am I, and what do the account files say?
id
whoami
grep -E '^(root|nobody|www-data):' /etc/passwd
echo "fields: name:password-placeholder:UID:GID:comment:home:shell"
cat /etc/shadow 2>&1 || true
getent group sudo | cut -d: -f1,3
```

The `x` in the password field means the hash is in `/etc/shadow`, and our unprivileged user cannot read that file: exactly the protection intended.

Administration commands (they need root, so they are shown without output):

```text
sudo groupadd devs                        # create a group
sudo useradd -m -s /bin/bash -G devs priya  # user with a home directory, in group devs
sudo passwd priya                         # set the password
sudo usermod -aG docker priya             # add a group (-a = append; without it, replace!)
sudo userdel -r priya                     # delete the user and the home directory
su - priya                                # login shell as priya (asks for priya's password)
sudo -i                                   # root shell (asks for YOUR password; needs sudoers)
```

> TRAP: `usermod -G docker priya` without `-a` **removes** priya from every other supplementary group, including `sudo`. Always `-aG`. And group changes take effect at the next login (or with `newgrp`).

## 4.2 Reading permissions

`ls -l` shows ten characters: the type, then three triplets for the **owner** (u), the **group** (g) and **others** (o). Each triplet is `r` (read), `w` (write), `x` (execute), or `-`.

| | On a file | On a directory |
|---|---|---|
| `r` | Read the contents | List the names inside |
| `w` | Modify the contents | Create, delete or rename entries inside (even files you do not own!) |
| `x` | Run it as a program | Enter it (`cd`) and access entries by name |

The kernel checks **one** triplet: owner if you own the file, else group if you are in its group, else others. It does not fall through: an owner with `---` is denied even if others have `rwx`.

**Octal notation** adds r = 4, w = 2, x = 1 per triplet: `rwxr-xr--` = 7, 5, 4 = **754**.

| Mode | Typical use |
|---|---|
| 644 `rw-r--r--` | Ordinary files |
| 600 `rw-------` | Secrets: SSH private keys, `.env` files with passwords |
| 755 `rwxr-xr-x` | Programs, scripts and directories |
| 700 `rwx------` | Private directories (`~/.ssh`) |
| 777 | Almost never: anyone can modify. A security finding in any audit |

```bash run Permission checks are real: the owner can lock themselves out
echo "secret" > note.txt
stat -c '%A %a %U %n' note.txt
chmod 000 note.txt;  cat note.txt 2>&1 || true
chmod u+r note.txt;  cat note.txt
chmod 070 note.txt;  cat note.txt 2>&1 || true      # group may read, but the owner may not
chmod 640 note.txt;  stat -c '%A %a' note.txt
chmod u=rwx,g=rx,o= note.txt; stat -c '%A %a' note.txt
```

With mode 070 the owner is refused, although the group triplet allows reading: the owner's triplet is the only one checked for the owner.

## 4.3 Directory permissions in practice

```bash run What r, w and x mean on a directory
mkdir box && echo hi > box/f.txt
chmod 300 box                       # -wx: enter and create, but not list
ls box 2>&1 || true
cat box/f.txt                       # access by known name still works
chmod 600 box                       # rw-: list names, but not enter
ls box 2>&1 || true
cat box/f.txt 2>&1 || true
chmod 755 box
chmod 444 box/f.txt                 # the FILE is read-only ...
rm -f box/f.txt && echo "... yet it was deleted: deletion needs w on the directory"
```

Two lessons interviewers like. With `x` but no `r` you can open a file whose name you know, but not list the directory; with `r` but no `x` you can list the names but not open anything inside. And **deleting a file is an operation on the directory**, so a read-only file in a directory you can write is still deletable.

## 4.4 umask: default permissions

New files start from 666 and directories from 777, minus the bits in the **umask**. The common umask 022 removes write for group and others, giving 644 and 755. A umask of 077 makes everything private.

```bash run umask decides the mode of new files
for m in 022 027 077; do
  umask $m; rm -rf d f; touch f; mkdir d
  printf 'umask %s -> file %s, directory %s\n' "$m" "$(stat -c %a f)" "$(stat -c %a d)"
done
```

## 4.5 Special bits: setuid, setgid and sticky

| Bit | Octal | On a file | On a directory |
|---|---|---|---|
| **setuid** (`s` in owner x) | 4000 | The program runs with the **file owner's** UID | — |
| **setgid** (`s` in group x) | 2000 | Runs with the file's group | New files inherit the directory's group (shared team folders) |
| **sticky** (`t` in others x) | 1000 | — | Only a file's owner may delete or rename it, even though everyone can write the directory |

```bash run Special bits on real system files
stat -c '%A %a %U %n' /usr/bin/passwd /tmp
mkdir shared && chmod 2775 shared && stat -c '%A %a %n' shared
```

`passwd` is **setuid root**: an ordinary user runs it and it can update `/etc/shadow`, but only in the controlled way the program allows. `/tmp` is world-writable with the **sticky bit**, so users cannot delete each other's files. Setuid programs are prime attack targets; a security audit lists them with `find / -perm -4000 -type f 2>/dev/null`.

## 4.6 Ownership and sudo

Only root can give a file to another user (`chown`), because otherwise users could dodge disk quotas or plant files that appear to be someone else's. A user may change a file's group only to a group they belong to.

```bash run chown needs root; chgrp only to your own groups
touch mine.txt
chown root mine.txt 2>&1 || true
chgrp sudo mine.txt 2>&1 || true
chgrp nogroup mine.txt && stat -c '%U:%G %n' mine.txt
sudo -n true 2>&1 || true
```

**sudo** runs one command as root (or another user) after checking `/etc/sudoers` and asking for **your** password. It logs every use, allows fine-grained rules ("deploy may restart nginx and nothing else"), and avoids sharing the root password. Edit the rules only with `visudo`, which refuses to save a file with syntax errors that would lock everyone out.

```text
# /etc/sudoers.d/deploy  (edit with: sudo visudo -f /etc/sudoers.d/deploy)
deploy ALL=(root) NOPASSWD: /usr/bin/systemctl restart meter-api
```

## 4.7 Access control lists

Classic permissions have exactly one owner and one group. **ACLs** add per-user and per-group entries, for example "the backup user may read this directory too", without changing ownership. A `+` after the mode in `ls -l` signals an ACL.

```bash run Granting one extra user read access with an ACL
echo "report" > q3.txt && chmod 600 q3.txt
setfacl -m u:daemon:r q3.txt
ls -l q3.txt | cut -d' ' -f1
getfacl -p q3.txt 2>/dev/null
setfacl -b q3.txt && ls -l q3.txt | cut -d' ' -f1
```

The `mask` line limits what named users and groups can receive: it is the maximum, whatever an entry says.

## 4.8 Practical lessons

- Owner, group, others; r = 4, w = 2, x = 1; only the first matching triplet counts.
- On directories, x means enter and w means create or delete entries: deletion is a directory operation.
- Secrets 600, private directories 700, programs 755, never 777.
- umask 022 gives 644/755; setgid on a directory shares group ownership; the sticky bit protects `/tmp`.
- `chown` needs root; use `sudo` with narrow rules and `visudo`; ACLs (`setfacl`) for one-off extra access.

# Chapter 5: Processes and Signals
%Programs in motion: process trees, jobs, signals, exit codes, /proc and resources

## 5.1 What a process is

A **process** is a running instance of a program: its own memory, a set of open file descriptors, a current directory, environment variables, a user and group, and a unique **PID**. Every process (except PID 1) has a **parent** that created it. The shell runs a command by **fork** (copy itself) then **exec** (replace the copy's program with the command), and **waits** for it to finish.

```bash run Parent and child: the shell is the parent of the commands it runs
echo "shell PID is a number like any other: $([ "$$" -gt 0 ] && echo yes)"
sleep 30 &
child=$!
parent=$(ps -o ppid= -p "$child" | tr -d ' ')
echo "parent of sleep is this shell: $([ "$parent" = "$$" ] && echo yes)"
ps -o user=,stat=,comm= -p "$child"
kill "$child"
wait "$child" 2>/dev/null; echo "exit status of the killed sleep: $?"
bash -c 'echo "a child bash sees PPID equal to our PID: $([ "$PPID" = "'$$'" ] && echo yes)"'
```

PIDs differ on every run, so the block compares them rather than printing them. The exit status 143 is 128 + 15: killed by signal 15 (Section 5.4).

## 5.2 Looking at processes

| Command | Shows |
|---|---|
| `ps aux` | Every process: user, PID, %CPU, %MEM, memory, state, start time, command |
| `ps -ef --forest`, `pstree` | The parent–child tree |
| `ps -o pid,ppid,stat,ni,rss,comm -p PID` | Chosen columns for chosen processes |
| `top`, `htop` | Live view sorted by CPU (press `M` for memory, `1` for per-CPU, `q` to quit) |
| `pgrep -a java`, `pidof nginx` | Find PIDs by name |
| `lsof -p PID`, `lsof -i :8080` | Open files of a process; who uses a port |

The **STAT** column: `R` running, `S` sleeping (waiting for something), `D` uninterruptible sleep (usually disk or network I/O; cannot be killed until it returns), `T` stopped, `Z` zombie. Extra letters: `s` session leader, `+` foreground, `<` high priority, `N` low priority.

```bash run Process states you can create on purpose
sleep 60 &   s=$!
sh -c 'kill -STOP $$; sleep 1' &   t=$!
python3 -c 'import os, time
pid = os.fork()
if pid == 0:
    os._exit(0)          # child exits at once ...
time.sleep(3)            # ... but the parent does not wait() for it yet
' &
sleep 1
ps -o stat=,comm= -p "$s" | sed 's/^/sleeping: /'
ps -o stat=,comm= -p "$t" | sed 's/^/stopped:  /'
ps -o stat=,comm= --ppid "$!" | sed 's/^/zombie:   /'
kill -KILL "$s" "$t"; wait 2>/dev/null; true
```

A **zombie** (`Z`, shown as `<defunct>`) is a finished child whose parent has not yet collected its exit status with `wait()`. It uses no memory, only a slot in the process table. Many zombies mean a buggy parent; the fix is in the parent (or killing it, after which PID 1 adopts and reaps the children). An **orphan** is the opposite: a running child whose parent died; it is adopted by PID 1 (or a designated "subreaper") and keeps running.

## 5.3 Foreground, background and jobs

| Action | Effect |
|---|---|
| `cmd &` | Run in the background; `$!` holds its PID |
| `Ctrl+C` | Send SIGINT to the foreground job (usually terminates it) |
| `Ctrl+Z` | Send SIGTSTP: stop (pause) the foreground job |
| `jobs`, `fg %1`, `bg %1` | List jobs; resume job 1 in the foreground or background |
| `wait`, `wait $pid` | Wait for background jobs |
| `nohup cmd &`, `setsid cmd`, `disown` | Keep running after you log out (no SIGHUP) |
| `tmux`, `screen` | A terminal session that survives disconnection: the normal way to run a long job on a server |

```bash run Running work in parallel and collecting exit codes
work() { sleep "$1"; return "$2"; }
work 0.3 0 & a=$!
work 0.1 3 & b=$!
work 0.2 0 & c=$!
for p in $a $b $c; do wait "$p"; echo "job finished with status $?"; done
```

`wait` returns each job's exit status, which is how a script runs tasks in parallel but still detects a failure.

## 5.4 Signals

A **signal** is a small asynchronous notification sent to a process by the kernel, by another process (`kill`), or by the terminal.

| Signal | Number | Default | Typical use |
|---|---|---|---|
| SIGHUP | 1 | Terminate | Terminal closed; many daemons reload configuration on HUP |
| SIGINT | 2 | Terminate | Ctrl+C |
| SIGQUIT | 3 | Core dump | Ctrl+\\; the JVM prints a thread dump instead |
| SIGKILL | 9 | Terminate | Cannot be caught, blocked or ignored: the last resort |
| SIGSEGV | 11 | Core dump | Invalid memory access |
| SIGTERM | 15 | Terminate | Polite request to exit: the default of `kill`, sent by `systemctl stop`, `docker stop`, Kubernetes |
| SIGCHLD | 17 | Ignore | A child stopped or exited |
| SIGSTOP / SIGCONT | 19 / 18 | Stop / continue | Pause and resume; STOP cannot be caught |
| SIGUSR1/2 | 10 / 12 | Terminate | Application-defined (rotate logs, dump state) |

A program can install a **handler** to clean up on SIGTERM (finish in-flight requests, flush buffers, close database connections): this is **graceful shutdown**. SIGKILL gives it no chance, so always try TERM first, wait, and only then KILL. A process killed by signal N exits with status **128 + N**.

```bash run Handling SIGTERM gracefully, and why SIGKILL cannot be handled
cat > server.sh <<'EOF'
trap 'echo "got SIGTERM: finishing requests, closing DB pool"; exit 0' TERM
trap 'echo "SIGINT ignored"' INT
echo "server ready"
while true; do sleep 0.1; done
EOF
bash server.sh & p=$!; sleep 0.5
kill -INT "$p"; sleep 0.3
kill -TERM "$p"; wait "$p"; echo "exit status after TERM: $?"
bash server.sh & p=$!; sleep 0.5
kill -KILL "$p"; wait "$p" 2>/dev/null
echo "exit status after KILL: $? (128 + 9), no cleanup message"
kill -l 15 9 2
```

Notice what is **missing**: the `SIGINT ignored` message never appeared. When a non-interactive shell starts a command in the background, it sets SIGINT and SIGQUIT to "ignore" for that command (so a Ctrl+C in the terminal does not kill background work), and a signal that is ignored when a shell starts **cannot be trapped**. The INT was silently dropped, and the server carried on until TERM. Never rely on SIGINT to stop a background service; use TERM.

> TIP: In Docker, your application must be **PID 1** of the container or receive signals from it. A Dockerfile ending in `CMD java -jar app.jar` (shell form) runs `sh -c`, which may not forward SIGTERM, so `docker stop` waits 10 seconds and then sends SIGKILL. Use the exec form `CMD ["java", "-jar", "app.jar"]`, or `exec` in an entry-point script.

## 5.5 Exit codes

Every command returns an **exit status**: 0 means success, anything from 1 to 255 means failure. `$?` holds the last one. `&&` runs the next command only on success, `||` only on failure. Conventions: 1 general error, 2 misuse (bad options), 126 found but not executable, 127 command not found, 128 + N killed by signal N.

```bash run Exit codes of common failures
true;  echo "true -> $?"
false; echo "false -> $?"
grep -q nomatch /etc/hostname; echo "grep with no match -> $?"
ls /nonexistent 2>/dev/null; echo "ls missing file -> $?"
nosuchcommand 2>/dev/null; echo "unknown command -> $?"
printf 'echo hi\n' > s.sh; ./s.sh 2>/dev/null; echo "not executable -> $?"
mkdir -p out && echo "made" || echo "failed"
```

## 5.6 Inside /proc

`/proc/<PID>/` is a directory of virtual files generated by the kernel for each process. `/proc/self` is the process reading it.

| File | Contains |
|---|---|
| `cmdline`, `environ` | Command line and environment (NUL-separated) |
| `status` | Name, state, UIDs, memory (VmRSS = resident memory), threads |
| `fd/` | One symbolic link per open file descriptor |
| `cwd`, `exe` | Links to the working directory and the program |
| `limits` | Resource limits |
| `/proc/meminfo`, `/proc/cpuinfo`, `/proc/loadavg` | System-wide memory, CPUs, load |

```bash run Exploring a process through /proc
sleep 30 > out.log 2>&1 < /dev/null &
p=$!
tr '\0' ' ' < /proc/$p/cmdline; echo
grep -E '^(Name|State|Uid|Threads):' /proc/$p/status | tr -s '\t ' ' '
ls -l /proc/$p/fd | awk 'NR > 1 {print $9, $10, $11}'
readlink /proc/$p/cwd
kill $p
```

File descriptor 0 points at `/dev/null` and 1 and 2 at `out.log`, exactly as the redirections asked: redirection is nothing more than the shell arranging these links before `exec`.

## 5.7 Resources: CPU, memory, disk and limits

| Question | Command |
|---|---|
| How loaded is the machine? | `uptime` (load averages over 1, 5, 15 minutes; compare with `nproc`) |
| Memory? | `free -h`: look at **available**, not "free" (Linux uses spare memory as disk cache) |
| Disk space? | `df -h` (per filesystem), `du -sh dir` (per directory), `du -sh * \| sort -h` |
| Inodes? | `df -i`: a disk can be "full" of millions of tiny files with space left |
| Which process uses CPU or memory? | `top`, `ps aux --sort=-%mem \| head` |
| Disk and network I/O? | `iostat -x 1`, `vmstat 1`, `iotop`, `sar` |
| Per-process limits? | `ulimit -a` (open files, processes, stack) |
| Priority? | `nice -n 10 cmd` (lower priority), `renice` |

```bash run Limits are real: running out of file descriptors
ulimit -n 64
python3 - <<'EOF'
files = []
try:
    while True:
        files.append(open('/dev/null'))
except OSError as e:
    print(f'opened {len(files)} files, then: {e.strerror} (errno {e.errno})')
EOF
nice -n 10 sh -c 'echo "niceness inside: $(ps -o ni= -p $$ | tr -d " ")"'
```

The process could open only 61 files because 3 descriptors (stdin, stdout, stderr) were already in use. "Too many open files" is a real production error for busy servers holding many sockets; the fix is raising `LimitNOFILE` in the service unit (Chapter 8), and checking for descriptor leaks first.

## 5.8 Practical lessons

- Processes form a tree; the shell forks and execs; parents must `wait()` or children become zombies.
- `ps -o`, `top`, `pgrep`, `lsof` to inspect; `/proc/PID` for the details.
- `kill` sends TERM (15) by default: handle it for graceful shutdown; KILL (9) cannot be handled.
- Exit status 0 is success; 127 command not found; 128 + N killed by signal N.
- Use `tmux` or `nohup` for long jobs; check `ulimit -n` for busy servers.
