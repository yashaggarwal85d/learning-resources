import type { ReactNode } from 'react';
import type { StepCtx } from '../../../../../reels/types';
import { Code } from '../../../../../reels/Code';
import { clamp, easeInOut, easeOut, easeOutBack, lerp, seg } from '../../../../../reels/anim';
import { C, Stack, Svg, T } from '../../../../../reels/kit';
import { RefresherList } from '../refreshers';

// Every number shown here comes from examples.sh and is asserted in examples.py.
// One picture for the whole reel, a conveyor of gates: a change rides a belt through four gates (review, tests, build, publish).
// A mini-map strip along the top of steps 2-9 shows which gate the step is about. The exit-status token is the shell refresher's
// round token (crema = 0, cherry = non-zero). Colour keeps one meaning: crema = values as they are, latte = secondary labels,
// taupe = belt, waiting and skipped, caramel = the thing to look at, cinnamon = the drifting alternative (large shapes only),
// cherry fill with cherryText labels = a bad outcome. At most two accents in a step.
// Predict steps: the player does not restart the clock when the learner answers, so an answer frame is a finished picture
// (a pure function of `answer`); only the question frame animates.

const pop = (t: number, at: number) => clamp(easeOutBack(seg(t, at, at + 0.4)));
const fade = (t: number, at: number, len = 0.4) => clamp(easeOut(seg(t, at, at + len)));

const GATES = ['review', 'tests', 'build', 'publish'] as const;
type Gate = (typeof GATES)[number];

/** The mini-map: where in the delivery loop this step sits. */
function MiniMap({ lit }: { lit: Gate[] }) {
  return (
    <g>
      <line x1={30} y1={24} x2={570} y2={24} stroke={C.mocha} strokeWidth={3} />
      {GATES.map((g, i) => {
        const x = 30 + i * 142.67;
        const on = lit.includes(g);
        return (
          <g key={g}>
            <rect x={x} y={9} width={112} height={30} rx={15} fill={C.espresso} stroke={on ? C.caramel : C.taupe} strokeWidth={on ? 2.5 : 1.5} />
            <T x={x + 56} y={29} s={13} a="middle" f={on ? C.caramel : C.taupe} w={on ? 700 : 500}>{g}</T>
          </g>
        );
      })}
    </g>
  );
}

/** An exit-status token: a round token with its mark or number (crema = fine, cherry = a non-zero status). */
const Tok = ({ x, y, n, bad = false, r = 17, o = 1, c = C.crema }: { x: number; y: number; n: string; bad?: boolean; r?: number; o?: number; c?: string }) => (
  <g opacity={o}>
    <circle cx={x} cy={y} r={r} fill={bad ? C.cherry : C.espresso} stroke={bad ? C.cherryText : c} strokeWidth={3} />
    <T x={x} y={y + 6} s={17} a="middle" f={bad ? C.crema : c} w={700}>{n}</T>
  </g>
);
const Line = ({ x1, y1, x2, y2, c = C.mocha, o = 1, w = 3, dash }: { x1: number; y1: number; x2: number; y2: number; c?: string; o?: number; w?: number; dash?: string }) => (
  <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={c} strokeWidth={w} strokeLinecap="round" opacity={o} strokeDasharray={dash} />
);
/** A process box, as in the shell refresher. */
function Box({ x, y, w, h = 44, label, sub, stroke = C.crema, dashed = false, o = 1, ls = 15, lf = C.crema }: { x: number; y: number; w: number; h?: number; label: ReactNode; sub?: string; stroke?: string; dashed?: boolean; o?: number; ls?: number; lf?: string }) {
  return (
    <g opacity={o}>
      <rect x={x} y={y} width={w} height={h} rx={12} fill={C.espresso} stroke={stroke} strokeWidth={2} strokeDasharray={dashed ? '6 5' : undefined} />
      <T x={x + w / 2} y={sub ? y + h / 2 - 2 : y + h / 2 + 5} s={ls} a="middle" f={lf}>{label}</T>
      {sub && <T x={x + w / 2} y={y + h / 2 + 16} s={13} a="middle" f={C.latte}>{sub}</T>}
    </g>
  );
}

