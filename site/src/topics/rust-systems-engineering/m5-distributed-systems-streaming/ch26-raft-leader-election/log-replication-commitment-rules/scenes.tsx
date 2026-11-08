import type { StepCtx } from '../../../../../reels/types';
import { easeOut, seg, lerp, easeInOut } from '../../../../../reels/anim';
import { Code } from '../../../../../reels/Code';
import { Draw, Stack, Svg, T, C, Reticle, Decode } from '../../../../../reels/kit';

// An entry is only genuinely committed once it is replicated to a real
// majority under the leader's own current term; conflict repair genuinely
// backs a divergent follower up to the real common prefix, never silently
// corrupting an index.
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

/** One log entry: a cell coloured by its term (quiet for the oldest, white for the next, red for a divergent one). */
function Cell({ x, y, f, o = 1, dash = false }: { x: number; y: number; f: string; o?: number; dash?: boolean }) {
  return <rect x={x} y={y} width={46} height={30} rx={4} fill={dash ? 'none' : f} stroke={f} strokeWidth={2} strokeDasharray={dash ? '4 3' : undefined} opacity={o} />;
}


// ── 1 · Does repair find the real common prefix (predict) ─────────────────
export function RepairPredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="a follower's own log genuinely diverges"
        lines={['replicate_with_retry(leader_log, term, &mut follower_log);', '// backs up one entry at a time -- finds it?']}
        t={t}
        start={0.1}
        end={2.6}
        highlight={[1]}
      />
    </Stack>
  );
}

// ── 2 · Measured: repair finds the common prefix ───────────────────────────
// The leader's log above, the follower's below, one colour per term. The leader's probe starts at the follower's
// end and steps backward, struck out at each mismatch, until the terms agree; the prefix is bracketed, the red
// divergent entry drops out, and the leader's own entries slide down into its place.
export function RepairReveal({ t }: StepCtx) {
  const xs = [150, 210, 270, 330];
  const lead = [C.latte, C.latte, C.focus, C.focus];
  const probe = t < 0.5 ? 3 : t < 0.95 ? 2 : 1;
  const px = lerp(xs[3] + 23, lerp(xs[2] + 23, xs[1] + 23, easeInOut(seg(t, 0.75, 1.0))), easeInOut(seg(t, 0.3, 0.55)));
  const out = ez(t, 1.45, 0.35);
  const copy = (i: number) => easeInOut(seg(t, 1.75 + (i - 2) * 0.25, 2.2 + (i - 2) * 0.25));
  return (
    <Svg label="log_replication_commitment_rules.rs, measured" h={240}>
      <T x={30} y={46} s={13} f={C.latte}>leader</T>
      <T x={30} y={116} s={13} f={C.latte}>follower</T>
      {xs.map((x, i) => (
        <Cell key={`l${x}`} x={x} y={26} f={lead[i]} />
      ))}
      {xs.slice(0, 2).map((x) => (
        <Cell key={`f${x}`} x={x} y={96} f={C.latte} />
      ))}
      <Cell x={xs[3]} y={96} f={C.taupe} dash o={ez(t, 0.1) * (1 - copy(3))} />
      {t > 0.25 && <path d={`M${xs[3] + 16} 140 l14 14 m0 -14 l-14 14`} stroke={C.cherryText} strokeWidth={2} opacity={1 - out} />}
      <g transform={`translate(0 ${(out * 30).toFixed(1)})`}>
        <Cell x={xs[2]} y={96} f={C.cherryText} o={1 - out} />
      </g>
      {[2, 3].map((i) => (
        <Cell key={`c${i}`} x={xs[i]} y={lerp(26, 96, copy(i))} f={lead[i]} o={copy(i) > 0 ? 1 : 0} />
      ))}
      <g opacity={t < 1.45 ? ez(t, 0.1, 0.3) : 1 - ez(t, 1.45, 0.3)}>
        <path d={`M${px} 72 l-7 -10 h14 z`} fill={C.second} />
      </g>
      {t > 0.7 && <path d={`M${xs[2] + 16} 140 l14 14 m0 -14 l-14 14`} stroke={C.cherryText} strokeWidth={2} opacity={1 - out} />}
      <Draw pts={[[150, 136], [150, 142], [256, 142], [256, 136]]} t={t} from={1.05} to={1.4} stroke={C.second} w={2} pen={false} />
      <T x={203} y={160} s={13} a="middle" f={C.second} o={ez(t, 1.15)}>common prefix</T>
      <Line t={t} at={1.1} y={196} text="the common prefix, found by backing up" />
      <Line t={t} at={2.0} y={228} text="the divergent suffix, overwritten exactly" mark="tick" />
    </Svg>
  );
}

