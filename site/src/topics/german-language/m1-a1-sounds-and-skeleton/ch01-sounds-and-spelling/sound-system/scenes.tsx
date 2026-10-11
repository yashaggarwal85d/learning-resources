import type { ReactNode } from 'react';
import type { StepCtx } from '../../../../../reels/types';
import { easeOut, easeOutBack, lerp, seg } from '../../../../../reels/anim';
import { C, Svg, T } from '../../../../../reels/kit';

// The German reel's drawing grammar (OUTLINE.md "The reel's visual idea"): letter tiles above sound tiles,
// a mouth schematic where the mechanism lives, a vowel grid, length bars and voice tracks. Everything is a pure
// function of t. Colours carry one meaning throughout: caramel = the target sound in focus, cinnamon = its
// contrasting partner, cherry = the English-habit error, taupe = axes and notes.
//
// German words and IPA are set in Inter (`Tx`): the self-hosted JetBrains Mono has no IPA glyphs. The combining
// marks U+032F (ɐ̯) and U+0329 (n̩) are in no self-hosted font, so the drawings write the weak e instead of the
// syllabic mark and leave the arch off ɐ (examples.py `display`); the Deep dive gives the exact marks.
const SANS = 'Inter, ui-sans-serif, system-ui, sans-serif';

type TxProps = { x: number; y: number; s?: number; f?: string; a?: 'start' | 'middle' | 'end'; w?: number; o?: number; children: ReactNode };
const Tx = ({ x, y, s = 20, f = C.crema, a = 'start', w = 500, o = 1, children }: TxProps) => (
  <text x={x} y={y} fontSize={s} style={{ fontSize: `calc(${s}px * var(--svg-text-scale, 1))` }} fill={f} textAnchor={a} fontWeight={w} opacity={o} fontFamily={SANS}>
    {children}
  </text>
);

/** A run of text with some pieces in another colour: ['K', ['ü', C.cherryText], 'che']. */
type Part = string | [string, string];
const Parts = ({ parts, base = C.crema }: { parts: Part[]; base?: string }) => (
  <>
    {parts.map((p, i) => (typeof p === 'string' ? <tspan key={i} fill={base}>{p}</tspan> : <tspan key={i} fill={p[1]} fontWeight={700}>{p[0]}</tspan>))}
  </>
);

const fade = (t: number, a: number, b: number) => easeOut(seg(t, a, b));
const Line = ({ x1, y1, x2, y2, f = C.taupe, w = 1.5, o = 1, dash }: { x1: number; y1: number; x2: number; y2: number; f?: string; w?: number; o?: number; dash?: string }) => (
  <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={f} strokeWidth={w} opacity={o} strokeDasharray={dash} strokeLinecap="round" />
);
const Tick = ({ x, y, f = C.caramel, o = 1 }: { x: number; y: number; f?: string; o?: number }) => (
  <polyline points={`${x - 8},${y} ${x - 2},${y + 7} ${x + 9},${y - 9}`} fill="none" stroke={f} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" opacity={o} />
);

// ── Letter tiles above sound tiles ────────────────────────────────────────
type Snd = { s: string; from: number[]; f?: string; o?: number; stroke?: string; dashed?: boolean };
function Strip({ x0, y, letters, sounds, pitch = 44, sy = 64, lcol, lo = 1, linkO = 1 }: { x0: number; y: number; letters: string[]; sounds: Snd[]; pitch?: number; sy?: number; lcol?: (i: number) => string | undefined; lo?: number; linkO?: number }) {
  const lx = (i: number) => x0 + pitch * (i + 0.5);
  return (
    <g>
      {letters.map((c, i) => (
        <Tx key={i} x={lx(i)} y={y} s={24} a="middle" f={lcol?.(i) ?? C.crema} o={lo}>{c}</Tx>
      ))}
      {sounds.map((sd, k) => {
        const cx = sd.from.reduce((n, i) => n + lx(i), 0) / sd.from.length;
        const f = sd.f ?? C.latte;
        const o = sd.o ?? 1;
        const wide = Math.max(30, sd.from.length * pitch - 4);
        return (
          <g key={k} opacity={o}>
            {sd.from.map((i) => (
              <Line key={i} x1={lx(i)} y1={y + 10} x2={cx} y2={y + sy - 27} f={sd.f ?? C.taupe} o={linkO * (sd.f ? 0.8 : 0.7)} />
            ))}
            <rect x={cx - wide / 2} y={y + sy - 25} width={wide} height={37} rx={9} fill={C.roast} stroke={sd.stroke ?? (sd.f ?? C.mocha)} strokeWidth={sd.stroke || sd.f ? 2 : 1.5} strokeDasharray={sd.dashed ? '5 4' : undefined} />
            <Tx x={cx} y={y + sy + 1} s={21} a="middle" f={f}>{sd.s}</Tx>
          </g>
        );
      })}
    </g>
  );
}

const LenBar = ({ x, y, long, f, grow = 1 }: { x: number; y: number; long: boolean; f: string; grow?: number }) => (
  <g>
    <rect x={x} y={y} width={long ? 160 : 60} height={9} rx={4.5} fill={C.cocoa} />
    <rect x={x} y={y} width={Math.max(3, (long ? 160 : 60) * grow)} height={9} rx={4.5} fill={f} />
  </g>
);
const VoiceTrack = ({ cx, y, voiced, f, o = 1 }: { cx: number; y: number; voiced: boolean; f: string; o?: number }) => (
  <rect x={cx - 15} y={y} width={30} height={9} rx={4.5} fill={voiced ? f : 'none'} stroke={f} strokeWidth={2} opacity={o} />
);
const Catch = ({ x, y, k = 1 }: { x: number; y: number; k?: number }) => (
  <g opacity={Math.min(1, k * 1.5)} transform={`translate(0 ${(1 - k) * -18})`}>
    <rect x={x - 2} y={y - 16} width={4} height={34} rx={2} fill={C.caramel} />
    <Tx x={x} y={y - 24} s={15} a="middle" f={C.caramel}>ʔ</Tx>
  </g>
);

// ── The mouth, side view (face to the left) ────────────────────────────────
type Pose = [number, number][]; // tongue top, from the tip back to the root
const POSES: Record<string, Pose> = {
  rest: [[50, 134], [86, 128], [125, 124], [165, 130], [200, 152]],
  i: [[50, 118], [80, 92], [115, 72], [160, 98], [200, 140]],
  palatal: [[50, 116], [82, 84], [115, 64], [160, 96], [200, 140]],
  e: [[52, 122], [82, 102], [118, 92], [160, 115], [200, 148]],
  a: [[55, 142], [90, 148], [130, 150], [170, 150], [200, 160]],
  o: [[55, 135], [90, 130], [130, 116], [168, 92], [200, 130]],
  u: [[55, 135], [90, 128], [130, 108], [170, 80], [200, 120]],
  velar: [[55, 135], [90, 128], [130, 106], [172, 70], [200, 118]],
  uvular: [[55, 140], [90, 138], [130, 130], [192, 100], [205, 128]],
};
const mixPose = (a: Pose, b: Pose, k: number): Pose => a.map(([x, y], i) => [lerp(x, b[i][0], k), lerp(y, b[i][1], k)]);
const smooth = (p: Pose) => {
  let d = `M${p[0][0]} ${p[0][1]}`;
  for (let i = 1; i < p.length - 1; i++) d += ` Q${p[i][0]} ${p[i][1]} ${(p[i][0] + p[i + 1][0]) / 2} ${(p[i][1] + p[i + 1][1]) / 2}`;
  return d + ` L${p[p.length - 1][0]} ${p[p.length - 1][1]}`;
};
const MARKS: Record<string, [number, number]> = { lips: [14, 110], hardPalate: [100, 45], softPalate: [172, 58], uvula: [207, 108], glottis: [214, 172] };

