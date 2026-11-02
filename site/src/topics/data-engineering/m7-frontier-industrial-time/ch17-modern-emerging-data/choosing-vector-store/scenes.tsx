import { C, Svg, T } from '../../../../../reels/kit';
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
    <Svg label="one team: ten thousand tickets, Postgres already. The other: two billion images, a thousand tenants." h={230}>
      <T x={25} y={40} s={13} f={C.latte}>
        team one
      </T>
      <T x={25} y={65} s={13} f={C.crema}>
        ten thousand tickets, a Postgres database already
      </T>
      <T x={25} y={120} s={13} f={C.latte}>
        team two
      </T>
      <T x={25} y={145} s={13} f={C.crema}>
        two billion images, a thousand isolated tenants
      </T>
      <T x={300} y={200} s={12} f={C.taupe} a="middle">
        naming the "best" database for both is the wrong question
      </T>
    </Svg>
  );
}

export function PredictOneBest({ t }: StepCtx) {
  return (
    <Svg label="is there one best vector database for both teams?" h={200}>
      <Row y={70} label="team one's answer" value="?" valueColor={C.focus} o={easeOut(seg(t, 0, 0.3))} />
      <Row y={115} label="team two's answer" value="?" valueColor={C.cherryText} o={easeOut(seg(t, 0.15, 0.45))} />
    </Svg>
  );
}

export function RevealSixAxes({ t }: StepCtx) {
  const axes = ['corpus size', 'filter complexity', 'update rate', 'tenancy', 'latency SLO', 'operational ownership'];
  return (
    <Svg label="six axes, criteria to walk through, not a score to add up." h={230}>
      {axes.map((a, i) => (
        <g key={a} opacity={easeOut(seg(t, 0.05 + i * 0.12, 0.3 + i * 0.12))}>
          <circle cx={40} cy={40 + i * 30} r={4} fill={C.focus} />
          <T x={55} y={45 + i * 30} s={13} f={C.crema}>
            {a}
          </T>
        </g>
      ))}
    </Svg>
  );
}

export function RevealPgvector({ t }: StepCtx) {
  return (
    <Svg label="a Postgres extension: no new system to operate. pgvectorscale closes the scale gap." h={230}>
      <g opacity={easeOut(seg(t, 0, 0.3))}>
        <T x={25} y={40} s={14} f={C.latte}>pgvector</T>
        <T x={25} y={66} s={15} f={C.focus}>inside Postgres, nothing new to operate</T>
      </g>
      <g opacity={easeOut(seg(t, 0.2, 0.5))}>
        <T x={25} y={110} s={14} f={C.latte}>pgvectorscale's disk-backed index</T>
        <T x={25} y={136} s={15} f={C.crema}>closes the scale gap when memory runs out</T>
      </g>
      <T x={300} y={195} s={12} f={C.taupe} a="middle" o={easeOut(seg(t, 0.55, 0.85))}>
        a team already on Postgres adds nothing new
      </T>
    </Svg>
  );
}

export function RevealDedicatedEngines({ t }: StepCtx) {
  const engines = [
    ['Milvus', 'the largest, sharded deployments'],
    ['Qdrant', 'strong filtering, simple self-hosting'],
    ['Weaviate', 'hybrid search, first-class'],
    ['Pinecone', 'managed, the bill replaces ops time'],
  ];
  return (
    <Svg label="four engines, four different trade-offs — not four scores on one chart." h={230}>
      {engines.map(([name, desc], i) => (
        <g key={name} opacity={easeOut(seg(t, 0.05 + i * 0.15, 0.3 + i * 0.15))}>
          <T x={25} y={40 + i * 42} s={14} f={C.latte}>{name}</T>
          <T x={25} y={62 + i * 42} s={13} f={C.crema}>{desc}</T>
        </g>
      ))}
    </Svg>
  );
}

