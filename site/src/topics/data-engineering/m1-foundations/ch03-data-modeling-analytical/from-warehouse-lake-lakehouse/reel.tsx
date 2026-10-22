import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// This topic has no lab of its own (CHAPTER.md). The step-count reveal is this topic's own
// count from the paper's prose (examples.py), not a number the paper states; everything else
// traces to a direct quote in SOURCES.md. All quantities are spelled in words, no literal digits.
const reel: Reel = {
  steps: [
    {
      title: 'One box owns the storage and the compute',
      body: (
        <>
          A warehouse sells storage and compute together, sized and paid for at peak load. What
          happens once the data it must hold outgrows what that one box can afford to store?
        </>
      ),
      duration: 4.8,
      fig: 'one box, storage and compute together, sized for peak',
      Visual: S.Hook,
    },
    {
      title: 'Reveal: the first generation, quoted directly',
      body: (
        <>
          The paper's own name for this: the first generation of data analytics platforms,
          compute and storage coupled into one appliance.
        </>
      ),
      duration: 4.8,
      fig: 'first generation: compute and storage, coupled, one appliance',
      Visual: S.RevealFirstGenQuote,
    },
    {
      title: 'Predict: does splitting storage from compute cleanly solve the cost problem?',
      body: (
        <>
          Cloud object storage is dramatically cheaper than warehouse-attached storage. Does
          moving the data there just solve the cost problem, cleanly?
        </>
      ),
      duration: 2.8,
      fig: 'storage split out, far cheaper — does that settle it?',
      predict: {
        options: [
          { label: 'Yes — cheaper storage cleanly solves the cost problem' },
          { label: 'It solves cost, but gives something up to do it', correct: true },
        ],
        explain: (
          <>
            It gives something up. Cheaper storage is real, but the warehouse's transactions,
            governance, and performance optimizations do not come along for free with it.
          </>
        ),
      },
      Visual: S.PredictCostOnly,
    },
    {
      title: 'Reveal: the second generation, quoted directly',
      body: (
        <>
          Raw data moves into low-cost, open-format storage with a file API — schema-on-read, no
          warehouse engine required to land it. A downstream warehouse still serves the important
          reporting.
        </>
      ),
      duration: 4.8,
      fig: 'raw data, open files, schema-on-read — a warehouse still does the important BI',
      Visual: S.RevealSecondGenQuote,
    },
    {
      title: 'Reveal: the swamp risk, quoted directly',
      body: (
        <>
          No transactions, no governance enforcement, no performance optimization by default. Most
          real lakes earned the name data swamp honestly, not as a strawman.
        </>
      ),
      duration: 4.8,
      fig: 'no transactions, no governance by default — most lakes became swamps',
      takeaway: 'Cheaper storage is real, but a lake only keeps the management features a warehouse had if something adds them back.',
      Visual: S.RevealSwampQuote,
    },
    {
      title: 'Reveal: the two-tier architecture, quoted directly',
      body: (
        <>
          Cloud object storage replaced on-premises file systems from the mid-twenty-tens onward,
          and lake-plus-warehouse became the dominant architecture in the industry.
        </>
      ),
      duration: 4.8,
      fig: 'cloud object storage takes over — lake plus warehouse, now the dominant shape',
      Visual: S.RevealTwoTierQuote,
    },
    {
      title: 'Predict: does the two-tier architecture need more or fewer pipeline steps than the first generation?',
      body: (
        <>
          The two-tier shape was supposed to be the improvement. Does loading data through it take
          more pipeline steps than the first generation's direct load, or fewer?
        </>
      ),
      duration: 2.8,
      fig: 'direct load versus lake-then-warehouse — more steps, or fewer?',
      predict: {
        options: [
          { label: 'Fewer — that is the whole point of the improvement' },
          { label: 'More — the lake is an added stop, not a replacement', correct: true },
        ],
        explain: (
          <>
            More. The data still has to reach the warehouse for the important BI, so the lake is
            an extra stop in front of that load, not a replacement for it.
          </>
        ),
      },
      Visual: S.PredictStepCount,
    },
    {
      title: "Reveal: the step count, by this topic's own account",
      body: (
        <>
          Direct load into a warehouse takes one step. Loading into a lake, then loading again
          into a warehouse, takes two. The lake added a step; it did not remove one.
        </>
      ),
      duration: 4.8,
      fig: 'one step, direct load — two steps, lake then warehouse',
      takeaway: 'The two-tier shape adds a pipeline step; it never removes one.',
      Visual: S.RevealStepCount,
    },
    {
      title: 'Predict: can an open table format give the lake transactions back without recoupling it to one engine?',
      body: (
        <>
          A warehouse's transactions came from one engine owning the data. Can a lake get
          transactions back without going back to one engine owning everything?
        </>
      ),
      duration: 2.8,
      fig: 'transactions, without handing the files back to one owning engine — possible?',
      predict: {
        options: [
          { label: 'No — transactions require one owning engine, the way a warehouse has it' },
          { label: 'Yes — a transactional layer over open files, many engines can still read', correct: true },
        ],
        explain: (
          <>
            Yes. A layer that tracks commits on top of ordinary open files can enforce
            transactions while leaving the files themselves readable by more than one engine.
          </>
        ),
      },
      Visual: S.PredictTableFormat,
    },
    {
      title: 'Reveal: the lakehouse, quoted directly',
      body: (
        <>
          A family of systems, including Delta Lake and Apache Iceberg, provide transactional
          views of a data lake and bring the management features back.
        </>
      ),
      duration: 4.8,
      fig: 'Delta Lake, Apache Iceberg — transactional views over the same open files',
      Visual: S.RevealLakehouseQuote,
    },
    {
      title: 'Reveal: one capability, three stages',
      body: (
        <>
          Transactions: present in the coupled warehouse, absent in the lake alone, present again
          in the lakehouse — by a different mechanism each time, never the same one twice.
        </>
      ),
      duration: 4.8,
      fig: 'present, then absent, then present again — never the same mechanism twice',
      takeaway: 'The same capability returns by a different mechanism each time, not by reverting to the last one.',
      Visual: S.RevealThreeStages,
    },
    {
      title: 'Recap',
      body: (
        <>
          A coupled warehouse had transactions and paid peak-load cost for them. A lake cut the
          cost and lost the transactions, becoming a swamp without them. A lakehouse's open table
          format gives transactions back, over the same open files, to more than one engine.
        </>
      ),
      duration: 4.8,
      fig: 'coupled, cheap-and-ungoverned, transactional-again-and-open — the full arc',
      Visual: S.Recap,
    },
    {
      title: 'Prove it',
      body: (
        <>
          A one-off interactive dashboard needs today's streaming data right now, with no
          requirement that any other engine ever reads it. Which stage actually serves it best?
        </>
      ),
      duration: 2.8,
      fig: "today's data, one dashboard, no multi-engine need — which stage fits?",
      predict: {
        options: [
          { label: 'The lakehouse — it is the newest, so it is always the right default' },
          { label: 'Whichever stage actually matches the need — here, simplicity over openness', correct: true },
        ],
        explain: (
          <>
            Whichever stage matches the need. The lakehouse's open table format earns its keep
            when more than one engine needs the same data; a one-off dashboard with no such
            requirement does not need that machinery to get its answer.
          </>
        ),
      },
      Visual: S.ProveIt,
    },
  ],
};

export default reel;
