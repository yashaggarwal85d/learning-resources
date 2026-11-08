import type { StepCtx } from '../../../../../reels/types';
import { easeInOut, easeOut, lerp, seg } from '../../../../../reels/anim';
import { Code } from '../../../../../reels/Code';
import { Decode, Draw, Reticle, Stack, Svg, T, C } from '../../../../../reels/kit';


/** A check mark that draws itself over `k` (0..1). */
const Tick = ({ x, y, k, f = C.focus }: { x: number; y: number; k: number; f?: string }) =>
  k > 0 ? <path d={`M${x} ${y} l6 6 l12 -14`} fill="none" stroke={f} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={30} strokeDashoffset={30 * (1 - k)} /> : null;
/** A cross that draws itself over `k`. */
const Cross = ({ x, y, k, f = C.cherryText }: { x: number; y: number; k: number; f?: string }) =>
  k > 0 ? (
    <g stroke={f} strokeWidth={2.5} strokeLinecap="round">
      <line x1={x} y1={y - 7} x2={x + 14 * Math.min(1, k * 2)} y2={y - 7 + 14 * Math.min(1, k * 2)} />
      {k > 0.5 && <line x1={x + 14} y1={y - 7} x2={x + 14 - 14 * (k - 0.5) * 2} y2={y - 7 + 14 * (k - 0.5) * 2} />}
    </g>
  ) : null;

/** Recap rows: each slides in on its beat with its verdict drawing at the right; a spine draws down the left
 * through them, and the lock-on lands on row `lock` at `lockAt` (finished 0.55 s later, inside the step). `y0` is the first row's centre. */
function RecapRows({ t, rows, y0 = 40, gap = 56, start = 0.2, beat = 0.45, lock = 0, lockAt }: { t: number; rows: [string, boolean][]; y0?: number; gap?: number; start?: number; beat?: number; lock?: number; lockAt: number }) {
  const yEnd = y0 + (rows.length - 1) * gap;
  return (
    <g>
      <Draw pts={[[26, y0 - 6], [26, yEnd + 6]]} t={t} from={start - 0.05} to={start + (rows.length - 1) * beat + 0.3} stroke={C.mocha} w={1.5} pen={false} />
      {rows.map(([r, good], i) => {
        const a = start + i * beat;
        const k = easeOut(seg(t, a, a + 0.45));
        const y = y0 + i * gap;
        const hot = i === lock;
        return (
          <g key={r}>
            <g opacity={k} transform={`translate(${((1 - k) * -24).toFixed(1)} 0)`}>
              <circle cx={26} cy={y} r={hot ? 6 : 4.5} fill={hot ? C.caramel : C.crema} />
              <T x={44} y={y + 5} s={13} f={hot ? C.caramel : C.crema} w={hot ? 700 : 500}>{r}</T>
            </g>
            {good ? <Tick x={554} y={y} k={easeOut(seg(t, a + 0.3, a + 0.65))} /> : <Cross x={556} y={y} k={easeOut(seg(t, a + 0.3, a + 0.65))} />}
          </g>
        );
      })}
      <Reticle x={292} y={y0 + lock * gap} w={556} h={gap - 14} t={t} at={lockAt} />
    </g>
  );
}

// A full page doesn't reject or overwrite a new entry; it splits in two
// and hands a new key up. High fanout is exactly why that keeps the tree
// only a few levels deep, even at a huge record count. Packing a page
// less than completely full on purpose smooths out how often it has to
// split again, and a separator key only needs the shortest piece that
// still tells two sides apart.
const fa = (t: number, a: number, d = 0.4) => easeOut(seg(t, a, a + d));

// ── 1 · A full page, one more entry arriving (predict, hook) ─────────────
export function SplitPredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="a full leaf page, one more entry"
        lines={['insert_into_leaf(&mut store, leaf, key, value, fill);', '// rejected, overwritten, or split?']}
        t={t}
        start={0.1}
        end={2.6}
        highlight={[1]}
      />
    </Stack>
  );
}

