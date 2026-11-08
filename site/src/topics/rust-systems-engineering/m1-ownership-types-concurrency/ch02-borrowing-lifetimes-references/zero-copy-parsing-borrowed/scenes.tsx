import { useEffect, useState } from 'react';
import type { StepCtx } from '../../../../../reels/types';
import { easeOut, easeOutBack, lerp, seg } from '../../../../../reels/anim';
import { Code } from '../../../../../reels/Code';
import { C, Decode, Draw, Reticle, Stack, Svg, T } from '../../../../../reels/kit';

// The topic's own idea: a buffer drawn as a row of byte cells, with the header's fields drawn as
// bracket spans sitting directly over a range of those same cells (never a separate, copied row).
// Every snippet is an exact line of examples/src/bin/*.rs; every claim is executed by examples.py.

const fa = (t: number, a: number, d = 0.4) => easeOut(seg(t, a, a + d));

/** A row of labelled byte cells, used as the "buffer" every view sits on top of. */
function ByteRow({ y, bytes, highlight }: { y: number; bytes: string[]; highlight?: [number, number] }) {
  const w = 56;
  return (
    <g>
      {bytes.map((b, i) => {
        const inRange = highlight && i >= highlight[0] && i < highlight[1];
        return (
          <g key={i}>
            <rect x={40 + i * w} y={y} width={w - 4} height={40} rx={6} fill="none" stroke={inRange ? C.caramel : C.mocha} strokeWidth={inRange ? 2 : 1.5} />
            <T x={40 + i * w + (w - 4) / 2} y={y + 26} s={14} a="middle" f={inRange ? C.caramel : C.taupe}>{b}</T>
          </g>
        );
      })}
    </g>
  );
}

/** A bracket span drawn directly over a range of the byte row below it: never a second, copied row. */
function FieldSpan({ x1, x2, y, t, from, label, color = C.caramel }: { x1: number; x2: number; y: number; t: number; from: number; label: string; color?: string }) {
  const k = easeOut(seg(t, from, from + 0.4));
  if (k <= 0) return null;
  const x2k = x1 + (x2 - x1) * k;
  return (
    <g opacity={k}>
      <line x1={x1} y1={y} x2={x2k} y2={y} stroke={color} strokeWidth={2} />
      <line x1={x1} y1={y - 6} x2={x1} y2={y + 6} stroke={color} strokeWidth={2} />
      {k >= 0.98 && <line x1={x2} y1={y - 6} x2={x2} y2={y + 6} stroke={color} strokeWidth={2} />}
      <T x={(x1 + x2) / 2} y={y - 12} s={13} a="middle" f={color}>{label}</T>
    </g>
  );
}

/** Seconds since the learner answered a predict step (the player's clock has stopped by then), so a reveal can still move. */
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
      if (d < 4.5) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [on]);
  return s;
}

/** A recap as a payoff: each point slides in from the left on its beat (fitted to the step's `end`), its tick draws as it
 * lands, a spine grows down to meet it, and the last point (where the topic leads next) lights up and is locked on. */
function RecapList({ t, rows, label, end, step = 50, s = 15 }: { t: number; rows: string[]; label: string; end: number; step?: number; s?: number }) {
  const y0 = 40;
  const n = rows.length;
  const start = 0.15;
  const beat = Math.min(0.42, Math.max(0.2, (end - start - 1.15) / Math.max(1, n - 1)));
  const h = y0 + (n - 1) * step + 40;
  const lastY = y0 + (n - 1) * step;
  return (
    <Svg label={label} h={Math.max(300, h)}>
      <Draw pts={[[29, y0 - 5], [29, lastY - 5]]} t={t} from={start + 0.1} to={start + 0.1 + (n - 1) * beat} stroke={C.mocha} w={1.5} pen={false} />
      {rows.map((r, i) => {
        const at = start + i * beat;
        const k = easeOut(seg(t, at, at + 0.45));
        const d = easeOut(seg(t, at + 0.2, at + 0.55));
        const y = y0 + i * step;
        const last = i === n - 1;
        if (k <= 0) return null;
        return (
          <g key={r} opacity={k} transform={`translate(${((1 - k) * -44).toFixed(1)} 0)`}>
            <circle cx={29} cy={y - 5} r={11} fill={C.espresso} stroke={last ? C.caramel : C.mocha} strokeWidth={1.5} />
            <path d={`M23 ${y - 5} l4 4 l8 -9`} fill="none" stroke={C.caramel} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" strokeDasharray="20" strokeDashoffset={20 * (1 - d)} />
            <T x={46} y={y} s={s} f={last ? C.caramel : C.crema}>{r}</T>
          </g>
        );
      })}
      <Reticle x={300} y={lastY - 5} w={576} h={36} t={t} at={Math.max(start + (n - 1) * beat + 0.3, end - 0.6)} />
    </Svg>
  );
}

