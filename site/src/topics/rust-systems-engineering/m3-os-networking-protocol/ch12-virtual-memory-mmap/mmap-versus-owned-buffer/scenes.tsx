import type { StepCtx } from '../../../../../reels/types';
import { easeOut, lerp, seg } from '../../../../../reels/anim';
import { Code } from '../../../../../reels/Code';
import { Stack, Svg, T, C, Reticle } from '../../../../../reels/kit';

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
  const n = 8;
  return (
    <Svg label="mmap_holds_the_same_bytes_twice.rs: a real measurement" h={200}>
      <T x={60} y={30} s={13} f={C.quiet}>the mapping's own pages</T>
      {Array.from({ length: n }).map((_, i) => {
        const k = easeOut(seg(t, 0.15 + i * 0.05, 0.15 + i * 0.05 + 0.25));
        return <rect key={i} x={60 + i * 28} y={40} width={22} height={22} rx={3} fill={C.caramel} opacity={k} />;
      })}
      <T x={60} y={95} s={13} f={C.quiet}>the app's own cache</T>
      {Array.from({ length: n }).map((_, i) => {
        const k = easeOut(seg(t, 0.5 + i * 0.05, 0.5 + i * 0.05 + 0.25));
        return <rect key={i} x={60 + i * 28} y={105} width={22} height={22} rx={3} fill={C.mocha} opacity={k} />;
      })}
      <T x={60} y={160} s={13} f={C.latte} o={fa(t, 1.1, 0.3)}>the same bytes, held twice at once</T>
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
  const bounceX = lerp(260, 200, easeOut(seg(t, 0.2, 0.4)));
  const passX = lerp(260, 420, easeOut(seg(t, 0.7, 1.0)));
  return (
    <Svg label="direct_io_rejects_misaligned_buffers.rs: a real check" h={200}>
      <line x1={260} y1={25} x2={260} y2={115} stroke={C.mocha} strokeWidth={1.5} strokeDasharray="4 4" />
      <T x={260} y={128} s={11} a="middle" f={C.taupe}>alignment gate</T>
      <circle cx={bounceX} cy={55} r={5} fill={C.cherryText} opacity={fa(t, 0.2, 0.2)} />
      <circle cx={passX} cy={95} r={5} fill={C.caramel} opacity={fa(t, 0.7, 0.2)} />
      <T x={60} y={135} s={13} f={C.mocha} o={fa(t, 0.5, 0.3)}>misaligned buffer: fails outright, EINVAL</T>
      <T x={60} y={165} s={13} f={C.latte} o={fa(t, 1.0, 0.3)}>aligned buffer: succeeds cleanly</T>
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
      <T x={60} y={50} s={13} f={C.crema} o={fa(t, 0.2, 0.4)}>working set fits in memory, workload read-only</T>
      <Reticle x={260} y={85} w={300} h={40} t={t} at={0.7} />
      <T x={60} y={95} s={13} f={C.latte} o={fa(t, 0.6, 0.4)}>exactly the case LMDB's own design is built around</T>
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
