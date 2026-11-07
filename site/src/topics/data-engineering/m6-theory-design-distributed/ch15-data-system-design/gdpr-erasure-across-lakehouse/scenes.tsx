import { useEffect, useState } from 'react';
import { C, Draw, Reticle, Svg, T } from '../../../../../reels/kit';
import { easeInOut, easeOut, easeOutBack, lerp, seg } from '../../../../../reels/anim';
import type { StepCtx } from '../../../../../reels/types';

// CHAPTER.md, topic 20: the erasure request as a red thread entering a map of the shop's estate; the delete clears
// the lakehouse node only, the rest keep their red until each gets its mechanism, one node is drawn dashed in the
// blind-spot register with a human owner; a crossover chart with delete-and-expire rising and shredding flat after its
// up-front key cost. examples.py's estate: the lakehouse (table delete), a Kafka topic (tombstone and retention), the
// nightly backup (age out), a marketing export (restore and redact), a training set (registered blind spot);
// customer_42 indexed to events/part-0017 and orders/part-0003; delete-and-expire at 0.5 a request-day against 365-day
// backups, shredding 200,000 keys at 8 plus lookups (1,600,010), crossing near 8,767 requests a year.

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
const Box = ({ x, y, w, h = 32, label, lit = false, o = 1, dash, stroke, f, fill }: { x: number; y: number; w: number; h?: number; label: string; lit?: boolean; o?: number; dash?: string; stroke?: string; f?: string; fill?: string }) =>
  o <= 0 ? null : (
    <g opacity={Math.min(1, o)}>
      <rect x={x} y={y} width={w} height={h} rx={4} fill={fill ?? C.panel} stroke={stroke ?? (lit ? C.focus : C.line)} strokeWidth={lit ? 1.8 : 1.1} strokeDasharray={dash} />
      <T x={x + w / 2} y={y + h / 2 + 5} s={13} f={f ?? (lit ? C.focus : C.primary)} a="middle">
        {label}
      </T>
    </g>
  );

/** A red box for a place the name survives. */
const BadBox = ({ x, y, w, h = 32, label, o = 1 }: { x: number; y: number; w: number; h?: number; label: string; o?: number }) => <Box x={x} y={y} w={w} h={h} label={label} o={o} fill={C.bad} stroke={C.badText} f={C.focus} />;

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
      <line x1={x - 7} y1={y - 7} x2={x + 7} y2={y + 7} />
      <line x1={x + 7} y1={y - 7} x2={x - 7} y2={y + 7} />
    </g>
  );

const PLACES = ['kafka topic', 'backup', 'export', 'training set'];

// 1 · A red thread runs from the request into the lakehouse node, which clears to white and closes the ticket. Then the
// audit lights the four other places one by one: the name is still in each.
export function Hook({ t }: StepCtx) {
  const del = easeOut(seg(t, 0.9, 1.3));
  return (
    <Svg label="the lakehouse delete was correct; the name is still findable" h={270}>
      <Box x={10} y={26} w={150} label="erasure request" stroke={C.badText} f={C.badText} o={easeOut(seg(t, 0, 0.3))} />
      <Draw pts={[[160, 42], [190, 42]]} t={t} from={0.3} to={0.7} stroke={C.badText} w={2} pen={false} />
      <Box x={190} y={26} w={215} label={del > 0.5 ? 'lakehouse · deleted' : 'lakehouse'} lit={del > 0.5} o={easeOut(seg(t, 0.1, 0.4))} />
      <Box x={430} y={26} w={150} label="ticket closed" lit o={easeOut(seg(t, 1.3, 1.6))} />
      {PLACES.map((p, i) => {
        const x = 20 + i * 140;
        const found = easeOut(seg(t, 2.0 + i * 0.35, 2.3 + i * 0.35));
        return (
          <g key={p}>
            <line x1={300} y1={58} x2={x + 62} y2={110} stroke={C.line} opacity={easeOut(seg(t, 0.4, 0.7))} />
            {found < 0.5 ? <Box x={x} y={110} w={125} label={p} o={easeOut(seg(t, 0.5 + i * 0.1, 0.8 + i * 0.1))} /> : <BadBox x={x} y={110} w={125} label={p} />}
            <T x={x + 62} y={166} s={13} f={C.badText} a="middle" o={found}>
              name found
            </T>
          </g>
        );
      })}
      <Line2 y={214} l="the lakehouse delete" r="correct and complete" o={easeOut(seg(t, 1.4, 1.8))} />
      <Line2 y={242} l="days later, the audit" r="the name is still there" rc={C.badText} o={easeOut(seg(t, 3.5, 3.9))} />
    </Svg>
  );
}

