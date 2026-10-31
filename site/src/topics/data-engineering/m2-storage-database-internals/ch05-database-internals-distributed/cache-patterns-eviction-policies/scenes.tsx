import { C, Svg, T } from '../../../../../reels/kit';
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

export function Hook({ t }: StepCtx) {
  return (
    <Svg label="a write-behind cache tells the application a write succeeded, then the whole node dies before that write ever reaches the database" h={200}>
      <Row y={70} label="the write" value="acknowledged" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="the node dies" value="write: gone" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function PredictWhichPattern({ t }: StepCtx) {
  return (
    <Svg label="which pattern would have prevented this loss — a better node, or a different pattern entirely?" h={200}>
      <Row y={70} label="a sturdier node" value="prevents this?" />
      <Row y={130} label="a different pattern" value="prevents this?" valueColor={C.focus} />
    </Svg>
  );
}

export function RevealCacheAside({ t }: StepCtx) {
  return (
    <Svg label="cache-aside: the application itself checks the cache, misses, reads the database, and writes the result back" h={200}>
      <Row y={70} label="the application" value="owns the miss" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="the database changes" value="cache: not updated" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealReadThrough({ t }: StepCtx) {
  return (
    <Svg label="read-through: the cache itself, not the application, owns the exact same miss path" h={200}>
      <Row y={70} label="cache-aside" value="application loads it" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="read-through" value="cache loads it" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealWriteThroughBehind({ t }: StepCtx) {
  return (
    <Svg label="write-through waits for the database write to land; write-behind returns immediately and risks exactly the hook's own loss" h={240}>
      <Row y={60} label="write-through" value="waits for it" o={easeOut(seg(t, 0, 0.4))} />
      <Row y={115} label="write-behind" value="returns at once" o={easeOut(seg(t, 0.2, 0.6))} />
      <Row y={170} label="until flushed" value="cache is record" valueColor={C.focus} o={easeOut(seg(t, 0.45, 1))} />
    </Svg>
  );
}

export function RevealTTL({ t }: StepCtx) {
  return (
    <Svg label="a TTL doesn't make a cached value correct — it bounds how long a wrong value can keep being served" h={200}>
      <Row y={70} label="a TTL" value="doesn't fix it" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="a TTL" value="bounds how long" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealLruLfuGap({ t }: StepCtx) {
  return (
    <Svg label="a real, measured hit rate: plain LRU against a frequency-gated admission policy, over the identical skewed access pattern" h={200}>
      <Row y={70} label="plain LRU" value="measured hit rate" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="admission-gated" value="higher, measured" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function Recap({ t }: StepCtx) {
  return (
    <Svg label="cache-aside and read-through, who owns the miss; write-through and write-behind, when a write is acknowledged; a TTL that bounds staleness; a real measured admission gap" h={260}>
      <Row y={50} label="aside / through" value="who owns miss" o={easeOut(seg(t, 0, 0.3))} />
      <Row y={95} label="through / behind" value="when write lands" o={easeOut(seg(t, 0.1, 0.4))} />
      <Row y={140} label="a TTL" value="bounds staleness" valueColor={C.focus} o={easeOut(seg(t, 0.25, 0.6))} />
      <Row y={185} label="admission" value="beats eviction" o={easeOut(seg(t, 0.5, 0.85))} />
    </Svg>
  );
}

export function ProveIt({ t }: StepCtx) {
  return (
    <Svg label="a team swaps its eviction policy from LRU to LFU and the hit rate barely moves — what's the likely reason?" h={200}>
      <Row y={70} label="eviction swapped" value="barely moves" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="every key admitted" value="can't fix it" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}
