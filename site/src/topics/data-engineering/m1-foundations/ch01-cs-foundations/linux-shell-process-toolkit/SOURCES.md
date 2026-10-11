## wait(2) - Linux manual page (Debian manpages mirror)
URL: https://manpages.debian.org/unstable/manpages-dev/wait.2.en.html
Version: Linux man-pages 6.19, page dated 2026-06-05 (manpages-dev 6.19-3, Debian unstable)

> A state change is considered to be: the child terminated; the child was stopped by a signal; or the child was resumed by a signal.

> WEXITSTATUS(wstatus) returns the exit status of the child. This consists of the least significant 8 bits of the status argument that the child specified in a call to exit(3) or _exit(3) or as the argument for a return statement in main().

> WIFSIGNALED(wstatus) returns true if the child process was terminated by a signal.

> WTERMSIG(wstatus) returns the number of the signal that caused the child process to terminate.

> A child that terminates, but has not been waited for becomes a "zombie".

> If a parent process terminates, then its "zombie" children (if any) are adopted by init(1), (or by the nearest "subreaper" process as defined through the use of the prctl(2) PR_SET_CHILD_SUBREAPER operation); init(1) automatically performs a wait to remove the zombies.

Notes: this page has no word "orphan"; the adoption-by-init sentence above is the source for the orphan behaviour.

Contents:
- NAME
- LIBRARY
- SYNOPSIS
- DESCRIPTION (wait() and waitpid(); WIFEXITED, WEXITSTATUS, WIFSIGNALED, WTERMSIG, WCOREDUMP, WIFSTOPPED, WSTOPSIG, WIFCONTINUED; waitid())
- RETURN VALUE
- ERRORS
- VERSIONS
- STANDARDS
- HISTORY
- NOTES (zombies, SIGCHLD set to SIG_IGN, Linux notes on threads and __WCLONE/__WALL/__WNOTHREAD)
- BUGS
- EXAMPLES
- SEE ALSO

## fork(2) - Linux manual page (Debian manpages mirror)
URL: https://manpages.debian.org/unstable/manpages-dev/fork.2.en.html
Version: Linux man-pages 6.19, page dated 2026-06-05 (manpages-dev 6.19-3, Debian unstable)

> fork() creates a new process by duplicating the calling process.

> The child process and the parent process run in separate memory spaces.

> The child inherits copies of the parent's set of open file descriptors. Each file descriptor in the child refers to the same open file description (see open(2)) as the corresponding file descriptor in the parent.

> On success, the PID of the child process is returned in the parent, and 0 is returned in the child.

Contents:
- NAME
- LIBRARY
- SYNOPSIS
- DESCRIPTION (attributes that differ in the child; further points on threads, file descriptors, message queues, directory streams)
- RETURN VALUE
- ERRORS
- VERSIONS (C library/kernel differences; async-signal safety)
- STANDARDS
- HISTORY
- NOTES (copy-on-write)
- EXAMPLES
- SEE ALSO

## execve(2) - Linux manual page (Debian manpages mirror)
URL: https://manpages.debian.org/unstable/manpages-dev/execve.2.en.html
Version: Linux man-pages 6.19, page dated 2026-02-08 (manpages-dev 6.19-3, Debian unstable)

> execve() executes the program referred to by path. This causes the program that is currently being run by the calling process to be replaced with a new program, with newly initialized stack, heap, and (initialized and uninitialized) data segments.

> If the set-user-ID bit is set on the program file referred to by path, then the effective user ID of the calling process is changed to that of the owner of the program file.

> The process's real UID and real GID, as well as its supplementary group IDs, are unchanged by a call to execve().

Contents:
- NAME
- LIBRARY
- SYNOPSIS
- DESCRIPTION (argv and envp, interpreter scripts, set-user-ID/set-group-ID handling, effects on process attributes)
- RETURN VALUE
- ERRORS
- VERSIONS
- STANDARDS
- HISTORY
- NOTES
- EXAMPLES
- SEE ALSO

## signal(7) - Linux manual page (Debian manpages mirror)
URL: https://manpages.debian.org/unstable/manpages/signal.7.en.html
Version: Linux man-pages 6.19 (manpages 6.19-3, Debian unstable)

> Term Default action is to terminate the process.

> The signals SIGKILL and SIGSTOP cannot be caught, blocked, or ignored.

The signal table lists each signal as a name, standard, default action and comment on separate lines; the passages below are the comment text of the rows (the Term action sits on the line before the comment).

> Hangup detected on controlling terminal or death of controlling process

> Interrupt from keyboard

