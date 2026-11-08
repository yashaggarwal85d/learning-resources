import type { StepCtx } from '../../../../../reels/types';
import { easeOut, seg, lerp, easeInOut } from '../../../../../reels/anim';
import { Code } from '../../../../../reels/Code';
import { Draw, Stack, Svg, T, C, Reticle } from '../../../../../reels/kit';

// At-least-once delivery genuinely redelivers a message whose own effect
// may have already run; a real idempotency key removes that duplicate's
// own effect without ever stopping the redelivery itself.
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


// ── 1 · Does a crash between effect and commit redeliver (predict) ────────
export function CrashPredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="apply the side effect, then commit the offset"
        lines={['ledger.apply_deposit(amount);', '// crash right here -- redelivered next poll?']}
        t={t}
        start={0.1}
        end={2.6}
        highlight={[1]}
      />
    </Stack>
  );
}

// ── 2 · Measured: the crash, then the redelivery ──────────────────────────
// The consumer polls a message off the log and starts on it; the crash strikes before the offset commit can travel
// back, so the log's offset pointer never moves. On restart, the next poll sends the identical message again.
export function CrashReveal({ t }: StepCtx) {
  const first = easeInOut(seg(t, 0.2, 0.6));
  const commit = easeOut(seg(t, 0.75, 1.0));
  const crash = ez(t, 1.0, 0.25);
  const back = ez(t, 1.4, 0.3);
  const again = easeInOut(seg(t, 1.6, 2.1));
  const cells = [0, 1, 2, 3];
  return (
    <Svg label="idempotent_consumer_removes_duplicate_effect.rs" h={230}>
      <T x={40} y={28} s={13} f={C.latte}>log</T>
      {cells.map((i) => (
        <rect key={i} x={40 + i * 50} y={40} width={42} height={30} rx={4} fill={i === 2 ? C.second : C.cocoa} stroke={C.mocha} />
      ))}
      <path d="M161 86 l10 -10 l10 10 z" fill={C.focus} />
      <T x={171} y={104} s={13} a="middle" f={C.crema}>offset</T>
      <g opacity={ez(t, 0)}>
        <rect x={420} y={36} width={140} height={40} rx={6} fill="none" stroke={crash > 0 && back < 1 ? C.cherryText : C.caramel} strokeWidth={2} />
        <T x={490} y={61} s={13} a="middle" f={C.crema}>consumer</T>
      </g>
      {first > 0 && first < 1 && <rect x={lerp(140, 470, first)} y={46} width={18} height={18} rx={3} fill={C.second} />}
      {again > 0 && <rect x={lerp(140, 470, again)} y={46} width={18} height={18} rx={3} fill={C.second} />}
      {commit > 0 && <line x1={420} y1={90} x2={lerp(420, 385, commit)} y2={90} stroke={C.taupe} strokeWidth={1.5} strokeDasharray="4 3" opacity={1 - back} />}
      <path d="M376 84 l10 10 m0 -10 l-10 10" stroke={C.cherryText} strokeWidth={2} opacity={crash * (1 - back)} />
      <g opacity={crash * (1 - back)}>
        <path d="M584 24 l-10 16 h10 l-8 16" fill="none" stroke={C.cherryText} strokeWidth={3} />
        <T x={330} y={96} s={13} f={C.cherryText}>crash</T>
      </g>
      <T x={330} y={96} s={13} f={C.second} o={ez(t, 2.0)}>
        redelivered
      </T>
      <Line t={t} at={1.1} y={170} text="the offset never committed, before the crash" mark="cross" mf={C.cherryText} />
      <Line t={t} at={2.0} y={210} text="the next poll redelivered the same message" />
    </Svg>
  );
}

// ── 3 · Does a naive consumer apply the effect twice (predict) ────────────
export function DupPredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="the redelivered message hits the side effect again"
        lines={['// the side effect itself has no memory of its own', 'ledger.apply_deposit(amount); // twice?']}
        t={t}
        start={0.1}
        end={2.6}
        highlight={[1]}
      />
    </Stack>
  );
}

