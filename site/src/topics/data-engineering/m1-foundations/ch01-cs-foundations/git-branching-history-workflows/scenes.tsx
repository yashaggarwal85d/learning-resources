import type { StepCtx } from '../../../../../reels/types';
import { clamp, easeInOut, easeOut, easeOutBack, lerp, seg } from '../../../../../reels/anim';
import { Code } from '../../../../../reels/Code';
import { C, Stack, Svg, T } from '../../../../../reels/kit';
import { RefresherList } from '../refreshers';

// Every ID, count and output shown here comes from examples.sh and is asserted in examples.py.
// One grammar across the reel: crema = a commit as it was made, caramel = a commit Git created for you
// (rewritten, squashed, the one bisect found), cherry = bad or broken, taupe dashed = abandoned (only in the reflog).
// Predict steps: the player does not restart the clock when the learner answers, so the answer frame is the
// finished picture (a pure function of `answer`); only the question frame animates.

type Kind = 'made' | 'new' | 'bad' | 'ghost';
const FILL: Record<Kind, string> = { made: C.crema, new: C.caramel, bad: C.cherry, ghost: 'none' };
const TEXT: Record<Kind, string> = { made: C.crema, new: C.caramel, bad: C.cherryText, ghost: C.taupe };

/** A commit: a dot with its 7-character ID under it (IDs need about 90 units of room on a row). */
function Commit({ x, y, kind = 'made', id, r = 11, o = 1, s = 15, strike = false }: { x: number; y: number; kind?: Kind; id?: string; r?: number; o?: number; s?: number; strike?: boolean }) {
  return (
    <g opacity={o}>
      <circle cx={x} cy={y} r={r} fill={FILL[kind]} stroke={kind === 'ghost' ? C.taupe : kind === 'bad' ? C.cherryText : 'none'} strokeWidth={2} strokeDasharray={kind === 'ghost' ? '4 4' : undefined} />
      {id && (
        <>
          <T x={x} y={y + r + s + 4} s={s} a="middle" f={TEXT[kind]}>{id}</T>
          {strike && <line x1={x - 34} x2={x + 34} y1={y + r + s - 1} y2={y + r + s - 1} stroke={C.taupe} strokeWidth={2} />}
        </>
      )}
    </g>
  );
}
const Edge = ({ x1, y1, x2, y2, o = 1, c = C.mocha }: { x1: number; y1: number; x2: number; y2: number; o?: number; c?: string }) => (
  <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={c} strokeWidth={3} strokeLinecap="round" opacity={o} />
);
/** A branch-name pill. */
const Pill = ({ x, y, w, children }: { x: number; y: number; w: number; children: string }) => (
  <g>
    <rect x={x - w / 2} y={y} width={w} height={24} rx={12} fill={C.caramel} />
    <T x={x} y={y + 17} s={13} a="middle" f={C.espresso} w={700}>{children}</T>
  </g>
);

// 1 · Where we are: the five refreshers that open the chapter.
export const Opening = (c: StepCtx) => <RefresherList {...c} current={1} />;

