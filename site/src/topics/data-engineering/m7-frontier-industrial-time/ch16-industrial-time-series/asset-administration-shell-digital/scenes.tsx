import { useEffect, useState } from 'react';
import { C, Draw, Svg, T } from '../../../../../reels/kit';
import { easeInOut, easeOut, easeOutBack, lerp, seg } from '../../../../../reels/anim';
import type { StepCtx } from '../../../../../reels/types';

// The Asset Administration Shell, drawn from examples.py's own objects: the PressModelX200 type shell and its two
// instance shells, SN-0001 and SN-0002; Weight and Mass_kg sharing 0173-1#02-AAA017#002; one Nameplate read over REST and
// from an AASX package; and a validation gate that rejects two broken submodels and passes a wrong-but-tagged one.

/** Seconds since the learner answered a predict step (the player's clock has stopped by then), so reveals can animate. */
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
      if (d < 4) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [on]);
  return s;
}

/** A plain box with a centred label. */
const Box = ({
  x,
  y,
  w,
  h = 32,
  label,
  lit = false,
  o = 1,
  dash,
  stroke,
  f,
  fill,
}: {
  x: number;
  y: number;
  w: number;
  h?: number;
  label: string;
  lit?: boolean;
  o?: number;
  dash?: string;
  stroke?: string;
  f?: string;
  fill?: string;
}) =>
  o <= 0 ? null : (
    <g opacity={Math.min(1, o)}>
      <rect x={x} y={y} width={w} height={h} rx={4} fill={fill ?? C.panel} stroke={stroke ?? (lit ? C.focus : C.line)} strokeWidth={lit ? 1.8 : 1.1} strokeDasharray={dash} />
      <T x={x + w / 2} y={y + h / 2 + 5} s={13} f={f ?? (lit ? C.focus : C.primary)} a="middle">
        {label}
      </T>
    </g>
  );

/** A label-left / value-right line under a drawing. */
const Line2 = ({ y, l, r, o, rc = C.focus, lc = C.secondary, lx = 30 }: { y: number; l: string; r: string; o: number; rc?: string; lc?: string; lx?: number }) =>
  o <= 0 ? null : (
    <g opacity={Math.min(1, o)}>
      <T x={lx} y={y} s={14} f={lc}>
        {l}
      </T>
      <T x={575} y={y} s={14} f={rc} a="end">
        {r}
      </T>
    </g>
  );

/** A check mark. */
const Tick = ({ x, y, k, color = C.focus }: { x: number; y: number; k: number; color?: string }) =>
  k <= 0 ? null : <path d={`M${x - 5} ${y} l4 4 l8 -9`} fill="none" stroke={color} strokeWidth={2} opacity={k} />;

/** A red ✕. */
const Cross = ({ x, y, k }: { x: number; y: number; k: number }) =>
  k <= 0 ? null : (
    <g stroke={C.badText} strokeWidth={2.4} opacity={k}>
      <line x1={x - 6} y1={y - 6} x2={x + 6} y2={y + 6} />
      <line x1={x + 6} y1={y - 6} x2={x - 6} y2={y + 6} />
    </g>
  );

/** An arrow from (x1,y1) to (x2,y2), drawn to fraction k. */
const Arrow = ({ x1, y1, x2, y2, k, c = C.line }: { x1: number; y1: number; x2: number; y2: number; k: number; c?: string }) => {
  if (k <= 0) return null;
  const x = lerp(x1, x2, k);
  const y = lerp(y1, y2, k);
  const a = Math.atan2(y2 - y1, x2 - x1);
  const h = (d: number) => `${x - 8 * Math.cos(a + d)} ${y - 8 * Math.sin(a + d)}`;
  return (
    <g stroke={c} strokeWidth={1.4} fill="none">
      <line x1={x1} y1={y1} x2={x} y2={y} />
      {k > 0.85 ? <path d={`M${h(0.45)} L${x} ${y} L${h(-0.45)}`} /> : null}
    </g>
  );
};

