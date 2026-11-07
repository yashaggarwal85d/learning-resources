import { useEffect, useState } from 'react';
import { Bar, C, Plot, Svg, T } from '../../../../../reels/kit';
import type { StepCtx } from '../../../../../reels/types';
import { clamp, easeInOut, easeOut, easeOutBack, lerp, seg } from '../../../../../reels/anim';

/** Seconds since the learner answered a predict step (the player's clock has stopped by then), so reveals can animate. */
function useSinceAnswer(on: boolean) {
  const [s, setS] = useState(0);
  useEffect(() => {
    if (!on) {
      setS(0);
      return;
    }
    if (typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
      setS(99);
      return;
    }
    let raf = 0;
    const t0 = performance.now();
    const tick = () => {
      const d = (performance.now() - t0) / 1000;
      setS(d);
      if (d < 4) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [on]);
  return s;
}

/** A number counted up to its final value, with fixed decimals and thousands separators. */
function num(v: number, d = 0) {
  return v.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });
}

/** A label-left / value-right row, stacked vertically with generous gaps (DESIGN.md, phone text scaling).
 * `k` fades it in and slides it up a little; the value is whatever string the scene passes (a count in progress). */
function Row({ y, label, value, valueColor = C.crema, big = false, k = 1 }: { y: number; label: string; value: string; valueColor?: string; big?: boolean; k?: number }) {
  return (
    <g opacity={k} transform={`translate(0 ${((1 - k) * 10).toFixed(2)})`}>
      <T x={25} y={y} s={15} f={C.latte}>
        {label}
      </T>
      <T x={575} y={y} s={big ? 22 : 17} f={valueColor} a="end" w={600}>
        {value}
      </T>
    </g>
  );
}

/** A verdict tick at the right edge, drawn in by `k`. */
function Tick({ y, k, f = C.focus }: { y: number; k: number; f?: string }) {
  return <path d={`M540 ${y} l8 8 l16 -18`} fill="none" stroke={f} strokeWidth={3} strokeDasharray="40" strokeDashoffset={40 * (1 - k)} />;
}

/** A time bar that grows to its share over `k`; its figure fades in once the bar is most of the way there. */
function timeBar(x: number, y: number, frac: number, display: string, label: string, fill: string, k: number) {
  return (
    <g key={label} opacity={k > 0 ? 1 : 0}>
      <T x={x} y={y - 20} s={13} f={C.latte} o={clamp(k * 3, 0, 1)}>
        {label}
      </T>
      <Bar x={x} y={y} w={340 * frac * k} h={20} full={340} fill={fill} />
      <T x={x} y={y + 38} s={13} f={C.crema} o={seg(k, 0.6, 1)}>
        {display}
      </T>
    </g>
  );
}

/** Two timed rows that count up, each with a bar under it scaled to the slower one. */
function TwoTimes({ t, rows, max }: { t: number; rows: [string, number, number, string][]; max: number }) {
  return (
    <g>
      {rows.map(([label, ms, d, color], i) => {
        const k = easeOut(seg(t, 0.2 + i * 1.1, 0.8 + i * 1.1));
        const c = easeOut(seg(t, 0.3 + i * 1.1, 1.3 + i * 1.1));
        const y = 60 + i * 60;
        return (
          <g key={label}>
            <Row y={y} label={label} value={`${num(ms * c, d)} ms`} valueColor={color} big k={k} />
            <rect x={25} y={y + 14} width={k > 0 ? Math.max(3, 550 * (ms / max) * c) : 0} height={6} rx={3} fill={color} opacity={0.8} />
          </g>
        );
      })}
    </g>
  );
}

/** A predict step's verdict, sliding up into place once the learner has answered. */
function Verdict({ answer, text, y = 184, f = C.focus }: { answer: number | null; text: string; y?: number; f?: string }) {
  const s = useSinceAnswer(answer !== null);
  const v = answer !== null ? easeOut(seg(s, 0.1, 0.6)) : 0;
  if (answer === null) return null;
  return (
    <T x={300} y={lerp(y + 8, y, v)} s={15} f={f} a="middle" o={v}>
      {text}
    </T>
  );
}

