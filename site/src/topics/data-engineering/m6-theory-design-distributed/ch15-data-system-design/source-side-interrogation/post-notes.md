<section data-section="outcomes">

## Outcomes

The method so far assumed requirements were already known. This topic is where that assumption
gets tested. A fifteen-question source interview, run across six dimensions, records every
answer as a measurement, a flagged adjective, or an explicit unknown — never a silent
assumption. The answers feed three places directly: rate, peak, and growth feed the estimate;
push or pull feeds the shape decision; late, duplicate, lost, and resend behavior feed the
correctness plan. A contract's own stated status and version fields turn "how much notice do I
get" into a checkable answer. An event id, not a timestamp, is the dedup key, because a resend
doesn't always carry a fresh id and two distinct events can share a timestamp. And a question
the source can't answer — a quota, a residency rule — is itself the most useful answer in the
interview: it names the hidden constraint before production does.

</section>

<section data-section="internals">

## Internals

None claimed independently here. This topic doesn't re-derive the design method's own answers
to these questions (topics 1-9) — it teaches only the questions themselves and what each
answer feeds.

</section>

<section data-section="lab">

## Lab

None of its own as a syllabus lab leg — the interview lab is topic 11's. This topic's own worked
example is the source checklist applied to the shop's payments partner, with the five
highest-impact answers computed into estimate changes. `examples.py`'s own lab:
`run_interview()` records every question as measured, adjective, or unknown; `unanswerable()`
and `adjectives_to_flag()` pull out the red flags; `estimate_inputs()`, `shape_decision()`, and
`correctness_plan()` show exactly where each answer lands; `connector_growth_cost()` prices the
maintenance cost of each additional source.

</section>

<section data-section="production">

## Production failures this topic warns about

**An adjective mistaken for a measurement.** "Real time" sounds like a guarantee but states
nothing checkable — not how fast, not measured how, not how often it slips. The fix is asking
for the number: a measured delay over a stated window.

**A resend keyed on a timestamp instead of an id.** Two distinct events can share a timestamp,
and a resend doesn't always arrive with a fresh id — keying deduplication on the clock produces
silent duplicates exactly where the design assumed it was safe.

</section>

<section data-section="frontier">

## Frontier

None claimed. A source interview and measurement-over-adjective are established design practice,
not an emerging technique.

</section>

<section data-section="where-this-goes-next">

## Where this goes next

The source interview says what goes into the pipeline. The consumer interview says what has to
come out, and it is the one that most changes the design: who reads it, how fresh, how often,
how big a query, who may see which part. That is the destination side, next.

</section>
