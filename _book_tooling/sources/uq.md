# How to use this practice book
%36 exercises matching the Linux guide, with hints kept separate and executed solutions

Each part matches chapters of the **Linux for Software Engineers** guide. Work in a real shell (Linux, WSL, a cloud VM or `docker run -it ubuntu:24.04 bash`). Exercises that analyse a log use the same `access.log` as Chapter 3 of the guide; copy it from there.

Solutions were executed exactly like the guide: as the unprivileged user `nobody`, in a fresh home directory shown as `/home/learner`, with the time zone set to UTC.

| Type | What you do |
|---|---|
| Code | Write and run commands or a script |
| Concept | Explain in words, as in an interview |
| Debug | Find and fix the bug |
| Numerical | Work out a value by hand |

**Marking scheme.** Mark ✓ (solved alone), ~ (with the hint) or ✗ (needed the solution). For scripts, ✓ also requires: strict mode, every variable quoted, input validated. Redo every ~ and ✗ a week later.

| Part | Guide chapters | Topic | Exercises |
|---|---|---|---|
| 1 | 2 | Files and the shell | 5 |
| 2 | 3 | Text processing | 6 |
| 3 | 4 | Users and permissions | 5 |
| 4 | 5 | Processes and signals | 5 |
| 5 | 6 | Shell scripting | 6 |
| 6 | 7 | Networking | 4 |
| 7 | 8–10 | Services, internals and troubleshooting | 5 |

# Exercises

## Part 1: Files and the shell

**U1.1 · Easy · Code · One-command project tree.** With a single `mkdir` command create `project/src/main`, `project/src/util`, `project/test/main` and `project/test/util`. How many directories exist under (and including) `project`?

**U1.2 · Medium · Concept · Directory link counts.** An empty directory has a link count of 2; a directory with three subdirectories has 5. Explain why, and verify.

**U1.3 · Medium · Code · Rename safely.** A folder contains `IMG 001.JPG`, `IMG 002.JPG` and `notes.txt`. Rename every `.JPG` to `.jpg`, coping with spaces in the names.

**U1.4 · Easy · Code · Redirection order.** Using a command that writes to both streams (`ls existing missing`), show what ends up in the file and on the terminal for `> f 2>&1`, `2>&1 > f` and `&> f`.

**U1.5 · Medium · Debug · Looping over ls.** This loop prints errors when file names contain spaces: `for f in $(ls *.txt); do wc -l $f; done`. Explain both bugs and fix them.

## Part 2: Text processing

**U2.1 · Easy · Code · Clients and POSTs.** From `access.log`: how many distinct client IPs are there, and which IP sent the most POST requests?

**U2.2 · Medium · Code · Brute-force detector.** Print every IP with three or more failed logins (status 401 on `/api/login`), with its count and the time of its first and last failure.

**U2.3 · Medium · Code · Latency per endpoint.** For each endpoint (ignore the numeric id in `/api/meters/42`), print the number of requests, the median and the maximum latency.

**U2.4 · Medium · Code · Errors to CSV.** Produce `errors.csv` with the header `ip,path,status` and one row for each request with status 400 or above.

**U2.5 · Hard · Code · A text histogram.** Print requests per minute as a bar chart of `#` characters, one line per minute.

**U2.6 · Medium · Code · Big recent files.** In a directory tree, list files larger than 1 MB modified within the last 2 days, largest first, with human-readable sizes. Build a test tree to prove it works.

## Part 3: Users and permissions

**U3.1 · Easy · Numerical · Modes.** (a) Convert `rwxr-x---` to octal. (b) Convert 640 and 4755 to symbolic form. (c) With umask 027, what modes do new files and directories get?

**U3.2 · Medium · Code · Lock down a project.** Make `~/.ssh` 700 and its private key 600, then write a `find` command that lists every file in your home that is group- or world-writable, and fix them.

**U3.3 · Medium · Concept · sudo and redirection.** Why does `sudo echo "127.0.0.1 api.local" >> /etc/hosts` fail with "Permission denied", and what are two correct ways to do it?

**U3.4 · Medium · Code · Audit setuid programs.** List the setuid-root programs in `/usr/bin` and explain why each one needs the bit.

