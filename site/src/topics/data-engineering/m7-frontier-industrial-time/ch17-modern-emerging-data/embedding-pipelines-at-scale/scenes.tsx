import { C, Svg, T, Draw } from '../../../../../reels/kit';
import { easeOut, seg } from '../../../../../reels/anim';
import type { StepCtx } from '../../../../../reels/types';

function Row({ y, label, value, valueColor = C.crema, o = 1 }: { y: number; label: string; value: string; valueColor?: string; o?: number }) {
  return (
    <g opacity={o}>
      <T x={25} y={y} s={14} f={C.latte}>
        {label}
      </T>
      <T x={575} y={y} s={16} f={valueColor} a="end">
        {value}
      </T>
    </g>
  );
}

export function Hook({ t }: StepCtx) {
  return (
    <Svg label="every night, the whole ticket corpus gets re-embedded again, closed tickets included." h={220}>
      <T x={25} y={40} s={13} f={C.latte}>
        tokens re-embedded, night over night
      </T>
      <Draw pts={[[25, 60], [560, 40]]} t={t} from={0.1} to={0.6} stroke={C.cherryText} w={1.5} />
      <T x={25} y={110} s={13} f={C.latte}>
        tickets that actually changed that night
      </T>
      <Draw pts={[[25, 160], [560, 158]]} t={t} from={0.3} to={0.8} stroke={C.focus} w={1.5} />
      <T x={300} y={200} s={13} f={C.taupe} a="middle">
        the bill climbs with the corpus. Most of it never changed.
      </T>
    </Svg>
  );
}

export function PredictBillCut({ t }: StepCtx) {
  return (
    <Svg label="what single change cuts the bill the most, without touching correctness?" h={220}>
      <Row y={70} label="re-embed everything, every night" value="expensive" valueColor={C.cherryText} o={easeOut(seg(t, 0, 0.3))} />
      <Row y={115} label="re-embed only what changed" value="?" valueColor={C.focus} o={easeOut(seg(t, 0.15, 0.45))} />
    </Svg>
  );
}

export function RevealContentHashing({ t }: StepCtx) {
  const chunks = [0, 1, 2, 3, 4, 5, 6];
  const changed = 3;
  return (
    <Svg label="hash each chunk; compare to the hash stored at last embedding." h={220}>
      {chunks.map((i) => (
        <g key={i} opacity={easeOut(seg(t, 0.05 + i * 0.08, 0.3 + i * 0.08))}>
          <rect x={30 + i * 78} y={50} width={60} height={60} rx={6} fill={i === changed ? C.cherryText : C.cocoa} opacity={0.85} />
          <circle cx={30 + i * 78 + 50} cy={60} r={6} fill={i === changed ? C.focus : C.taupe} />
        </g>
      ))}
      <T x={300} y={140} s={12} f={C.taupe} a="middle" o={easeOut(seg(t, 0.6, 0.9))}>
        one edited chunk relights one tag.
      </T>
      <T x={300} y={162} s={12} f={C.taupe} a="middle" o={easeOut(seg(t, 0.6, 0.9))}>
        The rest stay exactly as they were.
      </T>
    </Svg>
  );
}

export function RevealThroughputAndCost({ t }: StepCtx) {
  return (
    <Svg label="a published benchmark's own method, reproduced small: fixed sequence length, fixed batch size, a stated hardware rate." h={220}>
      <Row y={55} label="published benchmark (H100, their rate)" value="their scale" valueColor={C.taupe} o={easeOut(seg(t, 0, 0.3))} />
      <Row y={95} label="this build machine, same formula" value="smaller scale" valueColor={C.focus} o={easeOut(seg(t, 0.15, 0.45))} />
      <T x={300} y={150} s={12} f={C.taupe} a="middle" o={easeOut(seg(t, 0.5, 0.8))}>
        same method, honestly disclosed as a different scale
      </T>
    </Svg>
  );
}

export function RevealApiBoundCase({ t }: StepCtx) {
  return (
    <Svg label="the identical backlog: compute-bound on a GPU, rate-limit-bound through an API tier." h={220}>
      <T x={25} y={40} s={13} f={C.latte}>
        on a GPU: bound by compute
      </T>
      <rect x={25} y={55} width={120} height={20} rx={4} fill={C.focus} opacity={0.85} />
      <T x={25} y={115} s={13} f={C.latte}>
        through an API: bound by its own rate limit
      </T>
      <rect x={25} y={130} width={520} height={20} rx={4} fill={C.cherryText} opacity={0.85} />
      <T x={300} y={175} s={12} f={C.taupe} a="middle">
        a different ceiling, not a slower version of the same one
      </T>
    </Svg>
  );
}

