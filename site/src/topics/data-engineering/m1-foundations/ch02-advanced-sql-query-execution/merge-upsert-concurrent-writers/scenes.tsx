import { useEffect, useState } from 'react';
import type { StepCtx } from '../../../../../reels/types';
import { clamp, easeInOut, easeOut, easeOutBack, lerp, seg } from '../../../../../reels/anim';
import { C, Svg, T } from '../../../../../reels/kit';

// Colour grammar: caramel = the action that succeeds, cherryText = the collision or the costly path, crema = data,
// latte = labels, taupe = structure.

function Box({ x, y, w, h = 36, label, hi = false, bad = false, o = 1 }: { x: number; y: number; w: number; h?: number; label: string; hi?: boolean; bad?: boolean; o?: number }) {
  return (
    <g opacity={o}>
      <rect x={x} y={y} width={w} height={h} rx={8} fill={C.cocoa} stroke={bad ? C.cherryText : hi ? C.caramel : C.mocha} strokeWidth={hi || bad ? 2 : 1} />
      <T x={x + w / 2} y={y + h / 2 + 5} s={13} f={bad ? C.cherryText : C.crema} a="middle">
        {label}
      </T>
    </g>
  );
}

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

// 1 · The problem: five staged rows, a target, and a question per row. Then one cursor crawls the rows one at a time.
export function Problem({ t: t0 }: StepCtx) {
  const t = t0 * 1.85;
  const stage = ['riesling +6', 'syrah +5', 'merlot −3', 'malbec +2', 'rioja −3'];
  const target = ['merlot 10', 'malbec 4', 'rioja 3'];
  const a = easeOut(seg(t, 0.5, 1.2));
  const crawl = seg(t, 2.6, 6.1);
  const cur = Math.min(4, Math.floor(crawl * 5));
  return (
    <Svg label="Five staged rows arrive at a target table; each might be new, existing, or a deletion, and row-by-row code is slow and racy" h={300}>
      {stage.map((s, i) => {
        const k = easeOut(seg(t, i * 0.15, i * 0.15 + 0.4));
        const on = crawl > 0 && crawl < 1 && cur === i;
        return (
          <g key={s} opacity={k}>
            <rect x={25} y={36 + i * 46} width={150} height={36} rx={8} fill={C.cocoa} stroke={on ? C.caramel : C.mocha} strokeWidth={on ? 2 : 1} />
            <T x={100} y={59 + i * 46} s={13} f={C.crema} a="middle">
              {s}
            </T>
          </g>
        );
      })}
      <rect x={400} y={36} width={175} height={222} rx={10} fill={C.roast} stroke={C.mocha} opacity={a} />
      <T x={487} y={64} s={14} f={C.latte} a="middle" o={a}>
        target
      </T>
      {target.map((r, i) => (
        <T key={r} x={487} y={108 + i * 44} s={13} f={C.crema} a="middle" o={easeOut(seg(t, 0.8 + i * 0.15, 1.2 + i * 0.15))}>
          {r}
        </T>
      ))}
      {stage.map((s, i) => {
        const k = easeOut(seg(t, 1.0 + i * 0.2, 1.5 + i * 0.2));
        const y = 54 + i * 46;
        return (
          <g key={'q' + s} opacity={k}>
            <line x1={180} y1={y} x2={180 + 210 * k} y2={y} stroke={C.taupe} strokeWidth={1.5} strokeDasharray="4 5" />
            <T x={288} y={y - 6} s={16} f={C.caramel} a="middle" w={700}>
              ?
            </T>
          </g>
        );
      })}
      <T x={25} y={288} s={13} f={C.cherryText} o={easeOut(seg(t, 2.8, 3.4))}>
        one row at a time: slow, and racy
      </T>
    </Svg>
  );
}

