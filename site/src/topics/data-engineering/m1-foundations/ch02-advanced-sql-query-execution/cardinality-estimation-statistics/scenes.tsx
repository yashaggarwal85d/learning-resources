import type { StepCtx } from '../../../../../reels/types';
import { easeOut, fmt, lerp, seg } from '../../../../../reels/anim';
import { C, Decode, Plot, Reticle, Svg, T } from '../../../../../reels/kit';

// Colour grammar: C.focus/C.primary = the real numbers; C.bad/C.badText = the actual count once it has diverged
// from the estimate (the failure); C.second = the corrected estimate, paired against the broken one.

function Count({ x, y, t, from, to, start, dur = 1, s = 20, f = C.focus, a = 'end' as const }: { x: number; y: number; t: number; from: number; to: number; start: number; dur?: number; s?: number; f?: string; a?: 'start' | 'middle' | 'end' }) {
  const v = lerp(from, to, easeOut(seg(t, start, start + dur)));
  return (
    <T x={x} y={y} s={s} f={f} a={a} w={700}>
      {fmt(v)}
    </T>
  );
}

function Panel({ x, y, w, h }: { x: number; y: number; w: number; h: number }) {
  return <rect x={x} y={y} width={w} height={h} rx={6} fill={C.panel} stroke={C.line} />;
}

// 1 · Two numbers.
export function TwoNumbers({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.2, 1.2));
  const b = easeOut(seg(t, 1.6, 2.8));
  return (
    <Svg label="A healthy estimate lands within 1% of actual; a broken one is off by more than 2x" h={340}>
      <T x={25} y={28} s={13} f={C.quiet}>amount &gt; 1000</T>
      <g opacity={a}>
        <T x={25} y={54} s={13} f={C.quiet}>estimated</T>
        <Count x={575} y={54} t={t} from={0} to={994519} start={0.2} s={20} />
        <T x={25} y={82} s={13} f={C.quiet}>actual</T>
        <Count x={575} y={82} t={t} from={0} to={1003918} start={0.5} s={20} />
      </g>
      <T x={25} y={150} s={13} f={C.quiet}>cancelled and app, together</T>
      <g opacity={b}>
        <T x={25} y={176} s={13} f={C.quiet}>estimated</T>
        <Count x={575} y={176} t={t} from={0} to={138866} start={1.6} s={20} />
        <T x={25} y={204} s={13} f={C.quiet}>actual</T>
        <Count x={575} y={204} t={t} from={0} to={282940} start={1.9} s={20} f={C.badText} />
      </g>
      <T x={300} y={290} s={13} f={C.secondary} a="middle" o={easeOut(seg(t, 2.6, 3.4))}>same table, same machinery —</T>
      <T x={300} y={312} s={13} f={C.secondary} a="middle" o={easeOut(seg(t, 2.6, 3.4))}>why does only one agree?</T>
    </Svg>
  );
}

// 2 · Predict independence.
export function PredictIndependence({ t, answer }: StepCtx) {
  const a = easeOut(seg(t, 0.2, 1));
  const wA = 163, wB = 373;
  return (
    <Svg label="status=cancelled is about 16%, channel=app is about 37% — what is the AND, if independent?" h={300}>
      <g opacity={a}>
        <rect x={25} y={40} width={550} height={22} rx={4} fill={C.band} />
        <rect x={25} y={40} width={(wA / 1000) * 550} height={22} rx={4} fill={C.primary} />
        <T x={25} y={78} s={13} f={C.secondary}>status='cancelled' ≈ 16.3%</T>
        <rect x={25} y={100} width={550} height={22} rx={4} fill={C.band} />
        <rect x={25} y={100} width={(wB / 1000) * 550} height={22} rx={4} fill={C.primary} />
        <T x={25} y={138} s={13} f={C.secondary}>channel='app' ≈ 37.3%</T>
      </g>
      {answer === null ? (
        <T x={300} y={220} s={44} f={C.focus} a="middle" o={0.75 + 0.25 * Math.sin(t * 3)}>?</T>
      ) : (
        <T x={300} y={220} s={16} f={C.crema} a="middle">both at once, if independent: 16.3% × 37.3%</T>
      )}
    </Svg>
  );
}