// ── 2 · Measured: it splits, a real separator goes up (takeaway) ────────
export function SplitReveal({ t }: StepCtx) {
  const drop = easeOut(seg(t, 0.2, 0.55));
  const split = easeInOut(seg(t, 0.7, 1.2));
  const rise = easeOut(seg(t, 1.2, 1.6));
  const look = easeInOut(seg(t, 2.0, 2.5));
  const cell = 34;
  return (
    <Svg label="btree_fanout_split_depth_truncation.rs, measured" h={270}>
      {split < 1 && <T x={300} y={24} s={13} a="middle" f={C.latte} o={1 - split}>seven entries, full</T>}
      {/* the new key arrives */}
      {split <= 0 && <rect x={290} y={lerp(30, 90, drop)} width={24} height={24} rx={3} fill={C.caramel} opacity={drop > 0 ? 1 : 0} />}
      {Array.from({ length: 8 }, (_, i) => {
        if (i === 7 && split <= 0) return null;
        const upper = i >= 4;
        const x0 = 160 + i * cell;
        const x = upper ? lerp(x0, x0 + 110, split) : lerp(x0, x0 - 90, split);
        const isSep = i === 4;
        return (
          <g key={i}>
            <rect x={x} y={150} width={cell - 6} height={26} rx={3} fill={C.crema} />
            {/* the separator: a copy of the new page's first key rises into the new root */}
            {isSep && rise > 0 && <rect x={lerp(x, 286, rise)} y={lerp(150, 40, rise)} width={cell - 6} height={26} rx={3} fill={C.caramel} />}
          </g>
        );
      })}
      {split > 0 && <rect x={lerp(154, 64, split)} y={144} width={4 * cell + 6} height={38} rx={5} fill="none" stroke={C.latte} strokeWidth={1.5} />}
      {split > 0 && <rect x={lerp(290, 400, split)} y={144} width={4 * cell + 6} height={38} rx={5} fill="none" stroke={C.caramel} strokeWidth={1.5} strokeDasharray={split < 1 ? '4 3' : undefined} />}
      {split <= 0 && <rect x={154} y={144} width={7 * cell + 6} height={38} rx={5} fill="none" stroke={C.latte} strokeWidth={1.5} />}
      <T x={470} y={204} s={13} a="middle" f={C.caramel} o={seg(t, 1.0, 1.2)}>new page</T>
      <T x={300} y={24} s={13} a="middle" f={C.caramel} o={seg(t, 1.5, 1.7)}>new root</T>
      {rise >= 1 && <rect x={270} y={34} width={60} height={38} rx={5} fill="none" stroke={C.caramel} strokeWidth={1.5} />}
      <Draw pts={[[290, 66], [140, 142]]} t={t} from={1.55} to={1.85} stroke={C.latte} w={1.5} pen={false} />
      <Draw pts={[[310, 66], [470, 142]]} t={t} from={1.6} to={1.9} stroke={C.latte} w={1.5} pen={false} />
      {look > 0 && look < 1 && <circle cx={lerp(300, 115, look)} cy={lerp(30, 130, look)} r={6} fill={C.cinnamon} />}
      <Tick x={100} y={226} k={easeOut(seg(t, 2.5, 2.8))} f={C.cinnamon} />
      <T x={126} y={232} s={13} f={C.cinnamon} o={seg(t, 2.5, 2.8)}>original key: still found</T>
    </Svg>
  );
}
// ── 4 · Measured: depth stays within a handful of levels (takeaway) ──────
// The tree grows one level per beat, each level fanning out far wider than
// the one above, until thousands of records sit across the leaves. Beside
// it, the depth ruler only ever gains a few marks.

// ── 3 · Depth versus record count (predict) ──────────────────────────────
export function DepthPredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="record count climbing into the thousands"
        lines={['build_tree(&keys, fill_factor); // tree_height(&store, root)', '// grows with the count, or stays shallow?']}
        t={t}
        start={0.1}
        end={2.6}
        highlight={[1]}
      />
    </Stack>
  );
}

