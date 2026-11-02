import { C, Svg, T } from '../../../../../reels/kit';
import { easeOut, seg } from '../../../../../reels/anim';
import type { StepCtx } from '../../../../../reels/types';

function TallRow({ y, label, value, valueColor = C.crema, o = 1 }: { y: number; label: string; value: string; valueColor?: string; o?: number }) {
  return (
    <g opacity={o}>
      <T x={25} y={y} s={14} f={C.latte}>
        {label}
      </T>
      <T x={25} y={y + 26} s={16} f={valueColor} w={600}>
        {value}
      </T>
    </g>
  );
}

export function Hook({ t }: StepCtx) {
  return (
    <Svg label="snowflake's immutability was one proprietary design. here's a second, on genuinely different infrastructure." h={200}>
      <TallRow y={40} label="snowflake's immutable storage" value="one design read about, not run" o={easeOut(seg(t, 0, 0.3))} />
      <TallRow y={100} label="a second design, different infrastructure entirely" value="the system behind topic six's own dremel paper" valueColor={C.focus} o={easeOut(seg(t, 0.25, 0.65))} />
    </Svg>
  );
}

export function PredictStorageComputeSplit({ t }: StepCtx) {
  return (
    <Svg label="one engine once stored the data and ran the query. still true today, or did those jobs split?" h={200}>
      <TallRow y={40} label="dremel once did both jobs itself" value="stored the data, and ran the query" o={easeOut(seg(t, 0, 0.5))} />
      <TallRow y={100} label="still one job today, or two separate ones?" value="which is it, now?" valueColor={C.focus} o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function RevealCapacitorColossusBorg({ t }: StepCtx) {
  return (
    <Svg label="they split: capacitor storage on colossus, dremel compute on borg, joined by the jupiter network." h={230}>
      <TallRow y={40} label="storage: capacitor, on colossus" value="google's own documentation, word for word" o={easeOut(seg(t, 0, 0.35))} />
      <TallRow y={100} label="compute: a separate dremel cluster, on borg" value="joined to storage by the jupiter network" valueColor={C.focus} o={easeOut(seg(t, 0.3, 0.7))} />
    </Svg>
  );
}

export function RevealPartitioningClustering({ t }: StepCtx) {
  return (
    <Svg label="partitioning narrows the scan to matching segments; clustering sorts rows into blocks a filter can skip." h={230}>
      <TallRow y={40} label="partitioning" value="skips whole segments that can't match" o={easeOut(seg(t, 0, 0.35))} />
      <TallRow y={100} label="clustering" value="sorts rows into blocks, then skips blocks" valueColor={C.focus} o={easeOut(seg(t, 0.3, 0.7))} />
    </Svg>
  );
}

export function RevealMaterializedViews({ t }: StepCtx) {
  return (
    <Svg label="a materialized view stays current on its own, in the background, as the base table changes." h={230}>
      <TallRow y={40} label="precomputed once" value="then kept current automatically" o={easeOut(seg(t, 0, 0.35))} />
      <TallRow y={100} label="no person refreshes it" value="the background keeps it current" valueColor={C.focus} o={easeOut(seg(t, 0.3, 0.7))} />
    </Svg>
  );
}

export function PredictRepeatedQuery({ t }: StepCtx) {
  return (
    <Svg label="pruning and precomputed views both speed up a query that still has to run. can one skip running it at all?" h={200}>
      <TallRow y={40} label="pruning and views speed up a query" value="but the query still runs, every time" o={easeOut(seg(t, 0, 0.5))} />
      <TallRow y={100} label="anything that skips running it entirely?" value="does something do that?" valueColor={C.focus} o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function RevealBiEngine({ t }: StepCtx) {
  return (
    <Svg label="an in-memory caching service sits in front of the engine, speeding up the exact queries run most often." h={230}>
      <TallRow y={40} label="an in-memory caching service" value="sits in front of the query engine" o={easeOut(seg(t, 0, 0.35))} />
      <TallRow y={100} label="caches the most frequent data" value="nothing in the project has to change" valueColor={C.focus} o={easeOut(seg(t, 0.3, 0.7))} />
    </Svg>
  );
}

export function RevealLoadPaths({ t }: StepCtx) {
  return (
    <Svg label="loading splits two ways: one batch job that fills a table once, or a stream that keeps writing rows." h={230}>
      <TallRow y={40} label="a single batch load job" value="fills a table once, from cloud storage" o={easeOut(seg(t, 0, 0.35))} />
      <TallRow y={100} label="a streaming write path" value="keeps writing rows, continuously" valueColor={C.focus} o={easeOut(seg(t, 0.3, 0.7))} />
    </Svg>
  );
}

export function RevealExactlyOnceStreaming({ t }: StepCtx) {
  return (
    <Svg label="the modern streaming path guarantees exactly-once delivery with stream offsets, replacing an older best-effort method." h={230}>
      <TallRow y={40} label="the modern streaming path" value="exactly-once, using stream offsets" o={easeOut(seg(t, 0, 0.35))} />
      <TallRow y={100} label="replaces an older legacy method" value="that only promised best effort" valueColor={C.focus} o={easeOut(seg(t, 0.3, 0.7))} />
    </Svg>
  );
}

export function Recap({ t }: StepCtx) {
  return (
    <Svg label="storage and compute split apart, joined over a network -- pruning, caching and two load paths all follow. next: redshift." h={300}>
      <TallRow y={35} label="storage and compute, split apart" value="joined back together over a network" o={easeOut(seg(t, 0, 0.3))} />
      <TallRow y={100} label="pruning, caching, precomputed views" value="all read from storage this way" o={easeOut(seg(t, 0.1, 0.4))} />
      <TallRow y={165} label="unlike topic thirty-seven's single storage layer" value="disaggregated across separate services" valueColor={C.focus} o={easeOut(seg(t, 0.25, 0.6))} />
      <g opacity={easeOut(seg(t, 0.55, 1))}>
        <T x={25} y={230} s={14} f={C.latte}>
          the handoff
        </T>
        <T x={25} y={256} s={16} f={C.focus} w={600}>
          a genuinely different lineage --
        </T>
        <T x={25} y={280} s={16} f={C.focus} w={600}>
          redshift's classic shared-nothing mpp
        </T>
      </g>
    </Svg>
  );
}
