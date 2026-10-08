## Part 5 solutions

### U5.1 Largest files

```bash run Solution U5.1
cat > largest.sh <<'EOF'
#!/usr/bin/env bash
set -euo pipefail
usage() { echo "usage: ${0##*/} DIR [N]" >&2; exit 2; }
(( $# >= 1 )) || usage
dir=$1; n=${2:-3}
[[ -d $dir ]] || { echo "not a directory: $dir" >&2; exit 1; }
[[ $n =~ ^[1-9][0-9]*$ ]] || usage
find "$dir" -type f -printf '%s\t%p\n' | sort -rn | head -n "$n" \
  | numfmt --field=1 --to=iec --padding=6
EOF
chmod +x largest.sh
mkdir -p data/x
for s in 10 2000 300000 45000 5000000; do head -c "$s" /dev/zero > "data/x/f$s"; done
./largest.sh data
./largest.sh data 1
./largest.sh nowhere || echo "status $?"
./largest.sh || echo "status $?"
```

### U5.2 Retry with back-off

```bash run Solution U5.2
retry() {
  local max=$1 n=1 delay=1; shift
  until "$@"; do
    if (( n >= max )); then echo "giving up after $n attempts" >&2; return 1; fi
    echo "attempt $n failed; waiting $delay unit(s)" >&2
    sleep "$(( delay ))e-1"                 # 1 unit = 0.1 s here, to keep the demo fast
    n=$(( n + 1 )); delay=$(( delay * 2 ))
  done
}
rm -f count
flaky() {                                  # fails twice, then succeeds
  local c; c=$(( $(cat count 2>/dev/null || echo 0) + 1 ))
  echo "$c" > count; (( c >= 3 ))
}
retry 5 flaky && echo "succeeded on attempt $(cat count)"
retry 2 false || echo "status $?"
```

In production add **jitter** (a random part of the delay) so that many clients do not retry in lock-step, and retry only errors that can succeed later (timeouts, 503), never a 400.

### U5.3 A dangerous cleanup script

Problems in `cd $1; rm -rf $TARGET/*; echo done`:

1. If `cd` fails (a typo in `$1`, or no argument at all, which means `cd` to `$HOME`), the script carries on and deletes in the **wrong directory**.
2. If `TARGET` is unset or empty, the command becomes `rm -rf /*`.
3. Unquoted variables split on spaces and expand globs.
4. No validation and no error checking; `echo done` prints even after failures.

```bash run Solution U5.3
cat > cleanup.sh <<'EOF'
#!/usr/bin/env bash
set -euo pipefail
base=${1:?usage: cleanup.sh BASE_DIR}
target=${TARGET:?TARGET must be set}
[[ $target != */* && $target != .* ]] || { echo "TARGET must be a plain name" >&2; exit 2; }
cd -- "$base"
[[ -d $target ]] || { echo "no directory $base/$target" >&2; exit 1; }
find "$target" -mindepth 1 -delete
echo "emptied $base/$target"
EOF
mkdir -p site/cache && touch site/cache/{a,b,c}.tmp site/keep.txt
bash cleanup.sh site 2>&1 | sed 's/^cleanup.sh: line [0-9]*: //' || true
TARGET=cache bash cleanup.sh site
TARGET=cache bash cleanup.sh nowhere 2>&1 | sed 's/^cleanup.sh: line [0-9]*: //' || true
TARGET=../.. bash cleanup.sh site || true
ls site site/cache
```

### U5.4 Read a config file

```bash run Solution U5.4
cat > app.conf <<'EOF'
# meter-api configuration
port = 8080
db.url=jdbc:mysql://db:3306/meters

  log.level =  INFO
feature.forecast = true   
EOF
declare -A conf
key='([^=#[:space:]][^=]*[^=[:space:]]|[^=#[:space:]])'
re="^[[:space:]]*${key}[[:space:]]*=[[:space:]]*(.*[^[:space:]])?[[:space:]]*\$"
while IFS= read -r line || [[ -n $line ]]; do
  [[ $line =~ ^[[:space:]]*(#|$) ]] && continue
  if [[ $line =~ $re ]]; then conf[${BASH_REMATCH[1]}]=${BASH_REMATCH[2]}
  else echo "bad line: $line" >&2; fi
done < app.conf
for k in $(printf '%s\n' "${!conf[@]}" | sort); do
  printf '%-16s [%s]\n' "$k" "${conf[$k]}"
done
```

