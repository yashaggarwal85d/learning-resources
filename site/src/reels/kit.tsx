import type { ReactNode } from 'react';

/**
 * The drawing kit every topic's scenes are built from (DESIGN.md): the theme colours, the 600-unit SVG canvas,
 * text that scales up on phones, and the layout stack. Using these instead of copies keeps every reel in one
 * visual grammar, and a fix here reaches every topic at once.
 */
export const C = {
  void: '#0d0806',
  espresso: '#17100c',
  roast: '#2a1d16',
  cocoa: '#3b2a21',
  mocha: '#5a4032',
  taupe: '#8b7766',
  latte: '#c8ac8c',
  crema: '#e9d9bf',
  caramel: '#d49a57',
  cinnamon: '#b8612f',
  cherry: '#8e2f2a',
  /** Cherry is too dark for text on the reel background; use this for red labels. */
  cherryText: '#e07a6e',
} as const;
export const MONO = '"JetBrains Mono", ui-monospace, monospace';
export const SERIF = 'Fraunces, Georgia, serif';

/** Vertical layout for a step's visual: panels and drawings stacked and centred. */
export const Stack = ({ children }: { children: ReactNode }) => <div className="flex h-full w-full flex-col justify-center gap-3 landscape:gap-5">{children}</div>;

/**
 * A drawing on the 600-unit-wide canvas. `fill` makes it take the space left in a Stack (under a code panel);
 * `auto` gives it the height its width implies (so a line of text above it stays next to it in a Stack); otherwise it fills the whole visual. Keep text at 13 units or more (DESIGN.md).
 */
export const Svg = ({ label, h = 360, fill = false, auto = false, children }: { label: string; h?: number; fill?: boolean; auto?: boolean; children: ReactNode }) => (
  <svg viewBox={`0 0 600 ${h}`} className={fill ? 'min-h-0 w-full flex-1' : auto ? 'h-auto min-h-0 w-full' : 'h-full w-full'} role="img" aria-label={label}>
    {children}
  </svg>
);

/** Text in a drawing: monospace labels by default, Fraunces with `serif`; scaled up on phones by --svg-text-scale. */
export const T = ({ x, y, s = 15, f = C.latte, a = 'start', w = 500, o = 1, serif = false, children }: { x: number; y: number; s?: number; f?: string; a?: 'start' | 'middle' | 'end'; w?: number; o?: number; serif?: boolean; children: ReactNode }) => (
  <text x={x} y={y} fontSize={s} style={{ fontSize: `calc(${s}px * var(--svg-text-scale, 1))` }} fill={f} textAnchor={a} fontWeight={w} opacity={o} fontFamily={serif ? SERIF : MONO} letterSpacing={serif ? 0 : '0.03em'}>
    {children}
  </text>
);

/** A horizontal bar on a track: `w` of `full` units filled. */
export const Bar = ({ x, y, w, h, full, fill, o = 1 }: { x: number; y: number; w: number; h: number; full: number; fill: string; o?: number }) => (
  <g opacity={o}>
    <rect x={x} y={y} width={full} height={h} rx={7} fill={C.cocoa} />
    <rect x={x} y={y} width={Math.max(3, w)} height={h} rx={7} fill={fill} />
  </g>
);
