# Sources

## AVEVA: "Exception, Compression, and their Impacts on PI System Performance" (2023 conference deck)

URL: https://cdn.osisoft.com/osi/presentations/2023-AVEVA-San-Francisco/UC23NA-3PGK04-AVEVA_Bregenzer_Brent-Exception-Compression-and-their-Impacts-On-PI-System-Performance.pdf
Version: AVEVA World San Francisco 2023, presenter Brent Bregenzer, retrieved 2026-10-31

> Simple deadband to filter noise

> Reduces events sent to Data Archive Snapshot

> Conserves network bandwidth

> Use "swinging door" algorithm to eliminate data that can safely be recreated with interpolation

> "The goal is to filter out instrument and process noise and still record significant process changes."

> Out of order (OOO) data bypasses compression.

> Set CompDev <= Instrument precision

> Set ExcDev = ½ CompDev

Contents: the exception (deadband) filter and swinging-door compression definitions this topic
teaches directly, the out-of-order-bypasses-compression rule `examples.py`'s own compression
function assumes, and the ExcDev-well-below-CompDev recommendation this topic's deadband-then-compress
pipeline follows.

## Bristol, US Patent 4,669,097, "Data compression for display and storage" (the swinging door method)

URL: https://patents.google.com/patent/US4669097A/en
Version: granted 2 June 1987 (inventor Edgar H. Bristol), retrieved 2026-10-31

> two segments UB and LB are constructed from the upper and lower pivots U(1) and L(1) to point B. These are the swinging doors that pivot on the offset points U(1) and L(1).

> when the doors would be opened wider than parallel, an end point for the current trend sequence is calculated. More specifically, an end point condition is recognized when the extreme boundary condition for the boundary being expanded would exceed the extreme boundary condition for the opposite boundary.

Contents: the swinging-door mechanics this topic implements in `examples.py` from the description —
an anchor point, two doors (upper and lower slope bounds) that open as new points arrive, and a
knee recorded exactly when the doors can no longer stay parallel. This is Bristol's own patent, the
primary source for the algorithm named in CHAPTER.md and in the AVEVA deck above; the original 1990
ISA National Conference paper ("Swinging Door Trending: Adaptive Trend Recording?") could not be
found at a fetchable full-text URL at research time, so the patent — the same inventor's own
technical description of the same method, granted three years earlier — is used instead and
disclosed as the substitute.

## AVEVA: "PI DataLink: Basics" (training workbook)

URL: https://osicdn.blob.core.windows.net/learningcontent/Online%20Course%20Workbooks/PI%20DataLink%20Basics.pdf
Version: AVEVA Learning, retrieved 2026-10-31

> The Compressed Data function returns all the data that had been archived for the data item of interest. Time intervals between the compressed data values are uneven and depend on when the data was received and archived by the PI System.

> Sampled Data retrieves evenly spaced interpolated values from the archive.

> The Compressed Data function retrieves the actual archived data from the Data Archive.

Contents: the recorded-value-retrieval (Compressed Data: the actual, unevenly spaced archived
points) versus interpolated-value-retrieval (Sampled Data: evenly spaced, computed) distinction
this topic's extraction design is built on.

## AVEVA: "Calculations and Asset Analytics" (training workbook)

URL: https://osicdn.blob.core.windows.net/learningcontent/Online%20Course%20Workbooks/Calculations%20and%20Asset%20Analytics.pdf
Version: AVEVA Learning, retrieved 2026-10-31

> Average (time-weighted), Count, Delta, Maximum, Minimum, Population Standard Deviation, Standard Deviation, Start Time, End Time, Total.

Contents: confirms the PI Data Archive's own By Time Range summaries offer a time-weighted average
as a distinct aggregation, separate from an unweighted average over whatever points happen to be
stored — the basis for this topic's claim that averaging recorded (compressed) points directly is
not the same calculation.

## Disclosed: AVEVA's own PI Data Archive documentation pages could not be fetched

URL: (none)

CHAPTER.md's own planning text anticipated this: "the AVEVA documentation pages are client-side
rendered and could not be fetched at planning." Confirmed again at research time —
`docs.aveva.com/bundle/pi-server-data-archive/page/1021639.html` returns only an empty single-page-app
shell (413 characters of boilerplate, no article text) when fetched directly. The four sources
above (the 2023 conference deck, Bristol's own patent, and two AVEVA training workbooks, all
PDFs with real fetchable text) are used instead and cover every claim CHAPTER.md's scope line
asks for.

## Disclosed: the original 1990 Bristol ISA paper could not be located online

URL: (none)

CHAPTER.md asks for "Bristol's swinging-door trending as published (to be located and cited from
the original, not from a secondary page)." The original paper, "Swinging Door Trending: Adaptive
Trend Recording?" (ISA National Conference Proceedings, 1990, pp. 749-754), was not found at any
fetchable full-text URL at research time — it predates open digital publishing and appears only in
print proceedings and paywalled citation indexes. Bristol's own US Patent 4,669,097, granted three
years earlier and describing the identical mechanism in his own words, is used in its place (above)
as the closest available primary source, and this substitution is disclosed rather than citing a
secondary summary as if it were the original paper.
