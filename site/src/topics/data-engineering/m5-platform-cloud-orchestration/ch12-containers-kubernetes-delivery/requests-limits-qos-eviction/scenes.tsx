import { C, Svg, T, Reticle } from '../../../../../reels/kit';
import { easeOut, seg } from '../../../../../reels/anim';
import type { StepCtx } from '../../../../../reels/types';

// No local Kubernetes cluster on this build machine, so the kubelet's live eviction behaviour is
// sourced from Kubernetes' own documentation (SOURCES.md). The QoS-classification rule, the
// eviction-ranking rule, and the oom_score_adj formula are run for real in examples.py.

// 1 · Hook: a pressured node, three pods, same limit.
export function Hook({ t }: StepCtx) {
  const pods = [
    { label: 'Guaranteed', color: C.second },
    { label: 'Burstable', color: C.focus },
    { label: 'BestEffort', color: C.cherryText },
  ];
  return (
    <Svg label="A node runs low on memory; three pods carry the same limit. Who dies first?" h={340}>
      <rect x={60} y={60} width={480} height={50} rx={4} fill={C.cherry} opacity={0.25} stroke={C.cherryText} />
      <T x={300} y={90} s={13} a="middle" f={C.cherryText}>node: memory pressure</T>
      {pods.map((p, i) => {
        const k = easeOut(seg(t, 0.2 + 0.15 * i, 0.2 + 0.15 * i + 0.4));
        return (
          <g key={p.label} opacity={k}>
            <rect x={80 + i * 150} y={160} width={120} height={60} rx={4} fill={C.panel} stroke={p.color} />
            <T x={140 + i * 150} y={195} s={13} a="middle" f={p.color}>{p.label}</T>
          </g>
        );
      })}
      <T x={300} y={280} s={13} a="middle" f={C.quiet}>
        same limit; who goes first, and who does the kernel take?
      </T>
    </Svg>
  );
}

// 2 · Predict: who's evicted first.
export function PredictEvictFirst({ t }: StepCtx) {
  return (
    <Svg label="Guaranteed, Burstable over its request, BestEffort — which does the kubelet evict first?" h={340}>
      {['Guaranteed', 'Burstable (over)', 'BestEffort'].map((l, i) => (
        <rect key={l} x={80 + i * 150} y={120} width={120} height={60} rx={4} fill={C.panel} stroke={C.primary} />
      ))}
      {['Guaranteed', 'Burstable (over)', 'BestEffort'].map((l, i) => (
        <T key={l} x={140 + i * 150} y={155} s={12} a="middle" f={C.primary}>{l}</T>
      ))}
      <Reticle x={300} y={150} w={460} h={80} t={t} at={0.3} />
      <T x={300} y={70} s={15} a="middle" f={C.crema} serif>
        which one does the kubelet evict first?
      </T>
    </Svg>
  );
}

// 3 · Request vs limit, two different jobs.
export function RequestVsLimit({ t }: StepCtx) {
  const k = easeOut(seg(t, 0.3, 0.9));
  return (
    <Svg label="The scheduler places by request; the kubelet and kernel enforce the limit" h={320}>
      <rect x={100} y={60} width={400} height={50} rx={4} fill={C.panel} stroke={C.second} />
      <T x={300} y={90} s={13} a="middle" f={C.second}>request: what the scheduler reserves</T>
      <rect x={100} y={200} width={400} height={50} rx={4} fill={C.panel} stroke={C.cherryText} />
      <T x={300} y={230} s={13} a="middle" f={C.cherryText}>limit: what the kernel enforces</T>
      <g opacity={k}>
        <rect x={100} y={130} width={400 * 0.4} height={40} rx={4} fill={C.quiet} opacity={0.2} />
        <T x={300} y={155} s={12} a="middle" f={C.quiet}>the gap: overcommit</T>
      </g>
    </Svg>
  );
}