/** Where a mouth-local point lands on the canvas. */
const mp = (ox: number, oy: number, sc: number, x: number, y: number): [number, number] => [ox + x * sc, oy + y * sc];

function Mouth({ ox, oy, sc = 1, pose, lips = 'spread', mark, t = 0, dashed = false, folds }: { ox: number; oy: number; sc?: number; pose: Pose; lips?: 'spread' | 'round'; mark?: string; t?: number; dashed?: boolean; folds?: number }) {
  const round = lips === 'round';
  const m = mark ? MARKS[mark] : null;
  const pulse = 0.5 + 0.5 * Math.sin(t * 7);
  const g = folds === undefined ? 0 : lerp(9, 0.5, folds);
  return (
    <g transform={`translate(${ox} ${oy}) scale(${sc})`}>
      <path d="M30 84 C60 44 120 34 165 54 C186 63 198 72 204 82" fill="none" stroke={C.taupe} strokeWidth={2.5} strokeLinecap="round" />
      <path d="M204 82 C208 90 208 100 206 112" fill="none" stroke={C.taupe} strokeWidth={4} strokeLinecap="round" />
      <path d="M30 134 L62 162 L130 190" fill="none" stroke={C.taupe} strokeWidth={2.5} strokeLinecap="round" />
      <path d="M216 70 L224 196" fill="none" stroke={C.mocha} strokeWidth={2} />
      <path d={`${smooth(pose)} L205 174 L62 164 Z`} fill={dashed ? 'none' : C.cocoa} stroke={dashed ? C.taupe : C.caramel} strokeWidth={dashed ? 2 : 2.5} strokeDasharray={dashed ? '6 5' : undefined} strokeLinejoin="round" />
      <ellipse cx={round ? 16 : 24} cy={round ? 98 : 94} rx={round ? 12 : 9} ry={round ? 10 : 6} fill={C.roast} stroke={round ? C.caramel : C.latte} strokeWidth={2} />
      <ellipse cx={round ? 16 : 24} cy={round ? 124 : 128} rx={round ? 12 : 9} ry={round ? 10 : 6} fill={C.roast} stroke={round ? C.caramel : C.latte} strokeWidth={2} />
      {folds !== undefined && (
        <g>
          <Line x1={203} y1={176} x2={214 - g} y2={176} f={C.caramel} w={3} />
          <Line x1={214 + g} y1={176} x2={226} y2={176} f={C.caramel} w={3} />
        </g>
      )}
      {m && <circle cx={m[0]} cy={m[1]} r={9 + 7 * pulse} fill="none" stroke={C.caramel} strokeWidth={2.5} opacity={0.35 + 0.5 * pulse} />}
    </g>
  );
}

// ── The vowel grid: height down, backness across; a ring means rounded lips ──
const Dot = ({ x, y, ring = false, f = C.crema, o = 1, r = 7 }: { x: number; y: number; ring?: boolean; f?: string; o?: number; r?: number }) => (
  <g opacity={o}>
    <circle cx={x} cy={y} r={r} fill={f} />
    {ring && <circle cx={x} cy={y} r={r + 8} fill="none" stroke={C.caramel} strokeWidth={2.5} />}
  </g>
);

const PlaceholderQ = ({ x, y, s = 24, f = C.caramel, o = 1 }: { x: number; y: number; s?: number; f?: string; o?: number }) => (
  <text x={x} y={y} fontSize={s} style={{ fontSize: `calc(${s}px * var(--svg-text-scale, 1))` }} fill={f} textAnchor="middle" opacity={o} fontFamily="Fraunces, Georgia, serif" fontWeight={700}>?</text>
);

// ── 1 · The problem ────────────────────────────────────────────────────────
export function Problem({ t }: StepCtx) {
  const l1 = '„Ist die Küche';
  const l2 = 'in der Miete enthalten?“';
  const typed = Math.floor(seg(t, 0, 0.8) * (l1.length + l2.length));
  const marked = t >= 1.6;
  const cb = marked ? C.cherryText : C.crema;
  const heard = fade(t, 1.8, 2.4);
  return (
    <Svg label="A flat-viewing question, and how a short vowel and a plain u change what the agent may hear" h={470}>
      <T x={300} y={34} s={13} f={C.taupe} a="middle">YOU ASK</T>
      {typed < l1.length ? (
        <Tx x={300} y={72} s={21} a="middle">{l1.slice(0, typed)}</Tx>
      ) : (
        <>
          <Tx x={300} y={72} s={21} a="middle">
            <Parts parts={['„Ist die K', [marked ? 'ü' : 'ü', cb], 'che']} base={C.crema} />
          </Tx>
          <Tx x={300} y={102} s={21} a="middle">
            {typed - l1.length < l2.length ? l2.slice(0, typed - l1.length) : <Parts parts={['in der M', [marked ? 'ie' : 'ie', cb], 'te enthalten?“']} />}
          </Tx>
        </>
      )}
      <T x={300} y={128} s={14} f={C.latte} a="middle" o={fade(t, 0.8, 1.4)}>Is the kitchen included in the rent?</T>
      <polyline points="290,148 300,158 310,148" fill="none" stroke={C.taupe} strokeWidth={2} opacity={heard} />
      <g opacity={heard} transform={`translate(0 ${(1 - heard) * 10})`}>
        <T x={300} y={186} s={13} f={C.taupe} a="middle">SHE MAY HEAR</T>
        <Tx x={300} y={220} s={21} a="middle"><Parts parts={['„Ist die K', ['u', C.cherryText], 'che']} /></Tx>
        <Tx x={300} y={250} s={21} a="middle"><Parts parts={['in der Mi', ['tt', C.cherryText], 'e enthalten?“']} /></Tx>
        <T x={300} y={276} s={14} f={C.latte} a="middle">... included in the middle?</T>
      </g>
      <g opacity={fade(t, 2.6, 3.2)}>
        <T x={300} y={318} s={14} f={C.cherryText} a="middle">ie said short: Miete becomes Mitte</T>
        <T x={300} y={342} s={14} f={C.cherryText} a="middle">ü said as u: Küche drifts toward Kuchen, cake</T>
      </g>
      <g opacity={fade(t, 3.4, 4.2)}>
        <T x={300} y={386} s={13} f={C.taupe} a="middle">THE AGENT REPLIES</T>
        <Tx x={300} y={418} s={18} f={C.latte} a="middle">„Richtig. Das Bad und der Keller auch.“</Tx>
        <T x={300} y={446} s={13} f={C.taupe} a="middle">half of it does not sound the way it is written</T>
      </g>
    </Svg>
  );
}

// ── 2 · Miete or Mitte? (drawn wide and short: on a phone a predict step's drawing is about 360 by 145 px) ──
export function MieteMitte({ t, answer }: StepCtx) {
  const ans = answer !== null;
  const a = fade(t, 0, 0.6);
  const link = fade(t, 0.6, 1.2);
  const bars: [number, boolean, string][] = [[20, true, C.caramel], [320, false, C.cinnamon]];
  return (
    <Svg label="Miete and Mitte as letters over sounds: which sound differs?" h={262}>
      <g opacity={a}>
        <T x={20} y={22} s={14} f={C.latte}>rent</T>
        <Strip
          x0={20} y={64} letters={['M', 'i', 'e', 't', 'e']} linkO={link}
          lcol={(i) => (ans && (i === 1 || i === 2) ? C.caramel : undefined)}
          sounds={[{ s: 'm', from: [0] }, { s: ans ? 'iː' : '?', from: [1, 2], f: C.caramel, dashed: !ans }, { s: 't', from: [3] }, { s: 'ə', from: [4], f: ans ? C.latte : undefined }]}
        />
        <T x={320} y={22} s={14} f={C.latte}>middle</T>
        <Strip
          x0={320} y={64} letters={['M', 'i', 't', 't', 'e']} linkO={link}
          lcol={(i) => (ans && i === 1 ? C.cinnamon : undefined)}
          sounds={[{ s: 'm', from: [0] }, { s: ans ? 'ɪ' : '?', from: [1], f: C.cinnamon, dashed: !ans }, { s: 't', from: [2, 3] }, { s: 'ə', from: [4], f: ans ? C.latte : undefined }]}
        />
        {ans && bars.map(([x, long, f]) => (
          <g key={x}>
            <LenBar x={x} y={150} long={long} f={f} />
            <T x={x} y={184} s={13} f={C.taupe}>{long ? 'long' : 'short'}</T>
          </g>
        ))}
        {ans && <Tx x={120} y={236} s={20} a="middle">[ˈmiːtə]</Tx>}
        {ans && <Tx x={420} y={236} s={20} a="middle">[ˈmɪtə]</Tx>}
      </g>
    </Svg>
  );
}

