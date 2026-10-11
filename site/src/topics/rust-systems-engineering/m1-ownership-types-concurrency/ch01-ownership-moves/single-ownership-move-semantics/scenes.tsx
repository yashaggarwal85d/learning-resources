import { useState, type ReactNode } from 'react';
import type { StepCtx } from '../../../../../reels/types';
import { easeInOut, easeOut, easeOutBack, fmt, lerp, seg } from '../../../../../reels/anim';
import { Code } from '../../../../../reels/Code';
import { C, Stack, Svg, T } from '../../../../../reels/kit';

// Every snippet shown here is compiled by examples.py, and every number is asserted there.
// The topic's own idea: a 24-byte card (ptr, len, cap) on the stack and the buffer it points to.
// A move slides the card and the buffer stays put; the old slot turns into a dashed outline;
// a clone stamps a second buffer in cherry.

/** Source lines keep their indentation: SVG text would collapse runs of spaces. */
const nb = (s: string) => s.replace(/ {2,}/g, (m) => '\u00a0'.repeat(m.length));
/** Opacity ramp: 0 before `a`, 1 after `a + d`. */
const fa = (t: number, a: number, d = 0.4) => easeOut(seg(t, a, a + d));
/** CSS-driven reveal for predict steps (the clock stops at `duration`, so the reveal is a still frame). Short on purpose: the harness screenshots 250 ms after the click. */
const rv = (on: boolean, delay = 0) => ({ opacity: on ? 1 : 0, transition: 'opacity .15s', transitionDelay: on ? `${Math.min(delay, 0.1)}s` : '0s' });

// ── shared glyphs ───────────────────────────────────────────────────────────────────────────────────────────────

/** A String/Vec header: ptr, len, cap. `moved` is the deinitialized dashed outline. The ptr dot is at (x + 22, y + 23). */
function Card({ x, y, w = 180, name, len, cap, moved = false, o = 1 }: { x: number; y: number; w?: number; name: string; len?: string; cap?: string; moved?: boolean; o?: number }) {
  const cw = (w - 44) / 2;
  return (
    <g opacity={o * (moved ? 0.55 : 1)}>
      <rect x={x} y={y} width={w} height={46} rx={10} fill={moved ? 'none' : C.roast} stroke={moved ? C.taupe : C.caramel} strokeWidth={moved ? 1.5 : 2.5} strokeDasharray={moved ? '6 5' : undefined} />
      {!moved && (
        <>
          <line x1={x + 44} y1={y + 6} x2={x + 44} y2={y + 40} stroke={C.mocha} />
          <line x1={x + 44 + cw} y1={y + 6} x2={x + 44 + cw} y2={y + 40} stroke={C.mocha} />
          <circle cx={x + 22} cy={y + 23} r={5} fill={C.caramel} />
          <T x={x + 44 + cw / 2} y={y + 28} s={13} a="middle" f={C.crema}>{len ?? ''}</T>
          <T x={x + 44 + cw * 1.5} y={y + 28} s={13} a="middle" f={C.crema}>{cap ?? ''}</T>
        </>
      )}
      <T x={x} y={y - 9} s={15} f={C.crema} w={600}>{name}</T>
      {moved && <T x={x + w / 2} y={y + 64} s={13} a="middle" f={C.taupe}>moved-out</T>}
    </g>
  );
}

/** A row of byte cells holding `text`; `clone` stamps it cherry, `freed` makes it a dashed outline. */
function Cells({ x, y, text, freed = false, clone = false, o = 1 }: { x: number; y: number; text: string; freed?: boolean; clone?: boolean; o?: number }) {
  return (
    <g opacity={o}>
      {[...text].map((ch, i) => (
        <g key={i}>
          <rect x={x + i * 30} y={y} width={30} height={34} fill={freed ? 'none' : clone ? C.cherry : C.espresso} fillOpacity={clone ? 0.3 : 1} stroke={freed ? C.taupe : clone ? C.cherry : C.latte} strokeWidth={clone ? 2 : 1.5} strokeDasharray={freed ? '5 4' : undefined} />
          <T x={x + i * 30 + 15} y={y + 23} s={15} a="middle" f={clone ? C.cherryText : C.crema} o={freed ? 0.35 : 1}>{ch}</T>
        </g>
      ))}
    </g>
  );
}

/** A big heap buffer as one bar; `k` scales it in from its left edge. */
function Bar({ x, y, w = 260, label, clone = false, freed = false, k = 1, o = 1 }: { x: number; y: number; w?: number; label: string; clone?: boolean; freed?: boolean; k?: number; o?: number }) {
  return (
    <g opacity={o} transform={`translate(${x} ${y}) scale(${Math.max(k, 0.001)} 1)`}>
      <rect width={w} height={30} rx={6} fill={clone ? C.cherry : freed ? 'none' : C.cocoa} fillOpacity={clone ? 0.3 : 1} stroke={clone ? C.cherry : freed ? C.taupe : C.latte} strokeWidth={clone ? 2 : 1.5} strokeDasharray={freed ? '5 4' : undefined} />
      <g opacity={k > 0.92 ? 1 : 0}>
        <T x={w / 2} y={20} s={14} a="middle" f={clone ? C.cherryText : C.crema}>{label}</T>
      </g>
    </g>
  );
}

function Arrow({ x1, y1, x2, y2, o = 1, c = C.latte }: { x1: number; y1: number; x2: number; y2: number; o?: number; c?: string }) {
  const a = Math.atan2(y2 - y1, x2 - x1);
  const p = (r: number) => `${x2 - 9 * Math.cos(a - r)},${y2 - 9 * Math.sin(a - r)}`;
  return (
    <g opacity={o}>
      <line x1={x1} y1={y1} x2={x2 - 6 * Math.cos(a)} y2={y2 - 6 * Math.sin(a)} stroke={c} strokeWidth={2} />
      <polygon points={`${x2},${y2} ${p(0.45)} ${p(-0.45)}`} fill={c} />
    </g>
  );
}

function Frame({ x, y, w, h, label }: { x: number; y: number; w: number; h: number; label: string }) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={14} fill="none" stroke={C.mocha} strokeWidth={1.5} />
      <T x={x + 14} y={y + 20} s={13} f={C.taupe}>{label}</T>
    </g>
  );
}

/** A cost counter that counts up from 0 between `a` and `a + d`. */
function Counter({ x, y, label, v, t, a, d = 0.6, big = false, o = 1, zeroOk = false }: { x: number; y: number; label: string; v: number; t: number; a: number; d?: number; big?: boolean; o?: number; zeroOk?: boolean }) {
  const shown = Math.round(v * easeOut(seg(t, a, a + d)));
  return (
    <g opacity={o * fa(t, a - 0.2, 0.2)}>
      <T x={x} y={y} s={13} f={C.taupe}>{label}</T>
      <T x={x} y={y + (big ? 32 : 30)} s={20} f={v > 0 && !zeroOk ? C.cherryText : C.crema} w={700}>{fmt(shown)}</T>
    </g>
  );
}

// ── 1 · The problem ─────────────────────────────────────────────────────────────────────────────────────────────
export function Problem({ t, portrait }: StepCtx) {
  const slide = easeOutBack(seg(t, 2.0, 2.6));
  const cloneX = lerp(20, 330, slide);
  const grow = easeOut(seg(t, 2.6, 3.2));
  return (
    <Stack>
      {(!portrait || t < 1.2) && <Code
        title="ingest.rs"
        t={t}
        end={portrait ? 0.9 : 1.1}
        lines={['fn ship(batch: Vec<u8>) -> usize {', '    batch.len()', '}', '', 'let batch = vec![7u8; 1_000_000];', 'let sent = ship(batch.clone());', 'println!("{sent} {}", batch.len());']}
        highlight={t > 1.2 ? [5] : []}
      />}
      <Svg label="Shipping a 1,000,000-byte batch with .clone() makes one extra allocation and copies 1,000,000 bytes, for every batch" h={262} fill>
        <g opacity={fa(t, 1.2)}>
          <Card x={20} y={36} w={250} name="batch" len="1,000,000" cap="1,000,000" />
          <T x={110} y={27} s={13} f={C.taupe}>ptr · len · cap</T>
          <Bar x={20} y={140} label="1,000,000 bytes" />
          <Arrow x1={42} y1={82} x2={42} y2={138} />
        </g>
        {t >= 2.0 && <Card x={cloneX} y={36} w={250} name="clone" len="1,000,000" cap="1,000,000" />}
        <Bar x={330} y={140} label="1,000,000 bytes" clone k={grow} o={t >= 2.6 ? 1 : 0} />
        <Arrow x1={352} y1={82} x2={352} y2={138} o={fa(t, 3.0, 0.3)} />
        <Counter x={20} y={202} label="ALLOCATIONS" v={1} t={t} a={3.2} />
        <Counter x={200} y={202} label="BYTES COPIED" v={1_000_000} t={t} a={3.2} d={1.0} />
        <T x={300} y={254} s={13} a="middle" f={C.taupe} o={fa(t, 4.2)}>per batch, every batch</T>
      </Svg>
    </Stack>
  );
}