// 3 · Reveal independence.
export function RevealIndependence({ t }: StepCtx) {
  const est = easeOut(seg(t, 0.2, 1.2));
  const act = easeOut(seg(t, 1.6, 2.8));
  return (
    <Svg label="The estimate matches the independence product; the actual count does not" h={300}>
      <g opacity={est}>
        <T x={300} y={50} s={13} f={C.quiet} a="middle">0.163 × 0.373 ≈ 0.0608 → estimate</T>
        <Decode text="138,866" t={t} at={0.4} x={300} y={85} s={24} f={C.primary} a="middle" />
      </g>
      <g opacity={act}>
        <rect x={25} y={125} width={550} height={80} rx={6} fill={C.panel} stroke={C.bad} />
        <T x={300} y={150} s={13} f={C.cherryText} a="middle">real actual count</T>
        <Count x={300} y={188} t={t} from={138866} to={282940} start={1.8} s={26} f={C.cherryText} a="middle" />
      </g>
      <Reticle x={300} y={165} w={560} h={80} t={t} at={2.4} color={C.bad} />
      <T x={300} y={260} s={13} f={C.secondary} a="middle" o={easeOut(seg(t, 2.8, 3.6))}>2.04× past the estimate: the columns are correlated</T>
    </Svg>
  );
}

// 4 · Two catalogs.
export function TwoCatalogs({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.2, 1));
  const b = easeOut(seg(t, 1.4, 2.6));
  return (
    <Svg label="pg_class gives a cheap row count; pg_statistic gives the harder per-column shape" h={320}>
      <T x={300} y={30} s={14} f={C.secondary} a="middle">orders</T>
      <g opacity={a}>
        <Panel x={40} y={60} w={230} h={100} />
        <T x={55} y={86} s={14} f={C.primary} w={700}>pg_class</T>
        <T x={55} y={110} s={13} f={C.quiet}>reltuples, relpages</T>
        <T x={55} y={132} s={13} f={C.quiet}>rescaled, no scan needed</T>
      </g>
      <g opacity={b}>
        <Panel x={330} y={60} w={230} h={160} />
        <T x={345} y={86} s={14} f={C.primary} w={700}>pg_statistic</T>
        <T x={345} y={110} s={13} f={C.quiet}>histogram_bounds</T>
        <T x={345} y={132} s={13} f={C.quiet}>most_common_vals/freqs</T>
        <T x={345} y={154} s={13} f={C.quiet}>n_distinct</T>
        <T x={345} y={190} s={12} f={C.cherryText}>"always approximate"</T>
      </g>
    </Svg>
  );
}

// 5 · Histogram.
const BOUNDS = [0, 500, 994, 1017, 1500, 2000, 2500, 3000, 3500, 4000, 4432];
export function Histogram({ t }: StepCtx) {
  const x0 = 30, x1 = 570, max = 4432;
  const x = (v: number) => x0 + (v / max) * (x1 - x0);
  const penX = x0 + seg(t, 0.4, 2.4) * (x(1000) - x0);
  const landed = t > 2.4;
  return (
    <Svg label="100 equal-frequency buckets; locate 1000 and interpolate inside its bucket" h={300}>
      <line x1={x0} y1={120} x2={x1} y2={120} stroke={C.line} strokeWidth={2} />
      {BOUNDS.map((v, i) => (
        <line key={i} x1={x(v)} y1={108} x2={x(v)} y2={132} stroke={i === 2 || i === 3 ? C.focus : C.mocha} strokeWidth={i === 2 || i === 3 ? 2 : 1} />
      ))}
      {BOUNDS.slice(0, -1).map((v, i) => (
        <rect key={i} x={x(v)} y={116} width={x(BOUNDS[i + 1]) - x(v)} height={8} fill={x(BOUNDS[i + 1]) <= penX + 1 ? C.focus : C.band} opacity={0.5} />
      ))}
      <circle cx={penX} cy={120} r={6} fill={C.focus} />
      <T x={penX} y={100} s={13} f={C.focus} a="middle">1000</T>
      {landed && (
        <>
          <T x={300} y={170} s={13} f={C.secondary} a="middle">whole buckets + a linear fraction of the next one</T>
          <Decode text="sel = 0.4138" t={t} at={2.6} x={300} y={200} s={16} f={C.primary} a="middle" />
          <Count x={450} y={240} t={t} from={0} to={994519} start={2.9} s={18} />
          <T x={460} y={240} s={13} f={C.quiet}>est.</T>
          <T x={150} y={240} s={14} f={C.quiet}>actual 1,003,918</T>
        </>
      )}
    </Svg>
  );
}