// 1 · Where we are: the five refreshers that open the chapter.
export const Opening = (c: StepCtx) => <RefresherList {...c} current={3} />;

// 2 · Review: a funnel of rungs that shrink, then a size bar.
const RUNGS = ['1 design', '2 functionality', '3 complexity', '4 tests', '5 naming, comments', '6 style: "Nit:"'];
const RUNG_Y = [52, 94, 136, 178, 242, 284];
export function Review({ t }: StepCtx) {
  const subLine = fade(t, 2.6);
  const bar = fade(t, 3.0);
  const ticks = fade(t, 3.4);
  const X0 = 30;
  const scale = (n: number) => X0 + (n / 1000) * 540;
  return (
    <Svg label="A review funnel: design first and widest, style last and narrowest, marked Nit; under it a size bar from 100 lines, reasonable, to 1,000, usually too large" h={420}>
      <MiniMap lit={['review']} />
      {RUNGS.map((r, i) => {
        const a = pop(t, 0.4 + i * 0.3);
        const w = (520 - i * 50) * a;
        const first = i === 0;
        const last = i === RUNGS.length - 1;
        return (
          <g key={r}>
            <rect x={300 - w / 2} y={RUNG_Y[i]} width={Math.max(0, w)} height={34} rx={12} fill={first ? C.caramel : C.espresso} fillOpacity={first ? 0.16 : 1} stroke={first ? C.caramel : C.taupe} strokeWidth={first ? 2.5 : 1.5} />
            <T x={300 - (520 - i * 50) / 2 + 16} y={RUNG_Y[i] + 23} s={15} f={last ? C.latte : C.crema} w={first ? 700 : 500} o={clamp(a * 1.5)}>{r}</T>
          </g>
        );
      })}
      <T x={300} y={236} s={13} a="middle" f={C.latte} o={subLine}>do they fail when the code is broken?</T>
      <g opacity={bar}>
        <T x={X0} y={346} s={13} f={C.taupe}>PR SIZE, LINES CHANGED</T>
        <rect x={X0} y={362} width={540} height={14} rx={7} fill={C.cocoa} />
        <rect x={X0} y={362} width={scale(100) - X0} height={14} rx={7} fill={C.caramel} fillOpacity={0.55} />
      </g>
      <g opacity={ticks}>
        <rect x={scale(100) - 2} y={354} width={4} height={30} rx={2} fill={C.caramel} />
        <T x={scale(100)} y={406} s={13} f={C.latte}>{'≈100 lines: reasonable'}</T>
        <rect x={scale(1000) - 4} y={354} width={4} height={30} rx={2} fill={C.cherry} />
        <T x={scale(1000)} y={414} s={13} f={C.cherryText} a="end">1,000: usually too large</T>
      </g>
    </Svg>
  );
}

// 3 · A unit test pins the bug: the same six tests on the real clean() and on commit 731's.
const TEST_ROWS = ["'paid'", "'Paid'", "'SHIPPED '", "' refunded'", "email (Git's oracle)", 'main() counts'];
const ON_731 = [true, true, false, false, false, false]; // Paid still passes: lower() fixes the case
export function UnitTest({ t }: StepCtx) {
  const LX = 300;
  const RX = 480;
  const leftSum = fade(t, 1.6);
  const rightSum = fade(t, 3.3);
  return (
    <Stack>
      <Code
        title="tests/test_clean.py"
        t={t}
        end={0.7}
        lines={['@pytest.mark.parametrize(', "    'raw, expected', [", "    ('paid', 'paid'), ('Paid', 'paid'),", "    ('SHIPPED ', 'shipped'), (' refunded', 'refunded'),", '])', 'def test_clean_status(raw, expected):', '    assert clean(raw) == expected']}
      />
      <Svg fill label="Six tests: all six pass on the real clean, and on commit 731's clean four fail and two pass" h={290}>
        <T x={LX} y={26} s={13} a="middle" f={C.crema} o={fade(t, 0.8)}>strip().lower()</T>
        <T x={RX} y={26} s={13} a="middle" f={C.cherryText} o={fade(t, 2.0)}>731: lower()</T>
        {TEST_ROWS.map((r, i) => {
          const y = 62 + i * 30;
          return (
            <g key={r}>
              <T x={30} y={y + 5} s={13} f={C.latte} o={fade(t, 0.8 + i * 0.1)}>{r}</T>
              <Tok x={LX} y={y} n="✓" r={13} o={pop(t, 0.9 + i * 0.12)} />
              {ON_731[i] ? <Tok x={RX} y={y} n="✓" r={13} o={pop(t, 2.2 + i * 0.14)} /> : <Tok x={RX} y={y} n="✕" r={13} bad o={pop(t, 2.2 + i * 0.14)} />}
            </g>
          );
        })}
        <g opacity={leftSum}>
          <T x={LX} y={252} s={15} a="middle" f={C.crema} w={700}>6 passed</T>
          <T x={LX} y={272} s={13} a="middle" f={C.latte}>exit 0</T>
        </g>
        <g opacity={rightSum}>
          <T x={RX} y={252} s={15} a="middle" f={C.cherryText} w={700}>4 failed, 2 passed</T>
          <T x={RX} y={272} s={13} a="middle" f={C.cherryText}>exit 1</T>
        </g>
      </Svg>
    </Stack>
  );
}