// ── 3 · Long and tense, short and lax ──────────────────────────────────────
const ROWS3: { long: Part[]; short: Part[] }[] = [
  { long: ['M', ['ie', C.caramel], 'te'], short: ['Mi', ['tt', C.cinnamon], 'e'] },
  { long: ['Hö', ['h', C.caramel], 'le'], short: ['Hö', ['ll', C.cinnamon], 'e'] },
  { long: ['O', ['f', C.caramel], 'en'], short: ['o', ['ff', C.cinnamon], 'en'] },
  { long: ['ka', ['m', C.caramel]], short: ['Ka', ['mm', C.cinnamon]] },
];
export function Ledger({ t }: StepCtx) {
  const g = easeOut(seg(t, 0, 0.8));
  const slide = easeOut(seg(t, 0.2, 0.9));
  return (
    <Svg label="Long and short vowel pairs: Miete Mitte, Höhle Hölle, Ofen offen, kam Kamm, with the spelling cues marked" h={496}>
      <T x={585} y={18} s={13} f={C.taupe} a="end">schematic</T>
      <g opacity={g}>
        <Dot x={180} y={42} f={C.caramel} />
        <Tx x={160} y={48} s={18} a="end" f={C.caramel}>iː</Tx>
        <Dot x={lerp(180, 226, slide)} y={lerp(42, 70, slide)} f={C.cinnamon} o={slide} />
        <Tx x={244} y={77} s={18} f={C.cinnamon} o={slide}>ɪ</Tx>
        <T x={276} y={60} s={13} f={C.taupe} o={slide}>lax</T>
        <Dot x={340} y={112} f={C.caramel} />
        <Tx x={358} y={118} s={18} f={C.crema} o={fade(t, 0.8, 1.4)}>a = aː</Tx>
        <T x={358} y={140} s={13} f={C.latte} o={fade(t, 0.8, 1.4)}>(nearly) only length</T>
      </g>
      <T x={40} y={176} s={13} f={C.taupe}>LONG, TENSE</T>
      <T x={330} y={176} s={13} f={C.taupe}>SHORT, LAX</T>
      {ROWS3.map((r, i) => {
        const t0 = 1.6 + i * 0.7;
        const o = fade(t, t0, t0 + 0.3);
        const gr = easeOut(seg(t, t0 + 0.2, t0 + 0.7));
        const y = 214 + i * 62;
        return (
          <g key={i} opacity={o}>
            <Tx x={40} y={y} s={23}><Parts parts={r.long} /></Tx>
            <LenBar x={40} y={y + 14} long f={C.caramel} grow={gr} />
            <Tx x={330} y={y} s={23}><Parts parts={r.short} /></Tx>
            <LenBar x={330} y={y + 14} long={false} f={C.cinnamon} grow={gr} />
          </g>
        );
      })}
      <T x={300} y={462} s={13} f={C.taupe} a="middle" o={fade(t, 4.4, 5.2)}>cues, not guarantees: Mond is long;</T>
      <T x={300} y={484} s={13} f={C.taupe} a="middle" o={fade(t, 4.4, 5.2)}>nothing marks length before ch</T>
    </Svg>
  );
}

// ── 4 · Where does ü come from? ────────────────────────────────────────────
export function UmlautPredict({ t, answer }: StepCtx) {
  const ans = answer !== null;
  const m = easeOut(seg(t, 0, 0.6));
  return (
    <Svg label="A mouth with rounded lips for ü: where is the tongue?" h={280}>
      <g opacity={m}>
        <Mouth ox={14} oy={20} sc={1.1} pose={ans ? POSES.i : POSES.rest} lips="round" dashed={!ans} mark={ans ? undefined : 'lips'} t={t} />
        {!ans && <PlaceholderQ x={125} y={170} s={40} o={fade(t, 1, 1.2)} />}
      </g>
      <text x={440} y={110} fontSize={84} style={{ fontSize: 'calc(84px * var(--svg-text-scale, 1))' }} fill={C.crema} textAnchor="middle" fontFamily="Fraunces, Georgia, serif" fontWeight={700}>ü</text>
      <Tx x={440} y={168} s={18} f={C.latte} a="middle">Mühle, über</Tx>
      {ans ? (
        <>
          <Tx x={440} y={206} s={24} f={C.caramel} a="middle">yː</Tx>
          <T x={330} y={240} s={14} f={C.caramel}>tongue as for i</T>
          <T x={330} y={262} s={14} f={C.caramel}>lips as for u</T>
        </>
      ) : (
        <T x={330} y={250} s={14} f={C.taupe}>lips round · tongue: ?</T>
      )}
    </Svg>
  );
}

// ── 5 · ü and ö ────────────────────────────────────────────────────────────
export function UmlautGrid({ t }: StepCtx) {
  const X = { front: 120, ue: 200, back: 500, mid: 310 };
  const Y = { close: 80, closeMid: 175, openMid: 270, open: 355 };
  const s1 = easeOut(seg(t, 1, 2));
  const s2 = easeOut(seg(t, 2, 3));
  const s3 = easeOut(seg(t, 3, 3.8));
  const ex = fade(t, 3.8, 4.6);
  const g = fade(t, 0, 1);
  return (
    <Svg label="A vowel grid where u and o slide to the front and keep their rounded lips, becoming ü and ö; ä lands on e" h={480}>
      <g opacity={g}>
        {[Y.close, Y.closeMid, Y.openMid, Y.open].map((y) => (
          <Line key={y} x1={90} y1={y} x2={545} y2={y} f={C.cocoa} w={1.5} />
        ))}
        <T x={120} y={34} s={13} f={C.taupe} a="middle">front</T>
        <T x={500} y={34} s={13} f={C.taupe} a="middle">back</T>
        <T x={14} y={Y.close + 5} s={13} f={C.taupe}>close</T>
        <T x={14} y={Y.open + 5} s={13} f={C.taupe}>open</T>
        <Dot x={X.front} y={Y.close} />
        <Tx x={X.front} y={Y.close - 18} s={17} a="middle">iː</Tx>
        <Dot x={X.front} y={Y.closeMid} />
        <Tx x={X.front} y={Y.closeMid - 18} s={17} a="middle">eː</Tx>
        <Dot x={X.front} y={Y.openMid} />
        <Tx x={X.front} y={Y.openMid - 18} s={17} a="middle">ɛ</Tx>
        <Dot x={X.back} y={Y.close} ring o={0.55} />
        <Tx x={X.back} y={Y.close - 24} s={17} a="middle" f={C.latte}>uː</Tx>
        <Dot x={X.back} y={Y.closeMid} ring o={0.55} />
        <Tx x={X.back} y={Y.closeMid - 24} s={17} a="middle" f={C.latte}>oː</Tx>
        <Dot x={X.mid} y={Y.open} o={0.55} />
        <Tx x={X.mid} y={Y.open + 28} s={17} a="middle" f={C.latte}>a</Tx>
      </g>
      {s1 > 0 && (
        <g>
          <Line x1={X.back} y1={Y.close} x2={lerp(X.back, X.ue, s1)} y2={Y.close} f={C.caramel} w={1.5} dash="3 5" o={0.6} />
          <Dot x={lerp(X.back, X.ue, s1)} y={Y.close} ring f={C.caramel} />
          {s1 >= 1 && <Tx x={X.ue} y={Y.close - 24} s={17} a="middle" f={C.caramel}>yː</Tx>}
        </g>
      )}
      {s2 > 0 && (
        <g>
          <Line x1={X.back} y1={Y.closeMid} x2={lerp(X.back, X.ue, s2)} y2={Y.closeMid} f={C.caramel} w={1.5} dash="3 5" o={0.6} />
          <Dot x={lerp(X.back, X.ue, s2)} y={Y.closeMid} ring f={C.caramel} />
          {s2 >= 1 && <Tx x={X.ue} y={Y.closeMid - 24} s={17} a="middle" f={C.caramel}>øː</Tx>}
        </g>
      )}
      {s3 > 0 && (
        <g>
          <Dot x={lerp(X.mid, X.front, s3)} y={lerp(Y.open, Y.openMid, s3)} f={C.cinnamon} r={5} />
          {s3 >= 1 && <Tx x={X.front} y={Y.openMid + 34} s={16} a="middle" f={C.cinnamon}>ä = ɛ</Tx>}
        </g>
      )}
      <g opacity={ex}>
        <Tx x={300} y={426} s={17} a="middle" f={C.latte}>Mühle yː · Höhle øː</Tx>
        <Tx x={300} y={456} s={17} a="middle" f={C.latte}>Männer ɛ = Bett ɛ</Tx>
      </g>
    </Svg>
  );
}

