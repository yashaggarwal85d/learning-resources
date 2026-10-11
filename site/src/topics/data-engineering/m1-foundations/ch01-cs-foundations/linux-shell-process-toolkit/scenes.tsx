import type { ReactNode } from 'react';
import type { StepCtx } from '../../../../../reels/types';
import { Code } from '../../../../../reels/Code';
import { clamp, easeInOut, easeOut, easeOutBack, lerp, seg } from '../../../../../reels/anim';
import { C, Stack, Svg, T } from '../../../../../reels/kit';
import { RefresherList } from '../refreshers';

// Every number shown here comes from examples.sh and is asserted in examples.py.
// One grammar across the reel, a process tree: a process is a rounded box with sockets 0, 1, 2 (standard input, output, error);
// a pipe is a taupe tube; a file is a tab; what moves (data, a signal, the token to look at) is caramel; an exit status is a round token
// that rides up to the parent; a bad outcome is cherry. Colour keeps one meaning: crema = a process or value as it is, caramel = what moves,
// cherry = a bad outcome, taupe = plumbing and waiting. At most two accents in a step.
// Predict steps: the player does not restart the clock when the learner answers, so the answer frame is the finished picture
// (a pure function of `answer`); only the question frame animates.

/** A process: a rounded box with its command in crema and its role in latte. */
function Proc({ x, y, w, h = 50, label, sub, o = 1, dashed = false, stroke = C.crema, ls = 15 }: { x: number; y: number; w: number; h?: number; label: ReactNode; sub?: string; o?: number; dashed?: boolean; stroke?: string; ls?: number }) {
  return (
    <g opacity={o}>
      <rect x={x} y={y} width={w} height={h} rx={12} fill={C.espresso} stroke={stroke} strokeWidth={2} strokeDasharray={dashed ? '6 5' : undefined} />
      <T x={x + w / 2} y={sub ? y + 21 : y + h / 2 + 5} s={ls} a="middle" f={C.crema}>{label}</T>
      {sub && <T x={x + w / 2} y={y + 40} s={13} a="middle" f={C.latte}>{sub}</T>}
    </g>
  );
}
/** A numbered socket on a process's edge (0 standard input, 1 standard output, 2 standard error). */
const Sock = ({ x, y, n, o = 1, c = C.taupe }: { x: number; y: number; n: string; o?: number; c?: string }) => (
  <g opacity={o}>
    <circle cx={x} cy={y} r={11} fill={C.espresso} stroke={c} strokeWidth={2} />
    <T x={x} y={y + 5} s={13} a="middle" f={C.latte}>{n}</T>
  </g>
);
/** An exit-status token: a round token with its number. */
const Tok = ({ x, y, n, c = C.crema, r = 17, o = 1, bad = false }: { x: number; y: number; n: string; c?: string; r?: number; o?: number; bad?: boolean }) => (
  <g opacity={o}>
    <circle cx={x} cy={y} r={r} fill={bad ? C.cherry : C.espresso} stroke={bad ? C.cherryText : c} strokeWidth={3} />
    <T x={x} y={y + 6} s={17} a="middle" f={bad ? C.crema : c} w={700}>{n}</T>
  </g>
);
const Line = ({ x1, y1, x2, y2, c = C.mocha, o = 1, w = 3, dash }: { x1: number; y1: number; x2: number; y2: number; c?: string; o?: number; w?: number; dash?: string }) => (
  <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={c} strokeWidth={w} strokeLinecap="round" opacity={o} strokeDasharray={dash} />
);
/** A file tab. */
const Tab = ({ x, y, w, h = 44, label, sub, o = 1, c = C.latte }: { x: number; y: number; w: number; h?: number; label: string; sub?: string; o?: number; c?: string }) => (
  <g opacity={o}>
    <rect x={x} y={y} width={w} height={h} rx={6} fill={C.roast} stroke={c} strokeWidth={2} />
    <T x={x + w / 2} y={sub ? y + 19 : y + h / 2 + 5} s={15} a="middle" f={C.crema}>{label}</T>
    {sub && <T x={x + w / 2} y={y + 37} s={13} a="middle" f={C.latte}>{sub}</T>}
  </g>
);
/** A signal: a caramel bolt. */
const Bolt = ({ x, y, o = 1, s = 1 }: { x: number; y: number; o?: number; s?: number }) => (
  <g opacity={o} transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M10 0 L0 24 L9 24 L3 46 L22 17 L12 17 L18 0 Z" fill={C.caramel} />
  </g>
);
const pop = (t: number, at: number) => clamp(easeOutBack(seg(t, at, at + 0.4)));
const fade = (t: number, at: number, len = 0.4) => clamp(easeOut(seg(t, at, at + len)));

