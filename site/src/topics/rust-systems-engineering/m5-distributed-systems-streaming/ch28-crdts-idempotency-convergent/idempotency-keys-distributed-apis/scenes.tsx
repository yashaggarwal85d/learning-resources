import type { StepCtx } from '../../../../../reels/types';
import { easeOut, seg, lerp, easeInOut } from '../../../../../reels/anim';
import { Code } from '../../../../../reels/Code';
import { Draw, Stack, Svg, T, C, Reticle } from '../../../../../reels/kit';

// An idempotency key's own scope, TTL, stored response, and conflict check
// are four genuinely separate real rules, and together they are what lets
// a client safely retry a request it cannot otherwise prove ever arrived.
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

/** A key chip: a small rounded tag with the key's name, at (x, y). */
function KeyTag({ x, y, o = 1, f = C.second }: { x: number; y: number; o?: number; f?: string }) {
  return (
    <g opacity={o}>
      <rect x={x - 22} y={y - 12} width={44} height={24} rx={12} fill="none" stroke={f} strokeWidth={2} />
      <T x={x} y={y + 5} s={13} a="middle" f={f}>
        key
      </T>
    </g>
  );
}


// ── 1 · Does scope keep identical keys from colliding (predict) ───────────
export function ScopePredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="two resources, one identical key string"
        lines={['store.begin("charge", key, now, ttl);', 'store.begin("refund", key, now, ttl); // collide?']}
        t={t}
        start={0.1}
        end={2.6}
        highlight={[1]}
      />
    </Stack>
  );
}

// ── 2 · Measured: two scopes, no collision ─────────────────────────────────
// One identical key string goes to two resources. It forks: one copy travels to charge, one to refund, and each
// resource runs its own side effect (a tick) and files its own, distinct stored response in its own scope.
export function ScopeReveal({ t }: StepCtx) {
  const fork = easeInOut(seg(t, 0.2, 0.8));
  const res = [
    { y: 40, label: 'charge', f: C.caramel },
    { y: 110, label: 'refund', f: C.second },
  ];
  return (
    <Svg label="idempotency_key_scope_ttl_and_replay.rs" h={240}>
      {res.map((r, i) => {
        const done = ez(t, 0.9 + i * 0.3, 0.3);
        const file = easeInOut(seg(t, 1.4 + i * 0.3, 1.9 + i * 0.3));
        return (
          <g key={r.label}>
            <KeyTag x={lerp(70, 220, fork)} y={lerp(75, r.y + 18, fork)} o={ez(t, 0, 0.2)} />
            <rect x={260} y={r.y} width={130} height={36} rx={6} fill="none" stroke={C.caramel} strokeWidth={2} opacity={ez(t, 0.1)} />
            <T x={325} y={r.y + 23} s={13} a="middle" f={C.crema} o={ez(t, 0.1)}>{r.label}</T>
            <path d={`M400 ${r.y + 18} l6 6 l12 -13`} fill="none" stroke={C.focus} strokeWidth={2.5} strokeDasharray={30} strokeDashoffset={30 * (1 - done)} />
            <rect x={lerp(420, 470, file)} y={r.y + 6} width={24} height={24} rx={3} fill={r.f} opacity={file} />
            <rect x={462} y={r.y - 2} width={120} height={40} rx={6} fill="none" stroke={C.mocha} strokeWidth={1.5} strokeDasharray="4 3" opacity={ez(t, 0.2)} />
          </g>
        );
      })}
      <T x={522} y={170} s={13} a="middle" f={C.taupe} o={ez(t, 0.2)}>stored</T>
      <Line t={t} at={1.0} y={196} text="both resources ran their own real side effect" mark="tick" />
      <Line t={t} at={1.9} y={230} text="each stored response is genuinely distinct" />
    </Svg>
  );
}

// ── 3 · Does a duplicate replay or rerun (predict) ─────────────────────────
export function ReplayPredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="the identical key, a duplicate, within TTL"
        lines={['store.begin("charge", key, now_plus_100, ttl);', '// replays, or runs the side effect again?']}
        t={t}
        start={0.1}
        end={2.6}
        highlight={[1]}
      />
    </Stack>
  );
}

