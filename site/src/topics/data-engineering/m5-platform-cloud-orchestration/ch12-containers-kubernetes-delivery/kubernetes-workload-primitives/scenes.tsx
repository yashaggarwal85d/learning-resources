import { C, Svg, T, Reticle } from '../../../../../reels/kit';
import { easeOut, seg } from '../../../../../reels/anim';
import type { StepCtx } from '../../../../../reels/types';

// No local Kubernetes cluster on this build machine (no kubectl, no kind/k3s), so every object's
// behaviour drawn here is sourced from Kubernetes' own concept pages (SOURCES.md). The
// reconciliation-loop and taint/toleration mechanics are run for real in examples.py.

// 1 · Hook: delete a pod by hand, a replacement appears.
export function Hook({ t }: StepCtx) {
  const k = easeOut(seg(t, 0.3, 0.8));
  return (
    <Svg label="Delete a pod by hand; a replacement appears seconds later" h={340}>
      <rect x={60} y={80} width={120} height={70} rx={4} fill={C.panel} stroke={C.primary} />
      <T x={120} y={120} s={13} a="middle" f={C.primary}>pod-0</T>
      <rect x={240} y={80} width={120} height={70} rx={4} fill={C.cherry} opacity={0.3} stroke={C.cherryText} />
      <T x={300} y={120} s={13} a="middle" f={C.cherryText}>deleted</T>
      <g opacity={k}>
        <rect x={420} y={80} width={120} height={70} rx={4} fill={C.panel} stroke={C.second} />
        <T x={480} y={112} s={12} a="middle" f={C.second}>pod-0</T>
        <T x={480} y={130} s={11} a="middle" f={C.quiet}>(new)</T>
      </g>
      <T x={300} y={230} s={14} a="middle" f={C.crema} serif>
        something keeps putting it back
      </T>
    </Svg>
  );
}

// 2 · Predict: how many pods a minute later, who made the replacement?
export function PredictReplace({ t }: StepCtx) {
  return (
    <Svg label="Three replicas; delete one by hand. A minute later, how many, and who replaced it?" h={340}>
      {[0, 1, 2].map((i) => (
        <rect key={i} x={120 + i * 140} y={100} width={100} height={60} rx={4} fill={i === 1 ? C.cherry : C.panel} opacity={i === 1 ? 0.3 : 1} stroke={i === 1 ? C.cherryText : C.primary} />
      ))}
      <Reticle x={300} y={130} w={460} h={100} t={t} at={0.3} />
      <T x={300} y={50} s={15} a="middle" f={C.crema} serif>
        one minute later: how many, and who replaced it?
      </T>
    </Svg>
  );
}

// 3 · The control loop, named.
export function ControlLoop({ t }: StepCtx) {
  const k = easeOut(seg(t, 0.3, 0.9));
  return (
    <Svg label="A controller continuously narrows the gap between desired and actual state" h={320}>
      <rect x={100} y={60} width={400} height={50} rx={4} fill={C.panel} stroke={C.second} />
      <T x={300} y={90} s={14} a="middle" f={C.second}>spec: desired state</T>
      <rect x={100} y={200} width={400} height={50} rx={4} fill={C.panel} stroke={C.primary} />
      <T x={300} y={230} s={14} a="middle" f={C.primary}>status: actual state</T>
      <g opacity={k}>
        <path d="M 500 115 Q 560 150 500 195" fill="none" stroke={C.focus} strokeWidth={1.5} />
        <path d="M 494 186 L 500 195 L 510 190" fill="none" stroke={C.focus} strokeWidth={1.5} />
        <T x={540} y={158} s={11} a="middle" f={C.focus}>controller</T>
      </g>
    </Svg>
  );
}