// 1 · Where we are: the five refreshers that open the chapter.
export const Opening = (c: StepCtx) => <RefresherList {...c} current={2} />;

// 2 · fork, then exec, then wait: the shell, its child, and the status that rides back.
export function ForkExecWait({ t }: StepCtx) {
  const child = pop(t, 0.7);
  const swap = easeInOut(seg(t, 1.3, 1.7)); // the child's label turns from "bash" into the program
  const run = fade(t, 1.9);
  const ride = easeInOut(seg(t, 2.4, 3.0));
  const status = fade(t, 3.1);
  const lit = (at: number) => (t >= at ? C.caramel : C.taupe);
  return (
    <Svg label="The shell forks a copy of itself, the copy execs python3 clean.py, and the exit status 0 rides back to the shell" h={330}>
      <g opacity={fade(t, 0.2)}>
        <Proc x={150} y={40} w={300} label="bash" sub="the shell" />
        <Sock x={150} y={65} n="0" />
        <Sock x={450} y={52} n="1" />
        <Sock x={450} y={78} n="2" />
        <T x={130} y={70} s={13} a="end" f={C.taupe}>keyboard</T>
        <T x={472} y={70} s={13} f={C.taupe}>terminal</T>
      </g>
      <Line x1={300} y1={90} x2={300} y2={200} c={C.taupe} o={child} w={2} />
      <g opacity={child} transform={`translate(0 ${(1 - child) * -16})`}>
        <rect x={150} y={200} width={300} height={50} rx={12} fill={C.espresso} stroke={C.crema} strokeWidth={2} strokeDasharray={swap < 0.5 ? '6 5' : undefined} />
        <T x={300} y={221} s={15} a="middle" f={C.taupe} o={1 - swap}>bash</T>
        <T x={300} y={221} s={15} a="middle" f={C.crema} o={swap}>python3 clean.py</T>
        <T x={300} y={240} s={13} a="middle" f={C.latte}>{swap < 0.5 ? 'a copy: fork' : 'the program: exec'}</T>
        <Sock x={150} y={225} n="0" />
        <Sock x={450} y={212} n="1" />
        <Sock x={450} y={238} n="2" />
      </g>
      <Line x1={462} y1={212} x2={462 + 28 * Math.min(1, run * 2)} y2={212} c={C.caramel} o={run} w={4} />
      <Line x1={490} y1={212} x2={490} y2={212 - 128 * clamp(run * 2 - 1)} c={C.caramel} o={run} w={4} />
      <T x={130} y={230} s={13} a="end" f={C.taupe} o={child}>keyboard</T>
      <T x={472} y={230} s={13} f={C.taupe} o={child}>terminal</T>
      <Tok x={300} y={lerp(200, 116, ride)} n="0" c={C.caramel} o={ride > 0 ? 1 : 0} />
      <T x={276} y={150} s={17} a="end" f={C.crema} o={status}>$? = 0</T>
      <T x={130} y={304} s={15} a="middle" f={lit(0.7)}>fork</T>
      <T x={300} y={304} s={15} a="middle" f={lit(1.3)}>exec</T>
      <T x={470} y={304} s={15} a="middle" f={lit(2.4)}>wait</T>
    </Svg>
  );
}

