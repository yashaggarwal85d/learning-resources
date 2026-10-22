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
    <Svg label="one dataset, one query, four storage shapes — which costs least?" h={200}>
      <Row y={70} label="one dataset" value="four storage shapes" />
      <Row y={130} label="one query" value="which costs least?" />
    </Svg>
  );
}

export function RevealBillingAxesQuote({ t }: StepCtx) {
  return (
    <Svg label="storage, requests, transfer — billed separately, not bundled" h={200}>
      <Row y={70} label="storage" value="one meter" o={easeOut(seg(t, 0, 0.6))} />
      <Row y={130} label="requests, transfer" value="separate meters" valueColor={C.focus} o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function PredictFormatCost({ t }: StepCtx) {
  return (
    <Svg label="cheap to write — does that mean cheap to query too?" h={200}>
      <Row y={70} label="JSON" value="cheap to write" />
      <Row y={130} label="querying it" value="cheap too?" />
    </Svg>
  );
}

export function RevealJsonVsParquetMeasured({ t }: StepCtx) {
  return (
    <Svg label="same query, same rows — JSON reads far more bytes than Parquet" h={200}>
      <Row y={70} label="JSON" value="far more bytes read" valueColor={C.focus} o={easeOut(seg(t, 0, 0.6))} />
      <Row y={130} label="Parquet" value="far fewer" o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function RevealBillingModelsQuote({ t }: StepCtx) {
  return (
    <Svg label="bytes scanned, billed — or reserved compute time, billed — never both the same way" h={200}>
      <Row y={70} label="on-demand" value="bytes scanned" o={easeOut(seg(t, 0, 0.6))} />
      <Row y={130} label="flat-rate" value="compute time" valueColor={C.focus} o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function PredictPartitionAlwaysWins({ t }: StepCtx) {
  return (
    <Svg label="more, smaller files — always the cheaper choice?" h={200}>
      <Row y={70} label="many small files" value="always cheaper?" />
      <Row y={130} label="depends on" value="the query?" />
    </Svg>
  );
}

export function RevealNarrowQueryMeasured({ t }: StepCtx) {
  return (
    <Svg label="one month out of twelve — partitioned layout reads far fewer bytes" h={200}>
      <Row y={70} label="one month asked" value="partitioned" o={easeOut(seg(t, 0, 0.6))} />
      <Row y={130} label="bytes read" value="far fewer" valueColor={C.focus} o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function RevealBroadQueryMeasured({ t }: StepCtx) {
  return (
    <Svg label="every month at once — the partitioned layout now reads more, not less" h={200}>
      <Row y={70} label="every month asked" value="same partitioned layout" o={easeOut(seg(t, 0, 0.6))} />
      <Row y={130} label="bytes read" value="more, not less" valueColor={C.focus} o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function RevealStorageMeasured({ t }: StepCtx) {
  return (
    <Svg label="disk alone — JSON's footprint dwarfs every columnar layout of the same rows" h={200}>
      <Row y={70} label="JSON on disk" value="far larger" valueColor={C.focus} o={easeOut(seg(t, 0, 0.6))} />
      <Row y={130} label="columnar layouts" value="far smaller" o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function PredictIcebergWrapper({ t }: StepCtx) {
  return (
    <Svg label="transactions and a catalog added — does that change bytes scanned too?" h={200}>
      <Row y={70} label="Iceberg wrapper" value="transactions, catalog" />
      <Row y={130} label="bytes scanned" value="changed too?" />
    </Svg>
  );
}

export function RevealIcebergMeasured({ t }: StepCtx) {
  return (
    <Svg label="same data, Iceberg-wrapped — bytes read track the bare Parquet file beneath it" h={200}>
      <Row y={70} label="Iceberg table" value="bytes read" o={easeOut(seg(t, 0, 0.6))} />
      <Row y={130} label="bare Parquet" value="nearly identical" valueColor={C.focus} o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function Recap({ t }: StepCtx) {
  return (
    <Svg label="separate meters; layout, not format, moves bytes scanned; it depends on the query" h={260}>
      <Row y={60} label="billing" value="several separate meters" o={easeOut(seg(t, 0, 0.4))} />
      <Row y={120} label="bytes scanned" value="moved by layout" valueColor={C.focus} o={easeOut(seg(t, 0.2, 0.6))} />
      <Row y={180} label="best layout" value="depends on the query" o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function ProveIt({ t }: StepCtx) {
  return (
    <Svg label="always the latest single day, never more — which layout fits?" h={200}>
      <Row y={70} label="always latest day" value="never more" />
      <Row y={130} label="best layout" value="which one?" />
    </Svg>
  );
}