/** A Row whose "?" becomes the answer once the learner has answered, underlined as it lands. */
function AnswerRow({ y, label, answer, value, k, f = C.focus }: { y: number; label: string; answer: number | null; value: string; k: number; f?: string }) {
  const s = useSinceAnswer(answer !== null);
  const u = answer !== null ? easeOut(seg(s, 0.2, 0.7)) : 0;
  const uw = Math.min(250, value.length * 10.7);
  return (
    <g>
      <Row y={y} label={label} value={answer !== null ? value : '?'} valueColor={answer !== null ? f : C.crema} k={k} />
      {answer !== null && <rect x={575 - uw * u} y={y + 12} width={uw * u} height={3} fill={f} />}
    </g>
  );
}

/** Twelve rows' values in physical order: one column matched to row order, one scattered across it. */
/** A cell with a centred label. */
function Cell({ x, y, w, h = 28, label, o = 1, stroke = C.mocha, f = C.crema }: { x: number; y: number; w: number; h?: number; label: string; o?: number; stroke?: string; f?: string }) {
  return (
    <g opacity={o}>
      <rect x={x} y={y} width={w} height={h} rx={4} fill={C.cocoa} stroke={stroke} strokeWidth={1.5} />
      <T x={x + w / 2} y={y + h / 2 + 4.5} s={12} f={f} a="middle">
        {label}
      </T>
    </g>
  );
}
/** A small cross drawn by `k`. */
function Cross({ x, y, k }: { x: number; y: number; k: number }) {
  return <path d={`M${x - 7} ${y - 7} l14 14 m0 -14 l-14 14`} stroke={C.cherryText} strokeWidth={2.5} opacity={k} />;
}

/** A small tick at (x, y), drawn by `k`. */
function MiniTick({ x, y, k, f = C.focus }: { x: number; y: number; k: number; f?: string }) {
  return <path d={`M${x} ${y} l4 4 l8 -9`} fill="none" stroke={f} strokeWidth={2} strokeDasharray="20" strokeDashoffset={20 * (1 - k)} />;
}
/** A small padlock at (x, y), drawn in by `k`. */
function Lock({ x, y, k, f = C.second }: { x: number; y: number; k: number; f?: string }) {
  return (
    <g opacity={k}>
      <path d={`M${x + 3} ${y} v-4 a5 5 0 0 1 10 0 v4`} fill="none" stroke={f} strokeWidth={2} />
      <rect x={x} y={y} width={16} height={12} rx={2} fill={f} />
    </g>
  );
}
/** A request arrow from (x1, y) toward x2, drawn by `k`, with a small label above it. */
function Req({ x1, x2, y, k, label, f = C.crema, back = 0 }: { x1: number; x2: number; y: number; k: number; label?: string; f?: string; back?: number }) {
  const x = lerp(x1, x2, k) - (x2 - x1) * 0.35 * back;
  return (
    <g opacity={k > 0 ? 1 : 0}>
      <line x1={x1} y1={y} x2={x} y2={y} stroke={f} strokeWidth={1.8} />
      <path d={`M${x} ${y} l${back > 0 ? 8 : -8} -5 v10 z`} fill={f} />
      {label && (
        <T x={(x1 + x2) / 2} y={y - 9} s={11} f={f} a="middle">
          {label}
        </T>
      )}
    </g>
  );
}

function Pip({ x, y, o = 1, f = C.second, s = 10 }: { x: number; y: number; o?: number; f?: string; s?: number }) {
  return <rect x={x - s / 2} y={y - s / 2} width={s} height={s} rx={2} fill={f} opacity={o} />;
}

function Hole({ x, y, w, h = 28, o = 1, stroke = C.mocha }: { x: number; y: number; w: number; h?: number; o?: number; stroke?: string }) {
  return <rect x={x} y={y} width={w} height={h} rx={4} fill="none" stroke={stroke} strokeWidth={1.5} strokeDasharray="4 3" opacity={o} />;
}

