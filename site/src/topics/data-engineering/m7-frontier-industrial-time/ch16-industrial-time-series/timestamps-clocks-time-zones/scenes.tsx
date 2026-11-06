import { useEffect, useState } from 'react';
import { C, Draw, Svg, T } from '../../../../../reels/kit';
import { easeInOut, easeOut, easeOutBack, lerp, seg } from '../../../../../reels/anim';
import type { StepCtx } from '../../../../../reels/types';

// Timestamps, clocks and time zones: hour cells folding at the spring change, three clock lanes, an NTP step on the
// sensor's tape, UTC rendered local one way, tz-generated night lengths, an event-time band, and a year of nights.

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

// 1 · The night shift as eight hour cells from 22:00. At 02:00 the clock jumps to 03:00 and that cell folds away in red,
// leaving seven. The report divides by eight anyway, and its output figure climbs past the 100% line to 114.29%.
const HOURS = ['22', '23', '00', '01', '02', '03', '04', '05'];
export function Hook({ t }: StepCtx) {
  const fold = easeInOut(seg(t, 1.4, 2.2));
  const pct = easeOut(seg(t, 2.8, 3.8));
  const v = lerp(0, 114.29, pct);
  const gx = (p: number) => 60 + p * 4;
  return (
    <Svg label="a plant's night shift reads above full output on the last Sunday of March; the shift calendar assumes a fixed length and the clocks went forward that night" h={200}>
      {HOURS.map((h, i) => {
        const k = easeOut(seg(t, 0.1 + i * 0.1, 0.4 + i * 0.1));
        const gone = i === 4;
        const w = gone ? 56 * (1 - fold) : 56;
        const x = 60 + i * 60 - (i > 4 ? 60 * fold : 0);
        return k <= 0 || w <= 0.5 ? null : (
          <g key={h} opacity={k}>
            <rect x={x} y={30} width={w} height={34} rx={3} fill={gone && fold > 0 ? C.bad : C.band} stroke={gone && fold > 0 ? C.badText : C.line} />
            {(!gone || fold < 0.4) && (
              <T x={x + w / 2} y={52} s={13} f={C.primary} a="middle">
                {`${h}:00`}
              </T>
            )}
          </g>
        );
      })}
      <T x={300} y={86} s={13} f={C.badText} a="middle" o={easeOut(seg(t, 1.6, 2.0))}>
        02:00 → 03:00, clocks forward
      </T>
      <g opacity={easeOut(seg(t, 2.4, 2.8))}>
        <rect x={60} y={120} width={480} height={16} fill={C.band} />
        <rect x={60} y={120} width={gx(Math.min(v, 100)) - 60} height={16} fill={C.primary} />
        {v > 100 && <rect x={gx(100)} y={120} width={gx(v) - gx(100)} height={16} fill={C.badText} />}
        <line x1={gx(100)} y1={112} x2={gx(100)} y2={144} stroke={C.focus} strokeWidth={2} />
        <T x={gx(100)} y={160} s={12} f={C.focus} a="middle">
          full output
        </T>
        <T x={575} y={110} s={15} f={v > 100 ? C.badText : C.primary} a="end">
          {`${v.toFixed(2)}%`}
        </T>
      </g>
      <T x={300} y={192} s={14} f={C.focus} a="middle" o={easeOut(seg(t, 4.2, 4.7))}>
        it ran short, not fast
      </T>
    </Svg>
  );
}

