## wait(2) - Linux manual page (Debian manpages mirror)
URL: https://manpages.debian.org/unstable/manpages-dev/wait.2.en.html
Version: Linux man-pages 6.19, page dated 2026-06-05 (manpages-dev 6.19-3, Debian unstable)

> A state change is considered to be: the child terminated; the child was stopped by a signal; or the child was resumed by a signal.

> WEXITSTATUS(wstatus) returns the exit status of the child. This consists of the least significant 8 bits of the status argument that the child specified in a call to exit(3) or _exit(3) or as the argument for a return statement in main().

> WIFSIGNALED(wstatus) returns true if the child process was terminated by a signal.

> WTERMSIG(wstatus) returns the number of the signal that caused the child process to terminate.

> A child that terminates, but has not been waited for becomes a "zombie".

> If a parent process terminates, then its "zombie" children (if any) are adopted by init(1), (or by the nearest "subreaper" process as defined through the use of the prctl(2) PR_SET_CHILD_SUBREAPER operation); init(1) automatically performs a wait to remove the zombies.

> POSIX.1-2001 specifies that if the disposition of SIGCHLD is set to SIG_IGN or the SA_NOCLDWAIT flag is set for SIGCHLD (see sigaction(2)), then children that terminate do not become zombies

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

> The child process is created with a single thread—the one that called fork().

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

> The dispositions of any signals that are being caught are reset to the default (signal(7)).

> POSIX.1 specifies that the dispositions of any signals that are ignored or set to the default are left unchanged.

> execve() executes the program referred to by path. This causes the program that is currently being run by the calling process to be replaced with a new program, with newly initialized stack, heap, and (initialized and uninitialized) data segments.

> If the set-user-ID bit is set on the program file referred to by path, then the effective user ID of the calling process is changed to that of the owner of the program file.

> The process's real UID and real GID, as well as its supplementary group IDs, are unchanged by a call to execve().

> By default, file descriptors remain open across an execve(). File descriptors that are marked close-on-exec are closed

> there is no new process; many attributes of the calling process remain unchanged (in particular, its PID).

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

> The first numeric value in each table row shows the signal number on x86, ARM, and most other architectures

> SIGHUP 1 1 1 1

> SIGINT 2 2 2 2

> SIGKILL 9 9

> SIGTERM 15 15

> A child created via fork(2) inherits a copy of its parent's signal dispositions. During an execve(2), the dispositions of handled signals are reset to the default; the dispositions of ignored signals are left unchanged.

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

> The CAP_DAC_OVERRIDE capability overrides all permission checking, but grants execute permission only when at least one of the file's three execute permission bits is set.

> The CAP_DAC_READ_SEARCH capability grants read and search permission on directories, and read permission on ordinary files.

Contents:
- NAME
- DESCRIPTION (pathname components; starting lookup directory; the lookup loop and its errors; symlinks; permission bits and fsuid)
- SEE ALSO

## inode(7) - Linux manual page (Debian manpages mirror)
URL: https://manpages.debian.org/unstable/manpages/inode.7.en.html
Version: Linux man-pages 6.19, page dated 2026-02-08 (manpages 6.19-3, Debian unstable)

> set-user-ID bit (see execve (2))

> This field contains the number of hard links to the file.

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

> For directories, it prevents unprivileged users from removing or renaming a file in the directory unless they own the file or the directory; this is called the restricted deletion flag for the directory, and is commonly found on world-writable directories like /tmp.

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

> Since Linux 4.7, the umask of any process can be viewed via the Umask field of /proc/pid/status.

> Alternatively, if the parent directory has a default ACL (see acl(5)), the umask is ignored

Note: the page's "0666 ... 0644" example is stated for a default ACL equivalent to umask 022; the plain-umask arithmetic 0666 & ~022 = 0644 is the same and was executed.

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

> Writes the trace output to the file filename rather than to stderr.

