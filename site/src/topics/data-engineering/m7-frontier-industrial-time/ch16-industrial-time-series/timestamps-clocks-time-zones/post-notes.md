<section data-section="outcomes">

## Outcomes

The three clocks named and distinguished by what each is good for: device closest to the
physical event, gateway the plant's own later clock, ingest steady but late. A backwards NTP
correction shown producing a genuinely out-of-order device timestamp between two readings taken
seconds apart, while the gateway and ingest clocks — never corrected mid-stream — stay in order
regardless. An instant stored once in UTC with its zone kept as a separate fact, rendered back
into the correct plant-local time and offset on demand. A shift calendar generated directly from
the tz database, rather than a fixed table, giving the right length for an ordinary night and for
each of the two clock-change nights. The shift-boundary bug from earlier in this chapter shown
reappearing in a new form: a fixed shift-length assumption divided into real output on the night
the shift actually ran short, producing a result above full output. And the event-time decision
recorded as its own column, not left for a later reader to infer.

</section>

<section data-section="lab">

## Lab

`examples.py` runs every computation directly: a synthetic fleet's device, gateway and ingest
timestamps checked for a constant, always-positive transit delay; a backwards NTP step
constructed between two readings and shown to put the second's device timestamp before the
first's while gateway and ingest stay ordered; a UTC instant stored with a separate zone and
rendered to the correct local time and offset; a shift calendar derived from the tz database for
an ordinary night, a spring-forward night and a fall-back night, giving three different lengths;
a hard-coded shift length divided into the real output on the short night, producing a result
over full output without that figure ever being asserted as a given; and the event-time decision
rule picking the device clock when disciplined and the gateway clock when drifted beyond
tolerance.

</section>

<section data-section="production">

## Production failures this topic warns about

**A shift-length table that is a fixed number instead of a calendar generated from the tz
database for the plant's own zone.** This topic's own DST reveal is the production shape of the
bug: the table is right on every ordinary day of the year and silently wrong on exactly the two
days a real clock change happens, which is precisely when nobody is likely to catch it by eye.

**Reporting an event time without recording which of the three clocks it came from.** A pipeline
that stores a single timestamp column with no record of its source leaves a later reader no way
to tell whether it trusted the device, the gateway, or neither, when something about that
decision later turns out to matter.

</section>

<section data-section="frontier">

## Frontier

IEEE 1588-2019 (the Precision Time Protocol) is named here only as the sub-microsecond
alternative to NTP this topic does not deploy; its abstract is quoted in `SOURCES.md`, but its
full specification text is a commercial document and not fetched or cited beyond that. Event-time
windows, watermarks and allowed lateness — what a streaming system does once it has decided which
timestamp is event time — belong to §9.2, not here.

</section>

<section data-section="where-this-goes-next">

## Where this goes next

Once a reading has a trustworthy time, the next problem is that the sensors do not sample on the
same grid. One reports every millisecond, another every ten seconds, another only when it
changes. The next topic is how to put such series onto a grid without inventing data.

</section>