// 2 · One event (a star). Three lanes catch it in turn: device at +0 ms, gateway at +180 ms, ingest at +420 ms, each
// with what its clock is good for.
const cx = (ms: number) => 210 + ms * 0.74;
const CLOCKS: [string, string, number][] = [
  ['device', 'nearest truth', 0],
  ['gateway', 'plant clock', 180],
  ['ingest', 'when heard', 420],
];
export function RevealThreeClocks({ t }: StepCtx) {
  return (
    <Svg label="a reading's device, gateway and ingest timestamps, each landing later than the last — device closest to the truth, ingest steady but late" h={220}>
      <path d={`M${cx(0)} 10 l3 6 6 1 -5 4 1 6 -5 -3 -5 3 1 -6 -5 -4 6 -1 z`} fill={C.focus} opacity={easeOutBack(seg(t, 0.2, 0.5))} />
      <line x1={cx(0)} y1={26} x2={cx(0)} y2={196} stroke={C.focus} strokeDasharray="2 4" opacity={easeOut(seg(t, 0.4, 0.7)) * 0.6} />
      {CLOCKS.map(([l, note, ms], i) => {
        const y = 60 + i * 56;
        const k = easeOut(seg(t, 0.6 + i * 0.9, 1.2 + i * 0.9));
        const tick = easeOutBack(seg(t, 1.0 + i * 0.9, 1.4 + i * 0.9));
        return (
          <g key={l} opacity={Math.min(1, k * 1.5)}>
            <T x={30} y={y + 5} s={14} f={C.primary}>
              {l}
            </T>
            <T x={30} y={y + 23} s={12} f={C.quiet}>
              {note}
            </T>
            <line x1={cx(0)} y1={y} x2={lerp(cx(0), 575, k)} y2={y} stroke={C.line} strokeWidth={1.2} />
            {tick > 0 && <circle cx={cx(ms)} cy={y} r={6 * Math.min(1.2, tick)} fill={i === 0 ? C.focus : i === 1 ? C.primary : C.secondary} />}
            <T x={cx(ms)} y={y - 12} s={13} f={C.secondary} a="middle" o={tick > 0 ? 1 : 0}>
              {`+${ms} ms`}
            </T>
          </g>
        );
      })}
    </Svg>
  );
}

