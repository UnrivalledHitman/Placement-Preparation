# Chapter 8: Packages, Services, Logs and Scheduling
%Installing software, running it as a service, reading its logs and running jobs on a schedule

## 8.1 Environment variables and PATH

Every process inherits a set of **environment variables** from its parent. `export` marks a shell variable to be passed to children. `PATH` is a colon-separated list of directories searched, in order, for commands. Applications read their configuration from the environment (database URLs, ports, API keys): the "twelve-factor" style used by Docker and Kubernetes.

```bash run Shell variables versus exported environment variables, and PATH lookup
APP_PORT=8080
bash -c 'echo "child sees APP_PORT=[$APP_PORT]"'
export APP_PORT
bash -c 'echo "after export: [$APP_PORT]"'
DB_URL=jdbc:mysql://db:3306/meters bash -c 'echo "one-off for one command: $DB_URL"'
echo "$PATH" | tr ':' '\n' | head -4
mkdir -p bin && printf '#!/bin/sh\necho "my own ls!"\n' > bin/ls && chmod +x bin/ls
PATH="$HOME/bin:$PATH" bash -c 'ls; command -v ls' | sed "s|$HOME|~|"
```

Putting `~/bin` first in `PATH` made a script called `ls` shadow the real one: a reason never to put `.` (the current directory) in `PATH`, where a malicious file named `ls` in some directory would run instead.

Persistent settings go in `~/.bashrc` (interactive shells), `~/.profile` (login shells), `/etc/environment` (system-wide), or the service's own unit file (Section 8.3).

## 8.2 Package managers

A package manager installs software with its dependencies from signed repositories, records what is installed, and upgrades or removes it cleanly.

| Task | Debian/Ubuntu (`apt`, `dpkg`) | Red Hat/Fedora/Amazon Linux (`dnf`, `rpm`) | Alpine (`apk`) |
|---|---|---|---|
| Refresh the package index | `sudo apt update` | (automatic) | `apk update` |
| Install | `sudo apt install nginx` | `sudo dnf install nginx` | `apk add nginx` |
| Remove | `sudo apt remove nginx` | `sudo dnf remove nginx` | `apk del nginx` |
| Upgrade everything | `sudo apt upgrade` | `sudo dnf upgrade` | `apk upgrade` |
| Search | `apt search redis` | `dnf search redis` | `apk search redis` |
| Is it installed? Which version? | `dpkg -s pkg`, `apt list --installed` | `rpm -q pkg` | `apk info pkg` |
| Which package owns a file? | `dpkg -S /usr/bin/ss` | `rpm -qf /usr/bin/ss` | `apk info --who-owns` |

```bash run Querying the package database (no root needed for queries)
dpkg -S /usr/bin/curl /usr/bin/jq | sort
dpkg -s bash | grep -E '^(Package|Status|Priority)'
dpkg -L coreutils | grep -c '^/usr/bin/' | sed 's/$/ programs in coreutils/'
apt-get install -y cowsay 2>&1 | grep -o 'are you root?' | head -1
```

Language ecosystems have their own managers (`pip`, `npm`, `maven`); in containers you typically use the OS manager for system libraries and the language manager for application dependencies, pinned to exact versions.

## 8.3 systemd: running a program as a service

On almost all modern distributions, PID 1 is **systemd**. It starts services at boot, restarts them when they crash, collects their logs, and enforces limits. A service is described by a **unit file**:

```text
# /etc/systemd/system/meter-api.service
[Unit]
Description=Meter API (Spring Boot)
After=network-online.target mysql.service
Wants=network-online.target

[Service]
User=meter                                  # never run as root
WorkingDirectory=/opt/meter-api
EnvironmentFile=/etc/meter-api/env          # DB_URL=..., DB_PASSWORD=... (mode 600)
ExecStart=/usr/bin/java -Xmx512m -jar /opt/meter-api/app.jar
Restart=on-failure
RestartSec=5
LimitNOFILE=65536                           # file-descriptor limit (Section 5.7)
TimeoutStopSec=30                           # SIGTERM, wait 30 s, then SIGKILL

[Install]
WantedBy=multi-user.target                  # start at boot
```

