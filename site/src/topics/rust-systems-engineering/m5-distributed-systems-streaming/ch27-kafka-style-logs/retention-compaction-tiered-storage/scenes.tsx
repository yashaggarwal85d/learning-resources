import type { StepCtx } from '../../../../../reels/types';
import { easeOut, seg, lerp, clamp, easeInOut, easeOutBack } from '../../../../../reels/anim';
import { Code } from '../../../../../reels/Code';
import { Draw, Stack, Svg, T, C, Reticle } from '../../../../../reels/kit';

// Time/size retention deletes by age alone; compaction keeps the latest
// value per key forever instead, until a real tombstone genuinely removes
// that key for good.
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

/** One log entry: an outlined cell carrying its key's letter, coloured by key (blue for the key the step follows). */
function Entry({ x, y, k, f, o = 1, s = 1 }: { x: number; y: number; k: string; f: string; o?: number; s?: number }) {
  if (o <= 0.01) return null;
  return (
    <g opacity={o} transform={`translate(${x + 21} ${y + 15}) scale(${s.toFixed(3)})`}>
      <rect x={-21} y={-15} width={42} height={30} rx={4} fill="none" stroke={f} strokeWidth={2} />
      <T x={0} y={5} s={13} a="middle" f={f}>
        {k}
      </T>
    </g>
  );
}


// ── 1 · Does retention delete a key's own latest entry (predict) ──────────
export function RetentionPredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="one old entry, one key's own only value"
        lines={['apply_retention(&log, now, max_age);', '// deletes the key\'s own latest entry too?']}
        t={t}
        start={0.1}
        end={2.6}
        highlight={[1]}
      />
    </Stack>
  );
}

// ── 2 · Measured: genuinely deleted (no takeaway, "from" step) ────────────
// The log runs oldest to newest. Retention's cutoff line advances from the left by age alone: the old entry, key a's
// only and latest value, is behind it and drops out struck through, while key b's recent entries stay put.
export function RetentionReveal({ t }: StepCtx) {
  const cut = easeInOut(seg(t, 0.5, 1.2));
  const gone = ez(t, 1.2, 0.35);
  const log = [
    { k: 'a', f: C.second },
    { k: 'b', f: C.latte },
    { k: 'b', f: C.latte },
    { k: 'b', f: C.latte },
  ];
  return (
    <Svg label="compaction_keeps_latest_value_per_key.rs" h={220}>
      <T x={60} y={30} s={13} f={C.taupe} o={ez(t, 0)}>oldest</T>
      <T x={470} y={30} s={13} f={C.taupe} o={ez(t, 0)} a="end">newest</T>
      {log.map((e, i) => (
        <g key={i} transform={`translate(0 ${i === 0 ? (gone * 24).toFixed(1) : 0})`}>
          <Entry x={60 + i * 104} y={44} k={e.k} f={e.f} o={ez(t, i * 0.08) * (i === 0 ? 1 - gone : 1)} />
        </g>
      ))}
      <line x1={lerp(40, 140, cut)} y1={36} x2={lerp(40, 140, cut)} y2={90} stroke={C.cherryText} strokeWidth={2} opacity={ez(t, 0.4, 0.2)} />
      <T x={lerp(40, 140, cut) + 6} y={110} s={13} f={C.cherryText} o={ez(t, 0.5)}>retention cutoff</T>
      <path d="M68 52 l26 16 m0 -16 l-26 16" stroke={C.cherryText} strokeWidth={2} opacity={ez(t, 1.1, 0.2) * (1 - gone)} />
      <Line t={t} at={1.2} y={160} text="the old entry deleted, no key check at all" mark="cross" mf={C.cherryText} />
      <Line t={t} at={1.9} y={200} text="the recent entries for the other key survive" mark="tick" />
    </Svg>
  );
}

// ── 3 · Does the key's latest entry survive compaction (predict) ──────────
export function CompactionPredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="the identical log, compaction instead"
        lines={['apply_compaction(&log);', '// the old entry survives, just by being latest?']}
        t={t}
        start={0.1}
        end={2.6}
        highlight={[1]}
      />
    </Stack>
  );
}

