import { useState, type ReactNode } from 'react';
import type { StepCtx } from '../../../../../reels/types';
import { clamp, easeInOut, easeOut, easeOutBack, fmt, lerp, rng, seg } from '../../../../../reels/anim';
import { C, MONO, SERIF } from '../../../../../reels/kit';

// Every scene is drawn on a 600 × 520 canvas and is a pure function of time. Colours and fonts come from the kit (DESIGN.md).

function Frame({ label, children, h = 520 }: { label: string; children: ReactNode; h?: number }) {
  return (
    <svg viewBox={`0 0 600 ${h}`} className="h-full w-full overflow-visible" role="img" aria-label={label}>
      {children}
    </svg>
  );
}

// `ph`: scale up on phones like kit.T (--svg-text-scale); used by the scenes whose text came out under the 9px floor there.
const Mono = ({ x, y, size = 13, fill = C.latte, anchor = 'start', o = 1, children, weight = 500, ph = false }: { x: number; y: number; size?: number; fill?: string; anchor?: 'start' | 'middle' | 'end'; o?: number; children: ReactNode; weight?: number; ph?: boolean }) => (
  <text x={x} y={y} fontFamily={MONO} fontSize={size} style={ph ? { fontSize: `calc(${size}px * var(--svg-text-scale, 1))` } : undefined} fill={fill} textAnchor={anchor} opacity={o} fontWeight={weight} letterSpacing="0.04em">
    {children}
  </text>
);
const Serif = ({ x, y, size = 30, fill = C.crema, anchor = 'start', o = 1, italic = false, children }: { x: number; y: number; size?: number; fill?: string; anchor?: 'start' | 'middle' | 'end'; o?: number; italic?: boolean; children: ReactNode }) => (
  <text x={x} y={y} fontFamily={SERIF} fontSize={size} fill={fill} textAnchor={anchor} opacity={o} fontWeight={700} fontStyle={italic ? 'italic' : 'normal'}>
    {children}
  </text>
);

/** A burst of sparks at (x, y), `k` seconds after it fired. */
function Burst({ x, y, k, color = C.caramel, n = 10 }: { x: number; y: number; k: number; color?: string; n?: number }) {
  if (k < 0 || k > 0.7) return null;
  const e = easeOut(k / 0.7);
  return (
    <g opacity={1 - e}>
      {Array.from({ length: n }, (_, i) => {
        const a = (i / n) * Math.PI * 2 + 0.3;
        const r = 6 + 26 * e;
        return <circle key={i} cx={x + Math.cos(a) * r} cy={y + Math.sin(a) * r} r={2.2 * (1 - e) + 0.6} fill={color} />;
      })}
    </g>
  );
}

// The table as a grid of tiles: 24 × 12 tiles standing for 1,000,000 pages.
const GRID = { cols: 24, rows: 12, size: 20, gap: 3 };
const gridX0 = (600 - (GRID.cols * (GRID.size + GRID.gap) - GRID.gap)) / 2;
const tilePos = (i: number, y0: number, g = GRID, x0 = gridX0) => ({
  x: x0 + (i % g.cols) * (g.size + g.gap),
  y: y0 + Math.floor(i / g.cols) * (g.size + g.gap),
});

// ── 1 · The problem ────────────────────────────────────────────────────────
export function Problem({ t }: StepCtx) {
  const sql = "SELECT * FROM orders WHERE status = 'refunded';";
  const chars = Math.floor(seg(t, 0.5, 2.2) * sql.length);
  const n = GRID.cols * GRID.rows;
  const ask = easeOutBack(seg(t, 2.6, 3.4));
  return (
    <Frame h={490} label="A table of one million pages and a query that matches 2% of its rows: index or full scan?">
      <Serif x={25} y={36} size={28}>orders</Serif>
      <Mono ph x={160} y={34} size={17}>100,000,000 rows · 1,000,000 pages</Mono>
      <rect x={25} y={52} width={550} height={40} rx={10} fill={C.roast} stroke={C.mocha} />
      {/* fixed size, not `ph`: at 49 characters this line already nearly fills the 550-wide box; the phone text-scale would push it past the edge */}
      <Mono x={42} y={77} size={16} fill={C.crema}>
        {sql.slice(0, chars)}
        {t < 2.6 && <tspan fill={C.caramel}>{Math.floor(t * 2.5) % 2 ? '▌' : ' '}</tspan>}
      </Mono>
      <Mono ph x={25} y={118} size={17} fill={C.taupe}>EACH TILE ≈ 3,500 PAGES · 2% MATCH</Mono>
      {Array.from({ length: n }, (_, i) => {
        const c = i % GRID.cols;
        const r = Math.floor(i / GRID.cols);
        const o = easeOut(seg(t, (c + r) * 0.035, (c + r) * 0.035 + 0.5));
        const { x, y } = tilePos(i, 132);
        return <rect key={i} x={x} y={y + (1 - o) * 10} width={GRID.size} height={GRID.size} rx={4} fill={C.cocoa} opacity={o} />;
      })}
      <g transform={`translate(300 452) scale(${ask})`} opacity={clamp(ask)}>
        <rect x={-270} y={-26} width={200} height={52} rx={26} fill={C.roast} stroke={C.caramel} strokeWidth={2} />
        <Mono ph x={-170} y={6} size={17} anchor="middle" fill={C.crema} weight={600}>INDEX</Mono>
        <circle r={30} fill={C.caramel} />
        <Serif x={0} y={12} size={34} anchor="middle" fill={C.espresso}>?</Serif>
        <rect x={70} y={-26} width={200} height={52} rx={26} fill={C.roast} stroke={C.caramel} strokeWidth={2} />
        <Mono ph x={170} y={6} size={17} anchor="middle" fill={C.crema} weight={600}>FULL SCAN</Mono>
      </g>
    </Frame>
  );
}

