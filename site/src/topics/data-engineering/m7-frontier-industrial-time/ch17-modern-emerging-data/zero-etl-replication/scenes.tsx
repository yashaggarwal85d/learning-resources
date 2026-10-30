import { C, Svg, T } from '../../../../../reels/kit';
import { easeOut, seg } from '../../../../../reels/anim';
import type { StepCtx } from '../../../../../reels/types';

export function Hook({ t }: StepCtx) {
  return (
    <Svg label='a vendor slide says "zero ETL." A fraud-detection team starts missing fraud for up to half an hour at a time.' h={200}>
      <T x={25} y={45} s={16} f={C.focus}>
        "zero ETL"
      </T>
      <T x={25} y={75} s={14} f={C.taupe}>
        the vendor's own slide
      </T>
      <T x={25} y={130} s={14} f={C.latte}>
        sub-minute fraud requirement
      </T>
      <T x={25} y={155} s={16} f={C.cherryText}>
        fraud missed for up to half an hour
      </T>
    </Svg>
  );
}

export function PredictWhatZeroMeant({ t }: StepCtx) {
  return (
    <Svg label="what did 'zero' actually mean, and what number was always the real limit?" h={180}>
      <T x={300} y={70} s={14} f={C.latte} a="middle" o={easeOut(seg(t, 0, 0.3))}>
        what "zero" actually meant
      </T>
      <T x={300} y={110} s={16} f={C.focus} a="middle" o={easeOut(seg(t, 0.2, 0.5))}>
        ?
      </T>
    </Svg>
  );
}

export function RevealManagedCDC({ t }: StepCtx) {
  const sources = ['Aurora MySQL / PostgreSQL', 'DynamoDB', 'RDS for MySQL / Oracle / PostgreSQL'];
  return (
    <Svg label="managed CDC from operational databases straight into an analytics engine, by name." h={240}>
      {sources.map((s, i) => (
        <g key={s} opacity={easeOut(seg(t, 0.05 + i * 0.15, 0.3 + i * 0.15))}>
          <circle cx={40} cy={45 + i * 40} r={4} fill={C.focus} />
          <T x={55} y={50 + i * 40} s={14} f={C.crema}>
            {s}
          </T>
        </g>
      ))}
      <T x={25} y={195} s={13} f={C.taupe}>
        into Redshift, or Fabric mirroring into OneLake
      </T>
    </Svg>
  );
}

export function RevealDynamoDBCadence({ t }: StepCtx) {
  return (
    <Svg label="an initial full export, then incremental replication on a fixed, documented window." h={220}>
      <T x={25} y={40} s={14} f={C.latte}>
        on activation
      </T>
      <T x={25} y={65} s={15} f={C.crema}>
        exports the full table once
      </T>
      <T x={25} y={115} s={14} f={C.latte}>
        after that
      </T>
      <T x={25} y={140} s={15} f={C.focus}>
        incremental replication, fifteen to thirty minutes
      </T>
      <T x={25} y={190} s={13} f={C.taupe}>
        requires point-in-time recovery enabled
      </T>
    </Svg>
  );
}

export function RevealWhatZeroHides({ t }: StepCtx) {
  return (
    <Svg label="the same log-based CDC this course already built, now running inside a vendor's managed boundary." h={180}>
      <T x={300} y={60} s={14} f={C.latte} a="middle" o={easeOut(seg(t, 0, 0.4))}>
        not a new mechanism
      </T>
      <T x={300} y={100} s={15} f={C.focus} a="middle" o={easeOut(seg(t, 0.3, 0.7))}>
        the pipeline code you used to operate
      </T>
      <T x={300} y={130} s={15} f={C.cherryText} a="middle" o={easeOut(seg(t, 0.5, 0.85))}>
        that's what's actually gone
      </T>
    </Svg>
  );
}

export function RevealReproducingTheShape({ t }: StepCtx) {
  return (
    <Svg label="the same shape, reproduced for real on this sandbox's own Postgres." h={280}>
      <T x={25} y={40} s={14} f={C.latte}>
        prerequisite checked
      </T>
      <T x={25} y={65} s={15} f={C.crema}>
        continuous WAL retention,
      </T>
      <T x={25} y={88} s={15} f={C.crema}>
        like point-in-time recovery
      </T>
      <T x={25} y={138} s={14} f={C.latte}>
        full export, then a cursor
      </T>
      <T x={25} y={161} s={15} f={C.focus}>
        a replication slot drained on a fixed cycle
      </T>
      <T x={25} y={211} s={13} f={C.taupe}>
        a write inside the window stays invisible
      </T>
      <T x={25} y={231} s={13} f={C.taupe}>
        until the next pulse
      </T>
    </Svg>
  );
}

export function RevealThreeCosts({ t }: StepCtx) {
  const costs = [
    ['schema changes', 'on the vendor’s schedule, not your migration plan'],
    ['filtering', 'limited to what the integration exposes'],
    ['cost', 'a vendor’s billing unit, not a tunable pipeline'],
  ];
  return (
    <Svg label="three things a team gives up along with the pipeline code." h={260}>
      {costs.map(([name, desc], i) => (
        <g key={name} opacity={easeOut(seg(t, 0.05 + i * 0.2, 0.3 + i * 0.2))}>
          <T x={25} y={45 + i * 70} s={14} f={C.latte}>
            {name}
          </T>
          <T x={25} y={70 + i * 70} s={14} f={C.crema}>
            {desc}
          </T>
        </g>
      ))}
    </Svg>
  );
}

export function Recap({ t }: StepCtx) {
  return (
    <Svg label="zero-ETL is managed log-based CDC. The code is gone; the mechanism and its limits are not." h={300}>
      <g opacity={easeOut(seg(t, 0, 0.3))}>
        <T x={25} y={36} s={14} f={C.latte}>what "zero" means</T>
        <T x={25} y={62} s={15} f={C.crema}>zero pipeline code, not zero latency</T>
      </g>
      <g opacity={easeOut(seg(t, 0.15, 0.45))}>
        <T x={25} y={96} s={14} f={C.latte}>the mechanism</T>
        <T x={25} y={122} s={15} f={C.crema}>the same log-based CDC, managed</T>
      </g>
      <g opacity={easeOut(seg(t, 0.3, 0.6))}>
        <T x={25} y={156} s={14} f={C.latte}>the real limit</T>
        <T x={25} y={182} s={15} f={C.crema}>the vendor's documented window</T>
      </g>
      <g opacity={easeOut(seg(t, 0.45, 0.75))}>
        <T x={25} y={216} s={14} f={C.latte}>what's given up</T>
        <T x={25} y={242} s={15} f={C.crema}>schema timing, filtering, vendor billing</T>
      </g>
    </Svg>
  );
}

export function ProveIt({ t }: StepCtx) {
  return (
    <Svg label="a twenty-minute requirement, a fifteen-to-thirty-minute documented window." h={200}>
      <T x={25} y={50} s={13} f={C.latte} o={easeOut(seg(t, 0, 0.3))}>
        requirement
      </T>
      <T x={25} y={75} s={15} f={C.focus} o={easeOut(seg(t, 0, 0.3))}>
        twenty minutes
      </T>
      <T x={25} y={130} s={13} f={C.latte} o={easeOut(seg(t, 0.2, 0.5))}>
        can the documented window meet it
      </T>
      <T x={25} y={155} s={15} f={C.cherryText} o={easeOut(seg(t, 0.2, 0.5))}>
        ?
      </T>
    </Svg>
  );
}
