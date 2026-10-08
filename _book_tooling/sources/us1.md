# Solutions
%Every solution executed as the unprivileged user nobody

## Part 1 solutions

### U1.1 One-command project tree

Brace expansion generates all four paths before `mkdir` runs, and `-p` creates the parents. There are 7 directories: `project`, `src`, `test` and the four leaves.

```bash run Solution U1.1
mkdir -p project/{src,test}/{main,util}
find project -type d | sort
find project -type d | wc -l
```

### U1.2 Directory link counts

A directory's inode is referenced by its name in the parent, by its own `.` entry, and by the `..` entry of each subdirectory. So the link count is 2 + (number of subdirectories). Files inside do not count, because they do not contain `..`.

```bash run Solution U1.2
mkdir empty full && mkdir full/a full/b full/c && touch full/file.txt
stat -c '%h links: %n' empty full
```

(Some filesystems, such as btrfs, always report 1 for directories; the rule is a property of classic Unix filesystems like ext4.)

### U1.3 Rename safely

Let the shell glob (it keeps each name intact), quote `"$f"`, strip the suffix with parameter expansion, and use `--` so a name starting with `-` cannot be read as an option.

```bash run Solution U1.3
mkdir photos && cd photos
touch 'IMG 001.JPG' 'IMG 002.JPG' notes.txt
for f in *.JPG; do mv -- "$f" "${f%.JPG}.jpg"; done
ls
```

### U1.4 Redirection order

```bash run Solution U1.4
touch existing
ls existing missing > a.txt 2>&1 || true;  echo "a.txt:"; sed 's/^/  /' a.txt
echo "--- 2>&1 > b.txt (the error reaches the terminal):"
ls existing missing 2>&1 > b.txt || true;  echo "b.txt:"; sed 's/^/  /' b.txt
ls existing missing &> c.txt || true;      echo "c.txt:"; sed 's/^/  /' c.txt
```

`> f 2>&1` points stdout at the file, then copies that to stderr: both go to the file. `2>&1 > f` first copies stderr to the **current** stdout (the terminal), then moves only stdout to the file. `&> f` is bash shorthand for the first form.

### U1.5 Looping over ls

Two bugs: `$(ls *.txt)` is split on spaces, so `my notes.txt` becomes `my` and `notes.txt`; and `$f` is unquoted inside the loop, causing the same split again. Parsing `ls` output is never necessary: the glob already produces the right list.

```bash run Solution U1.5
touch 'my notes.txt' plain.txt
echo "--- broken:"
for f in $(ls *.txt); do wc -l $f 2>&1; done
echo "--- fixed:"
shopt -s nullglob
for f in *.txt; do wc -l "$f"; done
```

`nullglob` makes the loop run zero times when no file matches, instead of once with the literal `*.txt`.

## Part 2 solutions

### U2.1 Clients and POSTs

```bash run Solution U2.1
echo "distinct clients: $(cut -d' ' -f1 access.log | sort -u | wc -l)"
awk '$3 == "POST" {print $1}' access.log | sort | uniq -c | sort -rn | head -1
```

10.0.0.11 sent four POSTs (all logins), one more than 10.0.0.7.

### U2.2 Brute-force detector

```bash run Solution U2.2
awk '$4 == "/api/login" && $5 == 401 {
       n[$1]++; if (!($1 in first)) first[$1] = $2; last[$1] = $2 }
     END { for (ip in n) if (n[ip] >= 3)
             print ip, n[ip], "failures from", first[ip], "to", last[ip] }' access.log
```

In production this logic lives in tools such as **fail2ban**, which watches `auth.log` or web logs and adds firewall rules for offending IPs, or in a rate limiter at the API gateway.

### U2.3 Latency per endpoint

Normalise the path, sort by path then latency, and let awk collect each group's values in order; the median is the middle value (or the mean of the two middle values).

```bash run Solution U2.3
awk '{ p = $4; sub(/\/[0-9]+$/, "", p); print p, $7 }' access.log | sort -k1,1 -k2,2n \
| awk '
  function flush() {
    if (n == 0) return
    med = (n % 2) ? v[(n + 1) / 2] : (v[n / 2] + v[n / 2 + 1]) / 2
    printf "%-14s n=%d median=%g max=%d\n", cur, n, med, v[n]
  }
  $1 != cur { flush(); cur = $1; n = 0 }
  { v[++n] = $2 }
  END { flush() }'
```