// ── 2 · What does let s2 = s1 copy? (predict) ──────────────────────────────────────────────────────────────────
export function CopyHeader({ t, answer }: StepCtx) {
  const ans = answer !== null;
  const pulse = 1 + 0.04 * Math.sin(Math.PI * seg(t, 1.2, 1.6));
  const arrowIn = easeOut(seg(t, 0.6, 1.2));
  return (
    <Svg label="let s2 = s1 copies the 24-byte header, pointer, length and capacity, and no heap bytes; s1 becomes moved-out" h={400}>
      <T x={30} y={36} s={15} f={C.crema}>{`let s1 = String::from("hello");`}</T>
      <T x={30} y={62} s={15} f={C.crema}>let s2 = s1;</T>
      <g opacity={fa(t, 0, 0.6)}>
        <Frame x={20} y={84} w={560} h={146} label="MAIN'S FRAME" />
        <T x={60} y={308} s={13} f={C.taupe}>HEAP</T>
        <Cells x={150} y={286} text="hello" />
        <T x={330} y={308} s={13} f={C.taupe}>header = ptr · len · cap</T>
      </g>
      {/* s1: live in the question, moved-out after the answer */}
      <g opacity={ans ? 0 : 1} style={{ transition: 'opacity .45s' }}>
        <Card x={50} y={140} name="s1" len="5" cap="5" o={fa(t, 0, 0.6)} />
        <Arrow x1={72} y1={186} x2={165 - 10 * (1 - arrowIn)} y2={284} o={arrowIn} />
      </g>
      <g style={rv(ans)}>
        <Card x={50} y={140} name="s1" moved />
      </g>
      {/* the empty slot waiting for s2, filled on the answer */}
      <g opacity={ans ? 0 : fa(t, 0.4, 0.4)} style={{ transition: 'opacity .45s' }} transform={`translate(${340 + 90} ${140 + 23}) scale(${pulse}) translate(${-(340 + 90)} ${-(140 + 23)})`}>
        <rect x={340} y={140} width={180} height={46} rx={10} fill="none" stroke={C.mocha} strokeWidth={1.5} strokeDasharray="6 5" />
        <T x={340} y={131} s={15} f={C.taupe} w={600}>s2</T>
      </g>
      <g style={rv(ans, 0.15)}>
        <Card x={340} y={140} name="s2" len="5" cap="5" />
        <Arrow x1={362} y1={186} x2={285} y2={284} />
      </g>
      <g style={rv(ans, 0.3)}>
        <T x={30} y={352} s={15} f={C.crema}>24 bytes copied (the header)</T>
        <T x={30} y={380} s={15} f={C.caramel}>0 heap bytes copied</T>
      </g>
    </Svg>
  );
}

// ── 3 · Two owners would free twice ────────────────────────────────────────────────────────────────────────────
export function DoubleFree({ t }: StepCtx) {
  const pulse = (a: number, x1: number, y1: number, x2: number, y2: number) => {
    const k = seg(t, a, a + 0.5);
    if (k <= 0 || k >= 1) return null;
    return <circle cx={lerp(x1, x2, easeInOut(k))} cy={lerp(y1, y2, easeInOut(k))} r={6} fill={C.latte} />;
  };
  const freedA = t >= 1.3;
  const burst = easeOut(seg(t, 2.1, 2.5));
  const dim = 1 - 0.4 * easeOut(seg(t, 4.6, 5.4));
  const freedB = t >= 4.1;
  return (
    <Svg label="If both bindings owned the buffer it would be freed twice, a double free; with one owner it is freed once" h={420}>
      <g opacity={dim}>
        <T x={30} y={34} s={13} f={C.taupe}>IF BOTH OWNED</T>
        <g opacity={fa(t, 0, 0.6)}>
          <Card x={50} y={72} name="s1" len="5" cap="5" />
          <Card x={330} y={72} name="s2" len="5" cap="5" />
          <Arrow x1={72} y1={118} x2={180} y2={148} />
          <Arrow x1={352} y1={118} x2={300} y2={148} />
          <line x1={556} y1={72} x2={556} y2={178} stroke={C.mocha} strokeWidth={2} />
          <T x={556} y={202} s={17} a="middle" f={C.latte}>{'}'}</T>
        </g>
        <Cells x={165} y={150} text="hello" freed={freedA} o={fa(t, 0, 0.6)} />
        {pulse(0.8, 352, 118, 300, 160)}
        {pulse(1.6, 72, 118, 190, 160)}
        {t >= 2.1 && <circle cx={240} cy={167} r={34 * burst} fill={C.cherry} opacity={0.35 * (1 - burst * 0.5)} />}
        <T x={240} y={206} s={17} a="middle" f={C.cherryText} w={700} o={fa(t, 2.1, 0.3)}>double free</T>
        <T x={440} y={182} s={17} f={C.cherryText} w={700} o={fa(t, 2.1, 0.3)}>frees: 2</T>
      </g>
      <g opacity={fa(t, 2.9, 0.5)}>
        <T x={30} y={236} s={13} f={C.caramel}>RUST</T>
        <Card x={50} y={284} name="s1" moved />
        <Card x={330} y={284} name="s2" len="5" cap="5" />
        <Arrow x1={352} y1={330} x2={300} y2={360} />
        <line x1={556} y1={284} x2={556} y2={382} stroke={C.mocha} strokeWidth={2} />
        <T x={556} y={276} s={17} a="middle" f={C.latte}>{'}'}</T>
      </g>
      <Cells x={165} y={362} text="hello" freed={freedB} o={fa(t, 2.9, 0.5)} />
      {pulse(3.6, 352, 330, 300, 372)}
      <T x={440} y={400} s={17} f={C.caramel} w={700} o={fa(t, 4.1, 0.5)}>frees: 1</T>
    </Svg>
  );
}

// ── 4 · Proof: the buffer never moved ──────────────────────────────────────────────────────────────────────────
export function Proof({ t, portrait }: StepCtx) {
  const rows: { label: string; moved: string; cloned: string; n?: [number, number]; unit?: string }[] = [
    { label: 'heap pointer', moved: 'same', cloned: 'new' },
    { label: 'header copied', moved: '24 bytes', cloned: '24 bytes' },
    { label: 'allocations', moved: '0', cloned: '1', n: [0, 1] },
    { label: 'heap bytes', moved: '0', cloned: '1,000,000', n: [0, 1_000_000] },
  ];
  const table = (
    <Svg label="Measured: moving a 1,000,000-byte Vec keeps the heap pointer and makes 0 allocations; cloning makes 1 allocation of 1,000,000 bytes at a new address" h={300} fill={!portrait}>
      <T x={250} y={40} s={15} a="middle" f={C.caramel} w={600} o={fa(t, 1.0)}>MOVED INTO ship()</T>
      <T x={470} y={40} s={15} a="middle" f={C.cherryText} w={600} o={fa(t, 1.0)}>CLONED</T>
      {rows.map((r, i) => {
        const a = 1.4 + i * 0.7;
        const e = easeOut(seg(t, a, a + 0.5));
        const y = 95 + i * 50;
        const cell = (s: string, n: [number, number] | undefined, which: 0 | 1) => (n ? fmt(n[which] * e) : s);
        return (
          <g key={r.label} opacity={fa(t, a, 0.3)}>
            <T x={24} y={y} s={14} f={C.latte}>{r.label}</T>
            <T x={250} y={y} s={16} a="middle" f={C.crema} w={600}>{cell(r.moved, r.n, 0)}</T>
            <T x={470} y={y} s={16} a="middle" f={r.n ? C.cherryText : C.crema} w={600}>{cell(r.cloned, r.n, 1)}</T>
          </g>
        );
      })}
      <rect x={220} y={100} width={60} height={3} fill={C.caramel} opacity={fa(t, 4.6, 0.3)} />
      <T x={300} y={288} s={13} a="middle" f={C.taupe} o={fa(t, 4.4, 0.6)}>len 1,000,000 · cap 1,000,000 · unchanged by the move</T>
    </Svg>
  );
  if (portrait) return table;
  return (
    <Stack>
      <Code
        title="proof.rs"
        t={t}
        end={1.0}
        lines={['fn ship(b: Vec<u8>) -> *const u8 {', '    b.as_ptr()', '}', 'let batch = vec![7u8; 1_000_000];', 'let before = batch.as_ptr();', 'let inside = ship(batch);', 'assert_eq!(before, inside);']}
      />
      {table}
    </Stack>
  );
}

// On a phone the question frame shows the code alone: the drawing before the answer is only a few unlabelled marks, and beside a code panel it is
// a sliver. It appears, full size, once the learner has answered (the code leaves, as in the other predict steps).
// ── 5 · Can a moved-out variable come back? (predict) ─────────────────────────────────────────────────────────
export function Reinit({ t, answer, portrait }: StepCtx) {
  const ans = answer !== null;
  const xs = [70, 235, 400];
  const box = (i: number, live: boolean, text: string) => (
    <g>
      <rect x={xs[i]} y={40} width={150} height={44} rx={10} fill={live ? C.roast : 'none'} stroke={live ? C.caramel : C.taupe} strokeWidth={live ? 2.5 : 1.5} strokeDasharray={live ? undefined : '6 5'} />
      <T x={xs[i] + 75} y={68} s={13} a="middle" f={live ? C.crema : C.taupe}>{text}</T>
    </g>
  );
  return (
    <Stack>
      {!(portrait && ans) && (
        <Code title="reinit.rs" t={t} end={1.0} lines={['let mut s = String::from("first");', 'let t = s;', 's = String::from("second");', 'println!("{s} {t}");']} />
      )}
      {!(portrait && !ans) && (
        <Svg label="The place s is live after let mut s, deinitialized after let t = s, and live again after s is assigned; the program prints second first" h={200} fill>
          <T x={30} y={68} s={15} f={C.crema} w={600}>s:</T>
          {[0, 1, 2].map((i) => (
            <g key={i}>
              <rect x={xs[i]} y={40} width={150} height={44} rx={10} fill="none" stroke={C.mocha} opacity={ans ? 0 : fa(t, 1.0)} />
              <T x={xs[i] + 75} y={108} s={13} a="middle" f={C.taupe} o={fa(t, 1.0)}>{['let mut s = …', 'let t = s;', 's = …'][i]}</T>
            </g>
          ))}
          <g style={rv(ans)}>
            {box(0, true, '"first"')}
            {box(1, false, 'deinitialized')}
            {box(2, true, '"second"')}
          </g>
          <g style={rv(ans, 0.2)}>
            <T x={235} y={150} s={15} f={C.crema}>{`t: "first"`}</T>
            <T x={300} y={188} s={16} a="middle" f={C.caramel} w={600}>prints: second first</T>
          </g>
        </Svg>
      )}
    </Stack>
  );
}

