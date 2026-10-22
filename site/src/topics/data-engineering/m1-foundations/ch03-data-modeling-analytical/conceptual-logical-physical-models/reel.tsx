import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// Refresher. No runnable system backs this topic (FACT-CHECK.md): every claim is sourced to Wikipedia's "Data
// modeling" article (SOURCES.md), and the worked example — a customer who can have more than one address — is
// traced by hand through all three levels rather than measured.
const reel: Reel = {
  steps: [
    {
      title: 'Three levels, in five minutes',
      body: (
        <>
          Five minutes on the three decisions every schema passes through before a table exists. All familiar?
          Swipe on to the chapter.
        </>
      ),
      duration: 2,
      Visual: S.Opening,
    },
    {
      title: 'Reveal: the conceptual level',
      body: (
        <>
          A customer. An address. And the fact that a customer can have more than one. No columns, no cardinality
          notation yet — just the business entities and the relationship between them, in a form a stakeholder with
          no database background can read and agree with.
        </>
      ),
      duration: 4,
      fig: 'Customer — has — Address (more than one, in words, not yet a number)',
      Visual: S.RevealConceptual,
    },
    {
      title: 'Predict: does the conceptual level fix how that is stored?',
      body: (
        <>
          "A customer can have more than one address" already names the relationship. Does the conceptual level, on
          its own, also fix how many addresses are allowed, or how that gets stored?
        </>
      ),
      duration: 2.4,
      fig: 'the fact is named — is its shape and storage fixed yet?',
      predict: {
        options: [
          { label: 'Yes — the cardinality and storage are already implied' },
          { label: 'No — it names the relationship, not its shape or storage', correct: true },
        ],
        explain: (
          <>
            No. The conceptual level names which entities exist and how they relate; it is deliberately silent on
            cardinality and on how anything gets stored. Both of those are the next level's job.
          </>
        ),
      },
      Visual: S.PredictConceptualFixesShape,
    },
    {
      title: 'Reveal: the logical level',
      body: (
        <>
          The same fact, now with structure: an entity-relationship diagram naming the exact cardinality — one
          customer, many addresses — plus the attributes each entity carries. Still no engine, no column types, no
          index: structure any database product could implement.
        </>
      ),
      duration: 4.4,
      fig: 'Customer one — many Address, with attributes — still platform-neutral',
      takeaway: 'The logical level fixes structure and cardinality without committing to any one engine.',
      Visual: S.RevealLogical,
    },
    {
      title: 'Reveal: the physical level',
      body: (
        <>
          The same fact a third time, now as a real table: a foreign key from the address table back to the
          customer table, concrete column types, an index to make the lookup fast. This is the only level of the
          three that has to actually run on a machine.
        </>
      ),
      duration: 4.4,
      fig: 'CREATE TABLE address (customer_id REFERENCES customer, ...), indexed',
      takeaway: 'The physical level is the only one of the three that has to work on a real machine.',
      Visual: S.RevealPhysical,
    },
    {
      title: 'Reveal: how the decisions flow',
      body: (
        <>
          Each level fixes exactly what the level before it deliberately left open. Settle a column type at the
          conceptual stage, while talking to a stakeholder who has never seen a database, and a later logical or
          physical choice gets foreclosed before anyone who should weigh in even gets the chance.
        </>
      ),
      duration: 4.8,
      fig: 'entities named → structure fixed → engine fixed — each level closes what the last left open',
      takeaway: "Deciding something too early closes an option a later conversation might have needed.",
      Visual: S.RevealDecisionFlow,
    },
    {
      title: 'Reveal: the boundary blurs in practice',
      body: (
        <>
          Building for a single target engine, teams often skip straight from the conceptual model to something
          that is already both logical and physical at once. Keeping the two separate on paper is what lets one
          conceptual model drive more than one logical model, for more than one engine.
        </>
      ),
      duration: 4.4,
      fig: 'single-engine builds: logical and physical often merge in practice',
      Visual: S.RevealBoundaryBlurs,
    },
    {
      title: 'In one breath',
      body: (
        <>
          Three levels, three jobs: what exists, how it is shaped, how it runs. Swipe on to the next refresher: the
          two workload shapes that pull the physical level in opposite directions for the exact same conceptual
          model.
        </>
      ),
      duration: 2.4,
      Visual: S.Recap,
    },
  ],
};

export default reel;