| Command (needs root except `status`) | Effect |
|---|---|
| `systemctl daemon-reload` | Re-read unit files after editing |
| `systemctl enable --now meter-api` | Start now and at every boot |
| `systemctl start/stop/restart meter-api` | Control it |
| `systemctl reload nginx` | Ask it to reload configuration (if it supports reload) |
| `systemctl status meter-api` | State, PID, memory, last log lines |
| `systemctl list-units --failed` | What is broken |
| `systemctl cat meter-api` | Show the unit file in effect |

```bash run The unit file above is checked by systemd's own parser
cat > meter-api.service <<'EOF'
[Unit]
Description=Meter API
[Service]
User=meter
ExecStart=/usr/bin/java -jar /opt/meter-api/app.jar
Restart=on-failure
LimitNOFILE=65536
Restrat=always
[Install]
WantedBy=multi-user.target
EOF
systemd-analyze verify ./meter-api.service 2>&1 \
  | sed 's|.*/meter-api.service|meter-api.service|' | grep -v 'not executable' | head -3
systemctl status 2>&1 | head -1
```

`systemd-analyze verify` caught the misspelt key `Restrat` (and would warn about other mistakes) without starting anything. The last line is honest: the container that ran this book does not boot with systemd, so service management cannot be demonstrated live here; on a VM or WSL with systemd enabled, the commands in the table work as shown.

> TIP: In containers you normally do **not** run systemd: the container runtime (Docker, Kubernetes) plays its role, restarting the container and collecting its stdout as logs. That is why containerised applications should log to stdout, not to files.

## 8.4 Logs

| Where | What |
|---|---|
| `journalctl -u meter-api` | A service's logs in the systemd journal; `-f` follow, `--since "1 hour ago"`, `-p err` errors only, `-b` since boot, `-o json` |
| `/var/log/syslog` or `/var/log/messages` | General system log (text) |
| `/var/log/auth.log` or `/var/log/secure` | Logins, sudo use: the first place to look after a suspected break-in |
| `/var/log/nginx/access.log`, `error.log` | Web server logs |
| `/var/log/kern.log`, `dmesg` | Kernel messages: hardware errors, the **OOM killer** |
| `/var/log/apt/history.log`, `dpkg.log` | What was installed when |

**logrotate** stops logs from filling the disk: it renames, compresses and deletes old logs on a schedule.

```text
# /etc/logrotate.d/meter-api
/var/log/meter-api/*.log {
    daily
    rotate 14            # keep 14 old files
    compress
    delaycompress        # keep yesterday's uncompressed for easy reading
    missingok
    notifempty
    copytruncate         # for apps that cannot reopen their log file
}
```

```bash run Reading a package log: what was installed, and when
ls /var/log | grep -E '^(apt|dpkg.log|journal)$'
grep -h ' install ' /var/log/dpkg.log | awk '{print $4}' | cut -d: -f1 \
  | grep -xE 'iproute2|acl|cron|openssh-client|bsdextrautils' | sort -u
```

## 8.5 Scheduling with cron and timers

**cron** runs commands on a schedule. Each user has a crontab (`crontab -e` to edit, `crontab -l` to list); system jobs live in `/etc/cron.d/`. The five time fields are minute, hour, day of month, month, day of week (0 or 7 = Sunday).

| Entry | Runs |
|---|---|
| `*/5 * * * * /usr/local/bin/healthcheck.sh` | Every 5 minutes |
| `30 2 * * * /usr/local/bin/rotate.sh -k 14 /var/log/meter-api` | 02:30 every day |
| `0 9 * * 1-5 /opt/reports/send.sh` | 09:00 Monday to Friday |
| `0 0 1 * * /opt/billing/run.sh` | Midnight on the 1st of every month |
| `@reboot /opt/agent/start.sh` | Once at boot |

> TRAP: cron runs jobs with a **minimal environment**: a short `PATH`, no `.bashrc`, and the user's home as the working directory. A script that works in your terminal fails silently from cron. Use absolute paths, set `PATH` at the top of the crontab, and redirect output to a log: `... >> /var/log/rotate.log 2>&1`. Also guard against overlapping runs with `flock -n /tmp/job.lock cmd`.

```bash run What a cron job's environment really looks like, and flock against overlaps
env -i HOME="$HOME" SHELL=/bin/sh PATH=/usr/bin:/bin LOGNAME=nobody sh -c 'env | sort'
flock -n job.lock sleep 1 & sleep 0.2
flock -n job.lock echo "second copy ran" || echo "second copy skipped: lock held"
wait
```