// ── 2 · Predict ────────────────────────────────────────────────────────────
export function Seesaw({ t, answer }: StepCtx) {
  const answered = answer !== null;
  const tilt = answered ? 0 : Math.sin(t * 2.2) * 7;
  const reveal = answered ? 1 : 0;
  return (
    <Frame h={450} label="A balance between reading through the index and scanning the whole table">
      <g transform={`translate(300 360) rotate(${tilt})`}>
        <rect x={-230} y={-6} width={460} height={12} rx={6} fill={C.mocha} />
        <g transform={`translate(-200 0) rotate(${-tilt})`}>
          <line x1={0} y1={0} x2={0} y2={-40} stroke={C.taupe} strokeWidth={2} />
          <rect x={-70} y={-96} width={140} height={56} rx={14} fill={C.roast} stroke={C.caramel} strokeWidth={2} />
          <Mono ph x={0} y={-62} size={17} anchor="middle" fill={C.crema} weight={600}>INDEX</Mono>
        </g>
        <g transform={`translate(200 0) rotate(${-tilt})`}>
          <line x1={0} y1={0} x2={0} y2={-40} stroke={C.taupe} strokeWidth={2} />
          <rect x={-70} y={-96} width={140} height={56} rx={14} fill={C.roast} stroke={C.caramel} strokeWidth={2} />
          <Mono ph x={0} y={-62} size={17} anchor="middle" fill={C.crema} weight={600}>FULL SCAN</Mono>
        </g>
      </g>
      <path d="M300 366 l-34 70 h68 Z" fill={C.cocoa} />
      {!answered && <Serif x={300} y={170} size={120} anchor="middle" fill={C.caramel} o={0.8 + 0.2 * Math.sin(t * 3)}>?</Serif>}
      {answered && (
        <g opacity={reveal}>
          <Serif x={300} y={150} size={84} anchor="middle" fill={C.caramel}>1 / B</Serif>
          <Mono ph x={300} y={200} size={18} anchor="middle" fill={C.crema}>≈ 1% when a page holds 100 rows</Mono>
        </g>
      )}
    </Frame>
  );
}

// ── 3 · The model ──────────────────────────────────────────────────────────
const DISK_N = 10;
const DISK = { w: 48, h: 80, gap: 6, y: 330 };
const diskX = (i: number) => (600 - (DISK_N * (DISK.w + DISK.gap) - DISK.gap)) / 2 + i * (DISK.w + DISK.gap);
const slotX = (i: number) => 170 + i * 64;

function Block({ x, y, w = DISK.w, h = DISK.h, fill = C.cocoa, stroke = C.mocha, o = 1 }: { x: number; y: number; w?: number; h?: number; fill?: string; stroke?: string; o?: number }) {
  return (
    <g opacity={o}>
      <rect x={x} y={y} width={w} height={h} rx={8} fill={fill} stroke={stroke} strokeWidth={1.5} />
      {[0, 1, 2, 3].map((k) => (
        <rect key={k} x={x + 9} y={y + 12 + k * ((h - 24) / 4)} width={w - 18} height={(h - 24) / 4 - 5} rx={2} fill={C.latte} opacity={0.35} />
      ))}
    </g>
  );
}

export function Model({ t }: StepCtx) {
  const moves = [
    { from: 2, to: 0, at: 1.0 },
    { from: 7, to: 1, at: 2.4 },
    { from: 4, to: 2, at: 3.8 },
  ];
  const ios = moves.filter((m) => t >= m.at + 0.9).length;
  const appear = easeOut(seg(t, 0, 0.8));
  return (
    <Frame label="Two levels: a memory holding M items and a disk that moves blocks of B items; each block transfer is one I/O">
      <g opacity={appear}>
        <rect x={30} y={78} width={96} height={96} rx={14} fill={C.roast} stroke={C.caramel} strokeWidth={2} />
        {[0, 1, 2, 3].map((k) => (
          <g key={k}>
            <line x1={46 + k * 21} y1={64} x2={46 + k * 21} y2={78} stroke={C.caramel} strokeWidth={3} strokeLinecap="round" />
            <line x1={46 + k * 21} y1={174} x2={46 + k * 21} y2={188} stroke={C.caramel} strokeWidth={3} strokeLinecap="round" />
          </g>
        ))}
        <Mono x={78} y={132} size={16} anchor="middle" fill={C.crema} weight={600}>CPU</Mono>
        <Mono x={78} y={214} size={13} anchor="middle" fill={C.caramel}>COMPUTE: FREE</Mono>

        <rect x={150} y={52} width={420} height={152} rx={18} fill="none" stroke={C.latte} strokeWidth={1.5} strokeDasharray="5 6" />
        <Mono x={166} y={74} size={14} fill={C.crema}>MEMORY · HOLDS M ITEMS</Mono>
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <rect key={i} x={slotX(i)} y={92} width={DISK.w} height={DISK.h} rx={8} fill="none" stroke={C.mocha} strokeDasharray="4 5" />
        ))}

        {Array.from({ length: DISK_N }, (_, i) => (
          <Block key={i} x={diskX(i)} y={DISK.y} />
        ))}
        <Mono x={300} y={448} size={14} anchor="middle" fill={C.crema}>DISK · MOVES BLOCKS OF B ITEMS</Mono>
      </g>

      {moves.map((m, k) => {
        const e = easeInOut(seg(t, m.at, m.at + 0.9));
        if (t < m.at) return null;
        const x = lerp(diskX(m.from), slotX(m.to), e);
        const y = lerp(DISK.y, 92, e) - Math.sin(Math.PI * e) * 46;
        return (
          <g key={k}>
            <Block x={x} y={y} fill={C.mocha} stroke={C.caramel} />
            <Burst x={slotX(m.to) + DISK.w / 2} y={132} k={t - m.at - 0.9} />
          </g>
        );
      })}

      <g opacity={easeOut(seg(t, 0.8, 1.4))}>
        <Mono x={570} y={252} size={14} anchor="end" fill={C.latte}>I/O COUNT</Mono>
        <Serif x={570} y={304} size={52} anchor="end" fill={C.caramel}>{ios}</Serif>
      </g>
    </Frame>
  );
}

