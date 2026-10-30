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
    <Svg label='a partition isolates one replica from the other two; a customer on each side buys the same last unit of stock, and both get "order confirmed"' h={200}>
      <Row y={70} label="isolated replica" value="order confirmed" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="majority replicas" value="order confirmed" valueColor={C.cherryText} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function PredictChoice({ t }: StepCtx) {
  return (
    <Svg label="which of CAP's three words did the overselling system keep, which did it give up, and what could it have chosen instead of overselling?" h={200}>
      <Row y={70} label="kept answering" value="through the partition" />
      <Row y={130} label="gave up" value="a single true answer" valueColor={C.focus} />
    </Svg>
  );
}

export function RevealTheorem({ t }: StepCtx) {
  return (
    <Svg label="the theorem in its own three conditions: atomic (linearizable), available (every request to a non-failing node eventually gets a response), partition tolerant (arbitrary message loss) — not all three can hold" h={200}>
      <Row y={70} label="atomic, available" value="both at once" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="under a partition" value="cannot both hold" valueColor={C.cherryText} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealProof({ t }: StepCtx) {
  return (
    <Svg label="splitting the chapter's three replicas into one isolated, two together: the isolated replica's state is identical whether the majority committed a write or nothing happened at all" h={200}>
      <Row y={70} label="majority wrote" value="isolated replica unaware" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="nobody wrote" value="looks identical" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealMisreading({ t }: StepCtx) {
  return (
    <Svg label='"pick two" misreads the theorem: a partition happens or not, it is not chosen; the real choice, consistency versus availability, is made per operation during a partition, not declared once as a system-wide label' h={200}>
      <Row y={70} label="a partition" value="happens, not chosen" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="C vs A" value="chosen per operation" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealPacelc({ t }: StepCtx) {
  return (
    <Svg label="PACELC's else-branch: with no partition, a system still chooses between latency and consistency; Dynamo-family systems are PA/EL, ACID systems PC/EC, PNUTS splits the two as PC/EL" h={260}>
      <Row y={50} label="Dynamo-family" value="PA, EL" o={easeOut(seg(t, 0, 0.3))} />
      <Row y={100} label="fully ACID" value="PC, EC" valueColor={C.cherryText} o={easeOut(seg(t, 0.2, 0.5))} />
      <Row y={150} label="PNUTS" value="PC, EL" valueColor={C.focus} o={easeOut(seg(t, 0.4, 0.75))} />
    </Svg>
  );
}

export function RevealSpanner({ t }: StepCtx) {
  return (
    <Svg label='Spanner is "technically" a CP system, "effectively" treated as CA because partitions are rare on a private network — a statement about probability, not an exception to the theorem' h={200}>
      <Row y={70} label="technically" value="CP system" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="effectively, in practice" value="treated as CA" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function Recap({ t }: StepCtx) {
  return (
    <Svg label="atomic, available, partition tolerant cannot all hold; the proof is one replica unable to distinguish two histories; CP/AP is per-operation; PACELC adds the no-partition trade; Spanner's effectively-CA is probability, not exemption" h={260}>
      <Row y={50} label="CAP" value="not all three hold" o={easeOut(seg(t, 0, 0.3))} />
      <Row y={100} label="CP, AP" value="chosen per operation" valueColor={C.focus} o={easeOut(seg(t, 0.2, 0.5))} />
      <Row y={150} label="PACELC" value="the no-partition trade" valueColor={C.cherryText} o={easeOut(seg(t, 0.4, 0.75))} />
    </Svg>
  );
}

export function ProveIt({ t }: StepCtx) {
  return (
    <Svg label="a system that has run for years without a network partition argues CAP doesn't apply to it — is that right?" h={200}>
      <Row y={70} label="no partition yet" value="just luck, not proof" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="the design" value="still has a choice baked in" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}
