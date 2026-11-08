import type { StepCtx } from '../../../../../reels/types';
import { easeOut, seg, lerp } from '../../../../../reels/anim';
import { Code } from '../../../../../reels/Code';
import { Reticle, Decode, Draw, Stack, Svg, T, C } from '../../../../../reels/kit';

// A per-update fsync makes one real syscall per write; batching into WAL-style flush
// points makes a dramatically smaller number for the identical writes, and is also
// dramatically faster — and none of it is durable until a volatile write cache is
// actually forced to tell the truth.
const fa = (t: number, a: number, d = 0.4) => easeOut(seg(t, a, a + d));

// Writes land on a timeline left to right; a write at a flush point sends an fsync stem down to the disk line,
// and the counter of real fsync calls climbs to the traced total as the writes go by.
function SyncTimeline({ t, every, total }: { t: number; every: number; total: number }) {
  const writes = Array.from({ length: 20 }, (_, i) => i);
  const k = easeOut(seg(t, 0.4, 1.9));
  return (
    <g>
      <T x={40} y={44} s={13} f={C.taupe}>writes</T>
      <T x={40} y={150} s={13} f={C.taupe}>disk</T>
      <line x1={110} y1={140} x2={570} y2={140} stroke={C.mocha} />
      {writes.map((i) => {
        const at = 0.4 + i * 0.075;
        const land = easeOut(seg(t, at, at + 0.2));
        const x = 118 + i * 22.5;
        const flush = i % every === every - 1;
        return (
          <g key={i}>
            <rect x={x - 7} y={lerp(20, 48, land)} width={14} height={14} rx={2} fill={C.caramel} opacity={land} />
            {flush && <Draw pts={[[x, 66], [x, 138]]} t={t} from={at + 0.15} to={at + 0.35} stroke={C.cherryText} w={1.5} />}
          </g>
        );
      })}
      <T x={300} y={190} s={15} a="middle" f={C.crema} w={600}>{`fsync calls: ${Math.round(total * k)}`}</T>
      <Reticle x={300} y={185} w={230} h={34} t={t} at={2.15} />
    </g>
  );
}

// A list row that lands on its beat: its text slides in from the left while its marker draws
// (a tick for a recap point, a growing dot for one of several names, a cross for a failure).
function Row({ t, at, y, text, mark = 'tick' }: { t: number; at: number; y: number; text: string; mark?: 'tick' | 'dot' | 'cross' }) {
  const k = easeOut(seg(t, at, at + 0.45));
  return (
    <g>
      {mark === 'tick' && <Draw pts={[[23, y], [28, y + 5], [37, y - 6]]} t={t} from={at + 0.1} to={at + 0.4} stroke={C.caramel} w={2} />}
      {mark === 'cross' && <Draw pts={[[25, y - 5], [35, y + 5]]} t={t} from={at + 0.1} to={at + 0.3} stroke={C.cherryText} w={2} />}
      {mark === 'cross' && <Draw pts={[[35, y - 5], [25, y + 5]]} t={t} from={at + 0.25} to={at + 0.45} stroke={C.cherryText} w={2} />}
      {mark === 'dot' && <circle cx={30} cy={y} r={5 * k} fill={C.caramel} />}
      <g opacity={k} transform={`translate(${((1 - k) * -28).toFixed(1)} 0)`}>
        <T x={48} y={y + 6} s={13} f={C.crema}>{text}</T>
      </g>
    </g>
  );
}

// ── 1 · fsync after every write (predict, hook) ─────────────────────────────────────────────────
export function PerUpdatePredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="a thousand writes, each followed by a real fsync"
        lines={['for i in 0..1000 {', '    write(record); sync_all()?;', '}', '// how many real fsync syscalls?']}
        t={t}
        start={0.1}
        end={2.6}
        highlight={[1]}
      />
    </Stack>
  );
}

// ── 2 · Measured: exactly 1000 (this is the swipe test's "from" step — NO takeaway) ─────────────
export function PerUpdateReveal({ t }: StepCtx) {
  return (
    <Svg label="fsync_per_update.rs, traced: one call per write" h={240}>
      <SyncTimeline t={t} every={1} total={1000} />
      <T x={300} y={228} s={13} a="middle" f={C.latte} o={fa(t, 1.9, 0.4)}>confirmed by strace, not assumed</T>
    </Svg>
  );
}

// ── 3 · Batching into flush points (predict) ────────────────────────────────────────────────────
export function BatchedPredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="the same writes, flushed every fifty records"
        lines={['for i in 0..1000 {', '    write(record);', '    if (i+1) % 50 == 0 { sync_all()?; }', '}']}
        t={t}
        start={0.1}
        end={2.6}
        highlight={[2]}
      />
    </Stack>
  );
}

// ── 4 · Measured: 21 real fsync calls, not 1000 (takeaway) ──────────────────────────────────────
export function BatchedReveal({ t }: StepCtx) {
  return (
    <Svg label="fsync_batched_flush_points.rs: a real trace" h={240}>
      <SyncTimeline t={t} every={5} total={21} />
      <T x={300} y={228} s={13} a="middle" f={C.latte} o={fa(t, 1.9, 0.4)}>one flush per batch, not per write</T>
    </Svg>
  );
}

// ── 5 · Does the time drop by the same factor? (predict) ────────────────────────────────────────
export function TimingPredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="the same two binaries, timed instead of counted"
        lines={['let start = Instant::now();', '// run the per-update loop, then the batched loop', '// does elapsed time drop by the same factor?']}
        t={t}
        start={0.1}
        end={2.6}
        highlight={[0]}
      />
    </Stack>
  );
}