// ── 4 · Measured: genuinely replays (takeaway) ──────────────────────────────
export function ReplayReveal({ t }: StepCtx) {
  const travel = easeOut(seg(t, 0.5, 0.85));
  return (
    <Svg label="idempotency_key_scope_ttl_and_replay.rs" h={200}>
      <T x={60} y={50} s={14} f={C.crema} o={fa(t, 0.3, 0.4)}>a duplicate, well within the real TTL</T>
      <T x={70} y={80} s={12} f={C.latte} o={fa(t, 0.35, 0.3)}>stored response</T>
      <Draw pts={[[90, 95], [90, 75]]} t={t} from={0.4} to={0.5} stroke={C.caramel} w={2} pen />
      <circle cx={90 + travel * 180} cy={75} r={5} fill={C.caramel} opacity={fa(t, 0.5, 0.2)} />
      <circle cx={270} cy={110} r={5} fill="none" stroke={C.cherry} strokeWidth={1.5} opacity={fa(t, 0.85, 0.2)} />
      <T x={70} y={125} s={11} f={C.latte} o={fa(t, 0.85, 0.3)}>side effect: skipped</T>
      {fa(t, 1.1, 0.4) > 0.85 && <T x={190} y={150} s={13} a="middle" f={C.mocha}>the stored response, replayed exactly</T>}
      <T x={60} y={178} s={13} f={C.latte} o={fa(t, 1.5, 0.3)}>the side effect never ran a second time</T>
    </Svg>
  );
}

// ── 5 · Does a genuine race double-run the side effect (predict) ──────────
export function RacePredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="the identical key, two requests, close together"
        lines={['store.begin("charge", key, now, ttl); // still running', 'store.begin("charge", key, now_plus_1, ttl); // races?']}
        t={t}
        start={0.1}
        end={2.6}
        highlight={[1]}
      />
    </Stack>
  );
}

// ── 6 · Measured: the race is caught ───────────────────────────────────────
// The first request is in flight, its progress bar filling. A second request with the same key arrives while that
// bar is still short of done; it hits the in-flight lock and bounces off as a conflict. The first finishes, and the
// side-effect tally ends on a single mark.
export function RaceReveal({ t }: StepCtx) {
  const run = easeInOut(seg(t, 0.2, 1.8));
  const second = easeInOut(seg(t, 0.7, 1.1));
  const bounce = easeOut(seg(t, 1.1, 1.4));
  return (
    <Svg label="idempotency_key_scope_ttl_and_replay.rs" h={250}>
      <T x={30} y={44} s={13} f={C.latte} o={ez(t, 0)}>first</T>
      <rect x={110} y={32} width={300} height={16} rx={3} fill={C.cocoa} opacity={ez(t, 0)} />
      <rect x={110} y={32} width={Math.max(2, 300 * run)} height={16} rx={3} fill={C.caramel} opacity={ez(t, 0)} />
      <T x={30} y={104} s={13} f={C.latte} o={ez(t, 0.6)}>second</T>
      <g opacity={ez(t, 0.6, 0.2)}>
        <KeyTag x={lerp(150, 330, second) - bounce * 110} y={99} f={bounce > 0 ? C.cherryText : C.second} />
      </g>
      <g opacity={ez(t, 0.3)}>
        <path d="M368 92 v-6 a7 7 0 0 1 14 0 v6" fill="none" stroke={C.focus} strokeWidth={2} />
        <rect x={364} y={92} width={22} height={16} rx={2} fill={C.focus} />
      </g>
      <T x={400} y={105} s={13} f={C.cherryText} o={ez(t, 1.15)}>conflict</T>
      <line x1={500} y1={30} x2={500} y2={30 + 22 * ez(t, 1.8, 0.2)} stroke={C.focus} strokeWidth={3} strokeLinecap="round" />
      <T x={515} y={46} s={13} f={C.crema} o={ez(t, 1.8)}>ran</T>
      <Line t={t} at={0.6} y={170} text="the first still running, a second arrives" />
      <Line t={t} at={1.2} y={204} text="the second request: a real conflict, caught" mark="cross" mf={C.cherryText} />
      <Line t={t} at={1.9} y={238} text="the side effect ran exactly once, not twice" mark="tick" />
    </Svg>
  );
}

// ── 7 · Does an expired key run fresh again (predict) ──────────────────────
export function TtlPredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="the identical key, now past its own real TTL"
        lines={['store.begin("charge", key, after_ttl, ttl);', '// rejected outright, or treated as brand new?']}
        t={t}
        start={0.1}
        end={2.6}
        highlight={[1]}
      />
    </Stack>
  );
}