// 3 · Where did the error go? Redirections re-point sockets, left to right.
export function WhereDidItGo({ t, answer }: StepCtx) {
  const cmd = 'python3 clean.py missing.jsonl 2>&1 > out.log';
  const Frame = ({ done }: { done: boolean }) => (
    <>
      <T x={30} y={28} s={15} f={C.crema}>{cmd}</T>
      <Proc x={30} y={70} w={130} h={140} label="" />
      <T x={95} y={137} s={15} a="middle" f={C.crema}>python3</T>
      <T x={95} y={159} s={15} a="middle" f={C.crema}>clean.py</T>
      <Sock x={160} y={95} n="0" />
      <Sock x={160} y={140} n="1" />
      <Sock x={160} y={185} n="2" />
      <Tab x={400} y={70} w={136} label="out.log" sub={done ? '0 lines' : undefined} />
      <Tab x={400} y={160} w={136} label="terminal" />
    </>
  );
  if (answer === null) {
    return (
      <Svg label="A process with standard input, output and error sockets; both output sockets lead to the terminal; where does the error line go?" h={260}>
        <g opacity={fade(t, 0.2)}><T x={30} y={28} s={15} f={C.crema}>{cmd}</T></g>
        <g opacity={fade(t, 0.6)}>
          <Proc x={30} y={70} w={130} h={140} label="" />
          <T x={95} y={137} s={15} a="middle" f={C.crema}>python3</T>
          <T x={95} y={159} s={15} a="middle" f={C.crema}>clean.py</T>
          <Sock x={160} y={95} n="0" />
          <Sock x={160} y={140} n="1" />
          <Sock x={160} y={185} n="2" />
        </g>
        <g opacity={fade(t, 1.0)}>
          <Tab x={400} y={70} w={136} label="out.log" />
          <Tab x={400} y={160} w={136} label="terminal" />
          <Line x1={172} y1={140} x2={400} y2={182} c={C.taupe} w={2} />
          <Line x1={172} y1={185} x2={400} y2={188} c={C.taupe} w={2} />
        </g>
        <g transform={`translate(300 120) scale(${pop(t, 1.3)})`}><T x={0} y={0} s={28} f={C.caramel} a="middle" serif w={700}>?</T></g>
      </Svg>
    );
  }
  const Num = ({ x, y, n }: { x: number; y: number; n: string }) => (
    <g>
      <circle cx={x} cy={y} r={10} fill={C.espresso} stroke={C.caramel} strokeWidth={2} />
      <T x={x} y={y + 5} s={13} a="middle" f={C.caramel} w={700}>{n}</T>
    </g>
  );
  return (
    <Svg label="Two re-pointings in order: 1, standard error copies the terminal; 2, standard output moves to out.log; the error line stays on the terminal and out.log is empty" h={260}>
      <Frame done />
      <Line x1={172} y1={140} x2={400} y2={182} c={C.taupe} w={2} dash="5 5" />
      <Line x1={172} y1={185} x2={400} y2={188} c={C.caramel} w={4} />
      <Line x1={172} y1={140} x2={400} y2={96} c={C.caramel} w={4} />
      <Num x={286} y={187} n="1" />
      <Num x={286} y={118} n="2" />
      <T x={536} y={228} s={13} a="end" f={C.cherryText}>clean.py: cannot open missing.jsonl</T>
      <T x={30} y={252} s={13} f={C.latte}>fix: &gt; out.log 2&gt;&amp;1</T>
    </Svg>
  );
}

