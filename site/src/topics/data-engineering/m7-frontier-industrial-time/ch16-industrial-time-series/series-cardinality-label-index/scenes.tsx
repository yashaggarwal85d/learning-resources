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
    <Svg label="a team adds a batch label to every sensor series, and within a day the metrics server's memory climbs far past its usual size and gets killed, from a one-line change" h={200}>
      <Row y={70} label="one line" value="added" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="memory" value="server killed" valueColor={C.badText} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealSeriesIdentity({ t }: StepCtx) {
  return (
    <Svg label="two readings are the same series only if every label matches exactly; changing one label's value, or adding one, creates a brand new series" h={200}>
      <Row y={70} label="same labels" value="same series" valueColor={C.focus} o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="one label changes" value="new series" valueColor={C.second} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealWorstVsActual({ t }: StepCtx) {
  return (
    <Svg label="the worst-case cross product of every label's distinct values is large; the plant's actual series count, built from real equipment fitment, lands well below it" h={200}>
      <Row y={70} label="worst case" value="full cross product" valueColor={C.badText} o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="actual fitment" value="well below it" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function PredictScan({ t }: StepCtx) {
  return (
    <Svg label="a query names several labels at once — does answering it mean checking every single series in the system one at a time?" h={200}>
      <Row y={70} label="several labels" value="one query" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="every series?" value="or an index?" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealPostings({ t }: StepCtx) {
  return (
    <Svg label="intersecting two sorted postings lists finds the matching series without touching the rest, while a regex matcher has no postings list and must check every series" h={200}>
      <Row y={70} label="postings lists" value="skip most series" valueColor={C.focus} o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="a regex matcher" value="checks every one" valueColor={C.badText} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealBlowup({ t }: StepCtx) {
  return (
    <Svg label="giving every sensor series its own batch label multiplies the series count by the number of distinct batches, because an unbounded label has no bound on the series it creates" h={200}>
      <Row y={70} label="unbounded label" value="no upper bound" valueColor={C.badText} o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="series count" value="multiplies" valueColor={C.second} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealColumnarScan({ t }: StepCtx) {
  return (
    <Svg label="storing every reading as a row in a columnar table makes the batch label an ordinary column with no per-series index to blow up, only a scan that gets larger" h={200}>
      <Row y={70} label="columnar rows" value="no series index" valueColor={C.focus} o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="the batch label" value="just a column" o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function Recap({ t }: StepCtx) {
  return (
    <Svg label="a series is defined by its full label set, a postings index helps equality but not regex matching, an unbounded label multiplies series count, and a scan-based model trades the index for a scan" h={260}>
      <Row y={50} label="a series" value="is its labels" o={easeOut(seg(t, 0, 0.3))} />
      <Row y={95} label="postings" value="help equality only" valueColor={C.second} o={easeOut(seg(t, 0.15, 0.45))} />
      <Row y={140} label="unbounded label" value="multiplies count" valueColor={C.badText} o={easeOut(seg(t, 0.35, 0.65))} />
      <Row y={185} label="scan-based" value="trades index for scan" valueColor={C.focus} o={easeOut(seg(t, 0.55, 0.85))} />
    </Svg>
  );
}

export function ProveIt({ t }: StepCtx) {
  return (
    <Svg label="given the series-identity rule, can the exact new series count after adding the batch label be stated without guessing?" h={200}>
      <Row y={70} label="memory exploded" value="why exactly?" o={easeOut(seg(t, 0, 0.4))} />
      <Row y={130} label="the new count" value="computable exactly" valueColor={C.focus} o={easeOut(seg(t, 0.25, 0.65))} />
    </Svg>
  );
}