// ── 6 · One ch, two places ─────────────────────────────────────────────────
type ChWord = { pre: string; post: string; ipa: string; side: 'f' | 'b'; pose: Pose; mark: 'hardPalate' | 'softPalate' };
const CH_WORDS: ChWord[] = [
  { pre: 'i', post: '', ipa: 'ɪç', side: 'f', pose: POSES.palatal, mark: 'hardPalate' },
  { pre: 'a', post: '', ipa: 'ax', side: 'b', pose: POSES.uvular, mark: 'softPalate' },
  { pre: 'Bu', post: '', ipa: 'buːx', side: 'b', pose: POSES.velar, mark: 'softPalate' },
  { pre: 'mi', post: '', ipa: 'mɪç', side: 'f', pose: POSES.palatal, mark: 'hardPalate' },
  { pre: 'Fur', post: 't', ipa: 'fʊʁçt', side: 'f', pose: POSES.palatal, mark: 'hardPalate' },
  { pre: 'do', post: '', ipa: 'dɔx', side: 'b', pose: POSES.velar, mark: 'softPalate' },
  { pre: 'ho', post: '', ipa: 'hoːx', side: 'b', pose: POSES.velar, mark: 'softPalate' },
  { pre: 'ni', post: 't', ipa: 'nɪçt', side: 'f', pose: POSES.palatal, mark: 'hardPalate' },
];
const chParts = (w: ChWord, accent: string): Part[] => [w.pre.slice(0, -1), [w.pre.slice(-1), accent], 'ch' + w.post];
export function ChPlaces({ t }: StepCtx) {
  const beat = 0.7;
  const k = Math.min(CH_WORDS.length - 1, Math.floor(t / beat));
  const cur = CH_WORDS[k];
  const prev = CH_WORDS[Math.max(0, k - 1)];
  const mv = easeOut(seg(t - k * beat, 0, 0.35));
  const pose = k === 0 ? cur.pose : mixPose(prev.pose, cur.pose, mv);
  const over = t >= CH_WORDS.length * beat;
  const OX = 196, OY = 24, SC = 0.8;
  const [hx, hy] = mp(OX, OY, SC, 100, 40);
  const [sx, sy] = mp(OX, OY, SC, 172, 52);
  const accent = (w: ChWord) => (w.side === 'f' ? C.caramel : C.cinnamon);
  const left = CH_WORDS.map((w, i) => ({ w, i })).filter((x) => x.w.side === 'f');
  const right = CH_WORDS.map((w, i) => ({ w, i })).filter((x) => x.w.side === 'b');
  const List = ({ items, x }: { items: { w: ChWord; i: number }[]; x: number }) => (
    <>
      {items.map(({ w, i }, j) => (
        <Tx key={i} x={x} y={312 + j * 28} s={19} o={fade(t, (i + 1) * beat - 0.25, (i + 1) * beat)}>
          <Parts parts={chParts(w, accent(w))} />
        </Tx>
      ))}
    </>
  );
  return (
    <Svg label="The two ch sounds: after a, o, u and au the tongue is at the back; elsewhere at the front" h={496}>
      <Mouth ox={OX} oy={OY} sc={SC} pose={pose} lips="spread" mark={over ? undefined : cur.mark} t={t - k * beat} />
      {!over && cur.mark === 'hardPalate' && <T x={hx - 18} y={hy - 4} s={13} f={C.taupe} a="end">hard palate</T>}
      {!over && cur.mark === 'softPalate' && <T x={sx + 40} y={sy - 12} s={13} f={C.taupe}>soft palate</T>}
      {!over ? (
        <>
          <Tx x={288} y={226} s={27} a="end"><Parts parts={chParts(cur, accent(cur))} /></Tx>
          <Tx x={312} y={226} s={27} f={accent(cur)}>{cur.ipa}</Tx>
        </>
      ) : (
        <T x={300} y={222} s={14} f={C.latte} a="middle">the vowel sound before it decides</T>
      )}
      <T x={40} y={272} s={13} f={C.caramel}>FRONT: ç</T>
      <T x={330} y={272} s={13} f={C.cinnamon}>BACK: x</T>
      <List items={left} x={40} />
      <List items={right} x={330} />
      <g opacity={fade(t, 5.6, 6.2)}>
        <Tx x={300} y={446} s={17} a="middle" f={C.latte}>Buch x · Bücher ç</Tx>
      </g>
      <g opacity={fade(t, 6.0, 6.6)}>
        <Tx x={300} y={478} s={17} a="middle" f={C.latte}>Küche ʏ+ç · Kuchen uː+x</Tx>
      </g>
    </Svg>
  );
}

// ── 7 · Frauchen: ach or ich? ──────────────────────────────────────────────
export function Frauchen({ t, answer }: StepCtx) {
  const ans = answer !== null;
  const a = fade(t, 0, 0.6);
  const cut = fade(t, 0.6, 1.2);
  const P = 36;
  const X1 = 14, X2 = 300;
  return (
    <Svg label="rauchen and Frauchen, each cut into stem and ending: which ch sound does Frauchen take?" h={250}>
      <g opacity={a}>
        <T x={X1} y={22} s={14} f={C.latte}>to smoke</T>
        <Strip
          x0={X1} y={66} pitch={P} letters={['r', 'a', 'u', 'c', 'h', 'e', 'n']}
          lcol={(i) => (i === 3 || i === 4 ? C.cinnamon : undefined)}
          sounds={[{ s: 'ʁ', from: [0] }, { s: 'aʊ', from: [1, 2] }, { s: 'x', from: [3, 4], f: C.cinnamon }, { s: 'ə', from: [5] }, { s: 'n', from: [6] }]}
        />
        <Line x1={X1 + P * 5} y1={38} x2={X1 + P * 5} y2={144} f={C.caramel} w={2} dash="4 4" o={cut} />
        <T x={X2} y={22} s={14} f={C.latte}>Frau + chen: small Frau</T>
        <Strip
          x0={X2} y={66} pitch={P} letters={['F', 'r', 'a', 'u', 'c', 'h', 'e', 'n']}
          lcol={(i) => (ans && i >= 4 ? C.caramel : undefined)}
          sounds={[
            { s: 'f', from: [0] }, { s: 'ʁ', from: [1] }, { s: 'aʊ', from: [2, 3] },
            { s: ans ? 'ç' : '?', from: [4, 5], f: C.caramel, dashed: !ans }, { s: 'ə', from: [6] }, { s: 'n', from: [7] },
          ]}
        />
        <Line x1={X2 + P * 4} y1={38} x2={X2 + P * 4} y2={144} f={C.caramel} w={2} dash="4 4" o={cut} />
      </g>
      {ans && <T x={300} y={206} s={15} f={C.caramel} a="middle">-chen is always ç, whatever comes before it</T>}
    </Svg>
  );
}

