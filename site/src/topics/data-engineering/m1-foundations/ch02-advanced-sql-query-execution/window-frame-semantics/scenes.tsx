import type { StepCtx } from '../../../../../reels/types';
import { clamp, easeOut, seg } from '../../../../../reels/anim';
import { C, Svg, T } from '../../../../../reels/kit';

// Colour grammar: caramel = the frame / the current row, cherryText = the tie trap, crema = data, latte = labels.
// One customer's orders: amounts 100, 50, 25, 10; the 50 and 25 share a timestamp (they are peers).

const AMT = [100, 50, 25, 10];
const TS = ['t1', 't2', 't2', 't3'];
const X = (i: number) => 40 + i * 130;

function Strip({ cur = -1, from = 0, to = -1, peers = false, o = 1 }: { cur?: number; from?: number; to?: number; peers?: boolean; o?: number }) {
  return (
    <g opacity={o}>
      {AMT.map((a, i) => (
        <g key={i}>
          <rect x={X(i)} y={70} width={100} height={64} rx={10} fill={C.cocoa} stroke={i === cur ? C.caramel : peers && TS[i] === 't2' ? C.cherryText : C.mocha} strokeWidth={i === cur ? 3 : 1.5} />
          <T x={X(i) + 50} y={98} s={18} f={C.crema} a="middle" w={600}>{String(a)}</T>
          <T x={X(i) + 50} y={122} s={13} f={C.latte} a="middle">{TS[i]}</T>
        </g>
      ))}
      {to >= from && <rect x={X(from) - 6} y={62} width={X(to) - X(from) + 112} height={80} rx={14} fill="none" stroke={C.caramel} strokeWidth={3} />}
    </g>
  );
}

// 1 · Filmstrip.
export function Filmstrip({ t }: StepCtx) {
  const cur = Math.min(3, Math.floor(t / 0.9));
  return (
    <Svg label="A window function keeps every row and gives each its own answer" h={240}>
      <Strip cur={cur} from={0} to={cur} />
      {AMT.map((_, i) => <T key={i} x={X(i) + 50} y={176} s={14} f={C.caramel} a="middle" o={i <= cur ? 1 : 0.2}>{String([100, 150, 175, 185][i])}</T>)}
      <T x={20} y={36} s={14} f={C.latte}>every order keeps its own row</T>
    </Svg>
  );
}

// 2 · Three parts.
export function ThreeParts({ t }: StepCtx) {
  const parts = [['PARTITION BY', 'independent groups'], ['ORDER BY', 'the order inside a group'], ['frame', 'ROWS / RANGE / GROUPS: the slice one row sees']];
  return (
    <Svg label="Partition, order and frame" h={280}>
      {parts.map((p, i) => (
        <g key={p[0]} opacity={easeOut(seg(t, i * 0.8, i * 0.8 + 0.7))}>
          <T x={25} y={60 + i * 70} s={18} f={C.caramel} w={700}>{p[0]}</T>
          <T x={25} y={86 + i * 70} s={14} f={C.latte}>{p[1]}</T>
        </g>
      ))}
    </Svg>
  );
}

// 3 · Rows vs range.
export function RowsVsRange({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.4, 1.4));
  const b = easeOut(seg(t, 2.0, 3.0));
  return (
    <Svg label="ROWS stops at the current row; RANGE extends to its last peer" h={330}>
      <T x={20} y={34} s={14} f={C.caramel} w={700}>ROWS: current row 50</T>
      <g transform="translate(0 -26)"><Strip cur={1} from={0} to={1} peers o={a} /></g>
      <T x={20} y={196} s={14} f={C.cherryText} w={700}>RANGE: reaches the last peer</T>
      <g transform="translate(0 134)"><Strip cur={1} from={0} to={2} peers o={b} /></g>
    </Svg>
  );
}