systemd **timers** are the modern alternative: a `.timer` unit triggers a `.service` unit, with logs in the journal, randomised delays, and catch-up of runs missed while the machine was off (`Persistent=true`).

## 8.6 Practical lessons

- `export` passes variables to children; `PATH` is searched in order; never put `.` in it.
- Install with the distribution's package manager; pin versions in images.
- Run long-lived programs as systemd services (dedicated user, `Restart=on-failure`, limits) or as containers.
- Logs: `journalctl -u`, `/var/log`, logrotate; containers log to stdout.
- cron has a minimal environment: absolute paths, explicit `PATH`, log redirection, `flock`.

# Chapter 9: Inside the Kernel
%System calls, file descriptors, memory, the page cache, namespaces and cgroups

## 9.1 User space, kernel space and system calls

Programs run in **user space** with no direct access to hardware. To open a file, allocate memory, send a packet or start a process they make a **system call**: a controlled jump into the kernel (`openat`, `read`, `write`, `mmap`, `clone`, `execve`, `socket`, `connect`). Library functions such as Java's `FileInputStream` or Python's `open()` are wrappers around these. `strace` shows them.

```bash run Watching the system calls of a simple command
echo "hello kernel" > in.txt
strace -e trace=openat,read,write,close -o trace.txt cat in.txt > /dev/null
grep -E 'in.txt|hello' trace.txt | sed 's/ = [0-9]*$/ = n/'
strace -c -o summary.txt cat in.txt > /dev/null
awk 'NR > 2 && $NF ~ /^[a-z_0-9]+$/ && $NF != "total" {print $NF}' summary.txt \
  | sort | tr '\n' ' '
echo
```

`cat` opens the file (getting a **file descriptor** back), reads it, writes to fd 1, reads again until 0 bytes (end of file), and closes it. The summary lists every distinct system call `cat` made, most of them by the dynamic loader before `main` even starts.

> TIP: `strace -f -p PID` attaches to a running process. When a program hangs, the last system call tells you what it waits for: `connect(` to a database host, `read(` on a socket, `futex(` (a lock). `strace -e trace=openat` shows which configuration files a program actually reads.

## 9.2 File descriptors

A **file descriptor** is a small integer indexing the process's table of open files, pipes and sockets. The kernel always hands out the **lowest free number**, which is how redirection works: close 1, open a file, and it becomes stdout.

```bash run Descriptors are per-process numbers; the lowest free one is reused
exec 3> three.txt                     # open fd 3 for writing in this shell
echo "written through fd 3" >&3
exec 3>&-                             # close it
cat three.txt
python3 - <<'EOF'
import os
a = os.open('/etc/hostname', os.O_RDONLY)
b = os.open('/etc/hostname', os.O_RDONLY)
print('first two new fds:', a, b, flush=True)
os.close(a)
c = os.open('/etc/passwd', os.O_RDONLY)
print('after closing', a, 'the next open gets', c, flush=True)
os.close(1)
fd = os.open('redirected.txt', os.O_WRONLY | os.O_CREAT, 0o644)
os.write(fd, b'this went to fd %d, which is stdout\n' % fd)
EOF
cat redirected.txt
```

The `flush=True` matters: Python buffers output written to a pipe, and without it the two printed lines would have been flushed at exit into fd 1, which by then is `redirected.txt`. Each process has descriptors 0, 1, 2 already open, so the first new one is 3. Closing fd 1 and opening a file gave the file number 1: the program now "prints" into the file without knowing it. Sockets are descriptors too, which is why a server with 10,000 connections needs a file-descriptor limit above 10,000.

## 9.3 Memory: virtual, resident, shared and the OOM killer

Each process sees its own **virtual address space**; the kernel maps pages (4 KiB) of it to physical memory only when they are touched. **VSZ/VIRT** is the virtual size (what was reserved), **RSS/RES** what is actually in RAM. When RAM runs out and nothing can be freed, the kernel's **OOM killer** kills the process with the highest "badness" score (`dmesg` shows "Out of memory: Killed process ..."), and a container exceeding its memory limit is killed the same way (exit 137 = 128 + SIGKILL).

