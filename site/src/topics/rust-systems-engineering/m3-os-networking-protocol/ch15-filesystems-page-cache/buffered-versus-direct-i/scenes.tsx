import type { StepCtx } from '../../../../../reels/types';
import { easeOut, seg, lerp } from '../../../../../reels/anim';
import { Code } from '../../../../../reels/Code';
import { Reticle, Decode, Draw, Stack, Svg, T, C } from '../../../../../reels/kit';

// readahead() genuinely brings pages in before any read; DONTNEED genuinely evicts them
// once they're clean; O_DIRECT genuinely never lets them in at all — one page cache,
// pulled three different directions.
const fa = (t: number, a: number, d = 0.4) => easeOut(seg(t, a, a + d));

// The page cache as a strip of slots above the file's pages on disk: a page that becomes resident
// rises into its slot, one that is evicted sinks back to disk. `up` is 0 on disk, 1 resident.
function CacheStrip({ t, up, before, after, at }: { t: number; up: (i: number) => number; before: string; after: string; at: number }) {
  const pages = [0, 1, 2, 3, 4, 5, 6, 7];
  return (
    <g>
      <T x={60} y={40} s={13} f={C.taupe}>page cache</T>
      <rect x={60} y={50} width={250} height={40} rx={6} fill="none" stroke={C.caramel} strokeWidth={1.5} />
      <T x={60} y={190} s={13} f={C.taupe}>file on disk</T>
      {pages.map((i) => (
        <rect key={`d${i}`} x={68 + i * 30} y={150} width={22} height={20} rx={2} fill="none" stroke={C.mocha} />
      ))}
      {pages.map((i) => {
        const k = up(i);
        return <rect key={i} x={68 + i * 30} y={lerp(150, 60, k)} width={22} height={20} rx={2} fill={C.caramel} />;
      })}
      <T x={335} y={76} s={13} f={C.latte} o={1 - fa(t, at, 0.3)}>{before}</T>
      <Decode text={after} t={t} at={at + 0.2} x={335} y={76} s={13} f={C.caramel} w={600} />
    </g>
  );
}

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

// ── 1 · readahead() on a dropped file (predict, hook) ───────────────────────────────────────────
export function ReadaheadPredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="a dropped file, then a real readahead()"
        lines={['// pages confirmed dropped, via mincore', 'readahead(fd, 0, len);', '// brought back in, or not yet?']}
        t={t}
        start={0.1}
        end={2.4}
        highlight={[1]}
      />
    </Stack>
  );
}

// ── 2 · Measured: 0 resident, then all resident (this is the swipe test's "from" step — NO takeaway) ──
export function ReadaheadReveal({ t }: StepCtx) {
  // One readahead() call: every page rises from disk into the cache, with no read() in between.
  return (
    <Svg label="readahead_populates_the_page_cache.rs: a real measurement" h={230}>
      <CacheStrip t={t} up={(i) => easeOut(seg(t, 0.6 + i * 0.1, 1.0 + i * 0.1))} before="none resident" after="all resident" at={1.4} />
      <Reticle x={185} y={70} w={262} h={52} t={t} at={2.1} />
      <T x={60} y={222} s={13} f={C.latte} o={fa(t, 1.9, 0.4)}>no read() call happened in between</T>
    </Svg>
  );
}

// ── 3 · DONTNEED on freshly cached pages (predict) ──────────────────────────────────────────────
export function DontneedPredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="those same pages, now call DONTNEED"
        lines={['// every page confirmed resident', 'posix_fadvise(fd, 0, len, DONTNEED);', '// genuinely evicted, or merely a hint?']}
        t={t}
        start={0.1}
        end={2.4}
        highlight={[1]}
      />
    </Stack>
  );
}

// ── 4 · Measured: all resident, then none (takeaway) ────────────────────────────────────────────
export function DontneedReveal({ t }: StepCtx) {
  // All resident after readahead; one fadvise(DONTNEED) and every clean page sinks back to disk.
  return (
    <Svg label="fadvise_dontneed_evicts_resident_pages.rs: a real check" h={230}>
      <CacheStrip t={t} up={(i) => 1 - easeOut(seg(t, 0.7 + i * 0.08, 1.05 + i * 0.08))} before="all resident" after="none resident" at={1.4} />
      <Reticle x={185} y={70} w={262} h={52} t={t} at={2.1} />
      <T x={60} y={222} s={13} f={C.latte} o={fa(t, 1.9, 0.4)}>a non-binding hint that works</T>
    </Svg>
  );
}

// ── 5 · Buffered read vs O_DIRECT read (predict) ────────────────────────────────────────────────
export function BufferedDirectPredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="the same bytes, read two real ways"
        lines={['read(buf_fd, ptr, len);', 'pread(direct_fd, aligned_ptr, len, 0);', '// does the O_DIRECT read get cached too?']}
        t={t}
        start={0.1}
        end={2.4}
        highlight={[1]}
      />
    </Stack>
  );
}

