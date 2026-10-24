---
title: "Slotted pages and record identity"
---

## Outcomes

- Build a real slotted page as an explicit byte buffer: a slot array of (offset, length) entries, growing from just after the header, with tuple data growing from the end of the page downward.
- Measure that several variable-length records read back correctly through their own slot index alone.
- Measure that compacting the page after a deletion genuinely moves a surviving record's own physical offset, while that same record's own slot index never changes.
- Measure that reading a record by its slot index after compaction still returns the exact original content.
- Measure that a record too large for the page's own remaining free space is rejected cleanly, with every existing record left genuinely intact.
- State, from PostgreSQL's own documentation, the item identifier's own permanence guarantee, and why a fixed page size forces very large values to live somewhere else entirely.

## Internals

Slot indices are never reused or renumbered by `compact()` in this implementation; a freed slot's own index becomes permanently unavailable rather than being recycled — the simplest possible choice that still demonstrates the identity-versus-offset claim without introducing a separate free-slot-reuse policy as a second variable. The compaction measurement deliberately deletes the middle record of three, so that the surviving records on both sides of the gap both have their own physical offset genuinely changed by the compaction pass, rather than only one side moving.

## In production

This topic's own page never implements TOAST itself, out-of-line chunking, or overflow pages; it measures only that a too-large insert is rejected cleanly, and states PostgreSQL's own documented reason (a fixed page size) in prose. Building a real chunked, out-of-line store is a materially larger piece of work than this topic's own four measured claims, and PostgreSQL's own TOAST mechanism — compressing or splitting a large value into chunk rows in a separate table — is exactly that larger piece of work, done for real.

## The frontier

The implementation returns a plain `Option` from `insert()` rather than panicking or silently truncating the record, so a caller that doesn't check the inserted slot's own success cannot silently corrupt the page either. All four of this topic's own measured claims run entirely on an in-memory byte array, with no file, network, or root access needed, continuing the pattern from topic 48.

## Where this goes next

A record now has a stable logical identity, decoupled from wherever it physically sits. The next question is what it actually means to update that same record's own content — overwriting it in place, appending a new version elsewhere, or copying the whole page — and what each of those genuinely different choices costs.
