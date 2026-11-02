import { C, Svg, T, Reticle } from '../../../../../reels/kit';
import { easeOut, seg } from '../../../../../reels/anim';
import type { StepCtx } from '../../../../../reels/types';

// No local Kubernetes cluster on this build machine (no Docker daemon, no kubectl/kind/k3s), so
// spark-submit's live pod creation and the lab's injected-failure timings are sourced from
// Spark's and the operators' own documentation (SOURCES.md). The OwnerReference cleanup model,
// the shuffle-tracking-timeout model, and the decommission-vs-abrupt-kill cost model are run for
// real in examples.py.

function Lane({ x, y = 100, label, color, hasBlocks, draining }: { x: number; y?: number; label: string; color: string; hasBlocks: boolean; draining?: boolean }) {
  return (
    <g>
      <rect x={x} y={y} width={100} height={60} rx={4} fill={C.panel} stroke={color} />
      <T x={x + 50} y={y + 32} s={12} a="middle" f={color}>{label}</T>
      {hasBlocks && [0, 1, 2].map((i) => (
        <rect key={i} x={x + 14 + i * 26} y={y + 42} width={18} height={10} rx={2} fill={draining ? C.second : C.quiet} />
      ))}
    </g>
  );
}

// 1 · Hook: a spot node reclaimed with a two-minute warning.
export function Hook({ t }: StepCtx) {
  return (
    <Svg label="A spot node is reclaimed at 02:10 with a two-minute warning" h={300}>
      <Lane x={60} label="executor" color={C.second} hasBlocks />
      <Lane x={220} label="executor" color={C.second} hasBlocks />
      <Lane x={380} label="executor (going)" color={C.badText} hasBlocks />
      <T x={300} y={230} s={13} a="middle" f={C.quiet}>spot interruption: two minutes before it's gone</T>
    </Svg>
  );
}

// 2 · Predict: how much work gets redone.
export function PredictRedo({ t }: StepCtx) {
  return (
    <Svg label="With decommissioning off, how much work does the job redo?" h={280}>
      <Lane x={380} label="lost" color={C.badText} hasBlocks />
      <Reticle x={430} y={130} w={240} h={140} t={t} at={0.3} />
      <T x={300} y={40} s={15} a="middle" f={C.crema} serif>
        recompute the whole stage, one task, or nothing?
      </T>
    </Svg>
  );
}

// 3 · spark-submit to running executors, API call by API call.
export function SubmitFlow({ t }: StepCtx) {
  const k = easeOut(seg(t, 0.2, 0.9));
  return (
    <Svg label="spark-submit against a k8s:// master starts a driver pod, which asks the API server for executors" h={320}>
      <rect x={220} y={50} width={160} height={50} rx={4} fill={C.panel} stroke={C.focus} />
      <T x={300} y={80} s={13} a="middle" f={C.focus}>driver pod</T>
      {[0, 1, 2].map((i) => {
        const show = easeOut(seg(t, 0.2 + i * 0.2, 0.2 + i * 0.2 + 0.3)) * k;
        return (
          <g key={i} opacity={show}>
            <rect x={120 + i * 140} y={170} width={100} height={50} rx={4} fill={C.panel} stroke={C.second} />
            <T x={170 + i * 140} y={200} s={12} a="middle" f={C.second}>executor</T>
          </g>
        );
      })}
      <T x={300} y={260} s={12} a="middle" f={C.quiet}>no cluster manager pre-exists the application</T>
    </Svg>
  );
}

// 4 · The driver persists; the executors don't.
export function DriverPersists({ t }: StepCtx) {
  const k = easeOut(seg(t, 0.3, 0.9));
  return (
    <Svg label='Executors terminate and are cleaned up; the driver persists, "completed," using no resources' h={300}>
      <rect x={220} y={50} width={160} height={50} rx={4} fill={C.panel} stroke={C.second} />
      <T x={300} y={80} s={13} a="middle" f={C.second}>driver: completed</T>
      <g opacity={1 - k}>
        <rect x={120} y={170} width={100} height={50} rx={4} fill={C.panel} stroke={C.line} />
        <rect x={380} y={170} width={100} height={50} rx={4} fill={C.panel} stroke={C.line} />
      </g>
      <T x={300} y={260} s={12} a="middle" f={C.quiet}>logs remain; no CPU or memory still held</T>
    </Svg>
  );
}