> Traces child processes as they are created by currently traced processes as a result of the fork(2), vfork(2) and clone(2) system calls.

> Note that if process PID is multi-threaded, using -f -p PID attaches to all of its threads, not just the one with thread_id = PID.

> Traces all the network related system calls.

> Shows the time spent in system calls.

> Prints paths associated with file descriptor arguments and with the AT_FDCWD constant.

> --absolute-timestamps=precision:us

Notes: this is the long form of `-tt`, listed directly under `-tt` in the options.

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

> elapsed time since the process was started, in the form [[DD-]hh:]mm:ss.

> resident set size, the non-swapped physical memory that a task has used (in kibibytes).

> cpu utilization of the process in "##.#" format. Currently, it is the CPU time used divided by the time the process has been running (cputime/realtime ratio), expressed as a percentage.

> name of the kernel function in which the process is sleeping.

> is a session leader

> is multi-threaded (using CLONE_THREAD, like NPTL pthreads do)

> is in the foreground process group

> Processes marked <defunct> are dead processes (so-called "zombies") that remain because their parent has not destroyed them properly.

> idle kernel thread

Notes: `<defunct>` is shown in the args/cmd column (the comm column shows only the name); `I` is the eighth state code.

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

> minute 0-59 hour 0-23 day of month 1-31 month 1-12 (or names, see below) day of week 0-7 (0 or 7 is Sun, or use names)

> Percent-signs (%) in the command, unless escaped with backslash (\), will be changed into newline characters, and all data after the first % will be sent to the command as standard input.

> The entire command portion of the line, up to a newline or % character, will be executed by /usr/bin/sh or by the shell specified in the SHELL variable of the cronfile.

> Even if a user specifies the TZ environment variable in his crontab this will affect only the commands executed in the crontab, not the execution of the crontab tasks themselves.

> The value string is not parsed for environmental substitutions or replacement of variables or tilde(~) expansion

> The cron daemon runs with a defined timezone. It currently does not support per-user timezones.

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

> Before exiting, an interactive shell resends the SIGHUP to all jobs, running or stopped.

> If Bash is waiting for a command to complete and receives a signal for which a trap has been set, it will not execute the trap until the command completes.

> The shell exits by default upon receipt of a SIGHUP.

> If the huponexit shell option has been set using shopt (see The Shopt Builtin), Bash sends a SIGHUP to all jobs when an interactive login shell exits.

> If Bash is waiting for an asynchronous command via the wait builtin, and it receives a signal for which a trap has been set, the wait builtin will return immediately with an exit status greater than 128, immediately after which the shell executes the trap.

> the redirection fails if the file whose name results from the expansion of word exists and is a regular file.
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

> any command in a pipeline but the last (subject to the state of the pipefail shell option)

> An error message will be written to the standard error, and a non-interactive shell will exit.

> Exit statuses fall between 0 and 255, though, as explained below, the shell may use values above 125 specially.

> Treat unset variables and parameters other than the special parameters ‘@’ or ‘*’, or array variables subscripted with ‘@’ or ‘*’, as an error when performing parameter expansion.

> ($?) Expands to the exit status of the most recently executed command.

> ($$) Expands to the process ID of the shell.

> ($!) Expands to the process ID of the job most recently placed into the background

> If command is supplied, it replaces the shell without creating a new process.

> The action is a command that is read and executed when the shell receives any of the signals sigspec.

> The -l option lists the signal names.

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

> Otherwise, if the command terminated due to the receipt of a signal, the shell shall assign it an exit status greater than 128.

> Note that shell implementations are permitted to assign an exit status greater than 255 if a command terminates due to a signal.

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

> Sets the exit status of jq to 0 if the last output value was neither false nor null, 1 if the last output value was either false or null, or 4 if no valid result was ever produced. Normally jq exits with 2 if there was any usage problem or system error, 3 if there was a jq program compile error, or 0 if the jq program ran.

> The given exit_code (defaulting to 5) will be jq's exit