### U2.4 Errors to CSV

```bash run Solution U2.4
awk 'BEGIN { print "ip,path,status" } $5 >= 400 { print $1 "," $4 "," $5 }' \
  access.log > errors.csv
cat errors.csv
echo "data rows: $(( $(wc -l < errors.csv) - 1 ))"
```

### U2.5 A text histogram

```bash run Solution U2.5
awk '{ split($2, t, "T"); m = substr(t[2], 1, 5); c[m]++ }
     END { for (k in c) { bar = ""; for (i = 0; i < c[k]; i++) bar = bar "#"
                          printf "%s %-6s %d\n", k, bar, c[k] } }' access.log | sort
```

### U2.6 Big recent files

`-size +1M` means larger than 1 MiB (find rounds sizes **up** to whole units, so use `-size +1024k` when precision matters); `-mtime -2` means modified less than 2 days ago.

```bash run Solution U2.6
mkdir -p tree/a tree/b
head -c 3000000 /dev/zero > tree/a/big-new.bin
head -c 1500000 /dev/zero > tree/b/medium-new.bin
head -c 5000000 /dev/zero > tree/b/big-old.bin && touch -d '10 days ago' tree/b/big-old.bin
head -c 1000 /dev/zero > tree/a/small.bin
find tree -type f -size +1M -mtime -2 -printf '%s %p\n' | sort -rn \
  | numfmt --field=1 --to=iec
```

The 5 MB file is excluded because it is old, and the small one because of its size.

## Part 3 solutions

### U3.1 Modes