// ── 4 · Three numbers ──────────────────────────────────────────────────────
export function Numbers({ t }: StepCtx) {
  const cards = [
    { k: 'N', v: fmt(1e8 * easeOut(seg(t, 0.3, 1.6))), d: 'rows in the table' },
    { k: 'B', v: fmt(100 * easeOut(seg(t, 0.6, 1.6))), d: 'rows per 8 KB page' },
    { k: 'M', v: '≪ N', d: 'what fits in memory' },
  ];
  const eq = easeOut(seg(t, 2.0, 2.8));
  return (
    <Frame label="N is 100 million rows, B is 100 rows per page, so the table is one million pages">
      {cards.map((c, i) => {
        const e = easeOutBack(seg(t, i * 0.2, i * 0.2 + 0.7));
        const x = 25 + i * 190;
        return (
          <g key={c.k} transform={`translate(${x} ${70 + (1 - e) * 30})`} opacity={clamp(e)}>
            <rect width={170} height={170} rx={20} fill={C.roast} stroke={i === 2 ? C.mocha : C.caramel} strokeWidth={1.5} />
            <Serif x={22} y={64} size={48} fill={C.caramel} italic>{c.k}</Serif>
            <Mono x={22} y={112} size={c.k === 'N' ? 17 : 22} fill={C.crema} weight={600}>{c.v}</Mono>
            <Mono x={22} y={142} size={13} fill={C.latte}>{c.d}</Mono>
          </g>
        );
      })}
      <g opacity={eq} transform={`translate(0 ${(1 - eq) * 16})`}>
        <Serif x={300} y={330} size={44} anchor="middle" italic>N / B</Serif>
        <Serif x={300} y={398} size={44} anchor="middle" fill={C.caramel}>= {fmt(1e6 * easeOut(seg(t, 2.2, 3.4)))} pages</Serif>
        <line x1={160} y1={420} x2={160 + 280 * easeOut(seg(t, 2.6, 3.4))} y2={420} stroke={C.caramel} strokeWidth={3} strokeLinecap="round" />
      </g>
    </Frame>
  );
}

// ── 5 · A scan costs N/B ───────────────────────────────────────────────────
export function Scan({ t }: StepCtx) {
  const n = GRID.cols * GRID.rows;
  const e = easeInOut(seg(t, 0.4, 4.6));
  const lit = e * n;
  const head = tilePos(Math.min(n - 1, Math.floor(lit)), 132);
  return (
    <Frame label="A full scan reads every page once, in order: one million sequential page reads">
      <Mono x={25} y={34} size={14} fill={C.latte}>PAGE READS</Mono>
      <Serif x={25} y={100} size={50} fill={C.caramel}>{fmt(e * 1e6)}</Serif>
      <Mono x={575} y={100} size={15} anchor="end" fill={C.crema}>SEQUENTIAL →</Mono>
      {Array.from({ length: n }, (_, i) => {
        const { x, y } = tilePos(i, 132);
        const on = clamp(lit - i);
        return <rect key={i} x={x} y={y} width={GRID.size} height={GRID.size} rx={4} fill={on > 0 ? C.caramel : C.cocoa} opacity={on > 0 ? 0.35 + 0.5 * on : 1} />;
      })}
      {e > 0 && e < 1 && <rect x={head.x - 3} y={head.y - 3} width={GRID.size + 6} height={GRID.size + 6} rx={6} fill="none" stroke={C.crema} strokeWidth={2} />}
      <Mono x={300} y={448} size={14} anchor="middle" fill={C.crema} o={easeOut(seg(t, 4.4, 5))}>
        ONE PASS = N / B READS. THE FLOOR FOR ANY FULL READ.
      </Mono>
    </Frame>
  );
}

// ── 6 · An index lookup costs about one read per matching row ──────────────
const LOOKUPS = (() => {
  const r = rng(7);
  return Array.from({ length: 44 }, (_, i) => ({ leaf: i % 6, tile: Math.floor(r() * GRID.cols * GRID.rows), at: 0.6 + 4.2 * Math.pow(i / 44, 0.75) }));
})();
const IGRID = { cols: 24, rows: 12, size: 17, gap: 3 };
const igX0 = (600 - (IGRID.cols * (IGRID.size + IGRID.gap) - IGRID.gap)) / 2;

export function IndexLookups({ t }: StepCtx) {
  const leaves = Array.from({ length: 6 }, (_, i) => 75 + i * 90);
  const done = LOOKUPS.filter((l) => t >= l.at + 0.3).length;
  const reads = (done / LOOKUPS.length) * 2e6;
  const litTiles = new Set(LOOKUPS.filter((l) => t >= l.at + 0.3).map((l) => l.tile));
  return (
    <Frame label="Each matching row found through the index costs about one random page read">
      <g opacity={easeOut(seg(t, 0, 0.6))}>
        <line x1={300} y1={46} x2={150} y2={90} stroke={C.mocha} strokeWidth={2} />
        <line x1={300} y1={46} x2={300} y2={90} stroke={C.mocha} strokeWidth={2} />
        <line x1={300} y1={46} x2={450} y2={90} stroke={C.mocha} strokeWidth={2} />
        {leaves.map((x, i) => (
          <line key={i} x1={[150, 300, 450][Math.floor(i / 2)]} y1={100} x2={x} y2={136} stroke={C.mocha} strokeWidth={2} />
        ))}
        <rect x={270} y={28} width={60} height={22} rx={6} fill={C.mocha} />
        {[150, 300, 450].map((x) => (
          <rect key={x} x={x - 30} y={86} width={60} height={22} rx={6} fill={C.mocha} />
        ))}
        {leaves.map((x) => (
          <rect key={x} x={x - 30} y={132} width={60} height={22} rx={6} fill={C.cocoa} stroke={C.caramel} strokeWidth={1.2} />
        ))}
        <Mono x={350} y={44} size={13} fill={C.taupe}>INDEX · UPPER LEVELS CACHED</Mono>
      </g>
      {Array.from({ length: IGRID.cols * IGRID.rows }, (_, i) => {
        const { x, y } = tilePos(i, 190, IGRID, igX0);
        const on = litTiles.has(i);
        return <rect key={i} x={x} y={y} width={IGRID.size} height={IGRID.size} rx={3} fill={on ? C.cinnamon : C.cocoa} opacity={on ? 0.9 : 0.8} />;
      })}
      {LOOKUPS.map((l, i) => {
        const k = t - l.at;
        if (k < 0 || k > 0.9) return null;
        const { x, y } = tilePos(l.tile, 190, IGRID, igX0);
        const e = easeOut(clamp(k / 0.3));
        const fade = 1 - clamp((k - 0.3) / 0.6);
        const sx = leaves[l.leaf];
        return (
          <g key={i} opacity={fade}>
            <line x1={sx} y1={154} x2={lerp(sx, x + IGRID.size / 2, e)} y2={lerp(154, y + IGRID.size / 2, e)} stroke={C.caramel} strokeWidth={1.6} />
            <Burst x={x + IGRID.size / 2} y={y + IGRID.size / 2} k={k - 0.3} n={7} />
          </g>
        );
      })}
      <Mono x={25} y={478} size={14} fill={C.latte}>RANDOM PAGE READS</Mono>
      <Serif x={25} y={512} size={30} fill={C.cinnamon}>{fmt(reads)}</Serif>
      <Mono x={575} y={500} size={14} anchor="end" fill={C.crema} o={easeOut(seg(t, 4.6, 5.2))}>
        2,000,000 MATCHES ≈ 2,000,000 READS
      </Mono>
    </Frame>
  );
}