Note: this 5 is `halt_error`'s default. The manual does not document the exit status of an uncaught runtime error or an input parse error; jq 1.7 exits 5 for both (executed), and jq 1.8.2's src/main.c sets `JQ_ERROR_UNKNOWN = 5` for them (read with curl, see FACT-CHECK.md).

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

> The file ~/.ssh/authorized_keys lists the public keys that are permitted for logging in.

> Requests ssh to go to background just before command execution.

> Selects a file from which the identity (private key) for public key authentication is read.

> Do not execute a remote command. This is useful for just forwarding ports.

> ssh will simply ignore a private key file if it is accessible by others.

> ssh exits with the exit status of the remote command or with 255 if an error occurred.

> Agent forwarding should be enabled with caution.

> A safer alternative may be to use a jump host

> ssh will act as a SOCKS server.

Contents:
- -J destination: jump host (ProxyJump shortcut), comma-separated hops
- -L [bind_address:]port:host:hostport: local forward
- -R [bind_address:]port:host:hostport: remote forward
- -i identity_file: key selection
- Authentication: ~/.ssh/authorized_keys on the server lists public keys

## pthreads(7) - Linux manual page (Debian manpages mirror)
URL: https://manpages.debian.org/unstable/manpages/pthreads.7.en.html
Version: Linux man-pages 6.19 (manpages 6.19-3, Debian unstable)
> A single process can contain multiple threads, all of which are executing the same program. These threads share the same global memory (data and heap segments), but each thread has its own stack (automatic variables).

Contents:
- NAME
- DESCRIPTION (POSIX threads; threads in one process share global memory, each has its own stack; shared and per-thread attributes)
- NOTES (Linux implementations of threads: LinuxThreads and NPTL)
- SEE ALSO

## proc_loadavg(5) - Linux manual page (Debian manpages mirror)
URL: https://manpages.debian.org/unstable/manpages/proc_loadavg.5.en.html
Version: Linux man-pages 6.19, page dated 2026-02-08 (manpages 6.19-3, Debian unstable)
> The first three fields in this file are load average figures giving the number of jobs in the run queue (state R) or waiting for disk I/O (state D) averaged over 1, 5, and 15 minutes.

> They are the same as the load average numbers given by uptime(1) and other programs.

Contents:
- NAME: /proc/loadavg - load average
- DESCRIPTION: first three fields are the load averages over 1, 5 and 15 minutes (state R and state D jobs); fourth field is runnable/existing scheduling entities; fifth field is the most recently created PID
- SEE ALSO

## capabilities(7) - Linux manual page (Debian manpages mirror)
URL: https://manpages.debian.org/unstable/manpages/capabilities.7.en.html
Version: Linux man-pages 6.19 (manpages 6.19-3, Debian unstable)
> Privileged processes bypass all kernel permission checks

> Bypass file read, write, and execute permission checks.

> Bypass file read permission checks and directory read and execute permission checks;

Contents:
- DESCRIPTION: privileged processes (effective user ID 0, superuser or root) bypass kernel permission checks; capabilities divide superuser power into distinct units
- List of capabilities: CAP_DAC_OVERRIDE (bypass file read, write and execute checks), CAP_DAC_READ_SEARCH (bypass file read and directory read/execute checks)
- Other sections not used here

## symlink(7) - Linux manual page (Debian manpages mirror)
URL: https://manpages.debian.org/unstable/manpages/symlink.7.en.html
Version: Linux man-pages 6.19 (manpages 6.19-3, Debian unstable)
> A symbolic link is a special type of file whose contents are a string that is the pathname of another file, the file to which the link refers.

> In other words, a symbolic link is a pointer to another name, and not to an underlying object.

Contents:
- NAME
- DESCRIPTION: what a symbolic link is; symbolic links may refer to directories and cross filesystem boundaries
- Symbolic link ownership, permissions and timestamps; resolution of symbolic links in pathnames