// ── 6 · C++ std::move leaves a shell ───────────────────────────────────────────────────────────────────────────
export function CppShell({ t }: StepCtx) {
  const cols = [20, 310];
  const mv = [easeInOut(seg(t, 1.0, 1.8)), easeInOut(seg(t, 1.8, 2.6))];
  const col = (i: 0 | 1) => {
    const x = cols[i];
    const cpp = i === 0;
    const e = mv[i];
    const aMoved = e > 0.5;
    return (
      <g key={i}>
        <T x={x} y={30} s={15} f={cpp ? C.latte : C.caramel} w={600}>{cpp ? 'C++' : 'RUST'}</T>
        <T x={x} y={56} s={13} f={C.crema} o={fa(t, 0.3, 0.5)}>{cpp ? 'Buf b = std::move(a);' : 'let b = a;'}</T>
        <g opacity={fa(t, 0.2, 0.6)}>
          {/* a */}
          {cpp || !aMoved ? (
            <g>
              <rect x={x + 10} y={100} width={110} height={40} rx={9} fill={C.roast} stroke={cpp && aMoved ? C.latte : C.caramel} strokeWidth={2.5} />
              <T x={x + 10} y={91} s={15} f={C.crema} w={600}>a</T>
              {aMoved ? <T x={x + 65} y={125} s={13} a="middle" f={C.latte}>null</T> : (
                <>
                  <circle cx={x + 28} cy={120} r={5} fill={C.caramel} />
                  <T x={x + 75} y={125} s={13} a="middle" f={C.crema}>data</T>
                </>
              )}
            </g>
          ) : (
            <g opacity={0.55}>
              <rect x={x + 10} y={100} width={110} height={40} rx={9} fill="none" stroke={C.taupe} strokeWidth={1.5} strokeDasharray="6 5" />
              <T x={x + 10} y={91} s={15} f={C.crema} w={600}>a</T>
            </g>
          )}
          {aMoved && <T x={x + 10} y={162} s={13} f={cpp ? C.latte : C.taupe}>{cpp ? 'moved-from, still alive' : 'moved-out'}</T>}
          {/* b */}
          <rect x={x + 10} y={210} width={110} height={40} rx={9} fill={C.roast} stroke={aMoved ? C.caramel : C.mocha} strokeWidth={aMoved ? 2.5 : 1.5} />
          <T x={x + 10} y={201} s={15} f={C.crema} w={600}>b</T>
          {aMoved && (
            <>
              <circle cx={x + 28} cy={230} r={5} fill={C.caramel} />
              <T x={x + 75} y={235} s={13} a="middle" f={C.crema}>data</T>
            </>
          )}
          {/* the buffer */}
          <rect x={x + 130} y={300} width={130} height={26} rx={6} fill={C.cocoa} stroke={C.latte} strokeWidth={1.5} />
          <T x={x + 195} y={318} s={13} a="middle" f={C.crema}>1024 bytes</T>
          <Arrow x1={x + 120} y1={lerp(120, 230, e)} x2={lerp(x + 210, x + 170, e)} y2={298} />
        </g>
        {/* the scope end */}
        <T x={x} y={366} s={13} f={C.taupe} o={fa(t, 2.8, 0.4)}>AT THE CLOSING BRACE</T>
        {cpp ? (
          <>
            <T x={x} y={388} s={13} f={C.crema} o={fa(t, 3.0, 0.3)}>destructor (data owned)</T>
            <T x={x} y={408} s={13} f={C.crema} o={fa(t, 3.5, 0.3)}>destructor (data null)</T>
            <T x={x} y={444} s={17} f={C.cherryText} w={700} o={fa(t, 3.8, 0.3)}>destructors: 2</T>
          </>
        ) : (
          <>
            <T x={x} y={388} s={13} f={C.crema} o={fa(t, 4.4, 0.3)}>drop (1024 bytes)</T>
            <T x={x} y={444} s={17} f={C.caramel} w={700} o={fa(t, 4.8, 0.3)}>drops: 1</T>
          </>
        )}
      </g>
    );
  };
  return (
    <Svg label="In C++ the moved-from object still exists and its destructor runs, so two destructors run; in Rust the source is gone and one drop runs" h={508}>
      {col(0)}
      {col(1)}
      <T x={300} y={486} s={13} a="middle" f={C.taupe} o={fa(t, 5.0, 0.6)}>std::move is a cast; the source lives on</T>
    </Svg>
  );
}

// ── 7 · One line, six meanings ─────────────────────────────────────────────────────────────────────────────────
export function SixMeanings({ t }: StepCtx) {
  const rows = [
    ['Python', 'b = a', 'shared', 'usable, alias'],
    ['Java', 'b = a', 'shared', 'usable, alias'],
    ['Go', 'b := a', 'shared', 'usable, alias'],
    ['C++', 'b = a', 'copied', 'usable, separate'],
    ['C++', 'b = move(a)', 'stolen', 'valid, unspecified'],
    ['Rust', 'let b = a', 'stays put', 'use = compile error'],
  ];
  return (
    <Svg label="After b = a: Python, Java and Go share one object and a stays usable; C++ copies or steals; Rust leaves the data in place and a becomes a compile error" h={420}>
      <g opacity={fa(t, 0, 0.4)}>
        <T x={14} y={40} s={13} f={C.taupe}>LINE</T>
        <T x={196} y={40} s={13} f={C.taupe}>THE DATA</T>
        <T x={346} y={40} s={13} f={C.taupe}>a AFTERWARDS</T>
      </g>
      {rows.map((r, i) => {
        const rust = i === 5;
        const a = rust ? 3.1 : 0.6 + i * 0.5;
        const k = easeOut(seg(t, a, a + 0.4));
        const sc = rust ? 0.96 + 0.04 * easeOutBack(seg(t, a, a + 0.5)) : 1;
        const y = 95 + i * 50;
        const f = rust ? C.caramel : C.latte;
        return (
          <g key={i} opacity={k} transform={`translate(${-20 * (1 - k)} 0) translate(14 ${y}) scale(${sc}) translate(-14 ${-y})`}>
            <T x={14} y={y} s={13} f={rust ? C.caramel : C.latte} w={rust ? 700 : 500}>
              {r[0]}
              <tspan fill={rust ? C.caramel : C.crema}>{` ${r[1]}`}</tspan>
            </T>
            <T x={196} y={y} s={13} f={f} w={rust ? 700 : 500}>{r[2]}</T>
            <T x={346} y={y} s={13} f={f} w={rust ? 700 : 500}>{r[3]}</T>
            {rust && <rect x={14} y={y + 12} width={530} height={2} fill={C.caramel} />}
          </g>
        );
      })}
      <g opacity={fa(t, 3.8, 0.4)}>
        <T x={14} y={386} s={13} f={C.taupe}>Go: a slice · Java: an object</T>
        <T x={14} y={406} s={13} f={C.taupe}>C++, Rust: a heap string</T>
      </g>
    </Svg>
  );
}

// ── 8 · Copy: when the bits are the whole value ────────────────────────────────────────────────────────────────
const COPY_CHIPS = ['i32', 'f64', 'bool', 'char', '[u8; 4]', '&String', '(u8, char, f64)'];
const MOVE_CHIPS = ['String', 'Vec<u8>', 'Box<u8>', '&mut String'];
const chipW = (s: string) => s.length * 10 + 16;
/** Chips flow left to right inside a bin and wrap; positions are fixed, so the layout is a pure function. */
function flow(chips: string[], x0: number, y0: number, maxW: number) {
  let x = x0;
  let y = y0;
  return chips.map((s) => {
    const w = chipW(s);
    if (x + w > x0 + maxW) {
      x = x0;
      y += 34;
    }
    const pos = { s, x, y, w };
    x += w + 8;
    return pos;
  });
}
const SIEVE = [...flow(COPY_CHIPS, 24, 264, 256).map((c) => ({ ...c, copy: true })), ...flow(MOVE_CHIPS, 320, 264, 256).map((c) => ({ ...c, copy: false }))];