// 4 · Predict.
export function TiePredict({ t, answer }: StepCtx) {
  const answered = answer !== null;
  return (
    <Svg label="Running totals when two rows tie on the ordering key" h={280}>
      <Strip peers cur={-1} />
      {!answered ? (
        <T x={300} y={200} s={48} f={C.caramel} a="middle" o={0.75 + 0.25 * Math.sin(t * 3)}>?</T>
      ) : (
        AMT.map((_, i) => <T key={i} x={X(i) + 50} y={190} s={20} f={TS[i] === 't2' ? C.cherryText : C.caramel} a="middle" w={700}>{String([100, 175, 175, 185][i])}</T>)
      )}
    </Svg>
  );
}

// 5 · Peer frame.
export function PeerFrame({ t }: StepCtx) {
  const cur = Math.min(3, Math.floor(t / 0.9));
  const last = TS[cur] === 't2' ? 2 : cur;
  return (
    <Svg label="The default frame reaches the last peer, so the total steps once per distinct timestamp" h={260}>
      <Strip cur={cur} from={0} to={last} peers />
      {AMT.map((_, i) => <T key={i} x={X(i) + 50} y={190} s={18} f={C.cherryText} a="middle" o={i <= cur ? 1 : 0.2}>{String([100, 175, 175, 185][i])}</T>)}
    </Svg>
  );
}

// 6 · Rows fix.
export function RowsFix({ t }: StepCtx) {
  const cur = Math.min(3, Math.floor(t / 0.9));
  return (
    <Svg label="With a unique order and ROWS, each row advances the total by itself" h={260}>
      <Strip cur={cur} from={0} to={cur} peers />
      {AMT.map((_, i) => <T key={i} x={X(i) + 50} y={190} s={18} f={C.caramel} a="middle" o={i <= cur ? 1 : 0.2}>{String([100, 150, 175, 185][i])}</T>)}
      <T x={300} y={236} s={13} f={C.latte} a="middle">ORDER BY event_time, order_id · ROWS</T>
    </Svg>
  );
}

// 7 · Groups.
export function Groups({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.6, 1.6));
  return (
    <Svg label="The four orders form three peer groups; GROUPS counts them as units" h={260}>
      <Strip peers />
      <rect x={X(0) - 6} y={60} width={112} height={84} rx={12} fill="none" stroke={C.caramel} strokeDasharray="5 4" opacity={a} />
      <rect x={X(1) - 6} y={60} width={242} height={84} rx={12} fill="none" stroke={C.caramel} strokeDasharray="5 4" opacity={a} />
      <rect x={X(3) - 6} y={60} width={112} height={84} rx={12} fill="none" stroke={C.caramel} strokeDasharray="5 4" opacity={a} />
      <T x={300} y={190} s={16} f={C.caramel} a="middle" o={a}>3 peer groups: 1 PRECEDING = one group back</T>
    </Svg>
  );
}

// 8 · Exclude.
export function Exclude({ t }: StepCtx) {
  const rows = [['EXCLUDE CURRENT ROW', 'drops the row itself'], ['EXCLUDE GROUP', 'drops the row and its peers'], ['EXCLUDE TIES', 'drops the peers, keeps the row']];
  return (
    <Svg label="The three EXCLUDE options" h={280}>
      {rows.map((r, i) => (
        <g key={r[0]} opacity={easeOut(seg(t, i * 0.8, i * 0.8 + 0.7))}>
          <T x={25} y={60 + i * 70} s={17} f={C.caramel} w={700}>{r[0]}</T>
          <T x={25} y={86 + i * 70} s={14} f={C.latte}>{r[1]}</T>
        </g>
      ))}
    </Svg>
  );
}

// 9 · Named windows.
export function Named({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.4, 1.2));
  const b = easeOut(seg(t, 1.6, 2.4));
  return (
    <Svg label="A named window is defined once and reused" h={260}>
      <T x={25} y={44} s={15} f={C.caramel} w={700} o={a}>WINDOW w AS (PARTITION BY … ORDER BY … ROWS …)</T>
      <T x={25} y={100} s={15} f={C.crema} o={b}>SUM(amount) OVER w</T>
      <T x={25} y={132} s={15} f={C.crema} o={b}>COUNT(*) OVER w</T>
      <T x={25} y={190} s={13} f={C.latte} o={easeOut(seg(t, 2.6, 3.2))}>OVER (w …) extends it, unless w already has a frame</T>
    </Svg>
  );
}

