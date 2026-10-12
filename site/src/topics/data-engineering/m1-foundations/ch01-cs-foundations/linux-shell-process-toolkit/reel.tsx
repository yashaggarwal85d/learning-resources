import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// A refresher: the Linux shell and processes a data engineer needs to read an exit code, diagnose a hung job and chain
// small tools. Every example is run by examples.sh (real bash, jq, awk, sed, grep, ps and strace) and re-asserted by examples.py.
const reel: Reel = {
  steps: [
    {
      title: 'The shell, in five minutes',
      body: (
        <>
          Five minutes on processes, signals and pipes; all familiar? Swipe on to the delivery workflow.
        </>
      ),
      duration: 2,
      Visual: S.Opening,
    },
    {
      title: 'fork, then exec, then wait',
      body: (
        <>
          Every program you run is three steps. The shell <code>fork</code>s a copy of itself, the copy <code>exec</code>s the program, which replaces it in place, and
          the shell <code>wait</code>s for it to end. What comes back is one number, the exit status, which <code>$?</code> shows and bisect read. The child
          starts with the same three open files: 0 standard input, 1 standard output, 2 standard error.
        </>
      ),
      duration: 3.6,
      Visual: S.ForkExecWait,
    },
    {
      title: 'Can the loader read the file?',
      body: (
        <>
          Nine permission bits: read, write and execute for the owner, the group and everyone else. A new file starts at 666 and <code>umask</code> switches bits
          off. The nightly job writes <code>orders.csv</code> under <code>umask 077</code>; the loader, another user in the same group, opens it. Can it read it?
        </>
      ),
      duration: 2.8,
      predict: {
        options: [{ label: 'Yes, the group can read it' }, { label: 'No, the mode is rw-------', correct: true }, { label: 'Yes, anyone can read a new file' }, { label: 'Only if it is executable' }],
        explain: (
          <>
            No. <code>077</code> switches off every group and other bit, so 666 becomes 600: <code>rw-------</code>, owner only. <code>umask 027</code> gives 640,
            and the group can read. On a directory, x means enter: with r alone you can list the names but not open a file in it. A setgid directory gives new files
            its group.
          </>
        ),
      },
      Visual: S.Permissions,
    },
    {
      title: 'Where did the error go?',
      body: (
        <>
          The shell applies redirections left to right, and <code>2&gt;&amp;1</code> means "make 2 a copy of whatever 1 points at right now". The job prints one
          error line to stderr: where does it land?
        </>
      ),
      duration: 2,
      predict: {
        options: [{ label: 'In out.log' }, { label: 'On the terminal', correct: true }, { label: 'In both' }, { label: 'Nowhere; it is discarded' }],
        explain: (
          <>
            On the terminal. <code>2&gt;&amp;1</code> copies where 1 points <em>at that moment</em>, the terminal; only then does <code>&gt; out.log</code> move
            1 to the file. So <code>out.log</code> stays empty: 0 lines. Write <code>&gt; out.log 2&gt;&amp;1</code> and the error lands in the file too.
          </>
        ),
      },
      Visual: S.WhereDidItGo,
    },
    {
      title: 'A pipeline exits with its last command',
      body: (
        <>
          Pipes join one command's output to the next one's input. The pipeline's exit status is the last command's. <code>jq</code> can't open the file;{' '}
          <code>sort</code> and <code>uniq -c</code> are happy with nothing. What does the shell report?
        </>
      ),
      duration: 2.4,
      predict: {
        options: [{ label: '2' }, { label: '0', correct: true }, { label: '1' }, { label: '127' }],
        explain: (
          <>
            0. A pipeline's status is its last command's, and <code>uniq -c</code> succeeded. <code>set -o pipefail</code> makes it the rightmost non-zero
            status: 2. With <code>set -euo pipefail</code> at the top of the nightly script, <code>nightly.sh</code>, it stops right there instead of loading nothing.
          </>
        ),
      },
      Visual: S.PipelineStatus,
    },
    {
      title: 'Exit codes: 0 to 255, and 128 plus the signal',
      body: (
        <>
          An exit status is one byte, 0 to 255. 0 is success; 1 to 125 mean whatever the program says. The shell adds two: 126, found but not executable (no x
          bit), and 127, not found. Above 128, Bash reports 128 plus the signal that killed the program, so 137 means a kill and 143 a terminate, by convention: a program could exit 137 itself. Python's <code>subprocess</code>, which reads the wait
          status directly, reports a kill as −9. That is why bisect reserved 125 for "skip" and re-checks a first-run 126 or 127.
        </>
      ),
      duration: 4.4,
      Visual: S.ExitCodes,
    },
    {
      title: 'TERM asks; KILL does not',
      body: (
        <>
          A signal is a one-number message, here sent to <code>load_orders.py</code>, the nightly load. SIGTERM (15) is the polite stop: the job catches it,
          flushes, closes and re-raises it, so the shell sees 143. SIGKILL (9) can't be caught or ignored: the kernel ends it where it stands, whatever sat in
          its own buffers is lost, and the shell sees 137. INT (2) is Ctrl-C, HUP (1) a lost terminal; both are catchable. A child nobody waited for is a
          zombie; when its parent dies, init (or a subreaper) adopts it. TERM first, wait, then KILL.
        </>
      ),
      duration: 4.2,
      Visual: S.Signals,
    },
    {
      title: 'A load job hangs: what is it doing?',
      body: (
        <>
          The nightly load has sat for an hour. <code>/proc/&lt;pid&gt;/status</code>, the kernel's live file about the process, says <code>S</code> and{' '}
          <code>Threads: 2</code> (two threads, one memory; <code>ps -L</code>). <code>strace -p</code>, which prints each system call the process makes, shows{' '}
          <code>read(4,</code> and nothing more. What is it doing?
        </>
      ),
      duration: 3.4,
      predict: {
        options: [{ label: 'Spinning in a loop' }, { label: 'Waiting in read() on file descriptor 4, a socket nobody writes to', correct: true }, { label: 'Waiting for the disk' }, { label: "It's a zombie" }],
        explain: (
          <>
            Waiting in <code>read()</code> on fd 4, a socket. <code>S</code> is an interruptible sleep: it wakes the moment data arrives, or a signal. The
            state letters: R runs (spinning shows a busy CPU), S waits for an event, D waits for I/O and usually ignores even kill until it returns, Z is dead and has no open files. So{' '}
            <code>kill -TERM</code>, give it a moment, then <code>kill -KILL</code>. Either way the shell sees 143; the job a moment ago flushed first, this one
            has no TERM handler.
          </>
        ),
      },
      Visual: S.HungJob,
    },
    {
      title: 'One pipeline, one script, same answer',
      body: (
        <>
          <code>jq -r .status</code> pulls one field per line; <code>{"awk '{ $1 = $1; print tolower($0) }'"}</code> trims and lowercases;{' '}
          <code>sort | uniq -c</code> counts. <code>diff</code> against <code>clean.py</code>'s output prints nothing and exits 0. Skip the awk step and 40
          events with stray capitals or blanks make 7 groups instead of 4. A <code>grep</code> for <code>"refunded"</code> misses <code>" refunded"</code>: 1,495,
          not 1,500. Count values after parsing, not strings. The Deep dive has the script and the breakages.
        </>
      ),
      duration: 3.8,
      Visual: S.PipelineLab,
    },
    {
      title: 'cron starts it; ssh gets you in',
      body: (
        <>
          Five fields, minute to weekday, then the command: this runs at 02:15 every day, appending both streams to a log. cron gives the job a tiny
          environment (nothing from your shell's <code>PATH</code>), runs in one timezone, and has no guard against a run that is still going: take a lock. 02:15 is skipped or doubled on DST nights unless cron
          runs in UTC. To
          reach a database behind a bastion, <code>ssh -N -L</code> forwards a local port through it; <code>-J</code> hops through a bastion to a host behind
          it.
        </>
      ),
      duration: 3.4,
      Visual: S.CronSsh,
    },
    {
      title: 'In one breath',
      body: <>Nine things to keep. If any felt rusty, the Prerequisites panel has the best places to brush up; otherwise, on to how a change gets from your branch to production.</>,
      duration: 1.8,
      Visual: S.Recap,
    },
  ],
};

export default reel;
