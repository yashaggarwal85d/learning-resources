import { C, Draw, Svg, T } from '../../../../../reels/kit';
import { easeOut, seg } from '../../../../../reels/anim';
import type { StepCtx } from '../../../../../reels/types';

/** A label-left / value-right row, stacked vertically (DESIGN.md, phone text scaling): each
 * side kept to a few words so neither side wraps or overlaps at phone width. */
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

/** The chapter's recurring figure: one lane per process, time left to right, a message as an
 * arrow between lanes (CHAPTER.md, "One visual language for the chapter's reels"). */
function Lane({ y, name }: { y: number; name: string }) {
  return (
    <g>
      <T x={25} y={y - 10} s={13} f={C.taupe}>
        {name}
      </T>
      <line x1={20} y1={y} x2={580} y2={y} stroke={C.mocha} strokeWidth={1.5} />
    </g>
  );
}

export function Hook({ t }: StepCtx) {
  return (
    <Svg label="a primary-backup register passes every test and still loses an acknowledged write in production — which untested assumption is the real cause?" h={230}>
      <Lane y={60} name="primary" />
      <Lane y={170} name="backup" />
      <Draw pts={[[60, 60], [200, 60]]} t={t} from={0} to={0.3} stroke={C.focus} w={2.5} pen={false} />
      <Draw pts={[[200, 60], [200, 170]]} t={t} from={0.3} to={0.6} stroke={C.latte} w={2} dash="5 4" pen={false} />
      <Draw pts={[[200, 170], [340, 60]]} t={t} from={0.6} to={0.9} dash="5 4" stroke={C.latte} w={2} pen={false} />
      <T x={210} y={50} s={13} f={C.crema} o={easeOut(seg(t, 0.9, 1.1))}>
        acknowledged
      </T>
      <T x={25} y={210} s={15} f={C.cherryText} o={easeOut(seg(t, 1.3, 1.8))}>
        which assumption broke?
      </T>
    </Svg>
  );
}

export function PredictMessageLoss({ t }: StepCtx) {
  return (
    <Svg label="the backup never hears about one write at all, but the client was already told it's acknowledged — does that single fault already lose the write for good?" h={200}>
      <Row y={70} label="told: acknowledged" value="one message, dropped" />
      <Row y={130} label="the write" value="safe, or already gone?" valueColor={C.focus} />
    </Svg>
  );
}

export function RevealTimingModels({ t }: StepCtx) {
  return (
    <Svg label="between a known delay cap and no cap at all, partial synchrony comes in two different shapes — a hidden cap, or a cap that only starts holding after an undetectable moment" h={260}>
      <Row y={50} label="synchronous" value="a known delay cap" o={easeOut(seg(t, 0, 0.4))} />
      <Row y={100} label="partially sync" value="a hidden cap" o={easeOut(seg(t, 0.25, 0.65))} />
      <Row y={150} label="partially sync" value="a cap, after a moment" valueColor={C.focus} o={easeOut(seg(t, 0.5, 0.9))} />
      <Row y={200} label="asynchronous" value="no cap at all" o={easeOut(seg(t, 0.75, 1.15))} />
    </Svg>
  );
}

export function RevealFaultHierarchy({ t }: StepCtx) {
  return (
    <Svg label="crash-stop, crash-recovery, omission and Byzantine each contain the ones before them — a lying witness costs a protocol strictly more spare machines to outvote than a silent one" h={260}>
      <Row y={50} label="crash-stop" value="halts, stays down" o={easeOut(seg(t, 0, 0.35))} />
      <Row y={100} label="crash-recovery" value="halts, then returns" o={easeOut(seg(t, 0.2, 0.55))} />
      <Row y={150} label="omission" value="drops some messages" o={easeOut(seg(t, 0.4, 0.75))} />
      <Row y={200} label="byzantine" value="can lie outright" valueColor={C.cherryText} o={easeOut(seg(t, 0.6, 1))} />
    </Svg>
  );
}

export function RevealLinkModels({ t }: StepCtx) {
  return (
    <Svg label="a fair-loss link only promises an endlessly retried message eventually gets through once — a reliable link's stronger promise is built on top of it, by retrying and deduplicating, not granted by the wire" h={200}>
      <Row y={70} label="fair-loss link" value="retried, eventually through" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="reliable link" value="built on top, not given" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealLabResults({ t }: StepCtx) {
  return (
    <Svg label="the identical two-line protocol, run three times in the chapter's own simulator — dropped, reordered, or crash-recovered, it loses an acknowledged write for a different reason each time" h={260}>
      <Row y={50} label="message dropped" value="first write: gone" valueColor={C.cherryText} o={easeOut(seg(t, 0, 0.4))} />
      <Row y={100} label="messages reordered" value="second write: stale" valueColor={C.cherryText} o={easeOut(seg(t, 0.25, 0.65))} />
      <Row y={150} label="crash, then recovery" value="second write: unflushed" valueColor={C.cherryText} o={easeOut(seg(t, 0.5, 0.9))} />
      <Row y={200} label="nothing injected" value="holds, every time" o={easeOut(seg(t, 0.75, 1.15))} />
    </Svg>
  );
}

export function Recap({ t }: StepCtx) {
  return (
    <Svg label="a model is a contract, not a guess; a lying witness is a different problem than a silent one; a reliable link is built, not given; and one protocol broke three separate ways under three separate real-shaped faults" h={260}>
      <Row y={50} label="a model" value="a contract, not a guess" o={easeOut(seg(t, 0, 0.3))} />
      <Row y={100} label="byzantine" value="different, not worse" o={easeOut(seg(t, 0.2, 0.5))} />
      <Row y={150} label="a reliable link" value="built, never given" valueColor={C.focus} o={easeOut(seg(t, 0.4, 0.7))} />
      <Row y={200} label="one protocol" value="broke three separate ways" o={easeOut(seg(t, 0.6, 0.95))} />
    </Svg>
  );
}

export function ProveIt({ t }: StepCtx) {
  return (
    <Svg label="a dashboard reports zero dropped messages and zero crashes all week — does that prove the replication protocol's safety promise held the whole time?" h={220}>
      <Row y={55} label="dashboard" value="zero drops, zero crashes" o={easeOut(seg(t, 0, 0.4))} />
      <Row y={110} label="looks clean" value="feels like proof" valueColor={C.focus} o={easeOut(seg(t, 0.25, 0.65))} />
      <Row y={165} label="two faults" value="invisible, either way" valueColor={C.cherryText} o={easeOut(seg(t, 0.55, 1))} />
    </Svg>
  );
}
