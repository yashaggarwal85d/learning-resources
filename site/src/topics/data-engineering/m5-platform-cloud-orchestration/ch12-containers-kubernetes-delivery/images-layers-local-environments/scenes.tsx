import { C, Svg, T, Reticle } from '../../../../../reels/kit';
import { easeOut, easeInOut, seg } from '../../../../../reels/anim';
import type { StepCtx } from '../../../../../reels/types';

// Every number this topic draws is either this reel's own simulation (examples.py) or a
// verbatim, dated number from Docker's or the Distroless project's own docs (SOURCES.md):
// no Docker daemon is reachable on this build machine, so nothing here is a measured build.

const LAYER_H = 34;
const LAYER_GAP = 6;
const STACK_X = 150;
const STACK_W = 300;
const STACK_TOP = 40;

type LayerDef = { name: string; changed?: boolean };

/** The chapter's layer-stack convention: horizontal slabs, bottom = base image, top = newest. */
function LayerStack({ layers, litUpTo, waveAt, t, highlightIndex }: { layers: LayerDef[]; litUpTo: number; waveAt?: number; t: number; highlightIndex?: number }) {
  const n = layers.length;
  return (
    <g>
      {layers.map((layer, i) => {
        // i = 0 is the base (drawn at the bottom); layers array is given base-first.
        const y = STACK_TOP + (n - 1 - i) * (LAYER_H + LAYER_GAP);
        const waveProgress = waveAt !== undefined ? easeInOut(seg(t, waveAt, waveAt + 0.9)) : 0;
        const waveFront = waveAt !== undefined ? n - 1 - Math.floor(waveProgress * n) : -1;
        const inWave = waveAt !== undefined && i >= waveFront && i <= litUpTo;
        const dark = waveAt !== undefined ? inWave : i > litUpTo;
        const fill = dark ? C.band : i === highlightIndex ? C.second : C.panel;
        return (
          <g key={layer.name}>
            <rect x={STACK_X} y={y} width={STACK_W} height={LAYER_H} rx={3} fill={fill} stroke={C.line} strokeWidth={1} opacity={dark ? 0.55 : 1} />
            <T x={STACK_X + 14} y={y + LAYER_H / 2 + 5} s={14} f={dark ? C.quiet : C.primary}>
              {layer.name}
            </T>
          </g>
        );
      })}
    </g>
  );
}

const SIX_LAYERS: LayerDef[] = [
  { name: 'FROM python:3.13-slim' },
  { name: 'WORKDIR /app' },
  { name: 'COPY requirements.txt .' },
  { name: 'RUN pip install -r requirements.txt' },
  { name: 'COPY . .' },
  { name: 'CMD ["python", "run.py"]' },
];

// 1 · Opening: the shop's image, one changed line, almost the whole stack re-pushed.
export function Opening({ t }: StepCtx) {
  return (
    <Svg label="A six-layer PySpark image; a one-line source change re-pushes most of it" h={360}>
      <LayerStack layers={SIX_LAYERS} litUpTo={1} waveAt={0.6} t={t} />
      <T x={300} y={24} s={15} a="middle" f={C.crema} serif>
        orders_rollup image, naive order
      </T>
      <T x={300} y={330} s={13} a="middle" f={C.quiet}>
        one changed line of application code → four layers re-pushed
      </T>
    </Svg>
  );
}

// 2 · Predict: which layers does a change to layer 4 (index 4, "COPY . .") invalidate?
export function PredictInvalidation({ t }: StepCtx) {
  return (
    <Svg label="A six-layer image; the COPY . . instruction, fourth from the base, changes. Which layers rebuild?" h={360}>
      <LayerStack layers={SIX_LAYERS} litUpTo={-1} t={t} highlightIndex={4} />
      <Reticle x={STACK_X + STACK_W / 2} y={STACK_TOP + (6 - 1 - 4) * (LAYER_H + LAYER_GAP) + LAYER_H / 2} w={STACK_W + 20} h={LAYER_H + 14} t={t} at={0.3} />
      <T x={300} y={24} s={15} a="middle" f={C.crema} serif>
        this instruction changes — which layers rebuild?
      </T>
    </Svg>
  );
}