// 4 · CI: a chain of exit statuses. Two runs of one gate.yml.
export function CiChain({ t }: StepCtx) {
  const boxes = fade(t, 0.2);
  const skipped = easeOut(seg(t, 1.9, 2.3));
  const Col = ({ x, bad, title }: { x: number; bad: boolean; title: string }) => {
    const ys = [96, 166, 236];
    const names = ['install (locked)', 'pytest -q', 'pipeline | diff'];
    // token times: left 0, right 0, left 0, right 1, (right skipped), left 0
    const at = bad ? [0.9, 1.5] : [0.6, 1.2, 2.2];
    return (
      <g>
        <T x={x} y={72} s={15} f={C.crema} o={boxes}>{title}</T>
        {ys.map((y, i) => {
          const isSkip = bad && i === 2;
          return (
            <g key={names[i]}>
              {i > 0 && <Line x1={x + 98} y1={ys[i - 1] + 50} x2={x + 98} y2={y} c={C.mocha} o={boxes} w={2} />}
              <Box x={x} y={y} w={196} h={50} label={names[i]} ls={13} o={boxes * (isSkip ? 1 - skipped : 1)} stroke={bad && i === 1 ? C.cherryText : C.crema} />
              {isSkip && (
                <g opacity={skipped}>
                  <rect x={x} y={y} width={196} height={50} rx={12} fill={C.espresso} stroke={C.taupe} strokeWidth={2} strokeDasharray="6 5" />
                  <T x={x + 98} y={y + 22} s={13} a="middle" f={C.taupe}>{names[i]}</T>
                  <T x={x + 98} y={y + 40} s={13} a="middle" f={C.taupe}>skipped</T>
                </g>
              )}
              {!isSkip && <Tok x={x + 228} y={y + 25} n={bad && i === 1 ? '1' : '0'} bad={bad && i === 1} o={pop(t, at[i])} />}
            </g>
          );
        })}
        <g opacity={fade(t, 2.6)}>
          <rect x={x} y={310} width={120} height={30} rx={15} fill={bad ? C.cherry : C.espresso} stroke={bad ? C.cherryText : C.caramel} strokeWidth={2.5} />
          <T x={x + 60} y={331} s={15} a="middle" f={bad ? C.crema : C.caramel} w={700}>{bad ? 'gate ✕' : 'gate ✓'}</T>
        </g>
        <g opacity={fade(t, 3.0)}>
          {bad ? (
            <>
              <T x={x} y={366} s={13} f={C.cherryText}>merge blocked:</T>
              <T x={x} y={384} s={13} f={C.cherryText}>required check failed</T>
            </>
          ) : (
            <T x={x} y={366} s={13} f={C.crema}>merge enabled</T>
          )}
        </g>
      </g>
    );
  };
  return (
    <Svg label="Two runs of the same job: the fix passes install, tests and diff and may merge; commit 731 fails the tests with exit 1, the diff step is skipped and the merge is blocked" h={400}>
      <MiniMap lit={['tests', 'build']} />
      <Col x={30} bad={false} title="PR: restore strip()" />
      <Col x={320} bad title="commit 731: lower()" />
    </Svg>
  );
}