export function CopySieve({ t }: StepCtx) {
  const slide = easeOut(seg(t, 0.2, 0.8));
  return (
    <Svg label="Types sorted by one test: if the bits are the whole value the type can be Copy; otherwise it only moves. Copy and Drop never mix, and &mut is never Copy" h={400}>
      <T x={14} y={44} s={15} f={C.crema}>let x = 5; let y = x;</T>
      <g opacity={fa(t, 0.2, 0.4)}>
        <rect x={320} y={20} width={70} height={32} rx={8} fill={C.roast} stroke={C.caramel} strokeWidth={2} />
        <T x={355} y={42} s={13} a="middle" f={C.crema}>x 5</T>
        <g transform={`translate(${lerp(0, 100, slide)} 0)`}>
          <rect x={320} y={20} width={70} height={32} rx={8} fill={C.roast} stroke={C.caramel} strokeWidth={2} />
          <T x={355} y={42} s={13} a="middle" f={C.crema}>y 5</T>
        </g>
      </g>
      {[0, 1, 2].map((i) => (
        <T key={i} x={14} y={104 + i * 22} s={13} f={C.taupe} o={fa(t, 4.2 + i * 0.3, 0.3)}>
          {['Copy only if every field is Copy', 'a type with Drop is never Copy', '&T is Copy; &mut T never is'][i]}
        </T>
      ))}
      <T x={300} y={184} s={15} a="middle" f={C.caramel} w={600} o={fa(t, 1.0, 0.4)}>owns anything beyond its bytes?</T>
      <g opacity={fa(t, 1.0, 0.4)}>
        <rect x={8} y={200} width={280} height={190} rx={14} fill="none" stroke={C.mocha} strokeWidth={1.5} />
        <rect x={304} y={200} width={280} height={190} rx={14} fill="none" stroke={C.mocha} strokeWidth={1.5} />
        <T x={24} y={226} s={17} f={C.crema} w={600}>Copy</T>
        <T x={24} y={246} s={13} f={C.latte}>bits are the whole value</T>
        <T x={320} y={226} s={17} f={C.latte} w={600}>move-only</T>
        <T x={320} y={246} s={13} f={C.latte}>owns more, or exclusive</T>
      </g>
      {SIEVE.map((c, i) => {
        const k = seg(t, 1.2 + i * 0.25, 1.6 + i * 0.25);
        const y = lerp(120, c.y, easeOutBack(k));
        return (
          <g key={c.s} opacity={easeOut(k * 3)}>
            <rect x={c.x} y={y} width={c.w} height={28} rx={8} fill={C.roast} stroke={c.s.startsWith('&') ? C.caramel : C.mocha} strokeWidth={c.s.startsWith('&') ? 2 : 1.5} />
            <T x={c.x + c.w / 2} y={y + 19} s={13} a="middle" f={C.crema}>{c.s}</T>
          </g>
        );
      })}
    </Svg>
  );
}

// ── 9 · A file descriptor that is just an i32 (predict) ────────────────────────────────────────────────────────
export function FdCopy({ t, answer, portrait }: StepCtx) {
  const ans = answer !== null;
  return (
    <Stack>
      {!(portrait && ans) && <Code title="fd.rs" t={t} end={1.0} lines={['#[derive(Clone, Copy)]', 'struct Fd(i32);', 'impl Drop for Fd {', '    fn drop(&mut self) {}', '}']} />}
      <Svg label="A type with a destructor can never be Copy: two copies of a descriptor wrapper would close the same descriptor twice" h={262} fill>
        <T x={300} y={ans ? 40 : 130} s={15} a="middle" f={C.latte} o={ans ? 0 : fa(t, 0.8)}>does it compile?</T>
        <g style={rv(ans)}>
          <T x={14} y={26} s={13} f={C.cherryText}>{'error[E0184]: the trait `Copy` cannot'}</T>
          <T x={14} y={46} s={13} f={C.cherryText}>be implemented for this type; the type</T>
          <T x={14} y={66} s={13} f={C.cherryText}>has a destructor</T>
          <T x={14} y={92} s={13} f={C.latte}>{'`Copy` not allowed on types with destructors'}</T>
        </g>
        <g style={rv(ans, 0.25)}>
          <rect x={50} y={140} width={90} height={34} rx={8} fill={C.roast} stroke={C.caramel} strokeWidth={2} />
          <T x={95} y={163} s={14} a="middle" f={C.crema}>fd</T>
          <rect x={50} y={205} width={90} height={34} rx={8} fill={C.roast} stroke={C.cherry} strokeWidth={2} />
          <T x={95} y={228} s={14} a="middle" f={C.crema}>copy</T>
          <circle cx={360} cy={190} r={28} fill="none" stroke={C.latte} strokeWidth={2} />
          <T x={360} y={248} s={13} a="middle" f={C.latte}>descriptor</T>
          <Arrow x1={140} y1={157} x2={330} y2={180} />
          <Arrow x1={140} y1={222} x2={332} y2={200} />
          <T x={440} y={196} s={15} f={C.cherryText} w={600}>two closes</T>
        </g>
      </Svg>
    </Stack>
  );
}

// ── 10 · .clone() is where the cost is ─────────────────────────────────────────────────────────────────────────
export function CloneCost({ t }: StepCtx) {
  // One row per line of the listing: only the clone family stamps a second (cherry) buffer.
  const rows = [
    { label: 'copy', at: 1.4, cost: false },
    { label: 'move', at: 2.0, cost: false },
    { label: 'clone', at: 2.6, cost: true },
    { label: 'to_vec', at: 3.2, cost: true },
    { label: 'to_owned', at: 3.8, cost: true },
  ];
  return (
    <Stack>
      <Code
        title="cost.rs"
        t={t}
        end={1.0}
        lines={['let n2 = n;           // i32: copy', 'let b2 = b;           // Vec<u8>: move', 'let c2 = c.clone();   // Vec<u8>: clone', 'let v = s.to_vec();   // &[u8]: copies', 'let o = s.to_owned(); // &[u8]: copies']}
        highlight={t >= 3.8 ? [2, 3, 4] : t >= 3.2 ? [2, 3] : t >= 2.6 ? [2] : []}
      />
      <Svg label="Copy and move stamp no new buffer; only .clone(), to_vec() and to_owned() each allocate a second buffer, 1 allocation of 1,000,000 bytes" h={274} fill>
        {rows.map((r, i) => {
          const y = 26 + i * 40;
          const k = easeOut(seg(t, r.at, r.at + 0.5));
          return (
            <g key={r.label} opacity={fa(t, r.at - 0.2, 0.3)}>
              <T x={14} y={y + 18} s={15} f={r.cost ? C.cherryText : C.crema} w={600}>{r.label}</T>
              <MiniCard x={150} y={y} />
              <Arrow x1={226} y1={y + 13} x2={256} y2={y + 13} c={C.latte} />
              <rect x={260} y={y + 4} width={130} height={18} rx={5} fill={C.cocoa} stroke={C.latte} strokeWidth={1.5} />
              {r.cost && (
                <g opacity={k}>
                  <rect x={400} y={y + 4} width={130 * k} height={18} rx={5} fill={C.cherry} fillOpacity={0.3} stroke={C.cherry} strokeWidth={2} />
                  <T x={420} y={y + 19} s={13} f={C.cherryText} o={k > 0.9 ? 1 : 0}>+1 buffer</T>
                </g>
              )}
            </g>
          );
        })}
        <T x={14} y={238} s={13} f={C.taupe} o={fa(t, 4.2, 0.6)}>Rc::clone and Arc::clone only bump a count:</T>
        <T x={14} y={258} s={13} f={C.taupe} o={fa(t, 4.2, 0.6)}>see Chapter 4</T>
      </Svg>
    </Stack>
  );
}

// ── 11 · Is a move always cheap? (predict) ─────────────────────────────────────────────────────────────────────
export function BigMove({ t, answer, portrait }: StepCtx) {
  const ans = answer !== null;
  return (
    <Stack>
      {!(portrait && ans) && (
        <Code
          title={portrait ? undefined : 'big.rs'}
          t={t}
          end={1.2}
          lines={[
            'struct Big { data: [u8; 4096] }',
            'fn take(b: Big) -> *const u8 {',
            '    b.data.as_ptr()',
            '}',
            'let b = Big { data: [7; 4096] };',
            'let at = b.data.as_ptr();',
            'let moved_to = take(b);',
            'println!("{}", at == moved_to);',
          ]}
        />
      )}
      <Svg label="Moving a 4096-byte struct copies all 4096 bytes: the data lands at a new address and the program prints false" h={ans ? 300 : 120} fill>
        {!ans && <T x={300} y={64} s={15} a="middle" f={C.latte} o={fa(t, 0.8)}>how many bytes does take(b) copy?</T>}
        <g style={rv(ans)}>
          <T x={20} y={46} s={13} f={C.taupe}>b IN main</T>
          <T x={320} y={46} s={13} f={C.taupe}>b IN take</T>
          <rect x={20} y={60} width={260} height={64} rx={12} fill="none" stroke={C.mocha} strokeWidth={1.5} />
          <rect x={320} y={60} width={260} height={64} rx={12} fill="none" stroke={C.mocha} strokeWidth={1.5} />
          <rect x={30} y={78} width={240} height={28} rx={6} fill={C.cocoa} stroke={C.latte} />
          <T x={150} y={97} s={13} a="middle" f={C.crema}>4,096 bytes</T>
          <rect x={330} y={78} width={240} height={28} rx={6} fill={C.cherry} fillOpacity={0.3} stroke={C.cherry} strokeWidth={2} />
          <T x={450} y={97} s={13} a="middle" f={C.cherryText}>4,096 bytes</T>
          <Arrow x1={284} y1={92} x2={316} y2={92} c={C.cherryText} />
          <T x={150} y={150} s={14} a="middle" f={C.latte}>at</T>
          <T x={450} y={150} s={14} a="middle" f={C.latte}>moved_to</T>
          <T x={300} y={200} s={17} a="middle" f={C.caramel} w={700}>prints: false</T>
          <T x={300} y={242} s={13} a="middle" f={C.taupe}>pass-through, debug: memcpy of 4096 bytes</T>
          <T x={300} y={264} s={13} a="middle" f={C.taupe}>-C opt-level=3: removed, unless the address escaped</T>
        </g>
      </Svg>
    </Stack>
  );
}