/** A small row of value cells at (x, y); `lit` marks one cell (the one that needs changing), `dy` lifts a copy off it. */
function Cells({ x, y, vals, lit = -1, ok = [], o = 1, stroke = C.mocha }: { x: number; y: number; vals: string[]; lit?: number; ok?: number[]; o?: number; stroke?: string }) {
  return (
    <g opacity={o}>
      {vals.map((v, i) => (
        <g key={i}>
          <rect x={x + i * 52} y={y} width={46} height={36} rx={6} fill={C.cocoa} stroke={i === lit ? C.cherryText : stroke} strokeWidth={i === lit ? 2.5 : 1.5} />
          <T x={x + i * 52 + 23} y={y + 24} s={14} a="middle" f={i === lit ? C.cherryText : C.crema}>{v}</T>
          {ok.includes(i) && <path d={`M${x + i * 52 + 15} ${y + 48} l5 5 l10 -11`} fill="none" stroke={C.caramel} strokeWidth={2.2} />}
        </g>
      ))}
    </g>
  );
}

/** A pointer from (x1, y1) to (x2, y2) drawn by `k`, with an arrowhead once it lands. */
function Ptr({ x1, y1, x2, y2, k, f = C.latte }: { x1: number; y1: number; x2: number; y2: number; k: number; f?: string }) {
  if (k <= 0) return null;
  const x = lerp(x1, x2, k);
  const y = lerp(y1, y2, k);
  const a = Math.atan2(y2 - y1, x2 - x1);
  return (
    <g>
      <line x1={x1} y1={y1} x2={x} y2={y} stroke={f} strokeWidth={2} />
      {k > 0.95 && <path d={`M${x2} ${y2} l${(-9 * Math.cos(a - 0.45)).toFixed(1)} ${(-9 * Math.sin(a - 0.45)).toFixed(1)} M${x2} ${y2} l${(-9 * Math.cos(a + 0.45)).toFixed(1)} ${(-9 * Math.sin(a + 0.45)).toFixed(1)}`} stroke={f} strokeWidth={2} />}
    </g>
  );
}

// ── 1 · A parser that copies nothing ────────────────────────────────────────────────────────────
export function NoCopy({ t }: StepCtx) {
  const bytes = ['R', 'U', 'S', 'T', 'C', 'H', '0', '2'];
  return (
    <Svg label="Header's fields are bracket spans drawn directly over ranges of the caller's own buffer, not a separate copied row" h={360}>
      <T x={40} y={40} s={14} f={C.crema}>buf: [u8; 8]</T>
      <g opacity={fa(t, 0.2, 0.4)}>
        <ByteRow y={60} bytes={bytes} />
      </g>
      <g opacity={fa(t, 0.8, 0.4)}>
        <FieldSpan x1={40} x2={40 + 4 * 56 - 4} y={150} t={t} from={0.8} label="magic: &'a [u8]" />
      </g>
      <g opacity={fa(t, 1.6, 0.4)}>
        <FieldSpan x1={40 + 4 * 56} x2={40 + 8 * 56 - 4} y={210} t={t} from={1.6} label="name: &'a [u8]" color={C.cinnamon} />
      </g>
      <T x={40} y={280} s={14} f={C.caramel} o={fa(t, 2.4, 0.4)}>no byte of buf was copied to build either field</T>
      <T x={40} y={305} s={13} f={C.taupe} o={fa(t, 2.4, 0.4)}>confirmed by pointer equality in zero_copy_parse.rs</T>
    </Svg>
  );
}

