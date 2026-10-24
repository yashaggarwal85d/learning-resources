---
title: "Self-describing page formats"
---

## Outcomes

- Measure, with a real, fixed-size page built as an explicit byte buffer, that an untouched page's own header fields round-trip exactly and that a real CRC32C checksum validates on it.
- Measure that a single corrupted byte anywhere in the page's own body is genuinely caught by the checksum, with no help from outside the page.
- Measure that a deliberately wrong magic number is caught as an invalid format, even though the checksum alone, recomputed over the changed bytes, still validates.
- Measure that the page's own encoding is explicitly little-endian, not whatever the platform happens to use.
- State, from PostgreSQL's own documentation, the page header's own fields and the item identifier's own permanence guarantee.

## Internals

The checksum field itself is zeroed before the checksum is computed over the rest of the page — an explicit, deliberate choice, not an accident of struct layout. That's exactly why a deliberately changed magic number, with the checksum honestly recomputed afterward, still validates: the checksum was never built to notice a consistent, intentional change, only an inconsistent, accidental one. The magic number and format version are checked together as a single format check, since the claim here is that a self-describing format carries both as one unit, distinct from the checksum entirely.

## In production

The `crc32c` crate is used specifically because `crc32fast`, the more commonly reached-for crate, implements plain CRC-32 (the IEEE polynomial), not CRC-32-Castagnoli, which is what the syllabus and PostgreSQL's own page format both name. The two algorithms produce different checksum values over identical bytes, so picking the wrong one would silently produce a checksum that looks plausible but doesn't match a real PostgreSQL-style page.

## The frontier

This topic's own page header writes a slot count field that none of its four measured claims exercise yet; it's declared here because the header's layout has to be fixed now, and it's put to direct use in the next topic's own slotted-page work. All four of this topic's own measured claims run entirely on an in-memory byte array, with no file, network, or root access needed.

## Where this goes next

A page that can describe itself — detect its own corruption, its own format, its own byte order — is the foundation. The next question is how a record inside that page keeps a stable identity while its own physical location can still change.
