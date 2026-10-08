# Chapter 6: Shell Scripting
%Variables, conditions, loops, functions, arrays, strict mode, traps and a real deployment script

## 6.1 A script is a file of commands

A script starts with a **shebang** line naming its interpreter, is made executable with `chmod +x`, and is run by path (`./deploy.sh`). Use `#!/usr/bin/env bash` for portability. `bash script.sh` also works without the execute bit.

```bash run The smallest useful script, and its arguments
cat > greet.sh <<'EOF'
#!/usr/bin/env bash
echo "script: $0"
echo "number of arguments: $#"
echo "first: $1, second: $2"
echo "all, one per line:"
for a in "$@"; do echo "  [$a]"; done
EOF
chmod +x greet.sh
./greet.sh "New Delhi" Kolkata
```

| Variable | Meaning |
|---|---|
| `$0` | The script's name |
| `$1` … `$9`, `${10}` | Positional arguments |
| `$#` | Number of arguments |
| `"$@"` | All arguments, each kept as one word (use this) |
| `"$*"` | All arguments joined into one string |
| `$?` | Exit status of the last command |
| `$$`, `$!` | PID of the shell; PID of the last background job |

Notice that `"$@"` kept `New Delhi` as one argument.

## 6.2 Variables, expansion and arithmetic

Assignment has **no spaces** around `=`. Variables are strings; `$(( ))` does integer arithmetic. Parameter expansion transforms values without calling external programs:

| Expansion | Result |
|---|---|
| `${var:-default}` | `default` if var is unset or empty |
| `${var:?message}` | Exit with the message if var is unset or empty |
| `${#var}` | Length |
| `${var#prefix}`, `${var##*/}` | Remove shortest / longest match from the front (`##*/` = basename) |
| `${var%suffix}`, `${var%.*}` | Remove from the end (`%.*` strips the extension) |
| `${var/old/new}`, `${var//old/new}` | Replace first / all |
| `${var^^}`, `${var,,}` | Upper / lower case |
| `${var:2:3}` | Substring from offset 2, length 3 |

```bash run Parameter expansion and arithmetic
path=/var/log/meter-api/app-2026-03-02.log
echo "file: ${path##*/}"
echo "dir: ${path%/*}"
echo "stem: $(basename "$path" .log)"
echo "ext removed: ${path%.*}"
name=${path##*/}; echo "date part: ${name:4:10}"
echo "upper: ${name^^}"
echo "replace dashes: ${name//-/_}"
echo "length: ${#name}"
unset port; echo "port: ${port:-8080}"
count=7; echo "arithmetic: $(( count * 3 + 1 )), integer division: $(( 7 / 2 ))"
echo "floating point needs another tool: $(echo 'scale=2; 7 / 2' | bc)"
```

> TRAP: `x = 5` (with spaces) runs a command called `x` with arguments `=` and `5`. And bash arithmetic is integer only: `$(( 7 / 2 ))` is 3.

## 6.3 Conditions

`if` runs a command and branches on its **exit status** (0 = true). `[[ ... ]]` is bash's test command; `(( ... ))` tests arithmetic.

| Test | True when |
|---|---|
| `[[ -f p ]]`, `[[ -d p ]]`, `[[ -e p ]]` | p is a regular file / directory / exists |
| `[[ -r p ]]`, `-w`, `-x`, `-s` | Readable, writable, executable, non-empty |
| `[[ -z s ]]`, `[[ -n s ]]` | String empty / non-empty |
| `[[ a == b ]]`, `!=`, `[[ s == *.log ]]` | String equal, not equal, glob match |
| `[[ s =~ ^[0-9]+$ ]]` | Regex match (`BASH_REMATCH` holds the groups) |
| `(( n > 5 ))`, `[[ n -gt 5 ]]` | Numeric comparison |
| `&&`, `\|\|`, `!` | And, or, not |

```bash run Validating input with conditions and a case statement
check() {
  local v=$1
  if [[ -z $v ]]; then echo "empty"
  elif [[ $v =~ ^([0-9]{1,5})$ ]] && (( v <= 65535 )); then echo "$v: valid port"
  elif [[ $v == *.conf ]]; then echo "$v: config file name"
  else echo "$v: unknown"
  fi
}
for x in "" 8080 99999 nginx.conf hello; do check "$x"; done
for cmd in start stop restart status frobnicate; do
  case $cmd in
    start|restart) echo "$cmd: starting service" ;;
    stop)          echo "$cmd: stopping service" ;;
    status)        echo "$cmd: service is up" ;;
    *)             echo "$cmd: usage: $0 {start|stop|restart|status}" ;;
  esac
done | sed 's|script.sh|svc|'
```

