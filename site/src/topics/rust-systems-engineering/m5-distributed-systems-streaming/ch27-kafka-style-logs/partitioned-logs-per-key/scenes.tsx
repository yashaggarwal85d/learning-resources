import type { StepCtx } from '../../../../../reels/types';
import { easeOut, seg, lerp, clamp, easeInOut } from '../../../../../reels/anim';
import { Code } from '../../../../../reels/Code';
import { Draw, Stack, Svg, T, C, Reticle } from '../../../../../reels/kit';

// A key's own write order is only genuinely guaranteed within one partition;
// key-based routing holds that order only as long as the partition count
// itself never changes.
const fa = (t: number, a: number, d = 0.4) => easeOut(seg(t, a, a + d));
// ── Moves shared by this topic's measured, quoted and recap figures ─────────
/** Eased 0..1 from `a` over `d` seconds. */
const ez = (t: number, a: number, d = 0.4) => easeOut(seg(t, a, a + d));

/** A caption line that slides in from the left on its beat; its marker draws itself (tick, cross) or grows (dot). */
function Line({ t, at, y, text, mark = 'dot', mf = C.caramel, f = C.crema }: { t: number; at: number; y: number; text: string; mark?: 'dot' | 'tick' | 'cross'; mf?: string; f?: string }) {
  const k = ez(t, at, 0.45);
  const m = ez(t, at + 0.2, 0.35);
  if (k <= 0) return null;
  return (
    <g opacity={k} transform={`translate(${(-28 * (1 - k)).toFixed(2)} 0)`}>
      {mark === 'dot' && <circle cx={30} cy={y - 5} r={5 * m} fill={mf} />}
      {mark === 'tick' && <path d={`M23 ${y - 5} l5 5 l10 -11`} fill="none" stroke={mf} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={24} strokeDashoffset={24 * (1 - m)} />}
      {mark === 'cross' && <path d={`M24 ${y - 11} l12 12 M36 ${y - 11} l-12 12`} fill="none" stroke={mf} strokeWidth={2.5} strokeLinecap="round" strokeDasharray={34} strokeDashoffset={34 * (1 - m)} />}
      <T x={48} y={y} s={13} f={f}>
        {text}
      </T>
    </g>
  );
}

/**
 * A quoted source: the quote panel rises into place, a rule draws down its left edge, each quoted line slides in on
 * its beat, and the line that carries the point gets an underline drawn under it once the quote has landed.
 */
function Quote({ t, lines, y0 = 40, gap = 40, hot, at = 0.25, beat = 0.55 }: { t: number; lines: string[]; y0?: number; gap?: number; hot: number; at?: number; beat?: number }) {
  const k = ez(t, 0, 0.5);
  const top = y0 - 26;
  const bottom = y0 + (lines.length - 1) * gap + 16;
  const u = at + lines.length * beat;
  return (
    <g>
      <rect x={14} y={top + (1 - k) * 14} width={572} height={bottom - top} rx={6} fill={C.roast} opacity={k} />
      <Draw pts={[[26, top + 8], [26, bottom - 8]]} t={t} from={0.15} to={0.15 + beat * lines.length} stroke={C.taupe} w={2} pen={false} />
      {lines.map((l, i) => {
        const s = ez(t, at + i * beat, 0.45);
        return (
          <g key={l} opacity={s} transform={`translate(${(-22 * (1 - s)).toFixed(2)} 0)`}>
            <T x={42} y={y0 + i * gap} s={14} f={i === hot ? C.focus : C.crema} serif italic>
              {l}
            </T>
          </g>
        );
      })}
      <Draw pts={[[42, y0 + hot * gap + 8], [42 + Math.min(520, lines[hot].length * 7.2), y0 + hot * gap + 8]]} t={t} from={u} to={u + 0.5} stroke={C.focus} w={1.5} />
    </g>
  );
}

/**
 * The recap as a payoff: a spine draws down the left, each point's tick is drawn as the spine reaches it and the
 * point slides in beside it, and the last point, the one the topic stands on, is locked on once it lands.
 */