export function RevealSearchAndLakehouse({ t }: StepCtx) {
  return (
    <Svg label="a search engine with vectors added; a lakehouse-native format with no separate database at all." h={210}>
      <g opacity={easeOut(seg(t, 0, 0.3))}>
        <T x={25} y={40} s={14} f={C.latte}>a text-search engine, vectors added</T>
        <T x={25} y={66} s={15} f={C.focus}>fits a hybrid-first need</T>
      </g>
      <g opacity={easeOut(seg(t, 0.2, 0.5))}>
        <T x={25} y={110} s={14} f={C.latte}>lakehouse-native vectors</T>
        <T x={25} y={136} s={15} f={C.taupe}>no new database, but slower queries</T>
      </g>
    </Svg>
  );
}

export function RevealShopWalkthrough({ t }: StepCtx) {
  return (
    <Svg label="the shop's own corpus, walked through all six axes, lands on pgvector." h={220}>
      <Row y={55} label="size, tenancy, latency SLO" value="all comfortable" valueColor={C.focus} o={easeOut(seg(t, 0, 0.3))} />
      <Row y={95} label="operational ownership" value="keep it in-house" valueColor={C.focus} o={easeOut(seg(t, 0.15, 0.45))} />
      <T x={300} y={150} s={12} f={C.taupe} a="middle" o={easeOut(seg(t, 0.55, 0.85))}>
        pgvector, because of the shop's own numbers
      </T>
    </Svg>
  );
}

export function RevealDifferentCorpus({ t }: StepCtx) {
  return (
    <Svg label="the identical six axes, walked for a billion-vector, high-update, multi-tenant corpus instead." h={220}>
      <Row y={55} label="size, update rate, tenancy" value="all demanding" valueColor={C.cherryText} o={easeOut(seg(t, 0, 0.3))} />
      <Row y={95} label="same six axes, same procedure" value="different answer" valueColor={C.crema} o={easeOut(seg(t, 0.15, 0.45))} />
      <T x={300} y={150} s={12} f={C.taupe} a="middle" o={easeOut(seg(t, 0.55, 0.85))}>
        a sharded, multi-tenant dedicated engine this time
      </T>
    </Svg>
  );
}

export function Recap({ t }: StepCtx) {
  return (
    <Svg label="six axes. Four engines, four trade-offs. The same procedure, two honest answers." h={270}>
      <g opacity={easeOut(seg(t, 0, 0.3))}>
        <T x={25} y={36} s={14} f={C.latte}>six axes</T>
        <T x={25} y={62} s={15} f={C.crema}>criteria to walk, never a score to add up</T>
      </g>
      <g opacity={easeOut(seg(t, 0.15, 0.45))}>
        <T x={25} y={96} s={14} f={C.latte}>pgvector</T>
        <T x={25} y={122} s={15} f={C.crema}>no new system, for a team already on Postgres</T>
      </g>
      <g opacity={easeOut(seg(t, 0.3, 0.6))}>
        <T x={25} y={156} s={14} f={C.latte}>a dedicated engine</T>
        <T x={25} y={182} s={15} f={C.crema}>chosen for its own trade-off, not a benchmark win</T>
      </g>
      <g opacity={easeOut(seg(t, 0.45, 0.75))}>
        <T x={25} y={216} s={14} f={C.latte}>the same procedure</T>
        <T x={25} y={242} s={15} f={C.crema}>two different corpora, two different honest answers</T>
      </g>
    </Svg>
  );
}

export function ProveIt({ t }: StepCtx) {
  return (
    <Svg label="a vendor publishes a benchmark: their engine beats every competitor, at every scale." h={220}>
      <Row y={55} label="the number itself" value="maybe real" valueColor={C.focus} o={easeOut(seg(t, 0, 0.3))} />
      <Row y={95} label="that it transfers to your corpus" value="not shown" valueColor={C.cherryText} o={easeOut(seg(t, 0.15, 0.45))} />
      <T x={300} y={140} s={12} f={C.taupe} a="middle" o={easeOut(seg(t, 0.5, 0.8))}>
        what exactly should and shouldn't be
      </T>
      <T x={300} y={162} s={12} f={C.taupe} a="middle" o={easeOut(seg(t, 0.5, 0.8))}>
        trusted about that number?
      </T>
    </Svg>
  );
}
