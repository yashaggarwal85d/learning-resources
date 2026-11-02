import { C, Svg, T, Reticle } from '../../../../../reels/kit';
import { easeOut, seg } from '../../../../../reels/anim';
import type { StepCtx } from '../../../../../reels/types';

// No local Kubernetes cluster on this build machine (no Docker daemon, no kubectl/kind/k3s), so a
// live multi-broker Kafka roll, a real Strimzi reconciliation, and a live Flink Kubernetes Operator
// upgrade are sourced from Strimzi's and Flink's own documentation and source files (SOURCES.md).
// The ISR-safe rolling-restart decision, the PVC-retention resolution, and the Flink upgrade-mode
// and savepoint-fallback decisions are run for real in examples.py.

function Lane({ x, y = 100, label, color, inSync = true }: { x: number; y?: number; label: string; color: string; inSync?: boolean }) {
  return (
    <g opacity={inSync ? 1 : 0.4}>
      <rect x={x} y={y} width={150} height={60} rx={4} fill={C.panel} stroke={color} />
      <T x={x + 75} y={y + 32} s={12} a="middle" f={color}>{label}</T>
    </g>
  );
}

function CompareRow({ y, title, caption, color }: { y: number; title: string; caption: string; color: string }) {
  return (
    <g>
      <rect x={100} y={y} width={400} height={60} rx={4} fill={C.panel} stroke={color} />
      <T x={300} y={y + 28} s={13} a="middle" f={color}>{title}</T>
      <T x={300} y={y + 48} s={11} a="middle" f={C.quiet}>{caption}</T>
    </g>
  );
}

// 1 · Hook: a drain takes two of three brokers at once.
export function Hook({ t }: StepCtx) {
  return (
    <Svg label="A drain takes two of three brokers at once. Replication factor three, min insync replicas two" h={300}>
      <Lane x={40} label="broker: draining" color={C.badText} inSync={false} />
      <Lane x={225} label="broker: draining" color={C.badText} inSync={false} />
      <Lane x={410} label="broker: up" color={C.second} />
      <T x={300} y={230} s={13} a="middle" f={C.quiet}>two brokers drained at once; one stays up</T>
    </Svg>
  );
}

// 2 · Predict: stall, lose data, or neither?
export function PredictDrain({ t }: StepCtx) {
  return (
    <Svg label="If the drain evicts both at once, what happens to a producer using acks all?" h={300}>
      <Lane x={40} label="broker: draining" color={C.badText} inSync={false} />
      <Lane x={225} label="broker: draining?" color={C.focus} />
      <Reticle x={225} y={100} w={150} h={60} t={t} at={0.3} />
      <T x={300} y={240} s={15} a="middle" f={C.crema} serif>
        stall, lose data, or neither?
      </T>
    </Svg>
  );
}

// 2 · What a broker needs that an executor didn't.
export function BrokerVsExecutor({ t }: StepCtx) {
  const k = easeOut(seg(t, 0.2, 0.9));
  return (
    <Svg label="A Spark executor is disposable. A broker owns a name and a disk that must follow it" h={260}>
      <CompareRow y={50} title="Spark executor" caption="no stored identity; losing one redoes a stage" color={C.quiet} />
      <g opacity={k}>
        <CompareRow y={140} title="Kafka broker" caption="a stable name and its own disk, across restarts" color={C.second} />
      </g>
    </Svg>
  );
}

// 3 · Stable storage: a template, not a pod, plus a retention choice.
export function StableStorage({ t }: StepCtx) {
  const k = easeOut(seg(t, 0.3, 0.9));
  return (
    <Svg label="volumeClaimTemplates gives each pod its own volume; a retention policy decides if deleting or scaling keeps it" h={260}>
      <rect x={100} y={40} width={180} height={60} rx={4} fill={C.panel} stroke={C.second} />
      <T x={190} y={75} s={12} a="middle" f={C.second}>broker pod</T>
      <rect x={320} y={40} width={180} height={60} rx={4} fill={C.panel} stroke={C.focus} />
      <T x={410} y={75} s={12} a="middle" f={C.focus}>its own volume</T>
      <g opacity={k}>
        <CompareRow y={150} title="retained by default" caption="deleted or scaled down, the volume stays unless told otherwise" color={C.primary} />
      </g>
    </Svg>
  );
}

