import type { StepCtx } from '../../../../../reels/types';
import { Code } from '../../../../../reels/Code';
import { clamp, easeInOut, easeOut, lerp, seg } from '../../../../../reels/anim';
import { Decode, Draw, Reticle, Stack, Svg, T, C } from '../../../../../reels/kit';

// Whether a real dependency version is actually vulnerable is a real,
// published, continuously updated fact, not something a project can
// determine by guessing or by how recently it was last updated.
const fa = (t: number, a: number, d = 0.4) => easeOut(seg(t, a, a + d));

// One mono character at s=13 in canvas units; text scales by 1.22 in portrait (global.css), so underlines follow it.
const cw13 = (portrait: boolean) => 8.2 * (portrait ? 1.22 : 1);

// A point k of the way along a polyline, by length: for a value travelling through a structure.
const along = (pts: [number, number][], k: number): [number, number] => {
  const lens = [0];
  for (let i = 1; i < pts.length; i++) lens.push(lens[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
  const goal = clamp(k) * lens[lens.length - 1];
  for (let i = 1; i < pts.length; i++) {
    if (goal <= lens[i]) {
      const f = (goal - lens[i - 1]) / Math.max(1e-9, lens[i] - lens[i - 1]);
      return [lerp(pts[i - 1][0], pts[i][0], f), lerp(pts[i - 1][1], pts[i][1], f)];
    }
  }
  return pts[pts.length - 1];
};

// A check mark that draws itself, for a recap point landing.
const Tick = ({ x, y, t, at, color = C.caramel }: { x: number; y: number; t: number; at: number; color?: string }) => (
  <Draw pts={[[x - 6, y], [x - 1, y + 5], [x + 8, y - 7]]} t={t} from={at} to={at + 0.3} stroke={color} w={2} />
);

// A recap point: slides in from the right and its check mark draws as it lands.
const Point = ({ y, text, t, at }: { y: number; text: string; t: number; at: number }) => {
  const k = easeOut(seg(t, at, at + 0.45));
  return (
    <g>
      <Tick x={30} y={y - 4} t={t} at={at + 0.25} />
      <g transform={`translate(${((1 - k) * 36).toFixed(1)} 0)`} opacity={k}>
        <T x={52} y={y} s={13} f={C.crema}>{text}</T>
      </g>
    </g>
  );
};

// A quoted source: the card slides in, its rule grows, the source name decodes, and a pen underlines the phrase that matters.
function Quote({ y, src, quote, mark, t, at, portrait }: { y: number; src: string; quote: string; mark: string; t: number; at: number; portrait: boolean }) {
  const k = easeOut(seg(t, at, at + 0.45));
  const cw = cw13(portrait);
  const i = Math.max(0, quote.indexOf(mark));
  const x0 = 50 + i * cw;
  const x1 = x0 + mark.length * cw;
  const lit = seg(t, at + 0.55, at + 0.95);
  return (
    <g transform={`translate(${((1 - k) * 48).toFixed(1)} 0)`} opacity={k}>
      <rect x={30} y={y} width={3} height={58 * k} fill={C.caramel} />
      <Decode text={src} t={t} at={at + 0.1} dur={0.5} x={50} y={y + 18} s={11} f={C.latte} />
      <T x={50} y={y + 42} s={13} f={C.crema}>
        {quote.slice(0, i)}
        <tspan fill={lit > 0.5 ? C.caramel : C.crema}>{mark}</tspan>
        {quote.slice(i + mark.length)}
      </T>
      <Draw pts={[[x0, y + 50], [x1, y + 50]]} t={t} from={at + 0.55} to={at + 0.95} stroke={C.caramel} w={2} />
    </g>
  );
}

// ── 1 · Does a real lookup catch an unconfigured dependency (predict) ──
export function LookupPredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="a real, pinned dependency, no special config"
        lines={['cargo audit // looks up every pinned version', '// does it catch one nobody told it to look for?']}
        t={t}
        start={0.1}
        end={2.6}
        highlight={[1]}
      />
    </Stack>
  );
}

