import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// Every number here is asserted in examples.py's own capacity_chain() and little_s_law_sizing():
// the shop's own illustrative constants (orders a day, events an order, the peak ratio, bytes an
// event, replication, retention), the resulting design rate, bytes a day and storage, the
// in-flight count and consumers needed from Little's Law, and a real warehouse scan rate measured
// directly against this sandbox's own DuckDB. The three reference numbers (a 2014 Kafka
// benchmark, S3's current per-prefix floor, the measured scan rate) are each sourced and dated in
// SOURCES.md. No literal digits appear below; the duration numbers are exempt.
const reel: Reel = {
  steps: [
    {
      title: "Hook: two million orders a day, with some clicks — does a laptop handle it, or do we need a cluster?",
      body: (
        <>
          The shop is told: about two million orders a day, with some clicks. One engineer says
          that's a mean rate a laptop could handle. Another says, counting the clicks, the peak,
          and the replication, they need a real cluster. Both are reading the same sentence.
        </>
      ),
      duration: 4.8,
      fig: 'two readings of one sentence — a laptop, or a cluster. What did the first reading leave out?',
      Visual: S.Hook,
    },
    {
      title: "Predict: which multiplication did the laptop estimate leave out?",
      body: (
        <>
          The "mean orders a second" reading correctly divided by seconds in a day. Something
          else is missing, and it changes the answer by more than an order of magnitude. What?
        </>
      ),
      duration: 2.8,
      fig: 'the laptop estimate divided by seconds a day correctly — what multiplication is it still missing?',
      predict: {
        options: [
          { label: "It forgot to divide by seconds in a day" },
          { label: "It counted orders, never the clicks each order carries, the peak ratio, or replication", correct: true },
        ],
        explain: (
          <>
            The division by seconds in a day was done correctly — that part of the laptop
            estimate is fine. What's missing is everything downstream of the order count: the
            clickstream events each order actually carries, the peak-to-average ratio a real
            system must be provisioned for, and the replication factor that multiplies storage
            and network load. Each one is a real multiplication, not a rounding error.
          </>
        ),
      },
      Visual: S.Predict1,
    },
    {
      title: "Reveal: the estimate chain, one row per beat",
      body: (
        <>
          Orders a day, times events per order, divided by seconds in a day for the mean rate,
          times the peak ratio for the design rate, times bytes per event for daily volume, times
          retention and replication for the storage to actually buy.
        </>
      ),
      duration: 4.8,
      fig: 'the full estimate chain, one row at a time — which row moves the final answer the most?',
      Visual: S.RevealChain,
    },
    {
      title: "Reveal: what the peak-to-average ratio actually changes",
      body: (
        <>
          Run the identical chain twice: once at the mean rate, once at the design rate. The gap
          between them isn't academic — it's the difference between a system that copes on an
          ordinary busy afternoon and one that doesn't.
        </>
      ),
      duration: 4.8,
      fig: 'the same chain, mean rate versus design rate — what does the gap between them actually change?',
      takeaway: "A system sized for the mean falls over on an ordinary busy afternoon — size for the peak.",
      Visual: S.RevealPeakRatio,
    },
    {
      title: "Reveal: Little's Law",
      body: (
        <>
          The design rate, times how long each event actually spends being processed, equals how
          many events are in flight at any one instant. That count is real: it's buffer memory,
          open connections, live consumer slots.
        </>
      ),
      duration: 4.8,
      fig: 'design rate times processing time — what does that product actually count?',
      Visual: S.RevealLittlesLaw,
    },
    {
      title: "Reveal: sizing consumers and a connection pool from the in-flight count",
      body: (
        <>
          Divide the in-flight count by what a single consumer or a single pooled connection can
          actually hold, and the result is the real number to provision — not a round number
          picked because it sounded safe.
        </>
      ),
      duration: 4.8,
      fig: 'the in-flight count, divided by one consumer\'s own capacity — what comes out the other side?',
      takeaway: "Little's Law isn't a formula to memorize — it's how many consumers or queue slots a design rate needs.",
      Visual: S.RevealConsumerSizing,
    },
    {
      title: "Reveal: three reference numbers, each with its own ceiling named",
      body: (
        <>
          A decade-old single-producer Kafka benchmark. Today's object-store per-prefix request
          floor. A warehouse scan rate, measured directly on this very machine rather than quoted
          from anywhere. Each one is tagged with exactly what it is, and exactly what it is not.
        </>
      ),
      duration: 4.8,
      fig: 'three dated numbers, each tagged with what it is and what it is not — why does the tag matter as much as the number?',
      Visual: S.RevealReferenceNumbers,
    },
    {
      title: "Reveal: using a reference number correctly, and incorrectly",
      body: (
        <>
          "Our cluster will hit that benchmark's rate" borrows a number this design has no right
          to. "A single partition won't bottleneck us at our own, far lower design rate" is the
          actual, narrow claim that same number supports.
        </>
      ),
      duration: 4.8,
      fig: 'the identical benchmark number, used two ways — which claim does it actually support?',
      takeaway: "A reference number answers one narrow question — it never substitutes for measuring your own system.",
      Visual: S.RevealRightUse,
    },
    {
      title: 'Recap',
      body: (
        <>
          One chain carries orders all the way to storage, one row per beat. The peak ratio
          decides what you actually provision, not just what you expect on an average day.
          Little's Law turns a rate into a real consumer count. And three reference numbers,
          each tagged with its own ceiling, round out what a designer should carry in their head.
        </>
      ),
      duration: 4.8,
      fig: 'one estimate chain, a peak ratio that changes provisioning, Little\'s Law sizing consumers, and three tagged reference numbers',
      Visual: S.Recap,
    },
    {
      title: 'Prove it',
      body: (
        <>
          A second business has roughly the same order volume, but every order now needs three
          separate approval-service calls before it ships. What moves in the chain, and is it a
          new kind of arithmetic or the same one with a new multiplier?
        </>
      ),
      duration: 2.8,
      fig: 'three approval calls per order, added to the same business — new arithmetic, or a new number in the same chain?',
      predict: {
        options: [
          { label: "The events-per-order multiplier changes, and the same chain's multiplication still dominates", correct: true },
          { label: "It needs an entirely new formula, since an approval call isn't a clickstream event" },
        ],
        explain: (
          <>
            It's the same chain. Three approval-service calls per order are simply three more
            events per order, which is exactly the multiplier this topic already has a place for.
            Nothing about "approval" versus "click" changes which arithmetic applies — the chain
            doesn't care what an event represents, only how many of them there are and how big
            each one is.
          </>
        ),
      },
      Visual: S.ProveIt,
    },
  ],
};

export default reel;