## 6.4 Loops

```bash run for, while read, C-style loops, and reading a file safely
for f in a b c; do printf '%s ' "$f"; done; echo
for (( i = 1; i <= 5; i++ )); do printf '%d ' $(( i * i )); done; echo
for n in {1..10..3}; do printf '%s ' "$n"; done; echo
printf 'meter-1 230\nmeter-2 225\nmeter 3 218\n' > volts.txt
while IFS= read -r line; do
  name=${line% *}; v=${line##* }
  (( v < 220 )) && echo "LOW voltage on '$name': $v"
done < volts.txt
n=0; until (( n >= 3 )); do n=$(( n + 1 )); done; echo "until loop ran $n times"
```

`while IFS= read -r line` is the correct way to read lines: `IFS=` keeps leading spaces and `-r` keeps backslashes. Splitting by `${line% *}` and `${line##* }` correctly handled the name that contains a space (`meter 3`).

> TRAP: `cat file | while read ...; do count=$((count+1)); done` runs the loop in a **subshell** (each side of a pipe is a separate process), so `count` is lost after the loop. Redirect instead: `while ...; done < file`.

```bash run The subshell trap, demonstrated
printf 'a\nb\nc\n' > three.txt
count=0
cat three.txt | while read -r _; do count=$(( count + 1 )); done
echo "with a pipe: $count"
count=0
while read -r _; do count=$(( count + 1 )); done < three.txt
echo "with redirection: $count"
```

## 6.5 Functions, local variables and return values

Functions take arguments like scripts (`$1`, `$@`), return an **exit status** with `return`, and "return" data by printing it (captured with `$( )`). Declare variables `local`, or they leak into the global scope.

```bash run Functions: arguments, local scope, output capture and status
total=100
add_tax() {
  local amount=$1 rate=${2:-18}
  echo $(( amount + amount * rate / 100 ))
}
is_even() { (( $1 % 2 == 0 )); }
leaky() { total=0; }
price=$(add_tax 1000); echo "with GST: $price"
echo "with 5%: $(add_tax 1000 5)"
for n in 3 4; do if is_even "$n"; then echo "$n even"; else echo "$n odd"; fi; done
leaky; echo "total after leaky(): $total"
```

## 6.6 Arrays and associative arrays

```bash run Indexed and associative arrays
servers=(web-1 web-2 "db primary")
echo "count: ${#servers[@]}, first: ${servers[0]}, last: ${servers[-1]}"
servers+=(cache-1)
for s in "${servers[@]}"; do printf '[%s] ' "$s"; done; echo
declare -A owner=([web]=priya [db]=arjun)
owner[cache]=meera
for k in $(printf '%s\n' "${!owner[@]}" | sort); do echo "$k -> ${owner[$k]}"; done
declare -A hits
while read -r ip _; do hits[$ip]=$(( ${hits[$ip]:-0} + 1 )); done < access.log
for ip in "${!hits[@]}"; do echo "${hits[$ip]} $ip"; done | sort -rn | head -2
```

Associative arrays are hash maps, so their iteration order is not defined: the loop pipes the keys through `sort` to make the output stable.

## 6.7 Strict mode, traps and debugging

By default bash carries on after a failing command, treats unset variables as empty, and ignores failures inside pipelines. For scripts that change things, turn on **strict mode**:

| Option | Effect |
|---|---|
| `set -e` | Exit when a command fails (with exceptions: inside `if`, `&&`, `\|\|` chains) |
| `set -u` | Treat unset variables as errors |
| `set -o pipefail` | A pipeline fails if any part fails, not only the last |
| `set -x` | Print each command before running it (debugging) |
| `trap cleanup EXIT` | Run `cleanup` however the script ends |

