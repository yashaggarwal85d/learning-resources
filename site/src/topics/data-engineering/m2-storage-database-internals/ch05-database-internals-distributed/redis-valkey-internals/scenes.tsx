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
    <Svg label="a real Redis instance runs every command on a single thread, yet handles tens of thousands a second" h={200}>
      <Row y={70} label="one thread" value="runs every command" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="still" value="very high throughput" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function PredictSpeedCause({ t }: StepCtx) {
  return (
    <Svg label="is Redis fast despite being single-threaded, or because of it?" h={200}>
      <Row y={70} label="despite" value="one thread" />
      <Row y={130} label="because of" value="one thread" valueColor={C.focus} />
    </Svg>
  );
}

export function RevealEventLoop({ t }: StepCtx) {
  return (
    <Svg label="commands always run on one thread; I/O threads are an opt-in extra for sockets only" h={200}>
      <Row y={70} label="commands" value="always one thread" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="socket I/O" value="optional extra threads" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealRdbVsAof({ t }: StepCtx) {
  return (
    <Svg label="RDB snapshots periodically and can lose recent writes; AOF logs every write instead" h={200}>
      <Row y={70} label="RDB" value="periodic snapshot" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="AOF" value="logs every write" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealReplicationLoss({ t }: StepCtx) {
  return (
    <Svg label="a real write, acknowledged by the master, measured still missing from a real frozen replica" h={200}>
      <Row y={70} label="master" value="write acknowledged" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="replica" value="still behind" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealClusterSlots({ t }: StepCtx) {
  return (
    <Svg label="Redis Cluster's own key space, split into one fixed set of owned slots" h={200}>
      <Row y={70} label="key space" value="16,384 slots" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="each slot" value="one owner node" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealLicensing({ t }: StepCtx) {
  return (
    <Svg label="BSD, until a licensing move spun off a BSD-licensed fork, then a later release added AGPLv3" h={200}>
      <Row y={70} label="2024" value="Redis relicenses" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="Valkey" value="keeps BSD" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function Recap({ t }: StepCtx) {
  return (
    <Svg label="one thread for speed, RDB vs AOF, replication's own loss window, fixed hash slots, a real licensing split" h={260}>
      <Row y={50} label="one thread" value="is the speed" o={easeOut(seg(t, 0, 0.3))} />
      <Row y={95} label="AOF" value="trades RDB's gap" o={easeOut(seg(t, 0.1, 0.4))} />
      <Row y={140} label="async replication" value="can lose a write" valueColor={C.focus} o={easeOut(seg(t, 0.25, 0.6))} />
      <Row y={185} label="licensing" value="now a real choice" o={easeOut(seg(t, 0.5, 0.85))} />
    </Svg>
  );
}

export function ProveIt({ t }: StepCtx) {
  return (
    <Svg label="a cache that must never lose an acknowledged write, even across a crash — change what?" h={200}>
      <Row y={70} label="rely on" value="RDB alone" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="switch to" value="AOF, fast fsync" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}