// ── 12 · Size decides the cost; Box caps it (interactive) ──────────────────────────────────────────────────────
const SIZES: { label: string; bytes: number; why: string; owns?: number }[] = [
  { label: '[u8; 16]', bytes: 16, why: 'the whole array is copied' },
  { label: '[u8; 4096]', bytes: 4096, why: 'the whole array is copied' },
  { label: '[u8; 65536]', bytes: 65536, why: 'the whole array is copied' },
  { label: 'Box<[u8; 65536]>', bytes: 8, why: '8-byte pointer; the 65,536 bytes stay on the heap', owns: 65536 },
  { label: 'Vec<u8> (1,000,000 bytes)', bytes: 24, why: 'header only; the 1,000,000 bytes stay on the heap', owns: 1_000_000 },
];
/** Bar width on a log scale: 20 bits of range, so 1,000,000 bytes still fits in 420 units. */
const barW = (bytes: number) => (420 * Math.log2(bytes)) / 20;
export function SizeChooser({ t }: StepCtx) {
  const [sel, setSel] = useState(4);
  // The chips sit below the drawing and are not wrapped in a [data-interactive] container: the player ignores presses on a
  // data-interactive element, so a container that is wide and tall would swallow a swipe that starts on it. Each chip is a
  // <button>, which the player already ignores, and nothing else here handles pointer events.
  return (
    <Stack>
      <Svg label="Bytes one move copies equals the size of the type: 16, 4096 or 65536 for arrays, 8 for a Box and 24 for a Vec, however big their contents" h={350} fill>
        {SIZES.map((s, i) => {
          const y = 28 + i * 56;
          const w = barW(s.bytes);
          const k = easeOut(seg(t, 0.4 + i * 0.4, 1.0 + i * 0.4));
          const on = i === sel;
          return (
            <g key={s.label}>
              <T x={24} y={y} s={14} f={on ? C.crema : C.latte} w={on ? 700 : 500}>{s.label}</T>
              {s.owns && (
                <g opacity={fa(t, 1.0 + i * 0.4, 0.4)}>
                  <rect x={24} y={y + 8} width={barW(s.owns)} height={20} rx={6} fill="none" stroke={C.taupe} strokeDasharray="5 4" />
                  <T x={24 + barW(s.owns) - 18} y={y + 24} s={13} a="end" f={C.taupe}>{`owns ${fmt(s.owns)}`}</T>
                </g>
              )}
              <rect x={24} y={y + 8} width={Math.max(2, w * k)} height={20} rx={6} fill={on ? C.caramel : C.mocha} />
              <T x={24 + w * k + 12} y={y + 24} s={15} f={C.crema} o={k > 0.3 ? 1 : 0}>{fmt(s.bytes)}</T>
            </g>
          );
        })}
        <T x={24} y={312} s={13} f={C.taupe} o={fa(t, 0, 0.4)}>bytes one move copies = size_of::&lt;T&gt;() (log scale)</T>
        <T x={24} y={338} s={13} f={C.crema} o={fa(t, 3.0, 0.6)}>{SIZES[sel].why}</T>
      </Svg>
      <div className="mt-2 mb-4 flex flex-wrap justify-center gap-2 px-2">
        {SIZES.map((s, i) => (
          <button
            key={s.label}
            type="button"
            onClick={() => setSel(i)}
            className={`rounded-full border px-3 py-1 font-mono text-[0.72rem] ${i === sel ? 'border-caramel text-caramel' : 'border-crema/15 text-latte'}`}
          >
            {s.label}
          </button>
        ))}
      </div>
    </Stack>
  );
}

// ── 13 · Signatures are ownership contracts ────────────────────────────────────────────────────────────────────
function Token({ x, y, w = 60, ghost = false, label = 'batch', thick = false, o = 1 }: { x: number; y: number; w?: number; ghost?: boolean; label?: string; thick?: boolean; o?: number }) {
  return (
    <g opacity={o}>
      <rect x={x} y={y} width={w} height={30} rx={7} fill={ghost ? 'none' : C.caramel} stroke={ghost ? (thick ? C.caramel : C.latte) : 'none'} strokeWidth={thick ? 3 : 1.5} />
      <T x={x + w / 2} y={y + 20} s={13} a="middle" f={ghost ? (thick ? C.caramel : C.latte) : C.espresso} w={700}>{label}</T>
    </g>
  );
}
export function Contracts({ t }: StepCtx) {
  const laneY = [30, 140, 250, 360];
  const sigs = ['fn ship(b: Vec<u8>)', 'fn peek(b: &[u8])', 'fn fill(b: &mut Vec<u8>)', 'fn make() -> Vec<u8>'];
  const names = ['ship', 'peek', 'fill', 'make'];
  const verdicts = ['takes', 'borrows', 'borrows exclusively', 'hands back'];
  const win = [[0.4, 1.6], [1.6, 2.9], [2.9, 4.4], [4.4, 5.4]];
  const p = (i: number) => easeInOut(seg(t, win[i][0], win[i][1]));
  const lx = 50; // token slot in the caller box
  const rx = 440; // token slot in the callee box
  const oneWay = (k: number) => lerp(lx, rx, k);
  const there = (k: number) => lerp(lx, rx, k < 0.5 ? k * 2 : 2 - k * 2);
  return (
    <Svg label="Four parameter forms: T takes ownership, &T borrows for reading, &mut T borrows exclusively, and returning T hands ownership back" h={462}>
      {laneY.map((y, i) => (
        <g key={i}>
          <T x={14} y={y + 18} s={15} f={C.crema}>{sigs[i]}</T>
          <T x={586} y={y + 18} s={15} a="end" f={C.crema} w={600} o={fa(t, win[i][1] - 0.2, 0.4)}>{verdicts[i]}</T>
          <rect x={30} y={y + 28} width={170} height={56} rx={10} fill="none" stroke={C.mocha} strokeWidth={1.5} />
          <rect x={380} y={y + 28} width={180} height={56} rx={10} fill="none" stroke={C.mocha} strokeWidth={1.5} />
          <T x={38} y={y + 42} s={13} f={C.taupe}>caller</T>
          <T x={388} y={y + 42} s={13} f={C.taupe}>{names[i]}</T>
        </g>
      ))}
      {/* lane 1: the token goes to ship and stays; the caller's slot is moved-out */}
      {(() => {
        const k = p(0);
        return (
          <g>
            <Arrow x1={206} y1={laneY[0] + 61} x2={376} y2={laneY[0] + 61} c={C.latte} o={fa(t, 1.3, 0.3)} />
            <rect x={lx} y={laneY[0] + 46} width={60} height={30} rx={7} fill="none" stroke={C.taupe} strokeDasharray="5 4" opacity={k > 0.05 ? 0.7 : 0} />
            <Token x={oneWay(k)} y={laneY[0] + 46} o={fa(t, 0.2, 0.2)} />
          </g>
        );
      })()}
      {/* lane 2: the token stays; two shared borrows travel out and back */}
      <Token x={lx} y={laneY[1] + 46} o={fa(t, 1.4, 0.2)} />
      <g opacity={fa(t, win[1][1] - 0.2, 0.3)}>
        <Arrow x1={206} y1={laneY[1] + 51} x2={376} y2={laneY[1] + 51} c={C.latte} />
        <Arrow x1={376} y1={laneY[1] + 71} x2={206} y2={laneY[1] + 71} c={C.latte} />
        <Token x={392} y={laneY[1] + 46} ghost label="&" />
        <Token x={474} y={laneY[1] + 46} ghost label="&" />
      </g>
      {[0, 0.2].map((d, j) => {
        const k = seg(t, win[1][0] + d, win[1][1] + d - 0.2);
        return k > 0 && k < 1 ? <Token key={j} x={there(k)} y={laneY[1] + 46 + (j ? 5 : 0)} w={60} ghost label="&" /> : null;
      })}
      {/* lane 3: one exclusive borrow; the caller's token dims and widens when it returns */}
      {(() => {
        const k = seg(t, win[2][0], win[2][1]);
        const out = k > 0 && k < 1;
        const mutated = k >= 1;
        return (
          <g>
            <g opacity={out ? 0.4 : 1}>
              <Token x={lx} y={laneY[2] + 46} w={mutated ? 72 : 60} o={fa(t, 2.7, 0.2)} />
            </g>
            {out && <Token x={there(k)} y={laneY[2] + 46} ghost thick label="&mut" />}
            <T x={38} y={laneY[2] + 100} s={13} f={C.taupe} o={k > 0 ? 1 : 0}>no other access</T>
            {mutated && <Token x={rx} y={laneY[2] + 46} ghost thick label="&mut" />}
          </g>
        );
      })()}
      {/* lane 4: a token appears in make and slides to the caller */}
      {(() => {
        const k = p(3);
        return (
          <g>
            <Arrow x1={376} y1={laneY[3] + 61} x2={206} y2={laneY[3] + 61} c={C.latte} o={fa(t, win[3][1] - 0.4, 0.3)} />
            <Token x={lerp(rx, lx, k)} y={laneY[3] + 46} label="new" o={fa(t, win[3][0], 0.2)} />
          </g>
        );
      })()}
    </Svg>
  );
}

