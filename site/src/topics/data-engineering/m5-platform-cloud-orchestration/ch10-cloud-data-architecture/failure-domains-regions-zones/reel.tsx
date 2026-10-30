import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// A refresher opening Chapter ten: the vocabulary every later topic in this
// chapter leans on without re-deriving it. Every number is executed and
// checked by examples.py.
const reel: Reel = {
  steps: [
    {
      title: 'One zone goes dark',
      body: (
        <>
          A single-zone managed database goes dark the moment its zone fails, for as long as the outage lasts. A regional object store and a
          multi-zone streaming cluster, pinned to the same region, keep serving the whole time. Same outage, three different outcomes, decided long
          before it happened.
        </>
      ),
      duration: 4,
      Visual: S.OneZoneDark,
    },
    {
      title: 'Which of these three keeps serving?',
      body: (
        <>
          The zone these three services are drawn in just failed. A block volume, a single-zone database and a regional object-storage bucket: which
          one keeps serving reads?
        </>
      ),
      duration: 1.2,
      predict: {
        options: [{ label: 'The block volume' }, { label: 'The single-zone database' }, { label: 'The object-storage bucket', correct: true }, { label: 'None of them' }],
        explain: (
          <>
            The object-storage bucket: object storage is a regional service, replicated by the provider across every zone in the region regardless of
            which zone a given request happens to land in. The block volume and the single-zone database are each pinned to one zone and go dark with
            it. Being drawn next to a failure is not the same as being hosted by it.
          </>
        ),
      },
      Visual: S.WhichSurvives,
    },
    {
      title: 'Zonal vs regional vs multi-AZ by design, not by luck',
      body: (
        <>
          A block volume is zonal. A managed database's multi-zone replication is usually a configuration an operator switches on, not a default.
          Object storage is regional by the provider's own design. The same three-way split is named, under the same words, in AWS's, Google
          Cloud's and Azure's own documentation — it is a property of the cloud model, not one vendor's quirk.
        </>
      ),
      duration: 5,
      Visual: S.ZonalRegionalStrip,
    },
    {
      title: 'What a zone outage actually costs to insure against',
      body: (
        <>
          Multi-zone redundancy is not free insurance. Every byte that crosses a zone boundary for replication is billed, per gigabyte, in each
          direction — a line item on the bill, not a hidden cost of "just turning on" availability.
        </>
      ),
      duration: 4.4,
      Visual: S.CrossAzCost,
      takeaway: 'Multi-zone redundancy is billed, not free: every byte that crosses a zone boundary for replication shows up on the bill.',
    },
    {
      title: 'A cell is a smaller blast radius than a whole region',
      body: (
        <>
          A cell-based design cuts a system into independent, fixed-size cells, each holding its own full application logic and storage, with a
          routing layer sending every client to its assigned cell. A bad deploy inside one cell stays inside that cell — the rest keep running.
        </>
      ),
      duration: 4.6,
      Visual: S.CellBlastRadius,
      takeaway: 'A cell-based design trades more operational surface for a blast radius bounded to one cell, not the whole region.',
    },
    {
      title: 'In one breath',
      body: (
        <>
          Zonal, regional or multi-zone: a property of the specific service, checked, not assumed. Cross-zone traffic for redundancy is billed. A cell
          bounds a failure below "the whole region." Next: what "regional" actually promises the instant after a write.
        </>
      ),
      duration: 3,
      Visual: S.Recap,
      takeaway: 'Before trusting a cloud service with your availability, ask which failure domain it actually promises to survive.',
    },
  ],
};

export default reel;