function Bolt({ x, y, k }: { x: number; y: number; k: number }) {
  return <path d={`M${x + 4} ${y - 12} l-8 12 h7 l-5 12 l11 -15 h-7 l5 -9 z`} fill={C.cherryText} opacity={k} />;
}

/** A fan line from (x1, y1) to (x2, y2), drawn by `k`, ending in a dot. */
function Fan({ x1, y1, x2, y2, k, f = C.crema }: { x1: number; y1: number; x2: number; y2: number; k: number; f?: string }) {
  if (k <= 0) return null;
  const x = lerp(x1, x2, k);
  const y = lerp(y1, y2, k);
  return (
    <g>
      <line x1={x1} y1={y1} x2={x} y2={y} stroke={f} strokeWidth={1.6} />
      <circle cx={x} cy={y} r={3} fill={f} />
    </g>
  );
}

// Every behaviour here traces to Databricks' own current documentation (SOURCES.md) or to examples.py's local simulation
// of the checkpoint and schema-evolution mechanisms.

// 0 · A new field, loyalty_tier, slides into three ingestion lanes at once. The first crashes overnight, the second lets
// the field fade away unnoticed, the third, configured ahead of time, files it in the rescued-data column.
export function NewColumnOvernight({ t }: StepCtx) {
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  const slide = easeInOut(seg(t, 0.6, 1.4));
  const out = (d: number) => easeOut(seg(t, 1.5 + d, 1.9 + d));
  const lanes: [string, string, string][] = [
    ['naive job', 'crashes overnight', C.cherryText],
    ['naive job', 'field silently gone', C.cherryText],
    ['evolving stream', 'kept in _rescued_data', C.focus],
  ];
  return (
    <Svg label="A naive ingestion job crashing on a new column versus a schema-evolving stream absorbing it" h={250}>
      <T x={25} y={26} s={11} f={C.latte} o={k(0)}>
        a partner's feed grows one field overnight
      </T>
      {lanes.map(([name, what, f], i) => {
        const y = 44 + i * 66;
        const x = lerp(575 - 150, 300, slide);
        return (
          <g key={i}>
            <T x={25} y={y + 18} s={12} f={C.crema} o={k(0.2 + i * 0.1)}>
              {name}
            </T>
            <line x1={165} y1={y + 14} x2={575} y2={y + 14} stroke={C.mocha} strokeWidth={1} strokeDasharray="3 3" opacity={k(0.2)} />
            {!(i === 1 && out(0.3) >= 1) && (
              <Cell x={i === 2 ? lerp(x, 425, out(0.6)) : x} y={y} w={150} label="loyalty_tier: gold" o={i === 1 ? 1 - out(0.3) : 1} stroke={i === 2 && out(0.6) >= 1 ? C.focus : C.second} />
            )}
            {i === 0 && <Bolt x={280} y={y + 14} k={out(0)} />}
            <T x={25} y={y + 40} s={11} f={f} o={out(i * 0.3)}>
              {what}
            </T>
            {i === 2 && <MiniTick x={260} y={y + 10} k={out(0.9)} />}
          </g>
        );
      })}
    </Svg>
  );
}