// ── 4 · Measured: depth stays within a handful of levels (takeaway) ──────
export function DepthReveal({ t }: StepCtx) {
  const levels = [1, 6, 30];
  const ys = [30, 100, 170];
  return (
    <Svg label="btree_fanout_split_depth_truncation.rs, measured" h={260}>
      {levels.map((n, l) => {
        const k = easeOut(seg(t, 0.2 + l * 0.5, 0.6 + l * 0.5));
        const span = l === 0 ? 0 : 420;
        return (
          <g key={l}>
            {Array.from({ length: n }, (_, i) => {
              const x = n === 1 ? 300 : 90 + (i / (n - 1)) * span;
              const w = l === 2 ? 10 : l === 1 ? 44 : 60;
              const parentX = l === 0 ? 300 : levels[l - 1] === 1 ? 300 : 90 + (Math.floor((i * levels[l - 1]) / n) / (levels[l - 1] - 1)) * 420;
              return (
                <g key={i} opacity={k}>
                  {l > 0 && <line x1={lerp(parentX, x, k)} y1={ys[l] - 4} x2={parentX} y2={ys[l - 1] + 22} stroke={C.mocha} strokeWidth={1} />}
                  <rect x={lerp(parentX, x, k) - w / 2} y={ys[l] - 4} width={w} height={l === 2 ? 22 : 26} rx={3} fill="none" stroke={l === 0 ? C.caramel : C.crema} strokeWidth={1.5} />
                </g>
              );
            })}
          </g>
        );
      })}
      <Draw pts={[[40, 30], [40, 192]]} t={t} from={0.2} to={1.5} stroke={C.caramel} w={2} pen={false} />
      {ys.map((y, l) => <line key={l} x1={32} y1={y + 9} x2={48} y2={y + 9} stroke={C.caramel} strokeWidth={2} opacity={seg(t, 0.4 + l * 0.5, 0.6 + l * 0.5)} />)}
      <Decode text="thousands of records" t={t} at={1.7} dur={0.45} x={300} y={222} s={15} a="middle" f={C.crema} w={700} />
      <T x={300} y={248} s={13} a="middle" f={C.caramel} o={seg(t, 2.1, 2.4)}>still only a handful of levels deep</T>
    </Svg>
  );
}
// ── 6 · Measured: less-full packing splits more often (takeaway) ─────────
// The identical inserts stream into two trees. Packed half full, a page
// splits after only a few more arrivals; packed nearly full, it holds far
// longer. Each split adds a page, and the split tally races ahead in the
// less-full tree.

// ── 5 · Which tree splits more, less-full or fuller packing (predict) ────
export function FillFactorPredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="identical inserts, different packing per split"
        lines={['build_tree(&keys, 0.5); build_tree(&keys, 0.9);', '// which one splits more overall?']}
        t={t}
        start={0.1}
        end={2.6}
        highlight={[1]}
      />
    </Stack>
  );
}

// ── 6 · Measured: less-full packing splits more often (takeaway) ─────────
export function FillFactorReveal({ t }: StepCtx) {
  const inserts = 24;
  const p = Math.floor(seg(t, 0.3, 2.1) * inserts);
  const lane = (y: number, label: string, room: number) => {
    const splits = Math.floor(p / room);
    const inLast = p % room;
    return (
      <g>
        <T x={40} y={y + 18} s={13} f={C.latte}>{label}</T>
        {Array.from({ length: splits + 1 }, (_, i) => (
          <g key={i}>
            <rect x={130 + i * 52} y={y} width={44} height={26} rx={3} fill="none" stroke={i === splits ? C.caramel : C.latte} strokeWidth={1.5} />
            <rect x={133 + i * 52} y={y + 3} width={38 * (i === splits ? inLast / room : 1)} height={20} rx={2} fill={i === splits ? C.caramel : C.taupe} opacity={0.85} />
          </g>
        ))}
      </g>
    );
  };
  return (
    <Svg label="btree_fanout_split_depth_truncation.rs, measured" h={260}>
      <T x={40} y={30} s={13} f={C.taupe}>the same inserts, one page per split</T>
      {lane(60, '0.5 fill', 3)}
      {lane(130, '0.9 fill', 7)}
      <Decode text="less full: more splits" t={t} at={2.1} dur={0.45} x={40} y={214} s={15} f={C.caramel} w={700} />
    </Svg>
  );
}
// ── 8 · Measured: shorter, and routes identically (takeaway) ─────────────
// A separator between two neighbouring keys. Everything past the first
// letter that tells them apart falls away. Then two test keys are routed
// by the full separator and by the trimmed one: both go the same way.