// 6 · MCV bars.
const STATUSES: [string, number][] = [['cancelled', 0.2005], ['pending', 0.198], ['shipped', 0.1977], ['paid', 0.1947], ['delivered', 0.193], ['refunded', 0.0166]];
export function MCVBars({ t }: StepCtx) {
  return (
    <Svg label="Six status values; refunded is the thin one, read straight off the MCV list" h={320}>
      {STATUSES.map(([name, freq], i) => {
        const k = easeOut(seg(t, 0.3 + i * 0.25, 1 + i * 0.25));
        const isRefunded = name === 'refunded';
        return (
          <g key={name} opacity={k}>
            <T x={25} y={40 + i * 44} s={13} f={isRefunded ? C.cherryText : C.secondary}>{name}</T>
            <rect x={140} y={28 + i * 44} width={360 * k * (freq / 0.2005)} height={16} rx={3} fill={isRefunded ? C.badText : C.primary} />
            <T x={515} y={40 + i * 44} s={13} f={isRefunded ? C.cherryText : C.secondary}>{(freq * 100).toFixed(2)}%</T>
          </g>
        );
      })}
      <Reticle x={350} y={28 + 5 * 44 + 8} w={460} h={30} t={t} at={1.9} color={C.bad} />
      <T x={300} y={300} s={13} f={C.secondary} a="middle" o={easeOut(seg(t, 2.1, 2.8))}>selectivity = 0.0166 — the measured frequency, nothing more</T>
    </Svg>
  );
}

// 7 · Off MCV.
export function OffMCV({ t }: StepCtx) {
  const mcvK = easeOut(seg(t, 0.3, 1.4));
  const remK = easeOut(seg(t, 1.6, 2.8));
  const n = 666; // n_distinct(676) - num_mcv(10), the stringu1 example
  const ticks = Math.min(40, Math.round(remK * 40));
  return (
    <Svg label="MCV portion measured; the remainder split into equal slivers for every other distinct value" h={300}>
      <rect x={30} y={60} width={540 * mcvK} height={40} rx={4} fill={C.primary} />
      <T x={30} y={118} s={13} f={C.secondary}>MCV frequencies, summed (measured)</T>
      <g opacity={remK}>
        {Array.from({ length: ticks }, (_, i) => (
          <rect key={i} x={30 + i * (540 / 40)} y={150} width={540 / 40 - 1.5} height={30} fill={C.band} stroke={C.mocha} />
        ))}
        <T x={30} y={200} s={13} f={C.secondary}>n_distinct − num_mcv = 666 equal slivers</T>
      </g>
      <T x={300} y={250} s={15} f={C.crema} a="middle" o={remK}>sel = (1 − Σmcv) / {n} ≈ 0.001456</T>
    </Svg>
  );
}

