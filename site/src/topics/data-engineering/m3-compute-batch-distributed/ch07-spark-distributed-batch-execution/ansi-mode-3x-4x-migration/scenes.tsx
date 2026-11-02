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
    <Svg label="every example run so far in this chapter ran with ANSI mode already on." h={200}>
      <Row y={70} label="every example" value="ANSI already on" o={easeOut(seg(t, 0, 0.6))} />
      <Row y={130} label="this topic" value="what changed" valueColor={C.focus} o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function RevealFlipsDefault({ t }: StepCtx) {
  return (
    <Svg label="ANSI mode flips the default answer to a bad value: error, not NULL." h={200}>
      <Row y={70} label="overflow, bad cast" value="returned NULL" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="ANSI mode" value="raises an error" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function PredictOverflow({ t }: StepCtx) {
  return (
    <Svg label="an int overflow, ANSI mode on. Raises an error, or wraps to negative?" h={200}>
      <Row y={70} label="int overflow" value="ANSI mode on" />
      <Row y={130} label="error, or wraps?" value="not yet revealed" valueColor={C.focus} />
    </Svg>
  );
}

export function RevealOverflowErrors({ t }: StepCtx) {
  return (
    <Svg label="measured: raises an error under ANSI. Off, it wraps to a negative number." h={200}>
      <Row y={70} label="ANSI on" value="raises an error" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="ANSI off" value="wraps to negative" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function ElaborateStoreAssignment({ t }: StepCtx) {
  return (
    <Svg label="store assignment is its own separate knob from the operator itself." h={200}>
      <Row y={70} label="casting on insert" value="its own rule" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="storeAssignmentPolicy" value="separate setting" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function PredictCast({ t }: StepCtx) {
  return (
    <Svg label="casting the letter 'a' to INT, ANSI mode on. Raises an error, or returns NULL?" h={200}>
      <Row y={70} label="cast 'a'" value="ANSI mode on" />
      <Row y={130} label="error, or NULL?" value="not yet revealed" valueColor={C.focus} />
    </Svg>
  );
}

export function RevealCastErrors({ t }: StepCtx) {
  return (
    <Svg label="measured: raises an error under ANSI. Off, the same cast returns NULL." h={200}>
      <Row y={70} label="ANSI on" value="raises an error" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="ANSI off" value="returns NULL" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function ElaborateTryFunctions({ t }: StepCtx) {
  return (
    <Svg label="try_cast and try_add bring NULL-on-error back, one expression at a time." h={200}>
      <Row y={70} label="try_cast, try_add" value="NULL on error" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="everything else" value="still raises" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealMigrationMethod({ t }: StepCtx) {
  return (
    <Svg label="porting an older job: run both modes, diff the output, audit every cast the diff finds." h={260}>
      <Row y={60} label="run the suite" value="both modes" o={easeOut(seg(t, 0, 0.4))} />
      <Row y={120} label="diff the output" value="finds the changes" valueColor={C.focus} o={easeOut(seg(t, 0.25, 0.7))} />
      <Row y={180} label="each diff" value="audit the cast" valueColor={C.focus} o={easeOut(seg(t, 0.5, 1))} />
    </Svg>
  );
}

export function Recap({ t }: StepCtx) {
  return (
    <Svg label="one setting, flipped: a bad value now raises, unless you ask it not to." h={280}>
      <Row y={50} label="ANSI mode" value="error, not NULL" o={easeOut(seg(t, 0, 0.3))} />
      <Row y={100} label="try_* functions" value="NULL, on purpose" o={easeOut(seg(t, 0.15, 0.45))} />
      <Row y={150} label="migrating a job" value="diff, then audit" valueColor={C.focus} o={easeOut(seg(t, 0.4, 0.75))} />
    </Svg>
  );
}