```bash run Reserving memory is not using it: virtual versus resident size
python3 - <<'EOF'
import mmap
def kb(field):
    for line in open('/proc/self/status'):
        if line.startswith(field):
            return int(line.split()[1])
base_v, base_r = kb('VmSize'), kb('VmRSS')
m = mmap.mmap(-1, 512 * 1024 * 1024)           # reserve 512 MiB
print(f'after reserving 512 MiB: virtual +{(kb("VmSize") - base_v) // 1024} MiB, '
      f'resident +{(kb("VmRSS") - base_r) // 1024} MiB')
for i in range(0, 100 * 1024 * 1024, 4096):     # touch 100 MiB, one byte per page
    m[i] = 1
print(f'after touching 100 MiB:  virtual +{(kb("VmSize") - base_v) // 1024} MiB, '
      f'resident +{(kb("VmRSS") - base_r) // 1024} MiB')
EOF
```

Reserving 512 MiB cost no physical memory; only the pages actually written became resident. This is why the sum of VIRT in `top` can exceed RAM, why Java's `-Xmx` is a limit and not an immediate allocation, and why memory is judged by RSS.

**Swap** extends memory onto disk; it prevents some OOM kills but a server that swaps heavily becomes very slow. Kubernetes nodes usually disable it.

## 9.4 The page cache

Linux keeps recently read file data in otherwise unused RAM, the **page cache**. The second read of a file comes from memory, which is why `free` shows little "free" memory on a healthy machine (it is "available": the cache is dropped instantly when programs need RAM). Writes also go to the cache first and reach the disk later; `fsync()` forces them out, which databases do on commit for durability.

```bash run Memory accounting fields the kernel exposes
grep -E '^(MemTotal|MemFree|MemAvailable|Cached|SwapTotal):' /proc/meminfo | awk '{print $1}'
echo "page size: $(getconf PAGESIZE) bytes"
```

(The values differ by machine; read them with `free -h`. Judge free memory by **MemAvailable**.)

## 9.5 Containers are processes: namespaces and cgroups

A container is not a virtual machine. It is an ordinary Linux process that the kernel isolates with:

- **Namespaces**, which give it a private view: `pid` (its own PID 1), `net` (its own interfaces and ports), `mnt` (its own filesystem tree), `uts` (its own hostname), `ipc`, `user` (its own UID mapping, so "root" inside is unprivileged outside).
- **cgroups** (control groups), which limit and account resources: memory, CPU, number of processes, I/O.

Docker, containerd and Kubernetes are tools that set these up, plus an image (a tarball of a filesystem). `unshare` creates namespaces directly, and even an unprivileged user can do it with a user namespace (`-r` maps us to root inside it):

```bash run Building pieces of a container by hand with unshare
echo "--- outside: our hostname is not box-1, and we are not root"
[ "$(hostname)" != box-1 ] && echo "hostname differs"; id -u
echo "--- new user + UTS namespace: root inside, own hostname"
unshare -r -u sh -c 'hostname box-1; echo "hostname: $(hostname), uid inside: $(id -u)"'
echo "--- new PID namespace: the first process is PID 1"
unshare -r -p -f --mount-proc ps -o pid,comm
echo "--- new network namespace: only a loopback interface, and it is down"
unshare -r -n ip -brief link
echo "--- cgroup membership of this shell (one line per hierarchy)"
wc -l < /proc/self/cgroup
```

That is the essence of a container: a process tree that believes it is PID 1 on a machine called `box-1`, with its own network stack, created in milliseconds because nothing is emulated. Kubernetes memory and CPU **limits** are cgroup settings; when a pod is "OOMKilled", the cgroup memory limit was exceeded.

## 9.6 Boot, init and run levels

Firmware (UEFI/BIOS) → boot loader (GRUB) loads the **kernel** and an initial RAM disk → the kernel initialises hardware and mounts the root filesystem → it starts **PID 1** (systemd) → systemd starts units in dependency order up to a **target** (`multi-user.target` for servers, `graphical.target` for desktops). `systemd-analyze blame` shows which units slowed the boot.

## 9.7 Practical lessons

- Programs ask the kernel for everything through system calls; `strace` reveals them.
- File descriptors are per-process integers, lowest free first; sockets are descriptors.
- Judge memory by RSS and MemAvailable; reserved virtual memory is free until touched.
- Containers = namespaces (what you can see) + cgroups (what you can use), on a shared kernel.

# Chapter 10: Troubleshooting Playbook and Interview Questions
%The ten problems you will meet in production, and the questions you will be asked

## 10.1 A method before commands

