<section data-section="outcomes">

## Computing a watermark's current value by hand

Take the maximum event time any batch has reported seeing so far, subtract the configured
delay threshold, and that is the watermark active one trigger later -- not the one active
during the batch that produced that maximum. Measured directly: a hand-rolled running maximum,
updated batch by batch and offset by the delay, matched Spark's own reported watermark at every
single batch of a real local query.

</section>

<section data-section="Predicting whether a specific late event is dropped">

## Predicting whether a specific late event is dropped

Lateness relative to the newest event seen is not the test. The test is whether the window
that event belongs to has already had its state cleared -- which happens exactly when the
watermark has advanced past that window's own end. The same lateness, arriving one trigger
earlier against a window still holding live state, is counted; arriving one trigger later,
against the identical window now evicted, it is dropped entirely.

</section>

<section data-section="production failures">

## When watermark state eviction surprises a running query

A query author who reasons about late data only in terms of "how far behind the newest event"
a record is will misjudge drops near a window boundary -- two records equally late by that
measure can land on opposite sides of an eviction, one kept, one gone, depending only on
which trigger they happened to arrive in.

</section>

<section data-section="frontier">

## Where this goes next

A watermark bounds state. The next topic is what actually accumulates inside that bound -- the
stateful operators and the output modes that decide what gets emitted and when.

</section>
