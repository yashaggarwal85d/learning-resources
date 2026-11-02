<section data-section="outcomes">

## Outcomes

A small OPC UA address space browsed from an Object down to a Variable, reading its value, unit,
data type and a DataValue carrying two timestamps. A companion specification's own version and
date cited as the standardized-path example. A monitored item's absolute deadband measured against
plain polling of the same signal. Client/server's per-subscriber session cost contrasted with
PubSub's subscriber-independent message count. The MessageSecurityMode enumeration checked, with
None correctly flagged as a finding and the specification's own invalid default confirmed.

</section>

<section data-section="lab">

## Lab

`examples.py` builds a hand-written address space (`MachineTool → Monitoring → Spindle →
Speed`) using the hook's own example path, with typed references connecting each node and a
Variable carrying a data type and engineering unit. `absolute_deadband_fires` implements Part 4's
exact AbsoluteDeadband rule; `simulate_subscription` counts notifications against a synthetic
signal and confirms the deadband reports fewer than plain polling would, while a jump larger than
the deadband still fires. `client_server_session_cost` and `pubsub_message_cost` are compared at 1,
10 and 1000 subscribers, confirming PubSub's own message count stays flat while client/server's
scales. `is_security_finding` checks all four MessageSecurityMode values, confirming only None is
flagged and the specification's own INVALID default is not.

</section>

<section data-section="production">

## Production failures this topic warns about

**Treating a flat tag list as equivalent to a browsed model.** The hook is the production shape of
this failure: a tag list carries an address and nothing else, leaving a person to supply, by hand
and in a spreadsheet, exactly the name, type, unit and hierarchy a typed model would have carried
for free.

**Treating security mode None as an acceptable default instead of a finding.** A team that doesn't
check a server's configured MessageSecurityMode will miss that the specification's own default
exists specifically to force an explicit choice — None being set anyway is a decision someone made,
not a fallback the spec ever intended.

</section>

<section data-section="frontier">

## Frontier

No OPC UA server or client library was installed or run in this sandbox; the address space in
`examples.py` is a from-scratch structure matching the specification's own node/reference model, not
a live server. The OPC Foundation's "150+ companion specifications" count, named in CHAPTER.md's
own text, wasn't found at a stable, fetchable URL at research time and is not repeated here; this
topic cites one companion specification (OPC 40501-1) with its own independently verified version
and publication date instead.

</section>

<section data-section="where-this-goes-next">

## Where this goes next

OPC UA gives one machine a model and a way to subscribe. A plant has thousands of machines and many
consumers, and a model per connection doesn't scale to a message layer. The next topic is the
lightweight publish-subscribe layer most plants put above it: MQTT, the Sparkplug convention on top
of it, and the Unified Namespace.

</section>