## The GNU Awk User's Guide: String Functions
URL: https://www.gnu.org/software/gawk/manual/html_node/String-Functions.html
Version: Edition 5.4 of GAWK: Effective AWK Programming
> Return a copy of string, with each uppercase character in the string replaced with its corresponding lowercase character.

> Nonalphabetic characters are left unchanged.

Contents:
- String-manipulation functions: tolower(string), toupper(string) and others (sub, gsub, split, substr, sprintf, length, ...)

## The GNU Awk User's Guide: Changing the Contents of a Field
URL: https://www.gnu.org/software/gawk/manual/html_node/Changing-Fields.html
Version: Edition 5.4 of GAWK: Effective AWK Programming
> When the value of a field is changed (as perceived by awk), the text of the input record is recalculated to contain the new field where the old one was. In other words, $0 changes to reflect the altered field.

> Finally, there are times when it is convenient to force awk to rebuild the entire record, using the current values of the fields and OFS.

> $1 = $1 # force record to be reconstituted

Contents:
- Changing a field (for example $2 = $2 - 10) recalculates $0 from the fields
- Creating a new field changes the internal copy of the record; out-of-range references do not change $0 or NF

## uniq(1) - coreutils manual page (Debian manpages mirror)
URL: https://manpages.debian.org/unstable/coreutils/uniq.1.en.html
Version: coreutils 9.10-1 (Debian unstable)
> prefix lines by the number of occurrences

Contents:
- NAME, SYNOPSIS, DESCRIPTION: filter adjacent matching lines
- Options including -c/--count, -d/--repeated

## Comparing and Merging Files (GNU diffutils manual)
URL: https://www.gnu.org/software/diffutils/manual/diffutils.html
Version: GNU diffutils manual (single-page HTML, as served 2026-10-11)
The "Invoking diff" node states the exit status in the same words as the other tools of the package; the text below is the sentence under that node's option list.
> An exit status of 0 means no differences were found, 1 means some differences were found, and 2 means trouble.

Contents:
- Invoking diff: options and exit status
- Invoking cmp, sdiff, diff3: each with an exit status paragraph

## cron(8) - cron manual page (Debian manpages mirror)
URL: https://manpages.debian.org/unstable/cron/cron.8.en.html
Version: cron 3.0pl1-211 (Debian unstable)
> Special considerations exist when the clock is changed by less than 3 hours, for example at the beginning and end of daylight savings time.

> If the time has moved forwards, those jobs which would have run in the time that was skipped will be run soon after the change.

> Conversely, if the time has moved backwards by less than 3 hours, those jobs that fall into the repeated time will not be re-run.

> Only jobs that run at a particular time (not specified as @hourly, nor with '*' in the hour or minute specifier) are affected.

> Clock changes of more than 3 hours are considered to be corrections to the clock, and the new time is used immediately.

> cron will only handle tasks in a single timezone.

This is the Debian cron (Vixie-derived), not cronie. cron(8) does not state anything about a job that is still running when its next run is due (overlapping runs): not stated.

Contents:
- DESCRIPTION: how cron wakes each minute and runs due commands
- Daylight saving time and other clock changes (less than 3 hours, more than 3 hours)
- Time zone: single timezone via /etc/localtime
- Logging to syslog

## flock(1) - util-linux manual page (Debian manpages mirror)
URL: https://manpages.debian.org/unstable/util-linux/flock.1.en.html
Version: util-linux 2.42.4-1 (Debian unstable)
> Fail rather than wait if the lock cannot be immediately acquired.

Contents:
- NAME, SYNOPSIS, DESCRIPTION: manage locks from shell scripts
- Options: -n/--nb/--nonblock (fail rather than wait), -E (exit status on failure), -w (timeout), others

## OpenBSD ssh_config(5)
URL: https://man.openbsd.org/ssh_config
Version: OpenBSD-current, as served 2026-10-11
> Specifies one or more jump proxies as either [user@]host[:port] or an ssh URI. Multiple proxies may be separated by comma characters and will be visited sequentially.

