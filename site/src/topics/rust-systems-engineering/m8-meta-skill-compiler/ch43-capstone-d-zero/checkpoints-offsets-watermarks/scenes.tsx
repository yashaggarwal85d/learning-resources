import type { StepCtx } from '../../../../../reels/types';
import { Code } from '../../../../../reels/Code';
import { clamp, easeInOut, easeOut, lerp, seg } from '../../../../../reels/anim';
import { Decode, Draw, Reticle, Stack, Svg, T, C } from '../../../../../reels/kit';

// A checkpoint taken after the real commit returns restarts without
// losing or repeating a single real record; one taken before it can
// look identical, until a crash lands in between the two.
const fa = (t: number, a: number, d = 0.4) => easeOut(seg(t, a, a + d));

// Starts slow and accelerates: for records falling out of the stream.
const easeIn = (x: number) => x * x * x;

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

// ── 1 · Does restart reprocess or lose anything (predict) ──────────────
export function CorrectPredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="checkpoint taken after the real commit returns"
        lines={['crash mid-stream, batch fifteen begins', '// does restart reprocess, or lose anything?']}
        t={t}
        start={0.1}
        end={2.6}
        highlight={[1]}
      />
    </Stack>
  );
}

// ── 2 · Measured: restart loses nothing, reprocesses nothing ───────────
export function CorrectReveal({ t }: StepCtx) {
  const commit = easeOut(seg(t, 0.2, 0.55));
  return (
    <Svg label="checkpoint_demo, captured" h={210}>
      <T x={30} y={25} s={11} f={C.latte} o={fa(t, 0.05, 0.2)}>fourteen batches, genuinely committed</T>
      <Draw pts={[[40, 55], [320, 55]]} t={t} from={0.2} to={0.55} stroke={C.caramel} w={2} pen />
      <circle cx={40 + commit * 280} cy={55} r={5} fill={C.caramel} opacity={fa(t, 0.2, 0.15)} />
      <Draw pts={[[320, 40], [320, 70]]} t={t} from={0.6} to={0.8} stroke={C.caramel} w={2} />
      <T x={320} y={86} s={10} a="middle" f={C.latte} o={fa(t, 0.65, 0.2)}>checkpoint</T>
      <g opacity={fa(t, 0.9, 0.3)}>
        <rect x={60} y={95} width={300} height={34} rx={6} fill="none" stroke={C.caramel} strokeWidth={2} />
        <T x={210} y={117} s={12} a="middle" f={C.mocha}>checkpoint matches: batch fourteen</T>
      </g>
      <T x={60} y={150} s={12} f={C.latte} o={fa(t, 1.3, 0.3)}>nothing reprocessed, nothing lost</T>
    </Svg>
  );
}

// ── 3 · Does the wrong checkpoint still match (predict) ─────────────────
export function WrongPredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="checkpoint taken at handoff, before the commit"
        lines={['the identical crash, the identical point', '// does the checkpoint still match reality?']}
        t={t}
        start={0.1}
        end={2.6}
        highlight={[1]}
      />
    </Stack>
  );
}

// ── 4 · Measured: the checkpoint runs one batch ahead ───────────────────
export function WrongReveal({ t }: StepCtx) {
  const commit = easeOut(seg(t, 0.2, 0.5));
  const claim = easeOut(seg(t, 0.4, 0.7));
  return (
    <Svg label="checkpoint_demo, captured" h={210}>
      <T x={30} y={25} s={11} f={C.latte} o={fa(t, 0.05, 0.2)}>fourteen batches, genuinely committed</T>
      <Draw pts={[[40, 55], [280, 55]]} t={t} from={0.2} to={0.5} stroke={C.caramel} w={2} pen />
      <circle cx={40 + commit * 240} cy={55} r={5} fill={C.caramel} opacity={fa(t, 0.2, 0.15)} />
      <Draw pts={[[40, 80], [320, 80]]} t={t} from={0.4} to={0.7} stroke={C.cherry} w={2} pen />
      <circle cx={40 + claim * 280} cy={80} r={5} fill="none" stroke={C.cherry} strokeWidth={1.5} opacity={fa(t, 0.4, 0.15)} />
      <T x={330} y={83} s={9} f={C.latte}>claimed</T>
      <g opacity={fa(t, 0.85, 0.3)}>
        <rect x={60} y={100} width={300} height={34} rx={6} fill="none" stroke={C.caramel} strokeWidth={2} />
        <T x={210} y={122} s={12} a="middle" f={C.mocha}>checkpoint claims: batch fifteen</T>
      </g>
      <T x={60} y={155} s={12} f={C.latte} o={fa(t, 1.3, 0.3)}>a promise the commit never kept</T>
    </Svg>
  );
}