// ── 8 · Two r's in Lehrer ──────────────────────────────────────────────────
export function TwoRs({ t }: StepCtx) {
  const a = fade(t, 0, 0.8);
  const toUvula = easeOut(seg(t, 0.8, 1.8));
  const fly = easeOut(seg(t, 1.8, 2.8));
  const rows = [
    { l: 'before a vowel: the consonant ʁ', e: 'rot ʁoːt' },
    { l: 'end of a syllable, after a vowel: ɐ', e: 'der deːɐ · wir viːɐ' },
    { l: '-er is the vowel ɐ, not the weak e ə', e: 'besser ˈbɛsɐ · bitte ˈbɪtə' },
  ];
  const OX = 20, OY = 140, SC = 0.9;
  const GX = 330, GY = 150;
  const stripCx = 44 * 0 + 150 + 44 * 3.5; // the ɐ tile on the strip
  const dx = lerp(stripCx, GX + 140, fly);
  const dy = lerp(100, GY + 110, fly);
  return (
    <Svg label="Lehrer has both r's: a consonant at the uvula before a vowel, and a vowel at the end" h={540}>
      <g opacity={a}>
        <Strip
          x0={150} y={44} letters={['L', 'e', 'h', 'r', 'e', 'r']}
          sounds={[
            { s: 'l', from: [0] }, { s: 'eː', from: [1, 2] },
            { s: 'ʁ', from: [3], f: C.caramel, o: 1 }, { s: 'ɐ', from: [4, 5], f: C.cinnamon },
          ]}
        />
      </g>
      <Mouth ox={OX} oy={OY} sc={SC} pose={mixPose(POSES.rest, POSES.uvular, toUvula)} lips="spread" mark={t > 1.2 && t < 2.8 ? 'uvula' : undefined} t={t} />
      <T x={30} y={338} s={13} f={C.taupe} o={toUvula}>uvula: ʁ</T>
      <g opacity={fade(t, 1.6, 2.2)}>
        <rect x={GX} y={GY} width={240} height={150} rx={10} fill="none" stroke={C.cocoa} strokeWidth={2} />
        <T x={GX + 8} y={GY + 20} s={13} f={C.taupe}>front</T>
        <T x={GX + 232} y={GY + 20} s={13} f={C.taupe} a="end">back</T>
        <T x={GX + 120} y={GY + 142} s={13} f={C.taupe} a="middle">open</T>
        <Dot x={GX + 122} y={GY + 118} f={C.crema} o={0.55} r={5} />
        <Tx x={GX + 140} y={GY + 124} s={15} f={C.latte}>a</Tx>
      </g>
      {fly > 0 && (
        <g>
          <Dot x={fly >= 1 ? GX + 140 : dx} y={fly >= 1 ? GY + 96 : dy} f={C.cinnamon} r={6} />
          <Tx x={(fly >= 1 ? GX + 140 : dx) + 14} y={(fly >= 1 ? GY + 96 : dy) + 6} s={19} f={C.cinnamon}>ɐ</Tx>
        </g>
      )}
      {rows.map((r, i) => (
        <g key={i} opacity={fade(t, 3 + i * 0.5, 3.4 + i * 0.5)}>
          <T x={30} y={382 + i * 52} s={13} f={C.taupe}>{r.l}</T>
          <Tx x={30} y={408 + i * 52} s={17}>{r.e}</Tx>
        </g>
      ))}
    </Svg>
  );
}

// ── 9 · Oper and Opa ───────────────────────────────────────────────────────
export function OperOpa({ t, answer }: StepCtx) {
  const ans = answer !== null;
  const a = fade(t, 0, 0.8);
  const GX = 420, GY = 14;
  return (
    <Svg label="Oper and Opa: which sound does the -er ending land on?" h={270}>
      <g opacity={a}>
        <T x={14} y={22} s={14} f={C.latte}>opera</T>
        <Strip
          x0={14} y={64} letters={['O', 'p', 'e', 'r']}
          sounds={[{ s: 'oː', from: [0] }, { s: 'p', from: [1] }, { s: ans ? 'ɐ' : '?', from: [2, 3], f: C.cinnamon, dashed: !ans }]}
        />
        <T x={230} y={22} s={14} f={C.latte}>grandpa</T>
        <Strip
          x0={230} y={64} letters={['O', 'p', 'a']}
          sounds={[{ s: 'oː', from: [0] }, { s: 'p', from: [1] }, { s: ans ? 'a' : '?', from: [2], f: C.caramel, dashed: !ans }]}
        />
        <rect x={GX} y={GY} width={170} height={150} rx={10} fill="none" stroke={C.cocoa} strokeWidth={2} />
        <T x={GX + 8} y={GY + 20} s={13} f={C.taupe}>front</T>
        <T x={GX + 162} y={GY + 20} s={13} f={C.taupe} a="end">back</T>
        <T x={GX + 8} y={GY + 142} s={13} f={C.taupe}>schematic</T>
        <Dot x={GX + 85} y={GY + 82} f={C.cinnamon} r={6} o={ans ? 1 : 0.5} />
        <Dot x={GX + 85} y={GY + 104} f={C.caramel} r={6} o={ans ? 1 : 0.5} />
      </g>
      {ans && (
        <>
          <Tx x={14} y={174} s={20} f={C.cinnamon}>[ˈoːpɐ]</Tx>
          <Tx x={230} y={174} s={20} f={C.caramel}>[ˈoːpa]</Tx>
          <T x={14} y={222} s={13} f={C.latte}>ɐ is just a little higher than a:</T>
          <T x={14} y={244} s={13} f={C.latte}>in northern speech, the same</T>
        </>
      )}
    </Svg>
  );
}