// 8 · Create statistics.
export function CreateStatistics({ t }: StepCtx) {
  const code = 'CREATE STATISTICS … ON status, channel';
  return (
    <Svg label="Before and after CREATE STATISTICS, the same correlated-columns query" h={340}>
      <Decode text={code} t={t} at={0.2} dur={1.2} x={25} y={34} s={13} f={C.second} />
      <T x={25} y={92} s={13} f={C.quiet}>before: estimate</T>
      <Count x={575} y={92} t={t} from={0} to={138866} start={1.4} s={19} f={C.badText} />
      <T x={25} y={122} s={13} f={C.quiet}>actual</T>
      <Count x={575} y={122} t={t} from={0} to={282940} start={1.4} s={19} f={C.cherryText} />
      <T x={25} y={190} s={13} f={C.quiet}>after + ANALYZE: estimate</T>
      <Count x={575} y={190} t={t} from={0} to={284969} start={2.6} s={19} f={C.second} />
      <Reticle x={300} y={178} w={560} h={30} t={t} at={3.2} color={C.second} />
      <T x={300} y={270} s={13} f={C.secondary} a="middle" o={easeOut(seg(t, 3.4, 4.2))}>off by less than one percent, instead of over two times under</T>
    </Svg>
  );
}

// 9 · Predict stale.
export function PredictStale({ t }: StepCtx) {
  const k = easeOut(seg(t, 0.2, 1.4));
  return (
    <Svg label="400,000 new all-pending rows arrive with no ANALYZE yet" h={300}>
      <rect x={30} y={40} width={540} height={60} rx={6} fill={C.panel} stroke={C.line} />
      <T x={300} y={75} s={14} f={C.secondary} a="middle">orders (2,000,000 rows)</T>
      <g transform={`translate(${lerp(560, 0, k)} 0)`} opacity={k}>
        <rect x={30} y={120} width={540} height={40} rx={6} fill={C.second} opacity={0.5} />
        <T x={300} y={145} s={13} f={C.ink} a="middle">+400,000 rows, all status='pending'</T>
      </g>
      {t > 1.5 && <T x={300} y={230} s={13} f={C.secondary} a="middle">row count: ticks up automatically · MCV frequency: frozen</T>}
    </Svg>
  );
}

// 10 · Reveal stale.
export function RevealStale({ t }: StepCtx) {
  return (
    <Svg label="Stale: 1.6x under. After ANALYZE: within 0.4%" h={320}>
      <T x={25} y={36} s={13} f={C.quiet}>before ANALYZE: estimate</T>
      <Count x={575} y={36} t={t} from={0} to={497040} start={0.2} s={19} />
      <T x={25} y={66} s={13} f={C.quiet}>actual</T>
      <Count x={575} y={66} t={t} from={0} to={793095} start={0.5} s={19} f={C.badText} />
      <Reticle x={300} y={51} w={560} h={30} t={t} at={1.2} color={C.bad} />
      <T x={25} y={150} s={13} f={C.quiet}>after ANALYZE: estimate</T>
      <Count x={575} y={150} t={t} from={0} to={796240} start={1.8} s={19} f={C.second} />
      <T x={300} y={250} s={13} f={C.secondary} a="middle" o={easeOut(seg(t, 2.4, 3.2))}>the shape only updates when</T>
      <T x={300} y={272} s={13} f={C.secondary} a="middle" o={easeOut(seg(t, 2.4, 3.2))}>ANALYZE looks again</T>
    </Svg>
  );
}