// ── 2 · Does Header outlive the buffer it was parsed from? (predict) ───────────────────────────
export function OutlivesQuestion({ t }: StepCtx) {
  const bufIn = fa(t, 0.2, 0.3);
  const headerIn = fa(t, 0.6, 0.3);
  const shrink = easeOut(seg(t, 1.3, 1.7));
  const bufW = 180 * (1 - shrink);
  return (
    <Svg label="a function that owns its buffer as a local Vec, parses it, and tries to return the Header" h={340}>
      <T x={40} y={40} s={14} f={C.crema}>fn make_header() -&gt; Header&lt;'?&gt;</T>
      <rect x={60} y={64} width={200} height={110} rx={10} fill="none" stroke={C.mocha} strokeWidth={1.5} />
      <T x={76} y={88} s={13} f={C.taupe}>function scope</T>
      <g opacity={bufIn}>
        <rect x={80} y={100} width={bufW} height={44} rx={8} fill={C.cocoa} stroke={C.caramel} strokeWidth={2} />
        {bufW > 50 && <T x={80 + bufW / 2} y={126} s={13} a="middle" f={C.crema}>buf: Vec&lt;u8&gt;</T>}
      </g>
      <g opacity={headerIn}>
        <T x={340} y={126} s={14} a="middle" f={C.caramel}>header</T>
        <Draw pts={[[300, 126], [170, 122]]} t={t} from={0.9} to={1.3} stroke={shrink > 0.3 ? C.cherryText : C.caramel} w={2} dash="5 4" pen={false} />
      </g>
      <g opacity={fa(t, 1.7, 0.4)}>
        <T x={300} y={160} s={13} a="middle" f={C.cherryText}>buf just dropped — header still points there</T>
      </g>
      <T x={40} y={260} s={15} f={C.crema} o={fa(t, 2.2, 0.4)}>does this compile?</T>
    </Svg>
  );
}

// ── 3 · The attempt, and the error it earns ─────────────────────────────────────────────────────
export function OutlivesFail({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="examples/src/bin/owned_vs_borrowed_fail.rs"
        lines={["fn make_and_borrow() -> &[u8] {", '    let owned: Vec<u8> = vec![1, 2, 3];', '    &owned[..]', '}']}
        t={t}
        start={0.1}
        end={1.4}
        highlight={[2]}
      />
      <div style={{ opacity: fa(t, 1.6, 0.4) }}>
        <Code title="cargo build" lines={['error[E0515]: cannot return value referencing local variable `owned`']} t={t} start={1.6} end={2.2} highlight={[0]} />
      </div>
    </Stack>
  );
}

// ── 4 · Cow: borrowed until something needs to change ──────────────────────────────────────────
export function CowBorrowed({ t, portrait }: StepCtx) {
  const vals = ['0', '1', '2'];
  const ptr = easeOut(seg(t, 1.0, 1.4));
  const scan = seg(t, 1.6, 2.7);
  const at = Math.min(2, Math.floor(scan * 3));
  const ok = scan <= 0 ? [] : vals.map((_, i) => i).filter((i) => scan * 3 > i + 0.6);
  return (
    <Stack>
      {!portrait && <Code
        title="examples/src/bin/cow_example.rs"
        lines={['let slice = [0, 1, 2];', 'let mut input = Cow::from(&slice[..]);', 'abs_all(&mut input);', '// input is still Cow::Borrowed']}
        t={t}
        start={0.1}
        end={0.9}
        highlight={t > 2.9 ? [3] : t > 1.6 ? [2] : []}
      />}
      <Svg label="input points at slice; abs_all checks each value, finds nothing to flip, and input stays a borrow: no copy is made" h={190} fill>
        <T x={40} y={30} s={13} f={C.taupe} o={easeOut(seg(t, 0.4, 0.7))}>slice</T>
        <g transform={`translate(0 ${((1 - easeOut(seg(t, 0.4, 0.8))) * -16).toFixed(1)})`} opacity={easeOut(seg(t, 0.4, 0.8))}>
          <Cells x={40} y={42} vals={vals} ok={ok} />
        </g>
        {scan > 0 && scan < 1 && <circle cx={40 + at * 52 + 23} cy={34} r={5} fill={C.caramel} />}
        <g opacity={easeOut(seg(t, 0.9, 1.2))}>
          <rect x={330} y={130} width={230} height={40} rx={8} fill={C.cocoa} stroke={t > 2.9 ? C.caramel : C.mocha} strokeWidth={1.5} />
          <T x={445} y={156} s={14} a="middle" f={C.crema}>Cow::Borrowed</T>
        </g>
        <Ptr x1={330} y1={150} x2={120} y2={82} k={ptr} />
        <T x={40} y={168} s={13} f={C.caramel} o={easeOut(seg(t, 2.8, 3.1))}>no copy made</T>
        <Reticle x={445} y={150} w={246} h={54} t={t} at={2.9} />
      </Svg>
    </Stack>
  );
}

