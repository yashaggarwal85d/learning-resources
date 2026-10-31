import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// Every number here is this topic's own derivation, asserted in examples.py: the resolved
// fifteen-minute freshness window, the two dimensions ("completeness", "correctness") the hook's
// ask left silent, the four named definitions of "correct" and the one the dashboard's own
// consequence selects ("bounded error"), and the five missing parts of the rejected "make it
// reliable" ask. No real system is run (CHAPTER.md: this chapter's engine of record is the
// estimate and the derivation, not a cluster). No literal digits appear below; the duration
// numbers are exempt.
const reel: Reel = {
  steps: [
    {
      title: 'Hook: the shop wants real-time, accurate revenue — what did those two words actually specify?',
      body: (
        <>
          The shop's head of marketing says "we need real-time revenue on the executive
          dashboard, and it has to be accurate." Engineering builds a streaming job. Finance
          keeps its own batch total. At the first board meeting, the two numbers don't match.
          Both teams met the sentence they were given.
        </>
      ),
      duration: 4.8,
      fig: "the shop's ask, quoted — two teams, two numbers, both claiming to have met it",
      Visual: S.Hook,
    },
    {
      title: 'Predict: which unstated choice made the two figures differ?',
      body: (
        <>
          "Real-time" sounds like it's about speed. Is the gap between the two numbers a speed
          problem — one system simply slower than the other — or is it about something neither
          word ever specified at all: what, exactly, gets counted?
        </>
      ),
      duration: 2.8,
      fig: 'did the two teams disagree on how fast the number arrived, or on what the number counted?',
      predict: {
        options: [
          { label: 'Latency — the streaming job answered slower than the batch job' },
          {
            label: '"Real-time" quietly meant counting orders before they finished settling, and "accurate" never said by when a number must be final',
            correct: true,
          },
        ],
        explain: (
          <>
            Neither team was slow, and neither was wrong about the data it chose to count. The
            sentence never said whether an order counts the moment it's placed or only once it
            finishes settling, and it never said when a number stops being allowed to change. That
            gap is a completeness question, not a speed one — and it's exactly the kind of gap
            this topic's checklist exists to catch before anyone writes code.
          </>
        ),
      },
      Visual: S.Predict1,
    },
    {
      title: "Reveal: five questions turn 'real-time' into one row of the ledger",
      body: (
        <>
          For whom is this measured, where is it measured, at what percentile, over what window,
          and what happens on a miss. Five fixed questions, asked of this exact ask, resolve
          "real-time" into a single number the dashboard must actually meet.
        </>
      ),
      duration: 4.8,
      fig: "five fixed questions, asked of 'real-time' — what single number do they resolve it to?",
      Visual: S.RevealFiveQuestions,
    },
    {
      title: "Reveal: the six-dimension checklist, and the two the ask left silent",
      body: (
        <>
          Freshness, latency, completeness, correctness, availability, retention — a fixed
          checklist run against every ask. Two of the six get no value from the sentence at all,
          and those are precisely where engineering and finance quietly chose differently.
        </>
      ),
      duration: 4.8,
      fig: 'the six dimensions, ticked for this ask — which two did the sentence never specify?',
      takeaway: "A requirement isn't done until all six dimensions have a value or an explicit 'not needed.'",
      Visual: S.RevealSixDimensions,
    },
    {
      title: "Reveal: 'correct' is a specification, not a feeling",
      body: (
        <>
          The same dashboard ask, run through four different definitions of correct: an
          exactly-once effect, eventual completeness by a stated cutoff, a bounded error, and
          at-most-once. Each one is a different system with a different dominant cost, not four
          ways of saying the same thing.
        </>
      ),
      duration: 4.8,
      fig: 'the same ask, through four definitions of correct — four systems, or one system with four names?',
      Visual: S.RevealFourDefinitions,
    },
    {
      title: 'Reveal: which definition the dashboard actually needs',
      body: (
        <>
          The dashboard's own consequence on a miss is a board losing confidence, not a bill
          going out wrong. That consequence, not habit or fashion, is what should choose a
          bounded-error system over the stricter and far costlier exactly-once one.
        </>
      ),
      duration: 4.8,
      fig: "the dashboard's own stated consequence — which of the four definitions does it actually force?",
      takeaway: "'Correct' is chosen before anything is built, from the consequence of being wrong, not discovered afterward.",
      Visual: S.RevealChosenDefinition,
    },
    {
      title: "Reveal: a second ask, 'make it reliable', fails the same five questions",
      body: (
        <>
          Run "make it reliable" through the identical five questions. None of them resolves.
          There is no indicator proposed at all — not a vague one, none.
        </>
      ),
      duration: 4.8,
      fig: "'make it reliable', through the same five questions — how many of them get an answer?",
      takeaway: 'An SLO needs an indicator, a target, a window and a consequence — a shared word supplies none of them.',
      Visual: S.RevealReject,
    },
    {
      title: "Predict: once everyone agrees what 'reliable' means, is that already an SLO?",
      body: (
        <>
          Suppose the whole room agrees, in plain English, what "reliable" should mean here. Does
          that agreement, by itself, make it a service level objective?
        </>
      ),
      duration: 2.8,
      fig: "the room agrees on a meaning for 'reliable' — is that agreement itself an SLO?",
      predict: {
        options: [
          { label: "Yes — once everyone agrees on a meaning, it's an SLO" },
          {
            label: "No — an SLO needs an indicator, a measurement point, a target, a window and a consequence, and agreeing on a word supplies none of them",
            correct: true,
          },
        ],
        explain: (
          <>
            No. Agreement on what a word means is a vocabulary fact about the room, not a
            measurement about the system. Until someone names where it's measured, what the
            target number is, over what window, and what happens on a miss, there is still
            nothing to build against — the exact gap the five questions exist to close.
          </>
        ),
      },
      Visual: S.Predict2,
    },
    {
      title: 'Recap',
      body: (
        <>
          Five fixed questions resolved "real-time" into one freshness number. The six-dimension
          checklist caught the two things the ask left silent. Four definitions of "correct"
          turned out to be four different systems, and the dashboard's own consequence chose one
          of them. And "make it reliable" was rejected outright, agreement on the word or not.
        </>
      ),
      duration: 4.8,
      fig: 'five questions resolved to one SLO, six dimensions checked, correct defined and chosen, and an unmeasurable ask rejected',
      Visual: S.Recap,
    },
    {
      title: 'Prove it',
      body: (
        <>
          A new ask arrives: the warehouse must never show a customer someone else's order. Which
          of the six dimensions does its consequence name directly, and which of the four
          definitions of correct does that consequence actually force?
        </>
      ),
      duration: 2.8,
      fig: 'a new ask about showing the wrong order to the wrong customer — which dimension, and which definition of correct, does it force?',
      predict: {
        options: [
          {
            label: "Correctness — and its consequence, a privacy incident, forces something close to an exactly-once effect on access, not a bounded-error one",
            correct: true,
          },
          { label: "Availability — showing the wrong order looks like downtime from the user's side" },
        ],
        explain: (
          <>
            This is a correctness requirement with a security consequence: showing data to the
            wrong principal is never something a small, bounded error rate makes acceptable, the
            way it was acceptable for the revenue dashboard. Availability measures whether the
            system answers at all, not whether what it hands back belongs to the person asking —
            the same move this topic has used throughout, naming the consequence first and letting
            it choose the definition.
          </>
        ),
      },
      Visual: S.ProveIt,
    },
  ],
};

export default reel;