// 1 · Predict. The stream crashes and restarts, and the same file list comes back. Once answered, a durable checkpoint
// appears under it and each listed file is marked already seen.
export function PredictCheckpoint({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const v = answer !== null ? easeOut(seg(s, 0.1, 0.6)) : 0;
  const k = (d: number) => easeOut(seg(t, d, d + 0.3));
  const down = t > 0.4 && t < 0.8;
  const files = ['orders_2026-10-30.json', 'orders_2026-10-31.json'];
  return (
    <Svg label="A stream restarting and seeing the same file listing, needing a durable memory of what it already ingested" h={250}>
      <T x={25} y={28} s={11} f={C.latte} o={k(0)}>
        the same file list, after a restart
      </T>
      {files.map((f, i) => (
        <g key={f}>
          <Cell x={25} y={40 + i * 40} w={200} label={f} o={k(0.1 + i * 0.1)} />
          {v > 0 && <MiniTick x={236} y={50 + i * 40} k={v} />}
        </g>
      ))}
      <Cell x={330} y={50} w={150} label={down ? 'stream: down' : 'stream'} o={k(0)} stroke={down ? C.cherryText : C.mocha} f={down ? C.cherryText : C.crema} />
      {down && <Cross x={494} y={64} k={1} />}
      {v > 0 && <Cell x={330} y={lerp(140, 120, v)} w={245} label="checkpoint: seen, durable" o={v} stroke={C.focus} f={C.focus} />}
      {v > 0 && <line x1={405} y1={78} x2={405} y2={lerp(140, 120, v)} stroke={C.focus} strokeWidth={1.5} opacity={v} />}
      {v > 0.5 && (
        <T x={250} y={74} s={11} f={C.focus} o={v}>
          seen
        </T>
      )}
      <Verdict answer={answer} text="a memory that survives the restart" y={220} />
    </Svg>
  );
}

// 2 · Two discovery modes. Listing: the folder fills with files and the scan's cost bar grows with them. Notification:
// each landing file pings the stream directly; the cost bar stays put, behind a permission set up once.
export function TwoDiscoveryModes({ t }: StepCtx) {
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  const n = Math.floor(clamp(seg(t, 0.4, 3.6)) * 24);
  return (
    <Svg label="Directory listing's own cost shape against file notification's event-driven discovery" h={250}>
      <T x={25} y={26} s={12} f={C.crema} o={k(0)}>
        directory listing
      </T>
      <rect x={25} y={36} width={290} height={64} rx={6} fill="none" stroke={C.mocha} strokeWidth={1.5} opacity={k(0)} />
      {Array.from({ length: 24 }, (_, i) => (
        <rect key={i} x={37 + (i % 12) * 23} y={48 + Math.floor(i / 12) * 24} width={16} height={16} rx={2} fill={C.second} opacity={i < n ? 0.8 : 0} />
      ))}
      <T x={340} y={52} s={11} f={C.latte} o={k(0.2)}>
        scan cost
      </T>
      <rect x={340} y={62} width={Math.max(3, (230 * n) / 24)} height={12} rx={2} fill={C.cherryText} opacity={k(0.2)} />
      <T x={25} y={138} s={12} f={C.crema} o={k(1.2)}>
        file notification
      </T>
      <rect x={25} y={148} width={290} height={64} rx={6} fill="none" stroke={C.mocha} strokeWidth={1.5} opacity={k(1.2)} />
      {Array.from({ length: 24 }, (_, i) => (
        <rect key={i} x={37 + (i % 12) * 23} y={160 + Math.floor(i / 12) * 24} width={16} height={16} rx={2} fill={C.focus} opacity={i < n && t > 1.2 ? 0.8 : 0} />
      ))}
      {n > 0 && t > 1.2 && <Fan x1={48 + ((n - 1) % 12) * 23} y1={168 + Math.floor((n - 1) / 12) * 24} x2={340} y2={180} k={1} f={C.focus} />}
      <T x={350} y={168} s={11} f={C.latte} o={k(1.4)}>
        event per file
      </T>
      <rect x={350} y={176} width={40} height={12} rx={2} fill={C.focus} opacity={k(1.4)} />
      {t > 3.0 && (
        <T x={350} y={212} s={11} f={C.caramel} o={k(3.0)}>
          more permissions, up front
        </T>
      )}
    </Svg>
  );
}

// 3 · The real replay. Run one sends both files into the checkpoint; after the restart, run two sends 10-31 again, which
// stops at the checkpoint, and 11-01, which goes through. The checkpoint ends holding all three.
export function RestartReplaySafe({ t }: StepCtx) {
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  const r1 = (i: number) => easeInOut(seg(t, 0.5 + i * 0.3, 1.0 + i * 0.3));
  const rep = easeInOut(seg(t, 2.2, 2.7));
  const nw = easeInOut(seg(t, 2.6, 3.1));
  const seen = ['orders_2026-10-30.json', 'orders_2026-10-31.json', 'orders_2026-11-01.json'];
  return (
    <Svg label="A checkpoint accepting only the genuinely new file on a replayed batch" h={250}>
      <T x={25} y={26} s={11} f={C.latte} o={k(0)}>
        first run
      </T>
      <Cell x={25} y={34} w={190} label="orders_2026-10-30.json" o={k(0.1)} />
      <Cell x={25} y={68} w={190} label="orders_2026-10-31.json" o={k(0.2)} />
      <Req x1={220} x2={325} y={48} k={r1(0)} f={C.focus} />
      <Req x1={220} x2={325} y={82} k={r1(1)} f={C.focus} />
      <T x={25} y={126} s={11} f={C.latte} o={k(1.8)}>
        after the restart
      </T>
      <Cell x={25} y={134} w={190} label="orders_2026-10-31.json" o={k(1.9)} />
      <Cell x={25} y={168} w={190} label="orders_2026-11-01.json" o={k(2.0)} stroke={C.focus} />
      <Req x1={220} x2={325} y={148} k={rep * 0.5} f={C.cherryText} />
      {rep >= 1 && <Cross x={285} y={166} k={k(2.7)} />}
      <Req x1={220} x2={325} y={182} k={nw} f={C.focus} />
      <rect x={330} y={34} width={245} height={168} rx={6} fill={C.cocoa} stroke={C.second} strokeWidth={1.5} opacity={k(0.3)} />
      <T x={342} y={54} s={11} f={C.second} o={k(0.3)}>
        checkpoint: seen
      </T>
      {seen.map((f, i) => {
        const on = i < 2 ? r1(i) >= 1 : nw >= 1;
        return (
          <T key={f} x={342} y={84 + i * 24} s={11} f={C.crema} o={on ? 1 : 0}>
            {f}
          </T>
        );
      })}
      <T x={25} y={228} s={12} f={C.second} o={k(1.3)}>
        first run: 2 files ingested
      </T>
      {t > 3.3 && (
        <T x={575} y={228} s={12} f={C.caramel} a="end" o={k(3.3)}>
          replay + 1 new: only 1 ingested
        </T>
      )}
    </Svg>
  );
}

// 4 · Four modes on one timeline each. A new column arrives at the same mark on every row: addNewColumns fails once then
// runs on wider; type widening does the same and widens; rescue never stops; failOnNewColumns stops and stays stopped.
export function FourSchemaModes({ t }: StepCtx) {
  const rows: [string, string, number][] = [
    ['addNewColumns', 'fails once, then resumes with the wider schema', 0],
    ['addNewColumnsWithTypeWidening', 'same, plus widens supported types', 0],
    ['rescue', 'never fails, never evolves: new fields to rescue', 1],
    ['failOnNewColumns', 'fails and stays failed until someone steps in', 2],
  ];
  const X = (f: number) => 330 + f * 245;
  const ev = 0.4;
  return (
    <Svg label="One schema-evolution mode's own documented reaction to a new column at a time" h={240}>
      {rows.map(([name, trait, kind], i) => {
        const d = 0.2 + i * 1.15;
        const y = 22 + i * 54;
        const k = easeOut(seg(t, d, d + 0.35));
        const cur = clamp(seg(t, d + 0.2, d + 1.1));
        const before = Math.min(cur, ev);
        const after = Math.max(0, cur - ev - (kind === 0 ? 0.12 : 0));
        return (
          <g key={name} opacity={k}>
            <T x={25} y={y + 14} s={12} f={C.crema}>
              {name}
            </T>
            <T x={25} y={y + 32} s={11} f={C.latte}>
              {trait}
            </T>
            <line x1={X(ev)} y1={y} x2={X(ev)} y2={y + 22} stroke={C.caramel} strokeWidth={1.5} strokeDasharray="3 2" />
            <rect x={X(0)} y={y + 6} width={X(before) - X(0)} height={10} rx={2} fill={C.second} />
            {cur > ev && kind === 0 && <Cross x={X(ev) + 14} y={y + 11} k={1} />}
            {kind === 0 && after > 0 && <rect x={X(ev + 0.12)} y={y + 4} width={X(ev + 0.12 + after) - X(ev + 0.12)} height={14} rx={2} fill={C.focus} />}
            {kind === 1 && cur > ev && <rect x={X(ev)} y={y + 6} width={X(cur) - X(ev)} height={10} rx={2} fill={C.second} />}
            {kind === 2 && cur > ev && <Cross x={X(ev) + 14} y={y + 11} k={1} />}
            {kind === 2 && cur > ev + 0.15 && (
              <T x={X(ev) + 30} y={y + 15} s={11} f={C.cherryText}>
                stopped
              </T>
            )}
          </g>
        );
      })}
    </Svg>
  );
}

// 5 · One real record. Its three expected fields drop into their columns; the unexpected one drops into _rescued_data as
// a structured value; the column headers appear once the values have landed, and getting it back is a query.
export function RescuedColumnReal({ t }: StepCtx) {
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  const cols: [string, string, string, number, number][] = [
    ['order_id', 'order_id', 'o-1', 25, 85],
    ['customer_id', 'customer_id', 'c-1', 115, 110],
    ['amount', 'amount', '42.5', 230, 80],
    ['loyalty_tier', '_rescued_data', '{"loyalty_tier": "gold"}', 315, 260],
  ];
  return (
    <Svg label="An unexpected field landing in the rescued-data column instead of being dropped" h={250}>
      {cols.map(([chip, head, val, x, w], i) => {
        const d = easeInOut(seg(t, 0.5 + i * 0.3, 1.1 + i * 0.3));
        const landed = d >= 1;
        const rescue = i === 3;
        return (
          <g key={head}>
            {!landed && <Cell x={x} y={lerp(26, 130, d)} w={w} label={chip} o={k(0.1 + i * 0.1)} stroke={rescue ? C.caramel : C.mocha} />}
            {landed && <Cell x={x} y={130} w={w} label={val} stroke={rescue ? C.focus : C.mocha} f={rescue ? C.focus : C.crema} />}
            {t > 2.2 && (
              <T x={x + 6} y={118} s={11} f={rescue ? C.focus : C.latte} o={k(2.2)}>
                {head}
              </T>
            )}
          </g>
        );
      })}
      {t > 2.6 && (
        <T x={315} y={182} s={11} f={C.focus} o={k(2.6)}>
          with the file it came from
        </T>
      )}
      {t > 3.2 && (
        <T x={300} y={226} s={12} f={C.latte} a="middle" o={k(3.2)}>
          recovering it later is a query, not a log search
        </T>
      )}
    </Svg>
  );
}

// 6 · COPY INTO. None of the stream machinery is needed. Run one loads the first two files; one of them is edited;
// run two skips it anyway and loads only the new file.
export function CopyIntoAlternative({ t }: StepCtx) {
  const k = (d: number) => easeOut(seg(t, d, d + 0.35));
  const r1 = (i: number) => easeInOut(seg(t, 0.8 + i * 0.3, 1.3 + i * 0.3));
  const edit = k(2.0);
  const skip = easeInOut(seg(t, 2.6, 3.0));
  const nw = easeInOut(seg(t, 3.0, 3.5));
  const files = ['orders_2026-10-30.json', 'orders_2026-10-31.json', 'orders_2026-11-01.json'];
  return (
    <Svg label="COPY INTO skipping an already-loaded file even though it was modified since" h={250}>
      {['checkpoint', 'schema evolution', 'always-on stream'].map((c, i) => (
        <g key={c} opacity={k(i * 0.15)}>
          <Hole x={25 + i * 190} y={20} w={170} h={24} />
          <T x={110 + i * 190} y={36} s={11} f={C.latte} a="middle">
            {c}
          </T>
          <line x1={35 + i * 190} y1={32} x2={lerp(35, 185, k(0.4 + i * 0.15)) + i * 190} y2={32} stroke={C.cherryText} strokeWidth={1.5} />
        </g>
      ))}
      {files.map((f, i) => (
        <Cell key={f} x={25} y={70 + i * 42} w={200} label={f} o={k(0.6 + i * 0.1)} stroke={i === 1 && edit > 0.5 ? C.caramel : i === 2 ? C.focus : C.mocha} />
      ))}
      {t > 2.0 && (
        <T x={25} y={64} s={11} f={C.caramel} o={edit}>
          the middle file was edited since
        </T>
      )}
      <rect x={380} y={70} width={195} height={112} rx={6} fill={C.cocoa} stroke={C.mocha} strokeWidth={1.5} opacity={k(0.6)} />
      <T x={477} y={130} s={12} f={C.crema} a="middle" o={k(0.6)}>
        table
      </T>
      <Req x1={230} x2={375} y={84} k={r1(0)} f={C.focus} />
      {t < 2.6 ? <Req x1={230} x2={375} y={126} k={r1(1)} f={C.focus} /> : <Req x1={230} x2={375} y={126} k={skip * 0.5} f={C.cherryText} />}
      {skip >= 1 && <Cross x={318} y={142} k={1} />}
      <Req x1={230} x2={375} y={168} k={nw} f={C.focus} />
      {t > 3.5 && (
        <T x={25} y={226} s={12} f={C.second} o={k(3.5)}>
          already loaded: skipped, even if modified
        </T>
      )}
    </Svg>
  );
}

// 7 · Recap: three lines, each beside a small moving picture of its idea.
export function Recap({ t }: StepCtx) {
  const k = (i: number) => easeOut(seg(t, 0.1 + i * 0.8, 0.5 + i * 0.8));
  const items = ['two discovery modes, two real cost shapes', 'a checkpoint makes a replayed file safe', 'four schema modes, one rescued-data column'];
  return (
    <Svg label="The three-part recap of this topic's point" h={230}>
      {items.map((l, i) => (
        <T key={l} x={110} y={48 + i * 60} s={13} f={C.crema} o={k(i)}>
          {l}
        </T>
      ))}
      <g opacity={k(0)}>
        <rect x={25} y={36} width={40 * clamp(seg(t, 0.2, 1.4))} height={6} rx={2} fill={C.cherryText} />
        <rect x={25} y={46} width={14} height={6} rx={2} fill={C.focus} />
      </g>
      <g opacity={k(1)}>
        <rect x={25} y={94} width={60} height={20} rx={4} fill="none" stroke={C.second} />
        <Pip x={lerp(30, 50, easeInOut(seg(t, 1.0, 1.6)))} y={104} s={8} f={C.focus} />
      </g>
      <g opacity={k(2)}>
        {[0, 1, 2, 3].map((j) => (
          <rect key={j} x={25 + j * 14} y={156} width={10} height={14} rx={2} fill={j === 2 ? C.focus : C.second} opacity={0.7} />
        ))}
      </g>
    </Svg>
  );
}

// 8 · Prove it. The job's profile ticks in: once a day, stable schema, fixed location. Two tools wait; once answered,
// COPY INTO lights and Auto Loader's extra machinery fades as unneeded.
export function ProveIt({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const v = answer !== null ? easeOut(seg(s, 0.1, 0.6)) : 0;
  const k = (d: number) => easeOut(seg(t, d, d + 0.3));
  const parts = ['checkpoint', 'schema evolution', 'always-on'];
  return (
    <Svg label="A once-a-day, stable-schema batch load choosing between Auto Loader and COPY INTO" h={250}>
      {['once a day', 'stable schema', 'fixed location'].map((c, i) => (
        <g key={c}>
          <Cell x={25 + i * 190} y={24} w={150} label={c} o={k(i * 0.2)} />
          <MiniTick x={182 + i * 190} y={36} k={k(0.3 + i * 0.2)} />
        </g>
      ))}
      <Cell x={25} y={90} w={250} label="Auto Loader" o={1 - 0.5 * v} />
      {parts.map((p, i) => (
        <Cell key={p} x={25 + i * 88} y={126} w={84} h={22} label={p.split(' ')[0]} o={(1 - 0.7 * v) * k(0.6)} />
      ))}
      <Cell x={325} y={90} w={250} label="COPY INTO" stroke={v > 0.5 ? C.focus : C.mocha} f={v > 0.5 ? C.focus : C.crema} />
      {v > 0.5 && <MiniTick x={560} y={102} k={v} />}
      <Verdict answer={answer} text="the lighter tool fits; nothing extra needed" y={210} />
    </Svg>
  );
}
