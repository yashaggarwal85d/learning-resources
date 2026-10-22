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

/** A label above a bar, with its display value below — safe for long labels. */
function timeBar(x: number, y: number, frac: number, display: string, label: string, fill: string) {
  return (
    <g key={label}>
      <T x={x} y={y - 20} s={13} f={C.latte}>
        {label}
      </T>
      <Bar x={x} y={y} w={340 * frac} h={20} full={340} fill={fill} />
      <T x={x} y={y + 38} s={13} f={C.crema}>
        {display}
      </T>
    </g>
  );
}

export function Opening({ t }: StepCtx) {
  return (
    <Svg label="one table, two different questions" h={200}>
      <Row y={70} label="orders table" value="2.4 million rows" o={easeOut(seg(t, 0, 0.6))} />
      <Row y={130} label="this refresher" value="one lookup, one sum" o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function RevealOltp({ t }: StepCtx) {
  return (
    <Svg label="a point lookup, through the existing index" h={370}>
      {timeBar(30, 90, 7 / 46484, '~7 buffers', 'point lookup by id', C.focus)}
      {timeBar(30, 210, 46484 / 46484, '~46,484 buffers', 'full table scan', C.cocoa)}
    </Svg>
  );
}

export function RevealOlap({ t }: StepCtx) {
  return (
    <Svg label="the same table, summed across every row" h={370}>
      {timeBar(30, 90, 7 / 46484, '~7 buffers', 'point lookup by id', C.cocoa)}
      {timeBar(30, 210, 46484 / 46484, '~46,484 buffers', 'sum across all rows', C.cherryText)}
    </Svg>
  );
}

export function PredictColumnSkip({ t }: StepCtx) {
  return (
    <Svg label="one column needed out of six" h={200}>
      <Row y={70} label="columns the sum needs" value="one of six" />
      <Row y={130} label="bytes actually read" value="?" />
    </Svg>
  );
}

export function RevealRowReadsWhole({ t }: StepCtx) {
  return (
    <Svg label="every column of every row gets read anyway" h={200}>
      <Row y={70} label="columns needed" value="one of six" o={easeOut(seg(t, 0, 0.6))} />
      <Row y={130} label="columns actually read" value="all six, every row" valueColor={C.cherryText} o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function RevealColumnarFlips({ t }: StepCtx) {
  return (
    <Svg label="columnar storage reads only what a query needs" h={200}>
      <Row y={70} label="columns needed" value="five of a hundred" o={easeOut(seg(t, 0, 0.6))} />
      <Row y={130} label="table data read" value="about five percent" valueColor={C.second} o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function RevealNormalizationPressure({ t }: StepCtx) {
  return (
    <Svg label="normalization helps one workload, costs the other" h={200}>
      <Row y={70} label="many small tables" value="cheap, independent writes" o={easeOut(seg(t, 0, 0.6))} />
      <Row y={130} label="same shape, aggregated" value="needs joins, costly" valueColor={C.cherryText} o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function Recap({ t }: StepCtx) {
  return (
    <Svg label="point reads want rows, scans want columns" h={200}>
      <Row y={60} label="point reads" value="few, whole rows" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={110} label="large scans" value="few, whole columns" o={easeOut(seg(t, 0.2, 0.7))} />
      <Row y={160} label="one schema" value="rarely serves both" o={easeOut(seg(t, 0.4, 0.9))} />
    </Svg>
  );
}