> Sets a timeout interval in seconds after which if no data has been received from the server, ssh(1) will send a message through the encrypted channel to request a response from the server. The default is 0, indicating that these messages will not be sent to the server.

Contents:
- ProxyJump: one or more jump proxies, comma-separated, visited in order
- ServerAliveInterval: seconds of silence before ssh sends a keep-alive request; default 0 (none sent)

## nohup(1) - coreutils manual page (Debian manpages mirror)
URL: https://manpages.debian.org/unstable/coreutils/nohup.1.en.html
Version: coreutils 9.10-1 (Debian unstable)
> Run COMMAND, ignoring hangup signals.

Contents:
- NAME: run a command immune to hangups, with output to a non-tty
- SYNOPSIS, DESCRIPTION

## setsid(1) - util-linux manual page (Debian manpages mirror)
URL: https://manpages.debian.org/unstable/util-linux/setsid.1.en.html
Version: util-linux 2.42.4-1 (Debian unstable)
> setsid runs a program in a new session.

setsid(1) does not mention SIGHUP: not stated.

Contents:
- NAME, SYNOPSIS
- DESCRIPTION: runs a program in a new session; forks if already a process group leader (see --fork)
- OPTIONS

## proc_pid_syscall(5) - Linux manual page (Debian manpages mirror)
URL: https://manpages.debian.org/unstable/manpages/proc_pid_syscall.5.en.html
Version: Linux man-pages 6.19 (manpages 6.19-3, Debian unstable)
> This file exposes the system call number and argument registers for the system call currently being executed by the process, followed by the values of the stack pointer and program counter registers.

> If the process is blocked, but not in a system call, then the file displays -1 in place of the system call number

Contents:
- DESCRIPTION of /proc/pid/syscall (since Linux 2.6.27): system call number, six argument registers, stack pointer, program counter
- SEE ALSO

## git-bisect (Git documentation)
URL: https://git-scm.com/docs/git-bisect
Version: git-bisect last updated in 2.56.0
> 125 was chosen as the highest sensible value to use for this purpose, because 126 and 127 are used by POSIX shells to signal specific error status

> exit with code 0 if the current source code is good/old, and exit with a code between 1 and 127 (inclusive), except 125, if the current source code is bad/new.

Contents:
- git bisect run: exit codes 0 (good), 1 to 127 except 125 (bad), 125 (cannot be tested, skip), others abort

## _exit(2) - Linux manual page (Debian manpages mirror)
URL: https://manpages.debian.org/unstable/manpages-dev/_exit.2.en.html
Version: Linux man-pages 6.18 (manpages-dev 6.18-1 as served by Debian unstable; page dated 2026-02-08)
> Any children of the process are inherited by init(1) (or by the nearest "subreaper" process as defined through the use of the prctl(2) PR_SET_CHILD_SUBREAPER operation).

Contents:
- NAME, LIBRARY, SYNOPSIS
- DESCRIPTION: _exit terminates the process; open fds closed; children inherited by init or the nearest subreaper; parent sent SIGCHLD; status & 0xff
- RETURN VALUE, STANDARDS, HISTORY, NOTES, SEE ALSO

## Yama (The Linux Kernel documentation)
URL: https://docs.kernel.org/admin-guide/LSM/Yama.html
Version: docs.kernel.org, as served 2026-10-11
> 1 - restricted ptrace: a process must have a predefined relationship with the inferior it wants to call PTRACE_ATTACH on. By default, this relationship is that of only its descendants when the above classic criteria is also met.

> 2 - admin-only attach: only processes with CAP_SYS_PTRACE may use ptrace, either with PTRACE_ATTACH or through children calling PTRACE_TRACEME.

> If a process wishes to entirely disable these ptrace restrictions, it can call prctl(PR_SET_PTRACER, PR_SET_PTRACER_ANY, ...)

