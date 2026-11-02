<section data-section="outcomes">

## Outcomes

List Iceberg v3's spec features (deletion vectors, row lineage, Variant, geometry/geography,
nanosecond timestamps, the `unknown` type, column default values, multi-argument transforms,
table encryption keys) and connect each to where this chapter already taught it. State what a
v2-only reader actually does when it meets each v3 feature (ignore, default to null, or fail).
Name engine support lag, with a current real engine's own account, as the actual constraint on
adopting v3 today.

</section>

<section data-section="one-version-eight-features">

## Eight features, one version bump

The spec states each addition plainly, one at a time — "Deletion vectors are added in v3,"
"Support for Variant is added in Iceberg v3," "In v3 and later, an Iceberg table must track row
lineage fields." Read separately, across separate topics, that reads like eight unrelated ideas.
Named together, it's one coordinated version bump — and three of its eight features were already
built, concretely, earlier in this chapter, before this topic ever named the revision itself.

</section>

<section data-section="production">

## Production

**An old reader's behavior depends on whether the field is required.** The spec is precise:
"Tables with initial-default will be read correctly by older readers if initial-default is always
null for optional fields. Otherwise, old readers will default optional columns with null. Old
readers will fail to read required fields which are populated by initial-default." That's three
distinct outcomes for one feature, not one.

**Engine support lag, not the spec, is the real constraint.** The spec itself is finished. A real,
dated vendor announcement names exactly three of v3's eight features as supported in its managed
tables today — deletion vectors, row lineage, Variant — leaving the other five unmentioned. That
gap, not anything missing from the written specification, is what actually gates adoption.

</section>

<section data-section="frontier">

## Frontier

Both real demonstrations in `examples.py` are measured, not asserted from documentation: a real
`pyiceberg` (0.12.0) `create_table` call with `format-version: 3` raises a real, caught
`NotImplementedError` naming a real open upstream issue; a v3-spec default value is added to an
ordinary v2-format table and read back correctly on both sides of the fallback (an old row gets
the default, a new row keeps its own value) — a genuine instance of a widely used v2
implementation running ahead of the version boundary the spec itself draws, disclosed plainly
rather than treated as settled. No v3 table is built anywhere in this sandbox. Geometry/geography,
nanosecond timestamps, the unknown type, multi-argument transforms, and table encryption keys are
named from the spec's own text, not exercised in any form.

</section>

<section data-section="where-this-goes-next">

## Where this goes next

A table's column statistics (topic 21's manifests) are per-file. The next topic is statistics
kept at the whole-table level instead: Iceberg's Puffin files.

</section>
