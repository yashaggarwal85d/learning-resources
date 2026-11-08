import type { StepCtx } from '../../../../../reels/types';
import { easeOut, seg } from '../../../../../reels/anim';
import { Code } from '../../../../../reels/Code';
import { Reticle, Decode, Draw, Stack, Svg, T, C } from '../../../../../reels/kit';

// Mapping a file genuinely holds the same bytes twice once an application keeps its own
// cache; direct I/O removes that only by making alignment the caller's own responsibility;
// and the paper's own four failure classes are why most DBMSs own their buffer pool instead.
const fa = (t: number, a: number, d = 0.4) => easeOut(seg(t, a, a + d));

// Several names pour into one idea: a line from each row's dot runs down the left gutter into one node,
// where the idea they share decodes and is locked on.
function Converge({ t, n, y0, dy, at, verdict }: { t: number; n: number; y0: number; dy: number; at: number; verdict: string }) {
  const yN = y0 + n * dy + 5;
  const k = easeOut(seg(t, at + 0.5, at + 0.8));
  const w = 44 + verdict.length * 10;
  return (
    <g>
      {Array.from({ length: n }, (_, i) => (
        <Draw key={i} pts={[[30, y0 + i * dy], [14, y0 + i * dy], [14, yN], [30, yN]]} t={t} from={at + i * 0.1} to={at + 0.5 + i * 0.1} stroke={C.taupe} w={1.5} />
      ))}
      <circle cx={30} cy={yN} r={7 * k} fill={C.caramel} />
      <Decode text={verdict} t={t} at={at + 0.6} x={48} y={yN + 5} s={14} f={C.caramel} w={600} />
      <Reticle x={20 + w / 2} y={yN} w={w} h={30} t={t} at={at + 1.0} />
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

// ── 1 · Map a file, also keep an app-level cache (predict, hook) ────────────────────────────────
export function DoubleCachePredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="map a file, also keep your own cache of it"
        lines={['let map = unsafe { Mmap::map(&file)? };', 'let app_cache: Vec<u8> = fs::read(&path)?;', '// resident once, or twice?']}
        t={t}
        start={0.1}
        end={2.4}
        highlight={[0, 1]}
      />
    </Stack>
  );
}

// ── 2 · Measured: both resident at once (this is the swipe test's "from" step — NO takeaway) ────
export function DoubleCacheReveal({ t }: StepCtx) {
  const copy = easeOut(seg(t, 0.5, 0.85));
  const dy = (1 - copy) * -24;
  return (
    <Svg label="mmap_holds_the_same_bytes_twice.rs: a real measurement" h={200}>
      <T x={60} y={60} s={14} f={C.crema} o={fa(t, 0.3, 0.4)}>the mapping's own pages: fully resident</T>
      <rect x={60} y={85} width={260} height={44} rx={6} fill="none" stroke={C.caramel} strokeWidth={2} />
      <g transform={`translate(0,${dy})`} opacity={copy}>
        <T x={190} y={112} s={13} a="middle" f={C.mocha}>the app's own cache: a full copy again</T>
      </g>
      <T x={60} y={160} s={13} f={C.latte} o={fa(t, 1.5, 0.4)}>the same bytes, held twice at once</T>
    </Svg>
  );
}

// ── 3 · O_DIRECT with a misaligned buffer (predict) ─────────────────────────────────────────────
export function AlignPredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="O_DIRECT, read into a misaligned buffer"
        lines={['let fd = open(path, O_RDONLY | O_DIRECT);', 'pread(fd, misaligned_ptr, ALIGN, 0);', '// quiet, slow, or outright fails?']}
        t={t}
        start={0.1}
        end={2.4}
        highlight={[1]}
      />
    </Stack>
  );
}