// 4 · A pipeline exits with its last command.
export function PipelineStatus({ t, answer }: StepCtx) {
  const xs = [30, 204, 378];
  const names = ['jq', 'sort', 'uniq -c'];
  const boxes = (appear: (i: number) => number) =>
    xs.map((x, i) => (
      <g key={x} opacity={appear(i)}>
        <rect x={x} y={104} width={150} height={44} rx={12} fill={C.espresso} stroke={i === 0 ? C.cherryText : C.crema} strokeWidth={2} />
        <T x={x + 75} y={132} s={15} a="middle" f={C.crema}>{names[i]}</T>
        {i < 2 && <Line x1={x + 150} y1={126} x2={x + 174} y2={126} c={C.taupe} w={5} />}
      </g>
    ));
  const command = (
    <>
      <T x={30} y={28} s={15} f={C.crema}>jq -r .status missing.jsonl</T>
      <T x={30} y={52} s={15} f={C.crema}>| sort | uniq -c</T>
    </>
  );
  if (answer === null) {
    const stop = fade(t, 1.5);
    return (
      <Svg label="Three commands joined by pipes: jq fails on a missing file, sort and uniq succeed; what does the shell report?" h={300}>
        <g opacity={fade(t, 0.2)}>{command}</g>
        {boxes((i) => fade(t, 0.6 + i * 0.3))}
        <g opacity={fade(t, 0.9)}><T x={30} y={176} s={13} f={C.cherryText}>cannot open missing.jsonl</T></g>
        <Line x1={180} y1={126} x2={180 + 10 * (1 - Math.abs(2 * stop - 1))} y2={126} c={C.caramel} o={stop} w={4} />
        {xs.map((x) => <circle key={x} cx={x + 75} cy={218} r={18} fill="none" stroke={C.taupe} strokeWidth={2} strokeDasharray="4 4" opacity={fade(t, 1.2)} />)}
        <g opacity={fade(t, 1.8)}>
          <T x={30} y={288} s={17} f={C.crema}>$? =</T>
          <g transform={`translate(98 288) scale(${pop(t, 1.8)})`}><T x={0} y={0} s={28} f={C.caramel} serif w={700}>?</T></g>
        </g>
      </Svg>
    );
  }
  return (
    <Svg label="jq's status is 2, sort and uniq give 0; the pipeline reports 0, the last one; with pipefail it reports 2" h={300}>
      <g>{command}</g>
      {boxes(() => 1)}
      <T x={30} y={176} s={13} f={C.cherryText}>cannot open missing.jsonl</T>
      <Tok x={105} y={218} n="2" bad />
      <Tok x={279} y={218} n="0" />
      <Tok x={453} y={218} n="0" />
      <Line x1={453} y1={239} x2={453} y2={254} c={C.taupe} w={2} />
      <T x={453} y={278} s={22} a="middle" f={C.crema} serif w={700}>$? = 0</T>
      <T x={385} y={278} s={13} a="end" f={C.latte}>the last command's</T>
      <Line x1={105} y1={239} x2={105} y2={254} c={C.cherryText} w={2} />
      <T x={105} y={274} s={17} a="middle" f={C.cherryText} w={700}>$? = 2</T>
      <T x={105} y={294} s={13} a="middle" f={C.latte}>set -o pipefail</T>
    </Svg>
  );
}

