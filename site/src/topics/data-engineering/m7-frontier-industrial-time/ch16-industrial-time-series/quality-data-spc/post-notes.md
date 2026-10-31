<section data-section="outcomes">

## Outcomes

Control limits and specification limits as two independent questions about the same measurement,
proven with one real inspection that is in control and out of spec at once. The Western Electric
zone rules' real false-alarm cost, measured by simulation and matched against NIST's own cited
figures of roughly 371 points for the three-sigma rule alone and roughly 91.75 once the zone
rules are added — and the further, separate cost of the eighth zone rule, disclosed rather than
folded into NIST's headline number. Cp and Cpk computed for a centred and an off-centre process
of identical spread, showing a high Cp paired with a low Cpk as a centring problem, not a spread
problem. A stratification that turns one out-of-control chart into two honestly in-control ones
once it's split by tool. And a real, executed schema for inspections, non-conformances and
CAPAs, each referencing the record before it by key.

</section>

<section data-section="lab">

## Lab

`examples.py` runs every measurement directly: a two-million-point Monte Carlo simulation of
standard-normal noise, flagging each Western Electric zone rule individually and in combination,
with the average run length asserted against NIST's own cited bands; a tool-stratification demo
comparing a mixed series against the same data split by tool; a Cp/Cpk demo on two synthetic
processes of identical spread; and a SQLite schema (lots, runs, inspections, non-conformances,
CAPAs) with one real inspection asserted to be simultaneously in control and out of spec, and a
CAPA record asserted to reference its non-conformance by key.

</section>

<section data-section="production">

## Production failures this topic warns about

**Turning off "noisy" rules instead of fixing the actual cause.** This topic's own "Prove it"
scenario is the production shape of the mistake: silencing the zone rules because they trip too
often doesn't make the remaining three-sigma rule any more or less trustworthy — it just removes
the zone rules' own, separate signals, including the real drifts they would have caught.

**Shipping a quality fact with no recipe version, tool or shift attached.** A measurement
recorded without its process context can be flagged as out of spec or out of control, but it can
never be stratified after the fact — the missing column is a decision made once, at ingest, that
no amount of later analysis can undo.

</section>

<section data-section="frontier">

## Frontier

Nelson's eight-rule superset of the Western Electric zone-and-trend tests is named here as a
historical fact: a 1984 *Journal of Quality Technology* column by Lloyd S. Nelson, cited by DOI,
but not quoted verbatim — the paper sits behind a publisher paywall with no legitimately
fetchable full text found anywhere, confirmed by a dedicated search (documented in
`FACT-CHECK.md`). Where this topic names Nelson's rules, it names their existence and general
shape, not their exact 1984 wording.

</section>

<section data-section="where-this-goes-next">

## Where this goes next

Quality asks whether the parts were good. The plant also asks how much of its time it was making
good parts at all. The next topic is OEE: availability, performance and quality, computed from
the machine-state events the sensors emit.

</section>
