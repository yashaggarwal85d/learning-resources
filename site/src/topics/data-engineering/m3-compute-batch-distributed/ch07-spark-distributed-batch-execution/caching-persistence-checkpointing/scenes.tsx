import { C, Svg, T } from '../../../../../reels/kit';
import { easeOut, seg } from '../../../../../reels/anim';
import type { StepCtx } from '../../../../../reels/types';

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
    <Svg label="a reused computation runs twice. Does Spark remember, or redo it?" h={200}>
      <Row y={70} label="same work" value="run twice" o={easeOut(seg(t, 0, 0.6))} />
      <Row y={130} label="remembered?" value="or redone?" valueColor={C.focus} o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function RevealBaselineBothRedo({ t }: StepCtx) {
  return (
    <Svg label="measured: uncached, both runs genuinely redo the whole thing." h={200}>
      <Row y={70} label="no caching" value="two runs" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="both runs" value="full work, twice" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function PredictCacheReuse({ t }: StepCtx) {
  return (
    <Svg label="cache that same computation. Does run two reuse it, or redo it?" h={200}>
      <Row y={70} label="cached this time" value="same work" />
      <Row y={130} label="run two" value="not yet revealed" valueColor={C.focus} />
    </Svg>
  );
}

export function RevealCachedReuses({ t }: StepCtx) {
  return (
    <Svg label="measured: run one pays once; run two reuses it, immediately." h={200}>
      <Row y={70} label="run one" value="pays the cost" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="run two" value="reused, instant" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function ElaborateCacheSitsReady({ t }: StepCtx) {
  return (
    <Svg label="the cached data sits ready; the computation behind it goes unused." h={200}>
      <Row y={70} label="cached data" value="sits ready" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="computation" value="never reruns" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function PredictEvictionChoice({ t }: StepCtx) {
  return (
    <Svg label="memory pressure forces eviction. Does a memory-only cache survive?" h={200}>
      <Row y={70} label="memory pressure" value="forces eviction" />
      <Row y={130} label="memory-only cache" value="not yet revealed" valueColor={C.focus} />
    </Svg>
  );
}

export function RevealRecomputeVsDisk({ t }: StepCtx) {
  return (
    <Svg label="measured: memory-only recomputes; memory-and-disk reads back." h={200}>
      <Row y={70} label="memory-only" value="redoes the work" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="memory-and-disk" value="reads it back" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function ElaborateStorageLevelDecides({ t }: StepCtx) {
  return (
    <Svg label="the storage level decides what losing a cached piece actually costs." h={200}>
      <Row y={70} label="the level you pick" value="is the choice" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="redo it, or" value="read it back" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealNondeterministicFrozen({ t }: StepCtx) {
  return (
    <Svg label="measured: uncached, every row disagrees; cached, every row matches." h={260}>
      <Row y={60} label="changes every run" value="the computation" o={easeOut(seg(t, 0, 0.4))} />
      <Row y={120} label="uncached" value="disagrees, every row" valueColor={C.focus} o={easeOut(seg(t, 0.25, 0.7))} />
      <Row y={180} label="cached once" value="matches, every row" valueColor={C.focus} o={easeOut(seg(t, 0.5, 1))} />
    </Svg>
  );
}

export function Recap({ t }: StepCtx) {
  return (
    <Svg label="caching trades the computation for the data; what's lost depends on the level." h={280}>
      <Row y={50} label="cache" value="trades work for data" o={easeOut(seg(t, 0, 0.3))} />
      <Row y={100} label="evicted" value="depends on the level" o={easeOut(seg(t, 0.15, 0.45))} />
      <Row y={150} label="caches" value="one frozen answer" valueColor={C.focus} o={easeOut(seg(t, 0.4, 0.75))} />
    </Svg>
  );
}
