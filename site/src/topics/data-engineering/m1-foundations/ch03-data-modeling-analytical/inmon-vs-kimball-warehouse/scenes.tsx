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
    <Svg label="one model built first. one bus, built incrementally." h={200}>
      <Row y={70} label="Inmon" value="normalized model, built first" />
      <Row y={130} label="Kimball" value="bus of stars, built incrementally" />
    </Svg>
  );
}

export function RevealInmonDefinition({ t }: StepCtx) {
  return (
    <Svg label="top-down: the model first, marts fed from it" h={200}>
      <Row y={70} label="Inmon's own definition" value="the warehouse itself" o={easeOut(seg(t, 0, 0.6))} />
      <Row y={130} label="his direction" value="top-down" valueColor={C.focus} o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function RevealKimballBus({ t }: StepCtx) {
  return (
    <Svg label="bottom-up: process by process, conformed dimensions reused" h={200}>
      <Row y={70} label="Kimball's own bus" value="incremental, by process" o={easeOut(seg(t, 0, 0.6))} />
      <Row y={130} label="his direction" value="bottom-up" valueColor={C.second} o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function PredictDeadline({ t }: StepCtx) {
  return (
    <Svg label="urgent deadline, one source system" h={200}>
      <Row y={70} label="urgent deadline" value="one source system" />
      <Row y={130} label="fastest to value" value="?" />
    </Svg>
  );
}

export function RevealTimeToValue({ t }: StepCtx) {
  return (
    <Svg label="one star schema, live, while the model is still mid-design" h={200}>
      <Row y={70} label="Kimball's bus" value="one star schema, live" o={easeOut(seg(t, 0, 0.6))} />
      <Row y={130} label="Inmon's model" value="still mid-design" valueColor={C.cherryText} o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function PredictIntegration({ t }: StepCtx) {
  return (
    <Svg label="a dozen sources, one shared definition of customer" h={200}>
      <Row y={70} label="a dozen sources" value="one shared customer" />
      <Row y={130} label="handles it better" value="?" />
    </Svg>
  );
}

export function RevealIntegrationCost({ t }: StepCtx) {
  return (
    <Svg label="one model, one definition, settled once" h={200}>
      <Row y={70} label="Inmon's model" value="one definition, settled once" o={easeOut(seg(t, 0, 0.6))} />
      <Row y={130} label="mart by mart" value="settled again, every time" valueColor={C.cherryText} o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function PredictChangeTolerance({ t }: StepCtx) {
  return (
    <Svg label="a business rule that keeps changing" h={200}>
      <Row y={70} label="a rule keeps changing" value="which takes it better?" />
      <Row y={130} label="one, cleanly" value="?" />
    </Svg>
  );
}

export function RevealChangeContested({ t }: StepCtx) {
  return (
    <Svg label="a new process vs. a changed rule — different wins" h={200}>
      <Row y={70} label="new process" value="the bus absorbs it" o={easeOut(seg(t, 0, 0.6))} />
      <Row y={130} label="changed rule" value="the model absorbs it" valueColor={C.second} o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function RevealThreeAxes({ t }: StepCtx) {
  const rows: [string, string][] = [
    ['time to value', 'the bus wins'],
    ['integration cost', 'the model wins'],
    ['tolerance to change', 'contested, by kind'],
  ];
  return (
    <Svg label="three axes, three different verdicts" h={240}>
      {rows.map(([label, value], i) => (
        <Row key={label} y={60 + i * 65} label={label} value={value} o={easeOut(seg(t, i * 0.25, i * 0.25 + 0.6))} />
      ))}
    </Svg>
  );
}

export function RevealELTShift({ t }: StepCtx) {
  return (
    <Svg label="storage cheaper, compute faster, transform after load" h={200}>
      <Row y={70} label="cloud warehouses" value="storage cheap, compute fast" o={easeOut(seg(t, 0, 0.6))} />
      <Row y={130} label="transform now happens" value="after load, not before" valueColor={C.focus} o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function RevealGapNarrowed({ t }: StepCtx) {
  return (
    <Svg label="start incremental, fold in integration later" h={200}>
      <Row y={70} label="start with" value="Kimball's incremental marts" o={easeOut(seg(t, 0, 0.6))} />
      <Row y={130} label="fold in later" value="Inmon-style integration" valueColor={C.second} o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function Recap({ t }: StepCtx) {
  return (
    <Svg label="top-down vs. bottom-up; three axes; narrowed, not erased" h={240}>
      <Row y={55} label="Inmon vs. Kimball" value="top-down vs. bottom-up" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={115} label="the real choice" value="three axes, not one verdict" o={easeOut(seg(t, 0.2, 0.7))} />
      <Row y={175} label="ELT's effect" value="narrowed, not erased" o={easeOut(seg(t, 0.4, 0.9))} />
    </Svg>
  );
}

export function ProveBusChoice({ t }: StepCtx) {
  return (
    <Svg label="a new source every cycle, no agreed model yet" h={200}>
      <Row y={70} label="a new source, often" value="no model agreed yet" />
      <Row y={130} label="the better fit is" value="?" />
    </Svg>
  );
}