// 2 · MERGE: each staged row is classified, then flies into its action bin; the bins fill 2, 2, 1.
export function MergeActions({ t: t0 }: StepCtx) {
  const t = t0 * 1.05;
  const stage = [
    ['riesling', 'not matched', 0],
    ['syrah', 'not matched', 0],
    ['merlot', 'matched', 1],
    ['malbec', 'matched', 1],
    ['rioja', 'matched', 2],
  ] as const;
  const bins = [
    ['insert', C.caramel],
    ['update', C.crema],
    ['delete', C.cherryText],
  ] as const;
  const slot = [0, 1, 0, 1, 0];
  return (
    <Svg label="MERGE classifies 5 staged rows as matched or not and runs one branch each: 2 inserted, 2 updated, 1 deleted" h={300}>
      {stage.map((r, i) => {
        const y = 30 + i * 50;
        const tag = easeOut(seg(t, 0.6 + i * 0.25, 1.0 + i * 0.25));
        const fly = easeInOut(seg(t, 2.2 + i * 0.35, 2.9 + i * 0.35));
        const bx = 455 + slot[i] * 58;
        const by = 50 + r[2] * 82;
        const col = bins[r[2]][1];
        return (
          <g key={r[0]}>
            <rect x={25} y={y} width={100} height={34} rx={8} fill={C.cocoa} stroke={C.mocha} opacity={easeOut(seg(t, i * 0.12, i * 0.12 + 0.4))} />
            <T x={75} y={y + 22} s={13} f={C.crema} a="middle" o={easeOut(seg(t, i * 0.12, i * 0.12 + 0.4))}>
              {r[0]}
            </T>
            <T x={140} y={y + 22} s={13} f={r[1] === 'matched' ? C.crema : C.latte} o={tag * (1 - 0.5 * fly)}>
              {r[1]}
            </T>
            {fly > 0 && <rect x={lerp(25, bx, fly)} y={lerp(y, by, fly)} width={lerp(100, 46, fly)} height={lerp(34, 30, fly)} rx={6} fill={col} opacity={0.35 + 0.5 * fly} />}
          </g>
        );
      })}
      {bins.map((b, i) => {
        const k = easeOut(seg(t, 1.8, 2.3));
        const n = stage.filter((r, j) => r[2] === i && seg(t, 2.9 + j * 0.35, 3.0 + j * 0.35) >= 1).length;
        return (
          <g key={b[0]} opacity={k}>
            <T x={300} y={72 + i * 82} s={18} f={b[1]} w={700}>
              {b[0]}
            </T>
            <rect x={450} y={44 + i * 82} width={120} height={42} rx={8} fill="none" stroke={C.taupe} strokeDasharray="4 4" />
            <T x={422} y={72 + i * 82} s={16} f={C.crema} w={700}>
              {n}
            </T>
          </g>
        );
      })}
      <T x={25} y={288} s={13} f={C.latte} o={easeOut(seg(t, 4.4, 4.9))}>
        one statement, three actions
      </T>
    </Svg>
  );
}