// 3 · The wave: layer 4 and everything above it rebuilds; below stays cached.
export function CacheWave({ t }: StepCtx) {
  return (
    <Svg label="The rebuild wave plays from the changed layer upward; layers below stay cached" h={360}>
      <LayerStack layers={SIX_LAYERS} litUpTo={5} waveAt={0.3} t={t} />
      <T x={300} y={24} s={15} a="middle" f={C.crema} serif>
        layers 4–6 rebuild; 1–3 are reused from cache
      </T>
    </Svg>
  );
}

const NAIVE_ORDER: LayerDef[] = SIX_LAYERS;
const REORDERED_ORDER: LayerDef[] = [
  { name: 'FROM python:3.13-slim' },
  { name: 'WORKDIR /app' },
  { name: 'COPY requirements.txt .' },
  { name: 'RUN pip install -r requirements.txt' },
  { name: 'COPY . .' },
  { name: 'CMD ["python", "run.py"]' },
];

const NAIVE_SHORT: LayerDef[] = [{ name: 'FROM' }, { name: 'copy source + deps' }, { name: 'pip install' }, { name: 'CMD' }];
const REORDERED_SHORT: LayerDef[] = [{ name: 'FROM' }, { name: 'copy manifest' }, { name: 'pip install' }, { name: 'copy source' }, { name: 'CMD' }];

/** A compact half-width layer stack for side-by-side comparisons, at full text size. */
function HalfStack({ x0, layers, litUpTo, waveAt, t }: { x0: number; layers: LayerDef[]; litUpTo: number; waveAt: number; t: number }) {
  const n = layers.length;
  const w = 230;
  return (
    <g>
      {layers.map((layer, i) => {
        const y = 70 + (n - 1 - i) * (LAYER_H + LAYER_GAP);
        const waveProgress = easeInOut(seg(t, waveAt, waveAt + 0.9));
        const waveFront = n - 1 - Math.floor(waveProgress * n);
        const dark = i >= waveFront && i <= litUpTo;
        return (
          <g key={layer.name}>
            <rect x={x0} y={y} width={w} height={LAYER_H} rx={3} fill={dark ? C.band : C.panel} stroke={C.line} opacity={dark ? 0.55 : 1} />
            <T x={x0 + 12} y={y + LAYER_H / 2 + 5} s={13} f={dark ? C.quiet : C.primary}>
              {layer.name}
            </T>
          </g>
        );
      })}
    </g>
  );
}

// 4 · Build-cache ordering: naive (source+deps together) vs reordered (manifest first).
export function BuildCacheOrdering({ t }: StepCtx) {
  return (
    <Svg label="A naive build re-installs dependencies on every source edit; reordering keeps the install layer cached" h={360}>
      <HalfStack x0={20} layers={NAIVE_SHORT} litUpTo={2} waveAt={0.3} t={t} />
      <HalfStack x0={330} layers={REORDERED_SHORT} litUpTo={3} waveAt={0.7} t={t} />
      <T x={135} y={40} s={14} a="middle" f={C.cherryText} serif>
        naive order
      </T>
      <T x={445} y={40} s={14} a="middle" f={C.focus} serif>
        reordered
      </T>
      <T x={300} y={330} s={13} a="middle" f={C.quiet}>
        same edit: three layers rebuild, then two
      </T>
    </Svg>
  );
}

// 5 · Whiteouts: a deletion in a later layer hides a file, it doesn't shrink the image.
export function Whiteout({ t }: StepCtx) {
  const addK = easeOut(seg(t, 0.4, 0.9));
  return (
    <Svg label="Deleting a file in a later layer adds a whiteout slab; the file's bytes stay in the layer underneath" h={340}>
      <rect x={STACK_X} y={180} width={STACK_W} height={70} rx={3} fill={C.panel} stroke={C.line} />
      <T x={STACK_X + 14} y={220} s={14} f={C.primary}>
        base layer: config.old
      </T>
      <g opacity={addK}>
        <rect x={STACK_X} y={180 - 46 * addK} width={STACK_W} height={30} rx={3} fill={C.second} stroke={C.line} />
        <T x={STACK_X + 14} y={180 - 46 * addK + 20} s={13} f={C.ink} w={700}>
          .wh.config.old — hidden, not removed
        </T>
      </g>
      <T x={300} y={50} s={15} a="middle" f={C.crema} serif>
        rm config.old, a later instruction
      </T>
      <T x={300} y={290} s={13} a="middle" f={C.quiet}>
        hidden from the container,
      </T>
      <T x={300} y={310} s={13} a="middle" f={C.quiet}>
        but still inside the image
      </T>
    </Svg>
  );
}