**U3.5 · Hard · Concept · Temporary files safely.** Explain the symbolic-link attack on a script that writes to `/tmp/report.txt`, how the sticky bit relates to it, and how `mktemp` prevents it.

## Part 4: Processes and signals

**U4.1 · Easy · Code · Find and stop.** Start three background `sleep 300` processes and one `sleep 301`. Stop only the three `sleep 300` ones by pattern and verify that one sleep remains.

**U4.2 · Medium · Code · A well-behaved daemon.** Write a shell "daemon" that ignores SIGHUP, prints `reloading config` on SIGUSR1, and exits cleanly with a message on SIGTERM. Demonstrate all three.

**U4.3 · Medium · Code · Time limits.** Run a command that would take 10 seconds with a 1-second limit. What exit status does `timeout` return, and how do you make it send SIGKILL if the command ignores SIGTERM?

**U4.4 · Medium · Concept · High load, idle CPU.** A 4-CPU server shows load average 8.0 but `top` shows 5% user CPU and 70% `wa`. What is happening and what do you check next?

**U4.5 · Hard · Code · Detect a descriptor leak.** Write a program that leaks a file descriptor per "request", and a shell loop that samples its open-descriptor count from `/proc` to show the leak.

## Part 5: Shell scripting

**U5.1 · Easy · Code · Largest files.** Write `largest.sh DIR [N]` that prints the N (default 3) largest files under DIR, with sizes, and exits with a usage message if DIR is missing or not a directory.

**U5.2 · Medium · Code · Retry with back-off.** Write a function `retry MAX cmd args...` that runs a command until it succeeds, waiting 1, 2, 4, ... units between attempts, and fails after MAX attempts. Test it with a command that succeeds on the third try.

**U5.3 · Medium · Debug · A dangerous cleanup script.** Find every problem in this script and rewrite it: `cd $1; rm -rf $TARGET/*; echo done`.

**U5.4 · Medium · Code · Read a config file.** Parse a `key = value` file into an associative array, ignoring blank lines and `#` comments and trimming spaces; print the keys in sorted order.

**U5.5 · Hard · Code · Parallel health checks.** Check eight "servers" (simulate each with a function that sleeps and returns 0 or 1) with at most three checks running at once, then print a summary of healthy and failed servers.

**U5.6 · Medium · Code · Options.** Write `greet.sh -n NAME [-c COUNT] [-v]` using `getopts`, validating that COUNT is a positive integer.

## Part 6: Networking

**U6.1 · Easy · Code · Status codes.** Serve a directory with `python3 -m http.server` and use `curl` to print the status code and content length for an existing file, a missing file and the directory listing.

**U6.2 · Medium · Code · Wait for a port.** Write `wait-for.sh HOST PORT TIMEOUT` that waits until a TCP port accepts connections or the timeout passes (as used in Docker Compose start-up scripts), and test both outcomes.

**U6.3 · Medium · Concept · Three different failures.** Explain and demonstrate the difference between "Connection refused", a connection timeout, and "Could not resolve host".

**U6.4 · Medium · Code · Health check without curl.** Minimal container images often lack curl. Write a health check using only bash and `nc` that prints `healthy` when `/health` returns HTTP 200.

## Part 7: Services, internals and troubleshooting

**U7.1 · Medium · Code · A hardened unit file.** Write a systemd unit for the meter API that runs as a dedicated user, restarts on failure, limits descriptors, and uses systemd's sandboxing options. Check it with `systemd-analyze verify`.

**U7.2 · Easy · Numerical · Cron expressions.** Write cron entries for: (a) every 15 minutes; (b) 23:45 every Sunday; (c) 06:00 on weekdays in March only. Interpret (d) `0 */6 * * *` and (e) `30 1 1,15 * *`.

**U7.3 · Medium · Code · Children cannot change their parent.** Show that a child process (or subshell) cannot change the parent shell's variables or working directory, and explain why `cd` and `export` must be builtins.

**U7.4 · Hard · Code · Network isolation.** Start an HTTP server on the host's loopback. Show that a process in a new network namespace cannot reach it, even after bringing up its own loopback interface.

**U7.5 · Medium · Concept · An incident.** At 02:10 an alert says the meter API returns 500s. You find the disk at 100%. Write the sequence of commands you would run, what each tells you, the immediate fix and the permanent fix.