// ── 14 · Methods sign the same contract ────────────────────────────────────────────────────────────────────────
export function Methods({ t }: StepCtx) {
  const rows = [
    { sig: 'fn len(&self) -> usize', chip: 'reads', at: 0.3 },
    { sig: 'fn push_str(&mut self, string: &str)', chip: 'mutates', at: 0.9 },
    { sig: 'fn into_bytes(self) -> Vec<u8>', chip: 'consumes', at: 1.5 },
  ];
  const morph = easeInOut(seg(t, 2.9, 3.5));
  const nudge = 20 * Math.sin(Math.PI * morph);
  return (
    <Svg label="Receivers state the contract: &self reads, &mut self mutates, self consumes; into_bytes consumes the String and returns a Vec on the same buffer with 0 allocations" h={480}>
      {rows.map((r, i) => (
        <g key={r.sig} opacity={fa(t, r.at, 0.4)}>
          <T x={14} y={50 + i * 60} s={15} f={C.crema}>{r.sig}</T>
          <T x={586} y={50 + i * 60} s={13} a="end" f={i === 2 ? C.caramel : C.latte} w={i === 2 ? 700 : 500}>{r.chip}</T>
        </g>
      ))}
      <g opacity={fa(t, 2.1, 0.4)}>
        <g transform={`translate(${nudge} 0)`}>
          <Card x={60} y={258} w={180} name="" len="5" cap="5" />
          <T x={60} y={249} s={15} f={C.crema} w={600} o={1 - morph}>s: String</T>
          <T x={60} y={249} s={15} f={C.crema} w={600} o={morph}>v: Vec&lt;u8&gt;</T>
        </g>
        <Cells x={230} y={350} text="hello" />
        <T x={170} y={380} s={13} a="end" f={C.taupe}>HEAP</T>
        <Arrow x1={82 + nudge} y1={304} x2={245} y2={348} />
      </g>
      <g opacity={fa(t, 3.5, 0.4)}>
        <Card x={330} y={258} w={180} name="s: String" moved />
      </g>
      <T x={14} y={420} s={15} f={C.caramel} o={fa(t, 3.7, 0.4)}>same buffer · 0 allocations</T>
      <T x={14} y={448} s={13} f={C.latte} o={fa(t, 4.4, 0.5)}>String + &amp;str also consumes the left side</T>
      <T x={14} y={468} s={13} f={C.latte} o={fa(t, 4.4, 0.5)}>(appends in place, may grow)</T>
    </Svg>
  );
}

// ── 15 · Which signature would you ship? (predict) ─────────────────────────────────────────────────────────────
export function WhichSignature({ t, answer }: StepCtx) {
  const ans = answer !== null;
  // What each option does to the caller's batch (the signatures themselves are on the buttons).
  const fx: { chip: string; right: boolean; glyph: (y: number) => ReactNode }[] = [
    { chip: 'takes: the caller loses the batch', right: false, glyph: (y) => <rect x={60} y={y} width={56} height={26} rx={7} fill="none" stroke={C.taupe} strokeDasharray="5 4" /> },
    {
      chip: 'borrows: right contract',
      right: true,
      glyph: (y) => (
        <>
          <rect x={60} y={y} width={56} height={26} rx={7} fill={C.roast} stroke={C.caramel} strokeWidth={2.5} />
          <circle cx={74} cy={y + 13} r={4} fill={C.caramel} />
          <Arrow x1={122} y1={y + 13} x2={156} y2={y + 13} c={C.caramel} />
          <T x={168} y={y + 18} s={13} f={C.caramel}>&amp;</T>
        </>
      ),
    },
    {
      chip: 'exclusive for no reason',
      right: false,
      glyph: (y) => (
        <>
          <rect x={60} y={y} width={56} height={26} rx={7} fill={C.roast} stroke={C.latte} strokeWidth={3.5} />
          <circle cx={74} cy={y + 13} r={4} fill={C.latte} />
        </>
      ),
    },
    {
      chip: 'works, clumsy',
      right: false,
      glyph: (y) => (
        <>
          <rect x={60} y={y} width={56} height={26} rx={7} fill={C.roast} stroke={C.latte} strokeWidth={1.5} />
          <Arrow x1={122} y1={y + 8} x2={156} y2={y + 8} c={C.latte} />
          <Arrow x1={156} y1={y + 20} x2={122} y2={y + 20} c={C.latte} />
        </>
      ),
    },
  ];
  return (
    <Svg label="The caller runs checksum(batch) and then uses batch.len(); of four signatures, the shared borrow keeps the batch with the caller and is the right contract" h={360}>
      <g opacity={fa(t, 0, 0.4)}>
        <Card x={20} y={52} w={150} name="batch" />
        <rect x={210} y={52} width={190} height={46} rx={10} fill="none" stroke={C.latte} strokeWidth={1.5} />
        <T x={305} y={81} s={14} a="middle" f={C.crema}>checksum(batch)</T>
        <Arrow x1={176} y1={75} x2={206} y2={75} />
        <rect x={440} y={52} width={140} height={46} rx={10} fill="none" stroke={C.latte} strokeWidth={1.5} />
        <T x={510} y={81} s={14} a="middle" f={C.crema}>batch.len()</T>
        <Arrow x1={404} y1={75} x2={436} y2={75} />
      </g>
      <T x={300} y={200} s={15} a="middle" f={C.latte} o={ans ? 0 : fa(t, 0.6, 0.4)}>can the caller still use batch?</T>
      {fx.map((r, i) => {
        const y = 134 + i * 54;
        return (
          <g key={i} style={rv(ans, 0.03 * i)}>
            <rect x={14} y={y - 8} width={572} height={44} rx={10} fill="none" stroke={r.right ? C.caramel : C.mocha} strokeWidth={r.right ? 2.5 : 1.5} />
            <T x={30} y={y + 18} s={14} f={C.taupe}>{'ABCD'[i]}</T>
            {r.glyph(y + 3)}
            <T x={206} y={y + 20} s={13} f={r.right ? C.caramel : C.latte}>{r.chip}</T>
          </g>
        );
      })}
    </Svg>
  );
}

// ── 16 · Reading E0382, span by span ───────────────────────────────────────────────────────────────────────────
function Marker({ x, y, n, o = 1 }: { x: number; y: number; n: number; o?: number }) {
  return (
    <g opacity={o}>
      <circle cx={x} cy={y} r={11} fill={C.caramel} />
      <T x={x} y={y + 5} s={13} a="middle" f={C.espresso} w={700}>{String(n)}</T>
    </g>
  );
}
const Hot = ({ children }: { children: ReactNode }) => (
  <tspan fill={C.caramel} textDecoration="underline">{children}</tspan>
);
export function ReadE0382({ t }: StepCtx) {
  const lab = (a: number, next: number) => fa(t, a, 0.4) * (t > 4.0 ? 1 : 1 - 0.4 * fa(t, next, 0.3));
  return (
    <Svg label="E0382 read in order: why the value moved because Vec is not Copy, where it moved at the call, and the later use; each span has a fix and cloning is last" h={520}>
      <T x={14} y={24} s={14} f={C.cherryText} w={600} o={fa(t, 0, 0.4)}>{'error[E0382]: borrow of moved value: `batch`'}</T>
      <g opacity={fa(t, 0.4, 0.8)}>
        <T x={14} y={58} s={13} f={C.crema}>{nb('6 |     let ')}<Hot>batch</Hot>{' = vec![7u8; 1_000_000];'}</T>
        <T x={14} y={140} s={13} f={C.crema}>{nb('7 |     let sent = ship(')}<Hot>batch</Hot>);</T>
        <T x={14} y={196} s={13} f={C.crema}>{nb('8 |     println!("{sent} {}", ')}<Hot>batch</Hot>.len());</T>
      </g>
      <g opacity={lab(1.6, 2.4)}>
        <Marker x={22} y={78} n={1} />
        <T x={44} y={82} s={13} f={C.latte}>{'move occurs because `batch` has type `Vec<u8>`,'}</T>
        <T x={44} y={104} s={13} f={C.latte}>{'which does not implement the `Copy` trait'}</T>
      </g>
      <g opacity={lab(2.4, 3.2)}>
        <Marker x={22} y={158} n={2} />
        <T x={44} y={162} s={13} f={C.latte}>value moved here</T>
      </g>
      <g opacity={lab(3.2, 99)}>
        <Marker x={22} y={214} n={3} />
        <T x={44} y={218} s={13} f={C.latte}>value borrowed here after move</T>
      </g>
      <g opacity={fa(t, 4.2, 0.5)}>
        <T x={14} y={256} s={13} f={C.taupe}>note: consider changing this parameter type in</T>
        <T x={14} y={278} s={13} f={C.taupe}>{'function `ship` to borrow instead if owning the'}</T>
        <T x={14} y={300} s={13} f={C.taupe}>{"value isn't necessary"}</T>
        <T x={14} y={332} s={13} f={C.cherryText}>help: consider cloning the value if the</T>
        <T x={14} y={354} s={13} f={C.cherryText}>performance cost is acceptable</T>
      </g>
      {['1 plain data? derive Copy', '2 borrow: ship(&batch)', '3 use it first: let n = batch.len();'].map((s, i) => {
        const y = 378 + i * 36;
        return (
          <g key={s} opacity={fa(t, 4.8 + i * 0.5, 0.4)}>
            <rect x={14} y={y} width={s.length > 30 ? 400 : 290} height={24} rx={8} fill="none" stroke={C.caramel} />
            <T x={26} y={y + 17} s={13} f={C.crema}>{`${['①', '②', '③'][i]}${s.slice(1)}`}</T>
          </g>
        );
      })}
      <T x={14} y={494} s={13} f={C.cherryText} o={fa(t, 6.2, 0.2)}>clone: last resort</T>
    </Svg>
  );
}