// ── 5 · Which call actually clones? (predict) ───────────────────────────────────────────────────
export function CowOwned({ t, answer, portrait }: StepCtx) {
  const ans = answer !== null;
  const s = useSinceAnswer(ans);
  const scan = ans ? seg(s, 0.1, 0.9) : 0;
  const ok = (row: number) => (ans ? [0, 1, 2].filter((i) => scan * 3 > i + 0.6 && !(row === 1 && i === 0)) : []);
  const lift = ans ? easeOut(seg(s, 1.0, 1.6)) : 0; // the clone sliding off the borrowed cells
  const swing = ans ? easeOut(seg(s, 1.6, 2.0)) : 0;
  const pin = (a: number) => easeOut(seg(t, a, a + 0.4));
  return (
    <Stack>
      {!portrait && <Code
        title="examples/src/bin/cow_example.rs"
        lines={['abs_all(&mut Cow::from(&[0, 1, 2][..]));   // ?', 'abs_all(&mut Cow::from(&[-1, 0, 1][..]));  // ?']}
        t={t}
        start={0.1}
        end={0.8}
        highlight={[0, 1]}
      />}
      <Svg label="two calls: the first finds nothing to flip and stays borrowed; the second finds -1, clones the list into its own copy and flips it" h={220} fill>
        <T x={30} y={22} s={13} f={C.taupe}>first call</T>
        <Cells x={30} y={32} vals={['0', '1', '2']} ok={ok(0)} o={pin(0.5)} />
        <T x={30} y={122} s={13} f={C.taupe}>second call</T>
        <Cells x={30} y={132} vals={['-1', '0', '1']} lit={ans && scan > 0.2 ? 0 : -1} ok={ok(1)} o={pin(0.8)} />
        <rect x={400} y={32} width={170} height={36} rx={8} fill={C.cocoa} stroke={C.mocha} strokeWidth={1.5} opacity={pin(1.0)} />
        <T x={485} y={56} s={13} a="middle" f={C.crema} o={pin(1.0)}>Borrowed</T>
        <Ptr x1={400} y1={50} x2={190} y2={50} k={pin(1.0)} />
        <rect x={400} y={132} width={170} height={36} rx={8} fill={C.cocoa} stroke={swing > 0.9 ? C.cherryText : C.mocha} strokeWidth={1.5} opacity={pin(1.2)} />
        {swing < 0.5 ? (
          <T x={485} y={156} s={13} a="middle" f={C.crema} o={pin(1.2)}>Borrowed</T>
        ) : (
          <Decode text="Owned: cloned" x={485} y={156} s={13} a="middle" f={C.cherryText} t={s} at={1.8} dur={0.4} />
        )}
        {lift > 0 && (
          <g transform={`translate(${(lift * 200).toFixed(1)} ${(lift * 50).toFixed(1)})`}>
            <Cells x={30} y={132} vals={[lift > 0.6 ? '1' : '-1', '0', '1']} stroke={C.cherryText} />
          </g>
        )}
        <Ptr x1={400} y1={150} x2={lerp(190, 390, swing)} y2={lerp(150, 200, swing)} k={pin(1.2)} f={swing > 0.5 ? C.cherryText : C.latte} />
      </Svg>
    </Stack>
  );
}