// ── 3 · Does a previous-term majority alone commit (predict) ──────────────
export function PreviousTermPredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="one entry from a previous term, on a real majority"
        lines={['// a real majority already holds this old entry', 'commit_index_after_replica_count(..) -- committed?']}
        t={t}
        start={0.1}
        end={2.6}
        highlight={[1]}
      />
    </Stack>
  );
}

// ── 4 · Measured: genuinely not committed (takeaway) ───────────────────────
export function PreviousTermReveal({ t }: StepCtx) {
  const nodes = [0, 1, 2];
  const bounce = easeOut(seg(t, 0.8, 1.1));
  return (
    <Svg label="log_replication_commitment_rules.rs, measured" h={200}>
      <T x={60} y={50} s={14} f={C.crema} o={fa(t, 0.3, 0.4)}>a real majority, but from a previous term</T>
      {nodes.map((i) => (
        <circle key={i} cx={100 + i * 60} cy={78} r={6} fill={C.caramel} opacity={fa(t, 0.4 + i * 0.1, 0.2)} />
      ))}
      <circle cx={190} cy={78 - (1 - Math.abs(bounce - 0.5) * 2) * 12} r={5} fill={C.cherry} opacity={fa(t, 0.8, 0.2)} />
      {fa(t, 1.2, 0.4) > 0.85 && <T x={190} y={125} s={13} a="middle" f={C.mocha}>genuinely not committed, by that alone</T>}
      <T x={60} y={160} s={13} f={C.latte} o={fa(t, 1.6, 0.3)}>the real hazard this rule exists to prevent</T>
    </Svg>
  );
}

// ── 5 · Does a current-term entry commit both (predict) ───────────────────
export function CurrentTermPredict({ t }: StepCtx) {
  return (
    <Stack>
      <Code
        title="a real entry from the leader's own current term"
        lines={['// replicated to the identical real majority', '// commits only itself, or the earlier one too?']}
        t={t}
        start={0.1}
        end={2.6}
        highlight={[1]}
      />
    </Stack>
  );
}

// ── 6 · Measured: both commit, genuinely (takeaway) ────────────────────────
export function CurrentTermReveal({ t }: StepCtx) {
  const nodes = [0, 1, 2];
  return (
    <Svg label="log_replication_commitment_rules.rs, measured" h={200}>
      <T x={60} y={50} s={14} f={C.crema} o={fa(t, 0.3, 0.4)}>the current-term entry, on the same majority</T>
      {nodes.map((i) => (
        <circle key={i} cx={100 + i * 60} cy={78} r={6} fill={C.caramel} opacity={fa(t, 0.4 + i * 0.1, 0.2)} />
      ))}
      <Draw pts={[[190, 70], [190, 86]]} t={t} from={0.8} to={1.05} stroke={C.caramel} w={3} />
      {fa(t, 1.2, 0.4) > 0.85 && <T x={190} y={125} s={13} a="middle" f={C.mocha}>both genuinely commit, together</T>}
      <T x={60} y={160} s={13} f={C.latte} o={fa(t, 1.6, 0.3)}>one real commitment reaches backward too</T>
    </Svg>
  );
}

// ── 7 · The Raft paper's own rule (connecting) ─────────────────────────────
// The quote lands; under it, an old-term entry sits on a majority but stays dashed: counting it is not allowed.
// Then a current-term entry reaches the same majority, and one commit bar sweeps under both of them at once.
export function PaperRuleReveal({ t }: StepCtx) {
  const arrive = easeInOut(seg(t, 1.4, 1.9));
  return (
    <Svg label="Raft Paper, quoted" h={220}>
      <Quote t={t} lines={['only the current term is counted by replicas', 'earlier entries commit indirectly with it']} hot={0} y0={40} gap={38} beat={0.45} />
      <Cell x={200} y={128} f={C.latte} dash={t < 2.1} o={ez(t, 0.9)} />
      <T x={223} y={182} s={13} a="middle" f={C.latte} o={ez(t, 0.9)}>old term</T>
      <Cell x={262} y={lerp(100, 128, arrive)} f={C.focus} o={arrive} />
      <T x={330} y={182} s={13} f={C.crema} o={arrive}>current term</T>
      <Draw pts={[[200, 168], [308, 168]]} t={t} from={2.1} to={2.5} stroke={C.second} w={3} />
      <Decode text="committed" t={t} at={2.3} dur={0.4} x={330} y={150} s={13} f={C.second} w={600} />
    </Svg>
  );
}