```bash run What each strict-mode option catches
echo '--- without options: errors are ignored'
bash -c 'cp /nonexistent /tmp/x 2>/dev/null; echo "kept going"'
echo '--- set -e stops at the first failure'
bash -c 'set -e; cp /nonexistent /tmp/x 2>/dev/null; echo "never printed"' || echo "exit $?"
echo '--- set -u catches a typo in a variable name'
bash -c 'set -u; dir=/srv/app; echo "removing ${dri}/cache"' 2>&1 \
  | sed 's/^bash: line 1: /error: /'
echo '--- pipefail: the failure of grep is hidden by the last command'
bash -c 'grep x /nonexistent 2>/dev/null | sort; echo "status $?"'
bash -c 'set -o pipefail; grep x /nonexistent 2>/dev/null | sort; echo "status $?"'
echo '--- set -x traces'
bash -c 'set -x; n=2; echo $(( n * 21 ))' 2>&1
```

The `set -u` case is the famous one: without it, a typo such as `${dri}` expands to an empty string and `rm -rf "${dri}/cache"` would try to delete `/cache`.

```bash run A temporary directory that is always cleaned up
cat > job.sh <<'EOF'
#!/usr/bin/env bash
set -euo pipefail
work=$(mktemp -d)
trap 'rm -rf "$work"; echo "cleaned up temp dir"' EXIT
echo "working in a temp dir: $([[ -d $work ]] && echo yes)"
echo data > "$work/part1"
false                                 # simulate a failure halfway through
echo "never reached"
EOF
bash job.sh || echo "job failed with status $?"
```

## 6.8 Options parsing and a real script

`getopts` parses short options (`-n 5 -v`). Below is a complete, defensive **log-rotation and backup script** of the kind teams keep in `/usr/local/bin` and run from cron: it compresses yesterday's logs, keeps the newest N archives, and reports what it did.

```bash run A production-style rotate-and-prune script
cat > rotate.sh <<'EOF'
#!/usr/bin/env bash
set -euo pipefail
usage() { echo "usage: $0 [-k keep] [-n] dir" >&2; exit 2; }
keep=3; dry=false
while getopts ':k:n' opt; do
  case $opt in
    k) [[ $OPTARG =~ ^[0-9]+$ ]] || usage; keep=$OPTARG ;;
    n) dry=true ;;
    *) usage ;;
  esac
done
shift $(( OPTIND - 1 ))
dir=${1:?$(usage)}
[[ -d $dir ]] || { echo "no such directory: $dir" >&2; exit 1; }
run() { if $dry; then echo "would run: $*"; else "$@"; fi; }
shopt -s nullglob
for f in "$dir"/*.log; do
  run gzip -9 "$f"
done
mapfile -t archives < <(ls -1t "$dir"/*.log.gz 2>/dev/null || true)
echo "archives: ${#archives[@]}, keeping newest $keep"
for old in "${archives[@]:keep}"; do run rm -- "$old"; echo "pruned ${old##*/}"; done
EOF
chmod +x rotate.sh
mkdir logs
for d in 01 02 03 04 05; do
  echo "log for day $d" > "logs/app-2026-03-$d.log"
  touch -d "2026-03-$d 23:59" "logs/app-2026-03-$d.log"
done
./rotate.sh -n -k 2 logs | head -2
./rotate.sh -k 2 logs
ls logs
./rotate.sh -k two logs 2>&1 | sed 's|\./||' || true
```

Points worth copying into every script you write: strict mode; a `usage` function; validated options; quoting every variable; `--` before file names (so a file called `-rf` is not read as an option); a **dry-run** mode; `nullglob` so an empty directory does not process a literal `*.log`; and `gzip` preserving the file's modification time, which is why `ls -t` still orders the archives by day.

## 6.9 When not to use the shell

Shell is ideal for gluing programs together, automating command sequences and simple text processing. Move to Python (or another language) when you need data structures beyond flat arrays, floating-point maths, JSON (beyond `jq`), error handling with retries, unit tests, or more than about 100 lines.

## 6.10 Practical lessons

- Start scripts with `#!/usr/bin/env bash` and `set -euo pipefail`; clean up with `trap ... EXIT`.
- Quote every expansion; use `"$@"`; `local` in functions.
- `while IFS= read -r line; do ...; done < file`; avoid piping into loops that set variables.
- `[[ ]]` for tests, `(( ))` for arithmetic, `case` for dispatch, `getopts` for options.
- Validate input, support a dry run, and print what you change.

# Chapter 7: Networking from the Command Line
%Addresses, ports, sockets, DNS, HTTP by hand, SSH keys and firewalls

## 7.1 Interfaces and addresses

Every network interface has addresses: `lo` is the **loopback** interface (127.0.0.1, `localhost`, never leaves the machine); `eth0`/`ens3` connect to the real network. `ip addr` lists them and `ip route` shows where packets go (the **default route** via the gateway).

