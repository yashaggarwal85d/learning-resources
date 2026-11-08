import type { StepCtx } from '../../../../../reels/types';
import { easeOut, seg, lerp, clamp, easeInOut } from '../../../../../reels/anim';
import { Code } from '../../../../../reels/Code';
import { Draw, Stack, Svg, T, C, Reticle, Decode } from '../../../../../reels/kit';

// A validity rule and a provenance rule are both checked directly and
// safely, never by constructing the invalid case they describe.
const fa = (t: number, a: number, d = 0.4) => easeOut(seg(t, a, a + d));
// ── Moves shared by this topic's measured, quoted and recap figures ─────────
/** Eased 0..1 from `a` over `d` seconds. */
const ez = (t: number, a: number, d = 0.4) => easeOut(seg(t, a, a + d));

/** A caption line that slides in from the left on its beat; its marker draws itself (tick, cross) or grows (dot). */
function Line({ t, at, y, text, mark = 'dot', mf = C.caramel, f = C.crema }: { t: number; at: number; y: number; text: string; mark?: 'dot' | 'tick' | 'cross'; mf?: string; f?: string }) {
  const k = ez(t, at, 0.45);
  const m = ez(t, at + 0.2, 0.35);
  if (k <= 0) return null;
  return (
    <g opacity={k} transform={`translate(${(-28 * (1 - k)).toFixed(2)} 0)`}>
      {mark === 'dot' && <circle cx={30} cy={y - 5} r={5 * m} fill={mf} />}
      {mark === 'tick' && <path d={`M23 ${y - 5} l5 5 l10 -11`} fill="none" stroke={mf} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={24} strokeDashoffset={24 * (1 - m)} />}
      {mark === 'cross' && <path d={`M24 ${y - 11} l12 12 M36 ${y - 11} l-12 12`} fill="none" stroke={mf} strokeWidth={2.5} strokeLinecap="round" strokeDasharray={34} strokeDashoffset={34 * (1 - m)} />}
      <T x={48} y={y} s={13} f={f}>
        {text}
      </T>
    </g>
  );
}

/**
 * A quoted source: the quote panel rises into place, a rule draws down its left edge, each quoted line slides in on
 * its beat, and the line that carries the point gets an underline drawn under it once the quote has landed.
 */
function Quote({ t, lines, y0 = 40, gap = 40, hot, at = 0.25, beat = 0.55 }: { t: number; lines: string[]; y0?: number; gap?: number; hot: number; at?: number; beat?: number }) {
  const k = ez(t, 0, 0.5);
  const top = y0 - 26;
  const bottom = y0 + (lines.length - 1) * gap + 16;
  const u = at + lines.length * beat;
  return (
    <g>
      <rect x={14} y={top + (1 - k) * 14} width={572} height={bottom - top} rx={6} fill={C.roast} opacity={k} />
      <Draw pts={[[26, top + 8], [26, bottom - 8]]} t={t} from={0.15} to={0.15 + beat * lines.length} stroke={C.taupe} w={2} pen={false} />
      {lines.map((l, i) => {
        const s = ez(t, at + i * beat, 0.45);
        return (
          <g key={l} opacity={s} transform={`translate(${(-22 * (1 - s)).toFixed(2)} 0)`}>
            <T x={42} y={y0 + i * gap} s={14} f={i === hot ? C.focus : C.crema} serif italic>
              {l}
            </T>
          </g>
        );
      })}
      <Draw pts={[[42, y0 + hot * gap + 8], [42 + Math.min(520, lines[hot].length * 7.2), y0 + hot * gap + 8]]} t={t} from={u} to={u + 0.5} stroke={C.focus} w={1.5} />
    </g>
  );
}

/**
 * The recap as a payoff: a spine draws down the left, each point's tick is drawn as the spine reaches it and the
 * point slides in beside it, and the last point, the one the topic stands on, is locked on once it lands.
 */
function RecapList({ t, rows, label, y0 = 50, gap = 58, h = 300 }: { t: number; rows: string[]; label: string; y0?: number; gap?: number; h?: number }) {
  const beat = 2.2 / rows.length;
  const at = (i: number) => 0.2 + i * beat;
  const last = rows.length - 1;
  return (
    <Svg label={label} h={h}>
      <Draw pts={[[30, y0 - 5], [30, y0 - 5 + last * gap]]} t={t} from={at(0)} to={at(last)} stroke={C.mocha} w={2} pen={false} />
      {rows.map((r, i) => {
        const k = ez(t, at(i), 0.45);
        const m = ez(t, at(i) + 0.1, 0.35);
        const y = y0 + i * gap;
        const f = i === last ? C.focus : C.caramel;
        return (
          <g key={r}>
            <circle cx={30} cy={y - 5} r={11 * m} fill={C.espresso} stroke={f} strokeWidth={1.5} opacity={m} />
            <path d={`M24 ${y - 5} l4 4 l8 -9`} fill="none" stroke={f} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={20} strokeDashoffset={20 * (1 - m)} />
            <g opacity={k} transform={`translate(${(-24 * (1 - k)).toFixed(2)} 0)`}>
              <T x={52} y={y} s={13} f={i === last ? C.focus : C.crema} w={i === last ? 600 : 500}>
                {r}
              </T>
            </g>
          </g>
        );
      })}
      <Reticle x={300} y={y0 + last * gap - 5} w={576} h={38} t={t} at={at(last) + 0.45} />
    </Svg>
  );
}