// 3 · Two source rows aim at one target row: the first lands and changes it, the second is stopped with an error.
export function Duplicates({ t: t0 }: StepCtx) {
  const t = t0 * 1.32;
  const a = easeOut(seg(t, 0.3, 0.8));
  const da = easeInOut(seg(t, 0.8, 1.6));
  const b = easeOut(seg(t, 1.8, 2.2));
  const db = easeInOut(seg(t, 2.2, 3.0));
  const hit = seg(t, 3.0, 3.2);
  const shake = hit > 0 && t < 3.6 ? Math.sin(t * 60) * 4 * (1 - seg(t, 3.0, 3.6)) : 0;
  const stock = da >= 1 ? 13 : 10;
  return (
    <Svg label="Two source rows target the same row: the first changes it, the second attempt raises an error instead of a silent pick" h={290}>
      <Box x={25} y={50} w={130} label="merlot +3" hi o={a} />
      <Box x={25} y={130} w={130} label="merlot +5" bad o={b} />
      <line x1={155} y1={68} x2={lerp(155, 340, da)} y2={lerp(68, 96, da)} stroke={C.caramel} strokeWidth={3} opacity={a} />
      <line x1={155} y1={148} x2={lerp(155, 330, db)} y2={lerp(148, 112, db)} stroke={C.cherryText} strokeWidth={3} strokeDasharray="6 5" opacity={b} />
      <g transform={`translate(${shake} 0)`}>
        <rect x={340} y={78} width={160} height={40} rx={8} fill={C.cocoa} stroke={hit > 0 ? C.cherryText : C.mocha} strokeWidth={hit > 0 ? 2 : 1} />
        <T x={420} y={103} s={13} f={C.crema} a="middle">
          merlot: {stock}
        </T>
      </g>
      {hit > 0 && (
        <g opacity={hit} stroke={C.cherryText} strokeWidth={3}>
          <line x1={318} y1={100} x2={334} y2={116} />
          <line x1={334} y1={100} x2={318} y2={116} />
        </g>
      )}
      <T x={25} y={230} s={16} f={C.cherryText} w={700} o={easeOut(seg(t, 3.2, 3.7))}>
        second attempt: error
      </T>
      <T x={25} y={264} s={13} f={C.latte} o={easeOut(seg(t, 3.3, 3.7))}>
        loud on purpose: no silent data loss
      </T>
    </Svg>
  );
}

// 4 · Predict: the two changes pulse toward the wine in turn. After the answer, the second one breaks and the fix appears.
export function DuplicatePredict({ t, answer }: StepCtx) {
  const answered = answer !== null;
  const s = useSinceAnswer(answered);
  const which = Math.floor(t / 1.2) % 2;
  const err = answered ? easeOut(seg(s, 0.3, 0.8)) : 0;
  const fix = answered ? easeOut(seg(s, 1.6, 2.2)) : 0;
  const lineTo = (y: number, on: boolean, bad: boolean) => (
    <line x1={155} y1={y} x2={330} y2={103} stroke={bad ? C.cherryText : on ? C.caramel : C.taupe} strokeWidth={on || bad ? 3 : 1.5} strokeDasharray={bad ? '6 5' : undefined} />
  );
  return (
    <Svg label="Two staged updates for one existing wine; MERGE raises an error, and the fix is one row per key in the source" h={280}>
      <Box x={25} y={60} w={130} label="stage: +3" o={1 - fix * 0.6} />
      <Box x={25} y={128} w={130} label="stage: +5" bad={answered} o={1 - fix * 0.6} />
      {lineTo(78, !answered && which === 0, false)}
      {lineTo(146, !answered && which === 1, answered)}
      <Box x={330} y={85} w={160} label="wine: stock 10" />
      {!answered ? (
        <T x={540} y={112} s={40} f={C.caramel} a="middle" o={0.75 + 0.25 * Math.sin(t * 3)}>
          ?
        </T>
      ) : (
        <>
          <g opacity={err} stroke={C.cherryText} strokeWidth={3}>
            <line x1={300} y1={112} x2={318} y2={130} />
            <line x1={318} y1={112} x2={300} y2={130} />
          </g>
          <T x={25} y={222} s={18} f={C.cherryText} w={700} o={err}>
            error, not a silent pick
          </T>
          <T x={25} y={258} s={14} f={C.caramel} o={fix}>
            fix: one row per key in the source
          </T>
        </>
      )}
    </Svg>
  );
}