// ── 17 · E0505: a move inside a live borrow ────────────────────────────────────────────────────────────────────
export function ReadE0505({ t }: StepCtx) {
  const bar = easeOut(seg(t, 2.4, 3.2));
  const burst = easeOut(seg(t, 3.4, 3.8));
  const swap = easeInOut(seg(t, 4.2, 4.8));
  const shortBar = easeOut(seg(t, 4.8, 5.2));
  const fixLines = [
    { s: 'let header = &batch[..4];', from: 336, to: 336 },
    { s: 'println!("{header:?}");', from: 396, to: 366 },
    { s: 'let sent = ship(batch);', from: 366, to: 396 },
  ];
  return (
    <Svg label="E0505: moving batch while header still borrows it is rejected, because a borrow lasts until its last use; finishing with header first lets the move compile" h={470}>
      <T x={14} y={24} s={14} f={C.cherryText} w={600} o={fa(t, 0, 0.4)}>{'error[E0505]: cannot move out of `batch`'}</T>
      <T x={14} y={44} s={14} f={C.cherryText} w={600} o={fa(t, 0, 0.4)}>because it is borrowed</T>
      <g opacity={fa(t, 0.3, 0.8)}>
        <T x={84} y={104} s={13} f={C.crema}>{nb('7 |     let header = &batch[..4];')}</T>
        <T x={84} y={174} s={13} f={C.crema}>{nb('8 |     let sent = ship(batch);')}</T>
        <T x={84} y={244} s={13} f={C.crema}>{nb('9 |     println!("{sent} {header:?}");')}</T>
      </g>
      <T x={114} y={124} s={13} f={C.latte} o={fa(t, 1.4, 0.3)}>{'borrow of `batch` occurs here'}</T>
      <T x={114} y={194} s={13} f={C.latte} o={fa(t, 1.8, 0.3)}>{'move out of `batch` occurs here'}</T>
      <T x={114} y={264} s={13} f={C.latte} o={fa(t, 2.2, 0.3)}>borrow later used here</T>
      <T x={14} y={84} s={13} f={C.caramel} o={fa(t, 2.4, 0.4)}>header is live</T>
      <rect x={10} y={98} width={10} height={Math.max(1, 152 * bar)} rx={5} fill={C.caramel} />
      {t >= 3.4 && (
        <g>
          <circle cx={15} cy={170} r={11 + 14 * burst} fill={C.cherry} opacity={0.5 * (1 - burst)} />
          <circle cx={15} cy={170} r={11} fill="none" stroke={C.cherry} strokeWidth={3.5} />
          <T x={34} y={175} s={13} f={C.cherryText} o={fa(t, 3.4, 0.3)}>move</T>
        </g>
      )}
      <g opacity={fa(t, 4.0, 0.4)}>
        <T x={14} y={304} s={14} f={C.caramel}>fix: finish with the borrow first</T>
        {fixLines.map((l, i) => (
          <T key={i} x={84} y={lerp(l.from, l.to, swap)} s={13} f={C.crema}>{l.s}</T>
        ))}
        <rect x={10} y={322} width={10} height={Math.max(1, 48 * shortBar)} rx={5} fill={C.caramel} />
        <g opacity={fa(t, 5.4, 0.3)}>
          <circle cx={15} cy={392} r={9} fill={C.caramel} />
          <T x={34} y={397} s={13} f={C.caramel}>move</T>
          <T x={400} y={396} s={13} f={C.caramel} w={600}>compiles</T>
        </g>
      </g>
      <T x={84} y={452} s={13} f={C.taupe} o={fa(t, 5.8, 0.2)}>or copy the 4 bytes out: [u8; 4] is Copy</T>
    </Svg>
  );
}

// ── 18 · A move inside a loop (predict) ────────────────────────────────────────────────────────────────────────
export function LoopMove({ t, answer, portrait }: StepCtx) {
  const ans = answer !== null;
  const ticks = [
    { x: 300, y: 30, lx: 300, ly: 18 },
    { x: 421, y: 105, lx: 484, ly: 110 },
    { x: 179, y: 105, lx: 154, ly: 110 },
  ];
  return (
    <Stack>
      {!(portrait && ans) && <Code title="loop.rs" t={t} end={1.0} lines={['let batch = vec![7u8; 4];', 'for _ in 0..3 {', '    ship(batch);', '}']} />}
      {!(portrait && !ans) && (
        <Svg label="The loop comes back to ship(batch) a second time with batch already moved, so it is rejected at compile time" h={290} fill>
          <g transform="translate(0 46)">
            <ellipse cx={300} cy={80} rx={140} ry={50} fill="none" stroke={C.mocha} strokeWidth={2} />
            {/* direction of the lap: an arrowhead between tick 1 and tick 2 */}
            <polygon points="428,59 415,57 420,49" fill={C.latte} opacity={fa(t, 0.5, 0.3)} />
            {ticks.map((k, i) => (
              <g key={i} opacity={fa(t, 0.2 + i * 0.2, 0.3)}>
                <circle cx={k.x} cy={k.y} r={5} fill={C.latte} />
                <T x={k.lx} y={k.ly} s={13} a="middle" f={C.taupe}>{String(i + 1)}</T>
              </g>
            ))}
            {!ans && <Token x={270} y={46} o={fa(t, 0.6, 0.4)} />}
            <g style={rv(ans)}>
              <rect x={330} y={-40} width={150} height={44} rx={8} fill="none" stroke={C.latte} />
              <T x={342} y={-13} s={13} f={C.crema}>ship</T>
              <Token x={400} y={-33} />
              <circle cx={421} cy={105} r={22} fill={C.cherry} opacity={0.4} />
              <rect x={391} y={90} width={60} height={30} rx={7} fill="none" stroke={C.taupe} strokeDasharray="5 4" />
              <T x={421} y={146} s={13} a="middle" f={C.cherryText}>lap 2: batch gone</T>
              <T x={300} y={176} s={13} a="middle" f={C.latte}>inside of this loop</T>
              <T x={300} y={198} s={13} a="middle" f={C.cherryText}>value moved here,</T>
              <T x={300} y={218} s={13} a="middle" f={C.cherryText}>in previous iteration of loop</T>
            </g>
          </g>
        </Svg>
      )}
    </Stack>
  );
}

/** Small card and buffer glyphs: the reel's motif, reused where a step is about a move or a clone. */
function MiniCard({ x, y, moved = false }: { x: number; y: number; moved?: boolean }) {
  return (
    <g opacity={moved ? 0.55 : 1}>
      <rect x={x} y={y} width={70} height={26} rx={7} fill={moved ? 'none' : C.roast} stroke={moved ? C.taupe : C.caramel} strokeWidth={moved ? 1.5 : 2.5} strokeDasharray={moved ? '5 4' : undefined} />
      {!moved && <circle cx={x + 14} cy={y + 13} r={4} fill={C.caramel} />}
    </g>
  );
}
function MiniBuf({ x, y, clone = false, o = 1 }: { x: number; y: number; clone?: boolean; o?: number }) {
  return <rect x={x} y={y} width={150} height={14} rx={5} fill={clone ? C.cherry : C.cocoa} fillOpacity={clone ? 0.3 : 1} stroke={clone ? C.cherry : C.latte} strokeWidth={clone ? 2 : 1.5} opacity={o} />;
}

// ── 19 · Back to the batch ─────────────────────────────────────────────────────────────────────────────────────
export function BackToBatch({ t }: StepCtx) {
  const strike = easeOut(seg(t, 4.8, 5.1));
  const bright = 0.8 + 0.2 * easeOut(seg(t, 5.0, 5.6));
  return (
    <Svg label="The clone fix cost 1 allocation and 1,000,000 bytes per batch; borrowing with &[u8], or using the batch first and moving last, costs 0 allocations and 0 bytes" h={484}>
      <g opacity={fa(t, 0, 0.8)}>
        <T x={14} y={32} s={14} f={C.cherryText}>the clone fix</T>
        <Counter x={14} y={62} label="ALLOCATIONS" v={1} t={Math.max(t, 0.9)} a={0.2} />
        <Counter x={200} y={62} label="BYTES COPIED" v={1_000_000} t={Math.max(t, 0.9)} a={0.2} d={0.6} />
        <rect x={10} y={83} width={Math.max(0.1, 390 * strike)} height={3} fill={C.cherry} />
        {/* the card-and-buffer motif of step 1: the clone's second buffer, struck out */}
        <MiniCard x={440} y={22} />
        <MiniBuf x={420} y={62} />
        <MiniBuf x={420} y={82} clone o={1 - 0.6 * strike} />
      </g>
      <g opacity={fa(t, 1.2, 0.4) * bright}>
        <T x={14} y={150} s={15} f={C.caramel} w={600}>if ship only reads: borrow</T>
        <T x={14} y={180} s={14} f={C.crema} o={fa(t, 1.2, 0.8)}>fn ship(batch: &amp;[u8]) -&gt; usize</T>
        <T x={14} y={202} s={14} f={C.crema} o={fa(t, 1.6, 0.4)}>let sent = ship(&amp;batch);</T>
        <g opacity={fa(t, 1.4, 0.4)}>
          <MiniCard x={440} y={166} />
          <Arrow x1={476} y1={196} x2={476} y2={226} c={C.caramel} />
          <T x={488} y={216} s={13} f={C.caramel}>&amp;</T>
          <MiniBuf x={420} y={230} />
        </g>
        <Counter x={14} y={232} label="ALLOCATIONS" v={0} t={t} a={2.2} zeroOk />
        <Counter x={200} y={232} label="BYTES COPIED" v={0} t={t} a={2.2} zeroOk />
      </g>
      <g opacity={fa(t, 2.8, 0.4) * bright}>
        <T x={14} y={330} s={15} f={C.caramel} w={600}>if ship must own it: use first, move last</T>
        <T x={14} y={360} s={14} f={C.crema} o={fa(t, 2.8, 0.8)}>let n = batch.len();</T>
        <T x={14} y={382} s={14} f={C.crema} o={fa(t, 3.2, 0.4)}>let sent = ship(batch);</T>
        <g opacity={fa(t, 3.0, 0.4)}>
          <MiniCard x={420} y={348} moved />
          <MiniCard x={500} y={348} />
          <MiniBuf x={420} y={394} />
        </g>
        <Counter x={14} y={412} label="ALLOCATIONS" v={0} t={t} a={3.8} zeroOk />
        <Counter x={200} y={412} label="BYTES COPIED" v={0} t={t} a={3.8} zeroOk />
      </g>
    </Svg>
  );
}

