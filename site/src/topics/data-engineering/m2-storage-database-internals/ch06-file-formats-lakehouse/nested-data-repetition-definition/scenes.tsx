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
    <Svg label="3 orders, 1 with 3 items, 1 with none, 1 with 1 — shredded into 2 columns, reassembled exactly." h={200}>
      <TallRow y={40} label="3 orders" value="3 items, 0 items, 1 item" o={easeOut(seg(t, 0, 0.3))} />
      <TallRow y={100} label="shredded into" value="2 flat columns" o={easeOut(seg(t, 0.25, 0.65))} />
      <TallRow y={160} label="reassembled" value="matches exactly" valueColor={C.focus} o={easeOut(seg(t, 0.55, 1))} />
    </Svg>
  );
}

export function PredictSkuOrder({ t }: StepCtx) {
  return (
    <Svg label="order 200 has no items at all. Does its row just vanish from the sku column?" h={200}>
      <TallRow y={40} label="sku column, 3 orders" value="3 items, 0 items, 1 item" o={easeOut(seg(t, 0, 0.5))} />
      <TallRow y={100} label="order with 0 items" value="vanishes, or leaves a row?" valueColor={C.focus} o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function RevealRepetitionLevel({ t }: StepCtx) {
  return (
    <Svg label="a repetition level per value: 0 starts a new record, 1 means the item repeated." h={230}>
      <TallRow y={40} label="sku values" value="A1, A2, A3, NULL, B1" o={easeOut(seg(t, 0, 0.35))} />
      <TallRow y={100} label="repetition levels" value="0, 1, 1, 0, 0" valueColor={C.focus} o={easeOut(seg(t, 0.3, 0.7))} />
    </Svg>
  );
}

export function RevealNullDefLevel({ t }: StepCtx) {
  return (
    <Svg label="order 200's empty item list gets one marker row: definition level 0." h={230}>
      <TallRow y={40} label="order 200, no items" value="one NULL marker row" o={easeOut(seg(t, 0, 0.4))} />
      <TallRow y={100} label="definition level" value="0 — item itself absent" valueColor={C.focus} o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function PredictNoteLevels({ t }: StepCtx) {
  return (
    <Svg label="note can be missing on its own, and so can the whole item. How many definition levels?" h={200}>
      <TallRow y={40} label="note" value="optional, inside item" o={easeOut(seg(t, 0, 0.5))} />
      <TallRow y={100} label="definition levels needed" value="2? 3? how many?" valueColor={C.focus} o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function RevealNoteDefLevels({ t }: StepCtx) {
  return (
    <Svg label="2 means item and note both present, 1 means item present but note missing, 0 means no item." h={230}>
      <TallRow y={40} label="note values" value="gift, NULL, fragile, NULL, urgent" o={easeOut(seg(t, 0, 0.35))} />
      <TallRow y={100} label="definition levels" value="2, 1, 2, 0, 2" valueColor={C.focus} o={easeOut(seg(t, 0.3, 0.7))} />
    </Svg>
  );
}

export function RevealReassembly({ t }: StepCtx) {
  return (
    <Svg label="reassembly walks both streams in lock-step; a repetition level of 0 is the only record boundary." h={230}>
      <TallRow y={40} label="record boundary" value="repetition level 0" o={easeOut(seg(t, 0, 0.4))} />
      <TallRow y={100} label="reassembled" value="3 orders, byte for byte" valueColor={C.focus} o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function RevealArrowOffsets({ t }: StepCtx) {
  return (
    <Svg label="the same 3 records as one offsets buffer plus a validity bitmap, not one shared level stream." h={230}>
      <TallRow y={40} label="arrow offsets" value="0, 3, 3, 4" o={easeOut(seg(t, 0, 0.35))} />
      <TallRow y={100} label="validity bitmap" value="1, 1, 1 — no null lists" valueColor={C.focus} o={easeOut(seg(t, 0.3, 0.7))} />
    </Svg>
  );
}

export function RevealOrcPresent({ t }: StepCtx) {
  return (
    <Svg label="the same structure again: a present stream and a length stream, the same counts as offsets." h={230}>
      <TallRow y={40} label="orc present" value="1, 1, 1" o={easeOut(seg(t, 0, 0.35))} />
      <TallRow y={100} label="orc length" value="3, 0, 1" valueColor={C.focus} o={easeOut(seg(t, 0.3, 0.7))} />
    </Svg>
  );
}

export function Recap({ t }: StepCtx) {
  return (
    <Svg label="levels, offsets, and present/length streams all encode the identical structural fact." h={300}>
      <TallRow y={35} label="dremel" value="one shared level stream per leaf" o={easeOut(seg(t, 0, 0.3))} />
      <TallRow y={100} label="arrow, orc" value="one buffer pair per nesting level" o={easeOut(seg(t, 0.1, 0.4))} />
      <TallRow y={165} label="cost of nesting" value="every record pays per leaf field" valueColor={C.focus} o={easeOut(seg(t, 0.25, 0.6))} />
      <g opacity={easeOut(seg(t, 0.55, 1))}>
        <T x={25} y={230} s={14} f={C.latte}>
          the rule
        </T>
        <T x={25} y={256} s={16} f={C.focus} w={600}>
          structure has to live somewhere —
        </T>
        <T x={25} y={280} s={16} f={C.focus} w={600}>
          three formats, three places to put it
        </T>
      </g>
    </Svg>
  );
}