// ── 2 · Measured: the real advisory is reported by its own real id ─────
export function LookupReveal({ t }: StepCtx) {
  const rows = ['the pinned version: a real, known advisory', 'reported by its own real id, unconfigured'];
  // The pinned entry in the lockfile is sent to the public database; a scan runs down its records, stops on the one
  // that names this exact pin, and the advisory comes back by its own id.
  const scan = easeInOut(seg(t, 0.6, 1.3));
  const hitY = 92;
  const scanY = lerp(44, hitY, scan);
  const matched = t >= 1.3;
  return (
    <Svg label="cargo audit, captured" h={226}>
      <g opacity={fa(t, 0, 0.25)}>
        <rect x={30} y={18} width={190} height={104} rx={6} fill="none" stroke={C.latte} strokeWidth={1.2} />
        <T x={44} y={36} s={11} f={C.latte}>Cargo.lock</T>
        <rect x={44} y={76} width={120} height={8} rx={2} fill={C.cocoa} />
        <rect x={44} y={98} width={90} height={8} rx={2} fill={C.cocoa} />
        <rect x={380} y={18} width={190} height={104} rx={6} fill="none" stroke={C.latte} strokeWidth={1.2} />
        <T x={394} y={36} s={11} f={C.latte}>RustSec database</T>
        {[0, 1, 2, 3].map((i) => (
          <rect key={i} x={394} y={44 + i * 16} width={150 - (i % 2) * 30} height={8} rx={2} fill={C.cocoa} />
        ))}
      </g>
      <T x={44} y={62} s={12} f={matched ? C.cherryText : C.crema} o={fa(t, 0, 0.25)}>smallvec</T>
      <Draw pts={[[150, 58], [380, 48]]} t={t} from={0.25} to={0.6} stroke={C.latte} w={1.5} />
      <rect x={390} y={scanY - 3} width={170} height={14} rx={2} fill="none" stroke={matched ? C.cherryText : C.caramel} strokeWidth={1.5} opacity={fa(t, 0.55, 0.1)} />
      <Draw pts={[[390, hitY + 4], [150, 64]]} t={t} from={1.35} to={1.7} stroke={C.cherryText} w={1.5} />
      <Decode text="RUSTSEC-2021-0003" t={t} at={1.65} dur={0.6} x={44} y={150} s={13} f={C.cherryText} />
      <Reticle x={96} y={57} w={120} h={26} t={t} at={2.3} color={C.cherryText} />
      {rows.map((r, i) => {
        const k = fa(t, 1.8 + i * 0.3, 0.4);
        return (
          <g key={r} transform={`translate(${((1 - k) * 36).toFixed(1)} 0)`} opacity={k}>
            <circle cx={30} cy={180 + i * 30} r={5} fill={C.caramel} />
            <T x={48} y={185 + i * 30} s={13} f={C.crema}>{r}</T>
          </g>
        );
      })}
    </Svg>
  );
}

// ── 3 · Does the next real release still get flagged (predict) ────────
export function PatchPredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="the very next real release, one version later"
        lines={['smallvec = "=1.6.1" // the advisory calls fixed', '// does the identical lookup still flag it?']}
        t={t}
        start={0.1}
        end={2.6}
        highlight={[1]}
      />
    </Stack>
  );
}

// ── 4 · Measured: the patched version reports clean ─────────────────────
export function PatchReveal({ t }: StepCtx) {
  const travel = easeOut(seg(t, 0.25, 0.6));
  return (
    <Svg label="cargo audit, captured" h={200}>
      <T x={30} y={25} s={11} f={C.latte} o={fa(t, 0.05, 0.2)}>the identical lookup, one version later</T>
      <T x={40} y={55} s={10} f={C.latte} o={fa(t, 0.15, 0.2)}>smallvec 1.6.1</T>
      <Draw pts={[[130, 55], [320, 55]]} t={t} from={0.25} to={0.6} stroke={C.caramel} w={2} pen />
      <circle cx={130 + travel * 190} cy={55} r={5} fill={C.caramel} opacity={fa(t, 0.25, 0.15)} />
      <g opacity={fa(t, 0.9, 0.3)}>
        <rect x={60} y={85} width={300} height={34} rx={6} fill="none" stroke={C.caramel} strokeWidth={2} />
        <T x={210} y={107} s={12} a="middle" f={C.mocha}>a real, clean result, nothing flagged</T>
      </g>
      <T x={60} y={150} s={12} f={C.latte} o={fa(t, 1.3, 0.3)}>the lookup tracks a version, not a reputation</T>
    </Svg>
  );
}

// ── 5 · Does the database tell versions apart (predict) ────────────────
export function ComparePredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="the identical crate, two real pinned versions"
        lines={['one flagged, one clean, side by side', '// does the database tell them apart, or just the crate?']}
        t={t}
        start={0.1}
        end={2.6}
        highlight={[1]}
      />
    </Stack>
  );
}