// ── 5 · Does the skipped batch come back later (predict) ────────────────
export function RestartPredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="restart resumes right after the checkpoint"
        lines={['batch fifteen is skipped, not retried', '// reprocessed later, or gone for good?']}
        t={t}
        start={0.1}
        end={2.6}
        highlight={[1]}
      />
    </Stack>
  );
}

// ── 6 · Measured: that batch's records are gone for good ───────────────
export function RestartReveal({ t }: StepCtx) {
  // The checkpoint flag claims batch fifteen is done. Restart hops from that flag straight into sixteen, and the ten
  // records still sitting in fifteen fall out of the stream: nothing will ever come back for them.
  const hop = easeInOut(seg(t, 0.55, 1.05));
  const p = along([[240, 30], [272, 14], [305, 30]], hop);
  const dots = Array.from({ length: 10 }, (_, i) => i);
  return (
    <Svg label="checkpoint_demo, captured" h={210}>
      <g opacity={fa(t, 0, 0.25)}>
        <rect x={40} y={40} width={90} height={44} rx={4} fill={C.mocha} />
        <rect x={150} y={40} width={90} height={44} rx={4} fill="none" stroke={C.cherryText} strokeWidth={1.5} />
        <rect x={260} y={40} width={90} height={44} rx={4} fill="none" stroke={hop >= 1 ? C.caramel : C.latte} strokeWidth={1.5} />
        <rect x={370} y={40} width={90} height={44} rx={4} fill="none" stroke={C.mocha} strokeWidth={1.2} strokeDasharray="3 3" />
        <T x={85} y={102} s={11} a="middle" f={C.latte}>fourteen</T>
        <T x={195} y={102} s={11} a="middle" f={C.cherryText}>fifteen</T>
        <T x={305} y={102} s={11} a="middle" f={C.latte}>sixteen</T>
      </g>
      <Draw pts={[[240, 88], [240, 22]]} t={t} from={0.15} to={0.4} stroke={C.caramel} w={2} pen={false} />
      <rect x={240} y={22} width={22 * fa(t, 0.35, 0.25)} height={10} fill={C.caramel} />
      <Draw pts={[[240, 30], [272, 14], [305, 30]]} t={t} from={0.55} to={1.05} stroke={C.latte} w={1.5} dash="3 3" pen={false} />
      <circle cx={p[0]} cy={p[1]} r={4} fill={C.caramel} opacity={fa(t, 0.55, 0.1)} />
      {dots.map((i) => {
        const at = 1.1 + (i % 5) * 0.05 + Math.floor(i / 5) * 0.08;
        const k = easeIn(seg(t, at, at + 0.5));
        return (
          <circle key={i} cx={162 + (i % 5) * 16} cy={54 + Math.floor(i / 5) * 16 + k * 70} r={4} fill={C.cherryText} opacity={fa(t, 0.1, 0.2) * (1 - k)} />
        );
      })}
      <Reticle x={195} y={62} w={104} h={58} t={t} at={2.2} color={C.cherryText} />
      <g opacity={fa(t, 1.5, 0.3)} transform={`translate(${((1 - fa(t, 1.5, 0.4)) * 36).toFixed(1)} 0)`}>
        <rect x={40} y={128} width={340} height={34} rx={6} fill="none" stroke={C.caramel} strokeWidth={2} />
        <T x={210} y={150} s={12} a="middle" f={C.crema}>ten real records, gone for good</T>
      </g>
      <T x={40} y={190} s={12} f={C.latte} o={fa(t, 1.9, 0.3)}>a loss, not a safe reprocessing</T>
    </Svg>
  );
}

