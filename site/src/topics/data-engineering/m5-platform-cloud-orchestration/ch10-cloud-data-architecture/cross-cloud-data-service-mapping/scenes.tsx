import type { StepCtx } from '../../../../../reels/types';
import { clamp, seg } from '../../../../../reels/anim';
import { C, Stack, Svg, T } from '../../../../../reels/kit';

// Every product name here is quoted from that vendor's own current documentation; see SOURCES.md.

// 1 · Hook: a posting that looks unrelated, then resolves to two familiar rows.
export function UnrelatedJobPosting({ t }: StepCtx) {
  const resolved = clamp(seg(t, 0.4, 1));
  return (
    <Stack>
      <Svg label="A job posting's unfamiliar names resolving into a familiar two-row table" h={260}>
        <T x={300} y={30} s={14} a="middle" f={C.taupe} serif>"OneLake and Knowledge Catalog experience"</T>
        <rect x={100} y={64} width={400} height={70} rx={8} fill="none" stroke={resolved ? C.caramel : C.mocha} strokeWidth={2} />
        <T x={300} y={92} s={13} a="middle" f={resolved ? C.caramel : C.latte} serif>{resolved ? 'storage row + catalog row' : 'unfamiliar names'}</T>
        <T x={300} y={112} s={13} a="middle" f={C.taupe}>{resolved ? 'already known under a different vendor' : '?'}</T>
      </Svg>
    </Stack>
  );
}

// 2 · Predict: which layer carries the switching cost?
export function WhichLayerCarriesCost({ answer }: StepCtx) {
  const revealed = answer !== null;
  const layers = ['compute', 'catalog + identity', 'storage', 'streaming'];
  return (
    <Stack>
      <Svg label="Four candidate layers in a grid, with catalog and identity lit once the answer is revealed" h={280}>
        <T x={300} y={26} s={14} a="middle" f={C.taupe} serif>Where does migration cost live?</T>
        {layers.map((label, i) => {
          const hit = label === 'catalog + identity';
          const col = i % 2, row = Math.floor(i / 2);
          return (
            <g key={label}>
              <rect x={100 + col * 220} y={60 + row * 66} width={200} height={50} rx={8} fill="none" stroke={revealed && hit ? C.caramel : C.mocha} strokeWidth={2} />
              <T x={200 + col * 220} y={90 + row * 66} s={13} a="middle" f={revealed && hit ? C.caramel : C.latte} w={revealed && hit ? 700 : 400}>{label}</T>
            </g>
          );
        })}
        <T x={300} y={210} s={12} a="middle" f={revealed ? C.caramel : C.taupe} w={700}>{revealed ? "policy and role graphs don't export" : 'one of these reads an open format'}</T>
      </Svg>
    </Stack>
  );
}

// 3 · Storage and identity row.
export function StorageAndIdentityRow({ t }: StepCtx) {
  const vendors = ['AWS', 'Azure', 'GCP'];
  const storage = ['S3', 'Blob Storage', 'Cloud Storage'];
  const identity = ['IAM', 'Entra ID', 'Cloud IAM'];
  return (
    <Stack>
      <Svg label="Storage and identity, three vendor columns each resolving to the same two jobs" h={280}>
        <T x={300} y={24} s={13} a="middle" f={C.taupe} serif>Same two jobs, three names</T>
        {vendors.map((v, i) => {
          const show = clamp(seg(t, 0.15 * i, 0.15 * i + 0.3));
          return (
            <g key={v} opacity={show}>
              <T x={110 + i * 160} y={56} s={12} a="middle" f={C.taupe} serif>{v}</T>
              <rect x={40 + i * 160} y={68} width={140} height={44} rx={6} fill="none" stroke={C.caramel} strokeWidth={2} />
              <T x={110 + i * 160} y={94} s={13} a="middle" f={C.caramel}>{storage[i]}</T>
              <rect x={40 + i * 160} y={124} width={140} height={44} rx={6} fill="none" stroke={C.second} strokeWidth={2} />
              <T x={110 + i * 160} y={150} s={13} a="middle" f={C.second}>{identity[i]}</T>
            </g>
          );
        })}
      </Svg>
    </Stack>
  );
}

// 4 · Catalog/governance row, and the rename.
export function CatalogRow({ t }: StepCtx) {
  const renamed = clamp(seg(t, 0.4, 0.8));
  const products = ['Unity Catalog', 'Purview / OneLake Catalog', 'BigLake'];
  return (
    <Stack>
      <Svg label="Catalog and governance products stacked vertically, with GCP's own row shown mid-rename" h={320}>
        <T x={300} y={24} s={13} a="middle" f={C.taupe} serif>Catalog and governance</T>
        {products.map((p, i) => (
          <g key={p}>
            <rect x={90} y={48 + i * 56} width={420} height={42} rx={8} fill="none" stroke={C.mocha} strokeWidth={2} />
            <T x={300} y={74 + i * 56} s={13} a="middle" f={C.latte}>{p}</T>
          </g>
        ))}
        <T x={300} y={230} s={12} a="middle" f={renamed ? C.caramel : C.taupe} w={700}>{renamed ? 'Dataplex Universal Catalog → Knowledge Catalog' : 'one of these just renamed itself'}</T>
      </Svg>
    </Stack>
  );
}

// 5 · Compute, warehouse, streaming — one category at a time, three names stacked.
export function ComputeWarehouseStreamingRow({ t }: StepCtx) {
  const groups = [
    { label: 'Spark', names: ['AWS: Glue / EMR', 'Azure: Fabric Spark / Databricks', 'GCP: Dataproc'] },
    { label: 'warehouse', names: ['AWS: Redshift', 'Azure: Fabric / Synapse', 'GCP: BigQuery'] },
    { label: 'streaming', names: ['AWS: Kinesis', 'Azure: Event Hubs', 'GCP: Pub/Sub'] },
  ];
  const active = t < 1.6 ? 0 : t < 3.2 ? 1 : 2;
  const group = groups[active];
  const localT = t - active * 1.6;
  return (
    <Stack>
      <Svg label="One category at a time (Spark, warehouse, streaming), its three vendor names stacked vertically" h={300}>
        <T x={300} y={26} s={14} a="middle" f={C.taupe} serif>{group.label}</T>
        {group.names.map((n, i) => {
          const show = clamp(seg(localT, 0.25 * i, 0.25 * i + 0.4));
          return (
            <g key={n} opacity={show}>
              <rect x={80} y={60 + i * 56} width={440} height={42} rx={8} fill="none" stroke={C.second} strokeWidth={1.5} />
              <T x={300} y={86 + i * 56} s={13} a="middle" f={C.second}>{n}</T>
            </g>
          );
        })}
      </Svg>
    </Stack>
  );
}

// 6 · Recap.
export function Recap({ t }: StepCtx) {
  const items = ['storage, identity, compute: swap with a rewrite', 'catalog + identity policy: never exports'];
  return (
    <Stack>
      <Svg label="The recap's two-line summary of where lock-in actually lives" h={260} fill>
        <T x={300} y={30} s={15} a="middle" f={C.taupe} serif>Seven rows, one real divide</T>
        {items.map((label, i) => {
          const show = clamp(seg(t, 0.2 * i, 0.2 * i + 0.3));
          return (
            <T key={label} x={300} y={90 + i * 40} s={13} a="middle" f={i === 1 ? C.caramel : C.latte} o={show} w={i === 1 ? 700 : 400} serif>{label}</T>
          );
        })}
      </Svg>
    </Stack>
  );
}
