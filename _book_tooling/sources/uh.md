# Hints
%Read only the hint for the exercise you are stuck on

## Part 1 hints

| Exercise | Hint |
|---|---|
| U1.1 | Brace expansion: `{src,test}/{main,util}` |
| U1.2 | Count the names that point to a directory: its own name, its `.` entry, and each child's `..` |
| U1.3 | `for f in *.JPG; do mv -- "$f" "${f%.JPG}.jpg"; done` |
| U1.4 | Redirections are applied left to right |
| U1.5 | Let the shell glob instead of parsing `ls`; quote `"$f"` |

## Part 2 hints

| Exercise | Hint |
|---|---|
| U2.1 | `cut -d' ' -f1 \| sort -u \| wc -l`; filter POSTs with `awk '$3 == "POST"'` |
| U2.2 | In awk keep `count[ip]`, `first[ip]` (set once) and `last[ip]` |
| U2.3 | Normalise the path with `sub(/\/[0-9]+$/, "", $4)`, then sort by path and latency |
| U2.4 | `awk 'BEGIN {print "ip,path,status"} $5 >= 400 {print $1 "," $4 "," $5}'` |
| U2.5 | Build the bar with a loop in awk, or `printf '%*s'` and `tr ' ' '#'` |
| U2.6 | `find . -type f -size +1M -mtime -2 -printf '%s %p\n' \| sort -rn`; `numfmt --to=iec` |

## Part 3 hints

| Exercise | Hint |
|---|---|
| U3.1 | r = 4, w = 2, x = 1; the 4 in 4755 is setuid |
| U3.2 | `find ~ -perm /go=w` matches if group or others can write |
| U3.3 | Who performs the `>>`? |
| U3.4 | `find /usr/bin -perm -4000 -user root` |
| U3.5 | An attacker can create `/tmp/report.txt` first, as a link to your file |

## Part 4 hints

| Exercise | Hint |
|---|---|
| U4.1 | `pkill -f 'sleep 300$'`; `pgrep -c sleep` |
| U4.2 | `trap '' HUP`; `trap 'echo reloading config' USR1`; `kill -USR1 $pid` |
| U4.3 | `timeout -k 2 1 cmd`; status 124 means "timed out" |
| U4.4 | On Linux, load counts tasks waiting for I/O too |
| U4.5 | `ls /proc/$pid/fd \| wc -l` every half second |

## Part 5 hints

| Exercise | Hint |
|---|---|
| U5.1 | `find "$dir" -type f -printf '%s %p\n' \| sort -rn \| head -n "$n"` |
| U5.2 | `local n=1 delay=1; until "$@"; do ...; delay=$((delay * 2)); done` |
| U5.3 | What if `$1` is wrong, `cd` fails, or `TARGET` is empty? |
| U5.4 | `[[ $line =~ ^[[:space:]]*([^=]+[^=[:space:]])[[:space:]]*=[[:space:]]*(.*)$ ]]` |
| U5.5 | Before starting a job, `while (( $(jobs -rp \| wc -l) >= 3 )); do wait -n; done` |
| U5.6 | `while getopts ':n:c:v' opt` and `[[ $OPTARG =~ ^[1-9][0-9]*$ ]]` |

## Part 6 hints

| Exercise | Hint |
|---|---|
| U6.1 | `curl -s -o /dev/null -w '%{http_code} %{size_download}\n'` |
| U6.2 | Loop on `nc -z` (or bash's `/dev/tcp/host/port`) and compare `SECONDS` with the timeout |
| U6.3 | Refused: closed port. Timeout: packets dropped. Resolve: DNS |
| U6.4 | `printf 'GET /health HTTP/1.0\r\n\r\n' \| nc host port \| head -1` |

## Part 7 hints

| Exercise | Hint |
|---|---|
| U7.1 | `NoNewPrivileges`, `ProtectSystem=strict`, `ProtectHome`, `PrivateTmp`, `ReadWritePaths` |
| U7.2 | Fields: minute hour day-of-month month day-of-week |
| U7.3 | Compare `$PWD` before and after `( cd /tmp )` and `bash -c 'cd /tmp'` |
| U7.4 | `unshare -r -n sh -c 'ip link set lo up; curl ...'` |
| U7.5 | `df -h`, `du -xh --max-depth=1`, `lsof +L1`, then logs |
