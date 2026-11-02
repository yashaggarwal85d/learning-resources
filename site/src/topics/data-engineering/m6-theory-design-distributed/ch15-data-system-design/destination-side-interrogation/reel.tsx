import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// The consumer-interview simulation is asserted in examples.py's own
// list_consumers(), serving_store_per_consumer(), bets_vs_facts(), and
// flag_export_paths(). The SRE book/workbook claims trace to SOURCES.md's
// four quotes, checked step by step in FACT-CHECK.md. No literal digits
// appear below; the duration numbers are exempt.
const reel: Reel = {
  steps: [
    {
      title: "Hook: one sentence, two faithful pipelines",
      body: (
        <>
          The plant operations lead says "we want real-time dashboards for the plants." One
          engineer builds a streaming pipeline with a sub-second operator display. Another
          builds a minutes-refresh aggregate dashboard. Both read the exact same sentence
          faithfully.
        </>
      ),
      duration: 5.0,
      fig: "one sentence above two pipelines, both faithful readings",
      Visual: S.Hook,
    },
    {
      title: "Predict: which question would have picked one design?",
      body: (
        <>
          The lead isn't an engineer and has no technical definition of "real-time" in mind.
          Asking them to define the term won't fork anything. What question actually would?
        </>
      ),
      duration: 4.4,
      predict: {
        options: [
          { label: "ask the lead to define exactly what 'real-time' means, technically" },
          {
            label: "ask the lead what they actually do the moment they see the number on screen",
            correct: true,
          },
        ],
        explain: (
          <>
            The lead doesn't have a technical definition to give — they have a behavior. What
            they do the instant they see the number is the question that turns a vague demand
            into a concrete, checkable bound.
          </>
        ),
      },
      fig: "which question would have picked one design for the right reasons?",
      Visual: S.Predict1,
    },
    {
      title: "Reveal: list every consumer, not just the one who asked",
      body: (
        <>
          The plant lead's own box flips open to reveal three more consumers already reading the
          same data: a quality report, a maintenance model, and a monthly compliance filing.
          Nobody asked about them, but the design has to serve all four.
        </>
      ),
      duration: 4.8,
      fig: "one consumer box flipping open to reveal three more",
      Visual: S.RevealListConsumers,
    },
    {
      title: "Reveal: one dataset, several consumers, several stores",
      body: (
        <>
          A dashboard and a quality report can share a warehouse aggregate. A maintenance model
          needs a point-in-time-correct store. A compliance filing needs an immutable,
          reproducible report. One dataset, four different serving-store answers.
        </>
      ),
      duration: 4.4,
      takeaway: "One dataset can have several consumers, and each one can need its own serving store.",
      fig: "four consumers, each landing on its own serving store",
      Visual: S.RevealSeveralStores,
    },
    {
      title: "Reveal: the sharp question turns vague into concrete",
      body: (
        <>
          "Real-time" isn't checkable on its own. "I walk the floor the moment the number
          crosses a line" is — it names the actual bound the freshness design has to meet, not
          an adjective borrowed from a sales deck.
        </>
      ),
      duration: 5.0,
      fig: "'real-time' replaced by the lead's own stated trigger for action",
      Visual: S.RevealSharpQuestion,
    },
    {
      title: "Reveal: a bet is not a fact",
      body: (
        <>
          Four of the five answers are things the lead stated directly: how many lines, how
          often they look, how far back the filing reaches. The fifth — where tenant count goes
          next year — is a guess, marked as one rather than treated like the other four.
        </>
      ),
      duration: 4.8,
      takeaway: "A bet is not a fact, and the design has to mark which answers are which.",
      fig: "four answer cards stated directly; a fifth flagged as a bet",
      Visual: S.RevealBetVsFact,
    },
    {
      title: "Reveal: grain, concurrency, and retention",
      body: (
        <>
          The level of detail each consumer needs, asked before the model is built, not after
          the first dashboard needs one level finer. How many people query at once during the
          Monday-morning report run. How far back the filing has to be able to reprocess.
        </>
      ),
      duration: 4.8,
      fig: "grain, concurrency, and retention, each asked up front",
      Visual: S.RevealGrainConcurrency,
    },
    {
      title: "Reveal: export paths are a design input",
      body: (
        <>
          A CSV download and a BI extract both flip red: each one leaves the engine's own access
          policy behind the moment the data crosses that boundary. An export path has to be
          designed for, not discovered after the fact.
        </>
      ),
      duration: 4.6,
      takeaway: "An export path is a design input, not an afterthought — it bypasses whatever policy the engine enforces.",
      fig: "a csv download and a bi extract both flipping red",
      Visual: S.RevealExportPaths,
    },
    {
      title: "Recap",
      body: (
        <>
          List every consumer, not just the one who asked. Tie freshness to what they actually do
          with the number. Mark a bet as a bet. Ask for grain, concurrency, and retention up
          front. And treat every export path as a policy gap to design around.
        </>
      ),
      duration: 4.6,
      fig: "every consumer landing on its store, the sharp question, the bet, the flagged exports",
      Visual: S.Recap,
    },
    {
      title: "Prove it: a single view of the customer",
      body: (
        <>
          A new prompt arrives: "we want a single view of the customer." It names a noun, not a
          consumer, a freshness, or a grain. Does the design start from the noun, or from the
          same five questions?
        </>
      ),
      duration: 4.8,
      predict: {
        options: [
          { label: "start building the single view right away, since the prompt already names the deliverable" },
          {
            label: "run the same five-question interview first, since the prompt alone says nothing about who reads it or how fresh",
            correct: true,
          },
        ],
        explain: (
          <>
            "A single view of the customer" is exactly as vague as "real-time dashboards for the
            plants" — a noun standing in for a design nobody has actually specified yet. The same
            five questions fork it the same way.
          </>
        ),
      },
      fig: "a new vague prompt; the same five questions ready to fork it",
      Visual: S.ProveIt,
    },
  ],
};

export default reel;