// 10 · No nesting.
export function NoNesting({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.4, 1.4));
  const b = easeOut(seg(t, 2.0, 3.0));
  return (
    <Svg label="One window layer on another is refused; a CTE between them works" h={300}>
      <rect x={25} y={40} width={250} height={60} rx={8} fill={C.cocoa} stroke={C.cherryText} strokeWidth={2} opacity={a} />
      <T x={150} y={64} s={13} f={C.crema} a="middle" o={a}>RANK() OVER (… SUM() OVER …)</T>
      <T x={150} y={86} s={13} f={C.cherryText} a="middle" o={a}>cannot be nested</T>
      <g opacity={b}>
        <rect x={310} y={40} width={260} height={50} rx={8} fill={C.cocoa} stroke={C.caramel} />
        <T x={440} y={70} s={13} f={C.crema} a="middle">outer: RANK() OVER (…)</T>
        <line x1={440} y1={90} x2={440} y2={120} stroke={C.caramel} strokeWidth={2} />
        <rect x={310} y={120} width={260} height={50} rx={8} fill={C.cocoa} stroke={C.caramel} />
        <T x={440} y={150} s={13} f={C.crema} a="middle">CTE: SUM() OVER …</T>
      </g>
    </Svg>
  );
}

// 11 · Predict staging.
export function StagePredict({ t, answer }: StepCtx) {
  const answered = answer !== null;
  return (
    <Svg label="Rank a running total by staging it through a CTE" h={260}>
      <rect x={30} y={60} width={220} height={50} rx={8} fill={C.cocoa} stroke={C.mocha} />
      <T x={140} y={90} s={13} f={C.crema} a="middle">running total (window)</T>
      <rect x={330} y={60} width={220} height={50} rx={8} fill={C.cocoa} stroke={C.mocha} />
      <T x={440} y={90} s={13} f={C.crema} a="middle">RANK() (window)</T>
      {!answered ? <T x={290} y={92} s={36} f={C.caramel} a="middle" o={0.75 + 0.25 * Math.sin(t * 3)}>?</T> : <><line x1={250} y1={85} x2={330} y2={85} stroke={C.caramel} strokeWidth={3} /><T x={290} y={52} s={13} f={C.caramel} a="middle">CTE boundary</T></>}
    </Svg>
  );
}

// 12 · Verdict.
export function Verdict({ t }: StepCtx) {
  const rows = [['ties possible', 'unique ORDER BY + ROWS'], ['shared definition', 'WINDOW w AS (…)'], ['window of a window', 'stage with a CTE']];
  return (
    <Svg label="Three habits for window frames" h={280}>
      {rows.map((r, i) => (
        <g key={r[0]} opacity={easeOut(seg(t, i * 0.6, i * 0.6 + 0.7))}>
          <T x={25} y={60 + i * 76} s={14} f={C.latte}>{r[0]}</T>
          <T x={25} y={92 + i * 76} s={20} f={C.caramel} w={700}>{r[1]}</T>
        </g>
      ))}
    </Svg>
  );
}

export function ProveRows({ t, answer }: StepCtx) {
  const answered = answer !== null;
  return (
    <Svg label="The frame mode that ignores ties" h={240}>
      <T x={40} y={100} s={18} f={C.latte}>ignores ties →</T>
      {answered ? <T x={230} y={104} s={26} f={C.caramel} w={700}>ROWS</T> : <T x={240} y={110} s={40} f={C.caramel} o={0.75 + 0.25 * Math.sin(t * 3)}>?</T>}
    </Svg>
  );
}
export function ProveDefault({ t, answer }: StepCtx) {
  const answered = answer !== null;
  return (
    <Svg label="The default frame" h={240}>
      <Strip cur={1} from={0} to={2} peers o={clamp(1)} />
      {!answered && <T x={300} y={200} s={36} f={C.caramel} a="middle" o={0.75 + 0.25 * Math.sin(t * 3)}>?</T>}
    </Svg>
  );
}