```bash run The loopback interface and the routing table
ip -brief addr show lo
ip route get 127.0.0.1 | head -1 | awk '{print $1, $2, $3, $4}'
getent hosts localhost
grep -w localhost /etc/hosts | head -1
```

> NOTE: The container that ran these commands has a minimal network; on a typical VM you will also see `eth0` with a private address such as `10.0.1.23/24` and a default route `default via 10.0.1.1 dev eth0`.

## 7.2 Ports and sockets

A **socket** is an endpoint of communication: an IP address plus a **port** (0–65535) plus a protocol (TCP or UDP). A server **listens** on a port; clients connect to it. Ports below 1024 are privileged (binding needs root or the `CAP_NET_BIND_SERVICE` capability), which is why applications listen on 8080 behind a proxy on 80/443.

| Well-known port | Service |
|---|---|
| 22 | SSH |
| 53 | DNS |
| 80, 443 | HTTP, HTTPS |
| 3306, 5432, 6379, 27017 | MySQL, PostgreSQL, Redis, MongoDB |
| 9092, 5672 | Kafka, RabbitMQ |

`ss` (socket statistics; it replaces `netstat`) answers "what is listening?" and "who is connected?": `ss -tlnp` = **t**cp, **l**istening, **n**umeric, **p**rocesses.

```bash run Start a server, find it with ss, call it with curl
mkdir site && echo '<h1>Meter dashboard</h1>' > site/index.html
python3 -m http.server 8765 --bind 127.0.0.1 --directory site > server.log 2>&1 &
srv=$!
for i in $(seq 50); do curl -s -o /dev/null localhost:8765 && break; sleep 0.1; done
ss -tln | awk 'NR == 1 || /:8765 /' | awk '{print $1, $4}'
ss -tlnp | grep -o 'users:(("python3"' | head -1
curl -s http://127.0.0.1:8765/
curl -s -o /dev/null -w 'status %{http_code}, %{size_download} bytes\n' localhost:8765/missing
python3 -m http.server 8765 --bind 127.0.0.1 2>&1 | grep -o 'Address already in use' &
sleep 1
kill $srv
```

"Address already in use" is the error every developer meets: a second server cannot bind a port another socket is listening on. Find the owner with `ss -tlnp 'sport = :8765'` or `lsof -i :8765`, then stop it or choose another port.

## 7.3 HTTP is just text over TCP

`nc` (netcat) opens a raw TCP connection. Typing an HTTP request by hand shows exactly what browsers and `curl` send.

```bash run Speaking HTTP by hand with nc, and curl -v
mkdir site && echo 'ok' > site/health
python3 -m http.server 8766 --bind 127.0.0.1 --directory site > /dev/null 2>&1 &
srv=$!
for i in $(seq 50); do curl -s -o /dev/null localhost:8766 && break; sleep 0.1; done
printf 'GET /health HTTP/1.0\r\nHost: localhost\r\n\r\n' | nc -q 1 127.0.0.1 8766 \
  | tr -d '\r' | grep -vE '^(Date|Server|Last-Modified):'
curl -sv localhost:8766/health 2>&1 | grep -E '^[<>] (GET|HTTP|Host|User-Agent|Accept)' \
  | sed 's/curl\/[0-9.]*/curl\/X/'
kill $srv
```

The request is a request line, headers, and a blank line (`\r\n\r\n`); the response is a status line, headers, a blank line and the body. The `Date`, `Server` and `Last-Modified` headers were removed from the printout because they change with every run and version.

## 7.4 curl for APIs

| Task | Command |
|---|---|
| GET with headers shown | `curl -i https://api.example.com/meters` |
| POST JSON | `curl -X POST -H 'Content-Type: application/json' -d '{"kwh": 3.2}' URL` |
| Bearer token | `curl -H "Authorization: Bearer $TOKEN" URL` |
| Follow redirects, fail on HTTP errors | `curl -fsSL URL` (the standard for scripts) |
| Timing breakdown | `curl -o /dev/null -s -w '%{time_connect} %{time_starttransfer} %{time_total}\n' URL` |
| Download a file | `curl -fLo file.tgz URL` |