// ── 6 · bytes::Bytes: owning the share, not borrowing it ───────────────────────────────────────
export function BytesShare({ t }: StepCtx) {
  return (
    <Svg label="a Bytes built from an owned buffer is returned freely, then cloned (reference count) and sliced (same memory), neither copying a byte" h={360}>
      <T x={40} y={40} s={14} f={C.crema}>fn make_and_share() -&gt; Bytes</T>
      <g opacity={fa(t, 0.4, 0.4)}>
        <rect x={40} y={70} width={200} height={50} rx={8} fill="none" stroke={C.caramel} strokeWidth={2} />
        <T x={60} y={100} s={13} f={C.caramel}>owned Vec&lt;u8&gt; → Bytes</T>
      </g>
      <g opacity={fa(t, 1.1, 0.4)}>
        <Draw pts={[[280, 95], [340, 95]]} t={t} from={1.1} to={1.5} stroke={C.taupe} w={2} pen={false} />
        <rect x={350} y={70} width={160} height={50} rx={8} fill="none" stroke={C.cinnamon} strokeWidth={2} />
        <T x={368} y={100} s={13} f={C.cinnamon}>a.clone(): rc++</T>
      </g>
      <g opacity={fa(t, 1.9, 0.4)}>
        <rect x={40} y={150} width={420} height={50} rx={8} fill="none" stroke={C.mocha} strokeWidth={1.5} />
        <T x={60} y={180} s={13} f={C.taupe}>whole: "Hello world"</T>
        <rect x={55} y={158} width={110} height={34} rx={6} fill="none" stroke={C.caramel} strokeWidth={2} />
      </g>
      <T x={40} y={240} s={14} f={C.caramel} o={fa(t, 2.5, 0.4)}>a.clone() and whole.slice(0..5) share one allocation</T>
      <T x={40} y={265} s={13} f={C.taupe} o={fa(t, 2.5, 0.4)}>confirmed by pointer equality in bytes_share.rs</T>
    </Svg>
  );
}

// ── 7 · A struct that borrows its own field ─────────────────────────────────────────────────────
export function SelfRefFail({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="examples/src/bin/self_ref_fail.rs"
        lines={["struct Parsed<'a> { owner: String, view: &'a str }", 'let owner = String::from("hello");', 'let view = &owner[..];', 'Parsed { owner, view }']}
        t={t}
        start={0.1}
        end={1.8}
        highlight={[3]}
      />
      <div style={{ opacity: fa(t, 2.0, 0.4) }}>
        <Code title="cargo build" lines={['error[E0515]: returns a borrow of `owner`', 'error[E0505]: moves `owner` while borrowed']} t={t} start={2.0} end={2.6} highlight={[0, 1]} />
      </div>
    </Stack>
  );
}

// ── 8 · ouroboros makes the same shape safe (predict) ───────────────────────────────────────────
export function OuroborosWorks({ t, answer, portrait }: StepCtx) {
  const ans = answer !== null;
  const s = useSinceAnswer(ans);
  const settle = ans ? easeOut(seg(s, 0.1, 0.8)) : 0; // owner moves into its final, stable spot first
  const lock = ans ? easeOutBack(seg(s, 0.8, 1.1)) : 0;
  const view = ans ? easeOut(seg(s, 1.2, 1.8)) : 0; // only then is view built against it
  const door = ans ? easeOut(seg(s, 2.1, 2.6)) : 0;
  const shell = easeOut(seg(t, 0.9, 1.4));
  return (
    <Stack>
      {!portrait && <Code
        title="examples/src/bin/ouroboros_works.rs"
        lines={['#[self_referencing]', 'struct Parsed {', '    owner: String,', '    #[borrows(owner)]', "    view: &'this str,", '}']}
        t={t}
        start={0.1}
        end={0.9}
        highlight={[3, 4]}
      />}
      <Svg label="the owned String settles into the struct's stable storage first, then view is built borrowing it, and outside code reaches view only through the generated borrow_view accessor" h={200} fill>
        <rect x={250} y={24} width={320} height={130} rx={10} fill="none" stroke={C.mocha} strokeWidth={1.5} opacity={shell} />
        <T x={262} y={142} s={13} f={C.taupe} o={shell}>Parsed</T>
        <rect x={270} y={56} width={130} height={34} rx={6} fill="none" stroke={C.mocha} strokeDasharray="4 3" opacity={shell} />
        <T x={335} y={46} s={13} a="middle" f={C.taupe} o={shell}>owner</T>
        <rect x={420} y={56} width={130} height={34} rx={6} fill={view > 0.95 ? C.cocoa : 'none'} stroke={view > 0.95 ? C.caramel : C.mocha} strokeDasharray={view > 0.95 ? undefined : '4 3'} opacity={shell} />
        <T x={485} y={46} s={13} a="middle" f={C.taupe} o={shell}>view</T>
        <g transform={`translate(${lerp(0, 250, settle).toFixed(1)} ${lerp(0, 0, settle)})`} opacity={easeOut(seg(t, 0.4, 0.8))}>
          <rect x={20} y={56} width={130} height={34} rx={6} fill={C.cocoa} stroke={lock > 0.5 ? C.caramel : C.crema} strokeWidth={1.5} />
          <T x={85} y={78} s={14} a="middle" f={C.crema}>"hello"</T>
        </g>
        {lock > 0 && (
          <g transform={`translate(388 70) scale(${lock.toFixed(3)})`}>
            <path d="M-6 0 v-5 a6 6 0 0 1 12 0 v5" fill="none" stroke={C.caramel} strokeWidth={2} />
            <rect x={-8} y={0} width={16} height={11} rx={2} fill={C.caramel} />
          </g>
        )}
        {view > 0 && <Draw pts={[[485, 90], [485, 128], [335, 128], [335, 92]]} t={s} from={1.2} to={1.8} stroke={C.caramel} w={2} />}
        {door > 0 && (
          <g opacity={door}>
            <Ptr x1={60} y1={178} x2={lerp(60, 410, door)} y2={178} k={1} f={C.cinnamon} />
            <Decode text="borrow_view()" x={60} y={168} s={13} f={C.cinnamon} t={s} at={2.1} dur={0.5} />
            <line x1={410} y1={178} x2={485} y2={178} stroke={C.cinnamon} strokeWidth={2} opacity={door > 0.95 ? 1 : 0} />
            <line x1={485} y1={178} x2={485} y2={150} stroke={C.cinnamon} strokeWidth={2} opacity={door > 0.95 ? 1 : 0} />
          </g>
        )}
      </Svg>
    </Stack>
  );
}