// 2 · Merge or rebase? The same fork, integrated both ways.
export function MergeOrRebase({ t, answer }: StepCtx) {
  if (answer === null) {
    const a = easeOut(seg(t, 0.1, 0.6));
    const b = easeOut(seg(t, 0.4, 0.9));
    const q = easeOutBack(seg(t, 0.8, 1.2));
    return (
      <Svg label="A branch of three commits forks from main, which has moved on; what does rebasing it onto main do?" h={340}>
        <T x={30} y={30} s={14} f={C.taupe}>$ git rebase main  (on dedupe)</T>
        <g opacity={a}>
          <Edge x1={60} y1={98} x2={340} y2={98} />
          {[60, 200, 340].map((x) => <Commit key={x} x={x} y={98} />)}
          <Pill x={340} y={50} w={64}>main</Pill>
        </g>
        <g opacity={b}>
          <path d="M60 98 C60 180 200 150 200 220" fill="none" stroke={C.mocha} strokeWidth={3} strokeLinecap="round" />
          <Edge x1={200} y1={220} x2={400} y2={220} />
          {[['2f40780', 200], ['ebc701c', 300], ['f8b3630', 400]].map(([id, x]) => <Commit key={id} x={Number(x)} y={220} id={String(id)} />)}
          <Pill x={400} y={168} w={76}>dedupe</Pill>
        </g>
        <g transform={`translate(500 232) scale(${clamp(q)})`}>
          <T x={0} y={0} s={28} f={C.caramel} a="middle" serif w={700}>?</T>
        </g>
      </Svg>
    );
  }
  return (
    <Svg label="Merge adds one commit with two parents and keeps the originals; rebase makes three new commits in a straight line; both tips have the same tree" h={376}>
      {/* A · merge --no-ff */}
      <T x={30} y={26} s={15} f={C.latte}>merge --no-ff</T>
      <T x={410} y={52} s={15} a="middle" f={C.latte}>tree 827c45a</T>
      <Edge x1={40} y1={80} x2={410} y2={80} />
      <path d="M40 80 C40 134 90 134 130 134" fill="none" stroke={C.mocha} strokeWidth={3} strokeLinecap="round" />
      <Edge x1={130} y1={134} x2={350} y2={134} />
      <Edge x1={350} y1={134} x2={410} y2={80} />
      {[40, 130, 220].map((x) => <Commit key={x} x={x} y={80} />)}
      {[['2f40780', 130], ['ebc701c', 240], ['f8b3630', 350]].map(([id, x]) => <Commit key={id} x={Number(x)} y={134} id={String(id)} />)}
      <circle cx={410} cy={80} r={13} fill={C.espresso} stroke={C.caramel} strokeWidth={4} />
      <T x={434} y={85} s={15} f={C.crema}>2 parents</T>
      <T x={470} y={196} s={26} a="middle" f={C.crema} serif w={700}>=</T>
      {/* B · rebase */}
      <T x={30} y={214} s={15} f={C.latte}>rebase</T>
      <T x={450} y={238} s={15} a="middle" f={C.latte}>tree 827c45a</T>
      <Edge x1={36} y1={268} x2={450} y2={268} />
      {[36, 84, 132].map((x) => <Commit key={x} x={x} y={268} />)}
      {[['9f711a4', 230], ['a0a20c8', 340], ['30d3436', 450]].map(([id, x]) => <Commit key={id} x={Number(x)} y={268} kind="new" id={String(id)} />)}
      <T x={30} y={330} s={15} f={C.taupe}>old commits:</T>
      <T x={30} y={350} s={15} f={C.taupe}>in the reflog</T>
      {[['2f40780', 230], ['ebc701c', 340], ['f8b3630', 450]].map(([id, x]) => <Commit key={id} x={Number(x)} y={334} kind="ghost" id={String(id)} s={14} o={0.55} strike />)}
    </Svg>
  );
}