// ── 6 · Measured: only the real vulnerable version is caught ───────────
export function CompareReveal({ t }: StepCtx) {
  const travelA = easeOut(seg(t, 0.2, 0.5));
  const travelB = easeOut(seg(t, 0.35, 0.65));
  return (
    <Svg label="cargo audit, both lockfiles" h={210}>
      <T x={30} y={25} s={11} f={C.latte} o={fa(t, 0.05, 0.2)}>one crate, two real pinned versions</T>
      <T x={40} y={55} s={10} f={C.latte} o={fa(t, 0.1, 0.2)}>vulnerable version</T>
      <Draw pts={[[130, 55], [220, 55]]} t={t} from={0.2} to={0.5} stroke={C.cherry} w={2} pen />
      <circle cx={130 + travelA * 90} cy={55} r={5} fill="none" stroke={C.cherry} strokeWidth={1.5} opacity={fa(t, 0.2, 0.15)} />
      <circle cx={220} cy={55} r={7} fill="none" stroke={C.cherry} strokeWidth={1.5} opacity={fa(t, 0.5, 0.15)} />
      <T x={40} y={90} s={10} f={C.latte} o={fa(t, 0.25, 0.2)}>patched version</T>
      <Draw pts={[[130, 90], [320, 90]]} t={t} from={0.35} to={0.65} stroke={C.caramel} w={2} pen />
      <circle cx={130 + travelB * 190} cy={90} r={5} fill={C.caramel} opacity={fa(t, 0.35, 0.15)} />
      <g opacity={fa(t, 0.85, 0.3)}>
        <rect x={60} y={120} width={300} height={34} rx={6} fill="none" stroke={C.caramel} strokeWidth={2} />
        <T x={210} y={142} s={12} a="middle" f={C.mocha}>flagged: the real one. clean: the other</T>
      </g>
      <T x={60} y={185} s={12} f={C.latte} o={fa(t, 1.2, 0.3)}>a published fact, not a guess</T>
    </Svg>
  );
}

// ── 7 · RustSec's own words on the database and the tool (connecting) ─
export function DocsReveal({ t, portrait }: StepCtx) {
  // The record, then the tool, then the arrow that joins them: a lockfile checked against the shared list.
  return (
    <Svg label="RustSec, its own words" h={180}>
      <Quote y={14} src="rustsec.org" quote="a vulnerability database for the ecosystem" mark="vulnerability database" t={t} at={0.1} portrait={portrait} />
      <Quote y={98} src="cargo-audit" quote="checks a lockfile against it" mark="against it" t={t} at={0.9} portrait={portrait} />
      <Draw pts={[[560, 128], [580, 128], [580, 44], [566, 44]]} t={t} from={1.9} to={2.4} stroke={C.caramel} w={1.5} />
      <Draw pts={[[572, 38], [565, 44], [572, 50]]} t={t} from={2.4} to={2.55} stroke={C.caramel} w={1.5} pen={false} />
    </Svg>
  );
}

// ── 8 · Recap ─────────────────────────────────────────────────────────────
export function Recap({ t }: StepCtx) {
  const rows = ['the same crate, one version apart', 'a genuinely different real answer', 'trust that is checked, not just assumed'];
  // The payoff: two pins of one crate slide in a single release apart, both are run against the list, and they come
  // back with opposite answers; the check itself is what told them apart.
  const pins = ['older pin', 'next release'];
  return (
    <Svg label="recap: asking a published list instead of guessing" h={300}>
      {rows.map((r, i) => (
        <Point key={r} y={40 + i * 44} text={r} t={t} at={0.15 + i * 0.7} />
      ))}
      <rect x={400} y={168} width={110} height={110} rx={6} fill="none" stroke={C.latte} strokeWidth={1.2} opacity={fa(t, 0.3, 0.3)} />
      <T x={455} y={160} s={11} a="middle" f={C.latte} o={fa(t, 0.3, 0.3)}>RustSec</T>
      {pins.map((p, i) => {
        const y = 196 + i * 54;
        const k = easeOut(seg(t, 0.3 + i * 0.15, 0.75 + i * 0.15));
        const bad = i === 0;
        return (
          <g key={p}>
            <g transform={`translate(${((1 - k) * -40).toFixed(1)} 0)`} opacity={k}>
              <rect x={30} y={y - 16} width={150} height={28} rx={14} fill="none" stroke={C.crema} strokeWidth={1.2} />
              <T x={105} y={y + 3} s={12} a="middle" f={C.crema}>{p}</T>
            </g>
            <Draw pts={[[184, y - 2], [400, y - 2]]} t={t} from={0.95 + i * 0.12} to={1.35 + i * 0.12} stroke={bad ? C.cherryText : C.caramel} w={1.5} />
            {bad ? (
              <g>
                <Draw pts={[[448, y - 10], [464, y + 6]]} t={t} from={1.45} to={1.6} stroke={C.cherryText} w={2.5} pen={false} />
                <Draw pts={[[464, y - 10], [448, y + 6]]} t={t} from={1.5} to={1.65} stroke={C.cherryText} w={2.5} pen={false} />
              </g>
            ) : (
              <Tick x={456} y={y - 2} t={t} at={1.6} />
            )}
          </g>
        );
      })}
      <Reticle x={455} y={223} w={130} h={124} t={t} at={2.3} />
    </Svg>
  );
}
