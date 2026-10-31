import { C, Svg, T } from '../../../../../reels/kit';
import { easeOut, seg } from '../../../../../reels/anim';
import type { StepCtx } from '../../../../../reels/types';

/** A label-left / value-right row, stacked vertically with generous gaps (DESIGN.md, phone text scaling). */
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
    <Svg label="an input offset and several output partitions, all needing to succeed or fail as one unit" h={200}>
      <Row y={70} label="input offset" value="read" o={easeOut(seg(t, 0, 0.6))} />
      <Row y={130} label="output writes" value="must match" valueColor={C.focus} o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function Setup({ t }: StepCtx) {
  return (
    <Svg label="a stable id across restarts, and a dedicated coordinator tracking every transaction's state" h={200}>
      <Row y={70} label="transactional id" value="stable identity" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="coordinator" value="tracks every state" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function PredictZombie({}: StepCtx) {
  return (
    <Svg label="a producer restarts under the same transactional id while an old instance is still writing" h={200}>
      <Row y={70} label="new instance" value="starts up" />
      <Row y={130} label="old instance" value="still mid-write" valueColor={C.focus} />
    </Svg>
  );
}

export function RevealZombie({ t }: StepCtx) {
  return (
    <Svg label="the restart bumps the epoch — a write still under the old one is fenced off" h={200}>
      <Row y={70} label="new instance" value="accepted" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="old instance" value="fenced off" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function PredictVisibility({}: StepCtx) {
  return (
    <Svg label="an aborted transaction's records are still sitting right there in the log — does a reader see them?" h={200}>
      <Row y={70} label="aborted records" value="still present" />
      <Row y={130} label="a normal reader" value="sees them?" valueColor={C.focus} />
    </Svg>
  );
}

export function RevealVisibility({ t }: StepCtx) {
  return (
    <Svg label="read_uncommitted sees everything; read_committed filters by outcome, up to the last stable offset" h={200}>
      <Row y={70} label="read, uncommitted" value="sees it all" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="read, committed" value="filtered out" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealConsumeTransformProduce({ t }: StepCtx) {
  return (
    <Svg label="committing the input offset inside the same transaction as the output writes" h={200}>
      <Row y={70} label="input offset commit" value="same transaction" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="output writes" value="same transaction" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealNewerKips({ t }: StepCtx) {
  return (
    <Svg label="a server-side defense against a stuck transaction, and a door opening to an external coordinator" h={200}>
      <Row y={70} label="hung transaction" value="server defended" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="external system" value="can join in" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function ProveIt({ t }: StepCtx) {
  return (
    <Svg label="this topic's own real run, every number read straight off it" h={260}>
      <Row y={50} label="zombie write" value="fenced off" o={easeOut(seg(t, 0, 0.3))} />
      <Row y={95} label="read, committed" value="aborted hidden" o={easeOut(seg(t, 0.1, 0.4))} />
      <Row y={140} label="read, uncommitted" value="aborted visible" valueColor={C.focus} o={easeOut(seg(t, 0.25, 0.6))} />
    </Svg>
  );
}

export function Recap({ t }: StepCtx) {
  return (
    <Svg label="a stable id, a coordinator, a visibility rule, and offsets committed inside the write itself" h={260}>
      <Row y={50} label="transactional id" value="survives a restart" o={easeOut(seg(t, 0, 0.3))} />
      <Row y={95} label="read, committed" value="filters by outcome" o={easeOut(seg(t, 0.1, 0.4))} />
      <Row y={140} label="offsets and output" value="one unit" valueColor={C.focus} o={easeOut(seg(t, 0.25, 0.6))} />
    </Svg>
  );
}
