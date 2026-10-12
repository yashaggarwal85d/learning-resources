import type { ReactNode } from 'react';
import type { StepCtx } from '../../../../../reels/types';
import { Code } from '../../../../../reels/Code';
import { clamp, easeInOut, easeOut, easeOutBack, lerp, seg } from '../../../../../reels/anim';
import { C, Svg, T } from '../../../../../reels/kit';
import { RefresherList } from '../refreshers';

// Every number shown here comes from examples.sh and is asserted in examples.py.
// The reel's frame is the four stages a change passes (review, tests, CI, release), drawn as a one-line strip.
// A plain text strip at the top of steps 2-9 (always the same place) shows which stage the step is about; step 1 says what it is. The exit-status token is the shell refresher's
// round token (crema = 0, cherry = non-zero). Colour keeps one meaning: crema = values as they are, latte = secondary labels,
// taupe = belt, waiting and skipped, caramel = the thing to look at, cinnamon = the drifting alternative (large shapes only),
// cherry fill with cherryText labels = a bad outcome. At most two accents in a step.
// Predict steps: the player does not restart the clock when the learner answers, so an answer frame is a finished picture
// (a pure function of `answer`); only the question frame animates.

const pop = (t: number, at: number) => clamp(easeOutBack(seg(t, at, at + 0.4)));
const fade = (t: number, at: number, len = 0.4) => clamp(easeOut(seg(t, at, at + len)));

const GATES = ['review', 'tests', 'CI', 'release'] as const;
type Gate = (typeof GATES)[number];

/** The step's frame: everything starts at the top, so the strip is in the same place on every step. */
const Stack = ({ children }: { children: ReactNode }) => <div className="flex h-full w-full flex-col gap-3 landscape:gap-5">{children}</div>;

