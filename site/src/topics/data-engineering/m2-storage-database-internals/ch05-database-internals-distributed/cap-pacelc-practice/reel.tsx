import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// No live lab of its own (CHAPTER.md): this topic's own examples.py builds the failure-domain
// hierarchy as a real nested-containment structure, and checks each system's PACELC quadrant
// against its own quoted words from SOURCES.md rather than an assumption.
const reel: Reel = {
  steps: [
    {
      title: 'Hook',
      body: (
        <>
          Two systems both claim to handle network partitions. One keeps answering every request
          through the partition; the other stops answering on one side entirely. Both are telling
          the truth.
        </>
      ),
      duration: 4.8,
      fig: 'both handle partitions. One keeps answering; one stops. Both are right.',
      Visual: S.Hook,
    },
    {
      title: 'Predict: what happens to a "CA" system during a real partition?',
      body: (
        <>
          A system claims to be consistent and available — CA. What happens the moment a real
          partition actually hits it?
        </>
      ),
      duration: 2.8,
      fig: 'it claims CA. What happens the moment a real partition hits?',
      predict: {
        options: [
          { label: 'Nothing — a well-designed system can stay both consistent and available' },
          { label: 'It has to pick: stay consistent, or stay available, not both', correct: true },
        ],
        explain: (
          <>
            CAP's own choice only exists during a partition. A system can be CA outside one — but
            the instant a real partition happens, it has to pick C or A, whatever it claimed
            before.
          </>
        ),
      },
      Visual: S.PredictCaSystemDuringPartition,
    },
    {
      title: 'Reveal: CAP, stated precisely',
      body: (
        <>
          Not a permanent choice — a choice that only exists during a partition. Outside one,
          nothing forces the trade.
        </>
      ),
      duration: 4.8,
      fig: 'not a permanent trade. Only forced while a partition is happening.',
      Visual: S.RevealCapStatedPrecisely,
    },
    {
      title: 'Reveal: PA vs PC, the actual choice',
      body: (
        <>
          One side of a partition either answers, and risks being wrong, or refuses, and stays
          correct. That is the whole theorem.
        </>
      ),
      duration: 4.8,
      fig: 'answer and risk being wrong, or refuse and stay correct. That is CAP.',
      Visual: S.RevealPaVsPc,
    },
    {
      title: "Reveal: PACELC's addition",
      body: (
        <>
          Even with no partition at all, there's still a trade: latency against consistency, on
          every single request.
        </>
      ),
      duration: 4.8,
      fig: 'no partition at all, still a trade: latency against consistency.',
      takeaway: "CAP alone describes only the rare moments of a partition — PACELC adds the trade made on every other request.",
      Visual: S.RevealPacelcAddition,
    },
    {
      title: 'Predict: does a partition-time choice carry over to normal operation?',
      body: (
        <>
          Dynamo gives up consistency during a partition, for availability. Does it also behave
          that way with no partition at all?
        </>
      ),
      duration: 2.8,
      fig: 'gives up consistency under partition. Does it, with no partition too?',
      predict: {
        options: [
          { label: "No — normal operation is a different trade, unrelated to the partition choice" },
          { label: 'Yes — the same system trades consistency for lower latency either way', correct: true },
        ],
        explain: (
          <>
            PACELC's own point is that the two choices usually correlate. A system built to give
            up consistency under partition is, by the same design, usually built to give it up for
            speed when nothing is wrong either.
          </>
        ),
      },
      Visual: S.PredictChoiceCarriesOver,
    },
    {
      title: 'Reveal: Dynamo and Spanner, classified',
      body: (
        <>
          Dynamo: PA/EL, by its own documented design. Spanner: PC/EC, by its own documented
          design — the opposite choice on both axes.
        </>
      ),
      duration: 5.2,
      fig: 'Dynamo: PA/EL. Spanner: PC/EC. Opposite choices, both documented.',
      takeaway: "A system's own documentation names its trade directly — classifying it means reading that choice, not guessing from outside.",
      Visual: S.RevealDynamoSpannerClassified,
    },
    {
      title: 'Reveal: failure domains, physically',
      body: (
        <>
          A process, inside a host, inside a rack, inside an availability zone, inside a region —
          each one a real way "a partition" can actually happen.
        </>
      ),
      duration: 4.8,
      fig: 'process, host, rack, zone, region — each a real way to partition.',
      takeaway: "Losing an inner domain says nothing about the ones around it; losing an outer one takes everything inside it too.",
      Visual: S.RevealFailureDomainsPhysically,
    },
    {
      title: 'Recap',
      body: (
        <>
          A partition forces PA or PC; PACELC adds the trade that exists even without one; both
          are choices made by real, nameable physical failures.
        </>
      ),
      duration: 4.8,
      fig: 'partition forces PA or PC. PACELC adds the trade that is always there.',
      Visual: S.Recap,
    },
    {
      title: 'Prove it',
      body: (
        <>
          A single host crashes in one availability zone. Which failure domains does that actually
          partition, and which ones does it leave completely untouched?
        </>
      ),
      duration: 2.8,
      fig: 'one host crashes. What does that partition, and what does it leave alone?',
      predict: {
        options: [
          { label: 'The whole availability zone — a host failure is treated as a zone failure' },
          { label: 'Only the process and host — the rack, zone and region stay unaffected', correct: true },
        ],
        explain: (
          <>
            A failure domain only takes down what it actually contains. A host failure stops the
            process and the host it ran on; the rack, the zone and the region around it never
            stopped working at all.
          </>
        ),
      },
      Visual: S.ProveIt,
    },
  ],
};

export default reel;
