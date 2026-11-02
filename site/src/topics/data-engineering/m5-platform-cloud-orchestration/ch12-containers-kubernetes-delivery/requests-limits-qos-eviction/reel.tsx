import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// Full topic: the scheduler's reservation and the kernel's ceiling, and the two separate
// rankings that decide who gets evicted or killed under pressure. No local Kubernetes cluster
// is reachable on this build machine, so the kubelet's live behaviour is sourced from
// Kubernetes' own docs; the QoS, eviction-ranking and oom_score_adj mechanics are run for real
// in examples.py.
const reel: Reel = {
  steps: [
    {
      title: 'Same limit, three different fates',
      body: (
        <>
          A node runs low on memory. Three pods on it carry the exact same limit: one Guaranteed, one Burstable and over its own request, one BestEffort.
          Which does the kubelet evict first — and does the kernel's own OOM killer agree?
        </>
      ),
      duration: 2.4,
      fig: 'three pods, one pressured node',
      Visual: S.Hook,
    },
    {
      title: 'Who does the kubelet evict first?',
      body: (
        <>
          Guaranteed, Burstable over its request, BestEffort. Which does the kubelet evict first?
        </>
      ),
      duration: 1.4,
      predict: {
        options: [
          { label: 'the BestEffort pod' },
          { label: 'the Burstable pod, since it is over its request' },
          { label: 'whichever has used the most memory in absolute terms' },
          { label: 'they are evicted together' },
        ],
        explain: (
          <>
            The kubelet's own ranking doesn't single out BestEffort by name — it ranks every pod whose usage exceeds its request first, by priority then by
            how far over. A BestEffort pod has no request at all, so its usage always counts as exceeding it, putting it in that first group alongside the
            over-request Burstable pod; between the two, priority and overage amount decide, not the label.
          </>
        ),
      },
      fig: 'predict: who goes first',
      Visual: S.PredictEvictFirst,
    },
    {
      title: 'Two different jobs, two different numbers',
      body: (
        <>
          The scheduler places a pod by its request — what has to fit on some node. The kubelet, and ultimately the kernel, enforces its limit — what may
          never be exceeded. The gap between the two, summed across a node, is overcommit.
        </>
      ),
      duration: 2.4,
      fig: 'request reserves; limit enforces',
      Visual: S.RequestVsLimit,
    },
    {
      title: 'Three classes, one rule',
      body: (
        <>
          Guaranteed means every container's CPU and memory limit equals its request. Burstable means at least one request or limit is set, but not
          Guaranteed. BestEffort means none of that is set at all.
        </>
      ),
      duration: 2.6,
      takeaway: 'Guaranteed, Burstable and BestEffort fall out of one rule about requests and limits.',
      fig: 'the three-class rule',
      Visual: S.ThreeQosClasses,
    },
    {
      title: 'Two rankings, not one',
      body: (
        <>
          The kubelet's own eviction order never reads a pod's QoS class — it ranks by usage over request, then priority, then overage. The kernel's OOM
          killer reads something QoS class does set directly: `oom_score_adj`. QoS is only a rough estimate of what the kubelet will actually do.
        </>
      ),
      duration: 3.0,
      takeaway: "QoS class sets the kernel's oom_score_adj directly; it only estimates the kubelet's own ranking.",
      fig: 'the kubelet ranking vs. the kernel score',
      Visual: S.TwoRankings,
    },
    {
      title: 'The exception: even Guaranteed can fall',
      body: (
        <>
          A Guaranteed pod is never evicted because of another pod's usage. But if a system daemon itself needs memory the node's own reservations didn't
          account for, the kubelet will still evict the lowest-priority Guaranteed or under-request pod to protect the node.
        </>
      ),
      duration: 2.4,
      fig: 'a system daemon forcing the exception',
      Visual: S.GuaranteedException,
    },
    {
      title: 'A spike that outruns the poll',
      body: (
        <>
          The kubelet polls for memory pressure at an interval. A spike fast enough to outrun that poll reaches the kernel's own OOM killer before the
          kubelet's eviction loop ever acts. Which one kills the pod in that case?
        </>
      ),
      duration: 1.4,
      predict: {
        options: [
          { label: "the kubelet's eviction, always" },
          { label: 'the kernel OOM killer, if the spike is fast enough', correct: true },
          { label: 'neither — Kubernetes always wins the race' },
          { label: "it's random" },
        ],
        explain: (
          <>
            The kernel's OOM killer, when the spike outruns the kubelet's polling interval. That's exactly why the kubelet's eviction ranking and the
            kernel's OOM score can disagree about which pod actually dies — only one of them is watching fast enough.
          </>
        ),
      },
      fig: 'predict: who wins the race',
      Visual: S.PredictRace,
    },
    {
      title: 'The CPU-limit debate, named honestly',
      body: (
        <>
          A CPU limit is throttled even on an idle node the moment a pod exceeds its own quota. One practitioner argument, worth naming as opinion, says
          this makes limits actively harmful and recommends accurate requests alone. The counter is mechanical, not opinion: a limit caps what any single
          pod can burst to, which is what makes node capacity planning predictable.
        </>
      ),
      duration: 2.8,
      fig: 'capped burst vs. requests alone',
      Visual: S.CpuLimitDebate,
    },
    {
      title: "A budget that never reaches this",
      body: (
        <>
          A PodDisruptionBudget governs the Eviction API — a drain, a node upgrade. Node-pressure eviction is documented as an involuntary disruption,
          which a PDB cannot prevent, only count against; under a hard threshold the kubelet uses a zero-second grace period regardless.
        </>
      ),
      duration: 2.6,
      takeaway: 'A PodDisruptionBudget governs a drain; node-pressure eviction ignores it entirely.',
      fig: 'voluntary drain vs. node pressure',
      Visual: S.PdbScope,
    },
    {
      title: 'Preemption and resize, the two boundaries',
      body: (
        <>
          A pending pod can only preempt pods of strictly lower priority, and the victims still get their normal termination grace period first. In-place
          resize, stable since Kubernetes 1.35, can change a pod's requests and limits without a restart — but never the QoS class it was created with.
        </>
      ),
      duration: 2.6,
      fig: 'three boundaries that hold',
      Visual: S.PriorityResize,
    },
    {
      title: 'Five things to keep',
      body: (
        <>
          A pod with the right resources still has to be a pod that is meant to end. The next topic is the Kubernetes objects built for exactly that:
          Jobs and CronJobs.
        </>
      ),
      duration: 2.2,
      fig: 'recap',
      Visual: S.Recap,
    },
  ],
};

export default reel;
