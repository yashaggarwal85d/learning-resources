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
    <Svg label="a plant's night shift reads above full output on the last Sunday of March; the shift calendar assumes a fixed length and the clocks went forward that night" h={200}>
      <Row y={70} label="night shift" value="above full output" valueColor={C.badText} o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="the clocks" value="went forward" o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealThreeClocks({ t }: StepCtx) {
  return (
    <Svg label="a reading's device, gateway and ingest timestamps, each landing later than the last — device closest to the truth, ingest steady but late" h={220}>
      <Row y={55} label="device" value="closest to truth" o={easeOut(seg(t, 0, 0.4))} />
      <Row y={110} label="gateway" value="the plant's clock" valueColor={C.second} o={easeOut(seg(t, 0.25, 0.65))} />
      <Row y={170} label="ingest" value="steady, but late" valueColor={C.focus} o={easeOut(seg(t, 0.55, 1))} />
    </Svg>
  );
}

export function PredictStep({ t }: StepCtx) {
  return (
    <Svg label="a sensor's clock is corrected backwards between two readings taken seconds apart — does the second reading's device timestamp still come after the first's?" h={200}>
      <Row y={70} label="clock steps back" value="still in order?" />
      <Row y={130} label="or not?" value="which clock breaks?" valueColor={C.focus} />
    </Svg>
  );
}

export function RevealStepMeasured({ t }: StepCtx) {
  return (
    <Svg label="after an NTP correction lands between two readings taken a second apart, the second's device timestamp comes before the first's, while gateway and ingest still increase" h={200}>
      <Row y={70} label="device clock" value="goes backwards" valueColor={C.badText} o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="gateway, ingest" value="stay in order" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealUtcLocal({ t }: StepCtx) {
  return (
    <Svg label="one instant stored once in UTC with its zone kept separately, rendered back into the plant's own local time and offset on demand" h={200}>
      <Row y={70} label="stored" value="once, in UTC" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="rendered" value="local, on demand" valueColor={C.second} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealGeneratedCalendar({ t }: StepCtx) {
  return (
    <Svg label="a shift calendar generated from the tz database for a given zone and date, giving an ordinary night one length and the two clock-change nights a shorter and a longer one" h={220}>
      <Row y={55} label="ordinary night" value="one length" o={easeOut(seg(t, 0, 0.4))} />
      <Row y={110} label="spring forward" value="runs short" valueColor={C.badText} o={easeOut(seg(t, 0.25, 0.65))} />
      <Row y={170} label="fall back" value="runs long" valueColor={C.second} o={easeOut(seg(t, 0.55, 1))} />
    </Svg>
  );
}

export function RevealSameBug({ t }: StepCtx) {
  return (
    <Svg label="dividing the real output by a hard-coded shift length, on the night the shift actually ran short, gives a result above full output — the shift-boundary bug again, caused by a clock change" h={200}>
      <Row y={70} label="fixed length" value="assumed, wrong" valueColor={C.badText} o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="the result" value="above full output" valueColor={C.badText} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function RevealEventTime({ t }: StepCtx) {
  return (
    <Svg label="a per-signal rule chooses device clock when disciplined and close enough, otherwise gateway; the chosen source is written down as its own column" h={200}>
      <Row y={70} label="the rule" value="device, or gateway" o={easeOut(seg(t, 0, 0.5))} />
      <Row y={130} label="the choice" value="written down" valueColor={C.focus} o={easeOut(seg(t, 0.3, 1))} />
    </Svg>
  );
}

export function Recap({ t }: StepCtx) {
  return (
    <Svg label="three clocks each good for something different, a backwards step, UTC storage rendered local, a generated calendar, and a recorded event-time decision" h={260}>
      <Row y={50} label="three clocks" value="three jobs" o={easeOut(seg(t, 0, 0.3))} />
      <Row y={95} label="a backwards step" value="breaks one clock" o={easeOut(seg(t, 0.15, 0.45))} />
      <Row y={140} label="UTC, rendered local" value="never the reverse" valueColor={C.focus} o={easeOut(seg(t, 0.35, 0.65))} />
      <Row y={185} label="event time" value="recorded, not guessed" valueColor={C.second} o={easeOut(seg(t, 0.55, 0.85))} />
    </Svg>
  );
}

export function ProveIt({ t }: StepCtx) {
  return (
    <Svg label="a plant reports its night shift ran exactly the same length every day of the year, including both clock-change nights — is that shift table trustworthy?" h={200}>
      <Row y={70} label="same length" value="every single night" o={easeOut(seg(t, 0, 0.4))} />
      <Row y={130} label="even both" value="clock-change nights" valueColor={C.badText} o={easeOut(seg(t, 0.25, 0.65))} />
    </Svg>
  );
}