function RecapList({ t, rows, label, y0 = 50, gap = 58, h = 300 }: { t: number; rows: string[]; label: string; y0?: number; gap?: number; h?: number }) {
  const beat = 2.2 / rows.length;
  const at = (i: number) => 0.2 + i * beat;
  const last = rows.length - 1;
  return (
    <Svg label={label} h={h}>
      <Draw pts={[[30, y0 - 5], [30, y0 - 5 + last * gap]]} t={t} from={at(0)} to={at(last)} stroke={C.mocha} w={2} pen={false} />
      {rows.map((r, i) => {
        const k = ez(t, at(i), 0.45);
        const m = ez(t, at(i) + 0.1, 0.35);
        const y = y0 + i * gap;
        const f = i === last ? C.focus : C.caramel;
        return (
          <g key={r}>
            <circle cx={30} cy={y - 5} r={11 * m} fill={C.espresso} stroke={f} strokeWidth={1.5} opacity={m} />
            <path d={`M24 ${y - 5} l4 4 l8 -9`} fill="none" stroke={f} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={20} strokeDashoffset={20 * (1 - m)} />
            <g opacity={k} transform={`translate(${(-24 * (1 - k)).toFixed(2)} 0)`}>
              <T x={52} y={y} s={13} f={i === last ? C.focus : C.crema} w={i === last ? 600 : 500}>
                {r}
              </T>
            </g>
          </g>
        );
      })}
      <Reticle x={300} y={y0 + last * gap - 5} w={576} h={38} t={t} at={at(last) + 0.45} />
    </Svg>
  );
}

/** Partition lanes: horizontal tracks, one per partition, drawn in from the left by `k`. */
function Lanes({ n, y0, gap, k, x = 200, w = 370 }: { n: number; y0: number; gap: number; k: number; x?: number; w?: number }) {
  return (
    <g>
      {Array.from({ length: n }, (_, i) => (
        <rect key={i} x={x} y={y0 + i * gap} width={w * k} height={26} rx={4} fill={C.cocoa} />
      ))}
    </g>
  );
}

/** A message chip travelling from the producer at (x0, y0) to its slot (x1, y1) over the window `a`..`a + d`. */
function Msg({ t, a, d = 0.45, x0, y0, x1, y1, f }: { t: number; a: number; d?: number; x0: number; y0: number; x1: number; y1: number; f: string }) {
  const k = easeInOut(seg(t, a, a + d));
  if (k <= 0) return null;
  return <rect x={lerp(x0, x1, k) - 9} y={lerp(y0, y1, k) - 9} width={18} height={18} rx={3} fill={f} />;
}


// ── 1 · Does every write to the same key land in the same partition (predict) ─
export function RoutePredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="several keys, one real partitioning function"
        lines={['let idx = partition_for(key, partition_count);', '// hash(key) % N -- always the same idx?']}
        t={t}
        start={0.1}
        end={2.6}
        highlight={[1]}
      />
    </Stack>
  );
}

// ── 2 · Measured: one key, one partition, one order ────────────────────────
// Writes stream out of the producer. Every write to the one key (blue) is routed by its hash into the same lane and
// lands one after another, left to right, in the order it was written; the other keys' writes go wherever theirs
// hash to. The blue run is bracketed at the end.
export function RouteReveal({ t }: StepCtx) {
  const lane = [52, 92, 132];
  const msgs = [
    { p: 1, f: C.second },
    { p: 0, f: C.latte },
    { p: 1, f: C.second },
    { p: 2, f: C.latte },
    { p: 1, f: C.second },
    { p: 0, f: C.latte },
    { p: 1, f: C.second },
  ];
  const slot = [0, 0, 0];
  return (
    <Svg label="key_partitioning_order_tradeoff.rs, measured" h={240}>
      <T x={30} y={98} s={13} f={C.latte} o={ez(t, 0)}>producer</T>
      <Lanes n={3} y0={39} gap={40} k={ez(t, 0, 0.5)} />
      {msgs.map((m, i) => {
        const s = slot[m.p]++;
        return <Msg key={i} t={t} a={0.3 + i * 0.22} x0={140} y0={92} x1={225 + s * 30} y1={lane[m.p]} f={m.f} />;
      })}
      <Draw pts={[[212, 80], [328, 80], [328, 104], [212, 104], [212, 80]]} t={t} from={2.0} to={2.4} stroke={C.second} w={1.5} pen={false} />
      <T x={345} y={97} s={13} f={C.second} o={ez(t, 2.1)}>one key, in order</T>
      <Line t={t} at={1.0} y={190} text="every write to the same key, same partition" />
      <Line t={t} at={1.9} y={226} text="the identical relative order, every time" mark="tick" />
    </Svg>
  );
}

// ── 3 · Does every existing key's routing stay put on resize (predict) ─────
export function ResizePredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="the topic grows from four partitions to six"
        lines={['partition_for(key, 4) vs partition_for(key, 6)', '// does every existing key route the same way?']}
        t={t}
        start={0.1}
        end={2.6}
        highlight={[1]}
      />
    </Stack>
  );
}

