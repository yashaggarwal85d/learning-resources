# Outline: de.variant-type-semi-structured

1. **Hook.** ANSI mode changed how existing types behave. This topic closes the section with a
   type that didn't exist before 4.x at all: VARIANT.
2. **Reveal: semi-structured data used to force a choice between two bad options.** A JSON
   string column is opaque text the engine re-parses on every read; an inferred struct breaks
   the moment a field's own type drifts row to row. [from]
3. **Predict: extracting one field from a JSON-string column, over and over. Faster, or
   slower, than extracting the same field from VARIANT?** [idx2]
4. **Reveal: slower, measured directly.** The JSON-string column re-parses the whole text on
   every extraction; VARIANT was already parsed once, into binary, when it was written.
5. **Elaborate: VARIANT is self-describing binary, not text.** A header byte per value and a
   shared field-name dictionary mean extraction is pointer arithmetic, not text parsing.
   [takeaway1]
6. **Predict: a field whose type varies row to row, cast into a fixed struct. Does every row
   survive, or does the mismatched one quietly disappear?** [idx5]
7. **Reveal: it quietly disappears, measured directly.** The struct cast turns the row whose
   field doesn't match the declared type into NULL; VARIANT extracts every row's own value
   correctly, whatever type it actually is.
8. **Elaborate: a struct forces one type per field before any data arrives.** The moment real
   data disagrees with that choice, something has to be lost -- VARIANT never has to make the
   choice. [takeaway2]
9. **Reveal: shredding is how VARIANT buys back the struct's own read speed, for the fields
   that earn it.** Promoting a hot field into its own typed Parquet column, without giving up
   VARIANT's tolerance for the rest -- GA'd in a later Spark release than every example this
   chapter runs against, so this one is sourced, not measured here.
10. **Recap.** [takeaway3]