// 4 · Three QoS classes, from one rule.
export function ThreeQosClasses({ t }: StepCtx) {
  const rows = [
    { name: 'Guaranteed', rule: 'every limit equals its request', color: C.second },
    { name: 'Burstable', rule: 'at least one request or limit set', color: C.focus },
    { name: 'BestEffort', rule: 'no requests or limits at all', color: C.cherryText },
  ];
  return (
    <Svg label="Guaranteed, Burstable, BestEffort — one rule, three classes" h={320}>
      {rows.map((r, i) => {
        const k = easeOut(seg(t, 0.2 * i, 0.2 * i + 0.4));
        return (
          <g key={r.name} opacity={k}>
            <rect x={60} y={50 + i * 80} width={480} height={56} rx={4} fill={C.panel} stroke={r.color} />
            <T x={300} y={50 + i * 80 + 24} s={14} a="middle" f={r.color}>{r.name}</T>
            <T x={300} y={50 + i * 80 + 44} s={12} a="middle" f={C.quiet}>{r.rule}</T>
          </g>
        );
      })}
    </Svg>
  );
}

// 5 · Two rankings, not one.
export function TwoRankings({ t }: StepCtx) {
  const k = easeOut(seg(t, 0.3, 0.9));
  return (
    <Svg label="The kubelet's eviction ranking and the kernel's OOM score are two different lists" h={360}>
      <rect x={100} y={40} width={400} height={50} rx={4} fill={C.panel} stroke={C.focus} />
      <T x={300} y={70} s={13} a="middle" f={C.focus}>kubelet eviction</T>
      <T x={300} y={108} s={12} a="middle" f={C.quiet}>usage over request, priority, overage</T>
      <rect x={100} y={150} width={400} height={50} rx={4} fill={C.panel} stroke={C.cherryText} />
      <T x={300} y={180} s={13} a="middle" f={C.cherryText}>kernel OOM score</T>
      <T x={300} y={218} s={12} a="middle" f={C.quiet}>oom_score_adj, set by QoS class</T>
      <g opacity={k}>
        <T x={300} y={260} s={13} a="middle" f={C.primary}>QoS class feeds one list directly</T>
        <T x={300} y={282} s={13} a="middle" f={C.primary}>and only estimates the other</T>
      </g>
    </Svg>
  );
}

// 6 · The exception: a Guaranteed pod can still be evicted.
export function GuaranteedException({ t }: StepCtx) {
  const k = easeOut(seg(t, 0.3, 0.8));
  return (
    <Svg label="A Guaranteed pod is never evicted for another pod's usage — but a system daemon can still force it" h={320}>
      <rect x={160} y={60} width={280} height={50} rx={4} fill={C.panel} stroke={C.second} />
      <T x={300} y={90} s={13} a="middle" f={C.second}>Guaranteed pod</T>
      <T x={300} y={140} s={12} a="middle" f={C.quiet}>safe from other pods' usage</T>
      <g opacity={k}>
        <rect x={160} y={190} width={280} height={50} rx={4} fill={C.cherry} opacity={0.25} stroke={C.cherryText} />
        <T x={300} y={220} s={13} a="middle" f={C.cherryText}>a system daemon needing memory</T>
        <T x={300} y={260} s={12} a="middle" f={C.quiet}>can still force the lowest-priority one out</T>
      </g>
    </Svg>
  );
}

// 7 · Predict 2: who wins the race.
export function PredictRace({ t }: StepCtx) {
  return (
    <Svg label="A memory spike outruns the kubelet's polling interval. Who kills the pod?" h={320}>
      <rect x={60} y={80} width={220} height={60} rx={4} fill={C.panel} stroke={C.focus} />
      <T x={170} y={115} s={13} a="middle" f={C.focus}>kubelet poll loop</T>
      <rect x={320} y={80} width={220} height={60} rx={4} fill={C.panel} stroke={C.cherryText} />
      <T x={430} y={115} s={13} a="middle" f={C.cherryText}>kernel OOM killer</T>
      <Reticle x={300} y={110} w={500} h={100} t={t} at={0.3} />
      <T x={300} y={50} s={15} a="middle" f={C.crema} serif>
        the spike outruns the poll — who wins?
      </T>
    </Svg>
  );
}