// 4 · Why not a plain StatefulSet: Strimzi's own resources.
export function StrimziResources({ t }: StepCtx) {
  const k = easeOut(seg(t, 0.2, 0.9));
  return (
    <Svg label="Strimzi uses its own StrimziPodSet and KafkaNodePool resources, not a plain StatefulSet" h={300}>
      <CompareRow y={40} title="StrimziPodSet" caption="internal; the operator manages it, never edited by hand" color={C.second} />
      <CompareRow y={130} title="KafkaNodePool" caption="user-facing; one pool, one storage class, one set of settings" color={C.focus} />
      <g opacity={k}>
        <T x={300} y={225} s={12} a="middle" f={C.quiet}>worked around limits a plain StatefulSet carried</T>
      </g>
    </Svg>
  );
}

// 5 · Rack awareness and its cost.
export function RackAwareness({ t }: StepCtx) {
  const k = easeOut(seg(t, 0.3, 0.9));
  return (
    <Svg label="Spreading replicas across racks or zones improves fault tolerance, at the cost of cross zone traffic" h={300}>
      <Lane x={40} label="broker: zone a" color={C.second} />
      <Lane x={225} label="broker: zone b" color={C.focus} />
      <Lane x={410} label="broker: zone c" color={C.primary} />
      <g opacity={k}>
        <T x={300} y={230} s={13} a="middle" f={C.quiet}>one replica per zone; replication now crosses zones</T>
      </g>
    </Svg>
  );
}

// 6 · Predict resolved: the roller's own rule.
export function RollerRule({ t }: StepCtx) {
  const k = easeOut(seg(t, 0.3, 0.9));
  return (
    <Svg label="The roller checks the ISR before every restart: would this drop a topic below its minimum in sync replicas?" h={300}>
      <Lane x={40} label="broker: in sync" color={C.second} />
      <Lane x={225} label="broker: candidate" color={C.focus} />
      <Lane x={410} label="broker: in sync" color={C.second} />
      <g opacity={k}>
        <T x={300} y={230} s={13} a="middle" f={C.badText}>would remove it from the in sync set: refused</T>
      </g>
    </Svg>
  );
}

// 7 · Drain Cleaner and the PDB, the other half.
export function DrainCleanerPdb({ t }: StepCtx) {
  const k = easeOut(seg(t, 0.2, 0.9));
  return (
    <Svg label="Strimzi Drain Cleaner turns a node eviction into that same safe roll; a pod disruption budget is Kubernetes's half" h={260}>
      <CompareRow y={50} title="Drain Cleaner" caption="intercepts the eviction, hands it to the operator's safe roll" color={C.second} />
      <g opacity={k}>
        <CompareRow y={140} title="pod disruption budget" caption="the Kubernetes side of the same promise (topic four)" color={C.focus} />
      </g>
    </Svg>
  );
}

// 8 · KRaft only, now: ZooKeeper removed.
export function KraftOnly({ t }: StepCtx) {
  const k = easeOut(seg(t, 0.3, 0.9));
  return (
    <Svg label="The current Strimzi release removed ZooKeeper based clusters and the migration path to KRaft entirely" h={260}>
      <rect x={100} y={40} width={180} height={60} rx={4} fill={C.panel} stroke={C.quiet} opacity={1 - k * 0.6} />
      <T x={190} y={75} s={12} a="middle" f={C.quiet} o={1 - k * 0.5}>ZooKeeper based</T>
      <rect x={320} y={40} width={180} height={60} rx={4} fill={C.panel} stroke={C.second} />
      <T x={410} y={75} s={12} a="middle" f={C.second}>KRaft only</T>
      <g opacity={k}>
        <T x={300} y={160} s={12} a="middle" f={C.badText}>an old cluster must reach KRaft before upgrading</T>
      </g>
    </Svg>
  );
}

// 9 · A Flink job as a reconciled resource.
export function FlinkDeclared({ t }: StepCtx) {
  const k = easeOut(seg(t, 0.3, 0.9));
  return (
    <Svg label="The Flink Kubernetes Operator reconciles a job declared as a custom resource" h={280}>
      <rect x={160} y={40} width={280} height={60} rx={4} fill={C.panel} stroke={C.second} />
      <T x={300} y={75} s={13} a="middle" f={C.second}>declared job: running, savepoint path</T>
      <g opacity={k}>
        <T x={300} y={150} s={13} a="middle" f={C.primary}>the operator keeps the cluster matching it</T>
      </g>
    </Svg>
  );
}

