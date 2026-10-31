import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// A refresher: one compact cross-cloud table, sourced from each vendor's own current
// documentation (fetched and quoted in SOURCES.md). No mechanism is reproduced here.
const reel: Reel = {
  steps: [
    {
      title: 'A job posting that looks unrelated to everything you know',
      body: (
        <>
          An engineer who only knows AWS reads a posting asking for "OneLake and Knowledge Catalog experience" and assumes it's unrelated to
          anything they've touched. It's two rows of one table they already understand, under a different vendor's names.
        </>
      ),
      duration: 4.2,
      Visual: S.UnrelatedJobPosting,
    },
    {
      title: 'Which layer actually carries the switching cost?',
      body: (
        <>
          A team migrates a pipeline from one cloud to another. The compute engine swaps over with a rewrite. Something else about the move
          turns out to be far harder to untangle. Which layer is it?
        </>
      ),
      duration: 1.2,
      predict: {
        options: [
          { label: 'Compute — a different Spark engine is a bigger rewrite' },
          { label: 'Catalog and identity — policy and role graphs don\'t export', correct: true },
          { label: 'Storage — the object format itself is vendor-specific' },
          { label: 'Streaming — no two clouds agree on a message format' },
        ],
        explain: (
          <>
            Catalog and identity. Compute reads an open format and can in principle be swapped — the file format and the SQL don't change. A
            catalog's policy model and an identity system's role graph are each vendor-specific internal state with no standard export; that's
            where migration cost actually concentrates.
          </>
        ),
      },
      Visual: S.WhichLayerCarriesCost,
    },
    {
      title: 'Object storage and identity, three names for the same job',
      body: (
        <>
          Amazon S3, Azure Blob Storage and Google Cloud Storage all answer "store any amount of data, retrieve it any time." AWS IAM, Entra ID
          and Google Cloud IAM all answer "decide who may touch what" — same two jobs, three vendors.
        </>
      ),
      duration: 4.6,
      Visual: S.StorageAndIdentityRow,
    },
    {
      title: 'Catalog and governance: the layer that just renamed itself',
      body: (
        <>
          Unity Catalog, Microsoft Purview with OneLake Catalog, and BigLake sit alongside Google's own Knowledge Catalog — itself renamed
          from Dataplex Universal Catalog in the middle of this chapter being written, which is this topic's point in miniature.
        </>
      ),
      duration: 4.8,
      Visual: S.CatalogRow,
      takeaway: "A product's name under one vendor can change mid-year; the governance job it does (policy, discovery, lineage) doesn't.",
    },
    {
      title: 'Compute, warehouse and streaming, named across all three',
      body: (
        <>
          Spark runs as Glue or EMR on AWS, Fabric Spark or Azure Databricks on Azure, Dataproc on GCP. A warehouse is Redshift, Fabric
          Warehouse or Synapse, or BigQuery. Streaming ingest is Kinesis, Event Hubs, or Pub/Sub — one mechanism, three names each.
        </>
      ),
      duration: 4.8,
      Visual: S.ComputeWarehouseStreamingRow,
      takeaway: 'Compute, warehouse and streaming engines read an open format or protocol, which is why any of them can be swapped.',
    },
    {
      title: 'In one breath',
      body: (
        <>
          Seven rows, three vendors, one mechanism per row. Object storage, identity and compute all swap over with a rewrite. Catalog and
          identity policy don't export at all — that's where a migration's real cost lives. Next: the mechanism every governed lakehouse uses.
        </>
      ),
      duration: 3.6,
      Visual: S.Recap,
      takeaway: "Lock-in concentrates where state can't be exported: a catalog's policy and an identity system's role graph, not a compute engine.",
    },
  ],
};

export default reel;
