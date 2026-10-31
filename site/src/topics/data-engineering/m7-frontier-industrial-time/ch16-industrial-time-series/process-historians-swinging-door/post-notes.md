<section data-section="outcomes">

## Outcomes

A synthetic temperature series run through exception (deadband) filtering, then Bristol's own
swinging-door compression, with the compression deviation's error-band guarantee measured against
the original signal and the point count's reduction confirmed. A plain average over the stored
knees shown to disagree with the true time-weighted average on a signal shaped like the hook's own
claim (a long quiet hold, a short volatile excursion), and a time-weighted or fully interpolated
average shown to track the truth far more closely. A genuinely step-shaped series shown to need
step interpolation rather than a straight line. An extraction design that carries the compression
deviation and a recorded/interpolated flag forward with every value.

</section>

<section data-section="lab">

## Lab

`examples.py` builds three signals. The main signal (smooth ramps connecting flat holds)
demonstrates `exception_filter` (a deadband, plus an ExcMax ceiling on time between events) and
`SwingingDoor` (Bristol's own anchor/doors/knee mechanism), with `max_reconstruction_error` and
`rms_reconstruction_error` confirming the knees stay within the compression deviation while the
point count falls by more than 80 percent. A second, deliberately lopsided signal (a long quiet
hold, a short volatile excursion) demonstrates that `recorded_value_average` over the knees
disagrees sharply with `time_weighted_average`, while `interpolated_regular_average` tracks it
closely. A third, genuinely step-shaped signal confirms `step_interpolate` reads a value before a
step exactly, while linear `interpolate` badly misreads it. `extract_with_metadata` carries the
compression deviation and a recorded flag forward with every extracted point.

</section>

<section data-section="production">

## Production failures this topic warns about

**Averaging a historian's recorded rows as if every row represented the same amount of time.** The
hook is the production shape of this failure: a flat period compresses to a handful of knees and a
short excursion forces many, so an unweighted average silently over-represents the excursion.

**Extracting historian values without their compression metadata.** Once the compression deviation
and the recorded/interpolated flag are dropped, a later analyst has no way to tell a genuinely
measured point from one a query merely computed between two real ones.

</section>

<section data-section="frontier">

## Frontier

AVEVA's own PI Data Archive documentation pages (`docs.aveva.com`) are a client-rendered
single-page app and returned only an empty shell (413 characters of boilerplate) when fetched
directly in this sandbox, confirming CHAPTER.md's own planning note. Two AVEVA training workbook
PDFs and the 2023 conference deck are used instead, all with real, fetchable text. Bristol's
original 1990 ISA conference paper describing the swinging-door method could not be found at any
fetchable full-text URL; his own US Patent 4,669,097 (1987), describing the identical mechanism, is
used in its place and the substitution is disclosed. No AVEVA PI System or any other historian was
installed or run; `examples.py` implements the algorithm from its own described mechanics.

</section>

<section data-section="where-this-goes-next">

## Where this goes next

A historian and a broker both assume the plant can reach them. A WAN does not stay up. The next
topic is the edge gateway: how it buffers while the link is down, replays in order without
duplicates, filters locally, and corrects its clock when the link returns.

</section>