> Kill signal

> Termination signal

Contents:
- NAME
- DESCRIPTION (signal dispositions; the Term, Ign, Core, Stop, Cont default actions; standard signals table SIGHUP, SIGINT, SIGKILL, SIGTERM and others; real-time signals; delivery, blocking, handlers)
- STANDARDS
- NOTES
- BUGS
- SEE ALSO

## proc_pid_status(5) - Linux manual page (Debian manpages mirror)
URL: https://manpages.debian.org/unstable/manpages/proc_pid_status.5.en.html
Version: Linux man-pages 6.19, page dated 2026-02-08 (manpages 6.19-3, Debian unstable)

> Current state of the process. One of "R (running)", "S (sleeping)", "D (disk sleep)", "T (stopped)", "t (tracing stop)", "Z (zombie)", or "X (dead)".

> Number of threads in process containing this thread.

> Thread group ID (i.e., Process ID).

Contents:
- NAME
- DESCRIPTION (field-by-field description of /proc/pid/status: Name, Umask, State, Tgid, Ngid, Pid, PPid, ..., Threads, SigQ, SigPnd, SigBlk, SigIgn, ...)
- SEE ALSO

## proc_pid_wchan(5) - Linux manual page (Debian manpages mirror)
URL: https://manpages.debian.org/unstable/manpages/proc_pid_wchan.5.en.html
Version: Linux man-pages 6.19, page dated 2026-02-08 (manpages 6.19-3, Debian unstable)

> The symbolic name corresponding to the location in the kernel where the process is sleeping.

Contents:
- NAME
- DESCRIPTION (/proc/pid/wchan since Linux 2.6.0; ptrace access check)
- SEE ALSO

## proc_pid_fd(5) - Linux manual page (Debian manpages mirror)
URL: https://manpages.debian.org/unstable/manpages/proc_pid_fd.5.en.html
Version: Linux man-pages 6.19, page dated 2026-02-08 (manpages 6.19-3, Debian unstable)

> This is a subdirectory containing one entry for each file which the process has open, named by its file descriptor, and which is a symbolic link to the actual file. Thus, 0 is standard input, 1 standard output, 2 standard error, and so on.

> For file descriptors for pipes and sockets, the entries will be symbolic links whose content is the file type with the inode.

Contents:
- NAME
- DESCRIPTION (one symlink per open fd; pipe and socket type:[inode] form; anon_inode entries; /proc/self/fd/N versus /dev/fd/N; permission notes)
- SEE ALSO

## proc_pid_stack(5) - Linux manual page (Debian manpages mirror)
URL: https://manpages.debian.org/unstable/manpages/proc_pid_stack.5.en.html
Version: Linux man-pages 6.19, page dated 2026-02-08 (manpages 6.19-3, Debian unstable)

> This file provides a symbolic trace of the function calls in this process's kernel stack. This file is provided only if the kernel was built with the CONFIG_STACKTRACE configuration option.

Contents:
- NAME
- DESCRIPTION (/proc/pid/stack since Linux 2.6.29; needs CONFIG_STACKTRACE; ptrace attach access check)
- SEE ALSO

## credentials(7) - Linux manual page (Debian manpages mirror)
URL: https://manpages.debian.org/unstable/manpages/credentials.7.en.html
Version: Linux man-pages 6.19, page dated 2026-07-02 (manpages 6.19-3, Debian unstable)

> A process's parent process ID identifies the process that created this process using fork(2).

> A set-user-ID program can assume and drop privileges by switching its effective user ID back and forth between the values in its real user ID and saved set-user-ID.

Contents:
- NAME
- DESCRIPTION (Process ID; Parent process ID; Process group ID and session ID; User and group identifiers: real, effective, saved set-user-ID, filesystem IDs, supplementary group IDs; modifying and retrieving IDs)
- STANDARDS
- NOTES
- SEE ALSO

## path_resolution(7) - Linux manual page (Debian manpages mirror)
URL: https://manpages.debian.org/unstable/manpages/path_resolution.7.en.html
Version: Linux man-pages 6.19, page dated 2026-02-08 (manpages 6.19-3, Debian unstable)

> If the process does not have search permission on the current lookup directory, an EACCES error is returned ("Permission denied").

> Of the three bits used, the first bit determines read permission, the second write permission, and the last execute permission in case of ordinary files, or search permission in case of directories.

Contents:
- NAME
- DESCRIPTION (pathname components; starting lookup directory; the lookup loop and its errors; symlinks; permission bits and fsuid)
- SEE ALSO