// 3 · Clean up before you push: the todo list is the interface.
// The todo as Git 2.56 writes it (the subject is a comment after the ID; Git 2.43 omits the '#'). examples.py asserts both.
const TODO_CMD = '$ git rebase -i --autosquash main';
const TODO_COMMITTED = ['pick  5f14405 # add email check', 'pick  3d6cce4 # wip debug print', 'pick  84e21ce # fixup! add email check', 'pick  dad1c0d # test email check'];
const TODO_PROPOSED = ['pick  5f14405 # add email check', 'fixup 84e21ce # fixup! add email check', 'pick  3d6cce4 # wip debug print', 'pick  dad1c0d # test email check'];
const TODO_DROPPED = ['pick  5f14405 # add email check', 'fixup 84e21ce # fixup! add email check', 'drop  3d6cce4 # wip debug print', 'pick  dad1c0d # test email check'];
export function Tidy({ t }: StepCtx) {
  const lines = t < 1.0 ? TODO_COMMITTED : t < 1.9 ? TODO_PROPOSED : TODO_DROPPED;
  const title = t < 1.0 ? 'as committed' : t < 1.9 ? 'the todo Git proposes' : 'after your edit';
  const hl = t < 1.0 ? [] : t < 1.9 ? [2] : [3]; // line 0 is the command
  const k = easeInOut(seg(t, 2.5, 3.2)); // 0 = four dots, 1 = two
  const ghost = easeOut(seg(t, 3.5, 4.0));
  // Dots: first (5f14405), wip (3d6cce4), fixup (84e21ce), last (dad1c0d).
  const xFirst = 95;
  const xWip = 210;
  const xFix = lerp(330, xFirst, k);
  const xLast = lerp(450, 285, k);
  return (
    <Stack>
      <Code title={title} t={t} end={0.9} lines={[TODO_CMD, ...lines]} highlight={hl} />
      <Svg fill label="Four commits become two: the fixup folds into its target and the debug commit is dropped; the old four stay in the reflog" h={210}>
        <Edge x1={xFirst} y1={46} x2={xLast} y2={46} o={0.6} />
        <Commit x={xWip} y={46} o={1 - k} id="3d6cce4" />
        <Commit x={xFix} y={46} o={1 - k} id="84e21ce" />
        <Commit x={xFirst} y={46} id={k < 0.5 ? '5f14405' : undefined} kind={k < 0.5 ? 'made' : 'new'} />
        <Commit x={xLast} y={46} id={k < 0.5 ? 'dad1c0d' : undefined} kind={k < 0.5 ? 'made' : 'new'} />
        {k >= 0.5 && (
          <g opacity={easeOut((k - 0.5) * 2)}>
            <T x={xFirst} y={80} s={15} a="middle" f={C.caramel}>bf1d3f6</T>
            <T x={xFirst} y={100} s={13} a="middle" f={C.latte}>add email check</T>
            <T x={xLast} y={80} s={15} a="middle" f={C.caramel}>81f8447</T>
            <T x={xLast} y={100} s={13} a="middle" f={C.latte}>test email check</T>
          </g>
        )}
        <T x={536} y={52} s={24} a="end" f={C.caramel} serif w={700} o={clamp((k - 0.5) * 2)}>4 → 2</T>
        <g opacity={ghost}>
          <T x={30} y={156} s={14} f={C.taupe}>emails@{'{1}'}</T>
          <T x={30} y={192} s={13} f={C.taupe}>branch emails, one reflog entry back</T>
          {[0, 1, 2, 3].map((i) => <circle key={i} cx={196 + i * 30} cy={152} r={7} fill="none" stroke={C.taupe} strokeWidth={2} strokeDasharray="3 3" />)}
          <T x={330} y={157} s={13} f={C.taupe}>the 4 old commits</T>
        </g>
      </Svg>
    </Stack>
  );
}

// 4 · Conflicts: three versions of the same lines.
const CARDS = [
  { stage: '1', role: 'base', code: 'return email.strip()', c: C.latte },
  { stage: '2', role: 'ours · HEAD (lower)', code: 'return email.strip().lower()', c: C.crema },
  { stage: '3', role: 'theirs · casefold', code: 'return email.strip().casefold()', c: C.caramel },
];
export function Conflict({ t }: StepCtx) {
  const cardY = (i: number) => 8 + i * 54;
  // File lines: [text, colour, card index or -1, arrives at]
  const rows: { s: string; c: string; card: number; at: number }[] = [
    { s: '<<<<<<< HEAD', c: C.taupe, card: -1, at: 2.2 },
    { s: '  return email.strip().lower()', c: C.crema, card: 1, at: 1.5 },
    { s: '||||||| 0fd676d', c: C.taupe, card: -1, at: 2.3 },
    { s: '  return email.strip()', c: C.latte, card: 0, at: 1.8 },
    { s: '=======', c: C.taupe, card: -1, at: 2.4 },
    { s: '  return email.strip().casefold()', c: C.caramel, card: 2, at: 2.0 },
    { s: '>>>>>>> casefold', c: C.taupe, card: -1, at: 2.5 },
  ];
  const fileTop = 176;
  const lineY = (i: number) => fileTop + 42 + i * 22; // i = 0 is "def clean(email):"
  const done = easeOut(seg(t, 2.9, 3.4));
  return (
    <Svg label="A conflict is three versions of the same lines: base, ours and theirs, laid out between markers in the file, then resolved to one line" h={464}>
      {CARDS.map((cd, i) => {
        const a = easeOutBack(seg(t, 0.2 + i * 0.4, 0.7 + i * 0.4));
        return (
          <g key={cd.stage} transform={`translate(${(1 - clamp(a)) * -50} 0)`} opacity={clamp(a)}>
            <rect x={30} y={cardY(i)} width={506} height={50} rx={10} fill={C.roast} stroke={C.mocha} />
            <T x={50} y={cardY(i) + 32} s={18} f={cd.c} serif w={700}>{cd.stage}</T>
            <T x={76} y={cardY(i) + 16} s={13} f={C.taupe}>{cd.role}</T>
            <T x={76} y={cardY(i) + 39} s={15} f={cd.c}>{cd.code}</T>
          </g>
        );
      })}
      <rect x={30} y={fileTop} width={506} height={206} rx={12} fill={C.espresso} stroke={C.mocha} />
      <T x={46} y={fileTop + 22} s={13} f={C.taupe}>clean.py</T>
      <T x={46} y={lineY(0)} s={13} f={C.latte}>def clean(email):</T>
      {rows.map((r, i) => {
        const a = easeInOut(seg(t, r.at - 0.4, r.at));
        const fromY = r.card >= 0 ? cardY(r.card) + 39 : lineY(i + 1);
        const fromX = r.card >= 0 ? 76 : 46;
        const y = lerp(fromY, lineY(i + 1), a);
        const x = lerp(fromX, 46, a);
        // A card's line leaves a copy behind, so the cards still read after the lines fly down.
        return <T key={r.s} x={x} y={y} s={13} f={r.c} o={r.card >= 0 ? Math.max(a, 0) : a} w={r.card >= 0 ? 600 : 500}>{r.s}</T>;
      })}
      <g opacity={done}>
        <T x={46} y={fileTop + 232} s={13} f={C.taupe}>resolved:</T>
        <T x={46} y={fileTop + 254} s={14} f={C.caramel} w={600}>  return email.strip().casefold()</T>
        <T x={46} y={fileTop + 278} s={13} f={C.taupe}>edit → git add → git merge --continue</T>
      </g>
    </Svg>
  );
}