// 6 · Multi-stage: the build stage's compiler/cache layers fall away at the stage boundary.
export function MultiStage({ t }: StepCtx) {
  const dropK = easeInOut(seg(t, 0.3, 1.0));
  const buildLayers = ['FROM: build', 'pip install', 'copy source', 'compile'];
  return (
    <Svg label="A multi-stage build keeps the runtime stage only; the build stage's layers never ship" h={360}>
      <g>
        {buildLayers.map((name, i) => (
          <g key={name} opacity={1 - dropK} transform={`translate(0 ${dropK * 220})`}>
            <rect x={20} y={70 + i * (LAYER_H + LAYER_GAP)} width={230} height={LAYER_H} rx={3} fill={C.band} stroke={C.line} />
            <T x={34} y={70 + i * (LAYER_H + LAYER_GAP) + LAYER_H / 2 + 5} s={13} f={C.quiet}>
              {name}
            </T>
          </g>
        ))}
        <T x={135} y={48} s={14} a="middle" f={C.cherryText}>
          build stage
        </T>
      </g>
      <g>
        <rect x={330} y={70} width={230} height={LAYER_H} rx={3} fill={C.panel} stroke={C.line} />
        <T x={344} y={70 + LAYER_H / 2 + 5} s={13} f={C.primary}>
          FROM: distroless
        </T>
        <rect x={330} y={70 + LAYER_H + LAYER_GAP} width={230} height={LAYER_H} rx={3} fill={C.focus} opacity={0.15} stroke={C.focus} />
        <T x={344} y={70 + LAYER_H + LAYER_GAP + LAYER_H / 2 + 5} s={13} f={C.crema}>
          copy artefact
        </T>
        <T x={445} y={48} s={14} a="middle" f={C.focus}>
          runtime stage
        </T>
      </g>
      <T x={300} y={300} s={13} a="middle" f={C.quiet}>
        distroless ≈ 2 MiB
      </T>
      <T x={300} y={320} s={13} a="middle" f={C.quiet}>
        alpine 5 MiB, debian 124 MiB
      </T>
    </Svg>
  );
}

// 7 · Volumes and networks: the writable layer dies with the container; a volume outlives it.
export function VolumesNetworks({ t }: StepCtx) {
  const k = easeOut(seg(t, 0.3, 0.8));
  return (
    <Svg label="A container's writable layer dies with it; a named volume and a bridge network outlive the container" h={340}>
      <rect x={60} y={60} width={200} height={140} rx={4} fill={C.panel} stroke={C.line} />
      <T x={160} y={48} s={14} a="middle" f={C.crema}>
        container
      </T>
      <rect x={80} y={160} width={160} height={28} rx={3} fill={C.band} />
      <T x={160} y={179} s={12} a="middle" f={C.quiet}>
        writable layer
      </T>
      <g opacity={k}>
        <rect x={340} y={60} width={200} height={70} rx={4} fill={C.second} opacity={0.18} stroke={C.second} />
        <T x={440} y={48} s={14} a="middle" f={C.crema}>
          named volume
        </T>
      </g>
      <g opacity={k}>
        <line x1={160} y1={200} x2={440} y2={200} stroke={C.line} strokeWidth={1.5} />
        <rect x={290} y={220} width={120} height={28} rx={14} fill={C.band} stroke={C.line} />
        <T x={350} y={239} s={12} a="middle" f={C.secondary}>
          bridge network
        </T>
      </g>
      <T x={300} y={300} s={13} a="middle" f={C.quiet}>
        services find each other
      </T>
      <T x={300} y={318} s={13} a="middle" f={C.quiet}>
        by name on the network
      </T>
    </Svg>
  );
}

