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
          Bisect trusted an exit code. Here is where exit codes come from: processes, their signals, and the pipes between them. Five minutes; all familiar?
          Swipe on to the delivery workflow.
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
      title: 'Where did the error go?',
      body: (
        <>
          The shell applies redirections left to right, and <code>2&gt;&amp;1</code> means "make 2 a copy of whatever 1 points at right now". The job prints one
          error line to stderr: where does it land?
        </>
      ),
      duration: 1.4,
      predict: {
        options: [{ label: 'In out.log' }, { label: 'On the terminal', correct: true }, { label: 'In both' }, { label: 'Nowhere; it is discarded' }],
        explain: (
          <>
            On the terminal. <code>2&gt;&amp;1</code> copies where 1 points <em>at that moment</em>, the terminal; only then does <code>&gt; out.log</code> move
            1 to the file. So <code>out.log</code> stays empty: 0 lines. Write <code>&gt; out.log 2&gt;&amp;1</code> and both lines land in the file.
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
      duration: 1.8,
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
          bit), and 127, not found. Above 128, Bash reports 128 plus the signal that killed the program, so 137 means a kill and 143 a terminate, by convention: a program could exit with 137 itself, which is why Python reports a signal death as −9 instead. That is why
          bisect reserved 125 for "skip" and distrusts a first-run 126 or 127.
        </>
      ),
      duration: 4.2,
      Visual: S.ExitCodes,
    },
    {
      title: 'TERM asks; KILL does not',
      body: (
        <>
          A signal is a one-number message. Here it goes to <code>load_orders.py</code>, the nightly load job. SIGTERM (15) is the polite stop: a program can catch
          it, flush and close. SIGKILL (9) can't be caught, blocked or ignored: the kernel ends the process where it stands, so whatever sat in its own buffers
          is lost. SIGINT (2) is Ctrl-C; SIGHUP (1) means your terminal went away, which is how an ssh session's job dies with it (<code>nohup</code> ignores
          it). A child that has ended but not been waited for is a zombie; one whose parent died is adopted by init (or a subreaper). So: TERM first, wait,
          then KILL.
        </>
      ),
      duration: 4.2,
      Visual: S.Signals,
    },
    {
      title: 'A load job hangs: what is it doing?',
      body: (
        <>
          The nightly load has sat for an hour, not finished, not failed. <code>/proc/&lt;pid&gt;/status</code> says <code>S</code> and{' '}
          <code>Threads: 2</code>: two threads sharing the process's memory (<code>ps -L</code> lists them), and <code>ps</code> reads <code>Sl</code>. The state
          letters: R runs, S waits for an event, D waits for I/O and ignores even kill until it returns, Z is dead. <code>strace -p</code> shows{' '}
          <code>read(4,</code> and nothing more. What is it doing?
        </>
      ),
      duration: 1.6,
      predict: {
        options: [{ label: 'Spinning in a loop' }, { label: 'Waiting in read() on fd 4, a socket nobody writes to', correct: true }, { label: 'Waiting for the disk' }, { label: "It's a zombie" }],
        explain: (
          <>
            Waiting in <code>read()</code> on fd 4, a socket. <code>S</code> is an interruptible sleep: it wakes the moment data arrives, or a signal. Spinning
            would show <code>R</code> and a busy CPU; a disk wait shows <code>D</code>; a zombie shows <code>Z</code> and has no open files. So{' '}
            <code>kill -TERM</code>, give it a moment, then <code>kill -KILL</code>. This job has no TERM handler, so the shell sees 143; step 6's job caught
            it and returned 0.
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
          badly spelt events make 7 groups instead of 4. <code>grep -c</code> counts strings, not values: 1,495 where there are 1,500 refunded or cancelled;{' '}
          <code>sed</code> is for log lines, not JSON. This is the lab's pipeline half; the Deep dive has the script and the breakages.
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
          environment (nothing from your shell's <code>PATH</code>), runs in one timezone, and has no guard against a run that is still going: take a lock. To
          reach a database behind a bastion, <code>ssh -N -L</code> forwards a local port through it; <code>-J</code> hops through a bastion to a host behind
          it.
        </>
      ),
      duration: 3.4,
      Visual: S.CronSsh,
    },
    {
      title: 'In one breath',
      body: <>Eight things to keep. If any felt rusty, the Prerequisites panel has the best places to brush up; otherwise, on to how a change gets from your branch to production.</>,
      duration: 1.8,
      Visual: S.Recap,
    },
  ],
};

export default reel;