// 5 · Predict: which shell runs your step? Question: three boxes and a "?"; answer: the two shells side by side.
export function WhichShell({ t, answer, portrait }: StepCtx) {
  const shown = answer !== null;
  const pipeline = (ty: number, o: (i: number) => number) => (
    <>
      {['jq', 'sort', 'uniq -c'].map((n, i) => (
        <g key={n}>
          <Box x={30 + i * 190} y={62} w={160} label={n} o={o(i)} stroke={i === 0 ? C.cherryText : C.crema} />
          {i < 2 && <Line x1={190 + i * 190} y1={84} x2={220 + i * 190} y2={84} c={C.taupe} w={3} o={o(i)} />}
          <Tok x={110 + i * 190} y={ty} n={i === 0 ? '2' : '0'} bad={i === 0} o={o(i)} />
        </g>
      ))}
    </>
  );
  return (
    <Stack>
      {!(portrait && shown) && (
        <Code title=".github/workflows/gate.yml" t={shown ? 10 : t} end={0.6} lines={['runs-on: ubuntu-latest', 'steps:', '  - run: jq -r .status missing.jsonl | sort | uniq -c']} highlight={[2]} />
      )}
      {!shown ? (
        <Svg fill label="Three commands in a pipeline: jq exits 2, sort and uniq exit 0; does the step pass or fail?" h={250}>
          <MiniMap lit={['tests']} />
          {pipeline(142, (i) => fade(t, 0.2 + i * 0.25))}
          <T x={30} y={216} s={13} f={C.latte} o={fade(t, 0.8)}>the step's verdict:</T>
          <g transform={`translate(300 210) scale(${pop(t, 0.8)})`}>
            <circle r={24} fill={C.espresso} stroke={C.caramel} strokeWidth={3} />
            <T x={0} y={9} s={28} a="middle" f={C.caramel} serif w={700}>?</T>
          </g>
        </Svg>
      ) : (
        <Svg fill label="With no shell set the step runs bash -e and passes with status 0, hiding the failure; with shell bash it runs with pipefail and fails with status 2" h={340}>
          <MiniMap lit={['tests']} />
          {pipeline(134, () => 1)}
          <g>
            <rect x={30} y={176} width={540} height={60} rx={12} fill="none" stroke={C.cherryText} strokeWidth={2} />
            <T x={46} y={200} s={15} f={C.crema}>no shell:</T>
            <T x={46} y={222} s={13} f={C.latte}>bash -e {'{0}'}</T>
            <Tok x={300} y={206} n="0" />
            <T x={340} y={200} s={13} f={C.cherryText}>passes: the failure</T>
            <T x={340} y={222} s={13} f={C.cherryText}>is hidden</T>
          </g>
          <g>
            <rect x={30} y={250} width={540} height={60} rx={12} fill="none" stroke={C.caramel} strokeWidth={2.5} />
            <T x={46} y={274} s={15} f={C.crema}>shell: bash</T>
            <T x={46} y={296} s={13} f={C.latte}>-eo pipefail</T>
            <Tok x={300} y={280} n="2" bad />
            <T x={340} y={274} s={13} f={C.caramel}>fails, as it should</T>
            <T x={340} y={296} s={13} f={C.caramel}>status 2</T>
          </g>
        </Svg>
      )}
    </Stack>
  );
}

