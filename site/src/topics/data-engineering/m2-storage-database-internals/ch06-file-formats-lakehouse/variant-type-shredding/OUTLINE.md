# Outline — de.variant-type-shredding

1. **Hook.** 6 real click/scroll events, 4 distinct shapes, one field (`button_id`) that's an
   int32 in most records and a string in one — semi-structured, not uniform.
2. **Predict: can one fixed struct schema (`event_type` string, `button_id` int32) hold every
   record without losing data?**
3. **Reveal: 3 of 6 records lose a field when forced into that struct** — the scroll event's only
   real field has nowhere to go, and `button_id: "unknown"` is silently dropped, not just nulled.
4. **Reveal: the Variant binary encoding stores every record correctly** — a real metadata
   dictionary + per-record value encoding, built to the spec's own byte layout, round-trips all 6
   records byte-for-byte.
5. **Predict: does querying `event_type` mean decoding the whole Variant value every time?**
6. **Reveal: shredding pulls `event_type` and `button_id` into typed columns** — 3 records fully
   shredded (nothing left over), 2 partially shredded (a real residual field stays in `value`), 1
   fallback (`button_id`'s string value can't be the int32 column, so it stays in `value` too).
7. **Reveal: a query on `event_type` never touches the residual `value` column** — it's a string in
   all 6 records, so it's always shredded; filtering never needs the Variant binary at all.
8. **Reveal: measured size — Variant unshredded vs. JSON-string vs. shredded typed columns.**
9. **Reveal: the struct's silent data loss, side by side with the Variant's byte-exact round
   trip.**
10. **Recap.**

Predicts at steps 2 and 5 (first four / within range per QUALITY.md). Takeaways at steps 4, 7, 9 —
none immediately after a predict step (3 and 6 are reveals with no takeaway tag, 4 and 7 carry
the takeaways instead).
