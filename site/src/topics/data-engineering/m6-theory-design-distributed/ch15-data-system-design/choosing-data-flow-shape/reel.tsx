import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// The decision card's four shapes, the fifteen-minute and thirty-second SLOs, and which shapes
// clear each are all asserted directly in examples.py's own DECISION_CARD, shapes_clearing_slo(),
// and cheapest_clearing_shape() — no literal digits appear below, the duration numbers are
// exempt. Every claim about Lambda, Kappa, and the real costs each pays traces to a verbatim
// quote in SOURCES.md, checked step by step in FACT-CHECK.md.
const reel: Reel = {
  steps: [
    {
      title: 'Hook: three teams, three shapes, one freshness SLO — which wins at the lowest cost?',
      body: (
        <>
          The shop's own freshness SLO, from an earlier topic, is fifteen minutes. Three teams
          propose three different shapes for the pipeline: always-on streaming, hourly batch, and
          a five-minute micro-batch. Which one meets the SLO at the lowest operating cost?
        </>
      ),
      duration: 4.8,
      fig: 'the SLO line, three proposals beside it — which one clears it for the least cost?',
      Visual: S.Hook,
    },
    {
      title: 'Predict: which shape wins, and what could flip the answer?',
      body: (
        <>
          Streaming always clears the SLO with room to spare. Does that make it the right choice,
          or is there a cheaper shape that clears it too — and a question about reprocessing that
          could change the answer entirely?
        </>
      ),
      duration: 2.8,
      fig: 'streaming always clears the floor — does the most headroom mean it should win?',
      predict: {
        options: [
          { label: 'Streaming always wins once it clears the SLO, since it has the most headroom' },
          { label: 'The cheapest shape whose floor still clears the SLO wins, unless reprocessing cost says otherwise', correct: true },
        ],
        explain: (
          <>
            Headroom isn't free — it's the most expensive shape to keep running continuously. The
            rule is the cheapest shape whose latency floor still clears the SLO, not the fastest
            one available. A single question can still flip that answer: how expensive is it to
            reprocess this shape's output when the code that produces it changes?
          </>
        ),
      },
      Visual: S.Predict1,
    },
    {
      title: 'Reveal: the decision card, four shapes against the SLO line',
      body: (
        <>
          Batch, micro-batch, streaming, and hybrid, each with its own latency floor as a bar
          against the fifteen-minute line. Any floor above the line dims immediately — it simply
          cannot meet this SLO, no matter how it's tuned.
        </>
      ),
      duration: 4.8,
      fig: 'four shapes, four floors, one line — which floors clear it, and which dim out immediately?',
      Visual: S.RevealDecisionCard,
    },
    {
      title: 'Reveal: of the survivors, the cheapest one wins',
      body: (
        <>
          Three shapes clear the floor. Comparing their operational burden and how easily they
          replay old data, the cheapest survivor is the one that should actually win — not the
          one with the most room to spare underneath the line.
        </>
      ),
      duration: 4.8,
      fig: 'three shapes clear the floor — which one is actually the cheapest to run?',
      takeaway: 'Choose the cheapest shape whose latency floor still clears the SLO — not the fastest one available.',
      Visual: S.RevealSurvivorsCompared,
    },
    {
      title: 'Reveal: Lambda, Kappa, and a unified engine, placed on the card',
      body: (
        <>
          Lambda sits on the hybrid card: two code paths, one batch and one speed. Kappa sits on
          the streaming card: replay is just the same job started again from the retained log. A
          unified engine gets Kappa's one-code-path property without hand-rolling that replay.
        </>
      ),
      duration: 4.8,
      fig: 'Lambda on the hybrid card, Kappa on the streaming card — where does a unified engine sit, and why?',
      Visual: S.RevealLambdaKappaUnified,
    },
    {
      title: "Reveal: the real cost Lambda pays, and the real cost Kappa pays",
      body: (
        <>
          Lambda's real cost, by its own creator's account, is organizational: keeping two
          systems' logic in sync, not compute. Kappa's real cost is a genuine one too — a
          temporary doubling of output storage during every reprocessing run. Neither is free.
        </>
      ),
      duration: 4.8,
      fig: "Lambda's cost and Kappa's cost, side by side — which one is a compute problem, and which one is not?",
      takeaway: "Lambda's real cost is organizational — keeping two systems' logic in sync — not a computational one.",
      Visual: S.RevealRealCosts,
    },
    {
      title: 'Reveal: push versus pull, decided at each source',
      body: (
        <>
          At every source boundary, someone either pushes, and the source team owns delivery and
          the schema, or is pulled from, and the pipeline itself owns extraction. That boundary
          decides who gets paged the moment data stops arriving.
        </>
      ),
      duration: 4.8,
      fig: 'at this boundary, who owns delivery, and who gets paged when it stops?',
      Visual: S.RevealPushPull,
    },
    {
      title: 'Predict: does a silent pulled source look different from a quiet day?',
      body: (
        <>
          A pulled source goes silent — zero new rows today. Does the pull job itself show an
          obvious error, the way a crash would, or does it look exactly like nothing happened at
          all today?
        </>
      ),
      duration: 2.8,
      fig: 'zero rows pulled today — does the job report an error, or does it report success?',
      predict: {
        options: [
          { label: 'Different — the pull job itself would show an obvious error' },
          { label: 'Identical — a successful pull with zero rows looks exactly like a quiet business day', correct: true },
        ],
        explain: (
          <>
            The pull job reports success either way — it did exactly what it was asked, and found
            nothing new. A silent source failure produces the same shape of result as a genuinely
            quiet day. Only a freshness alert, watching how long it's been since data last moved,
            catches the difference an error code never will.
          </>
        ),
      },
      takeaway: "A pulled source's silent failure looks identical to a quiet day — only a freshness alert catches it.",
      Visual: S.Predict2,
    },
    {
      title: 'Recap',
      body: (
        <>
          The decision card weighs every shape against the SLO line, and the cheapest survivor
          wins. Lambda and Kappa each place on that card with a real, different cost. And push
          versus pull decides who owns a source's failure, and how visibly it shows up.
        </>
      ),
      duration: 4.8,
      fig: 'one decision card, cheapest-that-clears, Lambda and Kappa placed on it, push versus pull owning failure visibility',
      Visual: S.Recap,
    },
    {
      title: 'Prove it',
      body: (
        <>
          A new fraud-review ask tightens the shop's freshness SLO from fifteen minutes down to
          thirty seconds. Which shapes still survive the decision card, and what does that
          tightened floor force the team to give up?
        </>
      ),
      duration: 2.8,
      fig: 'the SLO drops to thirty seconds — which shapes still clear it, and what fallback disappears?',
      predict: {
        options: [
          {
            label: 'Only streaming clears a thirty-second floor, and the reprocessing-cost question now matters far more, since no batch fallback is left',
            correct: true,
          },
          { label: 'Micro-batch can still be tuned fast enough by simply shrinking the batch interval far enough' },
        ],
        explain: (
          <>
            Micro-batch sounds infinitely tunable, but its floor is bounded by real trigger and
            shuffle overhead — it cannot be shrunk past that floor. At a thirty-second SLO, only
            streaming's floor still clears the line, and with no batch fallback left to lean on,
            the reprocessing-cost question this topic opened with now matters far more than before.
          </>
        ),
      },
      Visual: S.ProveIt,
    },
  ],
};

export default reel;