// ── 1 · How many of 256 bytes are a valid bool (predict, hook) ──────────
export function BoolValidityPredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="256 possible byte patterns, one bool"
        lines={['for byte in 0u16..=255 { is_valid_bool_byte(byte as u8) }', '// how many of the 256 genuinely pass?']}
        t={t}
        start={0.1}
        end={2.6}
        highlight={[1]}
      />
    </Stack>
  );
}

// ── 2 · Measured: exactly 2 of 256 (takeaway) ────────────────────────────
export function BoolValidityReveal({ t }: StepCtx) {
  const sweep = easeOut(seg(t, 0.4, 1.0));
  return (
    <Svg label="validity_and_provenance_are_rules_not_bit_patterns.rs" h={200}>
      <T x={60} y={50} s={14} f={C.crema} o={fa(t, 0.3, 0.4)}>every one of 256 real byte values, checked</T>
      <Draw pts={[[60, 80], [320, 80]]} t={t} from={0.4} to={1.0} stroke={C.taupe} w={6} />
      <circle cx={61} cy={80} r={5} fill={C.caramel} opacity={fa(t, 1.1, 0.2)} />
      <circle cx={62} cy={80} r={5} fill={C.caramel} opacity={fa(t, 1.1, 0.2)} />
      {fa(t, 1.3, 0.4) > 0.85 && <T x={190} y={130} s={13} a="middle" f={C.mocha}>exactly 2 pass: byte 0, byte 1</T>}
    </Svg>
  );
}

// ── 3 · Does with_addr keep the real right to read it (predict) ─────────
export function AddrRoundTripPredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="addr(), shifted, rebuilt with with_addr()"
        lines={['ptr.with_addr(ptr.addr() + 3 * size_of::<i32>());', '// still the real right to read that allocation?']}
        t={t}
        start={0.1}
        end={2.6}
        highlight={[1]}
      />
    </Stack>
  );
}

// ── 4 · Measured: the addr / with_addr round trip ───────────────────────────
// The array's base pointer carries its provenance tag (blue). Its address is read out as a plain number and hops
// three elements along; with_addr then rebuilds a pointer at the shifted address, the tag moves across onto it, and
// the element it lands on is locked on: the exact correct value.
export function AddrRoundTripReveal({ t }: StepCtx) {
  const sx = (i: number) => 140 + i * 70;
  const hop = (k: number) => clamp(seg(t, 0.6, 1.5) * 3 - k);
  const pos = sx(0) + (hop(0) + hop(1) + hop(2)) * 70;
  const arc = Math.max(...[0, 1, 2].map((k) => Math.sin(hop(k) * Math.PI)));
  const tag = easeInOut(seg(t, 1.7, 2.1));
  return (
    <Svg label="validity_and_provenance_are_rules_not_bit_patterns.rs" h={262}>
      {[0, 1, 2, 3, 4].map((i) => (
        <rect key={i} x={sx(i) - 30} y={110} width={60} height={34} rx={4} fill="none" stroke={i === 3 && t > 2.1 ? C.focus : C.mocha} strokeWidth={2} opacity={ez(t, i * 0.05)} />
      ))}
      <path d={`M${sx(0)} 104 v-22`} stroke={C.caramel} strokeWidth={2} opacity={ez(t, 0.2)} />
      <path d={`M${sx(0) - 6} 98 l6 8 l6 -8`} fill="none" stroke={C.caramel} strokeWidth={2} opacity={ez(t, 0.2)} />
      <T x={sx(0)} y={74} s={13} a="middle" f={C.crema} o={ez(t, 0.2)}>base</T>
      <circle cx={lerp(sx(0) + 22, sx(3) + 22, tag)} cy={lerp(88, 88, tag) - Math.sin(tag * Math.PI) * 26} r={6} fill={C.second} opacity={ez(t, 0.3)} />
      {t > 0.5 && <rect x={pos - 14} y={168 - arc * 22} width={28} height={16} rx={3} fill={C.latte} opacity={1 - ez(t, 1.7, 0.3)} />}
      <T x={pos} y={196} s={13} a="middle" f={C.latte} o={ez(t, 0.5) * (1 - ez(t, 1.7, 0.3))}>addr</T>
      <g opacity={ez(t, 1.6, 0.3)}>
        <path d={`M${sx(3)} 104 v-22`} stroke={C.focus} strokeWidth={2} />
        <path d={`M${sx(3) - 6} 98 l6 8 l6 -8`} fill="none" stroke={C.focus} strokeWidth={2} />
        <T x={sx(3)} y={74} s={13} a="middle" f={C.focus}>with_addr</T>
      </g>
      <Reticle x={sx(3)} y={127} w={70} h={44} t={t} at={2.2} />
      <Line t={t} at={0.7} y={226} text="base_addr read out, shifted by three elements" />
      <Line t={t} at={1.8} y={254} text="with_addr rebuilds it, same real provenance" mf={C.second} />
    </Svg>
  );
}

