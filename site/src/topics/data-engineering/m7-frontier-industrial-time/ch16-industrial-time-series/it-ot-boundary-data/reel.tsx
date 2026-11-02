import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// A real, executed load-budget, buffer and tag-rename computation (examples.py).
// No numbers are repeated on screen beyond what that file computes.
const reel: Reel = {
  steps: [
    {
      title: "Hook: a read-only script stalled the line it never wrote to",
      body: (
        <>
          An analyst points a script at the PLC's tags to build a dashboard, polling three
          thousand tags once a second. The PLC's scan time stretches and a conveyor faults.
          Nobody wrote anything to the PLC. The read load alone disturbed control.
        </>
      ),
      duration: 5.4,
      fig: "an analyst polls three thousand tags once a second against a PLC; the scan time stretches and a conveyor faults, with nothing ever written to the PLC",
      Visual: S.Hook,
    },
    {
      title: 'Reveal: the plant floor is segmented on purpose',
      body: (
        <>
          A plant's network is split into levels on purpose, with a DMZ enforcing the boundary
          between the corporate network and the one running the floor. A data platform's
          extraction path has to cross that boundary somewhere, and every crossing is a decision.
        </>
      ),
      duration: 5.0,
      fig: "the Purdue and ISA-95 levels drawn as zones with a DMZ band enforcing the boundary between the corporate network and the one running the floor",
      Visual: S.RevealSegmentation,
    },
    {
      title: "Predict: can a read-only script still disturb control?",
      body: (
        <>
          The script never writes a single value to the PLC. Can a read that never writes still
          disturb the process it reads from?
        </>
      ),
      duration: 4.0,
      fig: "a script that never writes a value to the PLC — can a read that never writes still disturb the process it reads from?",
      predict: {
        options: [
          { label: "No — a read can't disturb a system it never writes to" },
          {
            label: "Yes — the read load itself can stretch the PLC's own scan time",
            correct: true,
          },
        ],
        explain: (
          <>
            Yes. A PLC's scan loop has to answer every request on top of its control work, so
            enough requests slow the loop that runs the actual process.
          </>
        ),
      },
      Visual: S.PredictReadOnly,
    },
    {
      title: 'Reveal: the load budget, computed',
      body: (
        <>
          Polling three thousand tags once a second against a PLC rated for five hundred
          requests a second is six times the budget, before a single value has even changed.
        </>
      ),
      duration: 4.6,
      fig: "polling three thousand tags once a second against a PLC rated for five hundred requests a second is six times the budget, before a value has even changed",
      Visual: S.RevealLoadBudget,
    },
    {
      title: 'Reveal: a subscription is better, and still not enough',
      body: (
        <>
          Switching to a change-of-value subscription over the same tag mix cuts the load
          sharply. It is still well over this plant's own tight budget.
        </>
      ),
      duration: 4.8,
      fig: "a change-of-value subscription over the same tag mix cuts the load sharply, and it is still over this plant's own tight budget",
      takeaway: "Subscribing instead of polling cut the load by more than half, and it still wasn't enough to fit the budget.",
      Visual: S.RevealSubscription,
    },
    {
      title: 'Reveal: read from the thing built to absorb it',
      body: (
        <>
          The same tags, read from the historian or a replica instead of the PLC itself. The
          load on the PLC drops to the full budget, untouched.
        </>
      ),
      duration: 4.8,
      fig: 'the same tags read from a historian or a replica instead of the PLC — the load on the PLC drops to the full budget, untouched',
      takeaway: "The fix isn't polling less often — it's reading from a system whose job is already to absorb that load.",
      Visual: S.RevealHistorianReplica,
    },
    {
      title: "Reveal: a slow consumer can't block the producer",
      body: (
        <>
          A bounded buffer sits between the extractor and a stalled downstream consumer. Once
          it's full it drops its own oldest item instead of refusing the next one, so the
          producer side never once stalls.
        </>
      ),
      duration: 5.0,
      fig: "a bounded buffer between the extractor and a stalled consumer drops its own oldest item once full, so the producer side never stalls",
      takeaway: "A full buffer dropped its own oldest reading — the producer side never stalled, and nothing it fed ever blocked.",
      Visual: S.RevealBuffer,
    },
    {
      title: 'Reveal: ownership is assigned, not inferred',
      body: (
        <>
          The operational copies, the PLC's tag, the historian's archive, the MES record, and
          the analytical copy, the lakehouse row, each have an owner. A field's own definition
          keeps the operational side's owner even once the bytes live in the analytical copy.
        </>
      ),
      duration: 5.2,
      fig: "operational copies and the analytical copy each have an owner; a field's definition keeps the operational side's owner even in the analytical copy",
      Visual: S.RevealOwnership,
    },
    {
      title: 'Reveal: a rename breaks the naive reader, not the contract reader',
      body: (
        <>
          A sensor's tag is renamed after a firmware re-scale. A reader keyed only on the new
          name misses every reading taken under the old one. A reader built on an alias contract
          catches both.
        </>
      ),
      duration: 5.0,
      fig: "a tag renamed after a firmware re-scale: a reader keyed only on the new name misses the old readings, an alias-contract reader catches both",
      takeaway: "The reader keyed on the new tag name lost every older reading — the alias-aware reader caught both.",
      Visual: S.RevealRename,
    },
    {
      title: 'Recap',
      body: (
        <>
          A plant floor is segmented on purpose. A read load can still disturb control. The fix
          is reading from a system built to absorb it. A buffer protects the producer from a
          stalled consumer. Ownership of the bytes and of a definition are assigned. A rename
          only breaks the reader that wasn't told about it.
        </>
      ),
      duration: 5.6,
      fig: 'a segmented floor, a load budget, a buffer protecting the producer, assigned ownership, and a rename only the naive reader did not survive',
      Visual: S.Recap,
    },
    {
      title: 'Prove it',
      body: (
        <>
          A new consumer wants to subscribe straight to the PLC's own OPC UA server for live
          tag values. Is that the same risk as the dashboard script that polled it?
        </>
      ),
      duration: 4.0,
      fig: "a new consumer subscribes straight to the PLC's own OPC UA server for live tag values — is that the same risk as the script that polled it?",
      predict: {
        options: [
          { label: 'No — a subscription is passive, so it carries no load risk' },
          {
            label: 'Yes — the subscription still asks the PLC to notice every change, so the same budget question applies',
            correct: true,
          },
        ],
        explain: (
          <>
            Yes. The PLC still does the work of deciding what counts as a change; the subscription
            changes the multiplier in the same budget arithmetic, not whether the arithmetic applies.
          </>
        ),
      },
      Visual: S.ProveIt,
    },
  ],
};

export default reel;
