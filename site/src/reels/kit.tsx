import type { ReactNode } from 'react';
import { clamp, easeInOut, easeOut, easeOutExpo, seg } from './anim';

/**
 * The drawing kit every topic's scenes are built from (DESIGN.md): the theme colours, the 600-unit SVG canvas,
 * text that scales up on phones, the layout stack, and the motion primitives (Draw, Plot, Reticle, Decode, Surface).
 * Using these instead of copies keeps every reel in one visual grammar, and a fix here reaches every topic at once.
 */
export const C = {
  // The briefing theme: black and white carry everything, colour is rare and always means something.
  // The old coffee names stay so every existing scene follows the theme; each keeps its role.
  void: '#050505',
  espresso: '#0b0b0b', // background
  roast: '#141414', // panels
  cocoa: '#1c1c1c', // bands, bar tracks
  mocha: '#3d3d3d', // axes, rules
  taupe: '#808080', // quiet captions, axis labels
  latte: '#a3a3a3', // secondary labels
  crema: '#c8c8c8', // primary labels and values
  caramel: '#ffffff', // the thing to look at
  cinnamon: '#8fb4e8', // second accent (rare)
  cherry: '#84241f', // bad outcome, fills (rare); dark enough that cherryText and crema read on it
  /** Cherry is too dark for text on the reel background; use this for red labels. */
  cherryText: '#ff6b5e',

  // Role names for new topics (DESIGN.md → Colour): the same values, named for what they mean.
  ink: '#0b0b0b',
  panel: '#141414',
  band: '#1c1c1c',
  line: '#3d3d3d',
  quiet: '#808080',
  secondary: '#a3a3a3',
  primary: '#c8c8c8',
  focus: '#ffffff',
  second: '#8fb4e8',
  bad: '#84241f',
  badText: '#ff6b5e',
} as const;
export const MONO = '"JetBrains Mono", ui-monospace, monospace';
export const SERIF = '"Source Serif 4", Georgia, serif';

/** Vertical layout for a step's visual: panels and drawings stacked and centred. */
export const Stack = ({ children }: { children: ReactNode }) => <div className="flex h-full w-full flex-col justify-center gap-3 landscape:gap-5">{children}</div>;

/**
 * A drawing on the 600-unit-wide canvas. `fill` makes it take the space left in a Stack (under a code panel);
 * otherwise it fills the whole visual. Keep text at 13 units or more (DESIGN.md).
 */
export const Svg = ({ label, h = 360, fill = false, children }: { label: string; h?: number; fill?: boolean; children: ReactNode }) => (
  <svg viewBox={`0 0 600 ${h}`} className={fill ? 'min-h-0 w-full flex-1' : 'h-full w-full'} role="img" aria-label={label}>
    {children}
  </svg>
);

type TextProps = { x: number; y: number; s?: number; f?: string; a?: 'start' | 'middle' | 'end'; w?: number; o?: number; serif?: boolean; italic?: boolean; children: ReactNode };

/** Text in a drawing: monospace labels by default, Source Serif with `serif`; scaled up on phones by --svg-text-scale. */
export const T = ({ x, y, s = 15, f = C.latte, a = 'start', w = 500, o = 1, serif = false, italic = false, children }: TextProps) => (
  <text
    x={x}
    y={y}
    fontSize={s}
    style={{ fontSize: `calc(${s}px * var(--svg-text-scale, 1))` }}
    fill={f}
    textAnchor={a}
    fontWeight={w}
    opacity={o}
    fontFamily={serif ? SERIF : MONO}
    fontStyle={italic ? 'italic' : undefined}
    letterSpacing={serif ? 0 : '0.03em'}
  >
    {children}
  </text>
);

/** A formula, set in the serif italic like typeset maths: `<Eq x y>T(n) = O(f(n))</Eq>`. Use Unicode for ², ₀, Θ. */
export const Eq = (p: Omit<TextProps, 'serif' | 'italic'>) => <T s={20} f={C.crema} w={400} {...p} serif italic />;