// ── 20 · Prove it 1 (predict) ──────────────────────────────────────────────────────────────────────────────────
export function ProveMaybeMoved({ t, answer, portrait }: StepCtx) {
  const ans = answer !== null;
  return (
    <Stack>
      {!(portrait && ans) && (
        <Code
          title="retry.rs"
          t={t}
          end={1.0}
          lines={['let batch = vec![7u8; 4];', 'let retry = std::env::args().count() > 1;', 'if retry {', '    ship(batch);', '}', 'println!("{}", batch.len());']}
        />
      )}
      <Svg label="The path where retry is true moves batch and the other path does not; at println! the value is maybe moved, which counts as moved" h={324} fill>
        <g style={rv(ans)}>
          <rect x={240} y={12} width={120} height={32} rx={8} fill="none" stroke={C.latte} />
          <T x={300} y={33} s={13} a="middle" f={C.crema}>let batch</T>
          <Arrow x1={270} y1={46} x2={140} y2={86} />
          <Arrow x1={330} y1={46} x2={460} y2={86} />
          <rect x={20} y={90} width={240} height={32} rx={8} fill="none" stroke={C.latte} />
          <T x={140} y={111} s={13} a="middle" f={C.crema}>retry: ship(batch)</T>
          <rect x={20} y={134} width={240} height={30} rx={8} fill="none" stroke={C.taupe} strokeDasharray="6 5" />
          <T x={140} y={154} s={13} a="middle" f={C.taupe}>batch: moved-out</T>
          <rect x={340} y={90} width={240} height={32} rx={8} fill="none" stroke={C.latte} />
          <T x={460} y={111} s={13} a="middle" f={C.crema}>no retry</T>
          <rect x={340} y={134} width={240} height={30} rx={8} fill={C.roast} stroke={C.caramel} strokeWidth={2} />
          <T x={460} y={154} s={13} a="middle" f={C.crema}>batch: live</T>
          <Arrow x1={140} y1={168} x2={260} y2={212} />
          <Arrow x1={460} y1={168} x2={340} y2={212} />
          <rect x={210} y={216} width={180} height={34} rx={8} fill="none" stroke={C.cherry} strokeWidth={2.5} />
          <T x={300} y={238} s={13} a="middle" f={C.crema}>println!</T>
          <T x={300} y={282} s={15} a="middle" f={C.cherryText} w={600}>maybe moved = moved</T>
        </g>
      </Svg>
    </Stack>
  );
}

// ── 21 · Prove it 2 (predict) ──────────────────────────────────────────────────────────────────────────────────
export function ProveCost({ t, answer, portrait }: StepCtx) {
  const ans = answer !== null;
  return (
    <Stack>
      {!(portrait && ans) && <Code title="chain.rs" t={t} end={1.0} lines={['let a = vec![0u8; 1_000_000];', 'let b = a;', 'let c = b.clone();', 'let d = c;']} />}
      <Svg label="Line 2 and line 4 are moves that slide the card and allocate nothing; only the clone on line 3 stamps a second buffer, 1 allocation of 1,000,000 bytes" h={236} fill>
        <g style={rv(ans)}>
          <Card x={14} y={44} w={100} name="a" moved />
          <Card x={134} y={44} w={100} name="b" />
          <Arrow x1={156} y1={90} x2={150} y2={148} />
          <Bar x={14} y={150} w={240} label="1,000,000 bytes" />
        </g>
        <g style={rv(ans, 0.05)}>
          <Arrow x1={238} y1={67} x2={296} y2={67} c={C.cherryText} />
          <T x={267} y={56} s={13} a="middle" f={C.cherryText}>clone</T>
          <Card x={300} y={44} w={100} name="c" moved />
          <Card x={420} y={44} w={100} name="d" />
          <Arrow x1={442} y1={90} x2={430} y2={148} />
          <Bar x={300} y={150} w={240} label="1,000,000 bytes" clone />
        </g>
        <g style={rv(ans, 0.1)}>
          <T x={300} y={216} s={17} a="middle" f={C.caramel} w={700}>total: 1 allocation</T>
        </g>
      </Svg>
    </Stack>
  );
}

// ── 22 · Prove it 3 (predict) ──────────────────────────────────────────────────────────────────────────────────
export function ProveCopyConfig({ t, answer, portrait }: StepCtx) {
  const ans = answer !== null;
  return (
    <Stack>
      {!(portrait && ans) && (
        <Code
          title="point.rs"
          t={t}
          end={1.2}
          lines={['struct Point3 {', '    x: f32,', '    y: f32,', '    z: f32,', '}', 'for _ in 0..3 { norm(p); }  // E0382']}
        />
      )}
      <Svg label="Point3 is 12 bytes of plain numbers, three 4-byte floats, that own nothing and will not grow, so it goes in the Copy bin and deriving Copy fits" h={210} fill>
        <g style={rv(ans)}>
          <T x={300} y={30} s={15} a="middle" f={C.crema}>size_of::&lt;Point3&gt;() = 12</T>
          <rect x={20} y={50} width={560} height={140} rx={14} fill="none" stroke={C.mocha} strokeWidth={1.5} />
          <T x={38} y={78} s={17} f={C.crema} w={600}>Copy</T>
          <T x={110} y={78} s={13} f={C.latte}>bits are the whole value</T>
          <rect x={38} y={106} width={96} height={28} rx={8} fill={C.roast} stroke={C.mocha} />
          <T x={86} y={125} s={13} a="middle" f={C.crema}>Point3</T>
          {['x', 'y', 'z'].map((n, k) => (
            <g key={n}>
              <rect x={190 + k * 100} y={104} width={96} height={34} fill={C.espresso} stroke={C.latte} strokeWidth={1.5} />
              <T x={238 + k * 100} y={126} s={15} a="middle" f={C.crema}>{n}</T>
            </g>
          ))}
          <T x={340} y={162} s={13} a="middle" f={C.taupe}>3 floats × 4 bytes</T>
        </g>
      </Svg>
    </Stack>
  );
}

// ── 23 · In one breath ─────────────────────────────────────────────────────────────────────────────────────────
export function Recap({ t }: StepCtx) {
  const rows: { lines: string[]; glyph: ReactNode }[] = [
    {
      lines: ['one owner, one drop'],
      glyph: (
        <>
          <rect x={22} y={-12} width={36} height={24} rx={6} fill={C.roast} stroke={C.caramel} strokeWidth={2} />
          <circle cx={32} cy={0} r={3.5} fill={C.caramel} />
        </>
      ),
    },
    {
      lines: ['move = copy the bytes, end the source'],
      glyph: <rect x={22} y={-12} width={36} height={24} rx={6} fill="none" stroke={C.taupe} strokeDasharray="5 4" />,
    },
    {
      lines: ['Copy = the bits are the whole value;', 'never with Drop'],
      glyph: (
        <>
          {[0, 1, 2, 3].map((i) => (
            <rect key={i} x={20 + i * 10} y={-6} width={8} height={12} fill={C.latte} />
          ))}
        </>
      ),
    },
    {
      lines: ['.clone() = the visible cost'],
      glyph: <rect x={22} y={-12} width={36} height={24} rx={4} fill={C.cherry} fillOpacity={0.3} stroke={C.cherry} strokeWidth={2} />,
    },
    {
      lines: ['T takes · &T borrows', '&mut T excludes · -> T returns'],
      glyph: (
        <>
          {/* one arrow per kind: takes, borrows, borrows exclusively (thick), returns */}
          <Arrow x1={22} y1={-18} x2={56} y2={-18} />
          <Arrow x1={22} y1={-6} x2={56} y2={-6} />
          <Arrow x1={56} y1={-6} x2={22} y2={-6} />
          <line x1={26} y1={6} x2={52} y2={6} stroke={C.caramel} strokeWidth={4} />
          <Arrow x1={22} y1={6} x2={56} y2={6} c={C.caramel} />
          <Arrow x1={56} y1={6} x2={22} y2={6} c={C.caramel} />
          <Arrow x1={56} y1={18} x2={22} y2={18} />
        </>
      ),
    },
    {
      lines: ['E0382: why · where · use', 'E0505: end the borrow first'],
      glyph: (
        <>
          <circle cx={40} cy={0} r={11} fill={C.caramel} />
          <text x={40} y={5} textAnchor="middle" fontSize={13} fill={C.espresso} fontWeight={700}>1</text>
        </>
      ),
    },
  ];
  return (
    <Svg label="Six things to keep: one owner one drop; a move copies the bytes and ends the source; Copy is for plain bits; clone is the visible cost; signatures are contracts; E0382 and E0505 are read by their spans" h={460}>
      {rows.map((r, i) => {
        const y = 50 + i * 70;
        return (
          <g key={i} opacity={fa(t, 0.3 + i * 0.4, 0.4)}>
            <g transform={`translate(0 ${y})`}>{r.glyph}</g>
            {r.lines.map((l, j) => (
              <T key={j} x={90} y={y + 5 + j * 22 - (r.lines.length - 1) * 11} s={15} f={C.crema}>{l}</T>
            ))}
          </g>
        );
      })}
    </Svg>
  );
}