// ── 4 · Measured: genuinely applied twice (takeaway) ───────────────────────
export function DupReveal({ t }: StepCtx) {
  const land1 = easeOut(seg(t, 0.4, 0.65));
  const land2 = easeOut(seg(t, 0.8, 1.05));
  return (
    <Svg label="idempotent_consumer_removes_duplicate_effect.rs" h={200}>
      <T x={60} y={50} s={14} f={C.crema} o={fa(t, 0.3, 0.4)}>a naive consumer, after the real redelivery</T>
      <circle cx={100} cy={80 - (1 - land1) * 20} r={5} fill={C.caramel} opacity={fa(t, 0.4, 0.2)} />
      <circle cx={100} cy={80 - (1 - land2) * 20} r={5} fill={C.cherry} opacity={fa(t, 0.8, 0.2)} />
      <T x={115} y={84} s={12} f={C.latte} o={fa(t, 0.8, 0.3)}>applied twice</T>
      {fa(t, 1.2, 0.4) > 0.85 && <T x={190} y={125} s={13} a="middle" f={C.mocha}>the side effect ran a second real time</T>}
      <T x={60} y={160} s={13} f={C.latte} o={fa(t, 1.6, 0.3)}>the real ledger balance is now wrong</T>
    </Svg>
  );
}

// ── 5 · Does a real idempotency key remove the duplicate (predict) ────────
export function FixPredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="a real idempotency key: producer id, sequence"
        lines={['if !seen.contains(&(producer_id, sequence)) {', '    ledger.apply_deposit(amount); // genuinely gone?']}
        t={t}
        start={0.1}
        end={2.6}
        highlight={[1]}
      />
    </Stack>
  );
}

// ── 6 · Measured: the key removes the duplicate's effect ───────────────────
// The message arrives and is applied: its key goes into the consumer's seen set and the balance bar grows. After
// the crash the identical message arrives again; its key is found in the set, the message bounces off struck out,
// and the balance bar stays exactly where it was, locked on.
export function FixReveal({ t }: StepCtx) {
  const first = easeInOut(seg(t, 0.2, 0.6));
  const grow = easeOut(seg(t, 0.6, 0.9));
  const second = easeInOut(seg(t, 1.1, 1.5));
  const bounce = easeOut(seg(t, 1.5, 1.8));
  return (
    <Svg label="idempotent_consumer_removes_duplicate_effect.rs" h={250}>
      <T x={30} y={30} s={13} f={C.latte} o={ez(t, 0)}>redelivery</T>
      <rect x={300} y={24} width={110} height={66} rx={6} fill="none" stroke={C.caramel} strokeWidth={2} opacity={ez(t, 0)} />
      <T x={355} y={44} s={13} a="middle" f={C.crema} o={ez(t, 0)}>seen keys</T>
      {first > 0 && first < 1 && <rect x={lerp(40, 346, first)} y={56} width={18} height={18} rx={3} fill={C.second} />}
      <rect x={346} y={56} width={18} height={18} rx={3} fill={C.second} opacity={first >= 1 ? 1 : 0} />
      {second > 0 && <rect x={lerp(40, 270, second) - bounce * 90} y={56} width={18} height={18} rx={3} fill={C.second} opacity={1 - ez(t, 1.8, 0.3) * 0.6} />}
      <path d="M276 58 l14 14 m0 -14 l-14 14" stroke={C.cherryText} strokeWidth={2.5} strokeDasharray={40} strokeDashoffset={40 * (1 - ez(t, 1.5, 0.3))} />
      <T x={40} y={118} s={13} f={C.latte} o={ez(t, 0.4)}>balance</T>
      <rect x={140} y={106} width={Math.max(2, 220 * grow)} height={16} rx={3} fill={C.caramel} opacity={ez(t, 0.4)} />
      <Reticle x={250} y={114} w={236} h={30} t={t} at={1.9} />
      <Line t={t} at={0.3} y={170} text="the identical crash, the identical redelivery" />
      <Line t={t} at={1.3} y={204} text="the real key: producer id, sequence number" mf={C.second} />
      <Line t={t} at={1.9} y={238} text="the real balance landed exactly right" mark="tick" />
    </Svg>
  );
}

// ── 7 · Does the redelivery itself also disappear (predict) ────────────────
export function StillRedeliversPredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="the idempotency key stopped the effect"
        lines={['// redeliveries: measured, counted, nonzero', '// does the redelivery itself disappear too?']}
        t={t}
        start={0.1}
        end={2.6}
        highlight={[1]}
      />
    </Stack>
  );
}

