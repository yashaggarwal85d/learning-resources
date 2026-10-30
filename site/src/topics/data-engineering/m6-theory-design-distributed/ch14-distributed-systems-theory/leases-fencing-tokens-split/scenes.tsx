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
    <Svg label="a paused worker's lease expires, a second worker takes over and writes, and the first worker wakes and overwrites it — having checked its lease just before it paused" h={200}>
      <Row y={70} label="worker one pauses" value="lease expires, taken" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="worker one wakes" value="overwrites worker two" valueColor={C.cherryText} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function PredictFix({ t }: StepCtx) {
  return (
    <Svg label="would re-checking the lease before writing, a longer lease, or storage refusing the old write have actually prevented this?" h={200}>
      <Row y={70} label="re-check, longer lease" value="would either fix it?" />
      <Row y={130} label="storage refuses old write" value="the only real fix?" valueColor={C.focus} />
    </Svg>
  );
}

export function RevealLease({ t }: StepCtx) {
  return (
    <Svg label="a lease is a quorum's promise not to elect another leader until a deadline; while it holds, a local read stays linearizable, at the price of a bounded clock-drift assumption" h={200}>
      <Row y={70} label="quorum promise" value="no other leader yet" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="price" value="bounded clock drift" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealCheckFails({ t }: StepCtx) {
  return (
    <Svg label="a pause can land anywhere, including the gap between a check and the write right after it — moving the check closer doesn't close that gap, it just relocates it" h={200}>
      <Row y={70} label="check moved closer" value="gap just relocates" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="pause" value="can land in any gap" valueColor={C.cherryText} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealFencingToken({ t }: StepCtx) {
  return (
    <Svg label="a fencing token only increases, travels with every write, and gets checked by the resource itself, which rejects any write carrying a token lower than one it has already seen" h={260}>
      <Row y={50} label="token" value="only ever increases" o={easeOut(seg(t, 0, 0.3))} />
      <Row y={100} label="resource" value="checks every write" valueColor={C.focus} o={easeOut(seg(t, 0.2, 0.5))} />
      <Row y={150} label="stale write" value="rejected, not trusted" valueColor={C.cherryText} o={easeOut(seg(t, 0.4, 0.75))} />
    </Svg>
  );
}

export function RevealFourNames({ t }: StepCtx) {
  return (
    <Svg label="Chubby's sequencer, Kafka's producer epoch, ZooKeeper's zxid, and Raft's term are the same fencing idea under four different names" h={260}>
      <Row y={50} label="Chubby" value="sequencer" o={easeOut(seg(t, 0, 0.3))} />
      <Row y={100} label="Kafka, ZooKeeper" value="epoch, zxid" valueColor={C.focus} o={easeOut(seg(t, 0.2, 0.5))} />
      <Row y={150} label="Raft" value="term" valueColor={C.cherryText} o={easeOut(seg(t, 0.4, 0.75))} />
    </Svg>
  );
}

export function RevealLockIsHint({ t }: StepCtx) {
  return (
    <Svg label="a lock coordinates well-behaved clients but cannot force a paused one to stay quiet; Chubby's lock-delay is an imperfect fallback for resources that cannot check a token" h={200}>
      <Row y={70} label="a lock" value="a hint, not a guarantee" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="lock-delay" value="imperfect fallback" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function Recap({ t }: StepCtx) {
  return (
    <Svg label="a lease buys a local read at the price of a clock-drift bound; no client-side check beats a long pause; a resource-enforced fencing token does, under four production names" h={260}>
      <Row y={50} label="lease" value="local read, clock bound" o={easeOut(seg(t, 0, 0.3))} />
      <Row y={100} label="client-side check" value="can't beat a long pause" valueColor={C.cherryText} o={easeOut(seg(t, 0.2, 0.5))} />
      <Row y={150} label="fencing token" value="enforced by the resource" valueColor={C.focus} o={easeOut(seg(t, 0.4, 0.75))} />
    </Svg>
  );
}

export function ProveIt({ t }: StepCtx) {
  return (
    <Svg label="a lock service switches to a unique random token instead of an increasing counter — does uniqueness alone fix the zombie-leader problem?" h={200}>
      <Row y={70} label="random, unique token" value="distinct, not ordered" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="storage" value="can't tell old from new" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}