## inode(7) - Linux manual page (Debian manpages mirror)
URL: https://manpages.debian.org/unstable/manpages/inode.7.en.html
Version: Linux man-pages 6.19, page dated 2026-02-08 (manpages 6.19-3, Debian unstable)

> set-user-ID bit (see execve (2))

Contents:
- NAME
- DESCRIPTION (struct stat fields; st_mode file type and permission constants such as S_ISUID 04000)
- STANDARDS
- HISTORY
- NOTES
- SEE ALSO

## chmod(1) - coreutils manual page (Debian manpages mirror)
URL: https://manpages.debian.org/unstable/coreutils/chmod.1.en.html
Version: coreutils 9.10-1 (Debian unstable, source updated 2026-02-26)

> The first digit selects the set user ID (4) and set group ID (2) and restricted deletion or sticky (1) attributes.

> chmod clears the set-group-ID bit of a regular file if the file's group ID does not match the user's effective group ID or one of the user's supplementary group IDs, unless the user has appropriate privileges.

Contents:
- NAME
- SYNOPSIS
- DESCRIPTION (symbolic and octal modes)
- SETUID AND SETGID BITS
- RESTRICTED DELETION FLAG OR STICKY BIT
- OPTIONS
- AUTHOR
- REPORTING BUGS
- SEE ALSO

## umask(2) - Linux manual page (Debian manpages mirror)
URL: https://manpages.debian.org/unstable/manpages-dev/umask.2.en.html
Version: Linux man-pages 6.19, page dated 2026-02-08 (manpages-dev 6.19-3, Debian unstable)

> permissions in the umask are turned off from the mode argument to open(2) and mkdir(2).

> The typical default value for the process umask is S_IWGRP | S_IWOTH (octal 022).

> A child process created via fork(2) inherits its parent's umask. The umask is left unchanged by execve(2).

Contents:
- NAME
- LIBRARY
- SYNOPSIS
- DESCRIPTION (mask & 0777; default ACL interaction; 0666 & ~022 = 0644)
- RETURN VALUE
- STANDARDS
- HISTORY
- NOTES (inheritance; Umask field in /proc/pid/status since Linux 4.7; IPC objects)
- SEE ALSO

## strace(1) - manual page (Debian manpages mirror)
URL: https://manpages.debian.org/unstable/strace/strace.1.en.html
Version: strace 7.2+ds-1 (Debian unstable, page dated 2026-06-25)

> Attaches to the process with the process ID pid and begin tracing. The trace may be terminated at any time by a keyboard interrupt signal (CTRL-C). strace will respond by detaching itself from the traced processes, leaving them to continue running.

Contents:
- NAME
- SYNOPSIS
- DESCRIPTION
- OPTIONS (-p/--attach among general, filtering, tracing, output and statistics options)
- DIAGNOSTICS
- SETUID INSTALLATION
- MULTIPLE PERSONALITIES SUPPORT
- NOTES
- BUGS
- HISTORY
- REPORTING BUGS
- SEE ALSO
- AUTHORS

## ps(1) - procps manual page (Debian manpages mirror)
URL: https://manpages.debian.org/unstable/procps/ps.1.en.html
Version: procps 2:4.0.7-1 (Debian unstable, source updated 2026-08-12)

> uninterruptible sleep (usually I/O)

> running or runnable (on run queue)

> interruptible sleep (waiting for an event to complete)

> defunct (“zombie”) process, terminated but not reaped by its parent

> Show threads, possibly with LWP and NLWP columns.

Notes: the four state codes are the entries D, R, S, Z of "PROCESS STATE CODES" (each code letter sits on the line before its text).

Contents:
- NAME
- SYNOPSIS
- DESCRIPTION
- EXAMPLES
- SIMPLE PROCESS SELECTION
- PROCESS SELECTION BY LIST
- OUTPUT FORMAT CONTROL
- OUTPUT MODIFIERS
- THREAD DISPLAY (-L, -T, m)
- OTHER INFORMATION
- NOTES
- PROCESS FLAGS
- PROCESS STATE CODES (D, I, R, S, T, t, W, X, Z and the BSD extra characters)
- OBSOLETE SORT KEYS
- AIX FORMAT DESCRIPTORS
- STANDARD FORMAT SPECIFIERS
- ENVIRONMENT VARIABLES
- PERSONALITY
- BUGS
- SEE ALSO
- STANDARDS
- AUTHOR

## crontab(5) - cron manual page (Debian manpages mirror)
URL: https://manpages.debian.org/unstable/cron/crontab.5.en.html
Version: cron 3.0pl1-211 (Debian unstable, source updated 2026-09-27)