// ── 6 · Measured: buffered caches, direct never does (takeaway) ─────────────────────────────────
export function BufferedDirectReveal({ t }: StepCtx) {
  // Two runs of the same read. Buffered: each block travels disk → cache → app and leaves a copy in the cache.
  // Direct: each block takes the lower path around the cache, which stays empty.
  const blocks = [0, 1, 2, 3];
  const cacheX = 235;
  const bx = (k: number) => lerp(50, 500, k);
  const lowY = (k: number) => 165 + Math.sin(Math.PI * k) * 30;
  return (
    <Svg label="direct_io_never_populates_the_page_cache.rs: a real check" h={240}>
      <T x={40} y={30} s={13} f={C.taupe}>disk</T>
      <T x={cacheX + 65} y={30} s={13} a="middle" f={C.taupe}>page cache</T>
      <T x={560} y={30} s={13} a="end" f={C.taupe}>app</T>
      <rect x={cacheX} y={45} width={130} height={80} rx={6} fill="none" stroke={C.caramel} strokeWidth={1.5} />
      <line x1={40} y1={85} x2={560} y2={85} stroke={C.mocha} strokeDasharray="3 5" />
      <Draw pts={Array.from({ length: 21 }, (_, i) => [bx(i / 20), lowY(i / 20)] as [number, number])} t={t} from={1.3} to={1.7} stroke={C.mocha} w={1.5} pen={false} />
      {blocks.map((i) => {
        const k = easeOut(seg(t, 0.3 + i * 0.12, 1.0 + i * 0.12));
        const x = bx(k);
        const kept = x > cacheX + 10 + i * 28;
        return (
          <g key={`b${i}`}>
            {kept && <rect x={cacheX + 10 + i * 28} y={75} width={22} height={20} rx={2} fill={C.caramel} />}
            <rect x={x} y={75} width={22} height={20} rx={2} fill={C.caramel} opacity={1 - fa(t, 1.2, 0.2)} />
          </g>
        );
      })}
      {blocks.map((i) => {
        const k = easeOut(seg(t, 1.5 + i * 0.12, 2.1 + i * 0.12));
        return <rect key={`d${i}`} x={bx(k)} y={lowY(k) - 10} width={22} height={20} rx={2} fill={C.cinnamon} opacity={k > 0 ? 1 - fa(t, 2.5, 0.2) * 0.4 : 0} />;
      })}
      <T x={40} y={65} s={13} f={C.crema} o={fa(t, 0.2, 0.3)}>buffered</T>
      <T x={40} y={150} s={13} f={C.cinnamon} o={fa(t, 1.4, 0.3)}>O_DIRECT</T>
      <Decode text="cache: every page" t={t} at={1.1} x={cacheX + 65} y={145} s={13} a="middle" f={C.caramel} w={600} />
      <T x={300} y={232} s={13} a="middle" f={C.latte} o={fa(t, 2.3, 0.4)}>direct: the cache never sees it</T>
    </Svg>
  );
}

// ── 7 · Why DONTNEED couldn't evict right after writing (predict) ──────────────────────────────
export function DirtyPredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="DONTNEED, called right after a write"
        lines={['write(fd, data, len);', 'posix_fadvise(fd, 0, len, DONTNEED);', "// what's actually stopping it?"]}
        t={t}
        start={0.1}
        end={2.2}
        highlight={[1]}
      />
    </Stack>
  );
}

// ── 8 · The documented caveat, quoted (no takeaway, connecting step) ────────────────────────────
export function DirtyReveal({ t }: StepCtx) {
  const slide1 = easeOut(seg(t, 0.2, 0.55));
  const slide2 = easeOut(seg(t, 0.7, 1.05));
  return (
    <Svg label="posix_fadvise's own documented caveat" h={160}>
      <g transform={`translate(${(1 - slide1) * -70},0)`} opacity={slide1}>
        <T x={60} y={70} s={13} f={C.crema}>a dirty page is never freed by DONTNEED</T>
      </g>
      <g transform={`translate(${(1 - slide2) * -70},0)`} opacity={slide2}>
        <T x={60} y={100} s={13} f={C.latte}>fsync or fdatasync has to write it back first</T>
      </g>
    </Svg>
  );
}

// ── 9 · One cache, pulled three ways (takeaway) ──────────────────────────────────────────────────
export function LessonReveal({ t }: StepCtx) {
  const rows = [
    'readahead: pulls pages in early',
    'DONTNEED: pushes clean pages out',
    'O_DIRECT: never lets pages in',
  ];
  return (
    <Svg label="three names, one shared cache" h={220}>
      {rows.map((r, i) => (
        <Row key={r} t={t} at={0.2 + i * 0.35} y={40 + i * 45} text={r} mark="dot" />
      ))}
      <Converge t={t} n={rows.length} y0={40} dy={45} at={1.25} verdict="who holds the page" />
    </Svg>
  );
}

// ── 10 · Recap ───────────────────────────────────────────────────────────────────────────────────
export function Recap({ t }: StepCtx) {
  const rows = [
    'readahead pulls pages in before any read',
    'DONTNEED evicts them once they are clean',
    'O_DIRECT never lets a page in at all',
    'none of this means a byte is durable',
  ];
  return (
    <Svg label="recap: a real cache, pulled three real ways" h={240}>
      {rows.map((r, i) => (
        <Row key={r} t={t} at={0.2 + i * 0.45} y={40 + i * 50} text={r} />
      ))}
      <Reticle x={290} y={140} w={556} h={36} t={t} at={2.25} />
    </Svg>
  );
}