// ── 10 · Rad or Rat? ───────────────────────────────────────────────────────
export function RadRat({ t, answer }: StepCtx) {
  const ans = answer !== null;
  const a = fade(t, 0, 0.6);
  const vt = easeOut(seg(t, 0.6, 1.2));
  const P = 44;
  const c = (x0: number, i: number) => x0 + P * (i + 0.5);
  const X1 = 12, X2 = 212, X3 = 410, P3 = 36;
  return (
    <Svg label="Rad and Rat with voice tracks: is the final consonant voiced in Rad?" h={262}>
      <g opacity={a}>
        <T x={X1} y={22} s={14} f={C.latte}>wheel</T>
        <Strip x0={X1} y={64} pitch={P} letters={['R', 'a', 'd']} sounds={[{ s: 'ʁ', from: [0] }, { s: 'aː', from: [1] }, { s: ans ? 't' : '?', from: [2], f: C.caramel, dashed: !ans }]} />
        <VoiceTrack cx={c(X1, 0)} y={142} voiced f={C.latte} o={vt} />
        <VoiceTrack cx={c(X1, 1)} y={142} voiced f={C.latte} o={vt} />
        {ans && <VoiceTrack cx={c(X1, 2)} y={142} voiced={false} f={C.caramel} />}
        <T x={X2} y={22} s={14} f={C.latte}>council</T>
        <Strip x0={X2} y={64} pitch={P} letters={['R', 'a', 't']} sounds={[{ s: 'ʁ', from: [0] }, { s: 'aː', from: [1] }, { s: 't', from: [2], f: C.caramel }]} />
        <VoiceTrack cx={c(X2, 0)} y={142} voiced f={C.latte} o={vt} />
        <VoiceTrack cx={c(X2, 1)} y={142} voiced f={C.latte} o={vt} />
        <VoiceTrack cx={c(X2, 2)} y={142} voiced={false} f={C.caramel} o={vt} />
      </g>
      {ans && (
        <g>
          <Tx x={X1 + 66} y={200} s={22} f={C.caramel} a="middle">ʁaːt</Tx>
          <Tx x={X2 + 66} y={200} s={22} f={C.caramel} a="middle">ʁaːt</Tx>
          <T x={X3} y={22} s={14} f={C.latte}>wheels</T>
          <Strip x0={X3} y={64} pitch={P3} letters={['R', 'ä', 'd', 'e', 'r']} sounds={[{ s: 'ʁ', from: [0] }, { s: 'ɛː', from: [1] }, { s: 'd', from: [2], f: C.cinnamon }, { s: 'ɐ', from: [3, 4] }]} />
          <VoiceTrack cx={X3 + P3 * 2.5} y={142} voiced f={C.cinnamon} />
          <Tx x={X3 + 90} y={200} s={20} f={C.cinnamon} a="middle">ˈʁɛːdɐ</Tx>
        </g>
      )}
      <T x={14} y={246} s={13} f={C.taupe}>filled = voiced, outline = voiceless</T>
    </Svg>
  );
}

// ── 11 · Tag sounds like Tak ───────────────────────────────────────────────
type Pair = { a: string; as: string[]; av: boolean[]; b: string; bs: string[]; bv: boolean[] };
const PAIRS11: Pair[] = [
  { a: 'Tag', as: ['t', 'aː', 'k'], av: [true, true, false], b: 'Tage', bs: ['t', 'aː', 'ɡ', 'ə'], bv: [true, true, true, true] },
  { a: 'brav', as: ['b', 'ʁ', 'aː', 'f'], av: [true, true, true, false], b: 'brave', bs: ['b', 'ʁ', 'aː', 'v', 'ə'], bv: [true, true, true, true, true] },
  { a: 'Bad', as: ['b', 'aː', 't'], av: [true, true, false], b: 'Bäder', bs: ['b', 'ɛː', 'd', 'ɐ'], bv: [true, true, true, true] },
  { a: 'lieb|lich', as: ['l', 'iː', 'p', 'l', 'ɪ', 'ç'], av: [true, true, false, true, true, false], b: 'lie|ben', bs: ['l', 'iː', 'b', 'ən'], bv: [true, true, true, true] },
];
export function Devoicing({ t }: StepCtx) {
  const R = 0.9;
  const P = 31;
  return (
    <Svg label="Final devoicing: the consonant at the end of a syllable loses its voice, and gets it back when an ending moves it into the next syllable" h={520}>
      {PAIRS11.map((r, i) => {
        const t0 = i * R;
        const y = 40 + i * 92;
        const oa = fade(t, t0, t0 + 0.3);
        const ob = fade(t, t0 + 0.6, t0 + 0.9);
        const keyB = r.bs.findIndex((x) => 'ɡvdb'.includes(x));
        return (
          <g key={i}>
            <g opacity={oa}>
              <Tx x={20} y={y} s={22}>{r.a}</Tx>
              {r.as.map((snd, j) => {
                const cx = 36 + j * P;
                const key = !r.av[j] || (r.a === 'lieb|lich' && j === 2);
                return (
                  <g key={j}>
                    <Tx x={cx} y={y + 36} s={18} a="middle" f={key ? C.caramel : C.latte}>{snd}</Tx>
                    {key && <VoiceTrack cx={cx} y={y + 46} voiced={false} f={C.caramel} />}
                  </g>
                );
              })}
            </g>
            <g opacity={ob}>
              <Tx x={320} y={y} s={22}>{r.b}</Tx>
              {r.bs.map((snd, j) => {
                const cx = 336 + j * P;
                return (
                  <g key={j}>
                    <Tx x={cx} y={y + 36} s={18} a="middle" f={j === keyB ? C.cinnamon : C.latte}>{snd}</Tx>
                    {j === keyB && <VoiceTrack cx={cx} y={y + 46} voiced f={C.cinnamon} />}
                  </g>
                );
              })}
            </g>
            <Line x1={300} y1={y - 18} x2={300} y2={y + 56} f={C.cocoa} w={2} o={oa} />
          </g>
        );
      })}
      <g opacity={fade(t, 3.8, 4.6)}>
        <Tx x={300} y={424} s={16} a="middle" f={C.latte}>north: -ig ends in ɪç · wichtig ˈvɪçtɪç</Tx>
      </g>
      <T x={300} y={474} s={13} f={C.taupe} a="middle" o={fade(t, 4.8, 5.4)}>spelling keeps the stem: Tag, not Tak</T>
    </Svg>
  );
}

// ── 12 · mein Auto ─────────────────────────────────────────────────────────
export function MeinAuto({ t, answer }: StepCtx) {
  const ans = answer !== null;
  const eng = fade(t, 0, 0.8);
  const ger = fade(t, 0.8, 1.2);
  return (
    <Svg label="English runs an apple together as a napple; how does German join mein and Auto?" h={272}>
      <g opacity={ans ? 0.4 : 1}>
        <T x={14} y={22} s={13} f={C.taupe}>English links</T>
        <Tx x={100} y={72} s={24} a="end" o={eng}>an</Tx>
        <Tx x={124} y={72} s={24} o={eng}>apple</Tx>
        <path d={`M100 84 Q112 ${84 + 14 * eng} 126 84`} fill="none" stroke={C.cherryText} strokeWidth={2.5} opacity={eng} />
        <Tx x={100} y={118} s={24} a="end" f={C.cherryText} o={fade(t, 0.5, 0.9)}>a</Tx>
        <Tx x={124} y={118} s={24} f={C.cherryText} o={fade(t, 0.5, 0.9)}>napple</Tx>
      </g>
      <g opacity={ger}>
        <T x={300} y={22} s={13} f={C.taupe}>German</T>
        <Tx x={408} y={72} s={30} a="end">mein</Tx>
        <Tx x={472} y={72} s={30}>Auto</Tx>
        {!ans && <PlaceholderQ x={440} y={76} s={40} />}
        <T x={440} y={108} s={14} f={C.latte} a="middle">my car</T>
      </g>
      {ans && (
        <>
          <Catch x={440} y={64} k={1} />
          <Tx x={440} y={150} s={20} a="middle" f={C.caramel}>[maɪn ˈʔaʊto]</Tx>
        </>
      )}
      <g opacity={ger}>
        <Mouth ox={14} oy={140} sc={0.55} pose={POSES.rest} mark={ans ? 'glottis' : undefined} folds={ans ? 0.5 + 0.5 * Math.sin(t * 6) ** 2 : undefined} t={t} />
        <T x={170} y={238} s={13} f={C.taupe}>vocal folds close, then open</T>
      </g>
    </Svg>
  );
}