// ── 8 · Measured: still redelivered, effect once ───────────────────────────
// The identical message travels from the broker to the consumer twice; the delivery tally gains a mark each time.
// The effect tally beneath it gains its mark the first time only: delivery repeated, effect not.
export function StillRedeliversReveal({ t }: StepCtx) {
  const trips = [0.2, 1.0];
  return (
    <Svg label="idempotent_consumer_removes_duplicate_effect.rs" h={250}>
      <rect x={30} y={36} width={110} height={36} rx={6} fill="none" stroke={C.caramel} strokeWidth={2} opacity={ez(t, 0)} />
      <T x={85} y={59} s={13} a="middle" f={C.crema} o={ez(t, 0)}>broker</T>
      <rect x={300} y={36} width={130} height={36} rx={6} fill="none" stroke={C.caramel} strokeWidth={2} opacity={ez(t, 0)} />
      <T x={365} y={59} s={13} a="middle" f={C.crema} o={ez(t, 0)}>consumer</T>
      {trips.map((a, i) => {
        const go = easeInOut(seg(t, a, a + 0.5));
        return (
          <g key={a}>
            {go > 0 && go < 1 && <rect x={lerp(145, 280, go)} y={45} width={18} height={18} rx={3} fill={C.second} />}
            <line x1={450 + i * 14} y1={36} x2={450 + i * 14} y2={36 + 20 * ez(t, a + 0.5, 0.2)} stroke={C.second} strokeWidth={3} strokeLinecap="round" />
            {i === 0 && <line x1={450} y1={96} x2={450} y2={96 + 20 * ez(t, a + 0.6, 0.2)} stroke={C.focus} strokeWidth={3} strokeLinecap="round" />}
          </g>
        );
      })}
      <T x={490} y={52} s={13} f={C.second} o={ez(t, 0.6)}>delivered</T>
      <T x={490} y={112} s={13} f={C.focus} o={ez(t, 0.7)}>effect</T>
      <path d="M458 98 l12 12 m0 -12 l-12 12" stroke={C.cherryText} strokeWidth={2} strokeDasharray={34} strokeDashoffset={34 * (1 - ez(t, 1.6, 0.25))} />
      <Line t={t} at={0.3} y={170} text="a real, counted redelivery, every time" />
      <Line t={t} at={1.5} y={204} text="the message is still genuinely redelivered" mf={C.second} />
      <Line t={t} at={1.9} y={238} text="only its own effect never runs twice" mark="tick" />
    </Svg>
  );
}

// ── 9 · Two sources agree (connecting) ─────────────────────────────────────
// The quote lands; under it, the broker hands the producer its id badge, then sequence-numbered messages flow in.
// A retried message repeats a sequence the broker has already seen, and it bounces back struck out.
export function DocsReveal({ t }: StepCtx) {
  const badge = easeInOut(seg(t, 0.8, 1.2));
  const send = (i: number) => easeInOut(seg(t, 1.2 + i * 0.3, 1.5 + i * 0.3));
  const dup = easeInOut(seg(t, 2.1, 2.4));
  return (
    <Svg label="Confluent Docs / Apache Kafka design, quoted" h={220}>
      <Quote t={t} lines={['a real id per producer, from the broker', 'deduped by a real sequence number']} hot={1} y0={40} gap={38} beat={0.45} />
      <rect x={30} y={130} width={120} height={40} rx={6} fill="none" stroke={C.caramel} strokeWidth={2} opacity={ez(t, 0.6)} />
      <T x={90} y={155} s={13} a="middle" f={C.crema} o={ez(t, 0.6)}>producer</T>
      <rect x={450} y={130} width={120} height={40} rx={6} fill="none" stroke={C.caramel} strokeWidth={2} opacity={ez(t, 0.6)} />
      <T x={510} y={155} s={13} a="middle" f={C.crema} o={ez(t, 0.6)}>broker</T>
      <circle cx={lerp(450, 150, badge)} cy={130} r={7} fill={C.second} opacity={badge > 0 ? 1 : 0} />
      {[0, 1].map((i) => {
        const k = send(i);
        return k > 0 && k < 1 ? <rect key={i} x={lerp(160, 430, k)} y={141} width={18} height={18} rx={3} fill={C.second} /> : null;
      })}
      {dup > 0 && <rect x={lerp(160, 410, dup) - ez(t, 2.4, 0.3) * 60} y={141} width={18} height={18} rx={3} fill={C.latte} />}
      <path d="M386 184 l12 12 m0 -12 l-12 12" stroke={C.cherryText} strokeWidth={2.5} strokeDasharray={34} strokeDashoffset={34 * (1 - ez(t, 2.4, 0.3))} />
      <T x={410} y={196} s={13} f={C.cherryText} o={ez(t, 2.4)}>duplicate</T>
    </Svg>
  );
}

// ── 10 · Recap ─────────────────────────────────────────────────────────────
export function Recap({ t }: StepCtx) {
  return (
    <RecapList
      t={t}
      label="recap: a real crash, a real idempotency key"
      rows={['at-least-once can redeliver an applied effect', 'a key removes the effect, not the delivery', 'the broker never promises consumer memory']}
      gap={70}
      y0={60}
    />
  );
}
