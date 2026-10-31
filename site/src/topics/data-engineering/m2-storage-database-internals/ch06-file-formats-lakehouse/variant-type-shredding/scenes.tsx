import { C, Svg, T } from '../../../../../reels/kit';
import { easeOut, seg } from '../../../../../reels/anim';
import type { StepCtx } from '../../../../../reels/types';

function TallRow({ y, label, value, valueColor = C.crema, o = 1 }: { y: number; label: string; value: string; valueColor?: string; o?: number }) {
  return (
    <g opacity={o}>
      <T x={25} y={y} s={14} f={C.latte}>
        {label}
      </T>
      <T x={25} y={y + 26} s={16} f={valueColor} w={600}>
        {value}
      </T>
    </g>
  );
}

export function Hook({ t }: StepCtx) {
  return (
    <Svg label="6 click and scroll events, 4 distinct shapes, one field that changes type." h={200}>
      <TallRow y={40} label="6 events" value="4 distinct shapes" o={easeOut(seg(t, 0, 0.3))} />
      <TallRow y={100} label="button_id" value="int32 in most, a string in one" o={easeOut(seg(t, 0.25, 0.65))} />
      <TallRow y={160} label="one schema" value="can it hold all of it?" valueColor={C.focus} o={easeOut(seg(t, 0.55, 1))} />
    </Svg>
  );
}

export function PredictStruct({ t }: StepCtx) {
  return (
    <Svg label="a fixed struct: event_type string, button_id int32. Can it hold all 6 events?" h={200}>
      <TallRow y={40} label="fixed struct" value="event_type, button_id" o={easeOut(seg(t, 0, 0.5))} />
      <TallRow y={100} label="6 heterogeneous events" value="does every one fit?" valueColor={C.focus} o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function RevealStructLoss({ t }: StepCtx) {
  return (
    <Svg label="forced into the struct, 3 of 6 records lose a field — one of them silently." h={230}>
      <TallRow y={40} label="records forced into struct" value="3 of 6 lose a field" o={easeOut(seg(t, 0, 0.35))} />
      <TallRow y={100} label="scroll event's only field" value="depth_pct — nowhere to go" valueColor={C.focus} o={easeOut(seg(t, 0.3, 0.7))} />
    </Svg>
  );
}

export function RevealVariantRoundTrip({ t }: StepCtx) {
  return (
    <Svg label="a real Variant metadata dictionary and value encoding, round-tripped exactly." h={230}>
      <TallRow y={40} label="Variant binary, 6 records" value="155 bytes" o={easeOut(seg(t, 0, 0.4))} />
      <TallRow y={100} label="decoded back" value="byte-exact, all 6 records" valueColor={C.focus} o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function PredictDecodeCost({ t }: StepCtx) {
  return (
    <Svg label="does filtering on event_type mean decoding the whole binary value, every row?" h={200}>
      <TallRow y={40} label="filter: event_type = 'click'" value="6 Variant values" o={easeOut(seg(t, 0, 0.5))} />
      <TallRow y={100} label="decode the whole value" value="every time, to check?" valueColor={C.focus} o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function RevealShredBreakdown({ t }: StepCtx) {
  return (
    <Svg label="shredding event_type and button_id into typed columns, field by field." h={230}>
      <TallRow y={40} label="fully shredded" value="3 of 6 — nothing left over" o={easeOut(seg(t, 0, 0.35))} />
      <TallRow y={100} label="partial + fallback" value="2 partial, 1 fallback" valueColor={C.focus} o={easeOut(seg(t, 0.3, 0.7))} />
    </Svg>
  );
}

export function RevealTypedColumnOnly({ t }: StepCtx) {
  return (
    <Svg label="event_type is a string in all 6 records, so it's always shredded." h={230}>
      <TallRow y={40} label="click events found" value="5 of 6, via typed column" o={easeOut(seg(t, 0, 0.4))} />
      <TallRow y={100} label="residual value bytes touched" value="0" valueColor={C.focus} o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function RevealMeasuredSize({ t }: StepCtx) {
  return (
    <Svg label="measured size: JSON strings, unshredded Variant, and shredded typed columns." h={230}>
      <TallRow y={40} label="JSON string column" value="250 bytes" o={easeOut(seg(t, 0, 0.3))} />
      <TallRow y={100} label="Variant, unshredded" value="155 bytes" o={easeOut(seg(t, 0.25, 0.6))} />
      <TallRow y={160} label="Variant, shredded" value="126 bytes" valueColor={C.focus} o={easeOut(seg(t, 0.5, 1))} />
    </Svg>
  );
}

export function RevealSynthesis({ t }: StepCtx) {
  return (
    <Svg label="shredding's real win here is pushdown, not raw size — and never at the cost of a dropped field." h={230}>
      <TallRow y={40} label="smaller" value="126 vs 155 bytes — a modest gain" o={easeOut(seg(t, 0, 0.35))} />
      <TallRow y={100} label="the real win" value="0 bytes read for a typed filter" valueColor={C.focus} o={easeOut(seg(t, 0.3, 0.7))} />
    </Svg>
  );
}

export function Recap({ t }: StepCtx) {
  return (
    <Svg label="Variant keeps every record; shredding gets most of a struct's speed back, with no dropped fields." h={300}>
      <TallRow y={35} label="a fixed struct" value="silently drops 3 of 6 records" o={easeOut(seg(t, 0, 0.3))} />
      <TallRow y={100} label="Variant" value="every record, byte-exact" o={easeOut(seg(t, 0.1, 0.4))} />
      <TallRow y={165} label="shredding" value="typed speed, with a residual for the rest" valueColor={C.focus} o={easeOut(seg(t, 0.25, 0.6))} />
      <g opacity={easeOut(seg(t, 0.55, 1))}>
        <T x={25} y={230} s={14} f={C.latte}>
          the rule
        </T>
        <T x={25} y={256} s={16} f={C.focus} w={600}>
          shred what's typed, keep a residual —
        </T>
        <T x={25} y={280} s={16} f={C.focus} w={600}>
          never force a schema that drops data
        </T>
      </g>
    </Svg>
  );
}