Storing the regular expression in a variable and writing `[[ $line =~ $re ]]` (unquoted on the right) is the reliable way to use complex regexes in bash. `|| [[ -n $line ]]` handles a last line without a trailing newline.

### U5.5 Parallel health checks

```bash run Solution U5.5
check() {                                   # simulated server: name, delay (tenths), result
  sleep "$2e-1"; return "$3"
}
servers=("web-1 3 0" "web-2 2 0" "web-3 4 1" "api-1 1 0"
         "api-2 3 0" "db-1 2 1" "cache-1 1 0" "mq-1 2 0")
max=3; declare -A pids
for s in "${servers[@]}"; do
  read -r name delay result <<< "$s"
  while (( $(jobs -rp | wc -l) >= max )); do wait -n || true; done
  check "$delay" "$delay" "$result" & pids[$name]=$!
done
ok=(); bad=()
for name in $(printf '%s\n' "${!pids[@]}" | sort); do
  if wait "${pids[$name]}"; then ok+=("$name"); else bad+=("$name"); fi
done
echo "healthy (${#ok[@]}): ${ok[*]}"
echo "failed  (${#bad[@]}): ${bad[*]}"
```

`wait -n` returns when **any** one job finishes, so a new check starts as soon as a slot frees up, keeping at most three running. Waiting on each recorded PID afterwards still retrieves every job's exit status.

### U5.6 Options

```bash run Solution U5.6
cat > greet.sh <<'EOF'
#!/usr/bin/env bash
set -euo pipefail
usage() { echo "usage: greet.sh -n NAME [-c COUNT] [-v]" >&2; exit 2; }
name=''; count=1; verbose=false
while getopts ':n:c:v' opt; do
  case $opt in
    n) name=$OPTARG ;;
    c) [[ $OPTARG =~ ^[1-9][0-9]*$ ]] \
         || { echo "COUNT must be a positive integer" >&2; usage; }
       count=$OPTARG ;;
    v) verbose=true ;;
    :) echo "option -$OPTARG needs a value" >&2; usage ;;
    *) echo "unknown option -$OPTARG" >&2; usage ;;
  esac
done
[[ -n $name ]] || usage
$verbose && echo "greeting $name $count time(s)"
for (( i = 0; i < count; i++ )); do echo "Hello, $name"; done
EOF
bash greet.sh -n Priya -c 2 -v
bash greet.sh -n Arjun
bash greet.sh -n Meera -c zero 2>&1 || echo "status $?"
bash greet.sh -x 2>&1 || echo "status $?"
bash greet.sh -c 2>&1 || echo "status $?"
```

## Part 6 solutions

### U6.1 Status codes

```bash run Solution U6.1
mkdir www && echo '{"status": "ok"}' > www/health.json
python3 -m http.server 8801 --bind 127.0.0.1 --directory www >/dev/null 2>&1 & srv=$!
for i in $(seq 50); do curl -s -o /dev/null localhost:8801 && break; sleep 0.1; done
for path in /health.json /missing /; do
  curl -s -o /dev/null -w "%{http_code} %{size_download} bytes  $path\n" "localhost:8801$path"
done
kill $srv
```

### U6.2 Wait for a port