// ── 7 · the standard library's own words on a real sync ────────────────
export function DocsReveal({ t, portrait }: StepCtx) {
  // The page's promise, what follows from it, then the order it forces: sync_all returns first, the checkpoint after.
  const drop = easeOut(seg(t, 2.15, 2.5));
  return (
    <Svg label="std::fs::File, its own words" h={212}>
      <Quote y={8} src="File::sync_all" quote="data reaches the filesystem before returning" mark="before returning" t={t} at={0.1} portrait={portrait} />
      <Quote y={82} src="so, for a checkpoint" quote="before that return, nothing is durable yet" mark="nothing is durable" t={t} at={0.9} portrait={portrait} />
      <Draw pts={[[40, 178], [420, 178]]} t={t} from={1.8} to={2.1} stroke={C.mocha} w={1.5} pen={false} />
      <Draw pts={[[220, 168], [220, 188]]} t={t} from={1.95} to={2.1} stroke={C.caramel} w={2} pen={false} />
      <T x={220} y={204} s={11} a="middle" f={C.latte} o={fa(t, 1.95, 0.2)}>returns</T>
      <line x1={300} y1={150 + drop * 20} x2={300} y2={170 + drop * 8} stroke={C.caramel} strokeWidth={2} opacity={drop} />
      <rect x={300} y={150 + drop * 20} width={18} height={8} fill={C.caramel} opacity={drop} />
      <Decode text="checkpoint" t={t} at={2.4} dur={0.35} x={300} y={204} s={11} f={C.caramel} />
    </Svg>
  );
}

// ── 8 · Recap ─────────────────────────────────────────────────────────────
export function Recap({ t }: StepCtx) {
  const rows = ['checkpoint after commit: a clean restart', 'checkpoint before commit: a silent loss', 'the two look identical, until a crash lands'];
  // The payoff: two identical streams, one flag behind its commit and one a batch ahead. A crash lands across both in
  // fifteen. The top one resumes into fifteen and redoes it; the bottom one hops to sixteen and fifteen's records fall away.
  const lanes = [204, 262];
  const back = easeInOut(seg(t, 1.85, 2.2));
  const hop = easeInOut(seg(t, 1.85, 2.2));
  const pTop = along([[200, lanes[0] - 16], [225, lanes[0] - 30], [250, lanes[0] - 16]], back);
  const pBot = along([[290, lanes[1] - 16], [315, lanes[1] - 30], [340, lanes[1] - 16]], hop);
  return (
    <Svg label="recap: a checkpoint only as true as its commit" h={300}>
      {rows.map((r, i) => (
        <Point key={r} y={40 + i * 44} text={r} t={t} at={0.15 + i * 0.7} />
      ))}
      <g opacity={fa(t, 0.2, 0.25)}>
        <T x={160} y={168} s={11} a="middle" f={C.latte}>fourteen</T>
        <T x={250} y={168} s={11} a="middle" f={C.latte}>fifteen</T>
        <T x={340} y={168} s={11} a="middle" f={C.latte}>sixteen</T>
        {lanes.map((y) => (
          <g key={y}>
            <rect x={120} y={y - 13} width={80} height={26} rx={3} fill={C.mocha} />
            <rect x={210} y={y - 13} width={80} height={26} rx={3} fill="none" stroke={C.latte} strokeWidth={1.2} />
            <rect x={300} y={y - 13} width={80} height={26} rx={3} fill="none" stroke={C.mocha} strokeWidth={1.2} />
          </g>
        ))}
        <T x={30} y={lanes[0] + 4} s={11} f={C.latte}>after</T>
        <T x={30} y={lanes[1] + 4} s={11} f={C.latte}>before</T>
      </g>
      <Draw pts={[[205, lanes[0] + 16], [205, lanes[0] - 22]]} t={t} from={0.35} to={0.6} stroke={C.caramel} w={2} pen={false} />
      <Draw pts={[[295, lanes[1] + 16], [295, lanes[1] - 22]]} t={t} from={1.05} to={1.3} stroke={C.cherryText} w={2} pen={false} />
      <Draw pts={[[250, 178], [242, 205], [258, 225], [244, 250], [256, 284]]} t={t} from={1.55} to={1.8} stroke={C.cherryText} w={2.5} o={1 - fa(t, 2.0, 0.4)} />
      <circle cx={pTop[0]} cy={pTop[1]} r={4} fill={C.caramel} opacity={fa(t, 1.85, 0.1)} />
      <circle cx={pBot[0]} cy={pBot[1]} r={4} fill={C.cherryText} opacity={fa(t, 1.85, 0.1)} />
      <Tick x={250} y={lanes[0] + 1} t={t} at={2.2} />
      {[0, 1, 2, 3, 4].map((i) => {
        const k = easeIn(seg(t, 2.15 + i * 0.04, 2.55 + i * 0.04));
        return <circle key={i} cx={222 + i * 14} cy={lanes[1] + k * 26} r={3.5} fill={C.cherryText} opacity={fa(t, 0.2, 0.25) * (1 - k)} />;
      })}
      <Reticle x={250} y={lanes[1]} w={96} h={36} t={t} at={2.45} color={C.cherryText} />
    </Svg>
  );
}