/** A horizontal bar on a track: `w` of `full` units filled. */
export const Bar = ({ x, y, w, h, full, fill, o = 1 }: { x: number; y: number; w: number; h: number; full: number; fill: string; o?: number }) => (
  <g opacity={o}>
    <rect x={x} y={y} width={full} height={h} rx={3} fill={C.cocoa} />
    <rect x={x} y={y} width={Math.max(3, w)} height={h} rx={3} fill={fill} />
  </g>
);

type Pt = readonly [number, number];

/**
 * A line that draws itself between `from` and `to` seconds, with a pen point at its tip while it moves.
 * `pts` is the polyline in canvas units (sample a curve densely for a smooth one). A pure function of t.
 */
export function Draw({ pts, t, from, to, stroke = C.focus, w = 2.5, pen = true, dash, o = 1 }: { pts: Pt[]; t: number; from: number; to: number; stroke?: string; w?: number; pen?: boolean; dash?: string; o?: number }) {
  const k = easeInOut(seg(t, from, to));
  if (k <= 0 || pts.length < 2) return null;
  const lens = [0];
  for (let i = 1; i < pts.length; i++) lens.push(lens[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
  const goal = k * lens[lens.length - 1];
  let d = `M${pts[0][0]} ${pts[0][1]}`;
  let tip: Pt = pts[0];
  for (let i = 1; i < pts.length; i++) {
    if (lens[i] <= goal) {
      d += `L${pts[i][0]} ${pts[i][1]}`;
      tip = pts[i];
    } else {
      const f = (goal - lens[i - 1]) / Math.max(1e-9, lens[i] - lens[i - 1]);
      tip = [pts[i - 1][0] + (pts[i][0] - pts[i - 1][0]) * f, pts[i - 1][1] + (pts[i][1] - pts[i - 1][1]) * f];
      d += `L${tip[0].toFixed(1)} ${tip[1].toFixed(1)}`;
      break;
    }
  }
  return (
    <g opacity={o}>
      <path d={d} fill="none" stroke={stroke} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={dash} />
      {pen && k < 1 && <circle cx={tip[0]} cy={tip[1]} r={w + 1.5} fill={stroke} />}
    </g>
  );
}

/** Points that land one per beat (default 0.4 s) from `start`, each optionally with a label above and a stem to `base`. */
export function Plot({ pts, t, start, beat = 0.4, r = 4, fill = C.focus, base, labels }: { pts: Pt[]; t: number; start: number; beat?: number; r?: number; fill?: string; base?: number; labels?: string[] }) {
  return (
    <g>
      {pts.map(([x, y], i) => {
        const k = easeOut(seg(t, start + i * beat, start + i * beat + 0.3));
        if (k <= 0) return null;
        return (
          <g key={i} opacity={k} transform={`translate(0 ${((1 - k) * 8).toFixed(2)})`}>
            {base !== undefined && <line x1={x} y1={base} x2={x} y2={y} stroke={C.mocha} />}
            <circle cx={x} cy={y} r={r} fill={fill} />
            {labels?.[i] && (
              <T x={x} y={y - r - 8} s={13} a="middle" f={C.crema}>
                {labels[i]}
              </T>
            )}
          </g>
        );
      })}
    </g>
  );
}

/**
 * Lock-on: four brackets close on the one thing a step is about, at `at` seconds (0.55 s, ease-brief).
 * (x, y) is the centre, w × h the box. At most one per step, at its final beat (DESIGN.md → Motion).
 */
export function Reticle({ x, y, w, h, t, at, color = C.focus, arm = 8 }: { x: number; y: number; w: number; h: number; t: number; at: number; color?: string; arm?: number }) {
  const k = easeOutExpo(seg(t, at, at + 0.55));
  if (k <= 0) return null;
  const s = 1 + (1 - k) * 1.4;
  const hw = w / 2, hh = h / 2;
  return (
    <g transform={`translate(${x} ${y}) scale(${s.toFixed(3)})`} opacity={k} fill="none" stroke={color} strokeWidth={1.5}>
      {[[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([sx, sy]) => (
        <path key={`${sx}${sy}`} d={`M${sx * hw} ${sy * hh - sy * arm}V${sy * hh}H${sx * hw - sx * arm}`} />
      ))}
    </g>
  );
}

const GLYPHS = 'ABCDEFGHJKLMNPQRSTUVWXYZ0123456789/';
const hash = (n: number) => {
  n = (n ^ 61) ^ (n >>> 16);
  n = n + (n << 3);
  n = n ^ (n >>> 4);
  n = Math.imul(n, 0x27d4eb2d);
  return (n ^ (n >>> 15)) >>> 0;
};
/** The text of a label `p` of the way through decoding: resolved left to right, a few scrambled glyphs at the edge. */
export const decodeText = (text: string, p: number) => {
  if (p >= 1) return text;
  const done = Math.floor(easeOut(p) * text.length);
  const tick = Math.floor(p * 26);
  let s = '';
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (ch === ' ' || i < done) s += ch;
    else if (i < done + 4 && p > 0) s += GLYPHS[hash(i * 31 + tick) % GLYPHS.length];
    else s += ' ';
  }
  return s;
};

/** A mono label that decodes from `at` over `dur` seconds. Only for short labels (24 characters or fewer). */
export const Decode = ({ text, t, at, dur = 0.6, ...p }: Omit<TextProps, 'children' | 'serif'> & { text: string; t: number; at: number; dur?: number }) => (
  <T {...p}>{decodeText(text, clamp((t - at) / dur))}</T>
);

/**
 * A wireframe surface z = f(x, y) over the unit disc, projected and turning: rings and spokes, nearer lines brighter.
 * Centre (cx, cy), radius r in canvas units; `spin` radians per second, `tilt` the camera's elevation.
 */
export function Surface({ f, t, cx, cy, r, rings = 10, spokes = 32, spin = 0.12, tilt = 0.5, z = 1, stroke = C.crema, grow }: { f: (x: number, y: number) => number; t: number; cx: number; cy: number; r: number; rings?: number; spokes?: number; spin?: number; tilt?: number; z?: number; stroke?: string; grow?: [number, number] }) {
  const a = 0.6 + t * spin;
  const ca = Math.cos(a), sa = Math.sin(a), ce = Math.cos(tilt), se = Math.sin(tilt);
  const extent = grow ? easeOutExpo(seg(t, grow[0], grow[1])) : 1;
  const P = (x: number, y: number) => {
    const zz = f(x, y) * z;
    const X = x * ca - y * sa, Y = x * sa + y * ca;
    const up = zz * ce + Y * se, d = Y * ce - zz * se;
    const k = 3.4 / (3.4 + d);
    return [cx + X * k * r, cy - up * k * r, d] as const;
  };
  const near: string[] = [], mid: string[] = [], far: string[] = [];
  const add = (p: readonly [number, number, number], q: readonly [number, number, number]) => {
    const d = (p[2] + q[2]) / 2;
    (d < -0.3 ? near : d < 0.3 ? mid : far).push(`M${p[0].toFixed(1)} ${p[1].toFixed(1)}L${q[0].toFixed(1)} ${q[1].toFixed(1)}`);
  };
  for (let i = 1; i <= rings; i++) {
    const rr = (i / rings) * extent;
    let prev = P(rr, 0);
    for (let j = 1; j <= 64; j++) {
      const th = (j / 64) * Math.PI * 2;
      const q = P(rr * Math.cos(th), rr * Math.sin(th));
      add(prev, q);
      prev = q;
    }
  }
  for (let j = 0; j < spokes; j++) {
    const th = (j / spokes) * Math.PI * 2;
    let prev = P(0, 0);
    for (let i = 1; i <= 12; i++) {
      const rr = (i / 12) * extent;
      const q = P(rr * Math.cos(th), rr * Math.sin(th));
      add(prev, q);
      prev = q;
    }
  }
  return (
    <g fill="none" stroke={stroke} strokeWidth={0.8}>
      <path d={far.join('')} opacity={0.18} />
      <path d={mid.join('')} opacity={0.36} />
      <path d={near.join('')} opacity={0.6} />
    </g>
  );
}