/** The strip: where in the delivery loop this step sits. A plain line of text at the top of every step (the current word in caramel). */
function Strip({ lit }: { lit: Gate }) {
  return (
    <p className="shrink-0 text-center font-mono text-[0.75rem] tracking-wide" style={{ color: C.taupe }}>
      {GATES.map((g, i) => (
        <span key={g}>
          {i > 0 && ' · '}
          <span style={{ color: g === lit ? C.caramel : C.latte, fontWeight: g === lit ? 700 : 400 }}>{g}</span>
        </span>
      ))}
    </p>
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
const RUNGS = ['design: most important', 'functionality', 'complexity', 'tests', 'naming, comments', 'style: "Nit:", optional'];
const RUNG_W = [520, 470, 470, 470, 470, 400]; // only design (first) and style (last) are ranked by the source
export function Review({ t }: StepCtx) {
  const bar = fade(t, 3.0);
  const ticks = fade(t, 3.4);
  const X0 = 30;
  const scale = (n: number) => X0 + (n / 1000) * 540;
  return (
    <Stack>
      <Strip lit="review" />
      <Svg auto label="A review funnel in reading order: design first and widest, style last and narrowest, marked Nit and optional; under it a size bar from 100 lines, reasonable, to 1,000, usually too large" h={380}>
        {RUNGS.map((r, i) => {
          const a = pop(t, 0.4 + i * 0.3);
          const w = RUNG_W[i] * a;
          const first = i === 0;
          const last = i === RUNGS.length - 1;
          const y = 8 + i * 44;
          return (
            <g key={r}>
              <rect x={300 - w / 2} y={y} width={Math.max(0, w)} height={36} rx={12} fill={first ? C.caramel : C.espresso} fillOpacity={first ? 0.16 : 1} stroke={first ? C.caramel : C.taupe} strokeWidth={first ? 2.5 : 1.5} />
              <T x={300 - RUNG_W[i] / 2 + 16} y={y + 24} s={15} f={last ? C.latte : C.crema} w={first ? 700 : 500} o={clamp(a * 1.5)}>{r}</T>
            </g>
          );
        })}
        <g opacity={bar}>
          <T x={X0} y={310} s={13} f={C.latte}>PR SIZE, LINES CHANGED</T>
          <rect x={X0} y={324} width={540} height={14} rx={7} fill={C.cocoa} />
          <rect x={X0} y={324} width={scale(100) - X0} height={14} rx={7} fill={C.caramel} fillOpacity={0.55} />
        </g>
        <g opacity={ticks}>
          <rect x={scale(100) - 2} y={316} width={4} height={30} rx={2} fill={C.caramel} />
          <rect x={scale(1000) - 4} y={316} width={4} height={30} rx={2} fill={C.cherry} />
          <T x={X0} y={372} s={13} f={C.latte}>{'≈100 lines: reasonable'}</T>
          <T x={570} y={372} s={13} f={C.cherryText} a="end">1,000: usually too large</T>
        </g>
      </Svg>
    </Stack>
  );
}

// 3 · A unit test pins the bug: the same six tests on the real clean() and on commit 731's.
// On a phone the code panel and the table take turns (the table needs the whole width); on a wide screen they share the frame.
const TEST_ROWS = ["'paid'", "'Paid'", "'SHIPPED '", "' refunded'", 'padded email', 'main() on a file'];
const ON_731 = [true, true, false, false, false, false]; // Paid still passes: lower() fixes the case
const SWAP = 1.3;
export function UnitTest({ t, portrait }: StepCtx) {
  const LX = 290;
  const RX = 470;
  const d = portrait ? SWAP : 0;
  const codeOnly = portrait && t < SWAP;
  const code = (
    <Code
      title="tests/test_clean.py"
      t={t}
      end={0.7}
      lines={["@pytest.mark.parametrize('raw, expected', CASES)", 'def test_clean_status(raw, expected):', '    assert clean(raw) == expected']}
    />
  );
  const table = (
    <Svg fill={!portrait} auto={portrait} label="Six tests: the four cases above, the Git refresher's email oracle and a main test on a fixture file; all six pass on the real clean, and on commit 731's clean the four with padded input fail and the two without pass" h={316}>
      <T x={LX} y={16} s={15} a="middle" f={C.crema} o={fade(t, d + 0.1)}>strip().lower()</T>
      <T x={RX} y={16} s={15} a="middle" f={C.cherryText} o={fade(t, d + 1.2)}>731: lower()</T>
      {TEST_ROWS.map((r, i) => {
        const y = 46 + i * 32;
        return (
          <g key={r}>
            <T x={30} y={y + 5} s={15} f={C.latte} o={fade(t, d + 0.1 + i * 0.1)}>{r}</T>
            <Tok x={LX} y={y} n="✓" r={14} o={pop(t, d + 0.2 + i * 0.12)} />
            {ON_731[i] ? <Tok x={RX} y={y} n="✓" r={14} o={pop(t, d + 1.4 + i * 0.14)} /> : <Tok x={RX} y={y} n="✕" r={14} bad o={pop(t, d + 1.4 + i * 0.14)} />}
          </g>
        );
      })}
      <g opacity={fade(t, d + 0.9)}>
        <T x={LX} y={250} s={15} a="middle" f={C.crema} w={700}>6 passed</T>
        <T x={LX} y={280} s={13} a="middle" f={C.latte}>exit 0</T>
      </g>
      <g opacity={fade(t, d + 2.5)}>
        <T x={RX} y={250} s={15} a="middle" f={C.cherryText} w={700}>4 failed</T>
        <T x={RX} y={280} s={15} a="middle" f={C.crema} w={700}>2 passed</T>
        <T x={RX} y={310} s={13} a="middle" f={C.cherryText}>exit 1</T>
      </g>
    </Svg>
  );
  return (
    <Stack>
      <Strip lit="tests" />
      {codeOnly ? code : portrait ? table : (<>{code}{table}</>)}
    </Stack>
  );
}

// 4 · CI: a chain of exit statuses. Two runs of one gate.yml.
export function CiChain({ t }: StepCtx) {
  const boxes = fade(t, 0.2);
  const skipped = easeOut(seg(t, 1.9, 2.3));
  const Col = ({ x, bad, title }: { x: number; bad: boolean; title: string }) => {
    const ys = [40, 108, 176];
    const names = ['install tools', 'pytest -q', 'pipeline | diff'];
    // token times: left 0, right 0, left 0, right 1, (right skipped), left 0
    const at = bad ? [0.9, 1.5] : [0.6, 1.2, 2.2];
    return (
      <g>
        <T x={x} y={20} s={15} f={C.crema} o={boxes}>{title}</T>
        {ys.map((y, i) => {
          const isSkip = bad && i === 2;
          return (
            <g key={names[i]}>
              {i > 0 && <Line x1={x + 98} y1={ys[i - 1] + 50} x2={x + 98} y2={y} c={C.mocha} o={boxes} w={2} />}
              <Box x={x} y={y} w={196} h={50} label={names[i]} ls={15} o={boxes * (isSkip ? 1 - skipped : 1)} stroke={bad && i === 1 ? C.cherryText : C.crema} />
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
          <rect x={x} y={250} width={150} height={32} rx={16} fill={bad ? C.cherry : C.espresso} stroke={bad ? C.cherryText : C.caramel} strokeWidth={2.5} />
          <T x={x + 75} y={272} s={15} a="middle" f={bad ? C.crema : C.caramel} w={700}>{bad ? 'gate red' : 'gate green'}</T>
        </g>
        <g opacity={fade(t, 3.0)}>
          {bad ? (
            <>
              <T x={x} y={314} s={13} f={C.cherryText}>merge blocked:</T>
              <T x={x} y={332} s={13} f={C.cherryText}>required check failed</T>
            </>
          ) : (
            <T x={x} y={314} s={13} f={C.crema}>merge enabled</T>
          )}
        </g>
      </g>
    );
  };
  return (
    <Stack>
      <Strip lit="CI" />
      <Svg auto label="Two runs of the same job: the fix passes install, tests and diff and may merge; commit 731 fails the tests with exit 1, the diff step is skipped and the merge is blocked" h={345}>
        <Col x={30} bad={false} title="fix: restore strip()" />
        <Col x={320} bad title="regression: 731" />
      </Svg>
    </Stack>
  );
}

// 5 · Predict: which shell runs your step? Question: three boxes and a "?"; answer: the two shells side by side.
export function WhichShell({ t, answer, portrait }: StepCtx) {
  const shown = answer !== null;
  const pipeline = (ty: number, o: (i: number) => number) => (
    <>
      {['jq', 'sort', 'uniq -c'].map((n, i) => (
        <g key={n}>
          <Box x={15 + i * 200} y={10} w={170} h={54} label={n} o={o(i)} stroke={i === 0 ? C.cherryText : C.crema} />
          {i < 2 && <Line x1={185 + i * 200} y1={37} x2={215 + i * 200} y2={37} c={C.taupe} w={3} o={o(i)} />}
          <Tok x={100 + i * 200} y={ty} n={i === 0 ? '2' : '0'} bad={i === 0} o={o(i)} />
        </g>
      ))}
    </>
  );
  const lines = ['runs-on: ubuntu-latest', 'steps:', '  - run: jq -r .status missing.jsonl | sort | uniq -c', '    # no shell: set, so GitHub runs: bash -e {0}'];
  return (
    <Stack>
      <Strip lit="CI" />
      {!(portrait && shown) && (
        <Code title=".github/workflows/gate.yml" t={shown ? 10 : t} end={0.6} lines={portrait ? lines.slice(2) : lines} highlight={[portrait ? 0 : 2]} />
      )}
      {!shown ? (
        <Svg fill label="Three commands in a pipeline: jq exits 2, sort and uniq exit 0; does the step pass or fail?" h={200}>
          {pipeline(104, (i) => fade(t, 0.2 + i * 0.25))}
          <T x={15} y={174} s={15} f={C.latte} o={fade(t, 0.8)}>the step's verdict:</T>
          <g transform={`translate(345 168) scale(${pop(t, 0.8)})`}>
            <circle r={24} fill={C.espresso} stroke={C.caramel} strokeWidth={3} />
            <T x={0} y={9} s={28} a="middle" f={C.caramel} serif w={700}>?</T>
          </g>
        </Svg>
      ) : (
        <Svg auto label="With no shell set the step runs bash -e and passes with status 0, hiding the failure; with shell bash it runs with pipefail and fails with status 2" h={262}>
          {pipeline(88, () => 1)}
          <g>
            <rect x={15} y={118} width={570} height={62} rx={12} fill="none" stroke={C.cherryText} strokeWidth={2} />
            <T x={32} y={144} s={15} f={C.crema}>no shell:</T>
            <T x={32} y={166} s={13} f={C.latte}>bash -e {'{0}'}</T>
            <Tok x={300} y={150} n="0" />
            <T x={344} y={144} s={13} f={C.cherryText}>passes: the failure</T>
            <T x={344} y={166} s={13} f={C.cherryText}>is hidden</T>
          </g>
          <g>
            <rect x={15} y={194} width={570} height={62} rx={12} fill="none" stroke={C.caramel} strokeWidth={2.5} />
            <T x={32} y={220} s={15} f={C.crema}>shell: bash</T>
            <T x={32} y={242} s={13} f={C.latte}>-eo pipefail</T>
            <Tok x={300} y={226} n="2" bad />
            <T x={344} y={220} s={13} f={C.caramel}>fails, as it should</T>
            <T x={344} y={242} s={13} f={C.caramel}>status 2</T>
          </g>
        </Svg>
      )}
    </Stack>
  );
}

// 6 · Flaky: the same set in two orders, twenty runs of the same commit, then the fixed test.
const FLAKY = 'FFPPFFPFFPFFPPPFPPFP'; // examples.sh: PYTHONHASHSEED 0..19
export function Flaky({ t }: StepCtx) {
  const dots = (y: number, pattern: string, start: number, step: number) =>
    pattern.split('').map((p, i) => {
      const a = pop(t, start + i * step);
      const ok = p === 'P';
      return (
        <g key={i} transform={`translate(${34 + i * 28} ${y}) scale(${a})`}>
          <circle r={11} fill={ok ? C.espresso : C.cherry} stroke={ok ? C.crema : C.cherryText} strokeWidth={2} />
          <path d={ok ? 'M -4.5 0 L -1.5 3.5 L 5 -4' : 'M -4 -4 L 4 4 M 4 -4 L -4 4'} fill="none" stroke={C.crema} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
        </g>
      );
    });
  return (
    <Stack>
      <Strip lit="tests" />
      <Svg auto label="The same set gives two orders under two hash seeds, and the test fails on one; twenty runs of the same commit: ten pass and ten fail; with sorted, all twenty pass" h={336}>
        <g opacity={fade(t, 0.2)}>
          <rect x={30} y={6} width={540} height={58} rx={10} fill={C.espresso} stroke={C.mocha} />
          <T x={44} y={30} s={13} f={C.crema}>assert list({'{'}clean(r) for r in ROWS{'}'})</T>
          <T x={44} y={52} s={13} f={C.crema}>{'    == ["paid", "refunded"]'}</T>
        </g>
        <T x={30} y={96} s={15} f={C.cherryText} o={fade(t, 0.6)}>{"seed 1: ['refunded', 'paid']"}</T>
        <T x={570} y={96} s={15} a="end" f={C.cherryText} w={700} o={fade(t, 0.6)}>fails</T>
        <T x={30} y={120} s={15} f={C.crema} o={fade(t, 1.0)}>{"seed 2: ['paid', 'refunded']"}</T>
        <T x={570} y={120} s={15} a="end" f={C.crema} w={700} o={fade(t, 1.0)}>passes</T>
        <T x={30} y={156} s={13} f={C.latte} o={fade(t, 1.4)}>same commit, 20 runs (hash seeds 0 to 19)</T>
        {dots(182, FLAKY, 1.6, 0.1)}
        <T x={570} y={222} s={15} a="end" f={C.crema} w={700} o={fade(t, 3.8)}>10 pass, 10 fail</T>
        <T x={30} y={256} s={13} f={C.latte} o={fade(t, 4.2)}>sorted(...) instead of list(...)</T>
        {dots(282, 'P'.repeat(20), 4.2, 0.03)}
        <T x={570} y={322} s={15} a="end" f={C.crema} w={700} o={fade(t, 5.0)}>20 pass</T>
        <T x={30} y={322} s={15} f={C.latte} o={fade(t, 5.3)}>re-run until green = a broken alarm</T>
      </Svg>
    </Stack>
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
    <Stack>
      <Strip lit="release" />
      <Svg auto label="A version dial at 1.5.0 and three changes: a fix gives 1.5.1, an addition 1.6.0; the renamed column gives 2.0.0, with minor and patch reset to 0" h={312}>
        <T x={300} y={20} s={15} a="middle" f={C.latte}>shopclean</T>
        {digits.map((d, i) => {
          const x = 125 + i * 130;
          const hot = shown && i === 0;
          return (
            <g key={names[i]} opacity={shown ? 1 : fade(t, 0.1 + i * 0.1)}>
              <rect x={x} y={32} width={110} height={70} rx={14} fill={C.espresso} stroke={hot ? C.caramel : C.taupe} strokeWidth={hot ? 3 : 1.5} />
              <T x={x + 55} y={81} s={30} a="middle" f={hot ? C.caramel : C.crema} serif w={700}>{d}</T>
              <T x={x + 55} y={124} s={13} a="middle" f={C.latte}>{names[i]}</T>
            </g>
          );
        })}
        {shown && <T x={375} y={154} s={15} a="middle" f={C.caramel} w={700}>reset to 0</T>}
        {CARDS.map(([label, v], i) => {
          const y = 176 + i * 46;
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
    </Stack>
  );
}

// 8 · Predict: works on my machine. The loose range reaches the whole shelf.
const CRATES = ['1.4.0', '1.5.0', '2.0.0'];
export function WorksOnMyMachine({ t, answer }: StepCtx) {
  const shown = answer !== null;
  const a = shown ? 1 : fade(t, 0.3);
  const cx = (i: number) => 30 + i * 185;
  return (
    <Stack>
      <Strip lit="CI" />
      <Svg auto label="requirements.txt says shopclean at least 1.4, a loose branch reaching every version on the package index; the laptop got 1.5.0 last week, today a clean CI machine reaches for 2.0.0 and the app fails with a missing-key error" h={304}>
        <g opacity={a}>
          <rect x={30} y={6} width={250} height={54} rx={6} fill={C.roast} stroke={C.latte} strokeWidth={2} />
          <T x={46} y={28} s={13} f={C.latte}>requirements.txt</T>
          <T x={46} y={50} s={15} f={C.crema}>shopclean{'>='}1.4</T>
        </g>
        {CRATES.map((c, i) => {
          const hit = shown && i === 2;
          const o = shown ? (i === 2 ? 1 : 0.35) : 1;
          const tx = cx(i) + 85;
          return (
            <g key={c}>
              <path d={`M 155 60 Q ${155 + (tx - 155) * 0.2} 82 ${tx} 100`} fill="none" stroke={C.cinnamon} strokeWidth={hit ? 4 : 2.5} strokeDasharray={hit ? undefined : '7 6'} opacity={a * o} />
              <g opacity={fade(t, 0.5 + i * 0.15)}>
                <rect x={cx(i)} y={100} width={170} height={44} rx={8} fill={C.espresso} stroke={hit ? C.cinnamon : C.taupe} strokeWidth={hit ? 3 : 1.5} />
                <T x={cx(i) + 85} y={128} s={15} a="middle" f={hit ? C.crema : C.latte} w={hit ? 700 : 500}>{c}</T>
              </g>
            </g>
          );
        })}
        <T x={cx(2) + 85} y={166} s={13} a="middle" f={C.latte} o={fade(t, 0.9)}>new today</T>
        <g opacity={fade(t, 0.8)}>
          <rect x={30} y={190} width={262} height={104} rx={12} fill={C.espresso} stroke={C.crema} strokeWidth={2} />
          <T x={46} y={216} s={13} f={C.latte}>laptop, last week</T>
          <T x={46} y={258} s={17} f={C.crema} w={700}>1.5.0</T>
          <Tok x={252} y={252} n="0" r={16} />
          <rect x={308} y={190} width={262} height={104} rx={12} fill={C.espresso} stroke={shown ? C.cherryText : C.crema} strokeWidth={2} />
          <T x={324} y={216} s={13} f={C.latte}>CI machine, clean today</T>
          {shown ? (
            <>
              <T x={324} y={258} s={17} f={C.crema} w={700}>2.0.0</T>
              <Tok x={530} y={252} n="1" r={16} bad />
              <T x={324} y={284} s={13} f={C.cherryText}>KeyError: 'status'</T>
            </>
          ) : (
            <T x={440} y={262} s={26} a="middle" f={C.caramel} serif w={700}>?</T>
          )}
        </g>
      </Svg>
    </Stack>
  );
}

// 9 · A lock file freezes the tree; a republished file is refused.
export function LockFile({ t }: StepCtx) {
  const tab = fade(t, 0.2, 0.5);
  const e = easeInOut(seg(t, 0.8, 1.4)); // the loose cinnamon branch straightens and turns crema
  const ring = fade(t, 1.4);
  const slide = easeOut(seg(t, 2.2, 2.8));
  const refused = fade(t, 2.9);
  const wiggle = (1 - e) * 36;
  return (
    <Stack>
      <Strip lit="CI" />
      <Svg auto label="The lock file requirements-dev.lock names shopclean 1.5.0 and the hash of its exact file; the application's dependency is frozen to those bytes; a republished 1.5.0 with different bytes is refused at a hash mismatch" h={300}>
        <g opacity={tab}>
          <rect x={30} y={6} width={540} height={88} rx={6} fill={C.roast} stroke={C.latte} strokeWidth={2} />
          <T x={46} y={30} s={13} f={C.latte}>requirements-dev.lock</T>
          <T x={46} y={56} s={15} f={C.crema}>shopclean==1.5.0 \</T>
          <T x={46} y={80} s={13} f={C.latte}>{'    --hash=sha256:c939baf79b61…'}</T>
        </g>
        <Box x={30} y={124} w={230} h={40} label="load_orders" ls={15} o={tab} />
        <path d={`M 145 164 Q ${145 + wiggle} 184 145 204`} fill="none" stroke={C.cinnamon} strokeWidth={3} strokeDasharray="7 6" opacity={1 - e} />
        <path d="M 145 164 L 145 204" fill="none" stroke={C.crema} strokeWidth={3} opacity={e} />
        <Box x={30} y={204} w={230} h={40} label="shopclean 1.5.0" ls={15} o={tab} stroke={C.crema} />
        <rect x={22} y={196} width={246} height={56} rx={16} fill="none" stroke={C.caramel} strokeWidth={3} opacity={ring} />
        <T x={30} y={278} s={13} f={C.latte} o={ring}>same version, same bytes</T>
        <g opacity={fade(t, 2.2)}>
          <g transform={`translate(${lerp(250, 0, slide)} 0)`}>
            <rect x={340} y={124} width={230} height={56} rx={8} fill={C.espresso} stroke={C.latte} strokeWidth={2} />
            <T x={455} y={147} s={15} a="middle" f={C.crema}>1.5.0</T>
            <T x={455} y={168} s={13} a="middle" f={C.latte}>republished</T>
          </g>
        </g>
        <g opacity={refused}>
          <Line x1={455} y1={184} x2={455} y2={204} c={C.cherryText} w={3} />
          <rect x={340} y={206} width={230} height={58} rx={14} fill={C.cherry} stroke={C.cherryText} strokeWidth={2.5} />
          <T x={455} y={230} s={13} a="middle" f={C.crema}>hash mismatch</T>
          <T x={455} y={252} s={15} a="middle" f={C.crema} w={700}>refused, exit 1</T>
        </g>
      </Svg>
    </Stack>
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
  ['Ranges and pins', 'app: pin; library: floor, cap known breaks'],
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