// ── 13 · A catch before every vowel ───────────────────────────────────────
type CatchRow = { bars: number[]; ghosts: number[]; chunks: { x: number; a: 'start' | 'end' | 'middle'; s: string }[]; ipa: { x: number; s: string }[] };
const ROWS13: CatchRow[] = [
  { bars: [250], ghosts: [], chunks: [{ x: 266, a: 'start', s: 'Acht' }], ipa: [{ x: 300, s: 'ˈʔaxt' }] },
  { bars: [300], ghosts: [], chunks: [{ x: 284, a: 'end', s: 'be' }, { x: 316, a: 'start', s: 'achten' }], ipa: [{ x: 300, s: 'bəˈʔaxtən' }] },
  { bars: [300], ghosts: [], chunks: [{ x: 284, a: 'end', s: 'The' }, { x: 316, a: 'start', s: 'ater' }], ipa: [{ x: 300, s: 'teˈʔaːtɐ' }] },
  { bars: [236, 336], ghosts: [], chunks: [{ x: 220, a: 'end', s: 'O' }, { x: 286, a: 'middle', s: 'a' }, { x: 352, a: 'start', s: 'se' }], ipa: [{ x: 300, s: 'ʔoˈʔaːzə' }] },
  { bars: [40], ghosts: [136, 466], chunks: [{ x: 56, a: 'start', s: 'Acht' }, { x: 152, a: 'start', s: 'ung' }, { x: 390, a: 'start', s: 'Fahr' }, { x: 486, a: 'start', s: 'er' }], ipa: [{ x: 120, s: 'ˈʔaxtʊŋ' }] },
];
export function CatchRows({ t }: StepCtx) {
  const R = 0.8;
  return (
    <Svg label="Where the glottal catch goes: before words and stems that start with a vowel, never before an ending" h={520}>
      {ROWS13.map((r, i) => {
        const t0 = i * R;
        const y = 66 + i * 86;
        const k = easeOutBack(seg(t, t0, t0 + 0.5));
        const o = fade(t, t0, t0 + 0.3);
        return (
          <g key={i}>
            <g opacity={o}>
              {r.chunks.map((c, j) => (
                <Tx key={j} x={c.x} y={y} s={21} a={c.a}>{c.s}</Tx>
              ))}
              {r.ipa.map((p, j) => (
                <Tx key={j} x={p.x} y={y + 34} s={16} a="middle" f={C.latte}>{p.s}</Tx>
              ))}
            </g>
            {r.bars.map((bx, j) => (
              <Catch key={j} x={bx} y={y - 6} k={Math.max(0.0001, Math.min(1, k))} />
            ))}
            {r.ghosts.map((gx, j) => {
              const o2 = t > t0 + 0.6 ? lerp(1, 0.35, easeOut(seg(t, t0 + 0.8, t0 + 1.3))) : 0;
              const sh = t > t0 + 0.6 && t < t0 + 1 ? Math.sin(t * 40) * 2 : 0;
              return (
                <g key={j} opacity={o2} transform={`translate(${sh} 0)`}>
                  <Line x1={gx} y1={y - 22} x2={gx} y2={y + 12} f={C.taupe} w={4} dash="4 4" />
                  <Line x1={gx - 9} y1={y - 15} x2={gx + 9} y2={y + 5} f={C.taupe} w={2} />
                  <Line x1={gx + 9} y1={y - 15} x2={gx - 9} y2={y + 5} f={C.taupe} w={2} />
                </g>
              );
            })}
          </g>
        );
      })}
      <T x={300} y={502} s={13} f={C.taupe} a="middle" o={fade(t, 4.4, 5)}>not a phoneme: a boundary marker · north, careful speech</T>
    </Svg>
  );
}

// ── 14 · One standard, three countries ─────────────────────────────────────
type Cell = 'yes' | 'no' | string;
const GRID14: { l: string; c: Cell[] }[] = [
  { l: 'Rad = ʁaːt', c: ['yes', 'no', 'no'] },
  { l: 'mein | Auto', c: ['yes', 'no', 'no'] },
  { l: '-ig = ɪç', c: ['yes', 'soft g', 'soft g'] },
  { l: '-er = ɐ', c: ['yes', 'yes', 'less common'] },
];
const COLS14 = [320, 420, 535];
function CellMark({ v, x, y, o = 1, f = C.caramel }: { v: Cell; x: number; y: number; o?: number; f?: string }) {
  if (v === 'yes') return <Tick x={x} y={y} o={o} f={f} />;
  if (v === 'no') return <T x={x} y={y + 5} s={16} f={C.taupe} a="middle" o={o}>-</T>;
  return <T x={x} y={y + 5} s={13} f={C.latte} a="middle" o={o}>{v}</T>;
}
export function Varieties({ t }: StepCtx) {
  return (
    <Svg label="Four rules across the standards of Germany, Austria and Switzerland" h={480}>
      <g opacity={fade(t, 0, 0.6)}>
        <T x={COLS14[0]} y={40} s={13} f={C.crema} a="middle">Germany</T>
        <T x={COLS14[0]} y={58} s={13} f={C.taupe} a="middle">(north)</T>
        <T x={COLS14[1]} y={40} s={13} f={C.crema} a="middle">Austria</T>
        <T x={COLS14[2]} y={40} s={13} f={C.crema} a="middle">Switzerland</T>
      </g>
      {GRID14.map((r, i) => {
        const t0 = 0.6 + i * 0.8;
        const y = 120 + i * 70;
        return (
          <g key={i}>
            <Tx x={20} y={y + 6} s={18} o={fade(t, t0, t0 + 0.3)}>{r.l}</Tx>
            {r.c.map((v, j) => (
              <CellMark key={j} v={v} x={COLS14[j]} y={y} o={fade(t, t0 + 0.2 + j * 0.15, t0 + 0.5 + j * 0.15)} />
            ))}
            <Line x1={20} y1={y + 34} x2={580} y2={y + 34} f={C.cocoa} w={1.5} o={fade(t, t0, t0 + 0.3)} />
          </g>
        );
      })}
      <g opacity={fade(t, 4, 4.4)}>
        <T x={300} y={426} s={13} f={C.latte} a="middle">all three are standard German</T>
        <T x={300} y={448} s={13} f={C.taupe} a="middle">this reel models the dictionary standard</T>
      </g>
    </Svg>
  );
}

