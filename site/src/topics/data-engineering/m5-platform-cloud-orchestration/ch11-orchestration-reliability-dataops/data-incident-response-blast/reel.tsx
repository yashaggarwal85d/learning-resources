import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// The five-stage incident loop, demonstrated on one injected incident against a real Dagster
// asset graph (examples.py): lineage-derived blast radius computed from real declared edges,
// contain-by-quarantine and repair-by-targeted-backfill verified by real row counts. Roles and
// postmortem culture are sourced from the Google SRE Book; lineage standards from OpenLineage.
const reel: Reel = {
  steps: [
    {
      title: 'Hook',
      body: (
        <>
          A stale source quietly feeds days of duplicate rows into a revenue table. The team's
          first move is figuring out which dashboards are even affected -- nobody had ever run
          that query before.
        </>
      ),
      duration: 4.8,
      fig: 'duplicate rows landed. nobody knew what else was touched.',
      Visual: S.Hook,
    },
    {
      title: 'Reveal: the five-stage loop, named',
      body: (
        <>
          Detect, triage, contain, repair, postmortem -- the same five stages, demonstrated on
          this one incident from start to finish.
        </>
      ),
      duration: 4.8,
      fig: 'detect. triage. contain. repair. postmortem.',
      Visual: S.RevealLoop,
    },
    {
      title: 'Predict: how should "affected" actually be answered?',
      body: (
        <>
          Dozens of dashboards sit downstream of the bad table. Is notifying every single one of
          them the safe default here?
        </>
      ),
      duration: 2.8,
      fig: 'is notifying everyone downstream the safe default?',
      predict: {
        options: [
          { label: 'Yes -- over-notifying is always the safer failure mode' },
          { label: 'No -- compute exactly which ones actually depend on it', correct: true },
        ],
        explain: (
          <>
            Over-notifying trains people to ignore the next alert. The real answer is a computed
            one, not a guessed one.
          </>
        ),
      },
      Visual: S.PredictBlastRadius,
    },
    {
      title: 'Reveal: lineage-derived blast radius',
      body: (
        <>
          The asset graph's own declared edges answer exactly which downstream assets an incident
          actually touches -- computed from real dependencies, not guessed from memory.
        </>
      ),
      duration: 4.8,
      fig: 'computed from declared edges, not guessed.',
      takeaway: 'A guessed blast radius either misses someone or wakes everyone. A computed one does neither.',
      Visual: S.RevealBlastRadius,
    },
    {
      title: 'Predict: does containing mean deleting the bad data?',
      body: (
        <>
          A handful of partitions hold the bad rows. Does containing this incident mean deleting
          them right away?
        </>
      ),
      duration: 2.8,
      fig: 'does containing mean deleting the bad data?',
      predict: {
        options: [
          { label: 'Yes -- bad data should be removed as soon as it is found' },
          { label: 'No -- mark the partitions and keep them for now', correct: true },
        ],
        explain: (
          <>
            Deleting first destroys the exact evidence a postmortem needs later. Containing means
            marking the affected partitions and halting what reads from them, not erasing anything.
          </>
        ),
      },
      Visual: S.PredictContain,
    },
    {
      title: 'Reveal: quarantine, then a targeted repair',
      body: (
        <>
          Contain by quarantining only the affected partitions -- marked, not deleted. Repair by
          backfilling only those same partitions, nothing else in the table.
        </>
      ),
      duration: 4.8,
      fig: 'quarantine the few. backfill only those.',
      takeaway: 'Containment and repair both work the same way: touch exactly the partitions that are actually wrong.',
      Visual: S.RevealContainRepair,
    },
    {
      title: 'Reveal: incident-command roles, sourced',
      body: (
        <>
          Per the Google SRE Book's own account: a commander who holds overall state, an
          operations lead who is the only one touching the system, a communication lead who speaks
          for the team.
        </>
      ),
      duration: 4.8,
      fig: 'commander. ops. communication. nobody drives twice.',
      Visual: S.RevealRoles,
    },
    {
      title: 'Recap',
      body: (
        <>
          Detect, triage, contain by quarantine, repair by target, and a postmortem that fixes the
          system rather than blaming a person.
        </>
      ),
      duration: 4.8,
      fig: 'five stages. computed blast radius. a system, not a person, gets fixed.',
      takeaway: "The hook's real cost wasn't the duplicate rows. It was the hours spent guessing who else was affected.",
      Visual: S.Recap,
    },
    {
      title: 'Prove it',
      body: (
        <>
          This topic's own real asset graph: forty downstream dashboards sit below the shop's
          pipeline. How many does a real lineage query actually implicate?
        </>
      ),
      duration: 2.8,
      fig: 'forty downstream dashboards. how many actually affected?',
      predict: {
        options: [
          { label: 'Most of them -- a shared pipeline touches almost everything' },
          { label: "A small, exact subset -- the rest were never at risk", correct: true },
        ],
        explain: (
          <>
            The real asset graph's own declared edges name a small, exact subset as genuinely
            downstream of the incident. Every other dashboard in the forty was never at risk,
            and the lineage query says so with certainty, not a guess.
          </>
        ),
      },
      Visual: S.ProveIt,
    },
  ],
};

export default reel;