// 5 · Exit codes: 0 to 255, and 128 plus the signal. The bar is in order but not to scale (the signal band is stretched to be readable).
const BX = { zero: [30, 60], own: [68, 268], n126: [276, 304], n127: [312, 340], sig: [348, 530] } as const;
export function ExitCodes({ t }: StepCtx) {
  const code = ['$ chmod 644 clean.py; ./clean.py', '$ pyhton3 clean.py', "$ bash -c 'kill -KILL $$'", "$ bash -c 'kill -TERM $$'"];
  const draw = easeOut(seg(t, 1.0, 1.6));
  const BY = 54;
  const MY = BY + 17;
  const legend: { at: number; x: number; code: string; why: string; kind: 'ok' | 'sig' | 'kill' }[] = [
    { at: 1.6, x: 290, code: '126', why: 'found, not executable (rw-r--r--: no x)', kind: 'ok' },
    { at: 2.1, x: 326, code: '127', why: 'command not found', kind: 'ok' },
    { at: 3.1, x: 382, code: '130', why: 'killed by INT, signal 2', kind: 'sig' },
    { at: 2.6, x: 439, code: '137', why: 'killed by KILL, signal 9', kind: 'kill' },
    { at: 3.5, x: 496, code: '143', why: 'killed by TERM, signal 15', kind: 'sig' },
  ];
  const stroke = (k: string) => (k === 'ok' ? C.crema : k === 'sig' ? C.caramel : C.cherryText);
  return (
    <Stack>
      <Code t={t} start={0.2} end={1.0} lines={code} title="exit statuses" />
      <Svg fill label="Exit statuses on a number line from 0 to 255: zero is success, 1 to 125 the program's own, 126 not executable, 127 not found, above 128 a signal; bisect's 125 sits just below" h={296}>
        <g opacity={draw}>
          <rect x={BX.zero[0]} y={BY} width={BX.zero[1] - BX.zero[0]} height={34} rx={6} fill={C.crema} />
          <rect x={BX.own[0]} y={BY} width={BX.own[1] - BX.own[0]} height={34} rx={6} fill={C.mocha} />
          <rect x={BX.n126[0]} y={BY} width={BX.n126[1] - BX.n126[0]} height={34} rx={6} fill={C.espresso} stroke={C.taupe} strokeWidth={2} />
          <rect x={BX.n127[0]} y={BY} width={BX.n127[1] - BX.n127[0]} height={34} rx={6} fill={C.espresso} stroke={C.taupe} strokeWidth={2} />
          <rect x={BX.sig[0]} y={BY} width={BX.sig[1] - BX.sig[0]} height={34} rx={6} fill={C.cocoa} />
          <T x={30} y={BY - 12} s={13} f={C.crema}>0 ok</T>
          <T x={100} y={BY - 12} s={13} f={C.latte}>1–125 own codes</T>
          <T x={439} y={BY - 12} s={15} f={C.caramel} a="middle">128 + signal</T>
          <path d="M268 94 L263 104 L273 104 Z" fill={C.taupe} />
          <T x={274} y={138} s={13} a="end" f={C.latte}>125 skip</T>
        </g>
        {legend.map((l) => (
          <g key={l.code}>
            <circle cx={l.x} cy={MY} r={8} fill={l.kind === 'kill' ? C.cherry : C.espresso} stroke={stroke(l.kind)} strokeWidth={3} opacity={pop(t, l.at)} transform={`translate(0 ${(1 - pop(t, l.at)) * -6})`} />
            <T x={l.x + (l.code === '126' ? 6 : 0)} y={l.code === '127' ? 120 : 104} s={13} a="middle" f={C.latte} o={pop(t, l.at)}>{l.code}</T>
          </g>
        ))}
        {[...legend].sort((a, b) => Number(a.code) - Number(b.code)).map((l, i) => (
          <g key={l.code} opacity={fade(t, l.at)}>
            <circle cx={38} cy={172 + i * 26 - 5} r={7} fill={l.kind === 'kill' ? C.cherry : C.espresso} stroke={stroke(l.kind)} strokeWidth={3} />
            <T x={56} y={172 + i * 26} s={15} f={l.kind === 'kill' ? C.cherryText : C.crema}>{l.code}</T>
            <T x={106} y={172 + i * 26} s={13} f={C.latte}>{l.why}</T>
          </g>
        ))}
      </Svg>
    </Stack>
  );
}

