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
    <Svg label="a leader writes an entry to itself and one follower, crashes before announcing it, and a server that never received it wins the next election" h={200}>
      <Row y={70} label="leader writes entry" value="self, one follower only" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="leader crashes" value="new leader never saw it" valueColor={C.cherryText} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function PredictCommitted({ t }: StepCtx) {
  return (
    <Svg label="the entry sits on two of five servers when the leader crashes — is it committed, and can the new leader overwrite it?" h={200}>
      <Row y={70} label="two of five hold it" value="committed?" />
      <Row y={130} label="new leader" value="free to overwrite?" valueColor={C.focus} />
    </Svg>
  );
}

export function RevealTerms({ t }: StepCtx) {
  return (
    <Svg label="terms act as a logical clock: a server seeing a higher term steps down, and a request with a stale term is rejected" h={200}>
      <Row y={70} label="higher term seen" value="step down" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="stale term on a request" value="rejected" valueColor={C.cherryText} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealVotingRestriction({ t }: StepCtx) {
  return (
    <Svg label="a voter grants its vote only if the candidate is at least as up to date; later term wins outright, a tie falls back to log length" h={200}>
      <Row y={70} label="candidate's last term higher" value="vote granted" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="same last term" value="longer log wins the vote" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealLogMatching({ t }: StepCtx) {
  return (
    <Svg label="two logs sharing an entry at the same index and term are identical up through it, enforced by AppendEntries's consistency check on every append" h={200}>
      <Row y={70} label="same index, term" value="logs identical before it" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="AppendEntries" value="checks this on every call" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealOldTermUnsafe({ t }: StepCtx) {
  return (
    <Svg label="a term-two entry on a majority can still be erased by a later candidate with a higher last term; only a current-term entry on a majority makes everything before it safe" h={260}>
      <Row y={50} label="old-term entry, majority" value="still erasable" o={easeOut(seg(t, 0, 0.3))} valueColor={C.cherryText} />
      <Row y={100} label="current-term, majority" value="safe, carries earlier" valueColor={C.focus} o={easeOut(seg(t, 0.2, 0.5))} />
      <Row y={150} label="difference" value="whose term it carries" o={easeOut(seg(t, 0.4, 0.75))} />
    </Svg>
  );
}

export function RevealJointConsensus({ t }: StepCtx) {
  return (
    <Svg label="membership changes route through joint consensus, needing overlapping majorities of both the old and new configurations; snapshots let a server discard a log grown too long" h={200}>
      <Row y={70} label="joint consensus" value="majority of old and new both" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="snapshot" value="discards the old log prefix" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function Recap({ t }: StepCtx) {
  return (
    <Svg label="terms reject stale leaders; voting restriction forces leader completeness; log matching forces agreement backward; only current-term entries are safely committed by counting; joint consensus carries this through membership change" h={260}>
      <Row y={50} label="terms, voting rule" value="stale leaders rejected" o={easeOut(seg(t, 0, 0.3))} />
      <Row y={100} label="log matching" value="agreement forced backward" valueColor={C.focus} o={easeOut(seg(t, 0.2, 0.5))} />
      <Row y={150} label="joint consensus" value="carries this through changes" valueColor={C.cherryText} o={easeOut(seg(t, 0.4, 0.75))} />
    </Svg>
  );
}

export function ProveIt({ t }: StepCtx) {
  return (
    <Svg label="a leader's own current-term entry reaches a majority, then it crashes — is the entry committed, and can the next leader erase it?" h={200}>
      <Row y={70} label="current-term, majority" value="committed, instantly" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="next leader" value="must already hold it to win" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}