// ── 8 · Measured: past TTL, treated as new ────────────────────────────────
// The stored entry's TTL bar drains to empty and the entry dissolves. The identical key arrives again, finds
// nothing, and the side effect genuinely runs a second time, with its tick drawn again.
export function TtlReveal({ t }: StepCtx) {
  const drain = seg(t, 0.2, 1.1);
  const gone = ez(t, 1.1, 0.3);
  const again = easeInOut(seg(t, 1.4, 1.9));
  const run = ez(t, 1.9, 0.3);
  return (
    <Svg label="idempotency_key_scope_ttl_and_replay.rs" h={220}>
      <g opacity={ez(t, 0, 0.2) * (1 - gone)} transform={`scale(1 1)`}>
        <rect x={380} y={30} width={170} height={50} rx={6} fill="none" stroke={C.taupe} strokeWidth={1.5} />
        <rect x={390} y={64} width={150} height={6} rx={3} fill={C.cocoa} />
        <rect x={390} y={64} width={Math.max(0, 150 * (1 - drain))} height={6} rx={3} fill={drain > 0.8 ? C.cherryText : C.latte} />
        <T x={400} y={54} s={13} f={C.latte}>TTL</T>
      </g>
      <T x={465} y={100} s={13} a="middle" f={C.taupe} o={gone}>expired</T>
      <KeyTag x={lerp(60, 230, again)} y={55} o={again > 0 ? 1 : ez(t, 0, 0.2) * 0.4} />
      <rect x={250} y={37} width={110} height={36} rx={6} fill="none" stroke={C.caramel} strokeWidth={2} />
      <T x={305} y={60} s={13} a="middle" f={C.crema}>charge</T>
      <path d="M290 92 l6 6 l12 -13" fill="none" stroke={C.cherryText} strokeWidth={2.5} strokeDasharray={30} strokeDashoffset={30 * (1 - run)} />
      <T x={318} y={100} s={13} f={C.cherryText} o={run}>ran again</T>
      <Line t={t} at={1.2} y={160} text="the expired key treated as brand new" />
      <Line t={t} at={1.9} y={200} text="the side effect genuinely ran again" mark="tick" mf={C.cherryText} />
    </Svg>
  );
}

// ── 9 · Two sources agree (connecting) ─────────────────────────────────────
// The quote lands; under it, two retries arrive. The one after the first finished gets the saved response handed
// straight back; the one that overlaps the first still in flight is bounced with a conflict.
export function DocsReveal({ t }: StepCtx) {
  const a = easeInOut(seg(t, 1.0, 1.4));
  const ab = easeInOut(seg(t, 1.4, 1.8));
  const b = easeInOut(seg(t, 1.7, 2.1));
  const bb = easeInOut(seg(t, 2.1, 2.5));
  return (
    <Svg label="Stripe Docs / IETF draft, quoted" h={230}>
      <Quote t={t} lines={['a finished retry: replays the saved response', 'a concurrent one: a real conflict instead']} hot={1} y0={40} gap={38} beat={0.45} />
      <rect x={260} y={122} width={120} height={80} rx={6} fill="none" stroke={C.caramel} strokeWidth={2} opacity={ez(t, 0.7)} />
      <T x={320} y={218} s={13} a="middle" f={C.crema} o={ez(t, 0.7)}>server</T>
      <KeyTag x={lerp(60, 230, a) - ab * 0} y={140} o={a > 0 && ab < 1 ? 1 : 0} />
      <rect x={lerp(250, 80, ab) - 10} y={130} width={20} height={20} rx={3} fill={C.focus} opacity={ab > 0 ? 1 : 0} />
      <T x={70} y={145} s={13} a="end" f={C.focus} o={ez(t, 1.8)}>saved</T>
      <KeyTag x={lerp(60, 230, b) - bb * 170} y={184} o={b > 0 ? 1 : 0} f={bb > 0 ? C.cherryText : C.second} />
      <T x={400} y={189} s={13} f={C.cherryText} o={ez(t, 2.1)}>conflict</T>
    </Svg>
  );
}

// ── 10 · Recap ─────────────────────────────────────────────────────────────
export function Recap({ t }: StepCtx) {
  return (
    <RecapList
      t={t}
      label="recap: a real idempotency-key store"
      rows={['a key scope keeps keys from colliding', 'TTL bounds how long a response is replayed', 'a race is caught, never run twice']}
      gap={70}
      y0={60}
    />
  );
}
