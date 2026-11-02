<section data-section="outcomes">

## Outcomes

Read a real `_delta_log` directory built in this sandbox and reconstruct table state by hand from
its ordered JSON commits. Read a real Parquet checkpoint, written via pyarrow, and verify it
against an independent replay. Explain `_last_checkpoint`, log compaction, and version checksum
files, with a real example of each. Contrast the older numeric protocol reader/writer versions
with the current named-table-features model, on a real upgrade.

</section>

<section data-section="deep-dive">

## Deep-dive

Everything here rests on one rule, stated directly in the spec: a snapshot is computed by
replaying commits in ascending version order, and for file actions specifically, the newest
reference for each `(path, deletionVector.uniqueId)` key wins. An `add` and a `remove` can never
both be live for the same key at once — that's what makes "replay everything, keep the last
word" produce a single, unambiguous answer instead of a contradiction. A checkpoint changes
nothing about that rule; it's simply the rule's own output, computed once and written down, so a
reader doesn't have to run it from the start of time. That's why checking a checkpoint against an
independent replay is the right test of correctness: if they disagree, the checkpoint is wrong,
full stop — there's no sense in which a checkpoint is allowed to encode anything the raw log
wouldn't also produce.

</section>

<section data-section="production">

## Production

Protocol version upgrades are irreversible and can break existing readers or writers, which is
exactly why Delta's own documentation treats them with real weight: upgrade only when a specific
feature is actually needed, and verify every system touching the table supports the new protocol
first. Table features exist precisely to make this safer than the old bundled numeric versions
were — a table can now declare exactly the capabilities it actually uses, rather than forcing
every client up to the newest version bundle just to get one new feature.

</section>

<section data-section="frontier">

## Frontier

Not built here, named only: multi-part checkpoints (which the spec itself marks deprecated) and
UUID-named V2 checkpoints with sidecar files in `_delta_log/_sidecars`. Also disclosed directly:
no `deltalake`/`delta-rs` library is used anywhere in this topic's script — every file on disk is
written and read by hand against the protocol's own documented rules, which is a disclosed,
from-scratch build, not a claim that it matches Delta's reference implementation byte-for-byte.

</section>

<section data-section="next">

## Where this goes next

A JSON log entry is only a real commit once it's written atomically as the next version number.
The next topic is exactly how Delta makes that atomic today, and where its catalog-managed-tables
story is heading.

</section>