// 10 · Three upgrade modes.
export function UpgradeModes({ t }: StepCtx) {
  const k = easeOut(seg(t, 0.2, 0.9));
  return (
    <Svg label="Three upgrade modes carry state across a restart differently: stateless, last state, savepoint" h={340}>
      <Lane x={40} y={40} label="stateless" color={C.quiet} />
      <Lane x={225} y={40} label="last state" color={C.focus} />
      <Lane x={410} y={40} label="savepoint" color={C.second} />
      <g opacity={k}>
        <T x={300} y={230} s={12} a="middle" f={C.quiet}>empty · latest checkpoint · a point taken for this upgrade</T>
      </g>
    </Svg>
  );
}

// 11b · Predict: does an unhealthy job still get its savepoint?
export function PredictSavepointHealth({ t }: StepCtx) {
  return (
    <Svg label="The job is unhealthy right now. Does the savepoint upgrade still happen, fall back, or simply fail?" h={280}>
      <rect x={200} y={60} width={200} height={60} rx={4} fill={C.panel} stroke={C.badText} />
      <T x={300} y={95} s={13} a="middle" f={C.badText}>job: unhealthy</T>
      <Reticle x={200} y={60} w={200} h={60} t={t} at={0.3} />
      <T x={300} y={200} s={15} a="middle" f={C.crema} serif>
        savepoint anyway, fall back, or fail?
      </T>
    </Svg>
  );
}

// 11 · Checkpoint vs savepoint: who owns the lifecycle.
export function LifecycleOwnership({ t }: StepCtx) {
  const k = easeOut(seg(t, 0.2, 0.9));
  return (
    <Svg label="A checkpoint's lifecycle belongs to Flink and is deleted automatically. A savepoint belongs to the user, kept forever" h={260}>
      <CompareRow y={40} title="checkpoint" caption="created, owned, and deleted by Flink without asking" color={C.quiet} />
      <g opacity={k}>
        <CompareRow y={130} title="savepoint" caption="created and deleted only by the user; Flink never removes it" color={C.focus} />
      </g>
    </Svg>
  );
}

// 12 · Checkpoints on object storage; local disk still matters.
export function CheckpointStorage({ t }: StepCtx) {
  const k = easeOut(seg(t, 0.3, 0.9));
  return (
    <Svg label="The checkpoint directory is object storage. The live state RocksDB holds still sits on the pod's own disk" h={300}>
      <rect x={60} y={50} width={200} height={60} rx={4} fill={C.panel} stroke={C.second} />
      <T x={160} y={85} s={12} a="middle" f={C.second}>pod's local disk: live state</T>
      <g opacity={k}>
        <rect x={340} y={50} width={200} height={60} rx={4} fill={C.panel} stroke={C.focus} />
        <T x={440} y={85} s={12} a="middle" f={C.focus}>object storage: checkpoint copy</T>
      </g>
    </Svg>
  );
}

// 13 · Predict 2 resolved: the hook, answered.
export function HookResolved({ t }: StepCtx) {
  const k = easeOut(seg(t, 0.3, 0.9));
  return (
    <Svg label="The operator's roll waits: the second broker is left alone until the first rejoins the in sync set" h={300}>
      <Lane x={40} label="broker: draining" color={C.badText} inSync={false} />
      <g opacity={k}>
        <Lane x={225} label="broker: waiting" color={C.quiet} />
      </g>
      <Lane x={410} label="broker: up" color={C.second} />
      <T x={300} y={240} s={13} a="middle" f={C.quiet}>the drain is not instant; the roll is still safe</T>
    </Svg>
  );
}

// 14 · Managed vs self-run.
export function ManagedVsSelfRun({ t }: StepCtx) {
  const k = easeOut(seg(t, 0.2, 0.9));
  return (
    <Svg label="Managed Kafka and managed Flink move the rolling, the ISR watch, and the upgrades off your plate" h={340}>
      <CompareRow y={40} title="self-run: Strimzi, Flink operator" caption="you watch the ISR, roll brokers, pick upgrade modes" color={C.second} />
      <g opacity={k}>
        <CompareRow y={130} title="managed Kafka, managed Flink" caption="less operated; the lock-in cost is real too" color={C.focus} />
      </g>
    </Svg>
  );
}

// 15 · Recap / handoff.
export function Recap({ t }: StepCtx) {
  return (
    <Svg label="A broker and a job owned state that took effort to build. The next question is who may change the cluster at all" h={280}>
      <Lane x={225} label="state, kept" color={C.second} />
      <T x={300} y={230} s={13} a="middle" f={C.quiet}>everything here is a document; who may change it is next</T>
    </Svg>
  );
}