```bash run Solution U6.2
cat > wait-for.sh <<'EOF'
#!/usr/bin/env bash
set -euo pipefail
host=${1:?host} port=${2:?port} timeout=${3:-30}
start=$SECONDS
until nc -z "$host" "$port" 2>/dev/null; do
  if (( SECONDS - start >= timeout )); then
    echo "timed out after ${timeout}s waiting for $host:$port" >&2; exit 1
  fi
  sleep 0.2
done
echo "$host:$port is up after $(( SECONDS - start ))s"
EOF
chmod +x wait-for.sh
( sleep 1.5; exec python3 -m http.server 8802 --bind 127.0.0.1 >/dev/null 2>&1 ) &
./wait-for.sh 127.0.0.1 8802 10
./wait-for.sh 127.0.0.1 8803 2 || echo "status $?"
pkill -u "$(id -u)" -f 'http.server 8802' || true
```

The server started 1.5 seconds after the script began polling, so the first wait succeeds once it is up (bash's `SECONDS` counts whole seconds, so it prints 1 or 2); the second gives up at its 2-second timeout. Docker Compose's `depends_on` with a health check, or Kubernetes readiness probes, are the platform versions of this.

### U6.3 Three different failures

- **Connection refused**: the host is reachable and replied with a TCP reset, because nothing listens on that port (or the service listens on another address, such as 127.0.0.1 only). Immediate.
- **Timeout**: no reply at all. Packets are being dropped, usually by a firewall or security group, or the host is down or unroutable. Slow (it waits for the timeout).
- **Could not resolve host**: DNS failed before any connection was attempted. Check the name, `/etc/hosts`, `/etc/resolv.conf`.

```bash run Refused, unresolvable, and a server that never answers
curl -sS --max-time 2 http://127.0.0.1:8899/ 2>&1 | sed -E 's/ after [0-9]+ ms//' || true
curl -sS --max-time 2 http://no-such-host.invalid/ 2>&1 || true
nc -l 127.0.0.1 8898 > /dev/null &            # accepts the connection, never replies
sleep 0.3; start=$SECONDS
curl -sS --max-time 2 http://127.0.0.1:8898/ 2>&1 \
  | sed -E 's/ after [0-9]+ milliseconds/ after N ms/' || true
echo "(waited about $(( SECONDS - start )) s)"
```

The first two fail at once (`.invalid` is a top-level domain reserved never to exist). The third waits for the full limit. Strictly, it shows a **response** timeout: the connection succeeded but no bytes came back, the signature of a hung server. A **connect** timeout, where a firewall silently drops the initial SYN packet, looks the same from curl's side (error 28) but happens before any connection exists; the sandbox that ran this book refuses connections to unused private addresses outright, so that case could not be shown live. Distinguish them with `curl -v` (is there a "Connected to" line?) or `nc -vz -w 2 host port`.

### U6.4 Health check without curl

```bash run Solution U6.4
mkdir www && echo ok > www/health
python3 -m http.server 8804 --bind 127.0.0.1 --directory www >/dev/null 2>&1 & srv=$!
for i in $(seq 50); do nc -z 127.0.0.1 8804 2>/dev/null && break; sleep 0.1; done
health() {
  local status
  status=$(printf 'GET %s HTTP/1.0\r\nHost: %s\r\n\r\n' "$3" "$1" \
           | nc -w 2 "$1" "$2" 2>/dev/null | head -1 | cut -d' ' -f2)
  if [[ $status == 200 ]]; then echo "healthy"
  else echo "unhealthy (${status:-no answer})"; return 1; fi
}
health 127.0.0.1 8804 /health
health 127.0.0.1 8804 /nope || true
health 127.0.0.1 8805 /health || true
kill $srv
```

## Part 7 solutions

### U7.1 A hardened unit file

```bash run Solution U7.1
cat > meter-api.service <<'EOF'
[Unit]
Description=Meter API
After=network-online.target
Wants=network-online.target

[Service]
User=meter
Group=meter
ExecStart=/usr/bin/java -Xmx512m -jar /opt/meter-api/app.jar
EnvironmentFile=/etc/meter-api/env
Restart=on-failure
RestartSec=5
LimitNOFILE=65536
TimeoutStopSec=30
NoNewPrivileges=yes
ProtectSystem=strict
ProtectHome=yes
PrivateTmp=yes
ReadWritePaths=/var/log/meter-api
CapabilityBoundingSet=

[Install]
WantedBy=multi-user.target
EOF
systemd-analyze verify ./meter-api.service 2>&1 | grep -ci 'unknown key' \
  | sed 's/$/ unknown keys/'
```

The sandboxing lines mean: the process can never gain privileges (no setuid escalation), sees the whole filesystem read-only except `/var/log/meter-api`, cannot see `/home`, gets a private `/tmp`, and holds no capabilities. A compromised application is then contained. `systemd-analyze security meter-api` scores a running unit's exposure.

### U7.2 Cron expressions

(a) `*/15 * * * *`. (b) `45 23 * * 0`. (c) `0 6 * 3 1-5`. (d) `0 */6 * * *`: at minute 0 of hours 0, 6, 12 and 18, every day. (e) `30 1 1,15 * *`: 01:30 on the 1st and 15th of every month.

> TRAP: When both day-of-month and day-of-week are restricted, cron runs when **either** matches: `0 6 1 * 1` means "the 1st of the month **or** any Monday", not "Mondays that fall on the 1st".

### U7.3 Children cannot change their parent

A child process gets a **copy** of the parent's environment and working directory; changes to the copy die with the child. That is why `cd`, `export` and `source` must run inside the shell itself (builtins), and why a script that does `cd` cannot change your terminal's directory unless you `source` it.

```bash run Solution U7.3
cd ~; x=parent
( cd /tmp; x=subshell; echo "inside subshell: $PWD, x=$x" )
bash -c 'cd /usr; export x=child; echo "inside child: $PWD, x=$x"'
echo "back in parent: $PWD, x=$x"
printf 'cd /etc\n' > go.sh
bash go.sh; echo "after running go.sh: $PWD"
source go.sh; echo "after sourcing go.sh: $PWD"
```

### U7.4 Network isolation

```bash run Solution U7.4
python3 -m http.server 8806 --bind 127.0.0.1 >/dev/null 2>&1 & srv=$!
for i in $(seq 50); do nc -z 127.0.0.1 8806 2>/dev/null && break; sleep 0.1; done
curl -s -o /dev/null -w 'host namespace: %{http_code}\n' localhost:8806
cat > probe.py <<'EOF'
import socket
try:
    socket.create_connection(('127.0.0.1', 8806), timeout=2)
    print('connected')
except OSError as e:
    print(e.strerror)
EOF
unshare -r -n sh -c '
  echo "new namespace, lo down: $(python3 probe.py)"
  ip link set lo up
  echo "new namespace, lo up:   $(python3 probe.py)"
'
kill $srv
```

Inside the new namespace even `127.0.0.1` belongs to a different, empty loopback interface: with it down, the kernel reports the network as unreachable; with it up, the connection is refused because no server listens in **this** namespace. This is exactly why, in Docker, `localhost` inside a container is the container itself, and a database on the host must be reached through the host's address or a shared network.

### U7.5 An incident

1. `df -h` — which filesystem is full (here `/`, 100%). `df -i` — rule out inode exhaustion.
2. `sudo du -xh / --max-depth=1 2>/dev/null | sort -h | tail`, then drill into the biggest (`/var/log`).
3. Find a 40 GB `meter-api.log` growing because DEBUG logging was left on in the last deploy, with no logrotate rule.
4. `sudo lsof +L1` — check for deleted files still held open (someone may already have `rm`'d a log, which frees nothing).
5. **Immediate fix:** truncate rather than delete, so the process keeps a valid handle and space is freed at once: `sudo truncate -s 0 /var/log/meter-api/meter-api.log` (or copy the tail out first for evidence). Restart the service only if it is wedged. Confirm with `df -h` and the error rate on the dashboard.
6. **Permanent fixes:** set the log level back to INFO; add a logrotate rule (or log to stdout and let the platform rotate); alert at 80% disk; put logs on a separate volume so a full log cannot stop the database or the OS; add the incident and timeline to a blameless postmortem.
