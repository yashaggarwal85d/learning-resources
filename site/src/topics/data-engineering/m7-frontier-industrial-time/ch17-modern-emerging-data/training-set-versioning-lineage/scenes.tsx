import { C, Svg, T, Draw, Reticle, Decode } from '../../../../../reels/kit';
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
  const queryX = [120, 260, 400];
  return (
    <Svg label="a dataset reported six months ago, and the query that can no longer rebuild it." h={220}>
      <line x1={60} y1={70} x2={560} y2={70} stroke={C.line} strokeWidth={1.5} />
      <circle cx={queryX[0]} cy={70} r={5} fill={C.focus} opacity={easeOut(seg(t, 0.1, 0.3))} />
      <T x={queryX[0]} y={50} s={12} f={C.taupe} a="middle" o={easeOut(seg(t, 0.1, 0.3))}>
        query, six months ago
      </T>
      <circle cx={queryX[2]} cy={70} r={5} fill={C.cherry} opacity={easeOut(seg(t, 0.4, 0.6))} />
      <T x={queryX[2]} y={50} s={12} f={C.cherryText} a="middle" o={easeOut(seg(t, 0.4, 0.6))}>
        same query, today
      </T>
      <T x={300} y={130} s={13} f={C.taupe} a="middle">
        same SQL, a different answer
      </T>
      <T x={300} y={150} s={13} f={C.taupe} a="middle">
        the tables underneath kept moving
      </T>
    </Svg>
  );
}

export function PredictWhichToolFits({ t }: StepCtx) {
  return (
    <Svg label="a whole derived lake dataset, or a file next to a training script — which tool fits which?" h={220}>
      <Row y={60} label="a whole derived lake dataset" value="?" valueColor={C.focus} o={easeOut(seg(t, 0, 0.3))} />
      <Row y={105} label="a file next to the training script" value="?" valueColor={C.focus} o={easeOut(seg(t, 0.15, 0.45))} />
    </Svg>
  );
}

export function RevealMovingVsPinned({ t }: StepCtx) {
  const n = easeOut(seg(t, 0.2, 0.8));
  return (
    <Svg label="the current table keeps moving. A snapshot or tag is a named, immutable reference." h={220}>
      <T x={25} y={40} s={13} f={C.latte}>
        "the current table"
      </T>
      <Draw pts={[[25, 60], [260, 60]]} t={t} from={0.1} to={0.5} stroke={C.mocha} w={2} dash="4 4" />
      <circle cx={25 + 235 * n} cy={60} r={5} fill={C.cherryText} />
      <T x={25} y={110} s={13} f={C.latte}>
        a pinned snapshot / tag
      </T>
      <rect x={25} y={125} width={10} height={10} fill={C.focus} opacity={easeOut(seg(t, 0.5, 0.7))} />
      <T x={45} y={134} s={12} f={C.taupe}>
        stays exactly where it was named
      </T>
    </Svg>
  );
}

export function RevealLakefsBranches({ t }: StepCtx) {
  return (
    <Svg label="a branch is a pointer to a commit, not a copy. A tag names one commit." h={240}>
      <circle cx={100} cy={60} r={6} fill={C.focus} opacity={easeOut(seg(t, 0.1, 0.3))} />
      <T x={100} y={85} s={11} f={C.taupe} a="middle" o={easeOut(seg(t, 0.1, 0.3))}>
        commit
      </T>
      <Draw pts={[[106, 60], [220, 60]]} t={t} from={0.3} to={0.55} stroke={C.focus} w={1.5} dash="3 3" />
      <rect x={225} y={48} width={110} height={24} rx={4} fill={C.panel} stroke={C.line} opacity={easeOut(seg(t, 0.5, 0.65))} />
      <T x={280} y={64} s={11} f={C.crema} a="middle" o={easeOut(seg(t, 0.5, 0.65))}>
        branch (a pointer)
      </T>
      <circle cx={100} cy={140} r={6} fill={C.second} opacity={easeOut(seg(t, 0.7, 0.9))} />
      <T x={100} y={165} s={11} f={C.taupe} a="middle" o={easeOut(seg(t, 0.7, 0.9))}>
        tag: named commit
      </T>
    </Svg>
  );
}

export function RevealDvcPins({ t }: StepCtx) {
  return (
    <Svg label="DVC pins by content hash — identical bytes, identical hash, regardless of name." h={240}>
      <rect x={30} y={40} width={150} height={32} rx={4} fill={C.panel} stroke={C.line} />
      <T x={105} y={60} s={11} f={C.crema} a="middle">
        file "a.csv"
      </T>
      <rect x={30} y={90} width={150} height={32} rx={4} fill={C.panel} stroke={C.line} opacity={easeOut(seg(t, 0.2, 0.4))} />
      <T x={105} y={110} s={11} f={C.crema} a="middle" o={easeOut(seg(t, 0.2, 0.4))}>
        file "b.csv" (same bytes)
      </T>
      <Draw pts={[[180, 56], [420, 56]]} t={t} from={0.1} to={0.4} stroke={C.focus} w={1.5} />
      <Draw pts={[[180, 106], [420, 106]]} t={t} from={0.3} to={0.55} stroke={C.focus} w={1.5} />
      <rect x={425} y={65} width={130} height={32} rx={4} fill={C.focus} opacity={easeOut(seg(t, 0.55, 0.75))} />
      <T x={490} y={85} s={11} f={C.cocoa} a="middle" o={easeOut(seg(t, 0.55, 0.75))}>
        one cache entry
      </T>
      <T x={300} y={150} s={12} f={C.taupe} a="middle" w={500}>
        identity is the hash of the contents, not the file's name or path
      </T>
    </Svg>
  );
}