(a) `rwx` = 7, `r-x` = 5, `---` = 0: **750**. (b) 640 = `rw-r-----`; 4755 = `rwsr-xr-x` (setuid shows as `s` in the owner's execute position). (c) Files: 666 − 027 bits = **640**; directories: 777 masked by 027 = **750**.

```bash run Checking U3.1
touch f && chmod 750 f && stat -c '%A -> %a' f
chmod 640 f && stat -c '%a -> %A' f
chmod 4755 f && stat -c '%a -> %A' f
umask 027 && rm f && touch f && mkdir d && stat -c '%a %n' f d
```

### U3.2 Lock down a project

```bash run Solution U3.2
mkdir .ssh && touch .ssh/id_ed25519 .ssh/config notes.txt
chmod 777 .ssh; chmod 666 .ssh/id_ed25519 notes.txt
echo "group- or world-writable before:"; find ~ -perm /go=w | sed "s|$HOME|~|" | sort
chmod 700 .ssh && chmod 600 .ssh/id_ed25519 && chmod go-w notes.txt
echo "after:"; find ~ -perm /go=w | sed "s|$HOME|~|" | sort; echo "(none)"
stat -c '%a %n' .ssh .ssh/id_ed25519 notes.txt
```

`-perm /go=w` matches when **any** of the listed bits is set; `-perm -go=w` would need all of them.

### U3.3 sudo and redirection

The redirection `>> /etc/hosts` is performed by **your** shell, as you, before `sudo` even starts; sudo only elevates `echo`. Correct versions:

```text
echo "127.0.0.1 api.local" | sudo tee -a /etc/hosts > /dev/null  # tee runs as root
sudo sh -c 'echo "127.0.0.1 api.local" >> /etc/hosts'           # all of it as root
```

```bash run The shell performs the redirection before the command runs
echo "test" >> /etc/hosts 2>&1 \
  || echo "status $?: the shell itself was refused, as user $(id -un)"
```

### U3.4 Audit setuid programs

```bash run Solution U3.4
find /usr/bin -perm -4000 -user root -printf '%f\n' | sort
```

Each needs root for one narrow operation on behalf of an ordinary user: `passwd` and `chsh`/`chfn` edit `/etc/shadow` or `/etc/passwd`; `su` and `sudo` switch user after authentication; `mount`/`umount` mount permitted filesystems; `newgrp` and `gpasswd` change group membership. Any bug in them is a privilege-escalation hole, so audits check this list against a known baseline and alert on additions.

### U3.5 Temporary files safely

`/tmp` is writable by everyone. If a root-run script writes to the predictable path `/tmp/report.txt`, an attacker can create that name first as a **symbolic link** to `/etc/passwd`; the script then overwrites the system file. The sticky bit only stops users deleting or renaming **each other's** files; it does not stop someone creating the name first. The fix is an unpredictable name created atomically with `O_EXCL` (fails if the name exists), which is what `mktemp` does, plus cleaning up with `trap`:

```bash run mktemp creates unique, private files atomically
f=$(mktemp); d=$(mktemp -d)
stat -c '%a %F' "$f" "$d"
a=$(mktemp -u); b=$(mktemp -u)
[[ $a != "$b" ]] && echo "two calls, two different random names in ${a%/*}"
rm -rf "$f" "$d"
```

Files are created with mode 600 and directories with 700, regardless of the umask.

## Part 4 solutions

### U4.1 Find and stop

```bash run Solution U4.1
for i in 1 2 3; do sleep 300 & done
sleep 301 &
echo "sleeps running: $(pgrep -c -u "$(id -u)" -x sleep)"
pkill -f '^sleep 300$'
sleep 0.2
echo "after pkill: $(pgrep -c -u "$(id -u)" -x sleep)"; pgrep -a -x sleep | cut -d' ' -f2-
pkill -x sleep
```

`-f` matches against the full command line, and the anchors `^...$` keep `sleep 3000` or `sleep 301` safe. Always run `pgrep -a` with the same pattern first to see what `pkill` would hit.

### U4.2 A well-behaved daemon

```bash run Solution U4.2
cat > daemon.sh <<'EOF'
trap '' HUP
trap 'echo "reloading config"' USR1
trap 'echo "SIGTERM: closing connections, bye"; exit 0' TERM
echo "daemon started"
while true; do sleep 0.1; done
EOF
bash daemon.sh & pid=$!; sleep 0.4
kill -HUP "$pid";  sleep 0.3; kill -0 "$pid" && echo "still alive after HUP"
kill -USR1 "$pid"; sleep 0.3
kill -TERM "$pid"; wait "$pid"; echo "exit status $?"
```

`kill -0` sends no signal: it only checks whether the process exists and may be signalled. Bash runs a trap only after the current foreground command (here the short `sleep 0.1`) finishes, which is why long `sleep`s delay signal handling in scripts.

### U4.3 Time limits

```bash run Solution U4.3
timeout 1 sleep 10; echo "timeout status: $?"
start=$SECONDS
timeout 1 bash -c 'trap "" TERM; sleep 3'
echo "TERM ignored: status $?, but it took $(( SECONDS - start )) s"
start=$SECONDS
printf 'trap "" TERM\nsleep 10\n' > stubborn.sh
bash -c 'timeout -k 1 1 bash stubborn.sh; echo "with -k 1: status $?"' 2>/dev/null
echo "and it took $(( SECONDS - start )) s"
```

Status 124 means "timed out". The middle case is the trap: the command ignores SIGTERM, so `timeout` reports 124 but the command still ran its full 3 seconds. With `-k 1`, timeout follows up with SIGKILL one second after TERM, and the status is 137 (128 + 9), after about 2 seconds instead of 10.

### U4.4 High load, idle CPU

On Linux the load average counts tasks that are runnable **and** tasks in uninterruptible sleep (state `D`, usually waiting for disk or network storage). Load 8 on 4 CPUs with 70% iowait means many tasks are queued on I/O, not on CPU: the disk (or an NFS/EBS volume) is saturated or slow. Next: `vmstat 1` (the `b` column counts blocked tasks, `wa` iowait), `iostat -x 1` (`%util` near 100 and high `await` on a device), `ps -eo state,pid,comm | grep '^D'` to see who is blocked, `iotop` to find the heavy writer, then `dmesg` for disk errors. Typical causes: a backup or log compression job, a database without enough RAM for its working set, a throttled cloud volume.

### U4.5 Detect a descriptor leak

```bash run Solution U4.5
cat > leaky.py <<'EOF'
import time
held = []
for request in range(8):
    held.append(open('/etc/hostname'))   # bug: never closed
    time.sleep(0.25)
time.sleep(1)
EOF
python3 leaky.py & pid=$!
for i in 1 2 3 4 5; do
  sleep 0.5
  echo "sample $i: $(ls /proc/$pid/fd | wc -l) open descriptors"
done
wait
```

A count that only grows under steady traffic is a leak; a healthy server's count rises and falls with load. In Java, `try-with-resources` is the cure; in production, alert on the process's open-descriptor metric approaching its limit.
