import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// Every number here is computed and asserted in examples.py: rotating the KEK over fifty blocks
// touches zero of them; a compromised DEK forces re-encrypting all fifty; deleting one customer's
// key out of ten leaves exactly one in ten blocks unreadable, every other customer fully intact.
const reel: Reel = {
  steps: [
    {
      title: 'Hook',
      body: (
        <>
          A data key for last quarter's customer files leaks from a log line. Security says "we
          rotate keys every year, so it's fine."
        </>
      ),
      duration: 4.8,
      fig: 'a data key, leaked. "We rotate yearly, so it\'s fine."',
      Visual: S.Hook,
    },
    {
      title: 'Predict: rotate, re-encrypt, or delete?',
      body: (
        <>
          Separately, legal wants one customer's data made unrecoverable everywhere, backups
          included. Which operation actually answers the leak, and which answers legal's request?
        </>
      ),
      duration: 4.8,
      fig: 'one leak, one erasure request. Which operation, for which?',
      predict: {
        options: [
          { label: 'Rotating the KEK fixes the leak; re-encrypting handles the erasure' },
          { label: 'Re-encrypting under a new key fixes the leak; deleting a key handles the erasure', correct: true },
        ],
        explain: (
          <>
            Rotation only re-wraps the key — it does nothing once the key itself has leaked. Only
            re-encrypting the data under a fresh key closes that hole. And deleting a key, not
            re-encrypting anything, is what makes everything under it unrecoverable at once.
          </>
        ),
      },
      Visual: S.Predict,
    },
    {
      title: 'Reveal: the DEK/KEK hierarchy — what the KMS actually sees',
      body: (
        <>
          A data encryption key encrypts the data itself, locally. A key encryption key, held in
          the KMS, only ever wraps and unwraps that small key. The data never reaches the KMS at
          all.
        </>
      ),
      duration: 5.2,
      fig: 'the KMS wraps a key. It never sees the data.',
      Visual: S.RevealHierarchy,
    },
    {
      title: 'Reveal: rotation versus compromise',
      body: (
        <>
          Rotate the KEK, and it re-wraps every key beneath it — zero data blocks touched. But a
          leaked key is a different problem: rotation can't fix it. Only encrypting under a fresh
          key does, and that means re-encrypting every block that key protected.
        </>
      ),
      duration: 5.6,
      fig: 'rotation: zero blocks touched. A leak: every block, re-encrypted.',
      takeaway: 'Rotation protects nothing a leaked key has already exposed — only re-encryption does.',
      Visual: S.RevealRotationVsCompromise,
    },
    {
      title: 'Reveal: customer-managed, BYOK, external — a control-versus-availability scale',
      body: (
        <>
          Provider-managed gives up the most control for the least operational burden. Hold your
          own key entirely outside the provider, and you have the most control — but now its
          outage is your outage too.
        </>
      ),
      duration: 5.2,
      fig: 'more control, every step, costs more availability risk.',
      Visual: S.RevealControlScale,
    },
    {
      title: 'Reveal: TLS and mTLS — the wire, not the disk',
      body: (
        <>
          TLS's own stated goal is a secure channel between two peers — nothing about what happens
          to data once it's written down, and nothing about either endpoint itself.
        </>
      ),
      duration: 4.8,
      fig: 'a secure channel, peer to peer. Nothing about the disk.',
      takeaway: 'TLS protects data in motion between two peers; it says nothing about data at rest.',
      Visual: S.RevealTlsMtls,
    },
    {
      title: 'Reveal: client- versus server-side — down to the file',
      body: (
        <>
          Iceberg encrypts and tamper-proofs its data, delete and manifest files before they ever
          reach storage. Parquet wraps a data key under a master key, per file or per column — the
          same envelope shape, one layer down.
        </>
      ),
      duration: 5.2,
      fig: 'the same wrap-a-key shape, down at the file format.',
      Visual: S.RevealClientServerSide,
    },
    {
      title: 'Reveal: key deletion as crypto-shredding',
      body: (
        <>
          Destroy a key, and everything it ever encrypted is unreadable everywhere — no byte of
          the data itself touched. The granularity of the key is the granularity of what gets
          erased.
        </>
      ),
      duration: 5.2,
      fig: 'one key, destroyed. Everything under it, unreadable, everywhere.',
      takeaway: 'Key deletion erases exactly what that key protected — never more, never less.',
      Visual: S.RevealCryptoShredding,
    },
    {
      title: 'Recap',
      body: (
        <>
          A DEK encrypts data; a KEK wraps the DEK, and that's all the KMS ever sees. Rotation
          doesn't fix a leak; re-encryption does. More key control costs more availability risk.
          TLS guards the wire, not the disk. Deleting a key erases exactly what it protected.
        </>
      ),
      duration: 5.6,
      fig: 'wrap, rotate, control, wire versus disk, delete to erase.',
      Visual: S.Recap,
    },
    {
      title: 'Prove it',
      body: (
        <>
          A DEK leaks from a log line. The KEK that wrapped it has been rotated twice since. Is
          the data still exposed?
        </>
      ),
      duration: 4.4,
      fig: 'rotated twice since the leak. Still exposed?',
      predict: {
        options: [
          { label: 'No — two rotations since the leak have closed the hole' },
          { label: 'Yes — the leaked key itself still unwraps the data, rotation or not', correct: true },
        ],
        explain: (
          <>
            Rotation only changes which KEK wraps the DEK — it never changes the DEK itself or
            touches the data. The leaked DEK still decrypts every block it ever protected, no
            matter how many times the KEK above it has rotated. Only re-encrypting under a fresh
            DEK closes this.
          </>
        ),
      },
      Visual: S.ProveIt,
    },
  ],
};

export default reel;
