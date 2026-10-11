import type { StepCtx } from '../../../../../reels/types';
import { clamp, easeInOut, easeOut, easeOutBack, lerp, seg } from '../../../../../reels/anim';
import { C, Svg, T } from '../../../../../reels/kit';
import { RefresherList } from '../refreshers';

// Every ID, count and output shown here comes from examples.sh and is asserted in examples.py.
// One grammar across the reel: crema = a commit as it was made, caramel = a commit Git created for you
// (rewritten, squashed, the one bisect found), cherry = bad or broken, cherry outline = a commit that is only a duplicate,
// taupe dashed = abandoned (only in the reflog).
// Predict steps: the player does not restart the clock when the learner answers, so the answer frame is the
// finished picture (a pure function of `answer`); only the question frame animates.

type Kind = 'made' | 'new' | 'bad' | 'ghost' | 'dup';
const FILL: Record<Kind, string> = { made: C.crema, new: C.caramel, bad: C.cherry, ghost: 'none', dup: 'none' };
const TEXT: Record<Kind, string> = { made: C.crema, new: C.caramel, bad: C.cherryText, ghost: C.taupe, dup: C.cherryText };

/** A commit: a dot with its 7-character ID under it (IDs need about 90 units of room on a row). */
function Commit({ x, y, kind = 'made', id, r = 11, o = 1, s = 15, strike = false }: { x: number; y: number; kind?: Kind; id?: string; r?: number; o?: number; s?: number; strike?: boolean }) {
  return (
    <g opacity={o}>
      <circle cx={x} cy={y} r={r} fill={FILL[kind]} stroke={kind === 'ghost' ? C.taupe : kind === 'bad' || kind === 'dup' ? C.cherryText : 'none'} strokeWidth={2} strokeDasharray={kind === 'ghost' ? '4 4' : undefined} />
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
      <Svg label="A branch of three commits forks from main, which has moved on; what does rebasing it onto main do?" h={300}>
        <T x={30} y={30} s={14} f={C.taupe}>$ git rebase main  (on dedupe)</T>
        <g opacity={a}>
          <Edge x1={60} y1={98} x2={340} y2={98} />
          {[60, 200, 340].map((x) => <Commit key={x} x={x} y={98} />)}
          <Pill x={340} y={50} w={64}>main</Pill>
        </g>
        <g opacity={b}>
          <path d="M60 98 C60 170 200 140 200 206" fill="none" stroke={C.mocha} strokeWidth={3} strokeLinecap="round" />
          <Edge x1={200} y1={206} x2={400} y2={206} />
          {[['2f40780', 200], ['ebc701c', 300], ['f8b3630', 400]].map(([id, x]) => <Commit key={id} x={Number(x)} y={206} id={String(id)} />)}
          <Pill x={400} y={156} w={76}>dedupe</Pill>
        </g>
        <g transform={`translate(500 218) scale(${clamp(q)})`}>
          <T x={0} y={0} s={28} f={C.caramel} a="middle" serif w={700}>?</T>
        </g>
      </Svg>
    );
  }
  // The answer frame: both panels stacked. The two tree labels share one x, with the "=" centred between them.
  return (
    <Svg label="Merge adds one commit with two parents and keeps the originals; rebase makes three new commits in a straight line; both tips have the same tree" h={372}>
      {/* A · merge --no-ff */}
      <T x={30} y={20} s={15} f={C.latte}>merge --no-ff</T>
      <Pill x={380} y={22} w={64}>main</Pill>
      <Edge x1={40} y1={62} x2={380} y2={62} />
      <path d="M40 62 C40 108 90 108 130 108" fill="none" stroke={C.mocha} strokeWidth={3} strokeLinecap="round" />
      <Edge x1={130} y1={108} x2={350} y2={108} />
      <Edge x1={350} y1={108} x2={380} y2={62} />
      {[40, 130, 220].map((x) => <Commit key={x} x={x} y={62} />)}
      {[['2f40780', 130], ['ebc701c', 240], ['f8b3630', 350]].map(([id, x]) => <Commit key={id} x={Number(x)} y={108} id={String(id)} />)}
      <circle cx={380} cy={62} r={13} fill={C.espresso} stroke={C.caramel} strokeWidth={4} />
      <T x={404} y={67} s={15} f={C.crema}>2 parents</T>
      <Pill x={432} y={96} w={76}>dedupe</Pill>
      <T x={536} y={164} s={15} a="end" f={C.latte}>tree 827c45a</T>
      <T x={480} y={200} s={26} a="middle" f={C.crema} serif w={700}>=</T>
      {/* B · rebase */}
      <T x={30} y={236} s={15} f={C.latte}>rebase</T>
      <T x={536} y={236} s={15} a="end" f={C.latte}>tree 827c45a</T>
      <Edge x1={36} y1={266} x2={450} y2={266} />
      {[36, 84, 132].map((x) => <Commit key={x} x={x} y={266} />)}
      {[['9f711a4', 230], ['a0a20c8', 340], ['30d3436', 450]].map(([id, x]) => <Commit key={id} x={Number(x)} y={266} kind="new" id={String(id)} />)}
      <Pill x={132} y={282} w={64}>main</Pill>
      <Pill x={528} y={254} w={76}>dedupe</Pill>
      <T x={30} y={334} s={15} f={C.taupe}>old commits:</T>
      <T x={30} y={358} s={15} f={C.taupe}>in the reflog</T>
      {[['2f40780', 230], ['ebc701c', 340], ['f8b3630', 450]].map(([id, x]) => <Commit key={id} x={Number(x)} y={338} kind="ghost" id={String(id)} s={14} o={0.7} strike />)}
    </Svg>
  );
}