// ── 7 · Can a shorter separator still route correctly (predict) ──────────
export function TruncationPredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="a full key beside a shortened separator"
        lines={['truncate_separator(left_last, right_first);', '// smaller, and still routes correctly?']}
        t={t}
        start={0.1}
        end={2.6}
        highlight={[1]}
      />
    </Stack>
  );
}

// ── 8 · Measured: shorter, and routes identically (takeaway) ─────────────
export function TruncationReveal({ t }: StepCtx) {
  const trim = easeInOut(seg(t, 0.5, 1.0));
  const full = 'apricot';
  const keep = 3;
  const route = (y: number, sep: string, at: number) => {
    const a = easeInOut(seg(t, at, at + 0.45));
    return (
      <g>
        <T x={300} y={y} s={15} a="middle" f={C.caramel} w={700}>{sep}</T>
        <Draw pts={[[280, y + 8], [190, y + 44]]} t={t} from={at} to={at + 0.3} stroke={C.latte} w={1.5} pen={false} />
        <Draw pts={[[320, y + 8], [410, y + 44]]} t={t} from={at} to={at + 0.3} stroke={C.latte} w={1.5} pen={false} />
        {a > 0 && <T x={lerp(300, 170, a)} y={lerp(y - 20, y + 60, a)} s={13} a="middle" f={C.cinnamon}>apex</T>}
        {a > 0 && <T x={lerp(300, 430, a)} y={lerp(y - 20, y + 60, a)} s={13} a="middle" f={C.cinnamon}>aqua</T>}
      </g>
    );
  };
  return (
    <Svg label="btree_fanout_split_depth_truncation.rs, measured" h={290}>
      <T x={40} y={28} s={13} f={C.latte}>left: apple</T>
      <T x={560} y={28} s={13} a="end" f={C.latte}>right: apricot</T>
      {/* the letters past the first difference fall away, one by one from the end */}
      <T x={260} y={66} s={17} f={trim >= 1 ? C.caramel : C.crema} w={700}>{full.slice(0, Math.round(lerp(full.length, keep, trim)))}</T>
      <Draw pts={[[260, 74], [300, 74]]} t={t} from={1.0} to={1.25} stroke={C.caramel} w={2} pen={false} />
      <T x={40} y={66} s={13} f={C.taupe}>separator</T>
      <T x={470} y={66} s={13} f={C.caramel} o={seg(t, 1.0, 1.2)}>fewer bytes</T>
      <T x={40} y={130} s={13} f={C.taupe} o={seg(t, 1.1, 1.3)}>full</T>
      <T x={40} y={220} s={13} f={C.taupe} o={seg(t, 1.1, 1.3)}>trimmed</T>
      <g opacity={seg(t, 1.1, 1.3)}>{route(124, full, 1.3)}</g>
      <g opacity={seg(t, 1.1, 1.3)}>{route(214, full.slice(0, keep), 1.6)}</g>
      <Tick x={540} y={234} k={easeOut(seg(t, 2.2, 2.5))} />
    </Svg>
  );
}