// 6 · Flaky: twenty runs of the same commit, then the fixed test.
const FLAKY = 'FFPPFFPFFPFFPPPFPPFP'; // examples.sh: PYTHONHASHSEED 0..19
export function Flaky({ t }: StepCtx) {
  const dots = (y: number, pattern: string, start: number, step: number) =>
    pattern.split('').map((p, i) => {
      const a = pop(t, start + i * step);
      return <circle key={i} cx={40 + i * 26} cy={y} r={9 * a} fill={p === 'P' ? C.caramel : C.cherry} stroke={p === 'P' ? 'none' : C.cherryText} strokeWidth={1.5} />;
    });
  return (
    <Svg label="Twenty runs of the same commit: ten pass and ten fail, depending on the hash seed; with sorted, all twenty pass" h={330}>
      <MiniMap lit={['tests']} />
      <g opacity={fade(t, 0.2)}>
        <rect x={30} y={54} width={540} height={58} rx={10} fill={C.espresso} stroke={C.mocha} />
        <T x={44} y={78} s={13} f={C.crema}>assert list({'{'}clean(r) for r in ROWS{'}'})</T>
        <T x={44} y={100} s={13} f={C.crema}>{'    == ["paid", "refunded"]'}</T>
      </g>
      <T x={30} y={146} s={13} f={C.latte} o={fade(t, 0.6)}>same commit, 20 runs (hash seeds 0 to 19)</T>
      {dots(172, FLAKY, 0.6, 0.1)}
      <T x={570} y={210} s={15} a="end" f={C.crema} w={700} o={fade(t, 2.8)}>10 pass, 10 fail</T>
      <g opacity={fade(t, 3.2)}>
        <T x={30} y={246} s={13} f={C.latte}>sorted(...) instead of list(...)</T>
      </g>
      {dots(268, 'P'.repeat(20), 3.2, 0.03)}
      <T x={570} y={306} s={15} a="end" f={C.crema} w={700} o={fade(t, 3.9)}>20 pass</T>
      <T x={30} y={306} s={13} f={C.taupe} o={fade(t, 3.7)}>re-run until green = a broken alarm</T>
    </Svg>
  );
}

// 7 · Predict: a version number is a promise. Question: the dial at 1.5.0 and three change cards; answer: the dial turns.
const CARDS = [
  ['fix: blank lines skipped', '1.5.1'],
  ['add: optional top_n=', '1.6.0'],
  ['rename status → order_status', '2.0.0'],
];
export function VersionDial({ t, answer }: StepCtx) {
  const shown = answer !== null;
  const digits = shown ? ['2', '0', '0'] : ['1', '5', '0'];
  const names = ['MAJOR', 'MINOR', 'PATCH'];
  return (
    <Svg label="A version dial at 1.5.0 and three changes: a fix gives 1.5.1, an addition 1.6.0; the renamed column gives 2.0.0, with minor and patch reset to 0" h={350}>
      <MiniMap lit={['publish']} />
      <T x={300} y={72} s={15} a="middle" f={C.latte}>shopclean</T>
      {digits.map((d, i) => {
        const x = 125 + i * 130;
        const hot = shown && i === 0;
        return (
          <g key={names[i]} opacity={shown ? 1 : fade(t, 0.1 + i * 0.1)}>
            <rect x={x} y={84} width={110} height={70} rx={14} fill={C.espresso} stroke={hot ? C.caramel : C.taupe} strokeWidth={hot ? 3 : 1.5} />
            <T x={x + 55} y={133} s={30} a="middle" f={hot ? C.caramel : C.crema} serif w={700}>{d}</T>
            <T x={x + 55} y={176} s={13} a="middle" f={C.taupe}>{names[i]}</T>
          </g>
        );
      })}
      {shown && <T x={375} y={196} s={13} a="middle" f={C.taupe}>reset to 0</T>}
      {CARDS.map(([label, v], i) => {
        const y = 212 + i * 46;
        const last = i === 2;
        const o = shown ? 1 : fade(t, 0.3 + i * 0.2);
        return (
          <g key={label} opacity={o}>
            <rect x={30} y={y} width={540} height={38} rx={12} fill={C.espresso} stroke={last ? C.caramel : C.mocha} strokeWidth={last ? 2.5 : 1.5} />
            <T x={46} y={y + 25} s={15} f={C.crema}>{label}</T>
            {last && !shown ? <T x={554} y={y + 28} s={24} a="end" f={C.caramel} serif w={700}>?</T> : <T x={554} y={y + 25} s={17} a="end" f={last ? C.caramel : C.crema} w={700}>{v}</T>}
          </g>
        );
      })}
    </Svg>
  );
}

