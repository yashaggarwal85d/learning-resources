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
    <Svg label="a coordinator collects two prepare votes, logs commit, then crashes before announcing it; both participants voted yes and hold locks for an hour" h={200}>
      <Row y={70} label="coordinator logs commit" value="then crashes" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="both shards voted yes" value="locks held an hour" valueColor={C.cherryText} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function PredictWait({ t }: StepCtx) {
  return (
    <Svg label="a prepared shard has waited an hour with no word from the coordinator — abort, commit, or wait?" h={200}>
      <Row y={70} label="prepared shard, no word" value="an hour of silence" />
      <Row y={130} label="abort, commit, or wait?" value="which is safe?" valueColor={C.focus} />
    </Svg>
  );
}

export function RevealPrepare({ t }: StepCtx) {
  return (
    <Svg label="prepare asks every participant to durably promise it can commit; once every vote is yes, the coordinator durably logs the decision and only then announces it" h={200}>
      <Row y={70} label="prepare vote" value="a durable promise" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="all yes" value="decision logged, then told" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealInDoubt({ t }: StepCtx) {
  return (
    <Svg label="a participant that voted yes is in doubt; it holds its locks until the announcement arrives, which is the lock-hold time" h={200}>
      <Row y={70} label="voted yes" value="in doubt: commit or abort?" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="locks held" value="until the announcement" valueColor={C.cherryText} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealThreePc({ t }: StepCtx) {
  return (
    <Svg label="3PC's pre-commit phase assumes a timeout means a crash, which fails under partition: two separate groups can each finish, differently" h={260}>
      <Row y={50} label="3PC pre-commit" value="finishes without coordinator" o={easeOut(seg(t, 0, 0.3))} />
      <Row y={100} label="needs timeout = crash" value="only if unpartitioned" valueColor={C.focus} o={easeOut(seg(t, 0.2, 0.5))} />
      <Row y={150} label="under partition" value="two groups, two outcomes" valueColor={C.cherryText} o={easeOut(seg(t, 0.4, 0.75))} />
    </Svg>
  );
}

export function RevealPaxosCommit({ t }: StepCtx) {
  return (
    <Svg label="Paxos Commit runs consensus on each prepare vote, surviving the loss of a minority of coordinators; classic 2PC is its own zero-fault special case" h={200}>
      <Row y={70} label="consensus per vote" value="survives a minority loss" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="classic 2PC" value="the zero-fault special case" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealProduction({ t }: StepCtx) {
  return (
    <Svg label="a transaction manager's state lives inside its own replicated consensus group; running every participant's round at once instead of in sequence cuts commit latency" h={200}>
      <Row y={70} label="tx manager state" value="inside its Paxos group" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="rounds run in parallel" value="latency cut a lot" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealSagas({ t }: StepCtx) {
  return (
    <Svg label="a saga breaks a transaction into steps with compensating actions, and the outbox commits an event alongside the write for later delivery — both give up atomicity" h={200}>
      <Row y={70} label="saga" value="steps, compensating actions" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="outbox" value="event committed, delivered later" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function ProveIt({ t }: StepCtx) {
  return (
    <Svg label="a team replicates the coordinator's decision and calls the blocking problem solved for good — what does that fix, and what can still go wrong?" h={200}>
      <Row y={70} label="decision replicated" value="fixes one-machine loss" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="still possible" value="own crash, lost message" valueColor={C.cherryText} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function Recap({ t }: StepCtx) {
  return (
    <Svg label="a yes vote cannot be taken back, so a crashed coordinator leaves participants blocked; 3PC needs a partition-free network; Paxos Commit replicates the decision, with 2PC as its own special case" h={260}>
      <Row y={50} label="yes vote" value="cannot be taken back" o={easeOut(seg(t, 0, 0.3))} />
      <Row y={100} label="3PC" value="needs a partition-free network" valueColor={C.focus} o={easeOut(seg(t, 0.2, 0.5))} />
      <Row y={150} label="Paxos Commit" value="replicates the one decision" valueColor={C.cherryText} o={easeOut(seg(t, 0.4, 0.75))} />
    </Svg>
  );
}
