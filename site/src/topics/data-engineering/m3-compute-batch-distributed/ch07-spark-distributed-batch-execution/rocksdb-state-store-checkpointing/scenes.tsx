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
    <Svg label="exactly-once leans on the state store surviving a restart. What is that store?" h={200}>
      <Row y={70} label="exactly-once" value="needs the store" o={easeOut(seg(t, 0, 0.6))} />
      <Row y={130} label="this topic" value="the store itself" valueColor={C.focus} o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function RevealDefaultOnHeap({ t }: StepCtx) {
  return (
    <Svg label="the default provider keeps state as objects on the JVM's own heap." h={200}>
      <Row y={70} label="default provider" value="state on heap" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="millions of keys" value="millions of objects" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function PredictGcClimbs({ t }: StepCtx) {
  return (
    <Svg label="a million-key aggregation, on the default provider. GC time flat, or climbing?" h={200}>
      <Row y={70} label="million keys" value="default provider" />
      <Row y={130} label="GC time" value="not yet revealed" valueColor={C.focus} />
    </Svg>
  );
}

export function RevealGcClimbed({ t }: StepCtx) {
  return (
    <Svg label="measured: climbs, on the default provider. The same workload on RocksDB stays flat." h={200}>
      <Row y={70} label="default provider" value="GC time climbs" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="RocksDB, same load" value="stays flat" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function ElaborateNativeMemory({ t }: StepCtx) {
  return (
    <Svg label="RocksDB moves the state to native memory and local disk -- off the heap entirely." h={200}>
      <Row y={70} label="RocksDB" value="native memory, disk" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="the GC" value="never sees it" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function PredictFullReupload({ t }: StepCtx) {
  return (
    <Svg label="every checkpoint re-uploads the full state snapshot. True, or false?" h={200}>
      <Row y={70} label="every checkpoint" value="full snapshot?" />
      <Row y={130} label="true or false?" value="not yet revealed" valueColor={C.focus} />
    </Svg>
  );
}

export function RevealChangelogSmaller({ t }: StepCtx) {
  return (
    <Svg label="measured: false. Changelog checkpointing uploads only what changed, not everything." h={200}>
      <Row y={70} label="changelog on" value="only the changes" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="bytes written" value="collapse, measured" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function ElaborateSnapshotDeferred({ t }: StepCtx) {
  return (
    <Svg label="a full snapshot still happens -- changelog checkpointing just defers it, never skips it." h={200}>
      <Row y={70} label="the snapshot" value="still happens" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="changelog" value="defers, not skips" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealChapterNeverNeeded({ t }: StepCtx) {
  return (
    <Svg label="this chapter's own examples never needed any of this -- the scale here is millions of keys." h={260}>
      <Row y={60} label="this chapter" value="never crossed it" o={easeOut(seg(t, 0, 0.4))} />
      <Row y={120} label="the real threshold" value="millions of keys" valueColor={C.focus} o={easeOut(seg(t, 0.25, 0.7))} />
      <Row y={180} label="below that" value="default is fine" valueColor={C.focus} o={easeOut(seg(t, 0.5, 1))} />
    </Svg>
  );
}

export function Recap({ t }: StepCtx) {
  return (
    <Svg label="two providers, one switch: where the state lives, and what a checkpoint costs." h={280}>
      <Row y={50} label="default provider" value="state on heap" o={easeOut(seg(t, 0, 0.3))} />
      <Row y={100} label="RocksDB" value="native, off heap" o={easeOut(seg(t, 0.15, 0.45))} />
      <Row y={150} label="changelog" value="cheaper checkpoints" valueColor={C.focus} o={easeOut(seg(t, 0.4, 0.75))} />
    </Svg>
  );
}