// 5 · bisect halves the suspects. The tested path is the one examples.sh took (asserted in examples.py).
const TESTED: [number, 'good' | 'bad'][] = [[500, 'good'], [750, 'bad'], [625, 'good'], [687, 'good'], [718, 'good'], [734, 'bad'], [726, 'good'], [730, 'good'], [732, 'bad'], [731, 'bad']];
const LEFT = [499, 249, 124, 62, 31, 15, 7, 3, 1, 0];
export function BisectHalves({ t, answer }: StepCtx) {
  if (answer === null) {
    const grow = easeOut(seg(t, 0.1, 0.8));
    const fade = easeOut(seg(t, 0.7, 1.1));
    const q = easeOutBack(seg(t, 0.8, 1.2));
    return (
      <Svg label="A strip of one thousand commits: the first passes the test, the last fails; how many tests to find the first failing one?" h={300}>
        <defs>
          <linearGradient id="strip" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0" stopColor={C.crema} />
            <stop offset="0.45" stopColor={C.latte} />
            <stop offset="1" stopColor={C.cherry} />
          </linearGradient>
        </defs>
        <rect x={30} y={130} width={506 * grow} height={26} rx={6} fill="url(#strip)" />
        {Array.from({ length: 50 }, (_, i) => <line key={i} x1={30 + (i + 1) * 10.12} x2={30 + (i + 1) * 10.12} y1={130} y2={156} stroke={C.espresso} strokeWidth={1} opacity={i * 10.12 + 10.12 < 506 * grow ? 0.35 : 0} />)}
        <g transform={`translate(283 100) scale(${clamp(q)})`}>
          <T x={0} y={0} s={28} f={C.caramel} a="middle" serif w={700}>?</T>
        </g>
        <g opacity={fade}>
          <T x={30} y={190} s={13} f={C.latte}>commit 1 · test passes</T>
          <T x={536} y={216} s={13} f={C.cherryText} a="end">commit 1,000 · test fails</T>
        </g>
      </Svg>
    );
  }
  const X0 = 220;
  const W = 316;
  const px = (n: number) => X0 + (W * n) / 1000;
  let lo = 2;
  let hi = 1000;
  const rows = TESTED.map(([p, v], k) => {
    const row = { k, p, v, lo, hi, y: 24 + k * 22 };
    if (v === 'good') lo = p + 1;
    else hi = p;
    return row;
  });
  return (
    <Svg label="Each test halves the window of suspects: ten tests narrow one thousand commits to the first bad commit" h={352}>
      {rows.map((r) => (
        <g key={r.k}>
          <T x={30} y={r.y + 5} s={14} f={C.latte}>{`test ${r.k + 1} · ${LEFT[r.k]} left`}</T>
          <rect x={X0} y={r.y - 6} width={W} height={10} rx={5} fill={C.cocoa} opacity={0.6} />
          <rect x={px(r.lo - 1)} y={r.y - 6} width={Math.max(3, px(r.hi) - px(r.lo - 1))} height={10} rx={5} fill={C.caramel} opacity={0.85} />
          <circle cx={px(r.p - 0.5)} cy={r.y - 1} r={6} fill={r.v === 'good' ? C.crema : C.cherry} stroke={r.v === 'good' ? C.crema : C.cherryText} strokeWidth={2} />
        </g>
      ))}
      <circle cx={px(730.5)} cy={262} r={8} fill={C.caramel} />
      <T x={536} y={294} s={17} a="end" f={C.crema} w={600}>784d178</T>
      <T x={536} y={316} s={14} a="end" f={C.latte}>clean: simplify</T>
      <T x={536} y={336} s={14} a="end" f={C.latte}>normalisation</T>
      <T x={30} y={298} s={26} f={C.caramel} serif w={700}>10 tests</T>
      <T x={30} y={322} s={14} f={C.taupe}>one by one:</T>
      <T x={30} y={340} s={14} f={C.taupe}>up to 998</T>
    </Svg>
  );
}

