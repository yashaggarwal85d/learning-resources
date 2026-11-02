import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// A real ODCS-conformant contract for the shop's own fct_orders (examples.py): a breaking-change
// classifier reused as the producer's own CI gate, blocking a premature rename with no migration
// path while allowing the identical change done through expand first; a runtime check that
// catches a violation from an out-of-band write the CI gate never saw; and automated downstream-
// owner notification driven by a real lineage graph. Sourced: the Open Data Contract Standard's
// own specification, PayPal's open-sourced data contract template (ODCS's direct predecessor),
// and GoCardless's own published account of the problem data contracts solve.
const reel: Reel = {
  steps: [
    {
      title: 'Hook',
      body: (
        <>
          A producer renames a column with every internal test green, and three other teams'
          dashboards break in production without warning. The same rename, against an ODCS
          contract, is rejected by the producer's own CI, naming all three downstream owners.
        </>
      ),
      duration: 4.8,
      fig: 'every test green. three dashboards broke anyway.',
      Visual: S.Hook,
    },
    {
      title: 'Predict: does passing CI also protect downstream consumers?',
      body: (
        <>
          The prior topic's write-audit-publish protects a pipeline's own publish from
          corrupting itself. Does that same guarantee protect everyone who reads its output too?
        </>
      ),
      duration: 2.8,
      fig: 'safe to deploy. safe for who reads it?',
      predict: {
        options: [
          { label: 'Yes -- a safe publish is safe for every consumer' },
          { label: 'No -- nothing protects a consumer unless something promises it', correct: true },
        ],
        explain: (
          <>
            CI only enforces what the pipeline's own tests check. Nothing protects a downstream
            consumer unless something states, in a form CI can read, what the producer promises.
          </>
        ),
      },
      Visual: S.PredictCIProtectsConsumers,
    },
    {
      title: 'Reveal: a contract as code',
      body: (
        <>
          A single versioned, machine-readable file holds a table's schema, its quality rules,
          its SLAs and its ownership together -- built here for the shop's own fct_orders.
        </>
      ),
      duration: 4.8,
      fig: 'schema, quality, SLAs, ownership. one file.',
      Visual: S.RevealContractAsCode,
    },
    {
      title: 'Reveal: breaking-change classification as the CI gate',
      body: (
        <>
          A straight rename with no migration path is blocked before it merges. The identical
          change proposed through expand first, or any purely additive change, is not.
        </>
      ),
      duration: 4.8,
      fig: 'no path: blocked. expand first: allowed.',
      takeaway: 'A CI gate that reads the contract blocks exactly the renames a consumer never saw coming.',
      Visual: S.RevealBreakingChangeGate,
    },
    {
      title: 'Predict: does catching it before the merge catch every violation?',
      body: (
        <>
          A CI gate only ever runs on a change that goes through a pull request. Does that catch
          every way the contract could actually be violated?
        </>
      ),
      duration: 2.8,
      fig: 'caught before the merge. caught every time?',
      predict: {
        options: [
          { label: 'Yes -- every write eventually goes through a pull request' },
          { label: 'No -- a write that skips CI entirely still needs a check', correct: true },
        ],
        explain: (
          <>
            A write from an out-of-band job never goes through a pull request at all, so a
            CI gate never runs against it in the first place.
          </>
        ),
      },
      Visual: S.PredictGateCatchesEverything,
    },
    {
      title: 'Reveal: runtime enforcement catches the out-of-band write',
      body: (
        <>
          The same contract, checked again at write time, is the only thing that ever sees a
          violation a CI gate had no chance to -- caught here on a real out-of-band write.
        </>
      ),
      duration: 4.8,
      fig: 'never went through CI. caught anyway.',
      Visual: S.RevealRuntimeEnforcement,
    },
    {
      title: 'Reveal: automated owner notification via lineage',
      body: (
        <>
          An approved change to fct_orders still reaches three real downstream tables owned by
          three different teams. The lineage graph finds and notifies every one automatically.
        </>
      ),
      duration: 4.8,
      fig: 'one change. three owners found.',
      takeaway: 'Nobody has to remember who reads a table once its lineage graph already knows.',
      Visual: S.RevealLineageNotification,
    },
    {
      title: 'Recap',
      body: (
        <>
          Contract as code, a producer-side CI gate, runtime enforcement and lineage-driven
          notification -- four mechanisms closing the one gap a safe publish still left open.
        </>
      ),
      duration: 4.8,
      fig: 'four mechanisms. one closed gap.',
      takeaway: 'A pipeline that cannot ship a change its own promises would reject protects everyone who reads it.',
      Visual: S.Recap,
    },
    {
      title: 'Prove it',
      body: (
        <>
          This topic's own shop contract and its own CI gate, run for real against a rename with
          no migration path and the identical rename done through expand first.
        </>
      ),
      duration: 2.8,
      fig: 'one rename blocked. one rename allowed.',
      predict: {
        options: [
          { label: 'Both renames are blocked by the gate' },
          { label: 'Only the rename with no migration path is blocked', correct: true },
        ],
        explain: (
          <>
            The straight rename is classified breaking with no path and blocked. The expand-first
            rename names exactly what it deprecates, and the gate correctly lets it through.
          </>
        ),
      },
      Visual: S.ProveIt,
    },
  ],
};

export default reel;
