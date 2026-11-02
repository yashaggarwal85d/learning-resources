import { C, Svg, T } from '../../../../../reels/kit';
import { easeOut, seg } from '../../../../../reels/anim';
import type { StepCtx } from '../../../../../reels/types';

/** A label-left / value-right row (DESIGN.md, phone text scaling). */
function Row({ y, label, value, valueColor = C.crema, o = 1 }: { y: number; label: string; value: string; valueColor?: string; o?: number }) {
  return (
    <g opacity={o}>
      <T x={25} y={y} s={15} f={C.latte}>
        {label}
      </T>
      <T x={575} y={y} s={16} f={valueColor} a="end" w={600}>
        {value}
      </T>
    </g>
  );
}

export function Hook({ t }: StepCtx) {
  return (
    <Svg label="the shop is told about two million orders a day, with some clicks — one engineer says a laptop could do it, another says the opposite" h={220}>
      <T x={300} y={60} s={14} f={C.taupe} a="middle" o={easeOut(seg(t, 0, 0.5))}>
        the ask
      </T>
      <T x={300} y={105} s={17} f={C.crema} a="middle" w={600} serif italic o={easeOut(seg(t, 0.15, 0.7))}>
        "about two million orders a day, with some clicks"
      </T>
      <Row y={165} label="a laptop could do it" value="mean orders a second" o={easeOut(seg(t, 0.45, 0.8))} />
      <Row y={200} label="we need a cluster" value="clicks, peak, replication" valueColor={C.focus} o={easeOut(seg(t, 0.65, 1))} />
    </Svg>
  );
}

export function Predict1({ t }: StepCtx) {
  return (
    <Svg label="which single multiplication did 'a laptop could do it' leave out that changes the answer by more than an order of magnitude?" h={200}>
      <Row y={70} label="divide by seconds a day" value="got this part right" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="clicks, peak, replication" value="never multiplied in" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealChain({ t }: StepCtx) {
  const rows: [string, string][] = [
    ['orders a day', 'the starting count'],
    ['× events per order', 'clicks, not just orders'],
    ['÷ seconds a day', 'mean rate'],
    ['× peak ratio', 'design rate'],
    ['× bytes an event', 'bytes a day'],
    ['× retention, replication', 'storage to buy'],
  ];
  return (
    <Svg label="orders a day, times events per order, over seconds a day, times the peak ratio, times bytes an event, times retention and replication — the estimate sheet, one row per beat" h={320}>
      {rows.map(([label, value], i) => (
        <Row key={label} y={30 + i * 48} label={label} value={value} valueColor={i === rows.length - 1 ? C.focus : C.crema} o={easeOut(seg(t, i * 0.25, i * 0.25 + 0.4))} />
      ))}
    </Svg>
  );
}

export function RevealPeakRatio({ t }: StepCtx) {
  return (
    <Svg label="the same chain run at the mean rate and at the design rate — what does the five-times difference actually change?" h={200}>
      <Row y={70} label="sized for the mean" value="falls over some afternoon" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="sized for the peak" value="what you actually provision" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealLittlesLaw({ t }: StepCtx) {
  return (
    <Svg label="the design rate, times a processing time per event, equals how many events are in flight at any instant" h={200}>
      <Row y={70} label="design rate × processing time" value="events in flight" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="L = λW" value="not a formula to memorize" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealConsumerSizing({ t }: StepCtx) {
  return (
    <Svg label="the in-flight count, divided by what one consumer can hold, gives the real number to provision" h={220}>
      <Row y={70} label="in flight" value="÷ one consumer's capacity" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={150} label="result" value="consumers to provision" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealReferenceNumbers({ t }: StepCtx) {
  const rows: [string, string][] = [
    ['Kafka benchmark', 'an upper bound, not a plan'],
    ["S3's prefix floor", 'scales with more prefixes'],
    ['scan rate, here', 'this machine only'],
  ];
  return (
    <Svg label="three dated reference numbers, each tagged with what it is not" h={280}>
      {rows.map(([label, value], i) => (
        <Row key={label} y={60 + i * 75} label={label} value={value} o={easeOut(seg(t, i * 0.3, i * 0.3 + 0.45))} />
      ))}
    </Svg>
  );
}

export function RevealRightUse({ t }: StepCtx) {
  return (
    <Svg label="two uses of the same benchmark number side by side — one wrong, one the actual bounded claim it supports" h={240}>
      <Row y={70} label="cluster will hit that rate" value="wrong claim" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={150} label="one partition won't bottleneck" value="right claim" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function Recap({ t }: StepCtx) {
  return (
    <Svg label="the full chain from orders to storage, the peak ratio's effect, Little's Law sizing consumers, and three reference numbers each with its own ceiling" h={260}>
      <Row y={40} label="orders to storage" value="one chain, one row per beat" o={easeOut(seg(t, 0, 0.3))} />
      <Row y={85} label="peak ratio" value="what you actually provision" o={easeOut(seg(t, 0.15, 0.45))} />
      <Row y={130} label="Little's Law" value="sizes consumers, pools, queues" valueColor={C.focus} o={easeOut(seg(t, 0.35, 0.65))} />
      <Row y={175} label="reference numbers" value="each with its own ceiling" o={easeOut(seg(t, 0.55, 0.85))} />
    </Svg>
  );
}

export function ProveIt({ t }: StepCtx) {
  return (
    <Svg label="a second business: same order volume, but every order needs three approval-service calls before it ships — what moves in the chain?" h={220}>
      <Row y={60} label="three approvals an order" value="a new multiplier" o={easeOut(seg(t, 0, 0.4))} />
      <Row y={115} label="same chain" value="no new kind of arithmetic" valueColor={C.focus} o={easeOut(seg(t, 0.3, 0.7))} />
      <Row y={170} label="dominant mover" value="still the multiplication" valueColor={C.focus} o={easeOut(seg(t, 0.55, 1))} />
    </Svg>
  );
}