// 6 · bisect run: the exit code is the oracle, drawn as a number line cut into bands.
export function ExitCodes({ t }: StepCtx) {
  // 0 gets its own slot (30-52) so the markers for 0 and 1 don't sit on top of each other; 1..255 share 58-535.
  const x = (code: number) => (code === 0 ? 41 : 58 + (code - 1) * 1.878);
  const draw = easeOut(seg(t, 0.8, 1.6));
  const pop = (at: number) => clamp(easeOutBack(seg(t, at, at + 0.4)));
  const markers: [number, number][] = [[0, 1.6], [1, 2.2], [125, 2.8], [255, 3.4]];
  return (
    <Stack>
      <Code title="the oracle is the test (Git 2.56 wording)" t={t} end={0.7} lines={['$ git bisect run python3 ~/test_clean.py', "784d178… is the first 'bad' commit"]} />
      <Svg fill label="Exit codes as a number line: 0 is good, 1 to 127 bad except 125 which skips, 128 to 255 stops the run" h={200}>
        <g opacity={draw}>
          <rect x={30} y={84} width={22} height={34} rx={6} fill={C.crema} />
          <rect x={58} y={84} width={x(127) - 58} height={34} rx={6} fill={C.cherry} />
          <rect x={x(128)} y={84} width={535 - x(128)} height={34} rx={6} fill={C.void} stroke={C.mocha} strokeWidth={2} />
          <line x1={x(125)} x2={x(125)} y1={78} y2={124} stroke={C.taupe} strokeWidth={3} />
          <T x={30} y={70} s={13} f={C.crema}>0 good</T>
          <T x={(58 + x(127)) / 2} y={70} s={13} f={C.cherryText} a="middle">1–127 bad</T>
          <T x={(x(128) + 535) / 2} y={70} s={13} f={C.latte} a="middle">128–255 stops the run</T>
          <T x={x(125)} y={150} s={13} f={C.taupe} a="middle">125 skip: can't test this one</T>
        </g>
        {markers.map(([code, at]) => (
          <circle key={code} cx={x(code)} cy={101} r={7} fill={C.caramel} stroke={C.espresso} strokeWidth={2} opacity={clamp(pop(at))} transform={`translate(0 ${(1 - pop(at)) * -6})`} />
        ))}
        <T x={535} y={150} s={13} f={C.cherryText} a="end" o={pop(3.4)}>✕ abort</T>
      </Svg>
    </Stack>
  );
}

