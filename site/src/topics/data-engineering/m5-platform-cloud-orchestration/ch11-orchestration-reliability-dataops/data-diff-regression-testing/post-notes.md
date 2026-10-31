<section data-section="outcomes">

## Outcomes

By the end of this topic you can: implement a full join-diff and a checksum-bisection diff over identical old/new outputs and compare their cost; set a defensible float/timestamp tolerance and show it suppresses noise without hiding a real regression; produce a column-level change summary from a planted single-column bug; estimate diff cost at scale from a measured curve.

</section>

<section data-section="internals">

## Internals

datafold/data-diff's own documentation names the two strategies this topic reproduces: a same-database diff that "uses an outer-join to diff the rows as efficiently and accurately as possible," and a cross-database diff that "employs a divide and conquer algorithm based on hashing, optimized for few changes," where it "splits the table into smaller segments, then checksums each segment in both databases" and, when a segment's checksums disagree, "will further divide that segment into yet smaller segments" until it reaches the actual differing rows. The two checksums being compared have to be computed identically on both sides -- the same columns, the same serialization -- or the technique produces false mismatches that have nothing to do with the data. PostgreSQL's own documentation is explicit that the underlying need for a tolerance band isn't a bug in any one tool: "comparing two floating-point values for equality might not always work as expected," because `real` and `double precision` are "inexact, variable-precision numeric types." This topic's own cost curve deliberately holds the absolute number of real changes fixed while growing the table, not the rate of change -- a fixed rate would let the number of real changes grow with the table too, hiding exactly the advantage the curve is meant to show.

</section>

<section data-section="lab">

## Lab

A full join-diff and a checksum-bisection diff run against the same old/new `fct_orders`, with a single planted column regression touching a small fraction of rows: both strategies land on exactly the same set of changed rows, with bisection scanning a fraction of what the join-diff scans. A separate run shows a tolerance band doing its real job: a harmless float-summation-order difference passes clean while an actual planted regression, run through the same comparison, is still caught. A column-level summary built from that same planted bug names the one column that moved, how many rows it touched, and the size of the move. Finally, a measured cost curve holds the number of real changes fixed and grows the table underneath them: the full join-diff's cost scales exactly with table size, while checksum bisection's relative advantage over it keeps widening as the table grows.

</section>

<section data-section="production">

## Production

The hook's real lesson isn't that the rounding fix was wrong -- it's that an equality-based diff and a column-level diff can both describe the exact same true fact, and only one of them is actually something a reviewer can act on. A diff tool that reports "N rows differ" without naming a column is answering a question nobody asked.

</section>

<section data-section="frontier">

## Frontier

This topic's technique runs against a plain schema copy of `fct_orders`, not a true zero-copy clone or branch -- that mechanism is this chapter's one skipped syllabus entry, and a schema copy can drift from production between when it is taken and when the diff actually runs, a gap a true zero-copy branch closes. What schedules this diff selectively, rather than running it in full on every single pull request, is the next topic's subject. This topic's join-diff, bisection diff and planted bug also become part of the fixed baseline the chapter's own scorecard later measures against.

</section>

<section data-section="where-this-goes-next">

## Where this goes next

Running this diff on every single pull request, against every model in a large project, is more compute than most teams can afford. Running it selectively, only where a change could actually reach, is the next topic.

</section>
