# Outline: de.ansi-mode-3x-4x-migration

1. **Hook.** Every example run so far in this chapter ran on Spark 4.x, with ANSI mode already
   on. This topic is the thing that changed to make that true.
2. **Reveal: ANSI mode flips the default answer to "what happens on a bad value."** Overflow, a
   bad cast, or a division by zero now raise an error instead of silently returning NULL. [from]
3. **Predict: an int overflow (`2147483647 + 1`), ANSI mode on. Raises an error, or wraps to a
   negative number?** [idx2]
4. **Reveal: raises `SparkArithmeticException`, measured directly.** Same expression with ANSI
   off wraps to a negative number instead -- the pre-4.0 default.
5. **Elaborate: store assignment is a separate knob from the operator itself.** Casting on
   insert follows its own ANSI rule, independent of `spark.sql.ansi.enabled`. [takeaway1]
6. **Predict: casting the string `'a'` to INT, ANSI mode on. Raises an error, or returns NULL?**
   [idx5]
7. **Reveal: raises `CAST_INVALID_INPUT`, measured directly.** With ANSI off, the same cast
   returns NULL instead.
8. **Elaborate: `try_cast`, `try_add`, `try_divide` bring NULL-on-error back on purpose.** They
   let one expression opt out of ANSI's error path without turning the setting off everywhere.
   [takeaway2]
9. **Reveal: porting an older job means finding every expression ANSI mode now treats differently.**
   The migration method is mechanical: run the same suite in both modes, diff the outputs, then
   audit every implicit cast the diff turns up.
10. **Recap.** [takeaway3]