// ── 6 · Measured: dramatically faster, for the identical writes (takeaway) ──────────────────────
export function TimingReveal({ t }: StepCtx) {
  const bar1 = easeOut(seg(t, 0.4, 0.9));
  const bar2 = easeOut(seg(t, 0.95, 1.3));
  return (
    <Svg label="both binaries, timed on the same 1000 writes" h={200}>
      <T x={60} y={60} s={14} f={C.crema} o={fa(t, 0.3, 0.4)}>per-update: a thousand real waits</T>
      <rect x={60} y={70} width={bar1 * 240} height={12} rx={3} fill={C.caramel} opacity={0.7} />
      <rect x={60} y={85} width={260} height={44} rx={6} fill="none" stroke={C.caramel} strokeWidth={2} />
      <rect x={70} y={98} width={bar2 * 8} height={12} rx={3} fill={C.taupe} opacity={0.9} />
      {fa(t, 1.1, 0.4) > 0.85 && <T x={190} y={122} s={13} a="middle" f={C.mocha}>batched: far less real wall-clock time</T>}
      <T x={60} y={160} s={13} f={C.latte} o={fa(t, 1.6, 0.4)}>same writes, far less waiting</T>
    </Svg>
  );
}

// ── 7 · What does PostgreSQL's own WAL avoid flushing? (predict) ────────────────────────────────
export function WalDocPredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="PostgreSQL's own documentation, on why WAL helps"
        lines={['// a transaction commits:', '// flush the WAL file only, or every data file it touched?']}
        t={t}
        start={0.1}
        end={2.4}
        highlight={[1]}
      />
    </Stack>
  );
}

// ── 8 · The documentation's own words, quoted (no takeaway, connecting step) ────────────────────
export function WalDocReveal({ t }: StepCtx) {
  const slide1 = easeOut(seg(t, 0.2, 0.55));
  const slide2 = easeOut(seg(t, 0.7, 1.05));
  return (
    <Svg label="PostgreSQL's own WAL documentation, quoted" h={160}>
      <g transform={`translate(${(1 - slide1) * -70},0)`} opacity={slide1}>
        <T x={60} y={70} s={13} f={C.crema}>only the WAL file needs flushing, not every file</T>
      </g>
      <g transform={`translate(${(1 - slide2) * -70},0)`} opacity={slide2}>
        <T x={60} y={100} s={13} f={C.latte}>one flush can cover many transactions at once</T>
      </g>
    </Svg>
  );
}

// ── 9 · A volatile write cache, and what forces it to tell the truth (takeaway) ─────────────────
export function FuaReveal({ t }: StepCtx) {
  // The same write, twice. Without FUA the drive answers "done" from its volatile cache while the data still
  // sits there; with FUA the block goes on to the media first, and only then does "done" come back.
  const lane = (y: number, fua: boolean, at: number) => {
    const toCache = easeOut(seg(t, at, at + 0.4));
    const toMedia = fua ? easeOut(seg(t, at + 0.45, at + 0.85)) : 0;
    const back0 = at + (fua ? 0.9 : 0.45);
    const bx = toMedia > 0 ? lerp(300, 500, toMedia) : lerp(90, 300, toCache);
    const from: [number, number] = fua ? [500, y + 12] : [300, y + 12];
    return (
      <g>
        <T x={40} y={y - 14} s={13} f={fua ? C.crema : C.latte} o={fa(t, at - 0.1, 0.3)}>{fua ? 'with FUA' : 'cache only'}</T>
        <rect x={bx - 10} y={y - 8} width={20} height={16} rx={2} fill={C.caramel} opacity={toCache > 0 ? 1 : 0} />
        <Draw pts={[from, [70, y + 12]]} t={t} from={back0} to={back0 + 0.4} stroke={fua ? C.caramel : C.cherryText} w={1.5} />
        <Decode text={fua ? 'done after the write' : 'done too early'} t={t} at={back0 + 0.35} x={fua ? 460 : 300} y={y + 32} s={13} a="middle" f={fua ? C.caramel : C.cherryText} />
      </g>
    );
  };
  return (
    <Svg label="the kernel's own write-back-cache documentation" h={220}>
      <T x={70} y={30} s={13} a="middle" f={C.taupe}>host</T>
      <T x={300} y={30} s={13} a="middle" f={C.taupe}>volatile cache</T>
      <T x={500} y={30} s={13} a="middle" f={C.taupe}>media</T>
      <line x1={300} y1={40} x2={300} y2={200} stroke={C.mocha} strokeDasharray="3 4" />
      <line x1={500} y1={40} x2={500} y2={200} stroke={C.mocha} strokeDasharray="3 4" />
      {lane(78, false, 0.3)}
      {lane(158, true, 1.2)}
    </Svg>
  );
}

// ── 10 · Recap ────────────────────────────────────────────────────────────────────────────────────
export function Recap({ t }: StepCtx) {
  const rows = [
    'per-update fsync: 1000 real syscalls, measured',
    'batched flush points: 21 real syscalls, measured',
    'batched is also dramatically faster, for the same writes',
    'a WAL flush covers many transactions, docs confirm it',
  ];
  return (
    <Svg label="recap: fewer flushes, less waiting, same durability" h={240}>
      {rows.map((r, i) => (
        <Row key={r} t={t} at={0.2 + i * 0.45} y={40 + i * 50} text={r} />
      ))}
      <Reticle x={290} y={90} w={556} h={36} t={t} at={2.25} />
    </Svg>
  );
}