export function RevealDeleteTombstone({ t }: StepCtx) {
  return (
    <Svg label="deleting the document must tombstone its vector, or the deleted record stays findable." h={220}>
      <Row y={55} label="search, before the delete" value="finds it" valueColor={C.focus} o={easeOut(seg(t, 0, 0.3))} />
      <Row y={95} label="search, after the delete" value="does not" valueColor={C.cherryText} o={easeOut(seg(t, 0.25, 0.6))} />
      <T x={300} y={150} s={12} f={C.taupe} a="middle" o={easeOut(seg(t, 0.55, 0.85))}>
        correctness, not a cleanup chore
      </T>
    </Svg>
  );
}

export function RevealWhyNotInPlaceSwap({ t }: StepCtx) {
  return (
    <Svg label="two different models' vectors for the identical chunk are not comparable." h={230}>
      <T x={25} y={40} s={13} f={C.latte}>
        old model's vector for one chunk
      </T>
      <circle cx={100} cy={70} r={10} fill={C.focus} />
      <T x={25} y={110} s={13} f={C.latte}>
        new model's vector, same chunk
      </T>
      <circle cx={100} cy={140} r={10} fill={C.cherryText} />
      <T x={300} y={200} s={12} f={C.taupe} a="middle">
        no shared coordinate space to compare them in
      </T>
    </Svg>
  );
}

export function RevealDualIndexBackfill({ t }: StepCtx) {
  return (
    <Svg label="the old index keeps serving while the new index is built in full; then a cut-over." h={220}>
      <T x={25} y={40} s={13} f={C.latte}>
        old index
      </T>
      <rect x={25} y={55} width={250} height={28} rx={4} fill={C.focus} opacity={0.85} />
      <T x={150} y={74} s={12} f={C.cocoa} a="middle">
        serving every query
      </T>
      <T x={325} y={40} s={13} f={C.latte}>
        new index
      </T>
      <rect x={325} y={55} width={220} height={28} rx={4} fill={C.taupe} opacity={0.6} />
      <T x={435} y={74} s={12} f={C.cocoa} a="middle">
        building, not yet serving
      </T>
      <Draw pts={[[150, 100], [435, 140]]} t={t} from={0.5} to={0.95} stroke={C.cherryText} w={1.5} />
      <T x={300} y={175} s={12} f={C.taupe} a="middle">
        cut-over happens only once the new index is complete
      </T>
    </Svg>
  );
}

export function Recap({ t }: StepCtx) {
  return (
    <Svg label="hash to skip unchanged chunks. Tombstone what's deleted. Never swap models in place." h={270}>
      <g opacity={easeOut(seg(t, 0, 0.3))}>
        <T x={25} y={36} s={14} f={C.latte}>a benchmark's method</T>
        <T x={25} y={62} s={15} f={C.crema}>read for its method, not its headline number</T>
      </g>
      <g opacity={easeOut(seg(t, 0.15, 0.45))}>
        <T x={25} y={96} s={14} f={C.latte}>content hashing</T>
        <T x={25} y={122} s={15} f={C.crema}>skip every chunk whose content didn't change</T>
      </g>
      <g opacity={easeOut(seg(t, 0.3, 0.6))}>
        <T x={25} y={156} s={14} f={C.latte}>deletes and tombstones</T>
        <T x={25} y={182} s={15} f={C.crema}>a removed document must stop being findable</T>
      </g>
      <g opacity={easeOut(seg(t, 0.45, 0.75))}>
        <T x={25} y={216} s={14} f={C.latte}>a model change</T>
        <T x={25} y={242} s={15} f={C.crema}>a dual index and a cut-over, never an in-place swap</T>
      </g>
    </Svg>
  );
}

export function ProveIt({ t }: StepCtx) {
  return (
    <Svg label="a team moves from an API embedding service to a local GPU." h={220}>
      <Row y={55} label="the rate-limit ceiling" value="gone" valueColor={C.focus} o={easeOut(seg(t, 0, 0.3))} />
      <Row y={95} label="hashing, tombstones, dual index" value="unchanged" valueColor={C.crema} o={easeOut(seg(t, 0.15, 0.45))} />
      <T x={300} y={140} s={12} f={C.taupe} a="middle" o={easeOut(seg(t, 0.5, 0.8))}>
        which of this topic's techniques actually
      </T>
      <T x={300} y={162} s={12} f={C.taupe} a="middle" o={easeOut(seg(t, 0.5, 0.8))}>
        depend on which ceiling binds?
      </T>
    </Svg>
  );
}