// ── 8 · openraft's separation (connecting) ─────────────────────────────────
// The quote lands; under it, the log and the state machine part company. The real state machine slides out and a
// trivial one slides into its socket, and consensus, wired to the log alone, still gets its tick.
export function SeparationReveal({ t }: StepCtx) {
  const part = easeInOut(seg(t, 0.9, 1.4));
  const swap = easeInOut(seg(t, 1.6, 2.2));
  return (
    <Svg label="openraft README, quoted" h={220}>
      <Quote t={t} lines={['log storage, kept fully separate from state', 'consensus testable against a trivial state']} hot={1} y0={40} gap={38} beat={0.45} />
      <g opacity={ez(t, 0.8)}>
        <rect x={lerp(150, 80, part)} y={130} width={150} height={40} rx={6} fill="none" stroke={C.caramel} strokeWidth={2} />
        <T x={lerp(225, 155, part)} y={155} s={13} a="middle" f={C.crema}>log</T>
      </g>
      <g opacity={ez(t, 0.8) * (1 - swap)} transform={`translate(${(swap * 120).toFixed(1)} 0)`}>
        <rect x={lerp(300, 370, part)} y={130} width={150} height={40} rx={6} fill="none" stroke={C.latte} strokeWidth={2} />
        <T x={lerp(375, 445, part)} y={155} s={13} a="middle" f={C.latte}>state machine</T>
      </g>
      <g opacity={swap} transform={`translate(${((1 - swap) * -40).toFixed(1)} 0)`}>
        <rect x={395} y={135} width={100} height={30} rx={6} fill="none" stroke={C.second} strokeWidth={2} />
        <T x={445} y={155} s={13} a="middle" f={C.second}>trivial</T>
      </g>
      <path d="M155 196 l6 6 l12 -13" fill="none" stroke={C.focus} strokeWidth={2.5} strokeDasharray={30} strokeDashoffset={30 * (1 - ez(t, 2.3, 0.3))} />
      <T x={180} y={203} s={13} f={C.focus} o={ez(t, 2.3)}>consensus tested</T>
    </Svg>
  );
}

// ── 9 · Measured, all together ─────────────────────────────────────────────
// One follower's log runs through all three in order: the repair copies the leader's entries in, the old-term
// entry stays dashed and struck (not committed), then the current-term entry lands and one bar commits both.
export function CoherenceReveal({ t }: StepCtx) {
  const xs = [200, 260, 320, 380];
  const fill = (i: number) => easeInOut(seg(t, 0.15 + i * 0.12, 0.5 + i * 0.12));
  const arrive = easeInOut(seg(t, 1.6, 2.0));
  return (
    <Svg label="log_replication_commitment_rules.rs, measured" h={250}>
      <T x={30} y={51} s={13} f={C.latte}>follower</T>
      {xs.slice(0, 2).map((x, i) => (
        <Cell key={x} x={x} y={lerp(0, 30, fill(i))} f={C.latte} o={fill(i)} />
      ))}
      <Cell x={xs[2]} y={30} f={C.latte} dash={t < 2.1} o={ez(t, 0.8)} />
      {t > 1.0 && t < 2.1 && <path d={`M${xs[2] + 16} 76 l14 14 m0 -14 l-14 14`} stroke={C.cherryText} strokeWidth={2} />}
      <Cell x={xs[3]} y={lerp(0, 30, arrive)} f={C.focus} o={arrive} />
      <Draw pts={[[xs[2], 74], [xs[3] + 46, 74]]} t={t} from={2.1} to={2.5} stroke={C.second} w={3} />
      <Line t={t} at={0.4} y={130} text="repair: the real common prefix, found exactly" mark="tick" />
      <Line t={t} at={1.0} y={170} text="a previous term alone: not committed" mark="cross" mf={C.cherryText} />
      <Line t={t} at={1.9} y={210} text="the current term: commits both, together" mark="tick" mf={C.second} f={C.focus} />
    </Svg>
  );
}

// ── 10 · Recap ─────────────────────────────────────────────────────────────
export function Recap({ t }: StepCtx) {
  return (
    <RecapList
      t={t}
      label="recap: a real log, checked against the real rules"
      rows={['repair genuinely finds the real common prefix', 'no index is ever silently corrupted', 'a past term alone never commits by itself', 'the current term commits it, and the past too']}
    />
  );
}
