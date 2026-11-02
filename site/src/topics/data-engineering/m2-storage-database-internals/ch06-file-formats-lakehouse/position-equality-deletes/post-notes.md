<section data-section="outcomes">

## Outcomes

Write a real v2 position-delete file (file path + row ordinal) and a real equality-delete file
(matching on column values, as a streaming upsert writer like Flink would produce) against the
same table in this sandbox, and read both back correctly. Measure the real read-side join cost an
equality delete imposes versus a position delete's direct offset lookup. Explain why v3 replaces
position-delete files with the deletion vectors topic 15 already built, and why the v4 drafts go
further and forbid new equality deletes.

</section>

<section data-section="two-kinds-one-reason">

## A lookup and a join, both called a delete

The spec names the two mechanisms side by side: a position delete marks a row "by data file path
and the row position in the data file," while an equality delete marks it "by one or more column
values, like id = 5." Both are called deletes, and both are v2 features, but they cost
fundamentally different amounts to read — this topic measures that gap directly rather than
asserting it.

</section>

<section data-section="production">

## Production

**A streaming upsert writer produces equality deletes because it has no position to give.**
Flink's own docs describe UPSERT mode writing against a v2 table on a primary key — the writer
never reads the file it's logically updating, so it can't name a row's position inside it. An
equality delete lets it say what changed without ever opening that file.

**The read-side cost is real, and it's exactly why the format moves away from it.** Every
candidate row's own column value has to be pulled and compared against an equality delete's
values — a real join, not a lookup. v3 replaces position delete files with deletion vectors
(cheaper still than either delete-file kind), and v4 drafts forbid writing any new equality
delete at all. `convertEqualityDeletes()`, named in Flink's own docs, migrates existing ones to
deletion vectors once a table reaches v3.

</section>

<section data-section="frontier">

## Frontier

Both delete files here are real, built with the real `pyiceberg` library's low-level `DataFile`/
`ManifestEntry` primitives against a real table — not a simulation. The position delete is read
back through pyiceberg's own public `table.scan()`, verified correct. The equality delete hits a
genuine, disclosed limitation: pyiceberg 0.12.0's own `table.scan()` refuses to read any table
carrying one, citing a real open upstream issue. The join demonstrated here was performed by
hand, reading both files directly, the way a conformant v2 reader actually works — disclosed in
the script's own docstring and FACT-CHECK.md's red-team section. Only a single-column equality
delete is built; a multi-column `AND` delete and the stored-row-values feature are named but not
executed.

</section>

<section data-section="where-this-goes-next">

## Where this goes next

Both delete mechanisms here are v2 features. The next topic is v3 as a whole: the full set of
spec features, deletion vectors among them, that replace or extend v2's own design.

</section>