export function RevealDecisionByScale({ t }: StepCtx) {
  return (
    <Svg label="a whole derived lake dataset: a lakeFS branch. A file beside the training script: a DVC pin." h={220}>
      <Row y={60} label="a whole derived lake dataset" value="lakeFS branch" valueColor={C.focus} o={easeOut(seg(t, 0, 0.35))} />
      <Row y={105} label="a file beside the training script" value="DVC content pin" valueColor={C.focus} o={easeOut(seg(t, 0.2, 0.55))} />
      <T x={300} y={145} s={12} f={C.taupe} a="middle" o={easeOut(seg(t, 0.55, 0.8))}>
        the choice follows the artifact's scale,
      </T>
      <T x={300} y={163} s={12} f={C.taupe} a="middle" o={easeOut(seg(t, 0.55, 0.8))}>
        not a preference between the tools
      </T>
    </Svg>
  );
}

export function RevealExperimentTracker({ t }: StepCtx) {
  const boxes = [
    { x: 40, label: 'dataset digest' },
    { x: 230, label: 'code commit' },
    { x: 420, label: 'model run' },
  ];
  return (
    <Svg label="an experiment tracker links a dataset digest, a code commit and a model run; models become searchable by which dataset trained them." h={220}>
      {boxes.map((b, i) => (
        <g key={b.x}>
          <rect x={b.x} y={50} width={140} height={32} rx={4} fill={C.panel} stroke={C.line} opacity={easeOut(seg(t, 0.1 + i * 0.15, 0.3 + i * 0.15))} />
          <T x={b.x + 70} y={70} s={11} f={C.crema} a="middle" o={easeOut(seg(t, 0.1 + i * 0.15, 0.3 + i * 0.15))}>
            {b.label}
          </T>
        </g>
      ))}
      <Draw pts={[[180, 66], [230, 66]]} t={t} from={0.35} to={0.5} stroke={C.focus} w={1.5} />
      <Draw pts={[[370, 66], [420, 66]]} t={t} from={0.5} to={0.65} stroke={C.focus} w={1.5} />
      <T x={300} y={130} s={12} f={C.taupe} a="middle" w={520} o={easeOut(seg(t, 0.7, 0.9))}>
        one tracked model, searchable by the exact dataset that trained it
      </T>
    </Svg>
  );
}

export function RevealLabelVersionDrift({ t }: StepCtx) {
  return (
    <Svg label="the same feature snapshot, two label definitions, different labels for the same rows." h={220}>
      <T x={25} y={40} s={13} f={C.latte}>
        feature snapshot (unchanged)
      </T>
      <rect x={25} y={55} width={300} height={24} rx={4} fill={C.panel} stroke={C.line} />
      <T x={175} y={72} s={11} f={C.crema} a="middle">
        same rows, same values
      </T>
      <Row y={120} label="label: churn within 30 days" value="churned: yes" valueColor={C.focus} o={easeOut(seg(t, 0.2, 0.5))} />
      <Row y={155} label="label: churn within 45 days" value="churned: no" valueColor={C.cherryText} o={easeOut(seg(t, 0.4, 0.7))} />
    </Svg>
  );
}

export function Recap({ t }: StepCtx) {
  return (
    <Svg label="query a snapshot, not the current table. Pick the pin by scale. Link dataset, code and model. Watch the label's own version." h={270}>
      <g opacity={easeOut(seg(t, 0, 0.3))}>
        <T x={25} y={36} s={14} f={C.latte}>reproducibility</T>
        <T x={25} y={62} s={15} f={C.crema}>a snapshot, not the current table</T>
      </g>
      <g opacity={easeOut(seg(t, 0.15, 0.45))}>
        <T x={25} y={96} s={14} f={C.latte}>which tool</T>
        <T x={25} y={122} s={15} f={C.crema}>picked by scale</T>
      </g>
      <g opacity={easeOut(seg(t, 0.3, 0.6))}>
        <T x={25} y={156} s={14} f={C.latte}>lineage</T>
        <T x={25} y={182} s={15} f={C.crema}>dataset, code and model, linked</T>
      </g>
      <g opacity={easeOut(seg(t, 0.45, 0.75))}>
        <T x={25} y={216} s={14} f={C.latte}>a changed label</T>
        <T x={25} y={242} s={15} f={C.crema}>not the same training set</T>
      </g>
    </Svg>
  );
}

export function ProveIt({ t }: StepCtx) {
  return (
    <Svg label="re-running the same SQL every quarter against the live tables — the same dataset?" h={220}>
      <T x={25} y={40} s={14} f={C.latte}>
        re-run this exact SQL query every quarter
      </T>
      <rect x={25} y={55} width={400} height={28} rx={4} fill={C.panel} stroke={C.line} />
      <T x={225} y={74} s={12} f={C.crema} a="middle">
        SELECT ... FROM live_orders WHERE ...
      </T>
      <Reticle x={25} y={55} w={400} h={28} t={t} at={0.6} color={C.cherryText} />
      <T x={300} y={130} s={13} f={C.taupe} a="middle" w={560}>
        no snapshot, no tag — is "the same query" the same dataset?
      </T>
    </Svg>
  );
}