Contents:
- Yama LSM; ptrace_scope sysctl in /proc/sys/kernel/yama
- Levels 0 (classic), 1 (restricted: descendants only, or a declared ptracer), 2 (admin-only), 3 (no attach)

## git builtin/bisect.c (Git source, v2.56.0)
URL: https://raw.githubusercontent.com/git/git/v2.56.0/builtin/bisect.c
Version: Git v2.56.0 tag
> Exit code 126 and 127 can either come from the shell

> if it was unable to execute or even find the script,

> or from the script itself. Check with a known-good

> missing or non-executable script.

Note: the comment's lines are quoted one by one because each source line starts with " * "; read together they say: "Exit code 126 and 127 can either come from the shell if it was unable to execute or even find the script, or from the script itself. Check with a known-good revision to avoid trashing the bisect run due to a missing or non-executable script." The check runs only when `is_first_run`.

> if (is_first_run && (res == 126 || res == 127)) {

Contents:
- bisect_run: runs the command per revision; on the first run only, a 126 or 127 is re-checked on a good revision; 125 skip, 0 good, 1-127 bad, anything else aborts

## top(1) - procps manual page (Debian manpages mirror)
URL: https://manpages.debian.org/unstable/procps/top.1.en.html
Version: procps 2:4.0.7-1 (Debian unstable)

> In a true SMP environment, if a process is multi-threaded and top is not operating in Threads mode, amounts greater than 100% may be reported.

> top will operate in Solaris mode where a task's cpu usage will be divided by the total number of CPUs.

> wa : time waiting for I/O completion

> The total amount of virtual memory used by the task. It includes all code, data and shared libraries plus pages that have been swapped out and pages that have been mapped but not used.

Contents:
- 1. COMMAND-LINE Options (-b batch mode, -n iterations)
- 2. SUMMARY Display (uptime and load averages, task and CPU states such as wa, memory usage)
- 3. FIELDS / Columns (descriptions of fields such as %CPU, VIRT, RES; managing fields)
- 4. INTERACTIVE Commands (global, summary area, task area, bottom window, colour mapping; I Irix/Solaris mode, H Threads mode)
- 5. ALTERNATE-DISPLAY Provisions (windows, scrolling, searching, filtering)
- 6. FILES (personal and system configuration files, inspect entries, restrictions file)
- 7. ENVIRONMENT VARIABLE(S)
- 8. STUPID TRICKS Sampler
- 9. BUGS
- 10. SEE Also

## pipe(7) - Linux manual page (Debian manpages mirror)
URL: https://manpages.debian.org/unstable/manpages/pipe.7.en.html
Version: Linux man-pages 6.19 (manpages 6.19-3, Debian unstable)

> POSIX.1 says that writes of less than PIPE_BUF bytes must be atomic: the output data is written to the pipe as a contiguous sequence.

> Writes of more than PIPE_BUF bytes may be nonatomic: the kernel may interleave the data with data written by other processes.

> (On Linux, PIPE_BUF is 4096 bytes.)

Notes: the page says "less than PIPE_BUF bytes" in the first sentence and its table covers n <= PIPE_BUF; the Deep dive says "up to" and leaves the edge to the table.

Contents:
- NAME, DESCRIPTION (pipe capacity, closing, SIGPIPE), I/O on pipes and FIFOs (atomicity, blocking), PIPE_BUF, capacity, F_GETPIPE_SZ

## rename(2) - Linux manual page (Debian manpages mirror)
URL: https://manpages.debian.org/unstable/manpages-dev/rename.2.en.html
Version: Linux man-pages 6.19 (manpages-dev 6.19-3, Debian unstable)

> If newpath already exists, it will be atomically replaced, so that there is no point at which another process attempting to access newpath will find it missing.

> oldpath and newpath are not on the same mounted filesystem.

Notes: the second quote is the text under the EXDEV error.

Contents:
- DESCRIPTION (atomic replace of newpath, RENAME_NOREPLACE, RENAME_EXCHANGE, RENAME_WHITEOUT)
- ERRORS (EXDEV: not on the same mounted filesystem)

## mv invocation (GNU Coreutils manual)
URL: https://www.gnu.org/software/coreutils/manual/html_node/mv-invocation.html
Version: GNU Coreutils 9.12

> To move a file, mv ordinarily simply renames it. However, if renaming does not work because the destination's file system differs, mv falls back on copying as if by cp -a, then (assuming the copy succeeded) it removes the original.

Contents:
- mv renames; across file systems it falls back on copy and remove

## proc_pid_fdinfo(5) - Linux manual page (Debian manpages mirror)
URL: https://manpages.debian.org/unstable/manpages/proc_pid_fdinfo.5.en.html
Version: Linux man-pages 6.19 (manpages 6.19-3, Debian unstable)

> This is a decimal number showing the file offset.

Notes: the field is `pos`, in the per-descriptor file under /proc/<pid>/fdinfo/.

Contents:
- DESCRIPTION (pos, flags, mnt_id, ino; per-type fields)

## proc_pid_io(5) - Linux manual page (Debian manpages mirror)
URL: https://manpages.debian.org/unstable/manpages/proc_pid_io.5.en.html
Version: Linux man-pages 6.19 (manpages 6.19-3, Debian unstable)

> This file contains I/O statistics for the process and its waited-for children

> The number of bytes really fetched from the storage layer.

> The number of bytes really sent to the storage layer.

Contents:
- DESCRIPTION (rchar, wchar, syscr, syscw, read_bytes, write_bytes, cancelled_write_bytes)
- CAVEATS

## proc_pid_environ(5) - Linux manual page (Debian manpages mirror)
URL: https://manpages.debian.org/unstable/manpages/proc_pid_environ.5.en.html
Version: Linux man-pages 6.19 (manpages 6.19-3, Debian unstable)

> This file contains the initial environment that was set when the currently executing program was started via execve(2).

Contents:
- DESCRIPTION (initial environment at execve, NUL-separated)

## timeout(1) - coreutils manual page (Debian manpages mirror)
URL: https://manpages.debian.org/unstable/coreutils/timeout.1.en.html
Version: coreutils manual page, Debian unstable

> if COMMAND times out, and --preserve-status is not specified

> if COMMAND (or timeout itself) is sent the KILL (9) signal (128+9)

Notes: the page lists 124 (timed out), 125 (timeout itself fails) and 137 (KILL) in its exit-status list; the quotes are the descriptions of 124 and 137.

Contents:
- DESCRIPTION (--kill-after, --signal, --preserve-status)
- EXIT STATUS (124, 125, 126, 127, 137)

## pid_namespaces(7) - Linux manual page (Debian manpages mirror)
URL: https://manpages.debian.org/unstable/manpages/pid_namespaces.7.en.html
Version: Linux man-pages 6.19 (manpages 6.19-3, Debian unstable)

> A /proc filesystem shows (in the /proc/pid directories) only processes visible in the PID namespace of the process that performed the mount

Notes: this is about /proc/<pid> entries; the page does not say that /proc/loadavg is per container, and the Deep dive makes no such claim.

Contents:
- DESCRIPTION (PID numbering per namespace)
- /proc and PID namespaces

## Termination in Handler - The GNU C Library manual
URL: https://sourceware.org/glibc/manual/latest/html_node/Termination-in-Handler.html
Version: GNU C Library manual, "latest" at the time of reading (11 October 2026 review: node 25.4.2, "Handlers That Terminate the Process")

> The cleanest way for a handler to terminate the process is to raise the same signal that ran the handler in the first place.

> We could just call exit or abort, but reraising the signal sets the return status from the process correctly.

Notes: this is C-library guidance; the Deep dive applies it to a Python handler and executes both ways (`os.kill` on itself after `SIG_DFL`, and `sys.exit(143)`), which the shell reads as 143.

Contents:
- Handlers That Terminate the Process (the example handler: clean up, restore the default action with `signal (sig, SIG_DFL)`, `raise (sig)`)

## signal - Set handlers for asynchronous events (Python 3.15 documentation)
URL: https://docs.python.org/3/library/signal.html
Version: Python 3.15.0 documentation (the page the URL served on 12 October 2026)

> the low-level signal handler sets a flag which tells the virtual machine to execute the corresponding Python signal handler at a later point (for example, at the next bytecode instruction).

> A long-running calculation implemented purely in C (such as regular expression matching on a large body of text) may run uninterrupted for an arbitrary amount of time, regardless of any signals received.

> Python signal handlers are always executed in the main Python thread of the main interpreter, even if the signal was received in another thread.

Contents:
- Execution of Python signal handlers (flag, next bytecode, long-running C calculations)
- Signals and threads (handlers run in the main thread)

## dash changelog - Debian unstable
URL: https://metadata.ftp-master.debian.org/changelogs/main/d/dash/unstable_changelog
Version: Debian changelog of the dash source package, read 12 October 2026 (entry dash (0.5.12-7), dated Fri, 17 May 2024)

> dash (0.5.12-7) unstable; urgency=medium

> Implement pipefail option (Closes: #1071238)

Notes: the second line is a bullet under "Upstream patch:" in the 0.5.12-7 entry, whose trailer reads "Fri, 17 May 2024". The runner's own dash is Ubuntu's 0.5.12-6ubuntu5 (`dpkg -l dash`), the version before that entry; Ubuntu's changelog was not fetched, so nothing is claimed about later Ubuntu builds.

Contents:
- Changelog entries from 0.5.12-6 to 0.5.12-12 (only 0.5.12-7 is used)

## dash(1) - Debian manpages (unstable)
URL: https://manpages.debian.org/unstable/dash/dash.1.en.html
Version: dash(1) in Debian unstable, read 12 October 2026

> If the pipefail option was enabled when the shell began execution of the pipeline, the pipeline's exit status is the exit status of the last command specified in the pipeline that exited with non-zero status, or zero if all commands in the pipeline exited with a status of zero.

Contents:
- Pipelines (the pipefail sentence)

## systemd.timer(5) - Debian manpages (unstable)
URL: https://manpages.debian.org/unstable/systemd/systemd.timer.5.en.html
Version: systemd.timer(5) in Debian unstable, read 12 October 2026

> If true, the time when the service unit was last triggered is stored on disk. When the timer is activated, the service unit is triggered immediately if it would have been triggered at least once during the time when the timer was inactive.

> This is useful to catch up on missed runs of the service when the system was powered down. Note that this setting only has an effect on timers configured with OnCalendar=.

Contents:
- Options: Persistent= (and OnCalendar=)

## ss(8) - Debian manpages (unstable)
URL: https://manpages.debian.org/unstable/iproute2/ss.8.en.html
Version: ss(8) in iproute2, Debian unstable, read 12 October 2026

> -p, --processes Show processes using sockets.

Notes: `ss` is not installed in the sandbox, so `ss -tnp` is named from this page and not run; the inode match against `/proc/net/tcp` is what `examples.sh` executes.

Contents:
- OPTIONS: -p, --processes

## authfile.c - OpenSSH portable (master)
URL: https://raw.githubusercontent.com/openssh/openssh-portable/master/authfile.c
Version: openssh-portable master, read 12 October 2026; function sshkey_perm_ok

> error("@ WARNING: UNPROTECTED PRIVATE KEY FILE! @");

> error("Permissions 0%3.3o for '%s' are too open.",

> error("This private key will be ignored.");

Contents:
- sshkey_perm_ok: refuses a private key whose mode has group or other bits (`st_mode & 077`)
