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
    <Svg label="a write is acknowledged by both in-sync replicas; then both fail together, leaving only the one replica that was already dropped from the in-sync set" h={200}>
      <Row y={70} label="write acknowledged" value="both in-sync replicas" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="both then fail" value="dropped replica survives" valueColor={C.cherryText} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function PredictCombinations({ t }: StepCtx) {
  return (
    <Svg label="across unclean-election on or off and min.insync.replicas's two settings, does the acknowledged write survive?" h={200}>
      <Row y={70} label="unclean election" value="on or off?" />
      <Row y={130} label="min.insync.replicas" value="decides it?" valueColor={C.focus} />
    </Svg>
  );
}

export function RevealZooKeeper({ t }: StepCtx) {
  return (
    <Svg label="ZooKeeper guarantees linearizable writes and FIFO client order; ephemeral nodes vanish when their session ends, watches signal change, and a local read can lag until a sync" h={260}>
      <Row y={50} label="writes" value="linearizable, FIFO order" o={easeOut(seg(t, 0, 0.3))} />
      <Row y={100} label="ephemeral node" value="gone when session ends" valueColor={C.focus} o={easeOut(seg(t, 0.2, 0.5))} />
      <Row y={150} label="plain read" value="can lag without sync" valueColor={C.cherryText} o={easeOut(seg(t, 0.4, 0.75))} />
    </Svg>
  );
}

export function RevealEtcd({ t }: StepCtx) {
  return (
    <Svg label="etcd's default is strictly serializable; an opt-in serializable read may be stale but is faster; leases bind keys to a lifetime, and a revision counts every change" h={200}>
      <Row y={70} label="default read" value="strictly serializable" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="opt-in read" value="faster, may be stale" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealKRaft({ t }: StepCtx) {
  return (
    <Svg label="Kafka's own release announcement: the first major version to run entirely without the coordination service it depended on, replaced by a Raft-replicated controller quorum" h={200}>
      <Row y={70} label="first major release" value="no coordination service" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="controller quorum" value="metadata via Raft" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealIsrQuorum({ t }: StepCtx) {
  return (
    <Svg label="Kafka's in-sync set commits a write once every member has it, needing one fewer replica than majority vote for the same failure tolerance, at the cost of waiting on the slowest member, not the fastest" h={260}>
      <Row y={50} label="in-sync set" value="every member must have it" o={easeOut(seg(t, 0, 0.3))} />
      <Row y={100} label="replica count" value="cheaper than majority vote" valueColor={C.focus} o={easeOut(seg(t, 0.2, 0.5))} />
      <Row y={150} label="commit speed" value="waits on the slowest" valueColor={C.cherryText} o={easeOut(seg(t, 0.4, 0.75))} />
    </Svg>
  );
}

export function RevealUncleanElection({ t }: StepCtx) {
  return (
    <Svg label="requiring every in-sync replica protects against any one failure among them; letting the leader alone satisfy it weakens that floor; unclean election trades consistency for availability outright" h={200}>
      <Row y={70} label="every in-sync replica" value="protects the floor" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="unclean election" value="consistency for uptime" valueColor={C.cherryText} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealIcebergCas({ t }: StepCtx) {
  return (
    <Svg label="a table commit swaps one pointer atomically, so every reader sees the whole old state or the whole new one, never a mix; a writer that loses the race rebuilds and retries" h={200}>
      <Row y={70} label="one pointer swap" value="whole old or whole new" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="losing writer" value="rebuilds and retries" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function ProveIt({ t }: StepCtx) {
  return (
    <Svg label="a store requires more-than-half-sized read and write quorums, guaranteeing they overlap on at least one replica — does that overlap alone make the store linearizable?" h={200}>
      <Row y={70} label="read, write quorums" value="overlap, guaranteed" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="does overlap alone give it?" value="not by itself" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function Recap({ t }: StepCtx) {
  return (
    <Svg label="ZooKeeper and etcd hand out strongly consistent stores; KRaft replaces one with Raft; Kafka's in-sync set is a cheaper quorum with a cost; a table commit is a linearizable register swapped as one pointer" h={260}>
      <Row y={50} label="ZooKeeper, etcd" value="strongly consistent stores" o={easeOut(seg(t, 0, 0.3))} />
      <Row y={100} label="KRaft, in-sync set" value="Raft, a cheaper quorum" valueColor={C.focus} o={easeOut(seg(t, 0.2, 0.5))} />
      <Row y={150} label="table commit" value="one pointer, swapped" valueColor={C.cherryText} o={easeOut(seg(t, 0.4, 0.75))} />
    </Svg>
  );
}