/** A supplier format glyph: page, grid, braces, brackets. */
const Glyph = ({ kind, x, y, c }: { kind: number; x: number; y: number; c: string }) =>
  kind >= 2 ? (
    <T x={x + 11} y={y + 5} s={14} f={c} a="middle">
      {kind === 2 ? '{ }' : '[ ]'}
    </T>
  ) : (
    <g stroke={c} strokeWidth={1.2} fill="none">
      {kind === 0 ? <path d={`M${x} ${y - 12} h14 l6 6 v18 h-20 z M${x + 14} ${y - 12} v6 h6`} /> : null}
      {kind === 1 ? (
        <g>
          <rect x={x} y={y - 11} width={22} height={22} />
          <line x1={x} y1={y - 4} x2={x + 22} y2={y - 4} />
          <line x1={x} y1={y + 4} x2={x + 22} y2={y + 4} />
          <line x1={x + 11} y1={y - 11} x2={x + 11} y2={y + 11} />
        </g>
      ) : null}
    </g>
  );

const REQ = '0173-1#02-AAM556#002';
const MASS = '0173-1#02-AAA017#002';

// 0 · Four suppliers send the same four-item hand-over in four shapes: a PDF, a spreadsheet, two incompatible JSON shapes.
// Each packet flies at the carmaker, whose four slots stay empty dashes; each bounces with a red ✕. Then a custom
// adapter box appears in every row: one integration per supplier.
export function Hook({ t }: StepCtx) {
  const ROWS = ['PDF', 'spreadsheet', 'JSON shape 1', 'JSON shape 2'];
  const SLOTS = ['nameplate', 'tech data', 'carbon', 'handover'];
  const box = easeOut(seg(t, 0, 0.8));
  return (
    <Svg
      label="a battery supplier must hand over a nameplate, technical data, a carbon footprint and handover documents, and the data arrives as PDFs, spreadsheets and several incompatible JSON shapes"
      h={200}
    >
      <g opacity={box}>
        <rect x={448} y={14} width={127} height={160} rx={5} fill={C.panel} stroke={C.line} strokeWidth={1.2} />
        <T x={512} y={34} s={13} f={C.primary} a="middle">
          carmaker
        </T>
        {SLOTS.map((l, i) => (
          <g key={l} opacity={easeOut(seg(t, 0.3 + i * 0.15, 0.8 + i * 0.15))}>
            <rect x={456} y={46 + i * 31} width={111} height={24} rx={3} fill="none" stroke={C.secondary} strokeWidth={1} strokeDasharray="3 3" />
            <T x={512} y={63 + i * 31} s={12} f={C.secondary} a="middle">
              {l}
            </T>
          </g>
        ))}
      </g>
      {ROWS.map((l, i) => {
        const y = 40 + i * 38;
        const k = easeOut(seg(t, 1.0 + i * 0.2, 1.5 + i * 0.2));
        const fly = easeInOut(seg(t, 2.0 + i * 0.15, 3.0 + i * 0.15));
        const back = easeOut(seg(t, 3.0 + i * 0.15, 3.5 + i * 0.15));
        const gx = 190 + 230 * fly - 230 * back;
        const hit = seg(t, 3.0 + i * 0.15, 3.1 + i * 0.15);
        const ad = easeOutBack(seg(t, 4.2 + i * 0.2, 4.7 + i * 0.2));
        return (
          <g key={l} opacity={k}>
            <T x={25} y={y + 5} s={13} f={C.secondary}>
              {l}
            </T>
            <Glyph kind={i} x={gx} y={y} c={hit > 0 ? C.badText : C.primary} />
            <Cross x={436} y={y} k={hit > 0 ? easeOut(seg(t, 3.0 + i * 0.15, 3.4 + i * 0.15)) : 0} />
            {ad > 0 ? (
              <g opacity={Math.min(1, ad)}>
                <rect x={300} y={y - 13} width={84} height={26} rx={4} fill={C.panel} stroke={C.focus} strokeWidth={1.4} />
                <T x={342} y={y + 5} s={12} f={C.focus} a="middle">
                  custom
                </T>
              </g>
            ) : null}
          </g>
        );
      })}
      <T x={575} y={194} s={13} f={C.badText} a="end" w={600} o={easeOut(seg(t, 5.0, 5.5))}>
        one integration per supplier
      </T>
    </Svg>
  );
}