// 3 · Clean up before you push: the todo list is the interface.
// The todo as Git 2.56 writes it (the subject is a comment after the ID; Git 2.43 omits the '#'). examples.py asserts both.
// Drawn in the Svg, not in a code panel, so the final frame keeps what the edit did: the fixup moved up, the wip commit struck out.
const TODO_CMD = '$ git rebase -i --autosquash main';
const TODO = [
  { id: '5f14405', msg: 'add email check' },
  { id: '3d6cce4', msg: 'wip debug print' },
  { id: '84e21ce', msg: 'fixup! add email check' },
  { id: 'dad1c0d', msg: 'test email check' },
];
export function Tidy({ t, portrait }: StepCtx) {
  const swap = easeInOut(seg(t, 1.0, 1.5)); // the fixup line slides up under its target
  const moved = easeOut(seg(t, 1.5, 1.8));
  const dropped = easeOut(seg(t, 1.9, 2.2));
  const title = t < 1.0 ? 'as committed' : t < 1.9 ? 'what Git proposes' : 'what Git proposes, after your edit';
  const k = easeInOut(seg(t, 2.5, 3.2)); // 0 = four dots, 1 = two
  const ghost = easeOut(seg(t, 3.5, 4.0));
  const slot = [0, lerp(1, 2, swap), lerp(2, 1, swap), 3];
  const verb = [ 'pick', dropped > 0.5 ? 'drop' : 'pick', swap > 0.5 ? 'fixup' : 'pick', 'pick' ];
  const rowY = (i: number) => 72 + slot[i] * 22;
  const cw = (0.6 * 13 + 0.39) * (portrait ? 1.22 : 1); // one character of the 13-unit text, so the strike-through spans the row
  // Dots: first (5f14405), wip (3d6cce4), fixup (84e21ce), last (dad1c0d).
  const dy = 200;
  const xFirst = 95;
  const xWip = 210;
  const xFix = lerp(330, xFirst, k);
  const xLast = lerp(450, 285, k);
  const oldXs = [95, 210, 330, 450];
  return (
    <Svg label="Four commits become two: the fixup line moves up under its target and the debug commit is dropped; the old four stay in the reflog" h={336}>
      <rect x={30} y={6} width={506} height={150} rx={12} fill={C.espresso} stroke={C.mocha} />
      <T x={46} y={27} s={13} f={C.taupe}>{title}</T>
      <T x={46} y={49} s={13} f={C.latte}>{TODO_CMD}</T>
      {dropped > 0 && <rect x={36} y={rowY(1) - 15} width={494} height={21} rx={5} fill={C.cherry} opacity={0.3 * dropped} />}
      {moved > 0 && <rect x={36} y={rowY(2) - 15} width={494} height={21} rx={5} fill={C.caramel} opacity={0.18 * moved} />}
      {TODO.map((r, i) => {
        const a = easeOut(seg(t, 0.2 + i * 0.15, 0.5 + i * 0.15));
        const isFix = i === 2;
        const isWip = i === 1;
        const gone = isWip && dropped > 0.5;
        const vc = isFix && swap > 0.5 ? C.caramel : gone ? C.cherryText : C.crema;
        return (
          <g key={r.id} opacity={a}>
            <T x={46} y={rowY(i)} s={13} f={vc} w={isFix || isWip ? 700 : 500}>{verb[i]}</T>
            <T x={104} y={rowY(i)} s={13} f={gone ? C.cherryText : isFix && swap > 0.5 ? C.caramel : C.latte}>{`${r.id} # ${r.msg}`}</T>
            {gone && <line x1={46} x2={104 + (r.id.length + 3 + r.msg.length) * cw} y1={rowY(i) - 4} y2={rowY(i) - 4} stroke={C.cherryText} strokeWidth={2} />}
          </g>
        );
      })}
      <T x={530} y={rowY(2)} s={13} a="end" f={C.caramel} o={moved}>↑ moved</T>
      <T x={530} y={rowY(1)} s={13} a="end" f={C.cherryText} o={dropped}>dropped</T>

      <Edge x1={xFirst} y1={dy} x2={xLast} y2={dy} o={0.6} />
      <Commit x={xWip} y={dy} o={1 - k} id="3d6cce4" />
      <Commit x={xFix} y={dy} o={1 - k} id="84e21ce" />
      <Commit x={xFirst} y={dy} id={k < 0.5 ? '5f14405' : undefined} kind={k < 0.5 ? 'made' : 'new'} />
      <Commit x={xLast} y={dy} id={k < 0.5 ? 'dad1c0d' : undefined} kind={k < 0.5 ? 'made' : 'new'} />
      {k >= 0.5 && (
        <g opacity={easeOut((k - 0.5) * 2)}>
          <T x={xFirst} y={dy + 30} s={15} a="middle" f={C.caramel}>bf1d3f6</T>
          <T x={xFirst} y={dy + 50} s={13} a="middle" f={C.latte}>add email check</T>
          <T x={xLast} y={dy + 30} s={15} a="middle" f={C.caramel}>81f8447</T>
          <T x={xLast} y={dy + 50} s={13} a="middle" f={C.latte}>test email check</T>
        </g>
      )}
      <T x={536} y={dy + 6} s={24} a="end" f={C.caramel} serif w={700} o={clamp((k - 0.5) * 2)}>4 → 2</T>
      <g opacity={ghost}>
        {oldXs.map((x) => <Commit key={x} x={x} y={286} kind="ghost" />)}
        <T x={30} y={324} s={13} f={C.taupe}>{'emails@{1}: the 4 old commits'}</T>
      </g>
    </Svg>
  );
}