// 5 · ON CONFLICT: the insert reaches the unique index, finds the key taken, and turns into an update inside it. Other sessions'
// inserts hit the same index and each still gets one of two outcomes.
export function Atomic({ t: t0 }: StepCtx) {
  const t = t0 * 1.22;
  const a = easeOut(seg(t, 0.2, 0.6));
  const go = easeInOut(seg(t, 0.6, 1.4));
  const box = easeOut(seg(t, 1.2, 1.7));
  const probe = seg(t, 1.8, 2.4);
  const turn = easeOut(seg(t, 2.6, 3.2));
  const keys = ['a', 'f', 'k', 'q'];
  const others = [0, 1, 2];
  return (
    <Svg label="INSERT ON CONFLICT tries to insert, finds the key taken in the unique index and turns into an update atomically: one of two outcomes, always" h={290}>
      <rect x={lerp(25, 95, go)} y={100} width={130} height={36} rx={8} fill={C.cocoa} stroke={C.caramel} strokeWidth={2} opacity={a} />
      <T x={lerp(90, 160, go)} y={123} s={13} f={C.crema} a="middle" o={a}>
        INSERT key k
      </T>
      <rect x={250} y={60} width={160} height={120} rx={10} fill={C.roast} stroke={C.caramel} strokeWidth={2} opacity={box} />
      <T x={330} y={84} s={13} f={C.latte} a="middle" o={box}>
        unique index
      </T>
      {keys.map((k, i) => {
        const lit = k === 'k' && probe > 0;
        return (
          <g key={k} opacity={box}>
            <rect x={262 + i * 36} y={100} width={30} height={30} rx={5} fill={lit ? C.caramel : C.cocoa} stroke={C.mocha} />
            <T x={277 + i * 36} y={120} s={13} f={lit ? C.void : C.crema} a="middle">
              {k}
            </T>
          </g>
        );
      })}
      <T x={330} y={160} s={13} f={C.caramel} a="middle" o={easeOut(seg(t, 2.0, 2.4))}>
        key taken
      </T>
      <path d="M410 120 C 440 120 440 80 470 80" fill="none" stroke={C.taupe} strokeWidth={1.5} opacity={turn} />
      <path d="M410 120 C 440 120 440 160 470 160" fill="none" stroke={C.caramel} strokeWidth={2.5} opacity={turn} />
      <T x={480} y={85} s={14} f={C.latte} o={turn}>
        insert
      </T>
      <T x={480} y={165} s={14} f={C.caramel} w={700} o={turn}>
        update
      </T>
      {others.map((i) => {
        const p = seg(t, 2.6 + i * 0.3, 3.2 + i * 0.3);
        return p > 0 && p < 1 ? <circle key={i} cx={290 + i * 40} cy={lerp(14, 58, p * p)} r={6} fill={C.crema} opacity={1 - p * 0.5} /> : null;
      })}
      <T x={25} y={260} s={15} f={C.caramel} w={700} o={easeOut(seg(t, 3.4, 3.9))}>
        one of two outcomes, always
      </T>
    </Svg>
  );
}