// 1 · One shared shape: three supplier properties typed into the same three columns, name, value, semantic ID. The name
// and semantic-ID columns are framed; the value column gets a dashed frame. Three questions underneath: shape, meaning,
// value true. After the answer: shape ✓, meaning ✓, and value true stays red, unchecked.
export function PredictShape({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const on = answer !== null;
  const PROPS: [string, string, string][] = [
    ['SerialNumber', '0001', REQ],
    ['Weight', '42.5', MASS],
    ['Mass_kg', '42.5', MASS],
  ];
  const frame = easeOut(seg(t, 2.4, 3.2));
  const vf = easeOut(seg(t, 3.2, 4.0));
  const Q = ['shape', 'meaning', 'value true'];
  return (
    <Svg label="what does a shared shape with semantic ids buy the carmaker's pipeline, and what does it still not guarantee about a value?" h={200}>
      <g opacity={easeOut(seg(t, 0, 0.6))}>
        <T x={40} y={28} s={12} f={C.secondary}>
          name
        </T>
        <T x={215} y={28} s={12} f={C.secondary}>
          value
        </T>
        <T x={300} y={28} s={12} f={C.secondary}>
          semantic ID
        </T>
      </g>
      {PROPS.map(([n, v, id], i) => (
        <g key={i} opacity={easeOut(seg(t, 0.6 + i * 0.5, 1.1 + i * 0.5))}>
          <T x={40} y={60 + i * 30} s={13} f={C.primary}>
            {n}
          </T>
          <T x={215} y={60 + i * 30} s={13} f={C.primary}>
            {v}
          </T>
          <T x={300} y={60 + i * 30} s={12} f={C.primary}>
            {id}
          </T>
        </g>
      ))}
      <g opacity={frame}>
        <rect x={32} y={38} width={165} height={92} rx={4} fill="none" stroke={C.focus} strokeWidth={1.4} />
        <rect x={292} y={38} width={278} height={92} rx={4} fill="none" stroke={C.focus} strokeWidth={1.4} />
      </g>
      <rect x={206} y={38} width={78} height={92} rx={4} fill="none" stroke={on && s > 0.9 ? C.badText : C.secondary} strokeWidth={1.3} strokeDasharray="4 3" opacity={vf} />
      {Q.map((q, i) => {
        const x = [40, 215, 380][i];
        const k = easeOut(seg(t, 4.0 + i * 0.3, 4.5 + i * 0.3));
        const res = on ? easeOut(seg(s, 0.2 + i * 0.35, 0.6 + i * 0.35)) : 0;
        const tw = q.length * 12.5;
        return (
          <g key={q} opacity={k}>
            <T x={x} y={175} s={13} f={i === 2 && res > 0 ? C.badText : C.secondary}>
              {q}
            </T>
            {res > 0 ? (
              i < 2 ? (
                <Tick x={x + tw + 12} y={170} k={res} />
              ) : (
                <T x={x} y={194} s={12} f={C.badText} o={res}>
                  not guaranteed
                </T>
              )
            ) : (
              <T x={x + tw + 6} y={175} s={13} f={C.focus}>
                ?
              </T>
            )}
          </g>
        );
      })}
    </Svg>
  );
}

// 2 · The type shell, PressModelX200, draws once at the top with assetKind Type and MaxForce_kN 2000. Two instance shells
// draw beneath, SN-0001 and SN-0002, each with assetKind Instance lit as the one distinguishing attribute and its own
// serial number. Two derivedFrom arrows grow up to the type; its MaxForce_kN line pulses, held once, in neither instance.
export function RevealTypeInstance({ t }: StepCtx) {
  const ty = easeOut(seg(t, 0, 1.0));
  const kind = easeOut(seg(t, 3.0, 3.6));
  const once = seg(t, 4.8, 5.6);
  const pulse = once > 0 ? 0.5 + 0.5 * Math.sin(once * Math.PI * 3) : 0;
  return (
    <Svg
      label="a machine model's own data is described once, in a type shell, and each serial number gets its own instance shell, distinguished by one attribute, each referencing the type it derives from"
      h={200}
    >
      <g opacity={ty}>
        <rect x={160} y={12} width={280} height={64} rx={5} fill={C.panel} stroke={C.primary} strokeWidth={1.4} />
        <T x={300} y={32} s={13} f={C.primary} a="middle">
          PressModelX200
        </T>
        <T x={300} y={50} s={12} f={C.secondary} a="middle">
          assetKind: Type
        </T>
        <T x={300} y={68} s={12} f={once > 0 ? C.focus : C.secondary} a="middle" o={once > 0 ? 0.6 + 0.4 * pulse : 1}>
          MaxForce_kN = 2000
        </T>
      </g>
      {[0, 1].map((i) => {
        const x = i === 0 ? 25 : 315;
        const k = easeOut(seg(t, 1.4 + i * 0.6, 2.4 + i * 0.6));
        return (
          <g key={i} opacity={k}>
            <rect x={x} y={124} width={260} height={64} rx={5} fill={C.panel} stroke={C.line} strokeWidth={1.2} />
            <T x={x + 130} y={144} s={13} f={C.primary} a="middle">
              {`PressX200-SN-000${i + 1}`}
            </T>
            <T x={x + 130} y={162} s={12} f={kind > 0.5 ? C.focus : C.secondary} a="middle">
              assetKind: Instance
            </T>
            <T x={x + 130} y={180} s={12} f={C.secondary} a="middle">
              {`SerialNumber = 000${i + 1}`}
            </T>
            {kind > 0 ? <rect x={x + 18} y={150} width={224} height={17} rx={3} fill="none" stroke={C.focus} strokeWidth={1.2} opacity={kind} /> : null}
          </g>
        );
      })}
      <Arrow x1={155} y1={122} x2={230} y2={80} k={easeOut(seg(t, 3.8, 4.5))} c={C.focus} />
      <Arrow x1={445} y1={122} x2={370} y2={80} k={easeOut(seg(t, 4.0, 4.7))} c={C.focus} />
      <T x={300} y={108} s={12} f={C.focus} a="middle" o={easeOut(seg(t, 4.3, 4.8))}>
        derivedFrom
      </T>
    </Svg>
  );
}

// 3 · Two supplier cards: Weight = 42.5 and Mass_kg = 42.5, both tagged 0173-1#02-AAA017#002. A query by name, "Weight",
// finds only the first (✓, ✕). The query switches to match by semantic ID: both cards' IDs light, both get ✓, 2 found.
export function RevealSemanticId({ t }: StepCtx) {
  const CARDS: [string, string][] = [
    ['supplier A', 'Weight = 42.5'],
    ['supplier B', 'Mass_kg = 42.5'],
  ];
  const q1 = easeOut(seg(t, 1.8, 2.4));
  const r1 = easeOut(seg(t, 2.5, 3.0));
  const sw = easeOut(seg(t, 3.4, 4.0));
  const r2 = easeOut(seg(t, 4.2, 4.8));
  return (
    <Svg label='one supplier names a property "weight," another names the same property "mass," and both carry the same semantic id, so a query matching by meaning finds both' h={200}>
      {CARDS.map(([who, p], i) => {
        const y = 22 + i * 86;
        return (
          <g key={i} opacity={easeOut(seg(t, i * 0.6, 0.8 + i * 0.6))}>
            <T x={25} y={y} s={12} f={C.secondary}>
              {who}
            </T>
            <rect x={25} y={y + 8} width={270} height={56} rx={5} fill={C.panel} stroke={C.line} strokeWidth={1.2} />
            <T x={40} y={y + 30} s={13} f={sw > 0 ? C.secondary : C.primary}>
              {p}
            </T>
            <T x={40} y={y + 52} s={12} f={sw > 0.5 ? C.focus : C.secondary}>
              {MASS}
            </T>
            {sw > 0 ? <rect x={34} y={y + 39} width={250} height={18} rx={3} fill="none" stroke={C.focus} strokeWidth={1.2} opacity={sw} /> : null}
            {r2 > 0 ? <Tick x={318} y={y + 34} k={r2} /> : i === 0 ? <Tick x={318} y={y + 34} k={r1} /> : <Cross x={320} y={y + 34} k={r1} />}
          </g>
        );
      })}
      <g opacity={q1}>
        <rect x={360} y={70} width={215} height={50} rx={5} fill={C.panel} stroke={sw > 0.5 ? C.focus : C.primary} strokeWidth={1.4} />
        <T x={467} y={90} s={12} f={C.secondary} a="middle">
          query
        </T>
        <T x={467} y={110} s={13} f={sw > 0.5 ? C.focus : C.primary} a="middle">
          {sw > 0.5 ? 'by semantic ID' : 'name = Weight'}
        </T>
      </g>
      <T x={575} y={150} s={13} f={C.secondary} a="end" o={r1 * (1 - sw)}>
        1 found
      </T>
      <T x={575} y={150} s={13} f={C.focus} a="end" o={r2}>
        2 found
      </T>
    </Svg>
  );
}

// 4 · The Nameplate submodel of SN-0001 sits on the left. Top path: a live REST GET dot races across and the reply box
// fills, SerialNumber: 0001. Bottom path: the submodel is packed into an AASX file, which travels slowly, offline, and
// unpacks into the same reply. An = sign joins the two replies; "identical" lights.
export function RevealTransport({ t }: StepCtx) {
  const src = easeOut(seg(t, 0, 0.8));
  const dot = easeInOut(seg(t, 0.9, 1.7));
  const top = easeOut(seg(t, 1.6, 2.1));
  const pack = easeOut(seg(t, 2.3, 2.8));
  const trip = easeInOut(seg(t, 2.8, 4.0));
  const bot = easeOut(seg(t, 4.0, 4.5));
  const eq = easeOut(seg(t, 4.7, 5.3));
  const Reply = ({ y, k }: { y: number; k: number }) =>
    k <= 0 ? null : (
      <g opacity={k}>
        <rect x={352} y={y - 18} width={223} height={34} rx={4} fill={C.panel} stroke={eq > 0.5 ? C.focus : C.line} strokeWidth={1.3} />
        <T x={463} y={y + 4} s={12} f={C.primary} a="middle">
          SerialNumber: 0001
        </T>
      </g>
    );
  return (
    <Svg label="the same submodel, read live over an api or unpacked from an exchanged file, returns identical content either way, so the transport changes but the submodel does not" h={200}>
      <g opacity={src}>
        <rect x={25} y={78} width={120} height={44} rx={5} fill={C.panel} stroke={C.primary} strokeWidth={1.4} />
        <T x={85} y={98} s={13} f={C.primary} a="middle">
          Nameplate
        </T>
        <T x={85} y={115} s={12} f={C.secondary} a="middle">
          SN-0001
        </T>
      </g>
      <g opacity={src}>
        <path d="M145 90 C 200 40, 260 40, 345 40" fill="none" stroke={C.line} strokeWidth={1.2} />
        <path d="M145 110 C 200 160, 260 160, 345 160" fill="none" stroke={C.line} strokeWidth={1.2} strokeDasharray="4 3" />
        <T x={250} y={30} s={12} f={C.secondary} a="middle">
          REST GET
        </T>
        <T x={250} y={186} s={12} f={C.secondary} a="middle">
          AASX file
        </T>
      </g>
      {dot > 0 && dot < 1 ? <circle cx={lerp(150, 345, dot)} cy={dot < 0.3 ? lerp(88, 50, dot / 0.3) : 40 + 10 * Math.max(0, 0.6 - dot)} r={5} fill={C.focus} /> : null}
      {pack > 0 && bot < 1 ? (
        <g opacity={pack * (1 - bot)} transform={`translate(${lerp(155, 300, trip)} ${trip < 0.3 ? lerp(118, 148, trip / 0.3) : 148})`}>
          <path d="M0 -12 h16 l6 6 v18 h-22 z" fill={C.panel} stroke={C.second} strokeWidth={1.3} />
          <line x1={4} y1={0} x2={18} y2={0} stroke={C.second} strokeWidth={1} />
          <line x1={4} y1={5} x2={18} y2={5} stroke={C.second} strokeWidth={1} />
        </g>
      ) : null}
      <Reply y={42} k={top} />
      <Reply y={158} k={bot} />
      <g opacity={eq}>
        <T x={400} y={106} s={20} f={C.focus} a="middle">
          =
        </T>
        <T x={575} y={106} s={13} f={C.focus} a="end">
          identical
        </T>
      </g>
    </Svg>
  );
}

/** The validation gate, a vertical bar, with the template's required ID above it and the lakehouse to its right. */
const Gate = ({ o, lit, stored }: { o: number; lit?: string; stored: number }) =>
  o <= 0 ? null : (
    <g opacity={o}>
      <T x={25} y={22} s={12} f={C.secondary}>
        {`required: ${REQ}`}
      </T>
      <rect x={326} y={40} width={8} height={120} rx={2} fill={lit ?? C.secondary} />
      <T x={330} y={178} s={12} f={C.secondary} a="middle">
        gate
      </T>
      <rect x={455} y={70} width={120} height={60} rx={5} fill={C.panel} stroke={stored > 0 ? C.focus : C.line} strokeWidth={1.2} strokeDasharray={stored > 0 ? undefined : '4 3'} />
      <T x={515} y={96} s={13} f={C.primary} a="middle">
        lakehouse
      </T>
      <T x={515} y={116} s={12} f={stored > 0 ? C.focus : C.secondary} a="middle">
        {stored > 0 ? '1 stored' : 'empty'}
      </T>
    </g>
  );

// 5 · The gate, its required ID, an empty lakehouse. A submodel whose property SomeValue = 99 has no semantic ID slides
// in, hits the gate, ✕, bounces back. A second, SomeOther = x tagged ZZZ999, slides in: ✕, missing required AAM556#002.
// The lakehouse stays empty.
export function RevealValidationCatches({ t }: StepCtx) {
  const CARDS: [string, string][] = [
    ['SomeValue = 99', 'semantic ID: none'],
    ['SomeOther = x', '0173-1#02-ZZZ999#001'],
  ];
  return (
    <Svg
      label="a property with no semantic id at all cannot be matched to anything, a submodel missing a property the template requires fails the same gate, and neither reaches the lakehouse"
      h={200}
    >
      <Gate o={easeOut(seg(t, 0, 0.8))} stored={0} lit={seg(t, 5.0, 5.2) > 0 ? C.badText : undefined} />
      {CARDS.map(([p, id], i) => {
        const t0 = 0.9 + i * 2.0;
        const k = easeOut(seg(t, t0, t0 + 0.5));
        const go = easeIn(seg(t, t0 + 0.5, t0 + 1.2));
        const back = easeOut(seg(t, t0 + 1.2, t0 + 1.7));
        const dx = 50 * go - 40 * back;
        const hit = seg(t, t0 + 1.2, t0 + 1.25) > 0;
        const y = 46 + i * 64;
        return (
          <g key={i} opacity={k}>
            <g transform={`translate(${dx} 0)`}>
              <rect x={25} y={y} width={250} height={48} rx={5} fill={C.panel} stroke={hit ? C.badText : C.line} strokeWidth={1.3} />
              <T x={38} y={y + 20} s={13} f={C.primary}>
                {p}
              </T>
              <T x={38} y={y + 39} s={12} f={i === 0 ? C.badText : C.secondary}>
                {id}
              </T>
            </g>
            <Cross x={350} y={y + 24} k={hit ? easeOut(seg(t, t0 + 1.2, t0 + 1.5)) : 0} />
          </g>
        );
      })}
      <T x={25} y={194} s={12} f={C.badText} o={easeOut(seg(t, 4.6, 5.0))}>
        {`missing ${REQ}`}
      </T>
    </Svg>
  );
}

/** Quadratic ease-in. */
const easeIn = (x: number) => x * x;

// 6 · The same gate. A complete, correctly tagged Nameplate arrives: SerialNumber = not-really-0001 under the required
// AAM556#002. It slides to the gate, the gate lights, ✓, and a chip flies through into the lakehouse: 1 stored. Then the
// value itself turns red, dashed: wrong. The checklist under it reads semantic IDs ✓, required ✓, value unchecked.
export function RevealValidationBlind({ t }: StepCtx) {
  const k = easeOut(seg(t, 0.8, 1.3));
  const go = easeIn(seg(t, 1.3, 2.0));
  const pass = seg(t, 2.0, 2.1) > 0;
  const chip = easeInOut(seg(t, 2.2, 3.2));
  const stored = seg(t, 3.2, 3.3);
  const wrong = easeOut(seg(t, 3.6, 4.2));
  const CHECK = ['semantic IDs', 'required'];
  return (
    <Svg
      label="a submodel with a wrong serial number, but a complete, correctly tagged structure, still passes the identical gate, because the structure was never the claim that needed checking"
      h={200}
    >
      <Gate o={easeOut(seg(t, 0, 0.8))} stored={stored} lit={pass ? C.focus : undefined} />
      <g opacity={k} transform={`translate(${40 * go} 0)`}>
        <rect x={25} y={50} width={250} height={74} rx={5} fill={C.panel} stroke={pass ? C.focus : C.line} strokeWidth={1.3} />
        <T x={38} y={70} s={13} f={C.primary}>
          SerialNumber =
        </T>
        <T x={38} y={92} s={13} f={wrong > 0.5 ? C.badText : C.primary}>
          not-really-0001
        </T>
        {wrong > 0 ? <line x1={38} y1={97} x2={38 + 196 * wrong} y2={97} stroke={C.badText} strokeWidth={1.4} strokeDasharray="4 3" /> : null}
        <T x={38} y={114} s={12} f={C.secondary}>
          {REQ}
        </T>
      </g>
      <Tick x={350} y={58} k={pass ? easeOut(seg(t, 2.0, 2.3)) : 0} />
      {chip > 0 && chip < 1 ? <rect x={lerp(320, 490, chip)} y={92} width={22} height={14} rx={2} fill={C.focus} /> : null}
      {CHECK.map((c, i) => {
        const x = i === 0 ? 25 : 215;
        const o = easeOut(seg(t, 4.3 + i * 0.3, 4.7 + i * 0.3));
        return (
          <g key={c} opacity={o}>
            <T x={x} y={194} s={13} f={C.secondary}>
              {c}
            </T>
            <Tick x={x + c.length * 12.5 + 12} y={189} k={o} />
          </g>
        );
      })}
      <T x={575} y={194} s={13} f={C.badText} a="end" w={600} o={easeOut(seg(t, 4.9, 5.4))}>
        value unchecked
      </T>
    </Svg>
  );
}

// 7 · Four panels draw in turn. A type box with two instance boxes pointing up at it. Weight and Mass_kg converging on
// one AAA017#002. REST and AASX converging on one 0001 through an = sign. A gate: structure ✓, truth silent.
export function Recap({ t }: StepCtx) {
  const P: Pt[] = [
    [25, 14],
    [310, 14],
    [25, 138],
    [310, 138],
  ];
  const k = (i: number) => easeOut(seg(t, i * 1.3, i * 1.3 + 0.8));
  const Chip = ({ x, y, w, l, c = C.primary }: { x: number; y: number; w: number; l: string; c?: string }) => (
    <g>
      <rect x={x} y={y - 13} width={w} height={24} rx={3} fill={C.panel} stroke={c === C.primary ? C.line : c} strokeWidth={1.2} />
      <T x={x + w / 2} y={y + 4} s={12} f={c} a="middle">
        {l}
      </T>
    </g>
  );
  return (
    <Svg
      label="one type shell, instances that reference it, a semantic id that outlasts a supplier's own naming, a rest read and a packaged file that agree, and a validation gate strict on structure, silent on truth"
      h={260}
    >
      {P.map(([x, y], i) => (
        <rect key={i} x={x} y={y} width={265} height={108} rx={6} fill="none" stroke={C.line} strokeWidth={1} opacity={k(i)} />
      ))}
      <g opacity={k(0)}>
        <Chip x={97} y={38} w={120} l="type" c={C.focus} />
        <Chip x={37} y={100} w={110} l="instance" />
        <Chip x={167} y={100} w={110} l="instance" />
        <Arrow x1={92} y1={86} x2={130} y2={52} k={easeOut(seg(t, 0.5, 1.1))} c={C.focus} />
        <Arrow x1={222} y1={86} x2={184} y2={52} k={easeOut(seg(t, 0.6, 1.2))} c={C.focus} />
      </g>
      <g opacity={k(1)}>
        <Chip x={322} y={44} w={92} l="Weight" />
        <Chip x={322} y={94} w={92} l="Mass_kg" />
        <Arrow x1={416} y1={44} x2={444} y2={66} k={easeOut(seg(t, 1.8, 2.4))} c={C.focus} />
        <Arrow x1={416} y1={94} x2={444} y2={72} k={easeOut(seg(t, 1.9, 2.5))} c={C.focus} />
        <Chip x={448} y={69} w={122} l="AAA017#002" c={C.focus} />
      </g>
      <g opacity={k(2)}>
        <Chip x={37} y={168} w={80} l="REST" />
        <Chip x={37} y={218} w={80} l="AASX" />
        <Arrow x1={119} y1={168} x2={170} y2={190} k={easeOut(seg(t, 3.1, 3.7))} c={C.focus} />
        <Arrow x1={119} y1={218} x2={170} y2={196} k={easeOut(seg(t, 3.2, 3.8))} c={C.focus} />
        <T x={190} y={199} s={18} f={C.focus} a="middle" o={easeOut(seg(t, 3.6, 4.0))}>
          =
        </T>
        <Chip x={208} y={193} w={66} l="0001" c={C.focus} />
      </g>
      <g opacity={k(3)}>
        <rect x={340} y={152} width={7} height={80} rx={2} fill={C.focus} />
        <T x={365} y={180} s={13} f={C.secondary}>
          structure
        </T>
        <Tick x={490} y={175} k={easeOut(seg(t, 4.5, 4.9))} />
        <T x={365} y={218} s={13} f={C.secondary}>
          truth
        </T>
        <T x={560} y={218} s={13} f={C.badText} a="end" o={easeOut(seg(t, 4.8, 5.3))}>
          silent
        </T>
      </g>
    </Svg>
  );
}

type Pt = readonly [number, number];

// 8 · A CarbonFootprint submodel: every property tagged ✓, complete ✓, and its figure an unknown box. It slides to the
// gate, the gate lights, passes ✓. Question: is the figure correct? After the answer, the figure's box turns red, dashed:
// never checked, and the line reads "figure unverified".
export function ProveIt({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const on = answer !== null;
  const k = easeOut(seg(t, 0, 0.7));
  const go = easeIn(seg(t, 1.8, 2.5));
  const pass = seg(t, 2.5, 2.6) > 0;
  const red = on ? easeOut(seg(s, 0.3, 0.9)) : 0;
  const ROWS = ['all tagged', 'complete'];
  return (
    <Svg
      label="a supplier's carbon-footprint submodel is complete, correctly tagged, and passes validation cleanly — does that mean the carbon-footprint figure inside it is actually correct?"
      h={200}
    >
      <g opacity={k} transform={`translate(${30 * go} 0)`}>
        <rect x={25} y={22} width={270} height={150} rx={5} fill={C.panel} stroke={pass ? C.focus : C.line} strokeWidth={1.3} />
        <T x={40} y={46} s={13} f={C.primary}>
          CarbonFootprint
        </T>
        {ROWS.map((r, i) => (
          <g key={r} opacity={easeOut(seg(t, 0.6 + i * 0.4, 1.0 + i * 0.4))}>
            <T x={40} y={78 + i * 28} s={12} f={C.secondary}>
              {r}
            </T>
            <Tick x={270} y={73 + i * 28} k={easeOut(seg(t, 0.8 + i * 0.4, 1.2 + i * 0.4))} />
          </g>
        ))}
        <g opacity={easeOut(seg(t, 1.4, 1.8))}>
          <T x={40} y={150} s={12} f={red > 0.5 ? C.badText : C.secondary}>
            figure
          </T>
          <rect x={150} y={134} width={120} height={24} rx={3} fill="none" stroke={red > 0 ? C.badText : C.secondary} strokeWidth={1.3} strokeDasharray="4 3" />
          <T x={210} y={151} s={13} f={red > 0.5 ? C.badText : C.focus} a="middle">
            ?
          </T>
        </g>
      </g>
      <rect x={346} y={30} width={8} height={140} rx={2} fill={pass ? C.focus : C.secondary} opacity={k} />
      <g opacity={pass ? easeOut(seg(t, 2.5, 2.9)) : 0}>
        <T x={380} y={70} s={13} f={C.focus}>
          passes
        </T>
        <Tick x={470} y={65} k={1} />
      </g>
      {!on ? (
        <T x={575} y={140} s={13} f={C.focus} a="end" o={easeOut(seg(t, 3.2, 3.7))}>
          correct?
        </T>
      ) : (
        <T x={575} y={140} s={13} f={C.badText} a="end" w={600} o={red}>
          figure unverified
        </T>
      )}
    </Svg>
  );
}
