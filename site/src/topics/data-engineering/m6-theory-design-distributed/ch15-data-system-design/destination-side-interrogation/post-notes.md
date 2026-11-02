<section data-section="outcomes">

## Outcomes

The source interview said what goes into the pipeline. This topic is the consumer interview,
and it is the one that most changes the design. The first move is listing every consumer of a
dataset, not just the one who asked — a dashboard, a quality report, a maintenance model, and a
compliance filing can all read the same data, and each one can need its own serving store. The
sharp question — what do you do the moment you see the number — turns a vague freshness demand
into a concrete, checkable bound. An answer that is a guess about the future gets marked a bet,
never treated the same as an answer the consumer stated directly. Grain, concurrency, and
retention get asked before the model is built, not after the first dashboard needs one level
finer. And an export path — a CSV download, a BI extract — is a design input in its own right,
because it leaves the engine's own access policy behind the moment the data crosses it.

</section>

<section data-section="internals">

## Internals

None claimed independently here. This topic doesn't re-derive the design method's own answers
(topics 1-9) or the source-side interview (topic 10) — it teaches only the destination-side
questions and what each answer forks.

</section>

<section data-section="lab">

## Lab

Hosts the chapter's own §15.2 lab: role-play a fifteen-minute requirements interview for the
vague prompt "we want real-time dashboards for the plants," write down the five answers that
most change the design, and show the two designs they lead to (the chosen one is built in topic
24); topic 10's source questions are included in the interview. `examples.py`'s own lab:
`list_consumers()` and `serving_store_per_consumer()` show one dataset forking into several
stores; `bets_vs_facts()` separates a guess from a stated answer; `flag_export_paths()` marks
which paths bypass the engine's policy; `five_answers_that_change_design()` ranks the answers by
a stated weight.

</section>

<section data-section="production">

## Production failures this topic warns about

**A vague prompt read as a technical spec.** "Real-time dashboards" sounds like a requirement
but names nothing checkable — two engineers built two different, equally faithful designs from
the same six words. The fix is the sharp question: what does the person asking actually do the
moment they see the number.

**A bet mistaken for a fact.** Treating a guess about next year's load the same way as a stated
measurement produces a design that is confidently wrong about exactly the part nobody actually
knows yet.

</section>

<section data-section="frontier">

## Frontier

None claimed. A destination interview and critical-user-journey framing are established design
practice, not an emerging technique.

</section>

<section data-section="where-this-goes-next">

## Where this goes next

With the method and the questions in hand, the rest of the chapter runs them on real problems,
one decision at a time. The first is the largest data stream most companies own: clicks.
Clickstream and ad-click analytics at billions of events a day is the first worked design.

</section>