// 6 · The gap: A's playhead reads (not matched), the gap opens, B commits key k inside it, and A's insert collides.
export function Gap({ t: t0 }: StepCtx) {
  const t = t0 * 1.3;
  const ph = 25 + 550 * clamp(t / 5.0);
  const read = easeOut(seg(t, 0.8, 1.2));
  const gapW = 290 * easeInOut(seg(t, 1.2, 3.2));
  const bDot = easeOutBack(seg(t, 2.2, 2.6));
  const drop = Math.pow(seg(t, 2.6, 3.0), 2);
  const hit = seg(t, 3.6, 3.8);
  const ins = easeOut(seg(t, 3.4, 3.7));
  return (
    <Svg label="MERGE reads and decides not matched, then inserts; another session commits the same key in the gap and the insert hits a unique violation" h={300}>
      <T x={25} y={20} s={14} f={C.latte}>
        session A: MERGE
      </T>
      <line x1={25} y1={60} x2={575} y2={60} stroke={C.taupe} strokeWidth={2} />
      <circle cx={140} cy={60} r={9} fill={C.crema} opacity={read} />
      <T x={140} y={44} s={13} f={C.crema} a="middle" o={read}>
        reads: not matched
      </T>
      <rect x={150} y={52} width={gapW} height={16} rx={6} fill="none" stroke={C.latte} strokeDasharray="5 4" opacity={gapW > 2 ? 1 : 0} />
      <T x={290} y={92} s={13} f={C.latte} a="middle" o={easeOut(seg(t, 2.0, 2.4))}>
        the gap
      </T>
      <circle cx={440} cy={60} r={9 + 6 * hit * (1 - seg(t, 3.8, 4.3))} fill={hit > 0 ? C.cherryText : C.caramel} opacity={ins} />
      <T x={440} y={44} s={13} f={hit > 0 ? C.cherryText : C.caramel} a="middle" o={ins}>
        inserts
      </T>
      <T x={25} y={150} s={14} f={C.latte}>
        session B
      </T>
      <line x1={25} y1={166} x2={575} y2={166} stroke={C.taupe} strokeWidth={2} />
      <circle cx={290} cy={166} r={9} fill={C.cherryText} opacity={bDot} />
      <T x={290} y={194} s={13} f={C.cherryText} a="middle" o={easeOut(seg(t, 2.3, 2.7))}>
        commits key k
      </T>
      {drop > 0 && <line x1={290} y1={157} x2={290} y2={lerp(157, 104, drop)} stroke={C.cherryText} strokeWidth={2} strokeDasharray="4 4" />}
      <T x={575} y={244} s={18} f={C.cherryText} a="end" w={700} o={easeOut(seg(t, 3.8, 4.3))}>
        unique violation
      </T>
      <T x={25} y={284} s={13} f={C.latte} o={easeOut(seg(t, 4.0, 4.5))}>
        no going back to the update branch
      </T>
      <rect x={ph - 2} y={30} width={4} height={150} fill={C.latte} opacity={t < 5.0 ? 0.25 : 0} />
    </Svg>
  );
}

// 7 · Predict the gap. After the answer: A's insert drives into the index, collides, and a retry loop takes the update branch.
export function GapPredict({ t, answer }: StepCtx) {
  const answered = answer !== null;
  const s = useSinceAnswer(answered);
  const go = answered ? easeInOut(seg(s, 0.2, 0.9)) : 0;
  const hit = answered ? seg(s, 0.9, 1.1) : 0;
  const retry = answered ? easeInOut(seg(s, 2.0, 3.0)) : 0;
  const upd = answered ? easeOut(seg(s, 3.0, 3.5)) : 0;
  return (
    <Svg label="A decided to insert; B committed the same key first; A fails with a uniqueness violation and must retry" h={290}>
      <Box x={25} y={60} w={170} label="A: decided INSERT" bad={hit > 0} />
      <Box x={25} y={124} w={170} label="B: committed key k" hi />
      <rect x={300} y={70} width={130} height={90} rx={10} fill={C.roast} stroke={hit > 0 ? C.cherryText : C.mocha} strokeWidth={hit > 0 ? 2 : 1} />
      <T x={365} y={96} s={13} f={C.latte} a="middle">
        unique index
      </T>
      <T x={365} y={128} s={14} f={C.caramel} a="middle" w={700}>
        k
      </T>
      <line x1={195} y1={142} x2={300} y2={128} stroke={C.caramel} strokeWidth={2} />
      {!answered ? (
        <T x={510} y={128} s={44} f={C.caramel} a="middle" o={0.75 + 0.25 * Math.sin(t * 3)}>
          ?
        </T>
      ) : (
        <>
          <line x1={195} y1={78} x2={lerp(195, 300, go)} y2={lerp(78, 100, go)} stroke={hit > 0 ? C.cherryText : C.crema} strokeWidth={3} />
          <T x={25} y={210} s={18} f={C.cherryText} w={700} o={easeOut(seg(s, 1.0, 1.5))}>
            A fails: uniqueness violation
          </T>
          <path d="M110 230 C 60 290 300 290 300 240" fill="none" stroke={C.caramel} strokeWidth={2} strokeDasharray="220" strokeDashoffset={220 * (1 - retry)} />
          <T x={320} y={262} s={14} f={C.caramel} w={700} o={upd}>
            retry: update
          </T>
        </>
      )}
    </Svg>
  );
}

