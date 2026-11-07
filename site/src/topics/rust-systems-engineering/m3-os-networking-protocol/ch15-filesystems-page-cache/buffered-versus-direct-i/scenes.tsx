import type { StepCtx } from '../../../../../reels/types';
import { easeOut, seg } from '../../../../../reels/anim';
import { Code } from '../../../../../reels/Code';
import { Draw, Stack, Svg, T, C } from '../../../../../reels/kit';

// readahead() genuinely brings pages in before any read; DONTNEED genuinely evicts them
// once they're clean; O_DIRECT genuinely never lets them in at all — one page cache,
// pulled three different directions.
const fa = (t: number, a: number, d = 0.4) => easeOut(seg(t, a, a + d));

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
  const pages = [0, 1, 2, 3, 4, 5, 6, 7];
  return (
    <Svg label="readahead_populates_the_page_cache.rs: a real measurement" h={200}>
      <T x={60} y={60} s={14} f={C.crema} o={fa(t, 0.3, 0.4)}>before readahead: no pages resident</T>
      {pages.map((i) => {
        const fill = easeOut(seg(t, 0.6 + i * 0.05, 0.85 + i * 0.05));
        return <rect key={i} x={66 + i * 26} y={70} width={20} height={14} rx={2} fill={C.caramel} opacity={fill} />;
      })}
      <rect x={60} y={85} width={260} height={44} rx={6} fill="none" stroke={C.caramel} strokeWidth={2} />
      {fa(t, 1.3, 0.4) > 0.85 && <T x={190} y={112} s={13} a="middle" f={C.mocha}>after readahead: every page resident</T>}
      <T x={60} y={160} s={13} f={C.latte} o={fa(t, 1.8, 0.4)}>no read() call happened in between</T>
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
  const pages = [0, 1, 2, 3, 4, 5, 6, 7];
  return (
    <Svg label="fadvise_dontneed_evicts_resident_pages.rs: a real check" h={200}>
      <T x={60} y={60} s={14} f={C.crema} o={fa(t, 0.3, 0.4)}>after readahead: every page resident</T>
      {pages.map((i) => {
        const empty = easeOut(seg(t, 0.6 + i * 0.05, 0.85 + i * 0.05));
        return <rect key={i} x={66 + i * 26} y={70} width={20} height={14} rx={2} fill={C.caramel} opacity={1 - empty} />;
      })}
      <rect x={60} y={85} width={260} height={44} rx={6} fill="none" stroke={C.caramel} strokeWidth={2} />
      {fa(t, 1.3, 0.4) > 0.85 && <T x={190} y={112} s={13} a="middle" f={C.mocha}>after DONTNEED: none resident at all</T>}
      <T x={60} y={160} s={13} f={C.latte} o={fa(t, 1.8, 0.4)}>a hint, documented as non-binding, that works</T>
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
  const pages = [0, 1, 2, 3, 4, 5, 6, 7];
  return (
    <Svg label="direct_io_never_populates_the_page_cache.rs: a real check" h={200}>
      <T x={60} y={60} s={14} f={C.crema} o={fa(t, 0.3, 0.4)}>buffered read: every page resident</T>
      {pages.map((i) => {
        const fill = easeOut(seg(t, 0.6 + i * 0.05, 0.85 + i * 0.05));
        return <rect key={i} x={66 + i * 26} y={70} width={20} height={14} rx={2} fill={C.caramel} opacity={fill} />;
      })}
      <rect x={60} y={85} width={260} height={44} rx={6} fill="none" stroke={C.caramel} strokeWidth={2} />
      {fa(t, 1.3, 0.4) > 0.85 && <T x={190} y={112} s={13} a="middle" f={C.mocha}>direct read: no page resident at all</T>}
      <T x={60} y={160} s={13} f={C.latte} o={fa(t, 1.8, 0.4)}>the cache never even sees it happen</T>
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
    'readahead pulls pages in before any read',
    'DONTNEED evicts them once they are clean',
    'O_DIRECT never lets a page in at all',
    'none of this means a byte is durable',
  ];
  return (
    <Svg label="recap: a real cache, pulled three real ways" h={300}>
      {rows.map((r, i) => (
        <g key={r} opacity={fa(t, 0.2 + i * 0.4, 0.4)}>
          <circle cx={30} cy={40 + i * 55} r={5} fill={C.caramel} />
          <T x={48} y={46 + i * 55} s={13} f={C.crema}>{r}</T>
        </g>
      ))}
    </Svg>
  );
}