// ── 4 · Measured: at least one key reroutes (takeaway) ─────────────────────
export function ResizeReveal({ t }: StepCtx) {
  const move = easeOut(seg(t, 0.6, 0.95));
  return (
    <Svg label="key_partitioning_order_tradeoff.rs, measured" h={200}>
      <T x={60} y={50} s={14} f={C.crema} o={fa(t, 0.3, 0.4)}>four partitions became six, a real resize</T>
      <T x={70} y={78} s={11} f={C.latte} o={fa(t, 0.35, 0.3)}>4 partitions</T>
      <T x={70} y={120} s={11} f={C.latte} o={fa(t, 0.95, 0.3)}>6 partitions</T>
      <Draw pts={[[140, 73], [140 + move * 80, 113]]} t={t} from={0.6} to={0.95} stroke={C.cherry} w={2} pen />
      <circle cx={140} cy={73} r={4} fill={C.caramel} opacity={fa(t, 0.4, 0.2)} />
      <circle cx={140 + move * 80} cy={113} r={4} fill={C.cherry} opacity={fa(t, 0.6, 0.2)} />
      {fa(t, 1.1, 0.4) > 0.85 && <T x={190} y={140} s={13} a="middle" f={C.mocha}>at least one key's own route changed</T>}
      <T x={60} y={170} s={13} f={C.latte} o={fa(t, 1.5, 0.3)}>growing a topic is never free for a key</T>
    </Svg>
  );
}

// ── 5 · Does the rerouted key's history stay in one place (predict) ────────
export function SplitPredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="the rerouted key keeps writing after the resize"
        lines={['// its old entries sit in the old partition', '// where do the new writes land?']}
        t={t}
        start={0.1}
        end={2.6}
        highlight={[1]}
      />
    </Stack>
  );
}

// ── 6 · Measured: the history genuinely splits (takeaway) ──────────────────
export function SplitReveal({ t }: StepCtx) {
  const oldEntries = [0, 1, 2];
  const newEntries = [0, 1];
  return (
    <Svg label="key_partitioning_order_tradeoff.rs, measured" h={200}>
      <T x={60} y={50} s={14} f={C.crema} o={fa(t, 0.3, 0.4)}>the same key, written before and after resize</T>
      <T x={60} y={75} s={11} f={C.latte} o={fa(t, 0.35, 0.3)}>old partition</T>
      {oldEntries.map((i) => {
        const land = easeOut(seg(t, 0.4 + i * 0.1, 0.6 + i * 0.1));
        return <circle key={i} cx={70 + i * 25} cy={88 - (1 - land) * 14} r={4} fill={C.caramel} opacity={fa(t, 0.4 + i * 0.1, 0.2)} />;
      })}
      <T x={60} y={115} s={11} f={C.latte} o={fa(t, 0.75, 0.3)}>new partition</T>
      {newEntries.map((i) => {
        const land = easeOut(seg(t, 0.8 + i * 0.1, 1.0 + i * 0.1));
        return <circle key={i} cx={70 + i * 25} cy={128 - (1 - land) * 14} r={4} fill={C.cherry} opacity={fa(t, 0.8 + i * 0.1, 0.2)} />;
      })}
      {fa(t, 1.3, 0.4) > 0.85 && <T x={190} y={155} s={13} a="middle" f={C.mocha}>old entries stayed in the old partition</T>}
      <T x={60} y={180} s={13} f={C.latte} o={fa(t, 1.6, 0.3)}>new writes landed in a different one</T>
    </Svg>
  );
}

// ── 7 · Confluent's own words (connecting) ─────────────────────────────────
// The quote lands; under it, one key's events land in one partition, and then a consumer's cursor sweeps along it,
// ticking each event in exactly the order it was written.
export function ConfluentReveal({ t }: StepCtx) {
  const read = seg(t, 1.5, 2.5);
  return (
    <Svg label="Confluent Documentation, quoted" h={220}>
      <Quote t={t} lines={['same key, same partition, always', "a partition's own order is read in order"]} hot={1} y0={40} gap={38} beat={0.45} />
      <Lanes n={1} y0={135} gap={0} k={ez(t, 0.6, 0.4)} x={120} w={360} />
      {[0, 1, 2, 3, 4].map((i) => (
        <g key={i}>
          <Msg t={t} a={0.8 + i * 0.12} d={0.3} x0={60} y0={148} x1={150 + i * 50} y1={148} f={C.second} />
          <path d={`M${143 + i * 50} 178 l4 4 l8 -9`} fill="none" stroke={C.focus} strokeWidth={2} strokeDasharray={20} strokeDashoffset={20 * (1 - clamp((read * 5 - i) * 2))} />
        </g>
      ))}
      {read > 0 && <path d={`M${lerp(140, 360, read)} 128 l10 0 l-5 6 z`} fill={C.focus} />}
      <T x={490} y={153} s={13} f={C.crema} o={ez(t, 1.5)}>consumer</T>
    </Svg>
  );
}