// 7 · Three ways to land a PR.
export function Landing({ t, answer }: StepCtx) {
  if (answer === null) {
    const lane = (i: number) => {
      const a = easeOutBack(seg(t, 0.1 + i * 0.4, 0.6 + i * 0.4));
      return { y0: 6 + i * 118, a: clamp(a) };
    };
    const l1 = lane(0);
    const l2 = lane(1);
    const l3 = lane(2);
    const Line = ({ y }: { y: number }) => <Edge x1={30} y1={y} x2={536} y2={y} />;
    return (
      <Svg label="The same three-commit pull request lands three ways: a merge commit with two parents, one squashed commit, or three new commits in a line" h={366}>
        <g opacity={l1.a} transform={`translate(${(1 - l1.a) * 30} 0)`}>
          <T x={30} y={l1.y0 + 18} s={15} f={C.crema} w={600}>Merge commit</T>
          <T x={30} y={l1.y0 + 38} s={14} f={C.latte}>2 parents · commits kept</T>
          <Line y={l1.y0 + 96} />
          <path d={`M180 ${l1.y0 + 96} C200 ${l1.y0 + 62} 220 ${l1.y0 + 64} 240 ${l1.y0 + 64} L360 ${l1.y0 + 64} C400 ${l1.y0 + 64} 410 ${l1.y0 + 96} 440 ${l1.y0 + 96}`} fill="none" stroke={C.mocha} strokeWidth={3} />
          {[80, 180].map((x) => <Commit key={x} x={x} y={l1.y0 + 96} r={8} />)}
          {[240, 300, 360].map((x) => <Commit key={x} x={x} y={l1.y0 + 64} r={8} />)}
          <circle cx={440} cy={l1.y0 + 96} r={12} fill={C.espresso} stroke={C.caramel} strokeWidth={4} />
        </g>
        <g opacity={l2.a} transform={`translate(${(1 - l2.a) * 30} 0)`}>
          <T x={30} y={l2.y0 + 18} s={15} f={C.crema} w={600}>Squash and merge</T>
          <T x={30} y={l2.y0 + 38} s={14} f={C.latte}>1 commit · 1 parent</T>
          <Line y={l2.y0 + 80} />
          {[80, 180].map((x) => <Commit key={x} x={x} y={l2.y0 + 80} r={8} />)}
          {[240, 300, 360].map((x) => <Commit key={x} x={x} y={l2.y0 + 52} kind="ghost" r={8} o={0.8} />)}
          <Commit x={440} y={l2.y0 + 80} kind="new" r={12} />
          <T x={440} y={l2.y0 + 112} s={14} a="middle" f={C.caramel}>Dedupe rows (#12)</T>
        </g>
        <g opacity={l3.a} transform={`translate(${(1 - l3.a) * 30} 0)`}>
          <T x={30} y={l3.y0 + 18} s={15} f={C.crema} w={600}>Rebase and merge</T>
          <T x={30} y={l3.y0 + 38} s={14} f={C.latte}>3 new commits, new IDs</T>
          <Line y={l3.y0 + 80} />
          {[80, 180].map((x) => <Commit key={x} x={x} y={l3.y0 + 80} r={8} />)}
          {[300, 380, 460].map((x) => <Commit key={x} x={x} y={l3.y0 + 80} kind="new" r={9} />)}
        </g>
        <T x={30} y={358} s={14} f={C.caramel} o={clamp(easeOut(seg(t, 1.2, 1.6)))}>then +1 commit on the same branch: next PR lists?</T>
      </Svg>
    );
  }
  return (
    <Svg label="After a squash merge, reusing the branch brings the three squashed commits back with the new one: four commits, and a conflict in dedupe.py" h={310}>
      <Edge x1={60} y1={46} x2={260} y2={46} />
      {[60, 150].map((x) => <Commit key={x} x={x} y={46} />)}
      <Commit x={260} y={46} kind="new" r={12} id="Dedupe rows (#12)" s={15} />
      <path d="M60 46 C60 150 150 120 150 200" fill="none" stroke={C.mocha} strokeWidth={3} strokeLinecap="round" />
      <Edge x1={150} y1={200} x2={420} y2={200} />
      {[150, 240, 330].map((x) => <Commit key={x} x={x} y={200} kind="bad" r={10} />)}
      <Commit x={420} y={200} kind="new" r={11} />
      <path d="M150 166 V156 H420 V166" fill="none" stroke={C.crema} strokeWidth={2} />
      <T x={285} y={142} s={17} a="middle" f={C.crema} w={600}>next PR: 4 commits, 1 new</T>
      <T x={240} y={236} s={14} a="middle" f={C.cherryText}>already in main as #12</T>
      <T x={420} y={236} s={14} a="middle" f={C.caramel}>new</T>
      <T x={30} y={284} s={13} f={C.taupe}>merge or rebase onto main → conflict: dedupe.py</T>
    </Svg>
  );
}

// 8 · Short-lived branches, one trunk. The shape is the lesson; no numbers.
export function Trunk({ t }: StepCtx) {
  const draw = easeOut(seg(t, 0.2, 0.8));
  const grow = easeInOut(seg(t, 0.8, 2.4));
  const back = easeOut(seg(t, 2.5, 2.8));
  const spark = easeOut(seg(t, 2.7, 3.0));
  return (
    <Svg label="Above, a trunk with many short branches that leave and rejoin quickly; below, one long-lived branch drifting away from the trunk until its merge throws conflicts" h={400}>
      <T x={30} y={40} s={15} f={C.crema} w={600}>trunk-based</T>
      <line x1={30} y1={120} x2={30 + 506 * draw} y2={120} stroke={C.crema} strokeWidth={4} strokeLinecap="round" />
      {Array.from({ length: 6 }, (_, i) => {
        const x0 = 48 + i * 78;
        const a = easeOut(seg(t, 0.5 + i * 0.3, 0.8 + i * 0.3));
        return (
          <g key={i}>
            <path d={`M${x0} 120 Q${x0 + 30} 62 ${x0 + 60} 120`} fill="none" stroke={C.latte} strokeWidth={3} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - a} />
            <circle cx={x0 + 60} cy={120} r={5} fill={C.crema} opacity={a > 0.98 ? 1 : 0} />
          </g>
        );
      })}
      <T x={30} y={156} s={13} f={C.latte}>short-lived PR branches: review + checks, then merge</T>

      <T x={30} y={222} s={15} f={C.crema} w={600}>long-lived branch</T>
      <line x1={30} y1={262} x2={536} y2={262} stroke={C.crema} strokeWidth={4} strokeLinecap="round" />
      {[100, 170, 240, 310, 380, 450].map((x, i) => <circle key={x} cx={x} cy={262} r={5} fill={C.crema} opacity={grow * 6 > i + 0.5 ? 1 : 0} />)}
      <clipPath id="wedge">
        <rect x={0} y={240} width={60 + 440 * grow} height={110} />
      </clipPath>
      <path d="M60 262 L500 262 L500 330 L200 330 C150 330 90 330 60 262 Z" fill={C.cherry} opacity={0.4} clipPath="url(#wedge)" />
      <path d="M60 262 C90 330 150 330 200 330 L500 330" fill="none" stroke={C.latte} strokeWidth={3} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - grow} />
      <path d="M500 330 C520 330 530 300 530 262" fill="none" stroke={C.latte} strokeWidth={3} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - back} />
      <g opacity={spark} stroke={C.cherryText} strokeWidth={3} strokeLinecap="round">
        {[200, 240, 280, 320, 0].map((deg) => {
          const r = (deg * Math.PI) / 180;
          return <line key={deg} x1={514 + Math.cos(r) * 12} y1={298 + Math.sin(r) * 12} x2={514 + Math.cos(r) * 26} y2={298 + Math.sin(r) * 26} />;
        })}
      </g>
      <T x={536} y={374} s={15} a="end" f={C.cherryText} o={spark}>merge hell</T>
    </Svg>
  );
}

