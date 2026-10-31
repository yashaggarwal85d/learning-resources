import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// The four specific reasons bucket replication alone is not DR, each demonstrated on real local
// files or real Fernet crypto (examples.py), plus a timed restore drill measured against an RTO
// target. Sources: AWS KMS multi-region keys, S3 Object Lock, Iceberg and Delta Lake's own
// metadata specs, and DORA's own resilience-testing page (ESMA).
const reel: Reel = {
  steps: [
    {
      title: 'Hook',
      body: (
        <>
          A company replicates its lakehouse bucket to a second region every night and calls that
          disaster recovery, until a real regional outage reveals the catalog database was never
          backed up at all. Every table's bytes survived. None of them point at anything usable.
        </>
      ),
      duration: 4.8,
      fig: 'the bytes replicated. the catalog did not.',
      Visual: S.Hook,
    },
    {
      title: 'Predict: are the replicated bytes enough?',
      body: (
        <>
          Every file from the primary bucket now sits in the secondary region too. Is the table
          safe?
        </>
      ),
      duration: 2.8,
      fig: 'if the bytes all replicated cleanly, is the table safe?',
      predict: {
        options: [
          { label: 'Yes -- the data is the table' },
          { label: 'No -- the table needs more than its data files', correct: true },
        ],
        explain: (
          <>
            A table is its data plus the metadata that finds it. Replicating only the bytes
            leaves out everything that turns bytes into a readable table.
          </>
        ),
      },
      Visual: S.PredictBytesEnough,
    },
    {
      title: 'Reveal: table metadata holds absolute paths',
      body: (
        <>
          An Iceberg or Delta manifest answers a file lookup with a fully qualified path. Copy
          the bucket without rewriting the manifest, and every path still points at a region that
          no longer has the file.
        </>
      ),
      duration: 4.8,
      fig: 'the manifest still points at the old region.',
      Visual: S.RevealManifestPaths,
    },
    {
      title: 'Reveal: the catalog is a separate system',
      body: (
        <>
          The catalog database -- which table maps to which manifest -- is not inside the bucket
          at all. A bucket replication job never touches it, so losing it loses every table even
          when every file is intact.
        </>
      ),
      duration: 4.8,
      fig: 'same files, same bytes -- but no catalog, no table.',
      takeaway: "A table's data can survive perfectly and still be unfindable, because the catalog that locates it is a different system.",
      Visual: S.RevealCatalog,
    },
    {
      title: 'Predict: does the key matter if the bytes already moved?',
      body: (
        <>
          The encrypted bytes made it to the secondary region. Does the encryption key need to
          move too?
        </>
      ),
      duration: 2.8,
      fig: 'the bytes replicated. did the key?',
      predict: {
        options: [
          { label: 'No -- the ciphertext is already there' },
          { label: 'Yes -- without the same key, the bytes are unreadable', correct: true },
        ],
        explain: (
          <>
            Ciphertext without its key is noise. A region-scoped key that never left the primary
            region makes every replicated byte permanently unreadable in the secondary one.
          </>
        ),
      },
      Visual: S.PredictKeyMatters,
    },
    {
      title: 'Reveal: encryption keys must be multi-region',
      body: (
        <>
          A region-scoped key fails to decrypt ciphertext anywhere outside its own region. A
          multi-region key is, by definition, the same key material in both places, and it
          decrypts the same ciphertext without issue.
        </>
      ),
      duration: 4.8,
      fig: 'same ciphertext. one key fails. one key works.',
      Visual: S.RevealMultiRegionKey,
    },
    {
      title: 'Reveal: immutable backups survive a compromised admin',
      body: (
        <>
          An attacker with stolen admin credentials can delete a regular backup outright. A
          compliance-mode WORM backup refuses that same delete, from that same admin, until its
          retention period actually expires.
        </>
      ),
      duration: 4.8,
      fig: 'stolen admin credentials delete one backup, not the other.',
      takeaway: 'Immutable backups exist for the moment someone with full, legitimate access is the attacker.',
      Visual: S.RevealImmutableBackup,
    },
    {
      title: 'Reveal: restore drills are the only proof',
      body: (
        <>
          An RPO or RTO target is a number on a page until a real restore is timed against it.
          DORA's own resilience-testing regime turns that drill from an occasional exercise into
          a standing, regulated obligation.
        </>
      ),
      duration: 4.8,
      fig: 'a number on a page, or a number from a real drill.',
      Visual: S.RevealRestoreDrill,
    },
    {
      title: 'Recap',
      body: (
        <>
          RPO and RTO set per tier, four separate reasons bucket replication alone is not DR,
          immutable backups against a compromised admin, and a timed drill as the only real
          proof any of it works.
        </>
      ),
      duration: 4.8,
      fig: 'four failure modes. one proof: a timed drill.',
      takeaway: "Bucket replication answers one of four questions a real disaster recovery plan has to answer.",
      Visual: S.Recap,
    },
    {
      title: 'Prove it',
      body: (
        <>
          This topic's own real local files and real Fernet keys: a manifest's absolute paths
          break after a region move and get fixed; a lost catalog makes intact files unfindable;
          a region-scoped key fails to decrypt where a multi-region key succeeds.
        </>
      ),
      duration: 2.8,
      fig: 'real files, real keys, real failures -- and real fixes.',
      predict: {
        options: [
          { label: 'The region-scoped key still decrypts it somehow' },
          { label: 'It genuinely fails, and only the multi-region key works', correct: true },
        ],
        explain: (
          <>
            The region-scoped key raises a real decryption error on the exact same ciphertext
            the multi-region key decrypts without issue. The failure is not theoretical.
          </>
        ),
      },
      Visual: S.ProveIt,
    },
  ],
};

export default reel;