// ── 15 · Back to the viewing ───────────────────────────────────────────────
type Tok = { s: string; k?: number; f?: string };
const Q_TOKS: Tok[] = [
  { s: 'ʔ', k: 5 }, { s: 'ɪ', k: 0, f: C.cinnamon }, { s: 'st diː ˈk' }, { s: 'ʏ', k: 1 }, { s: 'ç', k: 2 }, { s: 'ə ' }, { s: 'ʔ', k: 5 },
  { s: 'ɪ', k: 0, f: C.cinnamon }, { s: 'n deː' }, { s: 'ɐ', k: 3 }, { s: ' ˈm' }, { s: 'iː', k: 0 }, { s: 'tə ' }, { s: 'ʔ', k: 5 }, { s: 'ɛntˈhaltən' },
];
const A_TOKS: Tok[] = [
  { s: 'ˈ' }, { s: 'ʁ', k: 3 }, { s: 'ɪ' }, { s: 'ç', k: 2 }, { s: 'tɪ' }, { s: 'ç', k: 2 }, { s: ' | das baː' }, { s: 't', k: 4 }, { s: ' ' },
  { s: 'ʔ', k: 5 }, { s: 'ʊn' }, { s: 't', k: 4 }, { s: ' deː' }, { s: 'ɐ', k: 3 }, { s: ' ˈkɛl' }, { s: 'ɐ', k: 3 }, { s: ' ' }, { s: 'ʔ', k: 5 }, { s: 'aʊ' }, { s: 'x', k: 6, f: C.cinnamon },
];
const FEAT = ['long and short', 'ü: round lips', 'front ch', 'r as consonant and as vowel', 'voice lost at the end', 'the catch', 'back ch'];
export function Viewing({ t }: StepCtx) {
  const step = 0.6;
  const t0 = 1.8;
  const shown = (k?: number) => k !== undefined && t >= t0 + k * step;
  const cur = Math.min(6, Math.max(0, Math.floor((t - t0) / step)));
  const done = t >= t0 + 7 * step;
  const tok = (list: Tok[]) =>
    list.map((x, i) =>
      x.k !== undefined && shown(x.k) ? (
        <tspan key={i} fill={x.f ?? C.caramel} fontWeight={700}>{x.s}</tspan>
      ) : (
        <tspan key={i} fill={C.latte}>{x.s}</tspan>
      ),
    );
  return (
    <Svg label="The opening question and answer, sound by sound, with each of the six rules lit in turn" h={380}>
      <T x={300} y={30} s={13} f={C.taupe} a="middle">YOU ASK</T>
      <Tx x={300} y={64} s={20} a="middle" o={fade(t, 0, 0.8)}>„Ist die Küche in der Miete enthalten?“</Tx>
      <Tx x={300} y={96} s={16} a="middle" o={fade(t, 0.8, 1.6)}>{tok(Q_TOKS)}</Tx>
      <T x={300} y={156} s={13} f={C.taupe} a="middle">SHE ANSWERS</T>
      <Tx x={300} y={190} s={20} a="middle" o={fade(t, 0.8, 1.6)}>„Richtig. Das Bad und der Keller auch.“</Tx>
      <Tx x={300} y={222} s={16} a="middle" o={fade(t, 0.8, 1.6)}>{tok(A_TOKS)}</Tx>
      {!done && t >= t0 && <T x={300} y={290} s={15} f={C.caramel} a="middle">{FEAT[cur]}</T>}
      <g opacity={fade(t, t0 + 7 * step, t0 + 7 * step + 0.6)}>
        <T x={300} y={290} s={14} f={C.caramel} a="middle">length · umlaut · ch · r · devoicing · catch</T>
        <T x={300} y={318} s={13} f={C.taupe} a="middle">citation forms; die and der often weaken in fast speech</T>
      </g>
    </Svg>
  );
}

// ── 16 · In one breath ─────────────────────────────────────────────────────
const CARDS: { l: string; e: Part[] }[] = [
  { l: 'length', e: ['Miete ', ['iː', C.caramel], ' · Mitte ', ['ɪ', C.cinnamon]] },
  { l: 'umlaut', e: [['ü', C.caramel], ' = i’s tongue + round lips'] },
  { l: 'ch', e: ['ich ', ['ç', C.caramel], ' · ach ', ['x', C.cinnamon], ' · -chen ', ['ç', C.caramel]] },
  { l: 'r', e: ['rot ', ['ʁ', C.caramel], ' · der ', ['ɐ', C.cinnamon], ' · Lehrer ', ['ɐ', C.cinnamon]] },
  { l: 'devoicing', e: ['Rad = Rat ', ['ʁaːt', C.caramel]] },
  { l: 'catch', e: ['mein ', ['|', C.caramel], ' Auto'] },
];
export function Recap({ t }: StepCtx) {
  return (
    <Svg label="The six rules of the German sound system, one line each" h={520}>
      {CARDS.map((c, i) => {
        const o = fade(t, i * 0.5, i * 0.5 + 0.4);
        const y = 52 + i * 82;
        return (
          <g key={i} opacity={o} transform={`translate(${(1 - o) * 14} 0)`}>
            <rect x={24} y={y - 30} width={4} height={52} rx={2} fill={i % 2 ? C.cinnamon : C.caramel} />
            <T x={44} y={y - 10} s={13} f={C.taupe}>{c.l}</T>
            <Tx x={44} y={y + 16} s={19}><Parts parts={c.e} /></Tx>
          </g>
        );
      })}
    </Svg>
  );
}

// ── 17 · Prove it 1 ────────────────────────────────────────────────────────
export function ProveHund({ t, answer }: StepCtx) {
  const full = answer !== null;
  const a = fade(t, 0, 0.8);
  const P = 36;
  const X1 = 14, X2 = 300;
  const q = (s: string, from: number[], f?: string): Snd => ({ s: full ? s : '?', from, f: f ?? (full ? undefined : C.caramel), dashed: !full });
  return (
    <Svg label="Hund is hʊnt; how is Hündchen pronounced?" h={240}>
      <g opacity={a}>
        <T x={X1} y={22} s={14} f={C.latte}>dog</T>
        <Strip x0={X1} y={66} pitch={P} letters={['H', 'u', 'n', 'd']} sounds={[{ s: 'h', from: [0] }, { s: 'ʊ', from: [1] }, { s: 'n', from: [2] }, { s: 't', from: [3], f: C.caramel }]} />
        <T x={X2} y={22} s={14} f={C.latte}>little dog</T>
        <Strip
          x0={X2} y={66} pitch={P} letters={['H', 'ü', 'n', 'd', 'c', 'h', 'e', 'n']}
          lcol={(i) => (i >= 4 ? C.caramel : undefined)}
          sounds={[{ s: 'h', from: [0] }, q('ʏ', [1], C.caramel), q('n', [2]), q('t', [3], C.caramel), q('ç', [4, 5], C.caramel), q('ə', [6]), q('n', [7])]}
        />
        <Line x1={X2 + P * 4} y1={38} x2={X2 + P * 4} y2={144} f={C.caramel} w={2} dash="4 4" />
        {full && <VoiceTrack cx={X2 + P * 3.5} y={146} voiced={false} f={C.caramel} />}
      </g>
      {full && <T x={300} y={212} s={13} f={C.taupe} a="middle">fast speech: the weak e often drops</T>}
    </Svg>
  );
}

// ── 18 · Prove it 2 ────────────────────────────────────────────────────────
const MINI: { l: string; c: Cell[] }[] = [
  { l: 'Rad = ʁaːt', c: ['yes', 'no', 'no'] },
  { l: 'mein | Auto', c: ['yes', 'no', 'no'] },
];
export function ProveVienna({ t, answer }: StepCtx) {
  const ans = answer !== null;
  const a = fade(t, 0, 0.8);
  return (
    <Svg label="A colleague from Vienna says Rad with a soft d and runs mein Auto together: are these mistakes?" h={290}>
      <g opacity={a}>
        <T x={14} y={20} s={13} f={C.taupe}>a colleague from Vienna says</T>
        <rect x={14} y={32} width={270} height={48} rx={14} fill="none" stroke={C.mocha} strokeWidth={2} />
        <Tx x={30} y={64} s={18} f={C.latte}>Rad: soft d</Tx>
        <rect x={304} y={32} width={282} height={48} rx={14} fill="none" stroke={C.mocha} strokeWidth={2} />
        <Tx x={320} y={64} s={18} f={C.latte}>mein Auto: no catch</Tx>
        <T x={340} y={118} s={13} f={C.crema} a="middle" o={0.5}>Germany</T>
        <T x={440} y={118} s={13} f={C.crema} a="middle">Austria</T>
        <T x={540} y={118} s={13} f={C.crema} a="middle" o={0.5}>Switzerland</T>
        {MINI.map((r, i) => {
          const y = 168 + i * 50;
          return (
            <g key={i}>
              <Tx x={14} y={y + 6} s={16} f={C.latte}>{r.l}</Tx>
              {r.c.map((v, j) => (
                <CellMark key={j} v={v} x={[340, 440, 540][j]} y={y} o={j === 1 ? 1 : 0.5} />
              ))}
            </g>
          );
        })}
        {ans && <rect x={400} y={130} width={80} height={102} rx={12} fill="none" stroke={C.caramel} strokeWidth={3} />}
      </g>
      {ans && <T x={300} y={268} s={14} f={C.caramel} a="middle">neither rule belongs to Austrian standard German</T>}
    </Svg>
  );
}
