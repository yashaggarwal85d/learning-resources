import type { Reel } from '../../../../../reels/types';
import * as S from './scenes';

// No runnable system for this topic — CHAPTER.md's own "Lab" line states this section's own
// lab record-linkage half is skipped, so this topic teaches the four named styles and the
// match-merge pipeline's own shape, named and quoted from documentation rather than measured.
// No vendor-neutral primary architecture reference was reachable; Wikipedia's own named list is
// read secondary, backed by a vendor's own description, both disclosed in SOURCES.md.
const reel: Reel = {
  steps: [
    {
      title: 'Hook',
      body: (
        <>
          A customer exists in the CRM with one key and credit limit, and in the ERP with a
          different key and credit limit — and a report double-counts it.
        </>
      ),
      duration: 4.8,
      fig: "a customer exists in the CRM with one key and credit limit, and in the ERP with a different key and credit limit, and a report double-counts it.",
      Visual: S.Hook,
    },
    {
      title: 'Predict: does fixing this mean rewriting a source',
      body: (
        <>
          Does fixing a duplicate like this always mean rewriting the CRM's or the ERP's own
          data, or can a style fix it without touching either source?
        </>
      ),
      duration: 2.8,
      fig: "does fixing a duplicate like this always mean rewriting the CRM's or the ERP's own data, or can a style fix it without touching either source?",
      predict: {
        options: [
          { label: 'Fixing it always means rewriting at least one of the two sources directly' },
          {
            label: "A style can resolve it entirely outside both sources, by cross-referencing or consolidating them without changing either one",
            correct: true,
          },
        ],
        explain: (
          <>
            Two of the four styles this topic teaches — registry and consolidation — never
            write back to a source at all. The duplicate gets resolved in a separate layer, not
            inside the CRM or the ERP themselves.
          </>
        ),
      },
      Visual: S.Predict,
    },
    {
      title: 'Reveal: registry, a cross-reference with no master copy',
      body: (
        <>
          A registry cross-references keys across sources without changing them; no master copy
          exists anywhere, and sources stay authoritative.
        </>
      ),
      duration: 4.8,
      fig: 'a registry cross-references keys across sources without changing them; no master copy exists anywhere, and sources stay authoritative.',
      Visual: S.RevealRegistry,
    },
    {
      title: 'Reveal: consolidation, a golden copy for reporting',
      body: (
        <>
          Consolidation assembles a golden copy from the sources for reporting; the sources stay
          authoritative, and nothing is written back to them.
        </>
      ),
      duration: 4.8,
      fig: 'consolidation assembles a golden copy from the sources for reporting; the sources stay authoritative, and nothing is written back to them.',
      Visual: S.RevealConsolidation,
    },
    {
      title: 'Reveal: coexistence, synced both ways',
      body: (
        <>
          Coexistence keeps a master copy that is also synchronised back to the sources, which
          stay writable on their own.
        </>
      ),
      duration: 4.8,
      fig: 'coexistence keeps a master copy that is also synchronised back to the sources, which stay writable on their own.',
      Visual: S.RevealCoexistence,
    },
    {
      title: 'Reveal: centralised, the hub and only the hub',
      body: (
        <>
          A centralised, transactional hub is the only place master data is created or changed;
          sources consume it rather than write it.
        </>
      ),
      duration: 4.8,
      fig: "a centralised, transactional hub is the only place master data is created or changed; sources consume it rather than write it.",
      takeaway: 'The more control a style demands over writes, the less freedom it leaves a source to run its own business.',
      Visual: S.RevealCentralized,
    },
    {
      title: 'Reveal: the match-merge pipeline and its stewardship queue',
      body: (
        <>
          Standardise, match, merge by survivorship, publish — and whatever the rules can't
          resolve waits in a steward's own queue.
        </>
      ),
      duration: 4.8,
      fig: "standardise, match, merge by survivorship, publish — and whatever the rules can't resolve waits in a steward's own queue.",
      takeaway: 'A match-merge pipeline automates the easy matches; the queue exists because some pairs need a person to decide.',
      Visual: S.RevealMatchMerge,
    },
    {
      title: 'Reveal: the same entity across ERP and CRM',
      body: (
        <>
          The same customer, product or plant can sit in an ERP and a CRM at once; each style
          gives that pair a different kind of consistency.
        </>
      ),
      duration: 4.8,
      fig: 'the same customer, product or plant can sit in an ERP and a CRM at once; each style gives that pair a different kind of consistency.',
      Visual: S.RevealAcrossErpCrm,
    },
    {
      title: 'Recap',
      body: (
        <>
          Registry, consolidation, coexistence, centralised — four answers to who writes and
          where the master lives, plus the pipeline that builds one.
        </>
      ),
      duration: 4.8,
      fig: 'registry, consolidation, coexistence, centralised — four answers to who writes and where the master lives, plus the pipeline that builds one.',
      takeaway: 'Every style answers two questions differently: who may write, and where the one true copy lives.',
      Visual: S.Recap,
    },
    {
      title: 'Prove it',
      body: (
        <>
          A company wants every order system to keep writing its own orders, with no new system
          of record, but still wants one de-duplicated customer list for reporting.
        </>
      ),
      duration: 2.8,
      fig: 'a company wants every order system to keep writing its own orders, with no single new system of record, but still wants one queryable, de-duplicated customer list for reporting. Which style fits?',
      predict: {
        options: [
          { label: 'Centralised, since only a single hub can guarantee one de-duplicated list' },
          {
            label: 'Consolidation, since it assembles a golden, de-duplicated copy for reporting without requiring any source to give up its own writes',
            correct: true,
          },
        ],
        explain: (
          <>
            Centralised demands exactly what this team ruled out: giving up writes everywhere
            else. Consolidation produces the one clean reporting copy this team actually wants,
            while every order system keeps writing exactly as it already does.
          </>
        ),
      },
      Visual: S.ProveIt,
    },
  ],
};

export default reel;