// 6 · TERM asks; KILL doesn't. Two bolts on the same job, then the two leftovers.
export function Signals({ t }: StepCtx) {
  const tok0 = easeInOut(seg(t, 1.6, 2.2));
  const tok137 = easeInOut(seg(t, 2.8, 3.4));
  const crack = fade(t, 2.5);
  const L = { box: 55 };
  const R = { box: 335 };
  return (
    <Svg label="The same job receives two signals: SIGTERM is caught, the job flushes and closes and returns 0; SIGKILL cannot be caught, the job vanishes mid-write and the shell sees 137; below, a zombie and an orphan" h={360}>
      <g opacity={fade(t, 0.2)}>
        <T x={140} y={22} s={15} a="middle" f={C.caramel}>SIGTERM 15</T>
        <T x={420} y={22} s={15} a="middle" f={C.caramel}>SIGKILL 9</T>
        <Proc x={L.box} y={40} w={170} h={40} label="bash" ls={14} />
        <Proc x={R.box} y={40} w={170} h={40} label="bash" ls={14} />
        <Line x1={140} y1={80} x2={140} y2={150} c={C.taupe} w={2} />
        <Line x1={420} y1={80} x2={420} y2={150} c={C.taupe} w={2} />
        <Proc x={L.box} y={150} w={170} h={40} label="load_orders.py" ls={14} />
      </g>
      <g opacity={fade(t, 0.2) * (1 - 0.65 * crack)}><Proc x={R.box} y={150} w={170} h={40} label="load_orders.py" ls={14} stroke={crack > 0.5 ? C.cherryText : C.crema} dashed={crack > 0.5} /></g>
      <Bolt x={236} y={146} o={fade(t, 0.8, 0.2)} />
      <Bolt x={516} y={146} o={fade(t, 2.2, 0.2)} />
      <g opacity={crack}><path d="M395 150 L405 164 L396 172 L408 190" fill="none" stroke={C.cherryText} strokeWidth={3} strokeLinecap="round" /></g>
      <T x={140} y={214} s={13} a="middle" f={C.latte} o={fade(t, 1.2)}>flushed and closed</T>
      <T x={420} y={214} s={13} a="middle" f={C.cherryText} o={fade(t, 2.8)}>gone mid-write</T>
      <Tok x={140} y={lerp(150, 116, tok0)} n="0" c={C.caramel} o={tok0 > 0 ? 1 : 0} />
      <Tok x={420} y={lerp(150, 114, tok137)} n="137" r={24} bad o={tok137 > 0 ? 1 : 0} />
      <g opacity={fade(t, 3.2)}>
        <Line x1={30} y1={228} x2={570} y2={228} c={C.taupe} w={1} o={0.6} />
        <T x={30} y={246} s={13} f={C.taupe}>left behind</T>
      </g>
      <g opacity={fade(t, 3.4)}>
        <Proc x={70} y={258} w={120} h={28} label="parent" ls={13} />
        <Line x1={130} y1={286} x2={130} y2={304} c={C.taupe} w={2} />
        <rect x={70} y={304} width={120} height={28} rx={10} fill="none" stroke={C.taupe} strokeWidth={2} strokeDasharray="6 5" />
        <T x={130} y={323} s={13} a="middle" f={C.crema}>zombie</T>
        <T x={130} y={352} s={13} a="middle" f={C.latte}>not waited for</T>
      </g>
      <g opacity={fade(t, 3.8)}>
        <Proc x={380} y={258} w={120} h={28} label="init" ls={13} />
        <Line x1={440} y1={286} x2={440} y2={304} c={C.taupe} w={2} />
        <rect x={380} y={304} width={120} height={28} rx={10} fill={C.espresso} stroke={C.crema} strokeWidth={2} />
        <T x={440} y={323} s={13} a="middle" f={C.crema}>orphan</T>
        <T x={440} y={352} s={13} a="middle" f={C.latte}>parent died</T>
      </g>
    </Svg>
  );
}

// 7 · A load job hangs: what is it doing?
export function HungJob({ t, answer }: StepCtx) {
  const q = answer === null;
  const a = (at: number) => (q ? fade(t, at) : 1);
  const caret = q && Math.floor(t * 2) % 2 === 0 ? '▌' : q ? '' : '▌';
  return (
    <Svg label="A load job is blocked in read on file descriptor 4, a socket nobody writes to; ps says S, the proc status says two threads, strace shows read(4, with no result" h={292}>
      <g opacity={a(0.2)}>
        <Proc x={30} y={30} w={170} h={90} label="load_orders.py" ls={14} />
        <Sock x={115} y={120} n="4" c={C.caramel} />
      </g>
      <g opacity={a(0.6)}>
        <Line x1={115} y1={131} x2={115} y2={170} c={C.taupe} w={5} />
        <Tab x={55} y={170} w={120} h={30} label="socket" />
        <Line x1={115} y1={200} x2={115} y2={226} c={C.taupe} w={5} dash="6 6" />
      </g>
      <T x={232} y={50} s={13} f={C.crema} o={a(1.0)}>State: S (sleeping)</T>
      <T x={232} y={74} s={13} f={C.crema} o={a(1.3)}>Threads: 2 (ps -L)</T>
      <T x={232} y={98} s={13} f={C.crema} o={a(1.6)}>wchan: wait_woken</T>
      <T x={232} y={122} s={13} f={C.crema} o={a(2.0)}>fd/4 → socket</T>
      <T x={232} y={152} s={13} f={C.taupe} o={a(2.4)}>strace -p</T>
      <T x={232} y={176} s={15} f={q ? C.crema : C.caramel} o={a(2.4)}>{`read(4,${caret}`}</T>
      {q && <g transform={`translate(490 100) scale(${pop(t, 2.8)})`}><T x={0} y={0} s={28} f={C.caramel} a="middle" serif w={700}>?</T></g>}
      {!q && (
        <>
          <T x={115} y={248} s={15} a="middle" f={C.cherryText}>no sender</T>
          <T x={232} y={228} s={13} f={C.crema}>kill -TERM {'<pid>'}</T>
          <Tok x={470} y={220} n="143" r={24} c={C.crema} />
          <T x={470} y={262} s={13} a="middle" f={C.latte}>no handler here</T>
          <T x={232} y={284} s={13} f={C.crema}>kill -KILL {'<pid>'}</T>
        </>
      )}
    </Svg>
  );
}

