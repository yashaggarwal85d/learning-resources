import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// Every number this reel shows comes from a real run of examples.py against this topic's own
// in-process mock object store: a producer writing forty files that crashes after thirty-one of
// them, read naively (a measurable shortfall, no error) and read through a manifest gate
// (nothing trusted at all, not a partial batch). A plain overwrite and a conditional write race
// the identical two producers for the identical key: the plain write lets the second one win with
// no complaint; the conditional write, using the real If-None-Match semantics, rejects the second
// one outright. Three landed files, one with a non-numeric amount field, quarantined with that
// exact reason. The identical malformed row caught at the moment of landing under schema-on-write,
// and left undetected for ninety simulated runs under schema-on-read. Six notification deliveries
// with three repeats, deduped down to three real events; a listing's own cost measured at one,
// five, and fifty pages across three growing prefix sizes.
const reel: Reel = {
  steps: [
    {
      title: 'Hook',
      body: (
        <>
          A producer writes a batch of files and crashes partway through. A reader that simply
          lists the prefix reads whatever landed and reports a number — confidently, measurably
          short of the truth, with no error anywhere.
        </>
      ),
      duration: 4.8,
      fig: 'a crashed producer, a naive reader, a number reported confidently — and measurably wrong.',
      Visual: S.Hook,
    },
    {
      title: 'Predict: the manifest gate',
      body: (
        <>
          The identical crash, but this reader refuses to trust anything until a manifest object
          exists, written strictly after every data file. What does this reader see instead?
        </>
      ),
      duration: 2.8,
      fig: 'the identical crash, read through a manifest gate instead. What does this reader see?',
      predict: {
        options: [
          { label: 'The same files that really landed — they are genuinely sitting in the store' },
          { label: 'Nothing at all — the manifest itself was never written', correct: true },
        ],
        explain: (
          <>
            A manifest-gated reader never inspects the data files directly. It checks for one
            thing: does the manifest exist. If the producer crashed before writing it, the
            answer is no, and the reader trusts zero files — not a plausible-looking partial set.
          </>
        ),
      },
      Visual: S.PredictManifestGate,
    },
    {
      title: 'Reveal: why rename is not the fix',
      body: (
        <>
          An object store gives an atomic write for one object at a time. It does not give a
          rename at all — committing a batch by renaming a staging directory into place is not
          merely slow here, it is not a safe operation to begin with.
        </>
      ),
      duration: 4.8,
      fig: 'an object store: atomic writes, one object at a time. No rename exists to lean on.',
      Visual: S.RevealRenameUnsafe,
    },
    {
      title: 'Reveal: the manifest gate, measured',
      body: (
        <>
          Run directly against the mock: the crashed batch with no manifest leaves the reader
          trusting nothing at all. The identical producer, finishing normally, writes a manifest
          whose own file count matches the batch exactly.
        </>
      ),
      duration: 4.8,
      fig: 'the real run: no manifest, nothing trusted. A finished batch, the manifest matches exactly.',
      takeaway: "A manifest turns a silent partial read into nothing read at all — never a file it can't find listed.",
      Visual: S.RevealManifestMeasured,
    },
    {
      title: 'Reveal: markers and conditional writes',
      body: (
        <>
          A success marker, written strictly last, is the same idea in one small object instead
          of a separate listing. A conditional write goes further: it lets exactly one of two
          producers racing for the same key actually win.
        </>
      ),
      duration: 4.8,
      fig: 'a marker written strictly last; a conditional write that lets only one racing writer win.',
      Visual: S.RevealMarkerAndConditional,
    },
    {
      title: 'Reveal: the race, measured',
      body: (
        <>
          The identical two producers, racing for the identical key: a plain write lets whichever
          one runs last silently replace the other's manifest, no complaint at all. The same race
          under a conditional write rejects the second producer outright, loudly.
        </>
      ),
      duration: 4.8,
      fig: 'the real run: a plain overwrite wins silently; a conditional write rejects the second writer.',
      takeaway: 'A plain overwrite lets the second writer win silently — a conditional write rejects it loudly instead.',
      Visual: S.RevealRaceMeasured,
    },
    {
      title: 'Reveal: poison files',
      body: (
        <>
          A file that fails validation gets moved aside with its own reason attached. The named
          anti-pattern is a blanket setting that silently skips a corrupt file and keeps the job
          running, with no record left of why.
        </>
      ),
      duration: 4.8,
      fig: 'validation fails, a file is moved aside with a reason — never silently skipped.',
      Visual: S.RevealPoisonFiles,
    },
    {
      title: 'Reveal: quarantine, measured',
      body: (
        <>
          Run directly against the mock: one of three landed files fails validation on its own
          amount field and is quarantined with that exact reason attached. The other two land
          completely untouched.
        </>
      ),
      duration: 4.8,
      fig: 'the real run: one file fails on its own field, quarantined with that exact reason.',
      takeaway: 'A poison file gets quarantined with its own reason — never retried forever, never silently skipped.',
      Visual: S.RevealQuarantineMeasured,
    },
    {
      title: 'Reveal: schema timing',
      body: (
        <>
          Validating a schema at landing time catches a malformed file the moment it lands.
          Deferring that same check to read time lets the identical file sit untouched until
          something finally reads the column that was always broken.
        </>
      ),
      duration: 4.8,
      fig: 'the identical malformed file, caught immediately in one case, untouched in the other.',
      Visual: S.RevealSchemaTiming,
    },
    {
      title: 'Reveal: detection timing, measured',
      body: (
        <>
          Run directly against the mock: schema-on-write catches the bad file at the exact moment
          it lands. The identical file under schema-on-read goes completely unnoticed for dozens
          of runs, until the one run that finally touches that column.
        </>
      ),
      duration: 4.8,
      fig: 'the real run: caught at landing versus unnoticed for dozens of runs before detection.',
      takeaway: 'Schema-on-write catches a bad file at landing time — schema-on-read can leave the identical bug unnoticed far longer.',
      Visual: S.RevealTimingMeasured,
    },
    {
      title: 'Recap',
      body: (
        <>
          Three ways to gate a commit, one way to quarantine a poison file, one timing choice for
          schema validation. Every source this chapter has covered needed its own version of the
          same underlying property.
        </>
      ),
      duration: 4.8,
      fig: 'three commit protocols, one quarantine rule, one timing tradeoff — one shared property, still unnamed.',
      takeaway: "Three different sources, three different tricks, one shared property worth naming on its own.",
      Visual: S.Recap,
    },
    {
      title: 'Prove it',
      body: (
        <>
          Event notifications are documented to arrive at least once; discovering new files by
          listing instead pays a cost that grows with how many objects already sit under the
          prefix. Which approach actually wins, and why?
        </>
      ),
      duration: 2.8,
      fig: 'notifications arrive at least once; listing pays a cost that grows with the prefix. Which wins?',
      predict: {
        options: [
          { label: 'Listing — it is simpler and needs no deduplication logic at all' },
          { label: 'Notifications — they need their own dedup, but avoid a cost that grows with the prefix', correct: true },
        ],
        explain: (
          <>
            Listing's own cost keeps climbing as more objects pile up under the same prefix, no
            matter how many are actually new. A notification already names the one object that
            just landed — the price for that is handling an occasional repeat, which a simple
            dedup by key handles completely.
          </>
        ),
      },
      Visual: S.ProveIt,
    },
  ],
};

export default reel;
