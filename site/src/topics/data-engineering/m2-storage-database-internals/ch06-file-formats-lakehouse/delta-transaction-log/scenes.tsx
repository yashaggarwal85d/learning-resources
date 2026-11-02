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
    <Svg label="iceberg's transaction log is a metadata tree. this topic opens the delta arc: an ordered json log." h={200}>
      <TallRow y={40} label="iceberg's mechanism" value="a metadata tree of files" o={easeOut(seg(t, 0, 0.3))} />
      <TallRow y={100} label="delta's mechanism" value="an ordered json log, by hand" valueColor={C.focus} o={easeOut(seg(t, 0.25, 0.65))} />
    </Svg>
  );
}

export function PredictReplayOrLatest({ t }: StepCtx) {
  return (
    <Svg label="five real json commits sit in _delta_log. what do you need to read to know what files are in the table right now?" h={200}>
      <TallRow y={40} label="five real commits" value="in _delta_log" o={easeOut(seg(t, 0, 0.5))} />
      <TallRow y={100} label="to know the files now" value="just the latest, or all of them?" valueColor={C.focus} o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function RevealFiveRealCommits({ t }: StepCtx) {
  return (
    <Svg label="five real commits, written by hand to spec: 00000000000000000000.json through ...0004.json." h={230}>
      <TallRow y={40} label="real, on disk" value="5 commits, newline-delimited json" o={easeOut(seg(t, 0, 0.35))} />
      <TallRow y={100} label="named by version" value="zero-padded to 20 digits" valueColor={C.focus} o={easeOut(seg(t, 0.3, 0.7))} />
    </Svg>
  );
}

export function RevealReconstructedByHand({ t }: StepCtx) {
  return (
    <Svg label="reconstructed by hand, from nothing but the raw log: 4 live files, 9 rows." h={230}>
      <TallRow y={40} label="replayed by hand" value="add / remove / metaData / protocol" o={easeOut(seg(t, 0, 0.35))} />
      <TallRow y={100} label="result" value="4 live files, 9 rows -- verified" valueColor={C.focus} o={easeOut(seg(t, 0.3, 0.7))} />
    </Svg>
  );
}

export function PredictCheckpointShortCircuit({ t }: StepCtx) {
  return (
    <Svg label="a real checkpoint gets written at version 2. to get version 4's state, does a reader still replay version 0?" h={200}>
      <TallRow y={40} label="a checkpoint at v2" value="exists, real, on disk" o={easeOut(seg(t, 0, 0.5))} />
      <TallRow y={100} label="to reach v4" value="still replay from v0?" valueColor={C.focus} o={easeOut(seg(t, 0.4, 1))} />
    </Svg>
  );
}

export function RevealCheckpointMatchesReplay({ t }: StepCtx) {
  return (
    <Svg label="a real parquet checkpoint, verified against an independent from-scratch replay." h={230}>
      <TallRow y={40} label="a real checkpoint" value="written as real parquet, via pyarrow" o={easeOut(seg(t, 0, 0.35))} />
      <TallRow y={100} label="checked against" value="an independent replay -- matches exactly" valueColor={C.focus} o={easeOut(seg(t, 0.3, 0.7))} />
    </Svg>
  );
}

export function RevealShortCircuited({ t }: StepCtx) {
  return (
    <Svg label="short-circuited for real: v2 checkpoint + replaying v3-v4 gives the same answer as replaying from v0." h={230}>
      <TallRow y={40} label="checkpoint + v3, v4" value="same file set as a full replay" o={easeOut(seg(t, 0, 0.35))} />
      <TallRow y={100} label="_last_checkpoint" value="the pointer that finds it, for real" valueColor={C.focus} o={easeOut(seg(t, 0.3, 0.7))} />
    </Svg>
  );
}

export function RevealCompactionAndChecksum({ t }: StepCtx) {
  return (
    <Svg label="a real log compaction file, and a real version checksum, both computed from real state." h={230}>
      <TallRow y={40} label="compaction [3,4]" value="matches reading v3 + v4 directly" o={easeOut(seg(t, 0, 0.35))} />
      <TallRow y={100} label="version checksum" value="computed from real state" valueColor={C.focus} o={easeOut(seg(t, 0.3, 0.7))} />
    </Svg>
  );
}

export function RevealProtocolVsFeatures({ t }: StepCtx) {
  return (
    <Svg label="the same protocol, two vocabularies: numeric versions at v0, named table features after a real upgrade at v3." h={230}>
      <TallRow y={40} label="v0's protocol" value="minReaderVersion, minWriterVersion only" o={easeOut(seg(t, 0, 0.35))} />
      <TallRow y={100} label="v3's protocol, for real" value="named readerFeatures / writerFeatures" valueColor={C.focus} o={easeOut(seg(t, 0.3, 0.7))} />
    </Svg>
  );
}

export function Recap({ t }: StepCtx) {
  return (
    <Svg label="an ordered json log, a reconciled checkpoint on top, and protocol versions giving way to named features." h={300}>
      <TallRow y={35} label="_delta_log" value="an ordered, replayable json log" o={easeOut(seg(t, 0, 0.3))} />
      <TallRow y={100} label="a checkpoint" value="a reconciled snapshot of it" o={easeOut(seg(t, 0.1, 0.4))} />
      <TallRow y={165} label="table features" value="replace a protocol version number" valueColor={C.focus} o={easeOut(seg(t, 0.25, 0.6))} />
      <g opacity={easeOut(seg(t, 0.55, 1))}>
        <T x={25} y={230} s={14} f={C.latte}>
          the rule
        </T>
        <T x={25} y={256} s={16} f={C.focus} w={600}>
          a json log entry is only a commit
        </T>
        <T x={25} y={280} s={16} f={C.focus} w={600}>
          once it's atomic -- next: how, for real
        </T>
      </g>
    </Svg>
  );
}