// 9 · Recap in one breath.
const RECAP = [
  ['Merge', 'keeps both parents: history as it happened'],
  ['Rebase', 'replays commits: new IDs, one straight line'],
  ['Rewrite', "only what you haven't pushed; reflog undoes it"],
  ['Conflicts', '1 base, 2 ours, 3 theirs; zdiff3 shows the base'],
  ['bisect', '1,000 commits in 10 tests'],
  ['bisect run', '0 good, 1–127 bad, 125 skip'],
  ['Squash', 'one commit; then retire the branch'],
  ['Trunk', 'integrate daily; branches last days'],
];
export function Recap({ t }: StepCtx) {
  return (
    <Svg label="Recap of the eight points" h={480}>
      {RECAP.map(([k, v], i) => {
        const a = easeOut(seg(t, 0.1 + i * 0.15, 0.6 + i * 0.15));
        const y = 4 + i * 59;
        // The point's name above its one-line summary: no two labels share a line, so nothing can collide at any font.
        return (
          <g key={k} opacity={a} transform={`translate(${(1 - a) * 30} 0)`}>
            <rect x={30} y={y} width={506} height={53} rx={11} fill={C.roast} />
            <T x={50} y={y + 22} s={16} f={C.caramel} serif w={700}>{k}</T>
            <T x={50} y={y + 43} s={14} f={C.crema}>{v}</T>
          </g>
        );
      })}
    </Svg>
  );
}