// ── 4 · Measured: compaction keeps the old entry (takeaway) ────────────────
// The same log as before. Compaction's cursor sweeps it asking only "is this the key's latest?": key b's older
// duplicates shrink away as it passes, while key a's old entry, still its only value, stays put and is ticked.
export function CompactionReveal({ t }: StepCtx) {
  const sweep = easeInOut(seg(t, 0.4, 1.5));
  const cx = lerp(40, 560, sweep);
  const log = [
    { k: 'a', f: C.second, keep: true },
    { k: 'b', f: C.latte, keep: false },
    { k: 'b', f: C.latte, keep: false },
    { k: 'b', f: C.latte, keep: true },
  ];
  return (
    <Svg label="compaction_keeps_latest_value_per_key.rs" h={250}>
      <T x={60} y={30} s={13} f={C.taupe} o={ez(t, 0)}>oldest</T>
      {log.map((e, i) => {
        const x = 60 + i * 110;
        const hit = ez(t, 0.4 + ((x + 21 - 40) / 520) * 1.1, 0.25);
        return <Entry key={i} x={x} y={44} k={e.k} f={e.f} o={e.keep ? 1 : 1 - hit} s={e.keep ? 1 : 1 - 0.6 * hit} />;
      })}
      {sweep > 0 && sweep < 1 && <line x1={cx} y1={34} x2={cx} y2={88} stroke={C.focus} strokeWidth={2} />}
      <path d="M72 106 l5 5 l10 -11" fill="none" stroke={C.focus} strokeWidth={2.5} strokeDasharray={24} strokeDashoffset={24 * (1 - ez(t, 0.6, 0.3))} />
      <Reticle x={81} y={59} w={56} h={42} t={t} at={1.7} />
      <Line t={t} at={0.3} y={170} text="the same old entry, the same key, compaction" />
      <Line t={t} at={1.2} y={204} text="the identical old entry, kept by compaction" mark="tick" />
      <Line t={t} at={1.8} y={238} text="it is still that key's own latest value" mf={C.second} />
    </Svg>
  );
}

// ── 5 · Does a tombstone remove the key entirely (predict) ────────────────
export function TombstonePredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="a real tombstone, the same key, appended last"
        lines={['Entry { key, value: None, .. }', '// compaction runs past it -- key gone entirely?']}
        t={t}
        start={0.1}
        end={2.6}
        highlight={[1]}
      />
    </Stack>
  );
}

// ── 6 · Measured: genuinely removed (takeaway) ──────────────────────────────
// A tombstone for key a slides onto the end of the log. Compaction's cursor sweeps the log: each of a's entries
// shrinks away as it passes, then the tombstone itself goes, and b's entries close up, untouched.
export function TombstoneReveal({ t }: StepCtx) {
  const tomb = easeOutBack(seg(t, 0.2, 0.6));
  const sweep = easeInOut(seg(t, 0.9, 1.9));
  const cx = lerp(40, 560, sweep);
  const log = [
    { k: 'a', f: C.second },
    { k: 'b', f: C.latte },
    { k: 'a', f: C.second },
    { k: 'b', f: C.latte },
  ];
  const close = ez(t, 1.9, 0.4);
  const bslot = [0, 0, 1, 1];
  return (
    <Svg label="compaction_keeps_latest_value_per_key.rs" h={220}>
      {log.map((e, i) => {
        const x0 = 40 + i * 90;
        const hit = ez(t, 0.9 + ((x0 + 21 - 40) / 520) * 1.0, 0.25);
        const x = e.k === 'b' ? lerp(x0, 40 + bslot[i] * 60, close) : x0;
        return <Entry key={i} x={x} y={40} k={e.k} f={e.f} o={e.k === 'a' ? 1 - hit : 1} s={e.k === 'a' ? 1 - 0.6 * hit : 1} />;
      })}
      <g transform={`translate(${lerp(80, 0, clamp(tomb))} 0)`} opacity={clamp(tomb)}>
        <Entry x={400} y={40} k="null" f={C.cherryText} o={1 - ez(t, 0.9 + (381 / 520) * 1.0, 0.25)} />
      </g>
      {sweep > 0 && sweep < 1 && <line x1={cx} y1={30} x2={cx} y2={84} stroke={C.focus} strokeWidth={2} />}
      <Line t={t} at={0.4} y={140} text="a tombstone, appended after every real entry" mf={C.cherryText} />
      <Line t={t} at={1.9} y={180} text="the key disappears; every other key stays" mark="tick" />
    </Svg>
  );
}

// ── 7 · Two sources agree (connecting) ─────────────────────────────────────
// The quote lands; under it, one key's values pile up and compaction folds them down to the latest only. Then a
// null-payload message lands on top and the last value goes too: a real delete.
export function DocsReveal({ t }: StepCtx) {
  const fold = easeInOut(seg(t, 1.1, 1.6));
  const nul = easeOutBack(seg(t, 1.9, 2.2));
  return (
    <Svg label="Confluent Docs / Apache Kafka design, quoted" h={200}>
      <Quote t={t} lines={['at least the last state is kept, per key', 'a null payload is a real delete, a tombstone']} hot={1} y0={40} gap={38} beat={0.45} />
      {[0, 1, 2].map((i) => (
        <Entry key={i} x={lerp(120 + i * 60, 240, fold)} y={130} k="a" f={C.second} o={ez(t, 0.7 + i * 0.12) * (i < 2 ? 1 - fold : 1 - ez(t, 2.2, 0.3))} />
      ))}
      <T x={200} y={182} s={13} a="end" f={C.second} o={fold * (1 - ez(t, 2.2, 0.3))}>latest kept</T>
      <g transform={`translate(${lerp(420, 300, clamp(nul))} 0)`} opacity={clamp(nul)}>
        <Entry x={0} y={130} k="null" f={C.cherryText} />
      </g>
      <T x={390} y={152} s={13} f={C.cherryText} o={ez(t, 2.2)}>deleted</T>
    </Svg>
  );
}