// 8 · The CPU-limit debate, named honestly.
export function CpuLimitDebate({ t }: StepCtx) {
  const k = easeOut(seg(t, 0.3, 0.9));
  return (
    <Svg label="A limit caps a burst, which helps capacity planning; one practitioner opinion says drop it" h={320}>
      <rect x={60} y={60} width={220} height={70} rx={4} fill={C.panel} stroke={C.second} />
      <T x={170} y={90} s={13} a="middle" f={C.second}>with a limit</T>
      <T x={170} y={110} s={11} a="middle" f={C.quiet}>capped burst, predictable</T>
      <rect x={320} y={60} width={220} height={70} rx={4} fill={C.panel} stroke={C.focus} />
      <T x={430} y={90} s={13} a="middle" f={C.focus}>without one (opinion)</T>
      <T x={430} y={110} s={11} a="middle" f={C.quiet}>no throttling, requests only</T>
      <g opacity={k}>
        <T x={300} y={200} s={13} a="middle" f={C.quiet}>
          throttled on an idle node either way, if over quota
        </T>
      </g>
    </Svg>
  );
}

// 9 · PodDisruptionBudgets don't reach node pressure.
export function PdbScope({ t }: StepCtx) {
  const k = easeOut(seg(t, 0.3, 0.8));
  return (
    <Svg label="A PodDisruptionBudget governs a drain; it never reaches node-pressure eviction" h={320}>
      <rect x={60} y={60} width={220} height={60} rx={4} fill={C.panel} stroke={C.second} />
      <T x={170} y={88} s={13} a="middle" f={C.second}>voluntary drain</T>
      <T x={170} y={106} s={11} a="middle" f={C.quiet}>PDB applies</T>
      <g opacity={k}>
        <rect x={320} y={60} width={220} height={60} rx={4} fill={C.cherry} opacity={0.25} stroke={C.cherryText} />
        <T x={430} y={88} s={13} a="middle" f={C.cherryText}>node-pressure eviction</T>
        <T x={430} y={106} s={11} a="middle" f={C.quiet}>PDB ignored, 0s grace</T>
      </g>
    </Svg>
  );
}

// 10 · Priority, preemption, in-place resize.
export function PriorityResize({ t }: StepCtx) {
  const items = ['preemption needs strictly higher priority', 'victims still get their grace period', "resize can't cross a QoS-class boundary"];
  return (
    <Svg label="Preemption only runs uphill; a resize never changes which class a pod belongs to" h={300}>
      {items.map((it, i) => {
        const k = easeOut(seg(t, 0.15 * i, 0.15 * i + 0.4));
        return (
          <g key={it} opacity={k} transform={`translate(0 ${(1 - k) * 6})`}>
            <circle cx={30} cy={60 + i * 60} r={3} fill={C.focus} />
            <T x={48} y={60 + i * 60 + 5} s={13} f={C.primary} w={480}>{it}</T>
          </g>
        );
      })}
    </Svg>
  );
}

// 11 · Recap.
export function Recap({ t }: StepCtx) {
  const lines: [string, string][] = [
    ['The scheduler places by request;', 'the kernel enforces the limit.'],
    ['The kubelet ranks by usage over', 'request, never by QoS class itself.'],
    ['QoS sets oom_score_adj, which the', 'kernel reads — a separate ranking.'],
    ['A PodDisruptionBudget never', 'reaches node-pressure eviction.'],
    ['A resize can change the numbers,', "never which QoS class a pod is in."],
  ];
  return (
    <Svg label="Five things to keep from this topic" h={360}>
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