// ── 7 · The crossover (interactive) ────────────────────────────────────────
const CH = { x0: 74, x1: 560, y0: 400, y1: 64, sMax: 0.04, yMax: 4e6 };
const cx = (s: number) => CH.x0 + ((CH.x1 - CH.x0) * s) / CH.sMax;
const cy = (v: number) => CH.y0 - ((CH.y0 - CH.y1) * Math.min(v, CH.yMax)) / CH.yMax;

function Axes({ yLabel }: { yLabel: string }) {
  return (
    <g>
      <line x1={CH.x0} y1={CH.y0} x2={CH.x1} y2={CH.y0} stroke={C.taupe} />
      <line x1={CH.x0} y1={CH.y0} x2={CH.x0} y2={CH.y1 - 10} stroke={C.taupe} />
      {[0, 1, 2, 3, 4].map((k) => (
        <g key={k}>
          <Mono x={cx(k / 100)} y={CH.y0 + 22} size={14} anchor="middle">{k}%</Mono>
          <line x1={CH.x0 - 5} y1={cy(k * 1e6)} x2={CH.x1} y2={cy(k * 1e6)} stroke={C.crema} opacity={k ? 0.06 : 0} />
          <Mono x={CH.x0 - 10} y={cy(k * 1e6) + 4} size={15} anchor="end">{k ? `${k}M` : '0'}</Mono>
        </g>
      ))}
      <Mono x={(CH.x0 + CH.x1) / 2} y={CH.y0 + 46} size={13} anchor="middle" fill={C.taupe}>SHARE OF ROWS THAT MATCH</Mono>
      <Mono x={CH.x0} y={CH.y1 - 22} size={13} fill={C.taupe}>{yLabel}</Mono>
    </g>
  );
}

export function Crossover({ t }: StepCtx) {
  const [s, setS] = useState(0.02);
  const draw = easeInOut(seg(t, 0.2, 1.4));
  const idx = s * 1e8;
  const scan = 1e6;
  const winner = idx < scan ? 'Index' : idx > scan ? 'Scan' : 'Tie';
  const ratio = idx === scan ? 1 : Math.max(idx, scan) / Math.min(idx, scan);
  const cross = easeOutBack(seg(t, 1.3, 1.9));
  return (
    <div className="flex h-full w-full flex-col">
      <div className="min-h-0 flex-1">
        <Frame label="Page reads against the share of matching rows: the scan is flat at one million, the index rises; they cross at 1%">
          <Axes yLabel="PAGE READS" />
          <line x1={cx(0)} y1={cy(scan)} x2={lerp(cx(0), cx(0.04), draw)} y2={cy(scan)} stroke={C.caramel} strokeWidth={4} strokeLinecap="round" />
          <line x1={cx(0)} y1={cy(0)} x2={lerp(cx(0), cx(0.04), draw)} y2={lerp(cy(0), cy(4e6), draw)} stroke={C.cinnamon} strokeWidth={4} strokeLinecap="round" />
          <Mono x={cx(0.04) - 4} y={cy(scan) - 12} size={15} anchor="end" fill={C.caramel} o={draw} weight={600}>FULL SCAN = N/B</Mono>
          <Mono x={cx(0.034)} y={cy(3.4e6) - 14} size={15} anchor="end" fill={C.cinnamon} o={draw} weight={600}>INDEX ≈ 1 READ / ROW</Mono>
          <g transform={`translate(${cx(0.01)} ${cy(scan)}) scale(${cross})`} opacity={clamp(cross)}>
            <circle r={9} fill={C.crema} />
            <circle r={18} fill="none" stroke={C.crema} opacity={0.4} />
          </g>
          <Mono x={cx(0.01)} y={cy(scan) + 42} size={15} anchor="middle" fill={C.crema} o={clamp(cross)} weight={600}>1% = 1/B</Mono>
          <g opacity={easeOut(seg(t, 1.6, 2.2))}>
            <line x1={cx(s)} y1={CH.y0} x2={cx(s)} y2={CH.y1} stroke={C.crema} strokeDasharray="3 5" opacity={0.5} />
            <circle cx={cx(s)} cy={cy(scan)} r={6} fill={C.caramel} />
            <circle cx={cx(s)} cy={cy(idx)} r={6} fill={C.cinnamon} />
          </g>
        </Frame>
      </div>
      <div data-interactive className="mx-auto w-full max-w-[34rem] cursor-auto px-2 pb-1" style={{ opacity: easeOut(seg(t, 1.6, 2.2)) }}>
        <p className="text-center font-mono text-[0.72rem] uppercase tracking-[0.12em] text-latte">
          At <span className="text-crema">{(s * 100).toFixed(2)}%</span>: index <span className="text-cinnamon">{fmt(idx)}</span> · scan{' '}
          <span className="text-caramel">{fmt(scan)}</span> →{' '}
          <span className="text-crema">{winner === 'Tie' ? 'a tie' : `${winner.toLowerCase()} wins ${ratio.toFixed(ratio < 10 ? 1 : 0)}×`}</span>
        </p>
        <label className="mt-2 flex items-center gap-3">
          <span className="sr-only">Share of rows that match</span>
          <input
            type="range"
            min={0.001}
            max={0.04}
            step={0.0005}
            value={s}
            onChange={(e) => setS(Number(e.target.value))}
            className="reel-range w-full"
          />
        </label>
      </div>
    </div>
  );
}

// ── 8 · 2% of rows lands on ~87% of pages ──────────────────────────────────
const PG = { cols: 20, rows: 12, size: 24, gap: 4 };
const pgX0 = (600 - (PG.cols * (PG.size + PG.gap) - PG.gap)) / 2;
const PAGES = PG.cols * PG.rows; // 240 pages × 100 rows = 24,000 rows
const HITS = (() => {
  const r = rng(42);
  const hits: { page: number; row: number; order: number }[] = [];
  for (let page = 0; page < PAGES; page++) for (let row = 0; row < 100; row++) if (r() < 0.02) hits.push({ page, row, order: r() });
  return hits;
})();
const TOUCHED = new Set(HITS.map((h) => h.page)).size;
const dotPos = (page: number, row: number, y0: number) => {
  const { x, y } = tilePos(page, y0, PG, pgX0);
  return { x: x + 2.4 + (row % 10) * 2.1, y: y + 2.4 + Math.floor(row / 10) * 2.1 };
};

