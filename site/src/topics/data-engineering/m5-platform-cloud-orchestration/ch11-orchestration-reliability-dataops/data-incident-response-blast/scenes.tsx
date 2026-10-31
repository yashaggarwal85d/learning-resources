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
    <Svg label="duplicate rows landed. nobody knew what else was touched." h={200}>
      <Row y={70} label="revenue table" value="duplicate rows, days" o={easeOut(seg(t, 0, 0.6))} />
      <Row y={130} label="first move" value="guessing what's affected" valueColor={C.focus} o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function RevealLoop({ t }: StepCtx) {
  return (
    <Svg label="detect. triage. contain. repair. postmortem." h={260}>
      <Row y={40} label="detect, triage" value="first two stages" o={easeOut(seg(t, 0, 0.25))} />
      <Row y={85} label="contain, repair" value="next two stages" o={easeOut(seg(t, 0.12, 0.37))} />
      <Row y={130} label="postmortem" value="the fifth stage" valueColor={C.focus} o={easeOut(seg(t, 0.3, 0.6))} />
    </Svg>
  );
}

export function PredictBlastRadius({ t }: StepCtx) {
  return (
    <Svg label="is notifying everyone downstream the safe default?" h={200}>
      <Row y={70} label="candidate: notify all" value="feels safe" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="the real answer" value="not yet revealed" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealBlastRadius({ t }: StepCtx) {
  return (
    <Svg label="computed from declared edges, not guessed." h={200}>
      <Row y={70} label="guessed blast radius" value="over- or under-notifies" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="computed blast radius" value="exact, from the graph" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function PredictContain({ t }: StepCtx) {
  return (
    <Svg label="does containing mean deleting the bad data?" h={200}>
      <Row y={70} label="candidate: delete now" value="removes the evidence" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="the real answer" value="not yet revealed" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealContainRepair({ t }: StepCtx) {
  return (
    <Svg label="quarantine the few. backfill only those." h={200}>
      <Row y={70} label="contain" value="quarantine, don't delete" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="repair" value="targeted backfill only" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealRoles({ t }: StepCtx) {
  return (
    <Svg label="commander. ops. communication. nobody drives twice." h={260}>
      <Row y={40} label="commander" value="holds overall state" o={easeOut(seg(t, 0, 0.25))} />
      <Row y={85} label="ops lead" value="only one touching it" o={easeOut(seg(t, 0.12, 0.37))} />
      <Row y={130} label="communication" value="speaks for the team" valueColor={C.focus} o={easeOut(seg(t, 0.3, 0.6))} />
    </Svg>
  );
}

export function Recap({ t }: StepCtx) {
  return (
    <Svg label="five stages. computed blast radius. a system, not a person, gets fixed." h={260}>
      <Row y={40} label="five stages" value="detect through postmortem" o={easeOut(seg(t, 0, 0.25))} />
      <Row y={85} label="blast radius" value="computed, not guessed" o={easeOut(seg(t, 0.12, 0.37))} />
      <Row y={130} label="postmortem fixes" value="the system" valueColor={C.focus} o={easeOut(seg(t, 0.3, 0.6))} />
    </Svg>
  );
}

export function ProveIt({ t }: StepCtx) {
  return (
    <Svg label="forty downstream dashboards. how many actually affected?" h={200}>
      <Row y={70} label="downstream dashboards" value="a real asset graph" o={easeOut(seg(t, 0, 0.4))} />
      <Row y={130} label="truly affected" value="not yet revealed" valueColor={C.focus} o={easeOut(seg(t, 0.25, 0.65))} />
    </Svg>
  );
}