// 3 · The sensor's own clock as a tape from :06 to :11. Reading A lands at :09.000. One second later the clock is
// yanked back 2.5 s. Before the answer B is a "?"; after it, B lands at :07.500 — left of A, in red.
const dx = (sec: number) => 60 + (sec - 6) * 96;
export function PredictStep({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const on = answer !== null;
  const yank = easeInOut(seg(t, 1.4, 2.2));
  const land = on ? easeOutBack(seg(s, 0.2, 0.7)) : 0;
  return (
    <Svg label="a sensor's clock is corrected backwards between two readings taken seconds apart — does the second reading's device timestamp still come after the first's?" h={200}>
      <g opacity={easeOut(seg(t, 0, 0.3))}>
        <line x1={60} y1={110} x2={540} y2={110} stroke={C.line} strokeWidth={1.2} />
        {[6, 7, 8, 9, 10, 11].map((sec) => (
          <g key={sec}>
            <line x1={dx(sec)} y1={106} x2={dx(sec)} y2={114} stroke={C.line} />
            <T x={dx(sec)} y={132} s={12} f={C.quiet} a="middle">
              {`:${String(sec).padStart(2, '0')}`}
            </T>
          </g>
        ))}
        <T x={30} y={30} s={13} f={C.secondary}>
          sensor clock
        </T>
      </g>
      <circle cx={dx(9)} cy={110} r={7} fill={C.focus} opacity={easeOutBack(seg(t, 0.4, 0.8))} />
      <T x={dx(9)} y={92} s={13} f={C.focus} a="middle" o={easeOut(seg(t, 0.6, 0.9))}>
        A
      </T>
      {yank > 0 && (
        <g>
          <path d={`M${dx(10)} 64 L${lerp(dx(10), dx(7.5), yank)} 64`} stroke={C.badText} strokeWidth={2} />
          <path d={`M${lerp(dx(10), dx(7.5), yank)} 64 l8 -5 v10 z`} fill={C.badText} />
          <T x={dx(8.75)} y={52} s={13} f={C.badText} a="middle" o={yank}>
            NTP step −2.5 s
          </T>
        </g>
      )}
      {!on ? (
        <T x={dx(10)} y={116} s={18} f={C.secondary} a="middle" o={easeOut(seg(t, 2.6, 3.0))}>
          B?
        </T>
      ) : (
        <g>
          <circle cx={dx(7.5)} cy={110} r={7 * Math.min(1.2, land)} fill={C.badText} />
          <T x={dx(7.5)} y={92} s={13} f={C.badText} a="middle" o={Math.min(1, land)}>
            B
          </T>
          <T x={300} y={180} s={14} f={C.badText} a="middle" o={easeOut(seg(s, 0.8, 1.2))}>
            B stamped before A
          </T>
        </g>
      )}
    </Svg>
  );
}

// 4 · The three clocks for readings A and B, side by side. Each row's B lands and an arrow says which way it went:
// device goes back (✕), gateway and ingest go forward (✓).
const ROWS: [string, string, string, boolean][] = [
  ['device', '09.000', '07.500', false],
  ['gateway', '09.180', '10.180', true],
  ['ingest', '09.420', '10.420', true],
];
export function RevealStepMeasured({ t }: StepCtx) {
  return (
    <Svg label="after an NTP correction lands between two readings taken a second apart, the second's device timestamp comes before the first's, while gateway and ingest still increase" h={200}>
      <g opacity={easeOut(seg(t, 0, 0.3))}>
        <T x={290} y={30} s={13} f={C.quiet} a="end">
          A (12:00:…)
        </T>
        <T x={460} y={30} s={13} f={C.quiet} a="end">
          B
        </T>
      </g>
      {ROWS.map(([l, a, b, ok], i) => {
        const y = 74 + i * 46;
        const ka = easeOut(seg(t, 0.3 + i * 0.3, 0.6 + i * 0.3));
        const kb = easeOut(seg(t, 1.6 + i * 0.6, 2.0 + i * 0.6));
        const verdict = seg(t, 2.0 + i * 0.6, 2.4 + i * 0.6);
        return (
          <g key={l}>
            <T x={30} y={y} s={14} f={C.primary} o={ka}>
              {l}
            </T>
            <T x={290} y={y} s={15} f={C.primary} a="end" o={ka}>
              {a}
            </T>
            <T x={460} y={y} s={15} f={ok ? C.primary : C.badText} a="end" o={kb}>
              {b}
            </T>
            {verdict > 0 && <path d={ok ? `M320 ${y - 5} h${60 * verdict}` : `M380 ${y - 5} h${-60 * verdict}`} stroke={ok ? C.secondary : C.badText} strokeWidth={1.6} />}
            {ok ? <Tick x={540} y={y - 5} k={easeOut(verdict)} /> : <Cross x={540} y={y - 5} k={easeOutBack(verdict)} />}
          </g>
        );
      })}
    </Svg>
  );
}

// 5 · The stored record: 21:30Z plus its zone as a separate field. A render arrow produces 23:30 +02:00 on demand. The
// reverse — a bare local 23:30 back to UTC — is drawn dashed and crossed out: the path only runs one way.
export function RevealUtcLocal({ t }: StepCtx) {
  const out = seg(t, 1.2, 2.0);
  return (
    <Svg label="one instant stored once in UTC with its zone kept separately, rendered back into the plant's own local time and offset on demand" h={200}>
      <g opacity={easeOut(seg(t, 0, 0.4))}>
        <T x={30} y={24} s={13} f={C.secondary}>
          stored once
        </T>
        <rect x={30} y={34} width={220} height={60} rx={5} fill={C.panel} stroke={C.focus} />
        <T x={44} y={58} s={14} f={C.focus}>
          21:30Z
        </T>
        <T x={44} y={82} s={13} f={C.secondary}>
          zone: Europe/Berlin
        </T>
      </g>
      <Draw
        pts={[
          [252, 64],
          [350, 64],
        ]}
        t={t}
        from={1.0}
        to={1.6}
        stroke={C.focus}
        w={1.8}
      />
      <T x={300} y={54} s={12} f={C.quiet} a="middle" o={easeOut(seg(t, 1.0, 1.4))}>
        render
      </T>
      <g opacity={easeOut(out)}>
        <rect x={352} y={34} width={220} height={60} rx={5} fill={C.panel} stroke={C.line} />
        <T x={366} y={58} s={14} f={C.primary}>
          23:30 +02:00
        </T>
        <T x={366} y={82} s={13} f={C.secondary}>
          Munich, local
        </T>
      </g>
      <g opacity={easeOut(seg(t, 2.6, 3.0))}>
        <rect x={352} y={124} width={110} height={34} rx={5} fill={C.panel} stroke={C.line} strokeDasharray="4 3" />
        <T x={407} y={146} s={14} f={C.secondary} a="middle">
          23:30
        </T>
        <path d="M352 141 C 300 141, 200 141, 140 98" fill="none" stroke={C.badText} strokeDasharray="5 3" strokeWidth={1.4} />
        <T x={474} y={146} s={12} f={C.quiet}>
          bare local
        </T>
      </g>
      <Cross x={246} y={137} k={easeOutBack(seg(t, 3.2, 3.6))} />
      <T x={30} y={190} s={13} f={C.badText} o={easeOut(seg(t, 3.5, 3.9))}>
        no way back: which offset?
      </T>
    </Svg>
  );
}

// 6 · A "tz database" chip emits three nights of 22:00–06:00, each drawn at its true UTC length: 15 June 8 h, 28 March
// 7 h (one hour folds away), 24 October 9 h (one hour added, pale blue).
const NIGHTS: [string, number][] = [
  ['15 Jun', 8],
  ['28 Mar', 7],
  ['24 Oct', 9],
];
export function RevealGeneratedCalendar({ t }: StepCtx) {
  return (
    <Svg label="a shift calendar generated from the tz database for a given zone and date, giving an ordinary night one length and the two clock-change nights a shorter and a longer one" h={220}>
      <Box x={30} y={14} w={190} h={30} label="tz database" lit o={easeOutBack(seg(t, 0, 0.4))} />
      <T x={240} y={34} s={13} f={C.secondary} o={easeOut(seg(t, 0.3, 0.6))}>
        Berlin, 22:00 to 06:00
      </T>
      {NIGHTS.map(([d, h], i) => {
        const y = 74 + i * 48;
        const k = easeInOut(seg(t, 0.8 + i * 0.8, 1.6 + i * 0.8));
        const w = h * 40 * k;
        return (
          <g key={d} opacity={Math.min(1, k * 3)}>
            <T x={30} y={y + 16} s={14} f={C.primary}>
              {d}
            </T>
            <rect x={130} y={y} width={Math.min(w, 320)} height={22} fill={C.primary} />
            {h === 9 && w > 320 && <rect x={450} y={y} width={w - 320} height={22} fill={C.second} />}
            {h === 7 && k >= 1 && <rect x={410} y={y} width={40} height={22} fill="none" stroke={C.badText} strokeDasharray="4 3" />}
            <T x={575} y={y + 16} s={15} f={h === 8 ? C.primary : h === 7 ? C.badText : C.second} a="end" o={easeOut(seg(t, 1.4 + i * 0.8, 1.8 + i * 0.8))}>
              {`${h} h`}
            </T>
          </g>
        );
      })}
    </Svg>
  );
}

// 7 · A fraction: output over hours. The denominator first reads the fixed 8 h and the result swings past 100% to
// 114.29% (red). Then the generated 7 h drops in and it settles at 100%. A tag links it to the shift-boundary bug.
export function RevealSameBug({ t }: StepCtx) {
  const wrong = easeOut(seg(t, 0.8, 1.8));
  const fix = easeInOut(seg(t, 2.6, 3.4));
  const v = fix > 0 ? lerp(114.29, 100, fix) : 114.29 * wrong;
  const gx = (p: number) => 60 + p * 4;
  return (
    <Svg
      label="dividing the real output by a hard-coded shift length, on the night the shift actually ran short, gives a result above full output — the shift-boundary bug again, caused by a clock change"
      h={200}
    >
      <g opacity={easeOut(seg(t, 0, 0.4))}>
        <T x={30} y={34} s={14} f={C.secondary}>
          8 h of output ÷
        </T>
        <T x={250} y={34} s={15} f={fix > 0.5 ? C.focus : C.badText}>
          {fix > 0.5 ? '7 h, generated' : '8 h, hard-coded'}
        </T>
      </g>
      <g opacity={easeOut(seg(t, 0.6, 0.9))}>
        <rect x={60} y={70} width={480} height={18} fill={C.band} />
        <rect x={60} y={70} width={gx(Math.min(v, 100)) - 60} height={18} fill={C.primary} />
        {v > 100 && <rect x={gx(100)} y={70} width={gx(v) - gx(100)} height={18} fill={C.badText} />}
        <line x1={gx(100)} y1={62} x2={gx(100)} y2={96} stroke={C.focus} strokeWidth={2} />
        <T x={575} y={118} s={16} f={v > 100.01 ? C.badText : C.focus} a="end">
          {fix > 0 ? (fix > 0.5 ? '100.00%' : '114.29%') : `${v.toFixed(2)}%`}
        </T>
      </g>
      <Tick x={420} y={112} k={easeOut(seg(t, 3.4, 3.8))} />
      <g opacity={easeOut(seg(t, 3.8, 4.3))}>
        <rect x={30} y={146} width={540} height={36} rx={5} fill="none" stroke={C.line} strokeDasharray="4 3" />
        <T x={300} y={169} s={13} f={C.secondary} a="middle">
          the shift-boundary bug, again
        </T>
      </g>
    </Svg>
  );
}

// 8 · Two readings go through the rule. A ±500 ms band sits around each gateway time. The disciplined device lands
// 180 ms off — inside, so t_device; the drifted one lands 4 s off — outside, so t_gateway. Each choice is written into
// an event_source column.
const ex = (ms: number) => 340 + Math.sign(ms) * Math.sqrt(Math.abs(ms)) * 3;
export function RevealEventTime({ t }: StepCtx) {
  const rows: [string, number, string][] = [
    ['disciplined', -180, 't_device'],
    ['drifted', -4000, 't_gateway'],
  ];
  return (
    <Svg label="a per-signal rule chooses device clock when disciplined and close enough, otherwise gateway; the chosen source is written down as its own column" h={200}>
      <T x={340} y={22} s={12} f={C.quiet} a="middle" o={easeOut(seg(t, 0, 0.3))}>
        gateway ± 500 ms
      </T>
      <T x={575} y={22} s={12} f={C.secondary} a="end" o={easeOut(seg(t, 2.6, 3.0))}>
        event_source
      </T>
      {rows.map(([l, off, src], i) => {
        const y = 66 + i * 64;
        const land = easeOutBack(seg(t, 0.8 + i * 1.0, 1.3 + i * 1.0));
        const inside = Math.abs(off) <= 500;
        const pick = easeOut(seg(t, 2.6 + i * 0.5, 3.0 + i * 0.5));
        return (
          <g key={l} opacity={easeOut(seg(t, 0.2 + i * 0.3, 0.5 + i * 0.3))}>
            <T x={30} y={y + 5} s={14} f={C.primary}>
              {l}
            </T>
            <rect x={ex(-500)} y={y - 12} width={ex(500) - ex(-500)} height={24} fill={C.band} />
            <line x1={ex(0)} y1={y - 14} x2={ex(0)} y2={y + 14} stroke={C.primary} strokeWidth={2} />
            {land > 0 && <circle cx={ex(off)} cy={y} r={6 * Math.min(1.2, land)} fill={inside ? C.focus : C.badText} />}
            <T x={ex(off)} y={y + 28} s={12} f={inside ? C.secondary : C.badText} a="middle" o={Math.min(1, land)}>
              {inside ? '−180 ms' : '−4 s'}
            </T>
            <rect x={455} y={y - 14} width={120} height={28} rx={3} fill={C.panel} stroke={pick > 0.5 ? C.focus : C.line} opacity={pick} />
            <T x={515} y={y + 5} s={13} f={inside ? C.focus : C.primary} a="middle" o={pick}>
              {src}
            </T>
          </g>
        );
      })}
    </Svg>
  );
}

// 9 · Five rows, each with a glyph of its picture, one per beat.
const GLYPH = [
  (k: number) => (
    <g>
      {[0, 1, 2].map((i) => (
        <circle key={i} cx={lerp(40, 40 + i * 28, k)} cy={-4} r={4} fill={i === 0 ? C.focus : i === 1 ? C.primary : C.secondary} />
      ))}
    </g>
  ),
  (k: number) => (
    <g>
      <circle cx={80} cy={-4} r={4} fill={C.focus} />
      <circle cx={lerp(96, 50, k)} cy={-4} r={4} fill={C.badText} />
    </g>
  ),
  (k: number) => (
    <g>
      <rect x={30} y={-12} width={34} height={16} rx={2} fill="none" stroke={C.focus} />
      <path d={`M66 -4 h${20 * k}`} stroke={C.focus} strokeWidth={1.6} />
      <rect x={88} y={-12} width={18} height={16} rx={2} fill="none" stroke={C.line} opacity={k} />
    </g>
  ),
  (k: number) => (
    <g>
      <rect x={30} y={-14} width={56} height={6} fill={C.primary} />
      <rect x={30} y={-6} width={49 * k} height={6} fill={C.badText} />
      <rect x={30} y={2} width={63 * k} height={6} fill={C.second} />
    </g>
  ),
  (k: number) => (
    <g>
      <rect x={30} y={-12} width={76} height={16} rx={2} fill="none" stroke={C.line} />
      <rect x={70} y={-12} width={36} height={16} rx={2} fill={C.band} stroke={C.focus} opacity={k} />
    </g>
  ),
];
export function Recap({ t }: StepCtx) {
  const rows = ['three clocks, three questions', 'a backwards step breaks order', 'store UTC, render local', 'generate the calendar', 'record which clock counted'];
  return (
    <Svg label="three clocks each good for something different, a backwards step, UTC storage rendered local, a generated calendar, and a recorded event-time decision" h={260}>
      {rows.map((r, i) => {
        const a = 0.2 + i * 0.95;
        const o = easeOut(seg(t, a, a + 0.4));
        const k = easeOut(seg(t, a + 0.2, a + 0.8));
        return o <= 0 ? null : (
          <g key={r} opacity={o} transform={`translate(${lerp(-12, 0, o)} ${44 + i * 46})`}>
            {GLYPH[i](k)}
            <T x={130} y={0} s={14} f={C.primary}>
              {r}
            </T>
          </g>
        );
      })}
    </Svg>
  );
}

// 10 · A year of nights as 365 thin bars, every one the same height. The two clock-change nights (28 Mar, 24 Oct) get
// flagged. After the answer, their true heights rise and sink beside the reported ones: 7 h and 9 h against a flat 8.
const yx = (d: number) => 40 + d * (520 / 365);
const SPRING = 86;
const FALL = 296;
export function ProveIt({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const on = answer !== null;
  const draw = easeOut(seg(t, 0.2, 1.4));
  const truth = on ? easeOut(seg(s, 0.2, 0.9)) : 0;
  const h = (hrs: number) => hrs * 10;
  return (
    <Svg label="a plant reports its night shift ran exactly the same length every day of the year, including both clock-change nights — is that shift table trustworthy?" h={200}>
      {Array.from({ length: Math.floor(365 * draw) }, (_, d) => (
        <rect key={d} x={yx(d)} y={140 - h(8)} width={1} height={h(8)} fill={d === SPRING || d === FALL ? C.focus : C.line} />
      ))}
      <T x={40} y={40} s={13} f={C.secondary} o={easeOut(seg(t, 0.4, 0.8))}>
        reported: 8 h, every night
      </T>
      {[SPRING, FALL].map((d, i) => (
        <g key={d} opacity={easeOut(seg(t, 1.8 + i * 0.3, 2.2 + i * 0.3))}>
          <T x={yx(d)} y={164} s={12} f={C.focus} a="middle">
            {i === 0 ? '28 Mar' : '24 Oct'}
          </T>
          {truth > 0 && <rect x={yx(d) + 4} y={140 - h(lerp(8, i === 0 ? 7 : 9, truth))} width={8} height={h(lerp(8, i === 0 ? 7 : 9, truth))} fill={i === 0 ? C.badText : C.second} />}
          {truth > 0 && (
            <T x={yx(d) + 18} y={140 - h(i === 0 ? 7 : 9) + 4} s={12} f={i === 0 ? C.badText : C.second} o={truth}>
              {i === 0 ? '7 h' : '9 h'}
            </T>
          )}
        </g>
      ))}
      {on ? (
        <T x={300} y={192} s={13} f={C.badText} a="middle" o={easeOut(seg(s, 0.9, 1.3))}>
          identical means never checked
        </T>
      ) : (
        <T x={300} y={192} s={14} f={C.secondary} a="middle" o={easeOut(seg(t, 2.6, 3.0))}>
          consistent, or fixed?
        </T>
      )}
    </Svg>
  );
}
