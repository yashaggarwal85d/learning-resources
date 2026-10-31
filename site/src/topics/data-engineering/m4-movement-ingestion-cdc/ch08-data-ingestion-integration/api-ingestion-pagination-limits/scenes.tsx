import { Bar, C, Svg, T } from '../../../../../reels/kit';
import { easeOut, seg } from '../../../../../reels/anim';
import type { StepCtx } from '../../../../../reels/types';

/** A label-left / value-right row, stacked vertically with generous gaps (DESIGN.md, phone text scaling). */
function Row({ y, label, value, valueColor = C.crema, o = 1 }: { y: number; label: string; value: string; valueColor?: string; o?: number }) {
  return (
    <g opacity={o}>
      <T x={25} y={y} s={15} f={C.latte}>
        {label}
      </T>
      <T x={575} y={y} s={17} f={valueColor} a="end" w={600}>
        {value}
      </T>
    </g>
  );
}

/** A horizontal bar whose fill grows left to right between two points in t, for a simple compare. */
function CompareBar({ y, label, frac, t, from, to, color = C.crema }: { y: number; label: string; frac: number; t: number; from: number; to: number; color?: string }) {
  const k = easeOut(seg(t, from, to));
  return (
    <g>
      <T x={25} y={y - 14} s={13} f={C.taupe}>{label}</T>
      <Bar x={25} y={y} w={frac * 500 * k} h={16} full={500} fill={color} />
    </g>
  );
}

export function Hook({ t }: StepCtx) {
  return (
    <Svg label="an offset-paged nightly pull over a live, growing list: rows duplicated, rows missing, counted directly." h={200}>
      <Row y={70} label="rows duplicated" value="counted directly" valueColor={C.badText} o={easeOut(seg(t, 0, 0.4))} />
      <Row y={120} label="rows missing" value="counted directly" valueColor={C.badText} o={easeOut(seg(t, 0.2, 0.6))} />
    </Svg>
  );
}

export function PredictKeysetFix({ t }: StepCtx) {
  return (
    <Svg label="a keyset cursor pages the identical list under the identical writes. Which problem does it fix?" h={200}>
      <Row y={70} label="keyset cursor" value="names the last row" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="what it fixes" value="not yet revealed" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealOffsetMeasured({ t }: StepCtx) {
  return (
    <Svg label="an insert re-reads a row already seen; a delete skips a row that never gets read." h={220}>
      <Row y={60} label="insert at the head" value="shifts rows down" valueColor={C.badText} o={easeOut(seg(t, 0, 0.4))} />
      <Row y={110} label="next page" value="re-reads a row" valueColor={C.badText} o={easeOut(seg(t, 0.2, 0.6))} />
      <Row y={160} label="delete, already read" value="skips a row" valueColor={C.badText} o={easeOut(seg(t, 0.4, 0.8))} />
    </Svg>
  );
}

export function RevealKeysetMeasured({ t }: StepCtx) {
  return (
    <Svg label="the identical writes, read by a cursor naming the last row seen instead of a position." h={220}>
      <Row y={60} label="insert at the head" value="cursor unaffected" valueColor={C.focus} o={easeOut(seg(t, 0, 0.4))} />
      <Row y={110} label="duplicates" value="none" valueColor={C.focus} o={easeOut(seg(t, 0.2, 0.6))} />
      <Row y={160} label="delete, unread row" value="still missed" valueColor={C.badText} o={easeOut(seg(t, 0.4, 0.8))} />
    </Svg>
  );
}

export function RevealTokenBucket({ t }: StepCtx) {
  return (
    <Svg label="a token-bucket limiter: a token removed per call, refilled at a fixed rate, empty means a four twenty-nine." h={200}>
      <Row y={70} label="bucket has tokens" value="request succeeds" valueColor={C.focus} o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="empty bucket" value="four twenty-nine" valueColor={C.badText} o={easeOut(seg(t, 0.25, 0.65))} />
    </Svg>
  );
}

export function RevealRetryAfterMeasured({ t }: StepCtx) {
  return (
    <Svg label="obeying retry-after wastes close to the minimum calls; a short fixed guess wastes far more." h={220}>
      <CompareBar y={60} label="obeys retry-after" frac={0.22} t={t} from={0} to={0.5} color={C.focus} />
      <CompareBar y={130} label="guesses, fixed delay" frac={1.0} t={t} from={0.3} to={0.9} color={C.badText} />
    </Svg>
  );
}

export function RevealContention({ t }: StepCtx) {
  return (
    <Svg label="many clients competing for one resource; every round's losers back off before trying again." h={200}>
      <Row y={70} label="every client" value="competes every round" valueColor={C.badText} o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="backoff" value="slows everyone down" o={easeOut(seg(t, 0.25, 0.65))} />
    </Svg>
  );
}

export function RevealJitterMeasured({ t }: StepCtx) {
  return (
    <Svg label="fixed backoff clusters every retry at the same instants; full jitter spreads them and costs less." h={220}>
      <CompareBar y={60} label="fixed backoff, no jitter" frac={1.0} t={t} from={0} to={0.5} color={C.badText} />
      <CompareBar y={130} label="full jitter" frac={0.5} t={t} from={0.3} to={0.9} color={C.focus} />
    </Svg>
  );
}

export function RevealIdempotencyKey({ t }: StepCtx) {
  return (
    <Svg label="a client-generated key up to two hundred fifty-five characters; the first response saved and replayed." h={200}>
      <Row y={70} label="first attempt, key" value="write happens once" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="retry, same key" value="saved response replayed" valueColor={C.focus} o={easeOut(seg(t, 0.25, 0.65))} />
    </Svg>
  );
}

export function RevealIdempotencyMeasured({ t }: StepCtx) {
  return (
    <Svg label="the identical write retried three times with the same key: one charge, every time the same response." h={220}>
      <Row y={60} label="attempts made" value="three, same key" o={easeOut(seg(t, 0, 0.4))} />
      <Row y={110} label="charges recorded" value="one" valueColor={C.focus} o={easeOut(seg(t, 0.2, 0.6))} />
      <Row y={160} label="responses returned" value="identical, every time" valueColor={C.focus} o={easeOut(seg(t, 0.4, 0.8))} />
    </Svg>
  );
}

export function Recap({ t }: StepCtx) {
  return (
    <Svg label="four fixes: keyset cursor, retry-after, jitter, idempotency key. One thing none of them touch." h={260}>
      <Row y={50} label="pagination" value="keyset cursor" o={easeOut(seg(t, 0, 0.3))} />
      <Row y={95} label="rate limits" value="obey retry-after" o={easeOut(seg(t, 0.15, 0.45))} />
      <Row y={140} label="contention" value="full jitter" o={easeOut(seg(t, 0.25, 0.55))} />
      <Row y={185} label="retried writes" value="idempotency key" o={easeOut(seg(t, 0.35, 0.65))} />
    </Svg>
  );
}

export function ProveIt({ t }: StepCtx) {
  return (
    <Svg label="two workers hold the same refresh token and race to refresh it at once. What happens?" h={200}>
      <Row y={70} label="both workers race" value="same stale token" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="outcome" value="not yet revealed" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}