// 8 · One pipeline, one script, same answer.
const ROWS: [string, string][] = [['cancelled', '1300'], ['paid', '6000'], ['refunded', '200'], ['shipped', '2500']];
export function PipelineLab({ t }: StepCtx) {
  const ys = [40, 112, 184, 256];
  const names = ['jq -r .status', 'awk: trim + lower', 'sort', 'uniq -c'];
  const run = easeOut(seg(t, 0.8, 2.0));
  const script = easeOut(seg(t, 2.3, 2.8));
  return (
    <Svg label="Ten thousand events flow through jq, awk, sort and uniq -c into four counts; clean.py's four counts are the same and diff prints nothing; without the awk step there are seven groups" h={360}>
      <T x={30} y={24} s={13} f={C.latte} o={fade(t, 0.2)}>10,000 lines</T>
      {ys.map((y, i) => (
        <g key={y} opacity={fade(t, 0.2 + i * 0.15)}>
          <rect x={30} y={y} width={210} height={40} rx={12} fill={C.espresso} stroke={C.crema} strokeWidth={2} />
          <T x={135} y={y + 26} s={14} a="middle" f={C.crema}>{names[i]}</T>
          {i < 3 && <Line x1={135} y1={y + 40} x2={135} y2={y + 72} c={C.taupe} w={5} />}
        </g>
      ))}
      <Line x1={240} y1={276} x2={256} y2={276} c={C.taupe} w={3} o={fade(t, 0.8)} />
      <Line x1={256} y1={276} x2={256} y2={74} c={C.taupe} w={3} o={fade(t, 0.8)} />
      <rect x={126} y={40 + run * 250} width={18} height={8} rx={3} fill={C.caramel} opacity={run > 0 && run < 1 ? 1 : 0} />
      <T x={456} y={50} s={13} a="end" f={C.taupe} o={fade(t, 0.8)}>pipe</T>
      <T x={536} y={50} s={13} a="end" f={C.taupe} o={script}>script</T>
      {ROWS.map(([status, n], i) => {
        const y = 82 + i * 32;
        const at = 1.0 + i * 0.3;
        return (
          <g key={status}>
            <T x={272} y={y} s={15} f={C.latte} o={fade(t, at)}>{status}</T>
            <T x={456} y={y} s={15} a="end" f={C.crema} o={fade(t, at)}>{n}</T>
            <T x={536} y={y} s={15} a="end" f={C.crema} o={script}>{n}</T>
          </g>
        );
      })}
      <T x={272} y={236} s={15} f={C.caramel} o={fade(t, 2.8)}>diff: 0 lines, exit 0</T>
      <T x={30} y={326} s={15} f={C.cherryText} o={fade(t, 3.3)}>without awk: 7 groups, not 4</T>
      <T x={30} y={348} s={13} f={C.latte} o={fade(t, 3.3)}>{'40 events: Paid · SHIPPED␣ · ␣refunded'}</T>
    </Svg>
  );
}