// 8 · Choose: a decision spine with two branches, each answer drawn as the narration names it.
export function Choose({ t: t0 }: StepCtx) {
  const t = t0 * 1.4;
  const q = easeOut(seg(t, 0.2, 0.7));
  const b1 = easeOut(seg(t, 1.0, 1.6));
  const b2 = easeOut(seg(t, 2.6, 3.2));
  const spin = seg(t, 2.6, 3.4) * 360;
  return (
    <Svg label="Which statement to use: ON CONFLICT for plain insert-or-update, race-free; MERGE with a retry for richer logic" h={290}>
      <T x={40} y={30} s={14} f={C.latte} o={q}>
        what does the write need?
      </T>
      <line x1={22} y1={22} x2={22} y2={lerp(22, 190, Math.max(b1 * 0.5, b2))} stroke={C.taupe} strokeWidth={2} />
      <g opacity={b1}>
        <line x1={22} y1={80} x2={36} y2={80} stroke={C.taupe} strokeWidth={2} />
        <T x={40} y={84} s={14} f={C.latte}>
          insert, or update if present
        </T>
        <T x={40} y={118} s={22} f={C.caramel} w={700}>
          ON CONFLICT
        </T>
        <path d={`M300 108 l8 8 l16 -18`} fill="none" stroke={C.caramel} strokeWidth={3} strokeDasharray="40" strokeDashoffset={40 * (1 - easeOut(seg(t, 1.6, 2.1)))} />
        <T x={336} y={116} s={13} f={C.latte} o={easeOut(seg(t, 1.8, 2.3))}>
          race-free
        </T>
      </g>
      <g opacity={b2}>
        <line x1={22} y1={180} x2={36} y2={180} stroke={C.taupe} strokeWidth={2} />
        <T x={40} y={184} s={14} f={C.latte}>
          branches, a DELETE, two sources
        </T>
        <T x={40} y={218} s={22} f={C.caramel} w={700}>
          MERGE + retry
        </T>
        <g transform={`rotate(${spin} 340 211)`}>
          <path d="M340 199 A12 12 0 1 1 328 211" fill="none" stroke={C.caramel} strokeWidth={2.5} />
          <path d="M340 193 l6 6 l-6 6" fill="none" stroke={C.caramel} strokeWidth={2.5} />
        </g>
      </g>
      <T x={40} y={272} s={13} f={C.latte} o={easeOut(seg(t, 3.2, 3.7))}>
        the shape of the need, not habit
      </T>
    </Svg>
  );
}

