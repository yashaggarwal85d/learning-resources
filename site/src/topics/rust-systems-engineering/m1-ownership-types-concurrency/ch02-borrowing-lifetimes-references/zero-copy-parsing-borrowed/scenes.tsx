import type { StepCtx } from '../../../../../reels/types';
import { easeOut, seg } from '../../../../../reels/anim';
import { Code } from '../../../../../reels/Code';
import { C, Draw, Stack, Svg, T } from '../../../../../reels/kit';

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
  return (
    <Svg label="a function that owns its buffer as a local Vec, parses it, and tries to return the Header" h={340}>
      <T x={40} y={50} s={14} f={C.crema}>fn make_header() -&gt; Header&lt;'?&gt; {'{'}</T>
      <T x={56} y={90} s={14} f={C.taupe} o={fa(t, 0.3, 0.4)}>let buf: Vec&lt;u8&gt; = vec![..];</T>
      <T x={56} y={122} s={14} f={C.taupe} o={fa(t, 0.7, 0.4)}>let header = parse(&amp;buf);</T>
      <T x={56} y={154} s={14} f={C.caramel} o={fa(t, 1.1, 0.4)}>header  // buf is about to be dropped</T>
      <T x={40} y={186} s={14} f={C.crema}>{'}'}</T>
      <T x={40} y={240} s={14} f={C.taupe} o={fa(t, 1.6, 0.4)}>does this compile?</T>
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
export function CowBorrowed({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="examples/src/bin/cow_example.rs"
        lines={['let slice = [0, 1, 2];', 'let mut input = Cow::from(&slice[..]);', 'abs_all(&mut input);', '// input is still Cow::Borrowed']}
        t={t}
        start={0.1}
        end={1.8}
        highlight={[3]}
      />
    </Stack>
  );
}

// ── 5 · Which call actually clones? (predict) ───────────────────────────────────────────────────
export function CowOwned({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="examples/src/bin/cow_example.rs"
        lines={['abs_all(&mut Cow::from(&[0, 1, 2][..]));   // ?', 'abs_all(&mut Cow::from(&[-1, 0, 1][..]));  // ?']}
        t={t}
        start={0.1}
        end={1.8}
        highlight={[0, 1]}
      />
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
export function OuroborosWorks({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="examples/src/bin/ouroboros_works.rs"
        lines={['#[self_referencing]', 'struct Parsed {', '    owner: String,', '    #[borrows(owner)]', "    view: &'this str,", '}']}
        t={t}
        start={0.1}
        end={2.0}
        highlight={[3, 4]}
      />
    </Stack>
  );
}

// ── 9 · Why yoke and ouroboros exist at all ─────────────────────────────────────────────────────
export function WhyYoke({ t }: StepCtx) {
  return (
    <Svg label="Yoke attaches a zero-copy value to the cart it was built from, erasing a static lifetime into a dynamic one" h={340}>
      <T x={40} y={50} s={15} f={C.crema}>Yoke&lt;Cow&lt;'static, str&gt;, Rc&lt;[u8]&gt;&gt;</T>
      <g opacity={fa(t, 0.5, 0.4)}>
        <T x={40} y={100} s={14} f={C.taupe}>the Cow is "yoked" to the Rc it was deserialized from</T>
      </g>
      <g opacity={fa(t, 1.2, 0.4)}>
        <T x={40} y={150} s={14} f={C.caramel}>the pair moves around as one value, freely</T>
      </g>
      <g opacity={fa(t, 1.9, 0.4)}>
        <T x={40} y={210} s={14} f={C.taupe}>erasing a static lifetime into a dynamic one,</T>
        <T x={40} y={234} s={14} f={C.taupe}>the way dyn erases a static type into a dynamic one</T>
      </g>
    </Svg>
  );
}

// ── 10 · Recap ──────────────────────────────────────────────────────────────────────────────────
export function Recap({ t }: StepCtx) {
  const rows = ['a parsed view points at the original buffer', 'a borrow can never outlive what it borrows', 'Cow defers its clone until mutation happens', 'Bytes escapes scope by owning a shared count', 'self-referencing needs yoke, ouroboros, or unsafe'];
  return (
    <Svg label="recap: zero-copy views, the outlives rule, Cow, Bytes, and why self-referencing structs need help" h={320}>
      {rows.map((r, i) => (
        <g key={r} opacity={fa(t, 0.2 + i * 0.4, 0.4)}>
          <circle cx={30} cy={40 + i * 50} r={5} fill={C.caramel} />
          <T x={48} y={46 + i * 50} s={15} f={C.crema}>{r}</T>
        </g>
      ))}
    </Svg>
  );
}