// 4 · Conflicts: three versions of the same lines.
const CARDS = [
  { stage: '1', role: 'base', code: 'return email.strip()', c: C.latte },
  { stage: '2', role: 'ours · HEAD (lower)', code: 'return email.strip().lower()', c: C.crema },
  { stage: '3', role: 'theirs · casefold', code: 'return email.strip().casefold()', c: C.caramel },
];
export function Conflict({ t }: StepCtx) {
  const cardY = (i: number) => 6 + i * 50;
  // File lines: [text, colour, card index or -1, arrives at]. Code lines are indented by an x offset: SVG collapses leading spaces.
  const rows: { s: string; c: string; card: number; at: number }[] = [
    { s: '<<<<<<< HEAD', c: C.taupe, card: -1, at: 2.2 },
    { s: 'return email.strip().lower()', c: C.crema, card: 1, at: 1.5 },
    { s: '||||||| 0fd676d', c: C.taupe, card: -1, at: 2.3 },
    { s: 'return email.strip()', c: C.latte, card: 0, at: 1.8 },
    { s: '=======', c: C.taupe, card: -1, at: 2.4 },
    { s: 'return email.strip().casefold()', c: C.caramel, card: 2, at: 2.0 },
    { s: '>>>>>>> casefold', c: C.taupe, card: -1, at: 2.5 },
  ];
  const fileTop = 162;
  const lineY = (i: number) => fileTop + 42 + i * 20; // i = 0 is "def clean(email):"
  const done = easeOut(seg(t, 2.9, 3.4)); // the cards and the markers have done their job: they fade, the resolution stays
  const trap = easeOut(seg(t, 3.7, 4.1));
  const ghost = 1 - 0.62 * done;
  return (
    <Svg label="A conflict is three versions of the same lines: base, ours and theirs, laid out between markers in the file, then resolved to one line; in a rebase ours and theirs swap" h={470}>
      {CARDS.map((cd, i) => {
        const a = easeOutBack(seg(t, 0.2 + i * 0.4, 0.7 + i * 0.4));
        return (
          <g key={cd.stage} transform={`translate(${(1 - clamp(a)) * -50} 0)`} opacity={clamp(a) * (1 - 0.6 * done)}>
            <rect x={30} y={cardY(i)} width={506} height={46} rx={10} fill={C.roast} stroke={C.mocha} />
            <T x={50} y={cardY(i) + 31} s={18} f={cd.c} serif w={700}>{cd.stage}</T>
            <T x={76} y={cardY(i) + 15} s={13} f={C.taupe}>{cd.role}</T>
            <T x={76} y={cardY(i) + 37} s={15} f={cd.c}>{cd.code}</T>
          </g>
        );
      })}
      <rect x={30} y={fileTop} width={506} height={196} rx={12} fill={C.espresso} stroke={C.mocha} />
      <T x={46} y={fileTop + 22} s={13} f={C.taupe} o={ghost}>clean.py</T>
      <T x={46} y={lineY(0)} s={13} f={C.latte} o={ghost}>def clean(email):</T>
      {rows.map((r, i) => {
        const a = easeInOut(seg(t, r.at - 0.4, r.at));
        const fromY = r.card >= 0 ? cardY(r.card) + 37 : lineY(i + 1);
        const fromX = r.card >= 0 ? 76 : 46;
        const toX = r.card >= 0 ? 60 : 46;
        const y = lerp(fromY, lineY(i + 1), a);
        const x = lerp(fromX, toX, a);
        // A card's line leaves a copy behind, so the cards still read after the lines fly down.
        return <T key={r.s} x={x} y={y} s={13} f={r.c} o={(r.card >= 0 ? Math.max(a, 0) : a) * ghost} w={r.card >= 0 ? 600 : 500}>{r.s}</T>;
      })}
      <g opacity={done}>
        <T x={46} y={fileTop + 224} s={15} f={C.caramel} w={600}>✓ return email.strip().casefold()</T>
        <T x={46} y={fileTop + 248} s={13} f={C.latte}>edit → git add → git merge --continue</T>
      </g>
      <g opacity={trap}>
        <T x={46} y={fileTop + 278} s={13} f={C.taupe}>in a rebase they swap:</T>
        <T x={46} y={fileTop + 298} s={13} f={C.taupe}>ours = main + replayed, theirs = your commit</T>
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
      <Svg label="A strip of one thousand commits: the first passes the test, the last fails; how many tests to find the first failing one?" h={250}>
        <defs>
          <linearGradient id="strip" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0" stopColor={C.crema} />
            <stop offset="0.45" stopColor={C.latte} />
            <stop offset="1" stopColor={C.cherry} />
          </linearGradient>
        </defs>
        <rect x={30} y={100} width={506 * grow} height={26} rx={6} fill="url(#strip)" />
        {Array.from({ length: 50 }, (_, i) => <line key={i} x1={30 + (i + 1) * 10.12} x2={30 + (i + 1) * 10.12} y1={100} y2={126} stroke={C.espresso} strokeWidth={1} opacity={i * 10.12 + 10.12 < 506 * grow ? 0.35 : 0} />)}
        <g transform={`translate(283 70) scale(${clamp(q)})`}>
          <T x={0} y={0} s={28} f={C.caramel} a="middle" serif w={700}>?</T>
        </g>
        <g opacity={fade}>
          <T x={30} y={160} s={13} f={C.latte}>commit 1 · test passes</T>
          <T x={536} y={186} s={13} f={C.cherryText} a="end">commit 1,000 · test fails</T>
        </g>
      </Svg>
    );
  }
  const X0 = 110;
  const W = 426;
  const px = (n: number) => X0 + (W * n) / 1000;
  let lo = 2;
  let hi = 1000;
  const rows = TESTED.map(([p, v], k) => {
    const row = { k, p, v, lo, hi, y: 36 + k * 21 };
    if (v === 'good') lo = p + 1;
    else hi = p;
    return row;
  });
  const pin = px(730.5);
  return (
    <Svg label="Each test halves the window of suspects: ten tests narrow one thousand commits to the first bad commit" h={338}>
      <T x={30} y={14} s={13} f={C.taupe}>test · left</T>
      {rows.map((r) => (
        <g key={r.k}>
          <T x={30} y={r.y + 5} s={13} f={C.latte}>{`${r.k + 1} · ${LEFT[r.k]}`}</T>
          <rect x={X0} y={r.y - 6} width={W} height={10} rx={5} fill={C.cocoa} opacity={0.6} />
          <rect x={px(r.lo - 1)} y={r.y - 6} width={Math.max(3, px(r.hi) - px(r.lo - 1))} height={10} rx={5} fill={C.caramel} opacity={0.85} />
          <circle cx={px(r.p - 0.5)} cy={r.y - 1} r={6} fill={r.v === 'good' ? C.crema : C.cherry} stroke={r.v === 'good' ? C.crema : C.cherryText} strokeWidth={2} />
        </g>
      ))}
      <line x1={pin} x2={pin} y1={36 + 9 * 21 + 8} y2={262} stroke={C.caramel} strokeWidth={2} />
      <circle cx={pin} cy={262} r={8} fill={C.caramel} />
      <T x={pin} y={292} s={17} a="middle" f={C.crema} w={600}>784d178</T>
      <T x={pin} y={314} s={14} a="middle" f={C.latte}>clean: simplify normalisation</T>
      <T x={30} y={282} s={26} f={C.caramel} serif w={700}>10 tests</T>
      <T x={30} y={306} s={14} f={C.taupe}>one by one:</T>
      <T x={30} y={328} s={14} f={C.taupe}>up to 998</T>
    </Svg>
  );
}