// 11 · Compounding.
export function Compounding({ t }: StepCtx) {
  const a = easeOut(seg(t, 0.2, 1.2));
  const b = easeOut(seg(t, 1.4, 2.4));
  const c = easeOut(seg(t, 2.6, 3.6));
  return (
    <Svg label="2.04x from correlation times 1.6x from staleness compounds to about 3.3x" h={300}>
      <g opacity={a}>
        <rect x={30} y={40} width={204 * 1} height={28} rx={4} fill={C.badText} />
        <T x={30} y={84} s={13} f={C.secondary}>correlated columns, step 3: 2.04×</T>
      </g>
      <g opacity={b}>
        <rect x={30} y={110} width={160} height={28} rx={4} fill={C.badText} />
        <T x={30} y={154} s={13} f={C.secondary}>stale statistics, step 10: 1.6×</T>
      </g>
      <g opacity={c}>
        <rect x={30} y={190} width={330} height={32} rx={4} fill={C.bad} />
        <T x={30} y={240} s={16} f={C.cherryText} w={700}>compounded: ≈3.3×</T>
      </g>
      <T x={300} y={270} s={12} f={C.quiet} a="middle" o={c}>"...due to round-off error and other factors</T>
      <T x={300} y={290} s={12} f={C.quiet} a="middle" o={c}>they sometimes diverge significantly" — PostgreSQL docs</T>
    </Svg>
  );
}

// 12 · Frontier.
export function Frontier({ t }: StepCtx) {
  const dissolve = easeOut(seg(t, 0.2, 1.6));
  return (
    <Svg label="A model trained on real data and queries, instead of fixed formulas" h={280}>
      <g opacity={1 - dissolve}>
        <T x={25} y={40} s={13} f={C.secondary}>histogram</T>
        <T x={25} y={70} s={13} f={C.secondary}>most-common values</T>
        <T x={25} y={100} s={13} f={C.secondary}>independence</T>
      </g>
      <Plot
        pts={Array.from({ length: 9 }, (_, i) => [320 + (i % 3) * 60, 40 + Math.floor(i / 3) * 50] as [number, number])}
        t={t}
        start={1.4}
        beat={0.12}
        fill={C.second}
      />
      <Decode text="MSCN, CIDR 2019" t={t} at={2.2} x={300} y={220} s={14} f={C.primary} a="middle" />
      <T x={300} y={248} s={12} f={C.quiet} a="middle">Kipf et al., "Learned Cardinalities"</T>
      <T x={300} y={266} s={12} f={C.quiet} a="middle">frontier, not this topic's mechanism</T>
    </Svg>
  );
}

// 13 · Recap.
export function Recap({ t }: StepCtx) {
  const qs = ['are the WHERE columns related?', 'when did ANALYZE last run?', 'does this estimate feed another join?'];
  return (
    <Svg label="Three questions before trusting an EXPLAIN estimate" h={280}>
      {qs.map((q, i) => (
        <g key={q} opacity={easeOut(seg(t, 0.3 + i * 0.6, 1 + i * 0.6))}>
          <circle cx={40} cy={50 + i * 60} r={6} fill={C.focus} />
          <T x={60} y={56 + i * 60} s={15} f={C.crema}>{q}</T>
        </g>
      ))}
      <T x={300} y={260} s={13} f={C.secondary} a="middle" o={easeOut(seg(t, 2.4, 3.2))}>next: the cost that turns a row count into a plan's price</T>
    </Svg>
  );
}

// 14 · Prove: MCV.
export function ProveMCV({ t, answer }: StepCtx) {
  return (
    <Svg label="frequency 0.02 on 500,000 rows" h={220}>
      <T x={300} y={70} s={18} f={C.crema} a="middle">mcv_freq = 0.02, rows = 500,000</T>
      {answer !== null && <T x={300} y={130} s={20} f={C.focus} a="middle" w={700}>0.02 × 500,000 = 10,000</T>}
    </Svg>
  );
}

// 15 · Prove: correlation.
export function ProveCorrelation({ t, answer }: StepCtx) {
  return (
    <Svg label="two correlated clauses, each about 20%" h={240}>
      <T x={300} y={60} s={16} f={C.crema} a="middle">two correlated clauses, each ≈20%,</T>
      <T x={300} y={86} s={16} f={C.crema} a="middle">multiplied ≈4%</T>
      {answer !== null && (
        <>
          <T x={300} y={150} s={17} f={C.cherryText} a="middle">the real overlap is larger —</T>
          <T x={300} y={174} s={17} f={C.cherryText} a="middle">the estimate undershoots</T>
        </>
      )}
    </Svg>
  );
}