// 2 · Two dashed slots under the question. After the pick, the first fills with the places a table delete never
// reaches, and the second with a lawyer's question, marked as having no technical answer.
export function Predict1({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const on = answer !== null;
  const a = on ? easeOut(seg(s, 0.3, 0.7)) : 0;
  const b = on ? easeOut(seg(s, 1.0, 1.4)) : 0;
  return (
    <Svg label="which parts of the design were missing?" h={210}>
      {[0, 1].map((i) => {
        const k = i === 0 ? a : b;
        const y = 30 + i * 70;
        return (
          <g key={i}>
            {k < 1 && <Box x={30} y={y} w={540} label="?" dash="4 3" o={easeOut(seg(t, 0.3 + i * 0.2, 0.6 + i * 0.2)) * (1 - k)} />}
            {k > 0 && <Box x={30} y={y} w={540} label={i === 0 ? 'every place a table delete never reaches' : 'what counts as erased: a legal question'} lit o={k} />}
          </g>
        );
      })}
      {b > 0 && (
        <T x={570} y={152} s={13} f={C.second} a="end" o={easeOut(seg(s, 1.4, 1.8))}>
          no technical answer
        </T>
      )}
      <T x={300} y={192} s={14} f={C.secondary} a="middle" o={easeOut(seg(t, 1.0, 1.4)) * (on ? 0.5 : 1)}>
        the delete itself was not the bug
      </T>
    </Svg>
  );
}

// 3 · The subject chip passes through an index box; out of a grid of forty files, exactly two light up, and their
// paths print below. No full scan.
export function RevealSubjectIndex({ t }: StepCtx) {
  const go = easeInOut(seg(t, 0.6, 1.2));
  const hit = easeOut(seg(t, 1.4, 1.8));
  const HITS = [9, 26];
  return (
    <Svg label="an index maps the subject straight to their own files" h={210}>
      <Box x={30} y={50} w={130} label="customer_42" lit o={easeOut(seg(t, 0, 0.3))} />
      <Box x={200} y={40} w={130} h={52} label="subject index" o={easeOut(seg(t, 0.2, 0.5))} stroke={go > 0.5 ? C.focus : undefined} />
      <Draw pts={[[160, 66], [200, 66]]} t={t} from={0.5} to={0.8} stroke={C.focus} w={1.6} pen={false} />
      {Array.from({ length: 40 }, (_, i) => {
        const x = 370 + (i % 8) * 25;
        const y = 20 + Math.floor(i / 8) * 22;
        const isHit = HITS.includes(i);
        return <rect key={i} x={x} y={y} width={20} height={16} rx={2} fill={isHit && hit > 0.5 ? C.focus : C.band} stroke={isHit && hit > 0.5 ? C.focus : C.line} opacity={easeOut(seg(t, 0.2 + i * 0.01, 0.5 + i * 0.01))} />;
      })}
      {hit > 0 &&
        HITS.map((h, i) => (
          <line key={h} x1={330} y1={66} x2={lerp(330, 380 + (h % 8) * 25, hit)} y2={lerp(66, 28 + Math.floor(h / 8) * 22, hit)} stroke={C.focus} strokeWidth={1.3} />
        ))}
      <T x={30} y={162} s={13} f={C.focus} o={easeOut(seg(t, 1.8, 2.2))}>
        events/part-0017.parquet
      </T>
      <T x={30} y={184} s={13} f={C.focus} o={easeOut(seg(t, 2.1, 2.5))}>
        orders/part-0003.parquet
      </T>
      <T x={575} y={184} s={13} f={C.secondary} a="end" o={easeOut(seg(t, 2.6, 3.0))}>
        no full scan
      </T>
    </Svg>
  );
}

const BLIND = ['spreadsheet', 'trained model', 'export'];

// 4 · A dashed lineage boundary holds the lakehouse and its pipelines. Three places outside it light up one by one;
// each is entered in the register with a named human owner.
export function RevealBlindSpots({ t }: StepCtx) {
  return (
    <Svg label="a spreadsheet, a model, an export: a register names the owner" h={240}>
      <g opacity={easeOut(seg(t, 0, 0.3))}>
        <rect x={30} y={24} width={220} height={170} rx={10} fill="none" stroke={C.secondary} strokeDasharray="5 4" />
        <T x={44} y={44} s={13} f={C.secondary}>
          lineage reaches
        </T>
        <Box x={60} y={64} w={160} h={28} label="lakehouse" />
        <Box x={60} y={104} w={160} h={28} label="kafka topic" />
        <Box x={60} y={144} w={160} h={28} label="backup" />
      </g>
      <T x={290} y={18} s={13} f={C.secondary} o={easeOut(seg(t, 0.5, 0.8))}>
        register
      </T>
      {BLIND.map((b, i) => {
        const at = 0.8 + i * 0.8;
        const y = 30 + i * 56;
        return (
          <g key={b}>
            <Box x={290} y={y} w={140} label={b} dash="4 3" o={easeOut(seg(t, at, at + 0.3))} stroke={C.second} f={C.second} />
            <Box x={450} y={y} w={120} label="owner: named" lit o={easeOut(seg(t, at + 0.4, at + 0.7))} />
          </g>
        );
      })}
      <T x={300} y={226} s={13} f={C.secondary} a="middle" o={easeOut(seg(t, 3.4, 3.8))}>
        named, not pretended away
      </T>
    </Svg>
  );
}

// 5 · Two snapshots hold the subject (red dots). The delete writes a clean third snapshot, but a time-travel arrow back
// to the second still finds the subject. The expiry line sweeps the old snapshots away, inside the legal deadline.
export function RevealDeleteExpire({ t }: StepCtx) {
  const s3 = easeOutBack(seg(t, 0.6, 1.0));
  const tt = easeOut(seg(t, 1.4, 1.8));
  const sweep = easeInOut(seg(t, 2.4, 3.4));
  const sx = lerp(40, 268, sweep);
  return (
    <Svg label="a delete writes a snapshot; expiry is the real deadline" h={210}>
      {[0, 1].map((i) => {
        const x = 60 + i * 110;
        const gone = x + 90 < sx;
        return (
          <g key={i} opacity={easeOut(seg(t, 0, 0.3)) * (gone ? 0.1 : 1)}>
            <rect x={x} y={40} width={90} height={40} rx={4} fill={C.panel} stroke={C.line} />
            <circle cx={x + 45} cy={60} r={6} fill={C.badText} />
          </g>
        );
      })}
      {s3 > 0 && (
        <g opacity={Math.min(1, s3)}>
          <rect x={265} y={40} width={120} height={40} rx={4} fill={C.panel} stroke={C.focus} strokeWidth={1.8} />
          <T x={325} y={65} s={13} f={C.focus} a="middle">
            after delete
          </T>
        </g>
      )}
      {tt > 0 && sweep < 0.6 && (
        <g opacity={tt * (1 - sweep / 0.6)}>
          <path d="M325 86 C325 120 215 120 215 86" fill="none" stroke={C.badText} strokeWidth={1.5} strokeDasharray="4 3" />
          <T x={270} y={134} s={13} f={C.badText} a="middle">
            time travel still reads it
          </T>
        </g>
      )}
      {sweep > 0 && sweep < 1 && <line x1={sx} y1={30} x2={sx} y2={90} stroke={C.focus} strokeWidth={2} />}
      {sweep > 0.9 && (
        <T x={160} y={134} s={13} f={C.focus} a="middle" o={easeOut(seg(t, 3.3, 3.6))}>
          expired, files purged
        </T>
      )}
      <Line2 y={170} l="expiry schedule" r="inside the legal deadline" o={easeOut(seg(t, 3.5, 3.9))} />
      <Line2 y={196} l="against" r="the audit-retention window" rc={C.second} o={easeOut(seg(t, 3.8, 4.2))} />
    </Svg>
  );
}

const COPIES = ['lakehouse', 'backup', 'replica', 'export'];

// 6 · One per-subject key wires to four encrypted copies. The key is deleted (red ✕) and all four copies flip to
// unreadable together. Two cost tags follow: a key per subject, a lookup per read.
export function RevealCryptoShred({ t }: StepCtx) {
  const del = easeOut(seg(t, 1.6, 2.0));
  return (
    <Svg label="one key deleted; every copy, including backups, goes unreadable" h={210}>
      <Box x={30} y={70} w={150} label={del > 0.5 ? 'key deleted' : 'customer_42 key'} lit={del < 0.5} o={easeOut(seg(t, 0, 0.3))} stroke={del > 0.5 ? C.badText : undefined} f={del > 0.5 ? C.badText : undefined} />
      <Cross x={170} y={72} k={del} />
      {COPIES.map((c, i) => {
        const y = 14 + i * 38;
        return (
          <g key={c}>
            <line x1={180} y1={86} x2={300} y2={y + 15} stroke={del > 0.5 ? C.line : C.secondary} opacity={easeOut(seg(t, 0.3 + i * 0.1, 0.6 + i * 0.1))} />
            <Box x={300} y={y} w={200} h={30} label={del > 0.5 ? `${c} · unreadable` : `${c} · encrypted`} o={easeOut(seg(t, 0.3 + i * 0.1, 0.6 + i * 0.1))} f={del > 0.5 ? C.quiet : C.primary} />
          </g>
        );
      })}
      <Line2 y={190} l="the trade" r="a key per subject, a lookup per read" rc={C.second} o={easeOut(seg(t, 2.8, 3.2))} />
    </Svg>
  );
}

const GX = (r: number) => 60 + (r / 15000) * 480;
const GY = (c: number) => 170 - (c / 3000000) * 140;
const SHRED = 1600010;
const CROSS = SHRED / (365 * 0.5);

// 7 · Delete-and-expire's cost rises with request rate against 365-day backups; shredding sits flat at its up-front
// key cost. A marker runs along the request axis and counts to where they cross: about 8,767 requests a year.
export function RevealCrossover({ t }: StepCtx) {
  const run = easeInOut(seg(t, 2.0, 3.0));
  return (
    <Svg label="delete-and-expire rises with backups kept; shredding stays flat" h={210}>
      <g opacity={easeOut(seg(t, 0, 0.3))} stroke={C.line}>
        <line x1={60} y1={170} x2={540} y2={170} />
        <line x1={60} y1={24} x2={60} y2={170} />
      </g>
      <T x={66} y={22} s={13} f={C.secondary} o={easeOut(seg(t, 0, 0.3))}>
        cost a year
      </T>
      <Draw pts={[[GX(0), GY(0)], [GX(15000), GY(15000 * 182.5)]]} t={t} from={0.3} to={1.2} stroke={C.focus} w={2} />
      <Draw pts={[[GX(0), GY(SHRED)], [GX(15000), GY(SHRED)]]} t={t} from={0.9} to={1.8} stroke={C.second} w={2} />
      <T x={470} y={44} s={13} f={C.focus} a="end" o={easeOut(seg(t, 1.0, 1.3))}>
        delete and expire
      </T>
      <T x={540} y={GY(SHRED) + 20} s={13} f={C.second} a="end" o={easeOut(seg(t, 1.6, 1.9))}>
        crypto shredding
      </T>
      {run > 0 && (
        <g>
          <circle cx={GX(CROSS * run)} cy={170} r={4} fill={C.focus} />
          <line x1={GX(CROSS * run)} y1={170} x2={GX(CROSS * run)} y2={GY(CROSS * run * 182.5)} stroke={C.secondary} strokeDasharray="3 3" />
          <T x={GX(CROSS)} y={190} s={14} f={run > 0.98 ? C.focus : C.primary} a="middle">
            {`${Math.round(CROSS * run).toLocaleString('en-US')} a year`}
          </T>
        </g>
      )}
      <Reticle x={GX(CROSS)} y={GY(SHRED)} w={16} h={16} t={t} at={3.0} />
      <T x={540} y={190} s={13} f={C.secondary} a="end" o={easeOut(seg(t, 0.2, 0.5))}>
        requests
      </T>
    </Svg>
  );
}

const DOCS = ['snapshots after expiry', 'physical file listing', 'key deletion record', 'repeat search: nothing'];

// 8 · Four evidence cards slide one by one into a proof bundle for customer_42, each leaving a check. Then more
// bundles stamp out behind it, one per request.
export function RevealProof({ t }: StepCtx) {
  const more = easeOut(seg(t, 3.0, 3.6));
  return (
    <Svg label="an automated pipeline assembles proof for every request" h={240}>
      {more > 0 &&
        [2, 1].map((k) => <rect key={k} x={300 + k * 6} y={40 + k * 6} width={280} height={110} rx={6} fill={C.panel} stroke={C.line} opacity={more} />)}
      <rect x={300} y={40} width={280} height={110} rx={6} fill={C.panel} stroke={C.focus} opacity={easeOut(seg(t, 0.2, 0.5))} />
      <T x={300} y={30} s={13} f={C.secondary} o={easeOut(seg(t, 0.2, 0.5))}>
        proof · customer_42
      </T>
      {DOCS.map((d, i) => {
        const at = 0.4 + i * 0.55;
        const p = easeInOut(seg(t, at, at + 0.45));
        const y0 = 20 + i * 44;
        return (
          <g key={d}>
            <Tick x={556} y={58 + i * 22} k={easeOut(seg(t, at + 0.45, at + 0.7))} />
            {p >= 1 && (
              <T x={312} y={62 + i * 22} s={13} f={C.focus}>
                {d}
              </T>
            )}
            {p < 1 && <Box x={lerp(30, 325, p)} y={lerp(y0, 76, p)} w={230} h={30} label={d} o={easeOut(seg(t, 0.1 + i * 0.1, 0.4 + i * 0.1)) * (1 - p * 0.6)} />}
          </g>
        );
      })}
      <T x={30} y={226} s={13} f={C.secondary} o={easeOut(seg(t, 3.4, 3.8))}>
        emitted for every request, not on demand
      </T>
    </Svg>
  );
}

// 9 · Five glyph rows, each drawing its picture and then its line.
export function Recap({ t }: StepCtx) {
  const ROWS: [string, string, string?][] = [
    ['subject index', 'straight to the files'],
    ['register', 'names the blind spots', C.second],
    ['delete, expire', 'the real deadline'],
    ['crypto shredding', 'past the crossover'],
    ['proof', 'for every request'],
  ];
  return (
    <Svg label="an index, a register, a schedule, a shred option, and proof" h={290}>
      {ROWS.map(([l, r, c], i) => {
        const y = 40 + i * 55;
        const at = i * 0.65;
        return (
          <g key={l} opacity={easeOut(seg(t, at, at + 0.4))}>
            {i === 0 && [0, 1, 2, 3, 4, 5, 6, 7].map((j) => <rect key={j} x={30 + (j % 4) * 20} y={y - 16 + Math.floor(j / 4) * 10} width={16} height={8} fill={j === 2 || j === 5 ? C.focus : C.band} stroke={C.line} />)}
            {i === 1 && <rect x={30} y={y - 14} width={78} height={16} rx={3} fill="none" stroke={C.second} strokeDasharray="4 3" />}
            {i === 2 && (
              <g>
                {[0, 1].map((j) => (
                  <rect key={j} x={30 + j * 26} y={y - 14} width={22} height={16} rx={2} fill="none" stroke={C.line} opacity={0.3} />
                ))}
                <rect x={82} y={y - 14} width={26} height={16} rx={2} fill="none" stroke={C.focus} />
              </g>
            )}
            {i === 3 && (
              <g>
                <rect x={30} y={y - 14} width={28} height={16} rx={2} fill={C.bad} stroke={C.badText} />
                {[0, 1, 2].map((j) => (
                  <rect key={j} x={66 + j * 15} y={y - 14} width={11} height={16} rx={2} fill={C.band} stroke={C.line} />
                ))}
              </g>
            )}
            {i === 4 && [0, 1, 2].map((j) => <rect key={j} x={30 + j * 6} y={y - 16 + j * 3} width={60} height={16} rx={2} fill={C.panel} stroke={j === 2 ? C.focus : C.line} />)}
            <Line2 y={y} l={l} r={r} lx={125} lc={C.primary} rc={c ?? C.focus} o={easeOut(seg(t, at + 0.2, at + 0.5))} />
          </g>
        );
      })}
    </Svg>
  );
}

// 10 · Two regions, each with its own subject index and register; the subject's replica sits in the second, red. Before
// the pick the request arrow reaches only the first region. After, a second arrow reaches the second, its index finds
// the replica, and both regions take a check.
export function ProveIt({ t, answer }: StepCtx) {
  const s = useSinceAnswer(answer !== null);
  const on = answer !== null;
  const reach = on ? easeInOut(seg(s, 0.3, 0.9)) : 0;
  const found = on ? easeOut(seg(s, 1.0, 1.4)) : 0;
  const done = on ? easeOut(seg(s, 1.6, 2.0)) : 0;
  return (
    <Svg label="a second request arrives; the data was replicated to a new region" h={250}>
      {['first region', 'second region'].map((r, i) => {
        const x = 30 + i * 290;
        return (
          <g key={r} opacity={easeOut(seg(t, i * 0.2, 0.3 + i * 0.2))}>
            <rect x={x} y={20} width={250} height={120} rx={6} fill="none" stroke={C.line} />
            <T x={x + 12} y={40} s={13} f={C.secondary}>
              {r}
            </T>
            <Box x={x + 12} y={52} w={110} h={26} label="index" />
            <Box x={x + 128} y={52} w={110} h={26} label="register" />
          </g>
        );
      })}
      {found < 0.5 ? (
        <BadBox x={332} y={96} w={226} h={28} label="replica · customer_42" o={easeOut(seg(t, 0.6, 0.9))} />
      ) : (
        <Box x={332} y={96} w={226} h={28} label="replica · erased" lit />
      )}
      <Box x={225} y={166} w={150} h={30} label="erasure request" stroke={C.badText} f={C.badText} o={easeOut(seg(t, 0.4, 0.7))} />
      <line x1={260} y1={166} x2={155} y2={140} stroke={C.badText} strokeWidth={1.6} opacity={easeOut(seg(t, 0.7, 1.0))} />
      {reach > 0 && <line x1={340} y1={166} x2={lerp(340, 445, reach)} y2={lerp(166, 140, reach)} stroke={C.badText} strokeWidth={1.6} />}
      <Tick x={265} y={36} k={done} />
      <Tick x={555} y={36} k={done} />
      <T x={300} y={230} s={13} f={on ? C.focus : C.secondary} a="middle" o={easeOut(seg(t, 1.0, 1.4))}>
        {on ? 'every region the data was placed in' : 'just like a single-region request?'}
      </T>
    </Svg>
  );
}