// 6 · bisect run: the exit code is the oracle, drawn as a number line cut into bands.
export function ExitCodes({ t }: StepCtx) {
  // 0 gets its own slot (30-52) so the markers for 0 and 1 don't sit on top of each other; 1..255 share 58-535 on a linear scale,
  // so 125 sits at its true place (49 % along), two codes short of the 127 / 128 edge.
  const x = (code: number) => (code === 0 ? 41 : 58 + (code - 1) * 1.878);
  const lines = easeOut(seg(t, 0.2, 0.7));
  const draw = easeOut(seg(t, 0.8, 1.6));
  const pop = (at: number) => clamp(easeOutBack(seg(t, at, at + 0.4)));
  const note = (at: number) => clamp(easeOut(seg(t, at, at + 0.4)));
  const BY = 112; // the bar's top
  const MY = BY + 17;
  const markers: { code: number; at: number; stroke: string; fill: string }[] = [
    { code: 0, at: 1.6, stroke: C.crema, fill: C.espresso },
    { code: 1, at: 2.2, stroke: C.cherryText, fill: C.espresso },
    { code: 125, at: 2.8, stroke: C.latte, fill: C.espresso },
    { code: 255, at: 3.4, stroke: C.latte, fill: C.void },
  ];
  return (
    <Svg label="Exit codes as a number line: 0 is good, 1 to 127 bad except 125 which skips, 128 to 255 stops the run" h={252}>
      <rect x={30} y={4} width={506} height={70} rx={12} fill={C.espresso} stroke={C.mocha} opacity={lines} />
      <g opacity={lines}>
        <T x={46} y={24} s={13} f={C.taupe}>git 2.56 output</T>
        <T x={46} y={46} s={13} f={C.crema}>$ git bisect run python3 ~/test_clean.py</T>
        <T x={46} y={66} s={13} f={C.latte}>{"784d178… is the first 'bad' commit"}</T>
      </g>
      <g opacity={draw}>
        <rect x={30} y={BY} width={22} height={34} rx={6} fill={C.crema} />
        <rect x={58} y={BY} width={x(127) - 58} height={34} rx={6} fill={C.cherry} />
        <rect x={x(128)} y={BY} width={535 - x(128)} height={34} rx={6} fill={C.void} stroke={C.mocha} strokeWidth={2} />
        <line x1={x(125)} x2={x(125)} y1={BY - 6} y2={BY + 40} stroke={C.latte} strokeWidth={3} />
        <T x={30} y={BY - 10} s={13} f={C.crema}>0 good</T>
        <T x={176} y={BY - 10} s={13} f={C.cherryText} a="middle">1–127 bad</T>
        <T x={416} y={BY - 10} s={13} f={C.latte} a="middle">128–255 stops the run</T>
      </g>
      {markers.map(({ code, at, stroke, fill }) => (
        <circle key={code} cx={x(code)} cy={MY} r={7} fill={fill} stroke={stroke} strokeWidth={3} opacity={pop(at)} transform={`translate(0 ${(1 - pop(at)) * -6})`} />
      ))}
      <line x1={x(125)} x2={x(125)} y1={BY + 40} y2={BY + 56} stroke={C.latte} strokeWidth={2} opacity={note(2.8)} />
      <line x1={x(255)} x2={x(255)} y1={BY + 40} y2={BY + 82} stroke={C.latte} strokeWidth={2} opacity={note(3.4)} />
      <T x={30} y={BY + 68} s={13} f={C.crema} o={note(1.6)}>0 · test passes</T>
      <T x={x(125) - 20} y={BY + 68} s={13} f={C.latte} o={note(2.8)}>{"125 · skip: can't test it"}</T>
      <T x={30} y={BY + 94} s={13} f={C.cherryText} o={note(2.2)}>1 · a failing assert</T>
      <T x={535} y={BY + 94} s={13} f={C.latte} a="end" o={note(3.4)}>✕ 255 aborts</T>
    </Svg>
  );
}

