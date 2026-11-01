# Sources — de.semantic-integration-schemas-codes

## UCUM: The Unified Code for Units of Measure (purpose)

URL: https://ucum.org/ucum
Fetched: 2026-11-01.

Quotes:
> The purpose is to facilitate unambiguous electronic communication of quantities together with their units.

Items: why units need a named standard rather than free-text labels, named directly in the
reveal step on units, currencies and time zones.

## UCUM: The Unified Code for Units of Measure (one semantic element)

URL: https://ucum.org/ucum
Fetched: 2026-11-01.

Quotes:
> Every expression in The Unified Code for Units of Measure is mapped to one and only one semantic element.

Items: the unambiguous-mapping property CHAPTER.md's own clause names, named directly in the
same reveal step.

## Wikipedia: ISO 4217 (minor unit)

URL: https://en.wikipedia.org/wiki/ISO_4217
Fetched: 2026-11-01.

Quotes:
> provides information about the relationships between currencies and their minor units

Items: the minor-unit concept this topic's own `examples.py` measures directly (the integer-cents
bug), read from Wikipedia since iso.org itself returned HTTP 403 to a direct fetch, disclosed
here and in `REVIEW.md`.

## IANA: Time Zone Database (what it contains)

URL: https://www.iana.org/time-zones
Fetched: 2026-11-01.

Quotes:
> contains code and data that represent the history of local time for many representative locations worldwide

Items: what the database actually holds, named directly in the reveal step on units, currencies
and time zones.

## IANA: Time Zone Database (it changes)

URL: https://www.iana.org/time-zones
Fetched: 2026-11-01.

Quotes:
> is updated periodically to reflect changes made by political bodies to time zone boundaries

Items: the "rule set that changes" claim CHAPTER.md's own clause makes, named directly in the
same reveal step — why a local timestamp needs a version of the rules, not just a zone name.

## PostgreSQL 18 documentation: Date/Time Functions and Operators (AT TIME ZONE)

URL: https://www.postgresql.org/docs/18/functions-datetime.html
Fetched: 2026-11-01.

Quotes:
> Converts given time stamp without time zone to time stamp with time zone, assuming the given value is in the named time zone.

Items: the exact operator this topic's own `examples.py` uses directly to find a real DST
transition and convert a local wall-clock time correctly across it.

Note: Rahm and Bernstein's "A survey of approaches to automatic schema matching" is named only,
not quoted — the Springer page redirects to an institutional sign-in wall and its own secondary
mirror refused a direct fetch on a certificate mismatch, confirming CHAPTER.md's own plan-time
note that "the PDF route returned 404." This disclosed access barrier, and the secondary
summary used for the survey's own taxonomy, are recorded in `REVIEW.md`, not here, since no
additional URL was actually fetched.
