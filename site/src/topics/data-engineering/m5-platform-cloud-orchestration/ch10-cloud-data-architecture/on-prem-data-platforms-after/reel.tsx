import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// MinIO's and Trino's own documentation, CIO Dive's own reporting (citing Forrester) on the
// Broadcom/VMware licensing shift, and Dremio's own data-gravity explainer (SOURCES.md). This
// topic's storage-and-table-format layer is run for real in examples.py — a local S3-
// compatible object store and a real Iceberg table, two appends, two snapshots. Kubernetes and
// a JVM Spark/Trino process are named, not executed, in this sandbox (disclosed there and in
// FACT-CHECK.md).
const reel: Reel = {
  steps: [
    {
      title: "Moved to the cloud for savings, and the bill went up",
      body: (
        <>
          An organisation moves a steady, around-the-clock analytics workload to the cloud,
          expecting the bill to shrink. Instead it's higher every month than the
          fully-depreciated on-prem cluster it replaced. Nothing about the workload changed —
          it just never had an idle moment for the cloud's own pricing model to reward.
        </>
      ),
      duration: 5.2,
      Visual: S.MovedForSavingsHook,
    },
    {
      title: 'Before the stack: what did the cloud actually fail to deliver here?',
      body: (
        <>
          The cloud's whole pitch is paying only for what you use, scaling down when idle.
          This workload is never idle. Before the rest of the topic: what does that mean for
          whether elasticity can ever pay for itself on a workload shaped like this one?
        </>
      ),
      duration: 1.3,
      predict: {
        options: [
          { label: 'Elasticity never pays off on a workload with no idle time to shrink into', correct: true },
          { label: 'The cloud is simply more expensive than on-prem hardware in every case' },
          { label: 'The workload was migrated to the wrong cloud region' },
          { label: 'On-prem hardware is always cheaper once fully depreciated, regardless of workload' },
        ],
        explain: (
          <>
            A workload with no idle time never gets the discount elasticity is built to offer —
            it pays the steady, full rate every hour, which an always-on on-prem cluster doesn't
            charge per hour at all.
          </>
        ),
      },
      Visual: S.PredictWhyCostMore,
    },
    {
      title: 'A decade-old estate, and the pattern that replaced it',
      body: (
        <>
          On-prem data platforms used to mean an HDFS and YARN estate — storage and scheduling
          built for a style of cluster nobody architects fresh anymore. The current pattern
          swaps that for an S3-compatible object store, Kubernetes for orchestration, Spark or
          Trino as the engine, and Iceberg as the table format.
        </>
      ),
      duration: 5.4,
      Visual: S.LegacyVsModernStack,
    },
    {
      title: 'Not simulated: a real store, a real table, a real snapshot',
      body: (
        <>
          This is the one layer in this chapter actually run, not just described. A local
          S3-compatible endpoint takes real writes. A real Iceberg table tracks them —
          Parquet files, Avro manifests, a JSON metadata file — and after two separate appends,
          it carries two real snapshots a reader can query back out.
        </>
      ),
      duration: 5.4,
      Visual: S.RealObjectStoreDemo,
      takeaway: "The table format and the object store are the one layer in this chapter actually run, not simulated.",
    },
    {
      title: "A licensing shift that pushed organisations to look again",
      body: (
        <>
          Within weeks of one acquisition closing, perpetual licenses ended in favour of
          subscriptions, and a sprawling product line was cut down to two offerings — a
          decision that reached an ecosystem most organisations already depend on. The anger
          wasn't about new technology. It was the shift from buying once to renting forever.
        </>
      ),
      duration: 5.4,
      Visual: S.LicensingShock,
      takeaway: "A licensing-model change, not a technology change, is what actually pushed organisations to re-evaluate private cloud.",
    },
    {
      title: 'Four reasons, each with its own falsifiable test',
      body: (
        <>
          Data gravity: moving the data costs more than moving compute to it instead. OT
          proximity: a control loop that can't tolerate a round trip to the cloud. Sovereignty:
          data that legally cannot leave a jurisdiction. Steady utilisation: a workload with no
          idle window for elasticity to ever discount. Each is a test, not a feeling.
        </>
      ),
      duration: 5.6,
      Visual: S.FourReasons,
      takeaway: "Each of the four reasons is a specific test a workload passes or fails — never a vague feeling.",
    },
    {
      title: 'What the cloud was quietly doing for you',
      body: (
        <>
          Choosing on-prem means choosing hardware refresh cycles on your own schedule, your own
          team running Kubernetes and the object store, and capacity planning with no
          autoscaling safety net underneath it. On-prem can win on the four reasons and still
          hand the organisation a real, ongoing bill the cloud was quietly absorbing.
        </>
      ),
      duration: 5.2,
      Visual: S.OperationalBill,
    },
    {
      title: 'In one breath',
      body: (
        <>
          The modern on-prem pattern replaces HDFS and YARN with an object store, Kubernetes,
          Spark or Trino, and Iceberg. A licensing-model shift, not new technology, is pushing
          a fresh look at private cloud. Four specific, falsifiable tests — not a feeling —
          decide when on-prem actually wins. And winning on those tests doesn't erase the bill
          the cloud was absorbing for you.
        </>
      ),
      duration: 5.4,
      Visual: S.Recap,
    },
    {
      title: 'Prove it',
      body: (
        <>
          A retailer's fraud-detection job runs for a few intense minutes each night and sits
          completely idle the rest of the day. Someone proposes moving it on-prem to "save
          money like the hook's workload did." Does any of the four reasons actually support
          that move?
        </>
      ),
      duration: 2.8,
      predict: {
        options: [
          { label: 'Yes — steady utilisation applies to any workload that runs every day' },
          { label: "No — this workload's idle time is exactly what cloud elasticity is built to reward", correct: true },
          { label: 'Yes — data gravity applies, since fraud data is sensitive' },
          { label: 'Yes — sovereignty always favours on-prem for financial data' },
        ],
        explain: (
          <>
            None of the four apply here. This workload is the mirror image of the hook's — it's
            idle most of the day, which is exactly the shape elasticity is built to discount.
            Moving it on-prem would trade a cloud bill that already fits the workload for a
            fixed cost that doesn't.
          </>
        ),
      },
      Visual: S.ProveIt,
    },
  ],
};

export default reel;
