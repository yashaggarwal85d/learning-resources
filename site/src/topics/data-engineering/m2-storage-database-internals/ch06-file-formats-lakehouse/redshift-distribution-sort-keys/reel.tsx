import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// This topic is disclosed as sourced-only throughout: this sandbox has no Redshift or AWS
// account, so nothing here is a real execution, the same pattern as the two warehouse topics
// earlier in this section. Every architectural claim is a word-for-word quote from Amazon's own
// current Redshift documentation (SOURCES.md).
const reel: Reel = {
  steps: [
    {
      title: 'Hook',
      body: (
        <>
          Both warehouses so far disaggregate storage from compute, joined back together over a
          network. This topic turns to a third lineage entirely: Redshift's classic
          shared-nothing design, with its own nodes and slices.
        </>
      ),
      duration: 4.8,
      fig: "two warehouses joined storage and compute over a network. a third lineage: redshift's shared-nothing mpp.",
      Visual: S.Hook,
    },
    {
      title: "Predict: does every node hold a full copy?",
      body: (
        <>
          A table's rows have to land somewhere across the cluster's nodes. Does every node hold
          a full copy of the table, or does Redshift split the rows up?
        </>
      ),
      duration: 4.8,
      fig: "a table's rows across the cluster: a full copy on every node, or split up somehow?",
      predict: {
        options: [
          { label: 'A full copy on every node' },
          { label: 'The rows get split up', correct: true },
        ],
        explain: (
          <>
            Amazon's own docs: rows are distributed to compute-node slices according to the
            table's chosen distribution style -- not copied everywhere by default.
          </>
        ),
      },
      Visual: S.PredictRowPlacement,
    },
    {
      title: 'Reveal: leader node, compute nodes, slices',
      body: (
        <>
          A leader node coordinates client communication and query plans. Each compute node is
          partitioned into slices, and rows land on those slices according to a distribution
          style.
        </>
      ),
      duration: 4.8,
      fig: 'a leader node coordinates; each compute node splits into slices; rows land by distribution style.',
      Visual: S.RevealLeaderComputeSlices,
    },
    {
      title: 'Reveal: four distribution styles',
      body: (
        <>
          AUTO, EVEN, KEY and ALL each place a table's rows differently -- round-robin, by one
          column's value, or copied to every node -- and each carries its own real cost once a
          join has to redistribute data at run time.
        </>
      ),
      duration: 4.8,
      fig: 'auto, even, key, all -- four styles, each placing rows differently, each with a different join cost.',
      takeaway: "A distribution style decides where rows already sit; a join's redistribution cost is real, and can dominate the plan.",
      Visual: S.RevealDistributionStyles,
    },
    {
      title: 'Reveal: sort keys and block skipping',
      body: (
        <>
          A compound or interleaved sort key orders rows inside each block. Redshift tracks the
          minimum and maximum values stored on every block, and skips any block that falls
          outside a filter's range.
        </>
      ),
      duration: 4.8,
      fig: "a compound or interleaved sort key orders rows; the engine tracks each block's range and skips what can't match.",
      Visual: S.RevealSortKeysBlockSkip,
    },
    {
      title: 'Predict: does scaling one force scaling the other?',
      body: (
        <>
          The last two topics both split storage from compute. Here, in a classic shared-nothing
          design, does scaling compute still force scaling storage along with it, or does this
          lineage avoid that?
        </>
      ),
      duration: 4.8,
      fig: 'the last two topics split storage from compute. does scaling one here force scaling the other too?',
      predict: {
        options: [
          { label: 'Yes, they scale together here' },
          { label: 'No, this lineage decouples them too', correct: true },
        ],
        explain: (
          <>
            Amazon's own docs: managed storage lets compute and storage scale and be paid for
            independently -- the same decoupling idea, reached from a very different starting
            architecture.
          </>
        ),
      },
      Visual: S.PredictStorageComputeCoupling,
    },
    {
      title: 'Reveal: RA3 managed storage and Serverless RPUs',
      body: (
        <>
          RA3 nodes use high-performance local storage backed by durable object storage, letting
          compute and storage scale independently. Serverless goes further still, billing compute
          alone in capacity units with no nodes to size at all.
        </>
      ),
      duration: 4.8,
      fig: 'ra3 nodes decouple storage and compute through managed storage; serverless goes further, billing compute alone.',
      takeaway: 'RA3 decouples storage from compute inside a node-based cluster; Serverless removes the node entirely and bills compute alone.',
      Visual: S.RevealRa3Serverless,
    },
    {
      title: 'Reveal: automatic WLM and concurrency scaling',
      body: (
        <>
          Automatic workload management adjusts query concurrency and memory to the workload on
          its own. When queries would otherwise wait, concurrency scaling automatically adds a
          second cluster's worth of capacity to process them.
        </>
      ),
      duration: 4.8,
      fig: 'automatic wlm adjusts concurrency to the workload on its own; concurrency scaling adds a second cluster when needed.',
      Visual: S.RevealWlmConcurrencyScaling,
    },
    {
      title: 'Reveal: Spectrum and automatic table optimization',
      body: (
        <>
          Spectrum queries structured and semi-structured files sitting in object storage
          directly, with no load step first. Automatic table optimization continuously watches
          query behavior and picks a table's sort and distribution keys without an administrator.
        </>
      ),
      duration: 4.8,
      fig: 'spectrum queries files sitting in s3 directly; automatic table optimization picks sort and distribution keys itself.',
      takeaway: "Spectrum skips loading entirely by querying object storage in place; automatic optimization skips an administrator by watching queries itself.",
      Visual: S.RevealSpectrumAutoOptimization,
    },
    {
      title: 'Recap',
      body: (
        <>
          A third lineage underneath all of it: leader and compute nodes with their own slices,
          distribution styles with a real redistribution cost, sort keys and block skipping, and
          the same decoupling idea reached a second way through RA3 and Serverless.
        </>
      ),
      duration: 4.8,
      fig: "a third lineage: nodes and slices, distribution styles, sort keys, ra3 and serverless, automatic tuning. next: warehouse or lakehouse.",
      Visual: S.Recap,
    },
  ],
};

export default reel;