// 4 · Pod, Deployment, StatefulSet.
export function PodDeployStateful({ t }: StepCtx) {
  const rows = [
    { name: 'Pod', does: 'the schedulable unit', color: C.primary },
    { name: 'Deployment', does: 'interchangeable replicas', color: C.focus },
    { name: 'StatefulSet', does: 'sticky identity, own volume', color: C.second },
  ];
  return (
    <Svg label="A Pod, a Deployment's replicas, and a StatefulSet's sticky identity" h={320}>
      {rows.map((r, i) => {
        const k = easeOut(seg(t, 0.2 * i, 0.2 * i + 0.4));
        return (
          <g key={r.name} opacity={k}>
            <rect x={60} y={50 + i * 80} width={480} height={56} rx={4} fill={C.panel} stroke={r.color} />
            <T x={300} y={50 + i * 80 + 24} s={14} a="middle" f={r.color}>{r.name}</T>
            <T x={300} y={50 + i * 80 + 44} s={12} a="middle" f={C.quiet}>{r.does}</T>
          </g>
        );
      })}
      <T x={300} y={300} s={13} a="middle" f={C.quiet}>
        StatefulSet pods are not interchangeable
      </T>
    </Svg>
  );
}

// 5 · Service and DNS.
export function ServiceDns({ t }: StepCtx) {
  const k = easeOut(seg(t, 0.3, 0.9));
  return (
    <Svg label="A Service's name resolves the same way, whichever pod answers" h={320}>
      <rect x={220} y={60} width={160} height={50} rx={4} fill={C.panel} stroke={C.second} />
      <T x={300} y={90} s={13} a="middle" f={C.second}>orders.svc</T>
      {[0, 1, 2].map((i) => {
        const kk = easeOut(seg(t, 0.3 + 0.15 * i, 0.3 + 0.15 * i + 0.4));
        return (
          <g key={i} opacity={kk}>
            <line x1={300} y1={110} x2={150 + i * 150} y2={200} stroke={C.line} />
            <rect x={110 + i * 150} y={200} width={80} height={50} rx={4} fill={C.panel} stroke={C.primary} />
            <T x={150 + i * 150} y={228} s={12} a="middle" f={C.primary}>pod-{i}</T>
          </g>
        );
      })}
      <T x={300} y={290} s={13} a="middle" f={C.quiet}>
        the name stays the same; the pod behind it changes
      </T>
    </Svg>
  );
}

// 6 · ConfigMaps and Secrets: base64 is not encryption.
export function ConfigSecrets({ t }: StepCtx) {
  const k = easeOut(seg(t, 0.3, 0.8));
  return (
    <Svg label="A Secret is stored unencrypted by default; base64 obscures, it does not secure" h={320}>
      <rect x={80} y={70} width={200} height={60} rx={4} fill={C.panel} stroke={C.line} />
      <T x={180} y={105} s={13} a="middle" f={C.primary}>ConfigMap</T>
      <rect x={320} y={70} width={200} height={60} rx={4} fill={C.panel} stroke={C.cherryText} />
      <T x={420} y={100} s={13} a="middle" f={C.cherryText}>Secret</T>
      <T x={420} y={118} s={11} a="middle" f={C.quiet}>base64, not encrypted</T>
      <g opacity={k}>
        <rect x={80} y={180} width={440} height={50} rx={4} fill={C.panel} stroke={C.line} />
        <T x={300} y={210} s={13} a="middle" f={C.primary}>
          same unencrypted store (etcd) either way
        </T>
      </g>
    </Svg>
  );
}

// 7 · PV, PVC, StorageClass.
export function PvPvcStorageClass({ t }: StepCtx) {
  const steps = [
    { label: 'StorageClass', sub: 'how to provision' },
    { label: 'PersistentVolumeClaim', sub: "a pod's request" },
    { label: 'PersistentVolume', sub: 'storage the cluster has' },
  ];
  return (
    <Svg label="A StorageClass provisions a PersistentVolume to match a PersistentVolumeClaim" h={320}>
      {steps.map((s, i) => {
        const k = easeOut(seg(t, 0.2 * i, 0.2 * i + 0.4));
        return (
          <g key={s.label} opacity={k}>
            <rect x={60} y={50 + i * 85} width={480} height={55} rx={4} fill={C.panel} stroke={C.second} />
            <T x={300} y={50 + i * 85 + 24} s={13} a="middle" f={C.second}>{s.label}</T>
            <T x={300} y={50 + i * 85 + 42} s={11} a="middle" f={C.quiet}>{s.sub}</T>
          </g>
        );
      })}
    </Svg>
  );
}