```bash run A tiny JSON API, called with curl and parsed with jq
cat > api.py <<'EOF'
import json
from http.server import BaseHTTPRequestHandler, HTTPServer
class H(BaseHTTPRequestHandler):
    def do_POST(self):
        body = json.loads(self.rfile.read(int(self.headers['Content-Length'])))
        cost = round(body['kwh'] * 7.5, 2)
        reply = {'meter': body['meter'], 'kwh': body['kwh'], 'cost': cost}
        data = json.dumps(reply).encode()
        self.send_response(201)
        self.send_header('Content-Type', 'application/json')
        self.end_headers(); self.wfile.write(data)
    def log_message(self, *a): pass
HTTPServer(('127.0.0.1', 8767), H).serve_forever()
EOF
python3 api.py & srv=$!
for i in $(seq 50); do curl -s -o /dev/null localhost:8767 && break; sleep 0.1; done
curl -s -X POST -H 'Content-Type: application/json' -d '{"meter": "SM-42", "kwh": 3.2}' \
  -w '\nstatus %{http_code}\n' localhost:8767/readings
curl -s -X POST -d '{"meter": "SM-7", "kwh": 10}' localhost:8767/readings | jq -r '.cost'
kill $srv
```

## 7.5 DNS: from names to addresses

The resolver looks up names using `/etc/nsswitch.conf` (which says: first `/etc/hosts`, then DNS), and DNS servers from `/etc/resolv.conf`. Tools: `getent hosts name` (uses the same path as programs), `dig name` and `nslookup name` (ask DNS directly). Record types: **A** (IPv4), **AAAA** (IPv6), **CNAME** (alias), **MX** (mail), **TXT** (verification, SPF), **NS** (name servers). Records are cached for their **TTL**, which is why DNS changes take time to spread.

```bash run How this machine resolves names
grep '^hosts:' /etc/nsswitch.conf
getent hosts localhost ip6-localhost | sort
grep -c '^nameserver' /etc/resolv.conf | sed 's/$/ nameserver line(s) configured/'
```

> TIP: When "the site is down" for one machine only, compare `getent hosts example.com` with `dig +short example.com @8.8.8.8`. An entry in `/etc/hosts` or a stale cache explains many mysteries.

## 7.6 SSH and keys

**SSH** gives an encrypted shell on a remote machine (`ssh user@host`), file copies (`scp`, `rsync -avz`, `sftp`) and tunnels (`ssh -L 5432:db.internal:5432 bastion` makes a remote database reachable on your local port 5432). Log in with a **key pair** instead of a password: the private key stays on your machine (mode 600), the public key is appended to `~/.ssh/authorized_keys` on the server.

```bash run Generating an SSH key pair and checking its permissions
mkdir -m 700 .ssh
ssh-keygen -q -t ed25519 -N '' -C 'learner@laptop' -f .ssh/id_ed25519
stat -c '%a %n' .ssh .ssh/id_ed25519 .ssh/id_ed25519.pub
cut -d' ' -f1,3 .ssh/id_ed25519.pub
head -1 .ssh/id_ed25519
ssh-keygen -lf .ssh/id_ed25519.pub | awk '{print $1, $4}'
```

The private key is created with mode 600, and SSH refuses to use a private key that others can read ("UNPROTECTED PRIVATE KEY FILE"). Server-side hardening, shown for reference (root required):

```text
# /etc/ssh/sshd_config
PasswordAuthentication no     # keys only
PermitRootLogin no            # log in as yourself, then sudo
# then: sudo systemctl reload ssh
```

## 7.7 Firewalls

Linux filters packets in the kernel (**netfilter**), configured with `nftables`/`iptables`, or through friendlier front ends: `ufw` on Ubuntu, `firewalld` on Red Hat. Cloud platforms add **security groups** in front of the VM. The usual policy for a web server: deny all incoming, allow 22 from your office or VPN only, allow 80 and 443 from anywhere; databases listen only on private addresses.

```text
sudo ufw default deny incoming
sudo ufw allow from 203.0.113.0/24 to any port 22 proto tcp
sudo ufw allow 80,443/tcp
sudo ufw enable
sudo ufw status numbered
```

## 7.8 Practical lessons

- `ip addr`, `ip route` for addresses and routes; `ss -tlnp` for listening ports and their processes.
- `curl -fsS` in scripts; `curl -v` to see the exact request and response; `jq` for JSON.
- HTTP is text over TCP: request line, headers, blank line, body.
- Name resolution: `/etc/hosts`, then DNS from `/etc/resolv.conf`; `getent` vs `dig`.
- SSH keys: private 600, `~/.ssh` 700, no password logins, no root logins; firewall everything except what must be public.