// 5 · The owner reference, the cleanup switch.
export function OwnerReference({ t }: StepCtx) {
  const k = easeOut(seg(t, 0.3, 0.9));
  return (
    <Svg label="Executors carry an OwnerReference to the driver pod; the driver's death removes them" h={300}>
      <rect x={220} y={50} width={160} height={50} rx={4} fill={C.panel} stroke={C.badText} opacity={1 - k * 0.5} />
      <T x={300} y={80} s={13} a="middle" f={C.badText} o={1 - k * 0.3}>driver (deleted)</T>
      <g opacity={1 - k}>
        <rect x={120} y={170} width={100} height={50} rx={4} fill={C.panel} stroke={C.second} />
        <rect x={380} y={170} width={100} height={50} rx={4} fill={C.panel} stroke={C.second} />
      </g>
      <T x={300} y={260} s={12} a="middle" f={C.quiet}>only if the reference points to the right pod</T>
    </Svg>
  );
}

// 6 · Dynamic allocation needs shuffle tracking.
export function ShuffleTracking({ t }: StepCtx) {
  const k = easeOut(seg(t, 0.3, 0.9));
  return (
    <Svg label="shuffleTracking.enabled keeps an executor holding live shuffle data alive — no external shuffle service exists" h={300}>
      <Lane x={60} label="idle, no data" color={C.quiet} hasBlocks={false} />
      <Lane x={220} label="idle, has data" color={C.second} hasBlocks />
      <g opacity={k}>
        <T x={300} y={230} s={13} a="middle" f={C.primary}>the first idles out; the second is kept alive</T>
      </g>
    </Svg>
  );
}

// 7 · The cost: an infinite default timeout.
export function InfiniteTimeout({ t }: StepCtx) {
  const k = easeOut(seg(t, 0.3, 0.9));
  return (
    <Svg label="shuffleTracking.timeout defaults to infinity — an executor may never idle out on its own" h={280}>
      <Lane x={220} label="holding data" color={C.second} hasBlocks />
      <g opacity={k}>
        <T x={300} y={220} s={13} a="middle" f={C.badText}>held until garbage collection cleans up the shuffle</T>
      </g>
    </Svg>
  );
}

// 8 · Abrupt kill vs. graceful decommission.
export function AbruptVsGraceful({ t }: StepCtx) {
  const k = easeOut(seg(t, 0.2, 0.9));
  return (
    <Svg label="An abrupt kill redoes the stage that held its shuffle data; decommissioning migrates the blocks first" h={400}>
      <T x={300} y={30} s={12} a="middle" f={C.quiet}>abrupt kill</T>
      <Lane x={60} y={50} label="executor" color={C.second} hasBlocks />
      <Lane x={220} y={50} label="gone" color={C.badText} hasBlocks={false} />
      <T x={300} y={240} s={12} a="middle" f={C.quiet}>decommission, with migration</T>
      <g opacity={k}>
        <Lane x={60} y={260} label="executor" color={C.second} hasBlocks draining />
        <Lane x={220} y={260} label="draining out" color={C.focus} hasBlocks={false} />
      </g>
    </Svg>
  );
}

// 9 · Predict 2: resolves the hook.
export function PredictResolve({ t }: StepCtx) {
  return (
    <Svg label="Decommissioning is on. Does the two-minute spot warning let the blocks finish migrating?" h={280}>
      <Lane x={220} label="migrating" color={C.second} hasBlocks draining />
      <Reticle x={270} y={130} w={240} h={140} t={t} at={0.3} />
      <T x={300} y={40} s={15} a="middle" f={C.crema} serif>
        does the stage still redo?
      </T>
    </Svg>
  );
}

