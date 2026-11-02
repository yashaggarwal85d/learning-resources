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
    <Svg label="renamed in one deploy. dashboards went blank." h={200}>
      <Row y={70} label="column renamed" value="one deploy" o={easeOut(seg(t, 0, 0.6))} />
      <Row y={130} label="consumers" value="never migrated" valueColor={C.focus} o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function PredictSingleDeploy({ t }: StepCtx) {
  return (
    <Svg label="can timing alone make a single-deploy rename safe?" h={200}>
      <Row y={70} label="quiet-hour deploy" value="feels safer" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="actually safe?" value="not yet revealed" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealPhases({ t }: StepCtx) {
  return (
    <Svg label="expand. migrate. contract." h={260}>
      <Row y={40} label="expand" value="add, don't remove" o={easeOut(seg(t, 0, 0.25))} />
      <Row y={85} label="migrate" value="one consumer each" o={easeOut(seg(t, 0.12, 0.37))} />
      <Row y={130} label="contract" value="remove the old" valueColor={C.focus} o={easeOut(seg(t, 0.3, 0.6))} />
    </Svg>
  );
}

export function RevealCompatibilityModes({ t }: StepCtx) {
  return (
    <Svg label="backward. forward. full." h={200}>
      <Row y={70} label="backward" value="new reads old" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="forward" value="old reads new" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function PredictEarlyContract({ t }: StepCtx) {
  return (
    <Svg label="is contracting right after expand just as safe?" h={200}>
      <Row y={70} label="expand" value="passed, compatible" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="contract now?" value="not yet revealed" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealPrematureContract({ t }: StepCtx) {
  return (
    <Svg label="one consumer still unmigrated. contract runs anyway." h={200}>
      <Row y={70} label="laggard consumer" value="still reads old" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="contract removes it" value="a real error" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealDualWrite({ t }: StepCtx) {
  return (
    <Svg label="both fields, written at once -- for a measured window." h={200}>
      <Row y={70} label="producer" value="writes both fields" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="the window" value="measured, bounded" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function Recap({ t }: StepCtx) {
  return (
    <Svg label="three phases. one rule. one bounded window." h={260}>
      <Row y={40} label="three phases" value="expand, migrate, contract" o={easeOut(seg(t, 0, 0.25))} />
      <Row y={85} label="one rule" value="backward and forward" o={easeOut(seg(t, 0.12, 0.37))} />
      <Row y={130} label="dual-write" value="a bounded window" valueColor={C.focus} o={easeOut(seg(t, 0.3, 0.6))} />
    </Svg>
  );
}

export function ProveIt({ t }: StepCtx) {
  return (
    <Svg label="one consumer, deliberately left behind. what happens?" h={200}>
      <Row y={70} label="orders.amount" value="renamed for real" o={easeOut(seg(t, 0, 0.4))} />
      <Row y={130} label="the laggard" value="not yet revealed" valueColor={C.focus} o={easeOut(seg(t, 0.25, 0.65))} />
    </Svg>
  );
}