function PageTiles({ y0, lit }: { y0: number; lit: (page: number) => number }) {
  return (
    <>
      {Array.from({ length: PAGES }, (_, i) => {
        const { x, y } = tilePos(i, y0, PG, pgX0);
        const l = lit(i);
        return <rect key={i} x={x} y={y} width={PG.size} height={PG.size} rx={4} fill={C.cocoa} stroke={C.caramel} strokeOpacity={l} strokeWidth={1.5} fillOpacity={0.7 + 0.3 * l} />;
      })}
    </>
  );
}

export function PagesTouched({ t }: StepCtx) {
  const shown = HITS.filter((h) => t >= 0.3 + 2.8 * h.order);
  const firstHit = new Map<number, number>();
  HITS.forEach((h) => firstHit.set(h.page, Math.min(firstHit.get(h.page) ?? 9, 0.3 + 2.8 * h.order)));
  const touched = new Set(shown.map((h) => h.page)).size;
  const formula = easeOut(seg(t, 3.3, 4));
  return (
    <Frame label={`2% of the rows, scattered at random, land on ${Math.round((TOUCHED / PAGES) * 100)}% of the pages`}>
      <Mono x={25} y={40} size={14} fill={C.latte}>ROWS THAT MATCH</Mono>
      <Serif x={25} y={84} size={40} fill={C.crema}>2%</Serif>
      <Mono x={575} y={40} size={14} anchor="end" fill={C.latte}>PAGES TOUCHED</Mono>
      <Serif x={575} y={84} size={40} anchor="end" fill={C.caramel}>{Math.round((touched / PAGES) * 100)}%</Serif>
      <PageTiles y0={110} lit={(i) => (firstHit.has(i) ? easeOut(seg(t, firstHit.get(i)!, firstHit.get(i)! + 0.3)) : 0)} />
      {shown.map((h, i) => {
        const p = dotPos(h.page, h.row, 110);
        return <circle key={i} cx={p.x} cy={p.y} r={1.5} fill={C.crema} />;
      })}
      <g opacity={formula}>
        <Serif x={300} y={490} size={30} anchor="middle" italic>
          1 − 0.98<tspan dy={-14} fontSize={18}>100</tspan>
          <tspan dy={14}> ≈ 87%</tspan>
        </Serif>
      </g>
    </Frame>
  );
}

// ── 9 · Random reads cost more ─────────────────────────────────────────────
export function RandomCost({ t }: StepCtx) {
  const r = lerp(1, 4, easeInOut(seg(t, 0.9, 3.0)));
  const sEnd = Math.min(0.04, 0.04 / r);
  const cross = 0.01 / r;
  const badge = easeOutBack(seg(t, 3.1, 3.8));
  return (
    <Frame label="When a random read costs four sequential reads, the crossover drops from 1% to 0.25%">
      <Axes yLabel="COST IN SEQUENTIAL PAGE READS" />
      <line x1={cx(0)} y1={cy(1e6)} x2={cx(0.04)} y2={cy(1e6)} stroke={C.caramel} strokeWidth={4} strokeLinecap="round" />
      <line x1={cx(0)} y1={cy(0)} x2={cx(sEnd)} y2={cy(sEnd * 1e8 * r)} stroke={C.cinnamon} strokeWidth={4} strokeLinecap="round" />
      <line x1={cx(0)} y1={cy(0)} x2={cx(0.04)} y2={cy(4e6)} stroke={C.cinnamon} strokeWidth={2} strokeDasharray="4 6" opacity={0.35} />
      <circle cx={cx(cross)} cy={cy(1e6)} r={9} fill={C.crema} />
      <Mono x={cx(cross) + 14} y={cy(1e6) + 34} size={14} fill={C.crema} weight={600}>CROSSOVER {(cross * 100).toFixed(2)}%</Mono>
      <Serif x={CH.x1} y={150} size={44} anchor="end" fill={C.cinnamon}>r = {r.toFixed(1)}</Serif>
      <Mono x={CH.x1} y={176} size={14} anchor="end" fill={C.latte}>ONE RANDOM READ = r SEQUENTIAL READS</Mono>
      <g transform={`translate(${CH.x1 - 150} 226) scale(${badge})`} opacity={clamp(badge)}>
        <rect x={-150} y={-20} width={300} height={40} rx={20} fill={C.roast} stroke={C.caramel} />
        <Mono x={0} y={5} size={15} anchor="middle" fill={C.crema}>PostgreSQL: random_page_cost = 4</Mono>
        <Mono x={0} y={44} size={12} anchor="middle" fill={C.latte}>LOW ON PURPOSE: ASSUMES MOST READS HIT CACHE</Mono>
      </g>
    </Frame>
  );
}

// ── 10 · Clustered: the same rows, stored in index order ───────────────────
export function Clustered({ t }: StepCtx) {
  const sorted = [...HITS].sort((a, b) => a.page * 100 + a.row - (b.page * 100 + b.row));
  const move = (k: number) => easeInOut(seg(t, 0.6 + (k / sorted.length) * 1.2, 1.8 + (k / sorted.length) * 1.2));
  const progress = easeInOut(seg(t, 0.6, 3.0));
  const touchedNow = Math.round(lerp(TOUCHED, Math.ceil(HITS.length / 100), progress));
  const finalPages = Math.ceil(HITS.length / 100);
  return (
    <Frame label="If the table is stored in index order, the same matching rows sit on a handful of adjacent pages">
      <Mono x={25} y={40} size={14} fill={C.latte}>SAME 2% OF ROWS</Mono>
      <Serif x={25} y={84} size={34} fill={C.crema} italic>in index order</Serif>
      <Mono x={575} y={40} size={14} anchor="end" fill={C.latte}>PAGES TOUCHED</Mono>
      <Serif x={575} y={84} size={40} anchor="end" fill={C.caramel}>{Math.round((touchedNow / PAGES) * 100)}%</Serif>
      <PageTiles
        y0={110}
        lit={(i) => {
          const before = HITS.some((h) => h.page === i) ? 1 : 0;
          const after = i < finalPages ? 1 : 0;
          return lerp(before, after, progress);
        }}
      />
      {sorted.map((h, k) => {
        const a = dotPos(h.page, h.row, 110);
        const b = dotPos(Math.floor(k / 100), k % 100, 110);
        const e = move(k);
        return <circle key={k} cx={lerp(a.x, b.x, e)} cy={lerp(a.y, b.y, e) - Math.sin(Math.PI * e) * 30} r={1.5} fill={C.crema} />;
      })}
      <Mono x={300} y={490} size={14} anchor="middle" fill={C.crema} o={easeOut(seg(t, 3.0, 3.6))}>
        k MATCHES COST ≈ k / B READS
      </Mono>
    </Frame>
  );
}