// 10 · Remote shuffle, a different trade.
export function RemoteShuffle({ t }: StepCtx) {
  const k = easeOut(seg(t, 0.3, 0.9));
  return (
    <Svg label="Apache Celeborn moves shuffle data off the executors entirely — another service to run" h={320}>
      <rect x={100} y={60} width={400} height={60} rx={4} fill={C.panel} stroke={C.second} />
      <T x={300} y={95} s={13} a="middle" f={C.second}>Celeborn: an intermediate data service</T>
      <g opacity={k}>
        <T x={300} y={180} s={13} a="middle" f={C.primary}>an executor can vanish without losing its shuffle data</T>
        <T x={300} y={202} s={12} a="middle" f={C.quiet}>at the cost of running one more service</T>
      </g>
    </Svg>
  );
}

// 11 · Pod templates: the escape hatch, and who wins.
export function PodTemplates({ t }: StepCtx) {
  const k = easeOut(seg(t, 0.3, 0.9));
  return (
    <Svg label="podTemplateFile carries what Spark's own properties can't express — but Spark always wins where both set a value" h={320}>
      <rect x={100} y={50} width={400} height={50} rx={4} fill={C.panel} stroke={C.second} />
      <T x={300} y={80} s={13} a="middle" f={C.second}>pod template: tolerations, sidecars, security context</T>
      <g opacity={k}>
        <rect x={100} y={150} width={400} height={50} rx={4} fill={C.panel} stroke={C.focus} />
        <T x={300} y={180} s={13} a="middle" f={C.focus}>Spark's own properties overwrite the template</T>
      </g>
    </Svg>
  );
}

// 12 · Operators: a declared resource, reconciled.
export function Operators({ t }: StepCtx) {
  const k = easeOut(seg(t, 0.2, 0.9));
  return (
    <Svg label="Two operators turn spark-submit into a declared resource the controller reconciles" h={360}>
      <rect x={100} y={40} width={400} height={60} rx={4} fill={C.panel} stroke={C.second} />
      <T x={300} y={68} s={13} a="middle" f={C.second}>Apache Spark K8s Operator</T>
      <T x={300} y={88} s={11} a="middle" f={C.quiet}>SparkApplication · SparkCluster</T>
      <rect x={100} y={150} width={400} height={60} rx={4} fill={C.panel} stroke={C.focus} />
      <T x={300} y={178} s={13} a="middle" f={C.focus}>Kubeflow Spark Operator</T>
      <T x={300} y={198} s={11} a="middle" f={C.quiet}>SparkApplication (separate API)</T>
      <g opacity={k}>
        <T x={300} y={250} s={13} a="middle" f={C.primary}>"run this application" becomes a resource to reconcile</T>
      </g>
    </Svg>
  );
}

// 13 · Managed vs. self-run.
export function ManagedVsSelf({ t }: StepCtx) {
  const k = easeOut(seg(t, 0.2, 0.9));
  return (
    <Svg label="EMR on EKS and Managed Service for Apache Spark on GKE run Spark pods on a cluster you don't operate" h={360}>
      <rect x={100} y={40} width={400} height={60} rx={4} fill={C.panel} stroke={C.second} />
      <T x={300} y={68} s={13} a="middle" f={C.second}>EMR on EKS</T>
      <T x={300} y={88} s={11} a="middle" f={C.quiet}>EMR-managed, your EKS cluster</T>
      <rect x={100} y={150} width={400} height={60} rx={4} fill={C.panel} stroke={C.focus} />
      <T x={300} y={178} s={13} a="middle" f={C.focus}>Spark on GKE</T>
      <T x={300} y={198} s={11} a="middle" f={C.quiet}>node pools inside a GKE cluster</T>
      <g opacity={k}>
        <T x={300} y={250} s={13} a="middle" f={C.primary}>less to operate; the lock-in cost is real too</T>
      </g>
    </Svg>
  );
}

// 14 · Recap / handoff.
export function Recap({ t }: StepCtx) {
  return (
    <Svg label="A Spark executor is disposable: lose one and the stage is redone. Not everything can be treated that way" h={300}>
      <Lane x={220} label="gone" color={C.badText} hasBlocks={false} />
      <T x={300} y={230} s={13} a="middle" f={C.quiet}>
        disposable executors here; stateful identity is next
      </T>
    </Svg>
  );
}