// 9 · RETURNING: merge_action fills first (PostgreSQL 17), then old and new (PostgreSQL 18); the missing sides pulse.
export function Returning({ t }: StepCtx) {
  const rows = [
    ['insert', 'syrah', '—', '5'],
    ['update', 'malbec', '4', '6'],
    ['delete', 'rioja', '3', '—'],
  ];
  const act = (i: number) => easeOut(seg(t, 0.4 + i * 0.4, 0.8 + i * 0.4));
  const on = (i: number) => easeOut(seg(t, 2.2 + i * 0.4, 2.6 + i * 0.4));
  const blink = 0.55 + 0.45 * Math.cos(Math.max(0, t - 3.4) * 12);
  const pulse = t > 3.4 && t < 3.95 ? blink : 1;
  return (
    <Svg label="RETURNING with merge_action names each branch (PostgreSQL 17); old and new show before and after (PostgreSQL 18)" h={290}>
      <T x={25} y={36} s={13} f={C.caramel} o={act(0)}>
        merge_action()
      </T>
      <T x={260} y={36} s={13} f={C.latte} o={on(0)}>
        old
      </T>
      <T x={390} y={36} s={13} f={C.latte} o={on(0)}>
        new
      </T>
      {rows.map((r, i) => (
        <g key={r[0]}>
          <T x={25} y={82 + i * 52} s={15} f={C.caramel} w={700} o={act(i)}>
            {r[0]}
          </T>
          <T x={125} y={82 + i * 52} s={13} f={C.latte} o={act(i)}>
            {r[1]}
          </T>
          <rect x={250} y={62 + i * 52} width={70} height={30} rx={6} fill={C.cocoa} stroke={C.mocha} opacity={on(i)} />
          <T x={285} y={82 + i * 52} s={15} f={C.crema} a="middle" o={on(i) * (r[2] === '—' ? pulse : 1)}>
            {r[2]}
          </T>
          <line x1={326} y1={77 + i * 52} x2={lerp(326, 374, on(i))} y2={77 + i * 52} stroke={C.taupe} strokeWidth={1.5} />
          <rect x={380} y={62 + i * 52} width={70} height={30} rx={6} fill={C.cocoa} stroke={C.caramel} opacity={on(i)} />
          <T x={415} y={82 + i * 52} s={15} f={C.crema} a="middle" o={on(i) * (r[3] === '—' ? pulse : 1)}>
            {r[3]}
          </T>
        </g>
      ))}
      <T x={25} y={254} s={13} f={C.caramel} o={easeOut(seg(t, 1.6, 2.0))}>
        PostgreSQL 17
      </T>
      <T x={260} y={254} s={13} f={C.crema} o={easeOut(seg(t, 3.4, 3.8))}>
        PostgreSQL 18
      </T>
    </Svg>
  );
}

// 10 · Lakehouse: one touched row sends its whole file into a rewrite; then a catch-all delete lights every file.
export function FileRewrite({ t: t0 }: StepCtx) {
  const t = t0 * 1.28;
  const mark = easeOut(seg(t, 0.4, 0.9));
  const copy = easeInOut(seg(t, 1.4, 2.6));
  const all = seg(t, 3.4, 5.0);
  const others = [0, 2, 3];
  const litN = Math.min(3, Math.floor(all * 3.2));
  const nAll = 1 + litN;
  const done = copy >= 1;
  return (
    <Svg label="One touched row forces its whole file to be rewritten; a catch-all delete branch can rewrite every file" h={300}>
      {[0, 1, 2, 3].map((i) => {
        const lit = i === 1 ? mark > 0 : others.indexOf(i) < litN;
        return (
          <g key={i}>
            <rect x={25 + i * 140} y={50} width={120} height={90} rx={8} fill={C.cocoa} stroke={lit ? C.cherryText : C.mocha} strokeWidth={lit ? 2 : 1} opacity={i === 1 && done ? 0.45 : 1} />
            <T x={85 + i * 140} y={72} s={13} f={C.latte} a="middle">
              file {i + 1}
            </T>
            {[0, 1, 2].map((r) => (
              <rect key={r} x={40 + i * 140} y={84 + r * 16} width={90} height={10} rx={3} fill={i === 1 && r === 1 ? C.cherryText : C.mocha} opacity={i === 1 && r === 1 ? mark : 0.8} />
            ))}
          </g>
        );
      })}
      {copy > 0 && [0, 1, 2].map((r) => <rect key={r} x={180} y={lerp(84 + r * 16, 196 + r * 16, copy)} width={90} height={10} rx={3} fill={r === 1 ? C.cherryText : C.crema} opacity={0.85} />)}
      <rect x={165} y={180} width={120} height={70} rx={8} fill="none" stroke={C.cherryText} strokeWidth={2} opacity={easeOut(seg(t, 1.2, 1.6))} />
      <T x={225} y={272} s={13} f={C.cherryText} a="middle" o={done ? 1 : 0}>
        whole file rewritten
      </T>
      <T x={575} y={222} s={14} f={C.crema} a="end" o={easeOut(seg(t, 3.2, 3.6))}>
        files rewritten: {nAll}
      </T>
    </Svg>
  );
}