// ── 4 · Measured: EINVAL misaligned, success aligned (takeaway) ─────────────────────────────────
export function AlignReveal({ t }: StepCtx) {
  const bounce = easeOut(seg(t, 0.5, 0.75));
  const dx = (1 - Math.abs(bounce - 0.5) * 2) * 20;
  return (
    <Svg label="direct_io_rejects_misaligned_buffers.rs: a real check" h={200}>
      <T x={60} y={60} s={14} f={C.crema} o={fa(t, 0.3, 0.4)}>misaligned buffer: fails outright, EINVAL</T>
      <circle cx={280 + dx} cy={57} r={4} fill={C.cherry} opacity={fa(t, 0.5, 0.2)} />
      <rect x={60} y={85} width={260} height={44} rx={6} fill="none" stroke={C.caramel} strokeWidth={2} />
      {fa(t, 1.0, 0.4) > 0.85 && <T x={190} y={112} s={13} a="middle" f={C.mocha}>aligned buffer: succeeds cleanly</T>}
      <T x={60} y={160} s={13} f={C.latte} o={fa(t, 1.5, 0.4)}>no cache, but alignment is strict now</T>
    </Svg>
  );
}

// ── 5 · Does a mapped page's real I/O error come back as a normal Result? (predict) ─────────────
export function SigbusPredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="a mapped page the OS genuinely can't read"
        lines={['let map = unsafe { Mmap::map(&file)? };', 'let byte = map[offset]; // bad sector underneath', '// Result, or something else entirely?']}
        t={t}
        start={0.1}
        end={2.4}
        highlight={[1]}
      />
    </Stack>
  );
}

// ── 6 · The paper's own four failure classes, quoted (takeaway) ─────────────────────────────────
export function FourFailuresReveal({ t }: StepCtx) {
  const rows = [
    'transactional safety: a page flushed at the wrong moment',
    'I/O stalls: a page fault with no promised end',
    'error handling: SIGBUS, not a Result',
    'TLB shootdown: every other thread, paused to unmap',
  ];
  return (
    <Svg label="the paper's own four failure classes" h={260}>
      {rows.map((r, i) => (
        <Row key={r} t={t} at={0.2 + i * 0.3} y={40 + i * 45} text={r} mark="cross" />
      ))}
    </Svg>
  );
}

// ── 7 · Is there ever a real system where mapping is still right? (predict) ─────────────────────
export function ExceptionPredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="four real costs — ever still worth paying?"
        lines={['// LMDB maps its data file directly', '// read-mostly, no bounded-latency need', '// never worth it, or exactly this case?']}
        t={t}
        start={0.1}
        end={2.4}
        highlight={[0]}
      />
    </Stack>
  );
}

// ── 8 · The paper's own exception, quoted (no takeaway, connecting step) ────────────────────────
export function ExceptionReveal({ t }: StepCtx) {
  const slide1 = easeOut(seg(t, 0.2, 0.55));
  const slide2 = easeOut(seg(t, 0.7, 1.05));
  return (
    <Svg label="the paper's own closing recommendation" h={160}>
      <g transform={`translate(${(1 - slide1) * -70},0)`} opacity={slide1}>
        <T x={60} y={70} s={13} f={C.crema}>working set fits in memory, workload read-only</T>
      </g>
      <g transform={`translate(${(1 - slide2) * -70},0)`} opacity={slide2}>
        <T x={60} y={100} s={13} f={C.latte}>exactly the case LMDB's own design is built around</T>
      </g>
    </Svg>
  );
}

// ── 9 · One question, three answers (takeaway) ───────────────────────────────────────────────────
export function LessonReveal({ t }: StepCtx) {
  const rows = [
    'double caching: who holds the bytes, how many times',
    'alignment: who guarantees the buffer is safe',
    'four failures: who finds out when it goes wrong',
  ];
  return (
    <Svg label="three names, one shared question" h={220}>
      {rows.map((r, i) => (
        <Row key={r} t={t} at={0.2 + i * 0.35} y={40 + i * 45} text={r} mark="dot" />
      ))}
      <Converge t={t} n={rows.length} y0={40} dy={45} at={1.25} verdict="who moves the page" />
    </Svg>
  );
}

// ── 10 · Recap ───────────────────────────────────────────────────────────────────────────────────
export function Recap({ t }: StepCtx) {
  const rows = [
    'a mapped file holds the same bytes twice',
    "direct I/O makes alignment the caller's own job",
    "four failure classes most DBMSs can't afford",
    'except the read-mostly case LMDB is built for',
  ];
  return (
    <Svg label="recap: a real double cache, a real alignment gate" h={240}>
      {rows.map((r, i) => (
        <Row key={r} t={t} at={0.2 + i * 0.45} y={40 + i * 50} text={r} />
      ))}
      <Reticle x={290} y={140} w={556} h={36} t={t} at={2.25} />
    </Svg>
  );
}