1. **What changed?** A deploy, a config edit, a certificate expiry, traffic growth. Most incidents follow a change.
2. **Scope**: one user, one server, one region, everything?
3. **USE method** for every resource (CPU, memory, disk, network): **U**tilisation, **S**aturation (queues), **E**rrors.
4. Read the **logs** of the failing component, then of what it depends on.
5. Make one change at a time and write down what you did.

## 10.2 The ten common problems

| Symptom | First commands | Usual causes and fixes |
|---|---|---|
| "Disk full" (`No space left on device`) | `df -h`; `du -xh / --max-depth=1 2>/dev/null \| sort -h`; `df -i`; `lsof +L1` | Logs without rotation; deleted-but-open files (restart the process); millions of small files (inodes); Docker images (`docker system prune`) |
| Port already in use | `ss -tlnp 'sport = :8080'`; `lsof -i :8080` | An old instance still running; another service on that port |
| Permission denied | `ls -l` on the file **and every parent directory**; `id`; `namei -l /path/to/file` | Wrong owner after copying as root; missing `x` on a parent directory; SELinux/AppArmor (`dmesg`, `ausearch`) |
| High CPU | `top` (press `1`, `P`); `ps -eo pid,pcpu,comm --sort=-pcpu \| head`; for Java `jstack PID` | Infinite loop, busy retry, garbage collection, too little capacity |
| High load but idle CPU | `top` (`wa` = I/O wait); `vmstat 1`; `iostat -x 1`; processes in state `D` | Slow disk or network storage |
| Out of memory, process killed | `dmesg -T \| grep -i -E 'oom\|killed'`; `free -h`; `ps aux --sort=-rss \| head` | Memory leak; heap too large for the container limit; too many workers |
| Service will not start | `systemctl status svc`; `journalctl -u svc -b --no-pager \| tail -50`; run `ExecStart` by hand as the service user | Bad config, missing env file, port taken, permission on a file |
| Cannot connect to a host | `getent hosts db`; `nc -vz db 3306`; `curl -v`; `ip route`; check the firewall/security group | DNS, firewall, service listening only on 127.0.0.1, wrong port |
| "Too many open files" | `ulimit -n`; `ls /proc/PID/fd \| wc -l`; `cat /proc/PID/limits` | Descriptor leak (unclosed connections) or a low limit (`LimitNOFILE`) |
| Clock or certificate errors | `date -u`; `timedatectl`; `openssl s_client -connect host:443 </dev/null \| openssl x509 -noout -dates` | Clock drift (enable NTP); expired certificate |

```bash run Diagnosing "permission denied" through the parent directories
mkdir -p app/config && echo "db.password=..." > app/config/app.properties
chmod 700 app/config
chmod 711 app
namei -l "$HOME/app/config/app.properties" | sed "s|$HOME|~|" | tail -3
echo "--- as another user (others' bits apply), the parent directory blocks access:"
for d in app app/config; do
  printf '%-11s others: %s\n' "$d" "$(stat -c %A "$d" | cut -c8-10)"
done
```

`namei -l` lists every component of a path with its permissions. Another user can pass through `app` (`--x`) but not into `app/config` (`---`), so the file is unreachable however readable the file itself is.

```bash run Diagnosing "port already in use" and "connection refused"
python3 -m http.server 8790 --bind 127.0.0.1 >/dev/null 2>&1 & srv=$!
for i in $(seq 50); do nc -z 127.0.0.1 8790 >/dev/null 2>&1 && break; sleep 0.1; done
nc -vz 127.0.0.1 8790 2>&1 | sed 's/ \[tcp[^]]*\]//'
nc -vz 127.0.0.1 8791 2>&1 || true
ss -tlnp 'sport = :8790' | awk 'NR > 1 {print "listening:", $4}'
kill $srv
```

"Connection refused" means the host answered but nothing listens on that port (or it listens on another address). A **timeout** instead usually means a firewall dropped the packets.

```bash run Diagnosing "disk full" caused by a deleted but still open file
mkdir data && head -c 5000000 /dev/zero > data/big.log
sleep 300 < data/big.log & holder=$!
rm data/big.log
echo "du after rm: $(du -sk data | cut -f1) KiB in data/"
ls -l /proc/$holder/fd/0 | awk '{print $NF, $(NF-1)}' | sed "s|$HOME|~|"
lsof -p $holder 2>/dev/null | awk '/deleted/ {print "lsof:", $7, "bytes still held by", $1}' \
  | sed "s|$HOME|~|"
kill $holder
```