// ── 9 · PostgreSQL's nbtree README on suffix truncation (connecting) ─────
export function NbtreeReveal({ t }: StepCtx) {
  const trim = easeInOut(seg(t, 0.6, 1.2));
  const more = easeOut(seg(t, 1.2, 1.8));
  const full = 120, short = 44;
  const w = lerp(full, short, trim);
  const n0 = 3, n1 = 8;
  const px = 40, pw = 520;
  return (
    <Svg label="PostgreSQL nbtree README, quoted" h={270}>
      <T x={px} y={24} s={13} f={C.taupe}>one parent page</T>
      <rect x={px} y={34} width={pw} height={40} rx={5} fill="none" stroke={C.crema} strokeWidth={1.5} />
      {Array.from({ length: n1 }, (_, i) => {
        const extra = i >= n0;
        const x = px + 10 + i * (w + 10) * (extra ? 1 : 1);
        if (extra && more <= 0) return null;
        const slide = extra ? lerp(pw, 0, easeOut(seg(t, 1.2 + (i - n0) * 0.08, 1.6 + (i - n0) * 0.08))) : 0;
        return <rect key={i} x={x + slide} y={44} width={w} height={20} rx={3} fill={extra ? C.caramel : C.crema} opacity={extra ? more : 1} />;
      })}
      {/* one child pointer per gap between separators */}
      {Array.from({ length: n1 + 1 }, (_, i) => {
        const shown = i <= n0 ? 0.2 : 1.6 + (i - n0) * 0.06;
        const x0 = px + 5 + i * (short + 10);
        const xc = 40 + i * (520 / n1);
        const xs = i <= n0 ? px + 5 + i * (w + 10) : x0;
        return <Draw key={i} pts={[[xs, 76], [xc, 140]]} t={t} from={shown} to={shown + 0.35} stroke={i <= n0 ? C.latte : C.caramel} w={1.5} pen={false} />;
      })}
      {Array.from({ length: n1 + 1 }, (_, i) => {
        const shown = i <= n0 ? 0.4 : 1.8 + (i - n0) * 0.06;
        return <rect key={i} x={40 + i * (520 / n1) - 12} y={142} width={24} height={16} rx={2} fill="none" stroke={C.latte} opacity={easeOut(seg(t, shown, shown + 0.2))} />;
      })}
      <Decode text="more children per page" t={t} at={2.0} dur={0.4} x={300} y={186} s={13} a="middle" f={C.caramel} />
      <T x={40} y={226} s={13} f={C.crema} o={seg(t, 2.0, 2.3)}>“to improve index fan-out”</T>
      <Draw pts={[[40, 234], [262, 234]]} t={t} from={2.2} to={2.6} stroke={C.caramel} w={1.5} pen={false} />
    </Svg>
  );
}
// ── 10 · Recap ────────────────────────────────────────────────────────────
// A root page fans out wide over its leaves, one pointer per beat: the
// shallow, wide shape the whole topic built. Then the lessons land.

// ── 10 · Recap ────────────────────────────────────────────────────────────
export function Recap({ t }: StepCtx) {
  const n = 10;
  return (
    <Svg label="recap: what fanout buys, what keeps it cheap" h={350}>
      <rect x={250} y={14} width={100} height={26} rx={4} fill="none" stroke={C.caramel} strokeWidth={2} opacity={seg(t, 0.1, 0.3)} />
      {Array.from({ length: n }, (_, i) => {
        const a = 0.25 + i * 0.05;
        const xc = 50 + i * (500 / (n - 1));
        return (
          <g key={i}>
            <Draw pts={[[300, 40], [xc, 82]]} t={t} from={a} to={a + 0.3} stroke={C.latte} w={1.2} pen={false} />
            <rect x={xc - 14} y={84} width={28} height={14} rx={2} fill={C.crema} opacity={easeOut(seg(t, a + 0.25, a + 0.45))} />
          </g>
        );
      })}
      <RecapRows
        t={t}
        y0={142}
        gap={52}
        start={1.0}
        beat={0.3}
        lockAt={2.4}
        rows={[
          ['a full page splits, a key goes up', true],
          ['high fanout keeps depth shallow', true],
          ['fill factor smooths how often it splits', true],
          ['truncation keeps separators small', true],
        ]}
        lock={1}
      />
    </Svg>
  );
}