// ── 8 · All three outcomes, measured together (takeaway) ───────────────────
// One log, three passes. The age cutoff deletes the oldest entry whatever its key; compaction folds the duplicate
// key down to its latest; the tombstone removes its key outright. Each pass is ticked off as it lands.
export function CoherenceReveal({ t }: StepCtx) {
  const age = ez(t, 0.3, 0.4);
  const fold = easeInOut(seg(t, 1.0, 1.4));
  const tomb = ez(t, 1.8, 0.4);
  return (
    <Svg label="compaction_keeps_latest_value_per_key.rs" h={240}>
      <line x1={lerp(30, 100, age)} y1={24} x2={lerp(30, 100, age)} y2={82} stroke={C.cherryText} strokeWidth={2} opacity={age * (1 - fold)} />
      <Entry x={50} y={38} k="c" f={C.latte} o={1 - age} />
      <Entry x={lerp(130, 220, fold)} y={38} k="a" f={C.second} o={1 - fold} />
      <Entry x={220} y={38} k="a" f={C.second} />
      <Entry x={310} y={38} k="b" f={C.latte} o={1 - tomb} s={1 - 0.5 * tomb} />
      <Entry x={400} y={38} k="null" f={C.cherryText} o={ez(t, 1.6, 0.2) * (1 - ez(t, 2.2, 0.3))} />
      <Line t={t} at={0.4} y={136} text="retention: deletes by age, not by key" mark="tick" />
      <Line t={t} at={1.1} y={176} text="compaction: keeps the latest, forever" mark="tick" />
      <Line t={t} at={1.9} y={216} text="a tombstone: removes the key for good" mark="tick" />
    </Svg>
  );
}

// ── 9 · The chapter's arc (connecting) ─────────────────────────────────────
// The chapter's three topics land as stations on one loop: order, then delivery, then retention. The loop draws
// round through each as it lands and closes back on the first, locked on as the question the chapter opened.
export function ChapterArcReveal({ t }: StepCtx) {
  const cx = 300;
  const cy = 70;
  const r = 50;
  const pts = Array.from({ length: 61 }, (_, i) => {
    const a = -Math.PI / 2 + (i / 60) * Math.PI * 2;
    return [cx + Math.cos(a) * r * 2.4, cy + Math.sin(a) * r] as const;
  });
  const st = [
    { a: -Math.PI / 2, label: 'order', at: 0.2 },
    { a: Math.PI / 6, label: 'delivery', at: 0.8 },
    { a: (5 * Math.PI) / 6, label: 'retention', at: 1.4 },
  ];
  return (
    <Svg label="Chapter 27, measured end to end" h={220}>
      <Draw pts={pts} t={t} from={0.2} to={2.0} stroke={C.mocha} w={2} />
      {st.map((s) => {
        const x = cx + Math.cos(s.a) * r * 2.4;
        const y = cy + Math.sin(s.a) * r;
        const k = easeOutBack(seg(t, s.at, s.at + 0.4));
        return (
          <g key={s.label} opacity={clamp(k)}>
            <circle cx={x} cy={y} r={7 * clamp(k, 0, 1.4)} fill={s.label === 'retention' ? C.focus : C.caramel} />
            <T x={x + (Math.cos(s.a) > 0.1 ? 14 : Math.cos(s.a) < -0.1 ? -14 : 14)} y={y + 5} s={13} a={Math.cos(s.a) < -0.1 ? 'end' : 'start'} f={C.crema}>
              {s.label}
            </T>
          </g>
        );
      })}
      <Reticle x={cx} y={cy - r} w={30} h={30} t={t} at={2.1} />
      <Line t={t} at={1.0} y={168} text="order, then delivery, then how long it lasts" />
      <Line t={t} at={1.9} y={204} text="three topics, one partitioned log, measured" mark="tick" />
    </Svg>
  );
}

// ── 10 · Recap ─────────────────────────────────────────────────────────────
export function Recap({ t }: StepCtx) {
  return (
    <RecapList
      t={t}
      label="recap: a real log, retention, and compaction"
      rows={['retention deletes by age alone', 'compaction keeps the latest value per key', 'a tombstone removes that key for good']}
      gap={70}
      y0={60}
    />
  );
}