// 8 · Predict: works on my machine. The loose range reaches the whole shelf.
const CRATES = ['1.4.0', '1.5.0', '2.0.0'];
export function WorksOnMyMachine({ t, answer }: StepCtx) {
  const shown = answer !== null;
  const a = shown ? 1 : fade(t, 0.3);
  const cx = (i: number) => 100 + i * 120;
  return (
    <Svg label="requirements.txt says shopclean at least 1.4, a loose branch reaching every version on the package index; the laptop got 1.5.0 last week, today a clean CI machine reaches for 2.0.0 and the app fails with a missing-key error" h={350}>
      <MiniMap lit={['build']} />
      <g opacity={a}>
        <rect x={30} y={60} width={240} height={50} rx={6} fill={C.roast} stroke={C.latte} strokeWidth={2} />
        <T x={46} y={80} s={13} f={C.latte}>requirements.txt</T>
        <T x={46} y={101} s={15} f={C.crema}>shopclean{'>='}1.4</T>
      </g>
      {CRATES.map((c, i) => {
        const hit = shown && i === 2;
        const o = shown ? (i === 2 ? 1 : 0.35) : 1;
        return (
          <g key={c}>
            <path d={`M 150 110 Q ${150 + (cx(i) + 50 - 150) * 0.2} 132 ${cx(i) + 50} 150`} fill="none" stroke={C.cinnamon} strokeWidth={hit ? 4 : 2.5} strokeDasharray={hit ? undefined : '7 6'} opacity={a * o} />
            <g opacity={fade(t, 0.5 + i * 0.15) * (shown ? 1 : 1)}>
              <rect x={cx(i)} y={150} width={100} height={44} rx={8} fill={C.espresso} stroke={hit ? C.cinnamon : C.taupe} strokeWidth={hit ? 3 : 1.5} />
              <T x={cx(i) + 50} y={178} s={15} a="middle" f={hit ? C.crema : C.latte} w={hit ? 700 : 500}>{c}</T>
            </g>
          </g>
        );
      })}
      <T x={450} y={178} s={13} f={C.latte} o={fade(t, 0.9)}>new today</T>
      <T x={100} y={222} s={13} f={C.taupe} o={fade(t, 0.9)}>package index</T>
      {shown && (
        <g>
          <T x={300} y={84} s={13} f={C.latte}>{'>='}1.4,{'<'}2 → 1.5.0</T>
          <T x={300} y={104} s={13} f={C.latte}>~=1.4 → 1.5.0</T>
        </g>
      )}
      <g opacity={fade(t, 0.8)}>
        <rect x={30} y={244} width={250} height={62} rx={12} fill={C.espresso} stroke={C.crema} strokeWidth={2} />
        <T x={46} y={270} s={13} f={C.latte}>laptop</T>
        <T x={46} y={290} s={13} f={C.latte}>last week</T>
        <T x={196} y={282} s={17} a="end" f={C.crema} w={700}>1.5.0</T>
        <Tok x={238} y={275} n="0" r={16} />
        <rect x={320} y={244} width={250} height={62} rx={12} fill={C.espresso} stroke={shown ? C.cherryText : C.crema} strokeWidth={2} />
        <T x={336} y={270} s={13} f={C.latte}>CI machine</T>
        <T x={336} y={290} s={13} f={C.latte}>clean, today</T>
        {shown ? (
          <>
            <T x={486} y={282} s={17} a="end" f={C.crema} w={700}>2.0.0</T>
            <Tok x={528} y={275} n="1" r={16} bad />
            <T x={570} y={334} s={13} a="end" f={C.cherryText}>KeyError: 'status'</T>
          </>
        ) : (
          <T x={470} y={290} s={26} a="middle" f={C.caramel} serif w={700}>?</T>
        )}
      </g>
    </Svg>
  );
}

