import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// The US DOJ's own CLOUD Act white paper, the European Commission's own pages on the EU-US
// Data Privacy Framework and Standard Contractual Clauses, the EDPB's own supplementary-measures
// recommendations, and two independent secondary sources on the pending Latombe appeal
// (SOURCES.md). CURIA's own judgment text could not be fetched directly in this sandbox
// (blocked and empty responses); disclosed in FACT-CHECK.md. examples.py reproduces the
// classification and policy-gate logic.
const reel: Reel = {
  steps: [
    {
      title: 'A storage region pinned to the EU, and a support contract that reaches outside it',
      body: (
        <>
          A company pins its storage to an EU region and calls the residency question closed.
          Then it notices its own support contract lets engineers outside the EU remotely view
          the same data during troubleshooting — which is itself a transfer under this
          framework, regardless of where the bytes ever physically sit.
        </>
      ),
      duration: 5.0,
      Visual: S.PinnedButReachable,
    },
    {
      title: 'Before the vocabulary: which legal question does a given requirement actually ask?',
      body: (
        <>
          Three words get used almost interchangeably, and conflating them is the single most
          common architecture mistake this topic exists to prevent. Before the precise
          definitions: can you already tell these three questions apart?
        </>
      ),
      duration: 1.2,
      predict: {
        options: [
          { label: "A law requiring certain data to never leave the country is residency" },
          { label: "Where the bytes happen to be stored right now is sovereignty" },
          { label: "Who can be legally compelled to produce data, regardless of where it sits, is sovereignty", correct: true },
          { label: "These three words all mean roughly the same thing in practice" },
        ],
        explain: (
          <>
            Sovereignty is about compelled access, not location — the US CLOUD Act's reach over a
            US provider's data, wherever it's stored, is the canonical example. Residency is the
            physical location, and localisation is a law that mandates that location.
          </>
        ),
      },
      Visual: S.PredictThreeQuestions,
    },
    {
      title: 'Three separate questions, deliberately not one box',
      body: (
        <>
          Residency: where the bytes physically rest. Sovereignty: who can be legally compelled
          to produce them regardless of where that is. Localisation: a law that requires
          residency as a precondition. Three different failure modes, three different fixes.
        </>
      ),
      duration: 5.0,
      Visual: S.ThreeStrips,
    },
    {
      title: "The CLOUD Act's own test: possession, not location",
      body: (
        <>
          A provider subject to US jurisdiction must disclose data within its possession,
          custody or control — the statute's own text says this applies regardless of whether
          that data sits inside or outside the United States. Pinning storage to the EU doesn't
          change who the US can compel.
        </>
      ),
      duration: 4.8,
      Visual: S.CloudActTest,
      takeaway: "Residency answers where bytes sit. Sovereignty answers who can be compelled to produce them, regardless of location.",
    },
    {
      title: 'A framework struck down once, replaced, and struck down again',
      body: (
        <>
          Privacy Shield replaced Safe Harbor. The CJEU's Schrems II ruling struck Privacy
          Shield down over US surveillance-law concerns. Standard Contractual Clauses became the
          fallback — but SCCs now require their own transfer-impact assessment of the
          destination country's actual surveillance exposure before they're valid.
        </>
      ),
      duration: 5.0,
      Visual: S.SchremsAndScc,
    },
    {
      title: "A framework upheld once, and already under appeal",
      body: (
        <>
          The current EU-US Data Privacy Framework survived its first courtroom test — upheld by
          the General Court. An appeal is already pending at the CJEU, the same court that
          struck down both of this framework's two predecessors. Don't build as if this one is
          permanent.
        </>
      ),
      duration: 4.8,
      Visual: S.LatombeTimeline,
      takeaway: "A framework upheld once, already on appeal to the court that struck down both its predecessors, is not settled.",
    },
    {
      title: 'Customer-held keys, and the one case where they do nothing',
      body: (
        <>
          A customer-held decryption key, kept outside the importer's custody, can be an
          effective supplementary measure. But where the processing itself needs the data in
          the clear — a cloud support session, for instance — the EDPB states plainly that no
          technical measure exists to prevent that access at all.
        </>
      ),
      duration: 5.0,
      Visual: S.KeysRealLimit,
      takeaway: "A customer-held key protects data the importer never reads in the clear — nothing once the processing itself needs it.",
    },
    {
      title: 'In one breath',
      body: (
        <>
          Residency, sovereignty and localisation are three separate questions, not one worry.
          The CLOUD Act compels by possession, not location. Schrems II forced SCCs into real
          transfer-impact assessments. The current framework is upheld once, not settled. And
          customer-held keys stop nothing once the processing itself needs the plaintext.
        </>
      ),
      duration: 4.8,
      Visual: S.Recap,
    },
    {
      title: 'Prove it',
      body: (
        <>
          A support engineer outside the EU remotely views EU-resident customer data during a
          troubleshooting session, with the storage itself never leaving its EU region. Which of
          the three questions does this scenario actually test?
        </>
      ),
      duration: 2.6,
      predict: {
        options: [
          { label: "Localisation, because the storage never left the required region" },
          { label: "Residency, because the question is where the bytes are stored" },
          { label: "Whether the remote viewing session itself counts as a transfer", correct: true },
          { label: "None of the three — remote viewing isn't covered by this framework" },
        ],
        explain: (
          <>
            Whether the viewing itself is a transfer. Residency and localisation are both
            satisfied here — the bytes never moved. The actual exposure is that remote access by
            someone outside the EU is itself a transfer under this framework, independent of
            where the storage sits.
          </>
        ),
      },
      Visual: S.ProveIt,
    },
  ],
};

export default reel;