// 8 · Compose: start order by health, not by luck.
export function ComposeHealthy({ t }: StepCtx) {
  const services = ['postgres', 'minio', 'kafka'];
  const healthyAt = [0.3, 0.5, 0.75];
  const appAt = 1.0;
  return (
    <Svg label="Three services start; the consumer waits for each one's own healthcheck before it starts" h={360}>
      {services.map((name, i) => {
        const k = easeOut(seg(t, healthyAt[i], healthyAt[i] + 0.3));
        return (
          <g key={name}>
            <rect x={60} y={40 + i * 70} width={180} height={44} rx={4} fill={C.panel} stroke={k > 0.99 ? C.focus : C.line} />
            <T x={150} y={40 + i * 70 + 27} s={14} a="middle" f={C.primary}>
              {name}
            </T>
            <circle cx={260} cy={40 + i * 70 + 22} r={6} fill={k > 0.99 ? C.focus : C.mocha} opacity={0.3 + k * 0.7} />
          </g>
        );
      })}
      <g opacity={easeOut(seg(t, appAt, appAt + 0.3))}>
        <rect x={380} y={110} width={180} height={44} rx={4} fill={C.second} opacity={0.2} stroke={C.second} />
        <T x={470} y={137} s={14} a="middle" f={C.crema}>
          order-events app
        </T>
      </g>
      <T x={300} y={292} s={13} a="middle" f={C.quiet}>
        each dot lights only when
      </T>
      <T x={300} y={320} s={13} a="middle" f={C.quiet}>
        that service's own check passes
      </T>
    </Svg>
  );
}

// 9 · Config: env var visible from outside vs a mounted file.
export function ConfigEnvFile({ t }: StepCtx) {
  const leakK = easeOut(seg(t, 0.3, 0.7));
  return (
    <Svg label="An environment variable is visible to anyone who can inspect the container; a mounted file is only readable inside it" h={340}>
      <rect x={60} y={60} width={220} height={120} rx={4} fill={C.panel} stroke={C.line} />
      <T x={170} y={48} s={14} a="middle" f={C.crema}>
        env: DB_PASSWORD
      </T>
      <g opacity={leakK}>
        <rect x={60} y={200} width={220} height={30} rx={4} fill={C.band} opacity={0.6} />
        <T x={170} y={220} s={12} a="middle" f={C.cherryText}>
          visible in plain text
        </T>
      </g>
      <rect x={340} y={60} width={200} height={120} rx={4} fill={C.panel} stroke={C.line} />
      <T x={440} y={48} s={14} a="middle" f={C.crema}>
        mounted file
      </T>
      <T x={440} y={122} s={12} a="middle" f={C.quiet}>
        readable inside the
      </T>
      <T x={440} y={148} s={12} a="middle" f={C.quiet}>
        container only
      </T>
    </Svg>
  );
}

// 10 · Recap.
export function Recap({ t }: StepCtx) {
  const lines: [string, string][] = [
    ['One changed layer rebuilds itself', 'and everything stacked above it.'],
    ['A deleted file adds a layer;', 'it never removes one underneath.'],
    ['A multi-stage build ships the', 'runtime stage; the compiler stays.'],
    ['Plain depends_on orders start;', 'service_healthy waits for ready.'],
    ['An env var is visible outside it;', 'a mounted file is not.'],
  ];
  return (
    <Svg label="Five things to keep from this refresher" h={360}>
      {lines.map(([l1, l2], i) => {
        const k = easeOut(seg(t, 0.15 * i, 0.15 * i + 0.4));
        return (
          <g key={l1} opacity={k} transform={`translate(0 ${(1 - k) * 8})`}>
            <circle cx={30} cy={34 + i * 62} r={3} fill={C.focus} />
            <T x={48} y={34 + i * 62 + 5} s={13} f={C.primary} w={400}>
              {l1}
            </T>
            <T x={48} y={34 + i * 62 + 23} s={13} f={C.primary} w={400}>
              {l2}
            </T>
          </g>
        );
      })}
    </Svg>
  );
}
