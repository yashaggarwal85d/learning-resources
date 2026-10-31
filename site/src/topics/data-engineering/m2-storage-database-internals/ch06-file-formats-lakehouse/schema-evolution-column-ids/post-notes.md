<section data-section="outcomes">

## Outcomes

Reproduce, directly on a real on-disk table in this sandbox, name- or position-based column
matching corrupting data after a rename-plus-insert — the identical schema change topic 3 showed
corrupting plain Parquet, now reproduced at the table level. Explain Iceberg's field IDs and
Delta's column mapping (`name`/`id` mode) and show the identical rename surviving correctly under
each, verified by field-ID projection and by byte-for-byte file comparison. State type widening,
default values, and nested-struct evolution as three further moves the same stable-ID mechanism
makes safe.

</section>

<section data-section="one-rule-two-formats">

## One identity, two formats

Iceberg and Delta solve the identical problem with the identical idea, aimed at two different
file layouts. Iceberg tags every column with a field ID the moment it's created, embedded
alongside the data itself, and a rename is required by the spec to change the name but never that
ID. Delta's files are ordinary Parquet with ordinary column names, so Delta keeps the stable
identity one layer up instead — a physical name recorded in the table's own metadata, separate
from whatever logical name a person sees. Either way, the fix is the same: stop trusting a name or
a position that a schema change can silently invalidate, and trust something that can't change
underneath you.

</section>

<section data-section="production">

## Production

**Column mapping is an irreversible, protocol-upgrading operation.** Enabling it on an existing
Delta table is a one-way migration, not a toggle — the table's protocol version moves forward and
cannot move back, which is exactly why this topic builds two separately constructed tables rather
than demonstrating a live migration.

**A stable identity is what makes every later schema change cheap.** Once a column's real
identity no longer depends on its name or its position, adding a column, widening its type, or
restructuring a nested field all become metadata edits instead of full-table rewrites — the same
guarantee this topic reproduces for a rename pays for all of them.

</section>

<section data-section="frontier">

## Frontier

The tables in `examples.py` are plain CSV text, not real Parquet, Iceberg, or Delta binary files —
disclosed in the script's own docstring. What transfers is the real mechanism: Iceberg's
field-ID-based projection and Delta's logical-to-physical name mapping, not either format's actual
on-disk layout or protocol-level metadata. This topic does not demonstrate type widening or
nested-struct evolution with real code — only rename, reorder, and add are reproduced on disk;
type widening and defaults are covered through Iceberg's own sourced default-value rules instead.
Delta's column mapping is documented as "currently experimental with known limitations" as of
Delta Lake 1.2.0+ — this topic treats it as Delta's real, current mechanism, not a claim it is
stable-forever or on by default.

</section>

<section data-section="where-this-goes-next">

## Where this goes next

A table's schema and its file list are both things a snapshot captures. The next question is how
far back in time a table lets you go to see an old one, and how it eventually forgets.

</section>