> Several environment variables are set up automatically by the cron(8) daemon. SHELL is set to /usr/bin/sh, and LOGNAME and HOME are set from the /etc/passwd line of the crontab's owner.

> cron(8) examines cron entries once every minute.

> Commands are executed by cron(8) when the minute, hour, and month of year fields match the current time, and when at least one of the two day fields (day of month, or day of week) match the current time

> If both fields are restricted (i.e., aren't *), the command will be run when either field matches the current time.

> The cron daemon runs with a defined timezone. It currently does not support per-user timezones.

Notes: this Debian crontab(5) says nothing about daylight-saving-time transitions; do not attribute DST behaviour to it (cron(8) or the Debian cron README would be needed).

Contents:
- NAME
- DESCRIPTION (environment settings; five time fields minute 0-59, hour 0-23, day of month 1-31, month 1-12, day of week 0-7; ranges, lists, steps, names; the command field and % handling; @reboot, @yearly ... @hourly)
- EXAMPLE CRON FILE
- EXAMPLE SYSTEM CRON FILE
- YET ANOTHER EXAMPLE
- SEE ALSO
- EXTENSIONS
- LIMITATIONS (single configured timezone)
- USING EVAL TO WRAP MISC ENVIRONMENT SETTINGS
- DIAGNOSTICS
- AUTHORS
- COPYRIGHT

## GNU Bash Reference Manual
URL: https://www.gnu.org/software/bash/manual/bash.html
Version: Bash 5.3, 18 May 2025
Pipeline status is the last command's; pipefail:
> The exit status of a pipeline is the exit status of the last command in the pipeline, unless the pipefail option is enabled

> If pipefail is enabled, the pipeline’s return status is the value of the last (rightmost) command to exit with a non-zero status, or zero if all commands exit successfully.
Order of redirections:
> The order of redirections is significant.

> ls > dirlist 2>&1

> ls 2>&1 > dirlist

> directs only the standard output to file dirlist, because the standard error was made a copy of the standard output before the standard output was redirected to dirlist.
Exit status 126, 127, 128+n:
> When a command terminates on a fatal signal whose number is N, Bash uses the value 128+N as the exit status.

> If a command is not found, the child process created to execute it returns a status of 127.

> If a command is found but is not executable, the return status is 126.
set -e / set -u:
> Exit immediately if a pipeline (see Pipelines), which may consist of a single simple command

> Treat unset variables and parameters other than the special parameters ‘@’ or ‘*’, or array variables subscripted with ‘@’ or ‘*’, as an error when performing parameter expansion.

Contents:
- Pipelines: exit status is the last command's; pipefail changes it to the rightmost non-zero status; `!` negates
- Redirections: order is significant; `> file 2>&1` sends both streams to the file, `2>&1 > file` does not
- Exit Status: 0 success, non-zero failure, 127 not found, 126 not executable, 128+N for fatal signal N
- The Set Builtin: -e (errexit), -u (nounset), -o pipefail

## POSIX.1-2024 Shell Command Language
URL: https://pubs.opengroup.org/onlinepubs/9799919799/utilities/V3_chap02.html
Version: IEEE Std 1003.1-2024, The Open Group Base Specifications Issue 8
> If the command is not found, the exit status shall be 127.

> Otherwise, if the command name is found, but it is not an executable utility, the exit status shall be 126.

> The exit status of a pipeline shall depend on whether or not the pipefail option (see set) is enabled

Contents:
- Shell Command Language chapter (2): quoting, token recognition, reserved words, parameter/command/arithmetic expansion, redirection, exit status and errors, shell commands (pipelines, lists, compound commands), shell grammar, job control, signals, shell execution environment, pattern matching, special built-in utilities
- Exit Status for Commands: 127 not found, 126 found but not executable, signal termination above 128
- Pipelines: exit status depends on the pipefail option (new in Issue 8) and a leading `!`

## jq 1.8 Manual
URL: https://jqlang.org/manual/
Version: jq 1.8 Manual
> With this option, if the filter's result is a string then it will be written directly to standard output rather than being formatted as a JSON string with quotes.

> By default, jq pretty-prints JSON output. Using this option will result in more compact output by instead putting each JSON object on a single line.

> Instead of running the filter for each JSON object in the input, read the entire input stream into a large array and run the filter just once.

> The function select(f) produces its input unchanged if f returns true for that input, and produces no output otherwise.

> group_by(.foo) takes as input an array, groups the elements having the same .foo field into separate arrays, and produces all of these arrays as elements of a larger array, sorted by the value of the .foo field.

> The length of an array is the number of elements.

> The length of an object is the number of key-value pairs.

Contents:
- Invoking jq: --slurp/-s, --compact-output/-c, --raw-output/-r, --slurpfile
- Builtin operators and functions: length, select(boolean_expression), group_by(path_expression), unique_by, map, add

## The GNU Awk User's Guide (Top page, Edition 5.4)
URL: https://www.gnu.org/software/gawk/manual/html_node/index.html
Version: Edition 5.4 of GAWK: Effective AWK Programming, for gawk 5.4.0 (or later)
The single-page manual (gawk.html) could not be fetched (connection reset), so the per-node pages below are cited instead.
> This file documents awk, a program that you can use to select particular records in a file and perform operations upon them.

Contents:
- Part I, The awk Language: getting started, running awk, regular expressions, reading input files, printing, expressions, patterns and actions, arrays, functions
- Part II onward: gawk-specific features (see the manual's Short Table of Contents)

## The GNU Awk User's Guide: Examining Fields
URL: https://www.gnu.org/software/gawk/manual/html_node/Fields.html
Version: Edition 5.4 of GAWK: Effective AWK Programming
> By default, fields are separated by whitespace, like words in a line.

> Thus, $1 refers to the first field, $2 to the second, and so on.

> NF is a predefined variable whose value is the number of fields in the current record.

> the last field in a record can be represented by $NF.

Contents:
- Section 4.2 Examining Fields: records split into fields by whitespace by default
- $1, $2, ... address fields; $0 is the whole record
- NF holds the field count; $NF is the last field

## The GNU Awk User's Guide: Arrays
URL: https://www.gnu.org/software/gawk/manual/html_node/Array-Intro.html
Version: Edition 5.4 of GAWK: Effective AWK Programming
> Arrays in awk are different—they are associative.

> This means that each array is a collection of pairs—an index and its corresponding array element value

> In awk, it isn’t necessary to specify the size of an array before starting to use it.

> array subscripts are always strings.

Contents:
- Introduction to arrays: awk arrays are associative (index/value pairs), need no declared size
- New pairs can be added at any time; subscripts are always strings

## The GNU Awk User's Guide: Some Simple Examples
URL: https://www.gnu.org/software/gawk/manual/html_node/Very-Simple.html
Version: Edition 5.4 of GAWK: Effective AWK Programming
> awk '/li/ { print $0 }' mail-list

> Just ‘print’ by itself means the same thing

Contents:
- Section 1.3: a pattern in slashes selects lines, `{ print $0 }` is the action printing the current line
- A rule may omit the pattern or the action, not both

## GNU sed manual
URL: https://www.gnu.org/software/sed/manual/sed.html
Version: GNU sed 4.10
> By default, sed prints out the pattern space at the end of each cycle through the script

> These options disable this automatic printing, and sed only produces output when explicitly told to via the p command.

> The s command (as in substitute) is probably the most important in sed and has a lot of different options.

> The syntax of the s command is ‘s/regexp/replacement/flags’.

Contents:
- Command-line options: -n/--quiet/--silent disables automatic printing of the pattern space
- The s command: s/regexp/replacement/flags, substitutes the match in the pattern space
- The p command prints; commands such as d, N, q change the cycle

## GNU Grep manual
URL: https://www.gnu.org/software/grep/manual/grep.html
Version: GNU Grep 3.12
> Interpret patterns as extended regular expressions (EREs).

> (-E is specified by POSIX.)

Contents:
- Matching control: -E (extended regexp), -F (fixed strings), -G (basic), -P (Perl)
- Regular expressions: basic vs extended syntax, character classes, back-references

## OpenBSD ssh(1)
URL: https://man.openbsd.org/ssh
Version: OpenBSD-current, September 5, 2026
> Connect to the target host by first making an ssh connection to the jump host described by destination and then establishing a TCP forwarding to the ultimate destination from there.

> Multiple jump hops may be specified separated by comma characters.

> Specifies that connections to the given TCP port or Unix socket on the local (client) host are to be forwarded to the given host and port, or Unix socket, on the remote side.

> Specifies that connections to the given TCP port or Unix socket on the remote (server) host are to be forwarded to the local side.

> The file ~/.ssh/authorized_keys lists the

Contents:
- -J destination: jump host (ProxyJump shortcut), comma-separated hops
- -L [bind_address:]port:host:hostport: local forward
- -R [bind_address:]port:host:hostport: remote forward
- -i identity_file: key selection
- Authentication: ~/.ssh/authorized_keys on the server lists public keys