The file has disappeared from the directory, so `du` cannot see its 5 MB, yet the space is still allocated because `sleep` holds it open. On a real server this is a multi-gigabyte log deleted by hand while the application keeps writing to it; restarting (or signalling the application to reopen its log) frees the space.

## 10.3 Cheat sheet

| Need | Command |
|---|---|
| Where am I, what is here | `pwd`, `ls -la`, `tree -L 2` |
| Find files | `find / -name 'app*.jar' 2>/dev/null`, `locate` |
| Search text | `grep -rn 'ERROR' /var/log/app/` |
| Follow a log | `tail -f app.log`, `journalctl -fu svc` |
| Count and rank | `... \| sort \| uniq -c \| sort -rn \| head` |
| Disk | `df -h`, `du -sh * \| sort -h`, `df -i` |
| Memory, CPU, load | `free -h`, `top`, `uptime`, `nproc` |
| Processes | `ps aux \| grep java`, `pgrep -a java`, `kill PID`, `kill -9 PID` |
| Ports and connections | `ss -tlnp`, `ss -tnp state established`, `lsof -i :8080` |
| HTTP | `curl -i URL`, `curl -fsS -o /dev/null -w '%{http_code}' URL` |
| DNS | `getent hosts name`, `dig +short name` |
| Permissions | `ls -l`, `chmod 640 f`, `chown user:group f` (root), `namei -l path` |
| Services | `systemctl status svc`, `journalctl -u svc --since today` |
| Archives | `tar -czf a.tgz dir/`, `tar -xzf a.tgz`, `tar -tzf a.tgz` |
| Copy to and from servers | `scp f user@host:/tmp/`, `rsync -avz dir/ user@host:dir/` |
| Long jobs | `tmux new -s train`, detach `Ctrl+B D`, `tmux attach -t train` |

## 10.4 Interview questions with the core of a good answer

| Question | Core of the answer |
|---|---|
| What happens when you type `ls -l` and press Enter? | The shell parses the line, expands globs and variables, searches `PATH`, forks, the child execs `/usr/bin/ls`; `ls` makes system calls (`openat`, `getdents64`, `statx`, `write`) and exits; the shell waits and reads the status |
| Hard link vs symbolic link? | Hard: another name for the same inode, same filesystem, no directories, survives deleting the original. Soft: a file storing a path, can cross filesystems, can dangle |
| What is an inode? What happens when inodes run out? | The metadata record of a file (not its name). With no free inodes no new files can be created even if space remains: `df -i` |
| Explain 755 and 644. Why can I delete a file I cannot write? | Owner rwx/others r-x; owner rw/others r. Deleting changes the directory, so it needs w (and x) on the directory |
| What is the sticky bit, and where is it used? | On a directory, only owners may delete their files; `/tmp` |
| Process vs thread? | A process has its own address space; threads share their process's memory and descriptors. In Linux both are tasks created with `clone` with different sharing flags |
| What is a zombie? An orphan? | Zombie: exited child not yet waited for. Orphan: running child whose parent died; adopted by PID 1 |
| SIGTERM vs SIGKILL? | TERM can be handled for graceful shutdown; KILL cannot. Send TERM, wait, then KILL |
| How do you find what is using port 8080? | `ss -tlnp 'sport = :8080'` or `lsof -i :8080` |
| The disk is full but `du` shows little. Why? | Deleted files still held open; `lsof +L1`, restart or reopen logs |
| `2>&1` — what does it do, and does order matter? | Duplicates stdout onto stderr's descriptor; yes, redirections apply left to right |
| What is load average? | The average number of tasks running or waiting for CPU (and, on Linux, in uninterruptible I/O) over 1, 5 and 15 minutes; compare with the CPU count |
| What does `set -euo pipefail` do? | Exit on errors, error on unset variables, fail a pipeline if any stage fails |
| How is a container different from a VM? | A container is a process isolated by namespaces and limited by cgroups on a shared kernel; a VM runs its own kernel on emulated or virtualised hardware |
| How do you make a service start at boot and restart on crash? | A systemd unit with `Restart=on-failure`, `systemctl enable --now` |
| How do you run a job every night at 2:30? | cron `30 2 * * *` with absolute paths and logging, or a systemd timer |
| How would you investigate a slow server? | USE method: `uptime`, `top`, `vmstat 1`, `iostat -x 1`, `free -h`, `df -h`, `ss -s`, then application logs |