// ── 9 · Why yoke and ouroboros exist at all ─────────────────────────────────────────────────────
export function WhyYoke({ t }: StepCtx) {
  const yoked = easeOutBack(seg(t, 0.6, 1.0));
  const travel = easeOut(seg(t, 1.6, 2.4));
  const dx = 220 * travel;
  return (
    <Svg label="Yoke attaches a zero-copy value to the cart it was built from, erasing a static lifetime into a dynamic one" h={320}>
      <T x={40} y={24} s={14} f={C.crema}>Yoke&lt;Cow&lt;'static, str&gt;, Rc&lt;[u8]&gt;&gt;</T>
      <g transform={`translate(${dx},0)`}>
        <rect x={60} y={120} width={150} height={56} rx={9} fill={C.cocoa} stroke={C.mocha} strokeWidth={1.5} />
        <T x={135} y={152} s={13} a="middle" f={C.taupe}>cart: Rc&lt;[u8]&gt;</T>
        {yoked > 0.01 && (
          <g opacity={yoked}>
            <Draw pts={[[135, 120], [135, 96]]} t={t} from={0.6} to={0.9} stroke={C.caramel} w={2.5} pen={false} />
            <rect x={60} y={66} width={150} height={32} rx={8} fill="none" stroke={C.caramel} strokeWidth={2} />
            <T x={135} y={87} s={13} a="middle" f={C.caramel}>Cow view</T>
          </g>
        )}
      </g>
      <g opacity={fa(t, 1.3, 0.3)}>
        <T x={40} y={200} s={13} f={C.taupe}>the pair moves as one value, freely</T>
      </g>
      <g opacity={fa(t, 2.6, 0.4)}>
        <T x={40} y={250} s={14} f={C.taupe}>erasing a static lifetime into a dynamic one,</T>
        <T x={40} y={274} s={14} f={C.taupe}>the way dyn erases a static type into a dynamic one</T>
      </g>
    </Svg>
  );
}

// ── 10 · Recap ──────────────────────────────────────────────────────────────────────────────────
export function Recap({ t }: StepCtx) {
  return (
    <RecapList
      t={t}
      end={2.8}
      label="recap: zero-copy views, the outlives rule, Cow, Bytes, and why self-referencing structs need help"
      rows={['a parsed view points at the original buffer', 'a borrow can never outlive what it borrows', 'Cow defers its clone until mutation happens', 'Bytes escapes scope by owning a shared count', 'self-referencing needs yoke, ouroboros, or unsafe']}
      s={14}
    />
  );
}