// ── 11 · External merge sort ───────────────────────────────────────────────
// 12 blocks, memory M = 4 blocks: pass 1 writes 3 memory-sized runs; pass 2
// merges them with 3 input buffers + 1 output buffer, the fan-in M/B − 1 = 3.
const NV = 12;
const NRUNS = NV / 4;
const VALUES = (() => {
  const r = rng(42);
  const v = Array.from({ length: NV }, (_, i) => i);
  for (let i = v.length - 1; i > 0; i--) {
    const j = Math.floor(r() * (i + 1));
    [v[i], v[j]] = [v[j], v[i]];
  }
  return v;
})();
const SB = 30;
const sbGap = 4;
const rowX = (i: number) => (600 - (NV * (SB + sbGap) - sbGap)) / 2 + i * (SB + sbGap);
const memX = (i: number) => 300 - (4 * (SB + sbGap) - sbGap) / 2 + i * (SB + sbGap);
const RUN_W = 4 * (SB + sbGap) - sbGap + 14;
const runX = (run: number, j: number) => (600 - (NRUNS * RUN_W - 14)) / 2 + run * RUN_W + j * (SB + sbGap);
const shadeRgb = (v: number) => {
  const a = [200, 200, 200];
  const b = [132, 36, 31]; // C.cherry
  const k = v / (NV - 1);
  return a.map((c, i) => Math.round(lerp(c, b[i], k)));
};
const shade = (v: number) => `rgb(${shadeRgb(v).join(',')})`;
// The cell's number in whichever ink reads on its shade (relative luminance, as WCAG computes it).
const shadeInk = (v: number) => {
  const [r, g, b] = shadeRgb(v).map((c) => (c / 255 <= 0.03928 ? c / 255 / 12.92 : ((c / 255 + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b > 0.14 ? C.espresso : C.crema;
};
const ROWS = { input: 78, mem: 178, runs: 282, out: 400 };

export function MergeSort({ t }: StepCtx) {
  const pass = t < 4.5 ? 1 : 2;
  return (
    <Frame label="External merge sort: pass one sorts memory-sized chunks into runs, pass two merges the runs">
      <Mono x={25} y={36} size={14} fill={C.latte}>INPUT · 12 BLOCKS, UNSORTED</Mono>
      <Mono x={575} y={36} size={15} anchor="end" fill={C.caramel} weight={600}>PASS {pass}</Mono>
      <rect x={memX(0) - 12} y={ROWS.mem - 26} width={4 * (SB + sbGap) - sbGap + 24} height={SB + 40} rx={14} fill="none" stroke={C.latte} strokeDasharray="5 6" />
      <Mono x={300} y={ROWS.mem - 34} size={13} anchor="middle" fill={C.crema}>MEMORY · M = 4 BLOCKS</Mono>
      <Mono x={25} y={ROWS.runs - 14} size={13} fill={C.latte} o={easeOut(seg(t, 0.8, 1.2))}>PASS 1 → SORTED RUNS (EACH THE SIZE OF MEMORY)</Mono>
      <Mono x={25} y={ROWS.out - 14} size={13} fill={C.latte} o={easeOut(seg(t, 4.5, 5))}>PASS 2 → ONE 3-WAY MERGE · FAN-IN M/B − 1 = 3</Mono>
      {VALUES.map((v, i) => {
        const run = Math.floor(i / 4);
        const a = 0.3 + run * 1.0;
        const chunk = VALUES.slice(run * 4, run * 4 + 4);
        const sortedPos = [...chunk].sort((x, y) => x - y).indexOf(v);
        const k = t - a;
        let x = rowX(i);
        let y = ROWS.input;
        if (k >= 0) {
          const e1 = easeInOut(clamp(k / 0.35));
          const e2 = easeInOut(clamp((k - 0.35) / 0.25));
          const e3 = easeInOut(clamp((k - 0.6) / 0.4));
          const x1 = lerp(rowX(i), memX(i % 4), e1);
          const x2 = lerp(x1, memX(sortedPos), e2);
          x = lerp(x2, runX(run, sortedPos), e3);
          y = lerp(lerp(ROWS.input, ROWS.mem, e1), ROWS.runs, e3) - (sortedPos !== i % 4 ? Math.sin(Math.PI * e2) * 16 : 0);
        }
        // Pass 2: each block leaves its run for its place in the output.
        const m = t - (4.6 + v * 0.2);
        if (m >= 0) {
          const e = easeInOut(clamp(m / 0.5));
          x = lerp(runX(run, sortedPos), rowX(v), e);
          y = lerp(ROWS.runs, ROWS.out, e) - Math.sin(Math.PI * e) * 24;
        }
        return (
          <g key={i}>
            <rect x={x} y={y} width={SB} height={SB} rx={6} fill={shade(v)} />
            <Mono x={x + SB / 2} y={y + SB / 2 + 4} size={13} anchor="middle" fill={shadeInk(v)} weight={600}>
              {v}
            </Mono>
          </g>
        );
      })}
      <Mono x={300} y={492} size={14} anchor="middle" fill={C.crema} o={easeOut(seg(t, 7.6, 8.2))}>
        EACH PASS READS AND WRITES ALL N / B BLOCKS
      </Mono>
    </Frame>
  );
}

// ── 12 · One terabyte in two passes ────────────────────────────────────────
export function Terabyte({ t }: StepCtx) {
  const merge = easeInOut(seg(t, 2.0, 3.0));
  const bars = easeOut(seg(t, 3.2, 4.6));
  const facts = ['1 TiB of data', '16 GiB of memory', '1 MiB blocks'];
  return (
    <Frame label="Sorting 1 TiB with 16 GiB of memory: 64 runs, one merge pass, two passes in total; a two-way merge would need seven">
      {facts.map((f, i) => (
        <Mono key={f} x={25} y={70 + i * 34} size={15} fill={C.crema} o={easeOut(seg(t, i * 0.2, i * 0.2 + 0.5))} weight={600}>
          {f}
        </Mono>
      ))}
      {Array.from({ length: 64 }, (_, i) => {
        const appear = easeOutBack(seg(t, 0.5 + i * 0.018, 0.9 + i * 0.018));
        const gx = 290 + (i % 8) * 18;
        const gy = 46 + Math.floor(i / 8) * 18;
        const tx = 290 + (i / 64) * 140;
        const x = lerp(gx, tx, merge);
        const y = lerp(gy, 214, merge);
        return <rect key={i} x={x} y={y} width={lerp(14, 140 / 64 + 0.4, merge)} height={14} rx={lerp(3, 0, merge)} fill={i % 2 ? C.caramel : C.cinnamon} opacity={clamp(appear)} />;
      })}
      <Mono x={450} y={110} size={14} fill={C.latte} o={easeOut(seg(t, 1.2, 1.6)) * (1 - merge)}>← 64 SORTED RUNS</Mono>
      <Mono x={450} y={225} size={14} fill={C.latte} o={merge}>← ONE MERGE</Mono>
      <Mono x={25} y={190} size={14} fill={C.taupe} o={merge}>FAN-IN UP TO M/B − 1 = 16,383</Mono>
      <g opacity={easeOut(seg(t, 3.0, 3.4))}>
        <Mono x={25} y={300} size={15} fill={C.crema}>MERGE ALL RUNS AT ONCE</Mono>
        <rect x={25} y={312} width={2 * 70 * bars} height={34} rx={8} fill={C.caramel} />
        <Mono x={35 + 2 * 70 * bars} y={335} size={15} fill={C.caramel} weight={600}>2 PASSES · 4 TiB OF I/O</Mono>
        <Mono x={25} y={392} size={15} fill={C.crema}>MERGE TWO AT A TIME</Mono>
        <rect x={25} y={404} width={7 * 70 * bars} height={34} rx={8} fill={C.cherry} />
        <Mono x={25 + 7 * 70 * bars - 8} y={427} size={15} anchor="end" fill={C.crema} weight={600} o={bars}>7 PASSES · 14 TiB</Mono>
      </g>
    </Frame>
  );
}

// ── 13 · B depends on the tier ─────────────────────────────────────────────
const TIERS = [
  { name: 'DRAM → CPU cache', b: 'B = 64-byte line', lat: '~100 ns', ns: 100 },
  { name: 'NVMe SSD → RAM', b: 'B = 4–8 KB page', lat: '~10–100 µs', ns: 5e4 },
  { name: 'Hard disk → RAM', b: 'B = 8 KB page', lat: '~5–10 ms', ns: 7e6 },
  { name: 'Object store → RAM', b: 'B = 8–16 MB range', lat: '~10s–200 ms', ns: 1e8 },
];
export function Tiers({ t }: StepCtx) {
  const w = (ns: number) => (Math.log10(ns) / 8.2) * 190;
  return (
    <Frame label="Each level of the memory hierarchy has its own block size and its own cost per transfer">
      <Mono x={575} y={36} size={13} anchor="end" fill={C.taupe}>TIME TO FIRST BYTE · LOG SCALE</Mono>
      {TIERS.map((tier, i) => {
        const a = easeOut(seg(t, 0.3 + i * 0.6, 1.1 + i * 0.6));
        const y = 76 + i * 108;
        return (
          <g key={tier.name} opacity={clamp(a * 1.5)}>
            <Serif x={25} y={y + 6} size={21}>{tier.name}</Serif>
            <Mono x={25} y={y + 32} size={14} fill={C.caramel}>{tier.b}</Mono>
            <rect x={270} y={y - 14} width={w(tier.ns) * a} height={30} rx={8} fill={i < 2 ? C.caramel : i === 2 ? C.cinnamon : C.cherry} />
            <Mono x={278 + w(tier.ns) * a} y={y + 6} size={15} fill={C.crema} weight={600}>
              {tier.lat}
            </Mono>
          </g>
        );
      })}
    </Frame>
  );
}

// ── 13b · The network is a tier too ──────────────────────────────────────
// Join a 1 TB table with a 100 MB table on 100 machines (ten boxes stand for
// them). Shuffle: both tables are re-partitioned by key, so ~99% of the rows
// cross the network. Broadcast: every machine receives the small table once.
// Numbers are derived in examples.py.
const NODES = 10;
const nodeX = (i: number) => 48 + i * 56;
const SHUFFLE = (() => {
  const r = rng(29);
  return Array.from({ length: 70 }, () => {
    const a = Math.floor(r() * NODES);
    let b = Math.floor(r() * (NODES - 1));
    if (b >= a) b++;
    return { a, b, start: 0.5 + r() * 1.5 };
  });
})();
// Broadcast: the small table starts spread across the machines (1 MB each), and
// every machine sends its slice to every other, so each one receives ~99 MB.
const BROADCAST = (() => {
  const r = rng(31);
  return Array.from({ length: NODES }, (_, a) =>
    [1, 2].map(() => {
      let b = Math.floor(r() * (NODES - 1));
      if (b >= a) b++;
      return { a, b, start: 2.1 + r() * 0.5 };
    }),
  ).flat();
})();
function Machines({ y, lit }: { y: number; lit: number }) {
  return (
    <g>
      {Array.from({ length: NODES }, (_, i) => (
        <rect key={i} x={nodeX(i) - 20} y={y} width={40} height={30} rx={6} fill={C.cocoa} stroke={lit > 0 ? C.caramel : C.mocha} strokeOpacity={0.4 + 0.6 * lit} strokeWidth={1.5} />
      ))}
    </g>
  );
}
function Packet({ a, b, y, k, r, fill }: { a: number; b: number; y: number; k: number; r: number; fill: string }) {
  if (k <= 0 || k >= 1) return null;
  const e = easeInOut(k);
  const x = lerp(nodeX(a), nodeX(b), e);
  const lift = Math.sin(Math.PI * e) * (18 + Math.abs(a - b) * 7);
  return <circle cx={x} cy={y - lift} r={r} fill={fill} />;
}
export function Network({ t }: StepCtx) {
  const shuffleY = 150;
  const castY = 345;
  const sh = seg(t, 0.5, 2.4);
  const bc = seg(t, 2.0, 3.2);
  return (
    <Frame label="Joining a 1 TB table with a 100 MB table on 100 machines: a shuffle moves about 990 GB across the network (about 8 seconds at 10 Gbit/s per machine), a broadcast about 9.9 GB (about 0.08 seconds)">
      <Mono x={25} y={36} size={13} fill={C.taupe}>JOIN 1 TB WITH 100 MB · 100 MACHINES</Mono>

      <Serif x={25} y={84} size={22} o={easeOut(seg(t, 0.1, 0.6))}>Shuffle both sides by key</Serif>
      <Mono x={25} y={108} size={14} fill={C.latte} o={easeOut(seg(t, 0.1, 0.6))}>99% of rows move to another machine</Mono>
      <Machines y={shuffleY} lit={sh > 0 && sh < 1 ? 1 : 0} />
      {SHUFFLE.map((p, i) => (
        <Packet key={i} a={p.a} b={p.b} y={shuffleY} k={(t - p.start) / 0.7} r={4} fill={C.cherry} />
      ))}
      <Mono x={575} y={218} size={18} anchor="end" fill={C.crema} weight={600} o={clamp(sh * 3)}>
        ≈ {fmt(990 * easeOut(sh))} GB on the wire
      </Mono>
      <Mono x={575} y={240} size={13} anchor="end" fill={C.latte} o={easeOut(seg(t, 2.2, 2.6))}>
        ≈ 8 SECONDS AT 10 GBIT/S PER MACHINE
      </Mono>

      <Serif x={25} y={278} size={22} o={easeOut(seg(t, 1.9, 2.4))}>Broadcast the small side</Serif>
      <Mono x={25} y={302} size={14} fill={C.latte} o={easeOut(seg(t, 1.9, 2.4))}>each machine receives the 100 MB table once</Mono>
      <Machines y={castY} lit={bc > 0 && bc < 1 ? 1 : 0} />
      {BROADCAST.map((p, i) => (
        <Packet key={i} a={p.a} b={p.b} y={castY} k={(t - p.start) / 0.7} r={2.5} fill={C.caramel} />
      ))}
      <Mono x={575} y={413} size={18} anchor="end" fill={C.crema} weight={600} o={clamp(bc * 3)}>
        ≈ {(9.9 * easeOut(bc)).toFixed(1)} GB on the wire
      </Mono>
      <Mono x={575} y={435} size={13} anchor="end" fill={C.latte} o={easeOut(seg(t, 3.0, 3.4))}>
        ≈ 0.08 SECONDS AT 10 GBIT/S PER MACHINE
      </Mono>

      <Mono x={300} y={478} size={14} anchor="middle" fill={C.crema} o={easeOut(seg(t, 3.0, 3.6))}>
        SAME HASH JOIN, SAME CPU BIG-O. 100× LESS TRAFFIC.
      </Mono>
      <Mono x={300} y={502} size={13} anchor="middle" fill={C.latte} o={easeOut(seg(t, 3.3, 3.8))}>
        BROADCAST WINS WHILE SMALL &lt; BIG / (p − 1) AND FITS IN MEMORY
      </Mono>
    </Frame>
  );
}

// ── 14 · Back to the query ─────────────────────────────────────────────────
export function Verdict({ t }: StepCtx) {
  const max = 8e6;
  const W = 330;
  const rows = [
    { k: 'Index, row by row', d: '2,000,000 random reads × 4', v: 8e6, lo: 8e6, fill: C.cherry },
    { k: 'Sorted lookups', d: `~${fmt((1 - Math.pow(0.98, 100)) * 1e6)} pages, with gaps`, v: 3.47e6, lo: 0.867e6, fill: C.cinnamon },
    { k: 'Full scan', d: '1,000,000 sequential reads', v: 1e6, lo: 1e6, fill: C.caramel },
  ];
  return (
    <Frame label="The three ways to answer the query, costed in sequential page reads">
      <Mono x={25} y={36} size={13} fill={C.taupe}>COST IN SEQUENTIAL PAGE READS (r = 4)</Mono>
      {rows.map((r, i) => {
        const a = easeOut(seg(t, 0.3 + i * 0.5, 1.4 + i * 0.5));
        const y = 90 + i * 120;
        const hi = (W * r.v) / max;
        const lo = (W * r.lo) / max;
        return (
          <g key={r.k} opacity={clamp(a * 1.6)}>
            <Serif x={25} y={y} size={22}>{r.k}</Serif>
            <Mono x={25} y={y + 24} size={14} fill={C.latte}>{r.d}</Mono>
            {r.lo !== r.v && <rect x={220} y={y + 38} width={hi * a} height={26} rx={7} fill={r.fill} opacity={0.3} />}
            <rect x={220} y={y + 38} width={lo * a} height={26} rx={7} fill={r.fill} />
            <Mono x={228 + hi * a} y={y + 57} size={15} fill={C.crema} weight={600}>
              {r.lo !== r.v ? `${fmt(r.lo / 1e3)}K–${(r.v / 1e6).toFixed(1)}M` : r.v >= 1e6 ? `${r.v / 1e6}M` : fmt(r.v)}
            </Mono>
          </g>
        );
      })}
      <Mono x={300} y={488} size={14} anchor="middle" fill={C.crema} o={easeOut(seg(t, 2.4, 3.0))}>
        ROW BY ROW LOSES 8×. THE BOTTOM TWO: A CLOSE CALL.
      </Mono>
    </Frame>
  );
}

// ── Prove it ───────────────────────────────────────────────────────────────
export function Quiz({ t, answer, chips, work }: StepCtx & { chips: string[]; work: string[] }) {
  return (
    <Frame h={430} label="A question with its numbers">
      <Serif x={300} y={100} size={100} anchor="middle" fill={C.caramel} o={answer === null ? 0.9 : 0.25} italic>
        ?
      </Serif>
      {chips.map((c, i) => {
        const a = easeOutBack(seg(t, 0.2 + i * 0.18, 0.7 + i * 0.18));
        const y = 150 + i * 44;
        return (
          <g key={c} transform={`translate(300 ${y}) scale(${a})`} opacity={clamp(a)}>
            <rect x={-190} y={-19} width={380} height={38} rx={19} fill={C.roast} stroke={C.mocha} />
            <Mono ph x={0} y={5} size={17} anchor="middle" fill={C.crema} weight={600}>{c}</Mono>
          </g>
        );
      })}
      {answer !== null &&
        work.map((w, i) => (
          <Mono ph key={w} x={300} y={162 + chips.length * 44 + i * 30} size={17} anchor="middle" fill={C.caramel} weight={600}>
            {w}
          </Mono>
        ))}
    </Frame>
  );
}

export const pagesTouchedPct = Math.round((TOUCHED / PAGES) * 100);