// 7 · Three ways to land a PR.
export function Landing({ t, answer }: StepCtx) {
  if (answer === null) {
    const lane = (i: number) => {
      const a = easeOutBack(seg(t, 0.1 + i * 0.4, 0.6 + i * 0.4));
      return { y0: 6 + i * 104, a: clamp(a) };
    };
    const l1 = lane(0);
    const l2 = lane(1);
    const l3 = lane(2);
    const Line = ({ y }: { y: number }) => <Edge x1={30} y1={y} x2={536} y2={y} />;
    return (
      <Svg label="The same three-commit pull request lands three ways: a merge commit with two parents, one squashed commit, or three new commits in a line" h={330}>
        <g opacity={l1.a} transform={`translate(${(1 - l1.a) * 30} 0)`}>
          <T x={30} y={l1.y0 + 18} s={15} f={C.crema} w={600}>Merge commit</T>
          <T x={30} y={l1.y0 + 38} s={14} f={C.latte}>2 parents · commits kept</T>
          <Line y={l1.y0 + 88} />
          <path d={`M180 ${l1.y0 + 88} C200 ${l1.y0 + 60} 220 ${l1.y0 + 58} 240 ${l1.y0 + 58} L360 ${l1.y0 + 58} C400 ${l1.y0 + 58} 410 ${l1.y0 + 88} 440 ${l1.y0 + 88}`} fill="none" stroke={C.mocha} strokeWidth={3} />
          {[80, 180].map((x) => <Commit key={x} x={x} y={l1.y0 + 88} r={8} />)}
          {[240, 300, 360].map((x) => <Commit key={x} x={x} y={l1.y0 + 58} r={8} />)}
          <circle cx={440} cy={l1.y0 + 88} r={12} fill={C.espresso} stroke={C.caramel} strokeWidth={4} />
        </g>
        <g opacity={l2.a} transform={`translate(${(1 - l2.a) * 30} 0)`}>
          <T x={30} y={l2.y0 + 18} s={15} f={C.crema} w={600}>Squash and merge</T>
          <T x={30} y={l2.y0 + 38} s={14} f={C.latte}>1 commit · 1 parent</T>
          <Line y={l2.y0 + 78} />
          {[80, 180].map((x) => <Commit key={x} x={x} y={l2.y0 + 78} r={8} />)}
          {[240, 300, 360].map((x) => <Commit key={x} x={x} y={l2.y0 + 50} kind="ghost" r={8} o={0.8} />)}
          <Commit x={440} y={l2.y0 + 78} kind="new" r={12} />
          <T x={440} y={l2.y0 + 102} s={14} a="middle" f={C.caramel}>Dedupe rows (#12)</T>
        </g>
        <g opacity={l3.a} transform={`translate(${(1 - l3.a) * 30} 0)`}>
          <T x={30} y={l3.y0 + 18} s={15} f={C.crema} w={600}>Rebase and merge</T>
          <T x={30} y={l3.y0 + 38} s={14} f={C.latte}>3 new commits, new IDs</T>
          <Line y={l3.y0 + 78} />
          {[80, 180].map((x) => <Commit key={x} x={x} y={l3.y0 + 78} r={8} />)}
          {[300, 380, 460].map((x) => <Commit key={x} x={x} y={l3.y0 + 78} kind="new" r={9} />)}
        </g>
        <T x={30} y={322} s={14} f={C.caramel} o={clamp(easeOut(seg(t, 1.2, 1.6)))}>then +1 commit on the same branch: next PR lists?</T>
      </Svg>
    );
  }
  // The answer frame keeps the three ways as a strip of mini-lanes (the squash one marked) above the enlarged squash lane.
  const mini = [
    { title: 'Merge', x0: 30 },
    { title: 'Squash', x0: 212 },
    { title: 'Rebase', x0: 394 },
  ];
  return (
    <Svg label="After a squash merge, reusing the branch brings the three squashed commits back with the new one: four commits, and a conflict in dedupe.py. The merge and rebase ways are shown small above" h={332}>
      {mini.map(({ title, x0 }, i) => (
        <g key={title}>
          <rect x={x0 - 4} y={2} width={176} height={68} rx={10} fill="none" stroke={i === 1 ? C.caramel : C.mocha} strokeWidth={i === 1 ? 2.5 : 1.5} />
          <T x={x0 + 6} y={21} s={13} f={i === 1 ? C.crema : C.latte} w={600}>{title}</T>
          <Edge x1={x0 + 8} y1={52} x2={x0 + 160} y2={52} />
          {[16, 44].map((d) => <Commit key={d} x={x0 + d} y={52} r={4} />)}
          {i === 0 && (
            <>
              <path d={`M${x0 + 44} 52 L${x0 + 72} 38 H${x0 + 122} L${x0 + 148} 52`} fill="none" stroke={C.mocha} strokeWidth={3} strokeLinejoin="round" />
              {[72, 97, 122].map((d) => <Commit key={d} x={x0 + d} y={38} r={4} />)}
              <circle cx={x0 + 148} cy={52} r={7} fill={C.espresso} stroke={C.caramel} strokeWidth={3} />
            </>
          )}
          {i === 1 && (
            <>
              {[72, 97, 122].map((d) => <Commit key={d} x={x0 + d} y={38} r={4} kind="ghost" o={0.8} />)}
              <Commit x={x0 + 148} y={52} r={7} kind="new" />
            </>
          )}
          {i === 2 && [86, 114, 142].map((d) => <Commit key={d} x={x0 + d} y={52} r={5} kind="new" />)}
        </g>
      ))}
      <Edge x1={60} y1={122} x2={260} y2={122} />
      {[60, 150].map((x) => <Commit key={x} x={x} y={122} />)}
      <Commit x={260} y={122} kind="new" r={12} id="Dedupe rows (#12)" s={15} />
      <path d="M60 122 C60 205 150 190 150 236" fill="none" stroke={C.mocha} strokeWidth={3} strokeLinecap="round" />
      <Edge x1={150} y1={236} x2={420} y2={236} />
      {[150, 240, 330].map((x) => <Commit key={x} x={x} y={236} kind="dup" r={10} />)}
      <Commit x={420} y={236} kind="new" r={11} />
      <path d="M150 208 V198 H420 V208" fill="none" stroke={C.crema} strokeWidth={2} />
      <T x={300} y={186} s={17} a="middle" f={C.crema} w={600}>next PR: 4 commits, 1 new</T>
      <T x={240} y={274} s={14} a="middle" f={C.cherryText}>already in main as #12</T>
      <T x={420} y={274} s={14} a="middle" f={C.caramel}>new</T>
      <T x={30} y={312} s={13} f={C.taupe}>merge or rebase onto main → conflict: dedupe.py</T>
    </Svg>
  );
}

// 8 · Short-lived branches, one trunk. The shape is the lesson; no numbers.
export function Trunk({ t }: StepCtx) {
  const draw = easeOut(seg(t, 0.2, 0.8));
  const grow = easeInOut(seg(t, 0.8, 2.4));
  const back = easeOut(seg(t, 2.5, 2.8));
  const spark = easeOut(seg(t, 2.7, 3.0));
  const TY = 216; // the lower trunk
  const bx = (f: number) => 60 + 440 * f; // the long branch: a straight descent from the trunk, so the gap widens to the right
  const by = (f: number) => TY + 96 * f;
  return (
    <Svg label="Above, a trunk with many short branches that leave and rejoin quickly; below, one long-lived branch drifting away from the trunk, the gap widening every day, until its merge throws conflicts" h={362}>
      <T x={30} y={24} s={15} f={C.crema} w={600}>trunk-based</T>
      <line x1={30} y1={84} x2={30 + 506 * draw} y2={84} stroke={C.crema} strokeWidth={4} strokeLinecap="round" />
      {Array.from({ length: 6 }, (_, i) => {
        const x0 = 48 + i * 78;
        const a = easeOut(seg(t, 0.5 + i * 0.3, 0.8 + i * 0.3));
        return (
          <g key={i}>
            <path d={`M${x0} 84 Q${x0 + 30} 30 ${x0 + 60} 84`} fill="none" stroke={C.latte} strokeWidth={3} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - a} />
            <circle cx={x0 + 60} cy={84} r={5} fill={C.crema} opacity={a > 0.98 ? 1 : 0} />
          </g>
        );
      })}
      <T x={30} y={122} s={13} f={C.latte}>short-lived PR branches: review + checks, then merge</T>

      <T x={30} y={176} s={15} f={C.crema} w={600}>long-lived branch</T>
      <line x1={30} y1={TY} x2={536} y2={TY} stroke={C.crema} strokeWidth={4} strokeLinecap="round" />
      {[100, 170, 240, 310, 380, 450].map((x, i) => <circle key={x} cx={x} cy={TY} r={5} fill={C.crema} opacity={grow * 6 > i + 0.5 ? 1 : 0} />)}
      <clipPath id="wedge">
        <rect x={0} y={TY - 10} width={60 + 440 * grow} height={130} />
      </clipPath>
      <path d={`M60 ${TY} L500 ${TY} L500 ${by(1)} Z`} fill={C.cherry} opacity={0.45} clipPath="url(#wedge)" />
      <path d={`M60 ${TY} L500 ${by(1)}`} fill="none" stroke={C.latte} strokeWidth={3} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - grow} />
      {[0.2, 0.4, 0.6, 0.8].map((f) => <circle key={f} cx={bx(f)} cy={by(f)} r={5} fill={C.latte} opacity={grow > f ? 1 : 0} />)}
      <path d={`M500 ${by(1)} C524 ${by(1)} 532 270 526 ${TY}`} fill="none" stroke={C.latte} strokeWidth={3} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - back} />
      <g opacity={spark} stroke={C.cherryText} strokeWidth={4} strokeLinecap="round">
        {[-70, -35, 0, 35, 70].map((deg) => {
          const r = (deg * Math.PI) / 180;
          return <line key={deg} x1={560 + Math.cos(r) * 14} y1={268 + Math.sin(r) * 14} x2={560 + Math.cos(r) * 32} y2={268 + Math.sin(r) * 32} />;
        })}
      </g>
      <T x={30} y={312} s={13} f={C.taupe} o={grow}>drift grows every day</T>
      <T x={590} y={352} s={15} a="end" f={C.cherryText} o={spark}>merge hell</T>
    </Svg>
  );
}

// 9 · Recap in one breath.
const RECAP = [
  ['Merge', 'keeps both parents: history as it happened'],
  ['Rebase', 'replays commits: new IDs, one straight line'],
  ['Rewrite', 'only unpushed; reflog undoes it'],
  ['Conflicts', '1 base · 2 ours · 3 theirs; zdiff3'],
  ['bisect', '1,000 commits in 10 tests'],
  ['bisect run', '0 good, 1–127 bad, 125 skip'],
  ['Land a PR', 'merge, squash, rebase; retire after squash'],
  ['Trunk', 'short-lived branches, merged at least daily'],
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