// ── 8 · Kafka's design document (connecting) ───────────────────────────────
// The quote lands; under it, the log appears as what it is, a directory of segment files. Compaction then picks one
// segment and recopies it whole into a fresh file, which slides down into its place while the old one fades.
export function DesignDocReveal({ t }: StepCtx) {
  const copy = easeInOut(seg(t, 1.5, 2.2));
  const file = (x: number, y: number, o: number, f: string) => (
    <path d={`M${x} ${y} h44 l12 12 v40 h-56 z M${x + 44} ${y} v12 h12`} fill="none" stroke={f} strokeWidth={2} opacity={o} />
  );
  return (
    <Svg label="Apache Kafka design document, quoted" h={240}>
      <Quote t={t} lines={['the log itself: just a directory of files', 'compaction recopies whole segments']} hot={1} y0={40} gap={38} beat={0.45} />
      <Draw pts={[[60, 130], [60, 120], [100, 120], [108, 130], [540, 130]]} t={t} from={0.6} to={1.0} stroke={C.taupe} w={1.5} pen={false} />
      {[0, 1, 2, 3].map((i) => (
        <g key={i} transform={`translate(0 ${((1 - ez(t, 0.8 + i * 0.12)) * 10).toFixed(1)})`}>
          {file(90 + i * 110, 142, ez(t, 0.8 + i * 0.12) * (i === 1 ? 1 - 0.75 * copy : 1), C.crema)}
        </g>
      ))}
      {copy > 0 && file(200, lerp(102, 142, copy), copy, C.second)}
      <T x={228} y={222} s={13} a="middle" f={C.second} o={ez(t, 2.1)}>recopied</T>
    </Svg>
  );
}

// ── 9 · Measured, all together ─────────────────────────────────────────────
// With three partitions, the key's writes all land in one lane. Then a fourth lane slides in: the same hash now
// answers differently, the key's next writes land in another lane, and a bracket spans the history now split in two.
export function CoherenceReveal({ t }: StepCtx) {
  const grow = easeInOut(seg(t, 1.0, 1.4));
  const lane = (i: number) => 30 + i * 34;
  return (
    <Svg label="key_partitioning_order_tradeoff.rs, measured" h={280}>
      <Lanes n={3} y0={17} gap={34} k={ez(t, 0, 0.4)} x={160} w={400} />
      <rect x={160} y={lerp(140, 119, grow)} width={400} height={26} rx={4} fill={C.cocoa} opacity={grow} />
      {[0, 1, 2].map((i) => (
        <Msg key={`a${i}`} t={t} a={0.2 + i * 0.22} x0={130} y0={80} x1={185 + i * 30} y1={lane(1)} f={C.second} />
      ))}
      {[0, 1].map((i) => (
        <Msg key={`b${i}`} t={t} a={1.5 + i * 0.25} x0={130} y0={80} x1={305 + i * 30} y1={lane(3)} f={C.second} />
      ))}
      <T x={30} y={85} s={13} f={C.latte}>one key</T>
      <Draw pts={[[245, 74], [295, 122]]} t={t} from={2.1} to={2.5} stroke={C.cherryText} w={2} dash="5 4" />
      <Line t={t} at={0.5} y={196} text="fixed count: per-key order holds" mark="tick" />
      <Line t={t} at={1.3} y={230} text="resize: at least one key reroutes" mark="cross" mf={C.cherryText} />
      <Line t={t} at={2.0} y={264} text="that key's history splits across both" f={C.focus} mf={C.cherryText} />
    </Svg>
  );
}

// ── 10 · Recap ─────────────────────────────────────────────────────────────
export function Recap({ t }: StepCtx) {
  return (
    <RecapList
      t={t}
      label="recap: one real routing function, measured"
      rows={['order holds only within one partition', 'key routing holds only while count is fixed', "growing it can split a key's own history", 'segments and compaction are the real files']}
    />
  );
}
