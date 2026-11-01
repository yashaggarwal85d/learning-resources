<section data-section="outcomes">

## Predicting which expressions change behavior under ANSI mode

Any expression whose result could be invalid under the ANSI standard -- an arithmetic overflow,
a cast that can't succeed, a division by zero -- changes behavior: measured directly, each one
raises a real exception with ANSI mode on, where it silently returned NULL or a wrapped value
with ANSI mode off. An expression with no such invalid case (a cast between genuinely
compatible types, arithmetic that can't overflow its type's range) behaves identically either
way.

</section>

<section data-section="Rewriting a NULL-swallowing expression with try_*">

## Rewriting a NULL-swallowing expression with try_*

Where the error path really is acceptable -- a cast you expect to sometimes fail, an addition
you're fine seeing come back empty -- the fix isn't turning ANSI mode off everywhere. It's
swapping the ordinary operator or `CAST` for its `try_*` equivalent (`try_cast`, `try_add`,
`try_divide`, and the rest). Measured directly: `try_cast` and `try_add` return NULL on exactly
the inputs that raise under the plain operator, even with ANSI mode on -- one expression opting
back into the old behavior, without reopening it for the whole query.

</section>

<section data-section="production failures">

## What silently broke for a 3.5 job ported onto 4.x

A job that ran clean on 3.5, full of unguarded casts and arithmetic nobody double-checked for
overflow, doesn't fail to compile on 4.x -- it fails at runtime, the first time one of those
expressions hits a bad value that 3.5 would have quietly turned into NULL. The failure mode
isn't a wrong answer; it's a query that used to finish and now stops.

</section>

<section data-section="frontier">

## Where this goes next

ANSI mode changed the meaning of expressions Spark already had. The next topic closes this
section, and the chapter's engine-internals material, with something that didn't exist before
4.x at all: a type built for semi-structured data.

</section>