// 9 · cron starts it; ssh gets you in.
export function CronSsh({ t }: StepCtx) {
  const chips: [string, string][] = [['15', 'min'], ['2', 'hour'], ['*', 'day'], ['*', 'month'], ['*', 'weekday']];
  const tube = easeOut(seg(t, 2.4, 3.0));
  return (
    <Svg label="A crontab line with its five fields labelled and cron's small environment, above a ssh tunnel from the laptop's port 5433 through a bastion to the database's port 5432" h={320}>
      {chips.map(([v, l], i) => (
        <g key={l} opacity={fade(t, 0.2 + i * 0.1)}>
          <rect x={30 + i * 100} y={10} width={80} height={36} rx={9} fill={C.espresso} stroke={C.crema} strokeWidth={2} />
          <T x={70 + i * 100} y={36} s={20} a="middle" f={C.crema}>{v}</T>
          <T x={70 + i * 100} y={68} s={13} a="middle" f={C.latte}>{l}</T>
        </g>
      ))}
      <T x={30} y={98} s={15} f={C.caramel} o={fade(t, 0.9)}>runs at 02:15 every day</T>
      <T x={30} y={124} s={13} f={C.crema} o={fade(t, 1.3)}>/opt/etl/nightly.sh &gt;&gt; /var/log/nightly.log 2&gt;&amp;1</T>
      <T x={30} y={148} s={13} f={C.latte} o={fade(t, 1.6)}>cron's env: SHELL HOME LOGNAME, no shell PATH</T>
      <Line x1={30} y1={172} x2={536} y2={172} c={C.taupe} w={1} o={0.5 * fade(t, 1.8)} />
      <Line x1={150} y1={239} x2={150 + 266 * tube} y2={239} c={C.caramel} w={8} o={tube > 0 ? 1 : 0} />
      {([['laptop', ':5433', 30], ['bastion', 'a hop', 240], ['db', ':5432', 416]] as [string, string, number][]).map(([n, s, x], i) => (
        <g key={n} opacity={fade(t, 1.9 + i * 0.2)}>
          <rect x={x} y={214} width={120} height={50} rx={12} fill={C.espresso} stroke={C.crema} strokeWidth={2} />
          <T x={x + 60} y={235} s={13} a="middle" f={C.crema}>{n}</T>
          <T x={x + 60} y={254} s={13} a="middle" f={C.latte}>{s}</T>
        </g>
      ))}
      <T x={30} y={196} s={13} f={C.crema} o={fade(t, 2.9)}>ssh -N -L 5433:db.internal:5432 user@bastion</T>
      <T x={300} y={292} s={13} a="middle" f={C.taupe} o={fade(t, 3.0)}>key in authorized_keys</T>
    </Svg>
  );
}

// 10 · Recap in one breath.
const RECAP: [string, string][] = [
  ['fork, exec, wait', "the child's status comes back as one byte"],
  ['0 · 1 · 2', 'stdin, stdout, stderr; 2>&1 copies 1 now'],
  ['pipefail', 'status = last command, unless asked'],
  ['126, 127, 128+n', 'not executable, not found, killed by signal n'],
  ['TERM then KILL', '15 can be caught; 9 cannot'],
  ['R · S · D · Z', 'ps, /proc: which; strace -p: what call'],
  ['jq | awk | sort | uniq -c', 'diff against the script; grep, sed: logs'],
  ['cron, ssh -L', 'five fields, tiny env; a port via a hop'],
];
const MONO_ROWS = ['pipefail', 'jq | awk | sort | uniq -c', 'cron, ssh -L'];
export function Recap({ t }: StepCtx) {
  return (
    <Svg label="Recap of the eight points" h={480}>
      {RECAP.map(([k, v], i) => {
        const a = easeOut(seg(t, 0.1 + i * 0.15, 0.6 + i * 0.15));
        const y = 4 + i * 59;
        return (
          <g key={k} opacity={a} transform={`translate(${(1 - a) * 30} 0)`}>
            <rect x={30} y={y} width={506} height={53} rx={11} fill={C.roast} />
            <T x={50} y={y + 22} s={16} f={C.caramel} serif={!MONO_ROWS.includes(k)} w={700}>{k}</T>
            <T x={50} y={y + 43} s={14} f={C.crema}>{v}</T>
          </g>
        );
      })}
    </Svg>
  );
}