// 9 · A lock file freezes the tree; a republished file is refused.
export function LockFile({ t }: StepCtx) {
  const tab = fade(t, 0.2, 0.5);
  const e = easeInOut(seg(t, 0.8, 1.4)); // the loose cinnamon branch straightens and turns crema
  const ring = fade(t, 1.4);
  const kids = ['iniconfig', 'packaging', 'pluggy', 'pygments'];
  const slide = easeOut(seg(t, 2.8, 3.3));
  const refused = fade(t, 3.3);
  const wiggle = (1 - e) * 36;
  return (
    <Svg label="The lock file names shopclean 1.5.0 and the hash of its exact file; the dependency tree is frozen; a republished 1.5.0 with different bytes is stopped at a hash mismatch" h={400}>
      <MiniMap lit={['build']} />
      <g opacity={tab}>
        <rect x={30} y={56} width={540} height={62} rx={6} fill={C.roast} stroke={C.latte} strokeWidth={2} />
        <T x={46} y={82} s={15} f={C.crema}>shopclean==1.5.0 \</T>
        <T x={46} y={104} s={13} f={C.latte}>{'    --hash=sha256:c939baf79b61…'}</T>
      </g>
      <Box x={30} y={140} w={200} label="load_orders" ls={13} o={tab} />
      <path d={`M 130 184 Q ${130 + wiggle} 204 130 224`} fill="none" stroke={C.cinnamon} strokeWidth={3} strokeDasharray="7 6" opacity={1 - e} />
      <path d={`M 130 184 L 130 224`} fill="none" stroke={C.crema} strokeWidth={3} opacity={e} />
      <Box x={30} y={224} w={200} label="shopclean 1.5.0" ls={13} o={tab} stroke={C.crema} />
      <rect x={22} y={216} width={216} height={60} rx={16} fill="none" stroke={C.caramel} strokeWidth={3} opacity={ring} />
      <T x={30} y={298} s={13} f={C.latte} o={ring}>same version, same bytes</T>
      <Box x={320} y={140} w={250} label="pytest 9.1.1" ls={13} o={tab} />
      {kids.map((k, i) => {
        const x = 320 + (i % 2) * 130;
        const y = 196 + Math.floor(i / 2) * 42;
        const o = fade(t, 1.8 + i * 0.15);
        return (
          <g key={k} opacity={o}>
            <Line x1={445} y1={184} x2={x + 60} y2={y} c={C.crema} w={2} />
            <rect x={x} y={y} width={120} height={34} rx={8} fill={C.espresso} stroke={C.crema} strokeWidth={1.5} />
            <T x={x + 60} y={y + 22} s={13} a="middle" f={C.crema}>{k}</T>
          </g>
        );
      })}
      <T x={320} y={296} s={13} f={C.latte} o={fade(t, 2.4)}>the gate's tools:</T>
      <T x={320} y={314} s={13} f={C.latte} o={fade(t, 2.4)}>5 pins, 5 hashes</T>
      <g opacity={fade(t, 2.7)}>
        <g transform={`translate(${lerp(600, 330, slide)} 332)`}>
          <rect width={120} height={36} rx={8} fill={C.espresso} stroke={C.latte} strokeWidth={2} />
          <T x={60} y={16} s={13} a="middle" f={C.crema}>1.5.0</T>
          <T x={60} y={32} s={13} a="middle" f={C.latte} o={0.9}>republished</T>
        </g>
        <rect x={316} y={326} width={8} height={48} rx={3} fill={C.cherry} opacity={refused} />
      </g>
      <T x={30} y={356} s={15} f={C.cherryText} o={refused}>hash mismatch → refused,</T>
      <T x={30} y={376} s={15} f={C.cherryText} o={refused}>exit 1</T>
    </Svg>
  );
}

// 10 · Recap in one breath.
const RECAP = [
  ['Review', 'design first; small; approve if better'],
  ['Unit tests', 'one case per input; fail on the bug'],
  ['CI', 'the first non-zero exit stops the job'],
  ['shell: bash', "adds pipefail; the default doesn't"],
  ['Flaky', 'fix the uncontrolled state'],
  ['SemVer', 'fix 1.5.1 · add 1.6.0 · break 2.0.0'],
  ['Ranges and pins', 'library: <2; application: =='],
  ['Lock', 'exact versions, hashes, same bytes'],
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
            <rect x={30} y={y} width={540} height={53} rx={11} fill={C.roast} />
            <T x={50} y={y + 22} s={16} f={C.caramel} serif w={700}>{k}</T>
            <T x={50} y={y + 43} s={14} f={C.crema}>{v}</T>
          </g>
        );
      })}
    </Svg>
  );
}
