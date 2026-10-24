import type { StepCtx } from '../../../../../reels/types';
import { easeOut, seg } from '../../../../../reels/anim';
import { Code } from '../../../../../reels/Code';
import { Stack, Svg, T, C } from '../../../../../reels/kit';

// Mapping a file genuinely holds the same bytes twice once an application keeps its own
// cache; direct I/O removes that only by making alignment the caller's own responsibility;
// and the paper's own four failure classes are why most DBMSs own their buffer pool instead.
const fa = (t: number, a: number, d = 0.4) => easeOut(seg(t, a, a + d));

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
  return (
    <Svg label="mmap_holds_the_same_bytes_twice.rs: a real measurement" h={200}>
      <T x={60} y={60} s={14} f={C.crema} o={fa(t, 0.3, 0.4)}>the mapping's own pages: fully resident</T>
      <g opacity={fa(t, 0.9, 0.4)}>
        <rect x={60} y={85} width={260} height={44} rx={6} fill="none" stroke={C.caramel} strokeWidth={2} />
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
  return (
    <Svg label="direct_io_rejects_misaligned_buffers.rs: a real check" h={200}>
      <T x={60} y={60} s={14} f={C.crema} o={fa(t, 0.3, 0.4)}>misaligned buffer: fails outright, EINVAL</T>
      <g opacity={fa(t, 0.9, 0.4)}>
        <rect x={60} y={85} width={260} height={44} rx={6} fill="none" stroke={C.caramel} strokeWidth={2} />
        <T x={190} y={112} s={13} a="middle" f={C.mocha}>aligned buffer: succeeds cleanly</T>
      </g>
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
        <g key={r} opacity={fa(t, 0.2 + i * 0.3, 0.4)}>
          <circle cx={30} cy={40 + i * 45} r={5} fill={C.caramel} />
          <T x={48} y={46 + i * 45} s={13} f={C.crema}>{r}</T>
        </g>
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
  return (
    <Svg label="the paper's own closing recommendation" h={160}>
      <T x={60} y={70} s={13} f={C.crema} o={fa(t, 0.3, 0.4)}>working set fits in memory, workload read-only</T>
      <T x={60} y={100} s={13} f={C.latte} o={fa(t, 0.9, 0.4)}>exactly the case LMDB's own design is built around</T>
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
        <g key={r} opacity={fa(t, 0.2 + i * 0.35, 0.4)}>
          <circle cx={30} cy={40 + i * 45} r={5} fill={C.caramel} />
          <T x={48} y={46 + i * 45} s={13} f={C.crema}>{r}</T>
        </g>
      ))}
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
    <Svg label="recap: a real double cache, a real alignment gate" h={300}>
      {rows.map((r, i) => (
        <g key={r} opacity={fa(t, 0.2 + i * 0.4, 0.4)}>
          <circle cx={30} cy={40 + i * 55} r={5} fill={C.caramel} />
          <T x={48} y={46 + i * 55} s={13} f={C.crema}>{r}</T>
        </g>
      ))}
    </Svg>
  );
}