// ── 5 · Of 6 addresses, how many pass non-null and aligned (predict) ────
export function NullAlignPredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="6 real candidate addresses, align 4, no reference built"
        lines={['[0, 4, 6, 8, 11, 16].filter(|a| a != 0 && a % 4 == 0)', '// how many of the six genuinely pass?']}
        t={t}
        start={0.1}
        end={2.6}
        highlight={[1]}
      />
    </Stack>
  );
}

// ── 6 · Measured: exactly 3 of 6 pass (takeaway) ─────────────────────────
export function NullAlignReveal({ t }: StepCtx) {
  const addrs = [0, 4, 6, 8, 11, 16];
  const pass = new Set([4, 8, 16]);
  return (
    <Svg label="validity_and_provenance_are_rules_not_bit_patterns.rs" h={200}>
      <T x={60} y={50} s={14} f={C.crema} o={fa(t, 0.3, 0.4)}>the identical check, on six real addresses</T>
      {addrs.map((a, i) => {
        const land = easeOut(seg(t, 0.4 + i * 0.1, 0.6 + i * 0.1));
        const dy = (1 - land) * -16;
        return (
          <g key={a} opacity={fa(t, 0.4 + i * 0.1, 0.2)}>
            <circle cx={75 + i * 42} cy={78 + dy} r={5} fill={pass.has(a) ? C.caramel : C.taupe} />
            <T x={65 + i * 42} y={100} s={11} f={C.latte}>{a}</T>
          </g>
        );
      })}
      {fa(t, 1.2, 0.4) > 0.85 && <T x={190} y={130} s={13} a="middle" f={C.mocha}>exactly 3 pass: 4, 8, 16</T>}
      <T x={60} y={160} s={13} f={C.latte} o={fa(t, 1.6, 0.3)}>checked on the address; nothing invalid built</T>
    </Svg>
  );
}

// ── 7 · Three sources agree (connecting) ───────────────────────────────────
// The quote lands; under it, the two rules act. Left: a bool slot cycles through byte patterns and the first one that
// isn't a valid bool turns red at once, no read needed. Right: of two pointers at the same address, only the one
// still carrying its provenance tag gets through to memory.
export function DocsReveal({ t }: StepCtx) {
  const bad = t > 1.3;
  const p1 = easeInOut(seg(t, 1.4, 1.9));
  const p2 = easeInOut(seg(t, 1.7, 2.2));
  return (
    <Svg label="Rust Reference / std::mem / std::ptr, quoted" h={230}>
      <Quote t={t} lines={['producing an invalid value is immediate UB', 'provenance is the real right to access memory']} hot={1} y0={40} gap={38} beat={0.45} />
      <rect x={40} y={130} width={120} height={40} rx={6} fill={bad ? C.cherry : 'none'} stroke={bad ? C.cherryText : C.latte} strokeWidth={2} opacity={ez(t, 0.7)} />
      <Decode text={bad ? 'invalid' : t > 1.0 ? 'false' : 'true'} t={t} at={bad ? 1.3 : t > 1.0 ? 1.0 : 0.7} dur={0.25} x={100} y={155} s={13} a="middle" f={C.crema} />
      <T x={100} y={194} s={13} a="middle" f={C.cherryText} o={ez(t, 1.4)}>immediate UB</T>
      <rect x={470} y={120} width={100} height={70} rx={6} fill="none" stroke={C.caramel} strokeWidth={2} opacity={ez(t, 0.8)} />
      <T x={520} y={160} s={13} a="middle" f={C.crema} o={ez(t, 0.8)}>memory</T>
      <g opacity={ez(t, 1.2)}>
        <line x1={260} y1={138} x2={lerp(260, 464, p1)} y2={138} stroke={C.second} strokeWidth={2} />
        <circle cx={lerp(260, 464, p1)} cy={138} r={6} fill={C.second} />
        <line x1={260} y1={172} x2={lerp(260, 400, p2)} y2={172} stroke={C.latte} strokeWidth={2} />
        <path d="M410 164 l14 14 m0 -14 l-14 14" stroke={C.cherryText} strokeWidth={2.5} strokeDasharray={40} strokeDashoffset={40 * (1 - ez(t, 2.2, 0.3))} />
      </g>
      <T x={250} y={143} s={13} a="end" f={C.second} o={ez(t, 1.2)}>tagged</T>
      <T x={250} y={177} s={13} a="end" f={C.latte} o={ez(t, 1.2)}>bare</T>
    </Svg>
  );
}

// ── 8 · Recap ──────────────────────────────────────────────────────────────
export function Recap({ t }: StepCtx) {
  return (
    <RecapList
      t={t}
      label="recap: validity and provenance, checked directly"
      rows={['a validity rule: checked on every real byte', 'a provenance rule: checked on a real address', 'neither one built by constructing the invalid case']}
      gap={70}
      y0={60}
    />
  );
}