// 11 · Verdict: three habits, each underlined and ticked.
export function Verdict({ t }: StepCtx) {
  const rows = [
    ['source keys', 'one row per target row'],
    ['plain upsert', 'ON CONFLICT'],
    ['lakehouse', 'fewest files touched'],
  ];
  return (
    <Svg label="Three habits for concurrent writes: one source row per target row, ON CONFLICT for the plain upsert, touch as few files as possible" h={280}>
      {rows.map((r, i) => {
        const k = easeOut(seg(t, i * 0.9, i * 0.9 + 0.6));
        const bar = easeInOut(seg(t, i * 0.9 + 0.4, i * 0.9 + 1.0));
        const tick = easeOut(seg(t, i * 0.9 + 0.9, i * 0.9 + 1.2));
        return (
          <g key={r[0]} opacity={k}>
            <T x={25} y={50 + i * 80} s={14} f={C.latte}>
              {r[0]}
            </T>
            <T x={25} y={82 + i * 80} s={19} f={C.caramel} w={700}>
              {r[1]}
            </T>
            <rect x={25} y={92 + i * 80} width={400 * bar} height={3} fill={C.caramel} />
            <path d={`M540 ${70 + i * 80} l8 8 l16 -18`} fill="none" stroke={C.caramel} strokeWidth={3} strokeDasharray="40" strokeDashoffset={40 * (1 - tick)} />
          </g>
        );
      })}
    </Svg>
  );
}

export function ProveAtomic({ t, answer }: StepCtx) {
  const answered = answer !== null;
  const s = useSinceAnswer(answered);
  const k = answered ? easeOut(seg(s, 0.1, 0.6)) : 0;
  const tick = answered ? easeOut(seg(s, 0.6, 1.0)) : 0;
  return (
    <Svg label="The race-free upsert is INSERT ON CONFLICT" h={240}>
      <T x={40} y={84} s={18} f={C.latte}>
        race-free →
      </T>
      {answered ? (
        <>
          <T x={40} y={lerp(160, 140, k)} s={24} f={C.caramel} w={700} o={k}>
            INSERT … ON CONFLICT
          </T>
          <rect x={40} y={152} width={330 * tick} height={3} fill={C.caramel} />
          <path d="M540 120 l8 8 l16 -18" fill="none" stroke={C.caramel} strokeWidth={3} strokeDasharray="40" strokeDashoffset={40 * (1 - tick)} />
        </>
      ) : (
        <T x={40} y={150} s={40} f={C.caramel} o={0.75 + 0.25 * Math.sin(t * 3)}>
          ?
        </T>
      )}
    </Svg>
  );
}
export function ProveRelease({ t, answer }: StepCtx) {
  const answered = answer !== null;
  const s = useSinceAnswer(answered);
  const k = answered ? easeOut(seg(s, 0.1, 0.6)) : 0;
  const n = answered ? Math.round(lerp(15, 17, easeOut(seg(s, 0.1, 0.9)))) : 15;
  const tick = answered ? easeOut(seg(s, 0.9, 1.3)) : 0;
  return (
    <Svg label="merge_action arrived in PostgreSQL 17" h={240}>
      <T x={40} y={84} s={18} f={C.latte}>
        merge_action() →
      </T>
      {answered ? (
        <>
          <T x={40} y={140} s={24} f={C.caramel} w={700} o={k}>
            PostgreSQL {n}
          </T>
          <rect x={40} y={152} width={210 * tick} height={3} fill={C.caramel} />
          <path d="M540 120 l8 8 l16 -18" fill="none" stroke={C.caramel} strokeWidth={3} strokeDasharray="40" strokeDashoffset={40 * (1 - tick)} />
        </>
      ) : (
        <T x={40} y={150} s={40} f={C.caramel} o={0.75 + 0.25 * Math.sin(t * 3)}>
          ?
        </T>
      )}
    </Svg>
  );
}