// 8 · Taints, tolerations, affinity.
export function TaintsAffinity({ t }: StepCtx) {
  const k1 = easeOut(seg(t, 0.2, 0.6));
  const k2 = easeOut(seg(t, 0.5, 0.9));
  return (
    <Svg label="A taint repels; only a matching toleration lets a pod land anyway" h={340}>
      <rect x={200} y={60} width={200} height={60} rx={4} fill={C.panel} stroke={C.cherryText} />
      <T x={300} y={95} s={13} a="middle" f={C.cherryText}>node: tainted</T>
      <g opacity={k1}>
        <rect x={80} y={200} width={120} height={50} rx={4} fill={C.panel} stroke={C.line} />
        <T x={140} y={230} s={12} a="middle" f={C.quiet}>no toleration</T>
        <T x={140} y={180} s={12} a="middle" f={C.cherryText}>repelled</T>
      </g>
      <g opacity={k2}>
        <rect x={400} y={200} width={120} height={50} rx={4} fill={C.panel} stroke={C.second} />
        <T x={460} y={230} s={12} a="middle" f={C.second}>matching toleration</T>
        <T x={460} y={180} s={12} a="middle" f={C.second}>may schedule</T>
      </g>
      <T x={300} y={300} s={13} a="middle" f={C.quiet}>
        allowed, not guaranteed — affinity is separate
      </T>
    </Svg>
  );
}

// 9 · Restart policies and the reconciliation idea, restated.
export function ReconciliationRestated({ t }: StepCtx) {
  const items = ['requests and limits', 'Jobs that must finish', 'Spark on its own pods', 'stateful sets', 'GitOps'];
  return (
    <Svg label="Every object here is a spec a controller works to match; the rest of the chapter is this loop from new angles" h={320}>
      {items.map((it, i) => {
        const k = easeOut(seg(t, 0.12 * i, 0.12 * i + 0.4));
        return (
          <g key={it} opacity={k} transform={`translate(0 ${(1 - k) * 6})`}>
            <circle cx={30} cy={40 + i * 48} r={3} fill={C.focus} />
            <T x={48} y={40 + i * 48 + 5} s={13} f={C.primary}>{it}</T>
          </g>
        );
      })}
    </Svg>
  );
}

// 10 · Recap.
export function Recap({ t }: StepCtx) {
  const lines: [string, string][] = [
    ['A controller is a loop that', 'narrows the gap to a declared spec.'],
    ['Pods are interchangeable in a', 'Deployment, not in a StatefulSet.'],
    ['A Secret is unencrypted by', 'default; base64 is not security.'],
    ['A StorageClass lets a PVC', 'get a PV without an admin pre-making one.'],
    ['A taint repels; a toleration', 'allows scheduling, never guarantees it.'],
  ];
  return (
    <Svg label="Five things to keep from this refresher" h={360}>
      {lines.map(([l1, l2], i) => {
        const k = easeOut(seg(t, 0.15 * i, 0.15 * i + 0.4));
        return (
          <g key={l1} opacity={k} transform={`translate(0 ${(1 - k) * 8})`}>
            <circle cx={30} cy={34 + i * 62} r={3} fill={C.focus} />
            <T x={48} y={34 + i * 62 + 5} s={13} f={C.primary} w={400}>{l1}</T>
            <T x={48} y={34 + i * 62 + 23} s={13} f={C.primary} w={400}>{l2}</T>
          </g>
        );
      })}
    </Svg>
  );
}
