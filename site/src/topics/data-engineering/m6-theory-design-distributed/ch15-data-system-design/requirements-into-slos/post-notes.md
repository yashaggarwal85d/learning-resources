<section data-section="outcomes">

## Outcomes

The shop's ask, "real-time, accurate revenue on the executive dashboard," resolves through five
fixed questions into one concrete freshness SLO: fifteen minutes of maximum staleness, measured
on the dashboard's own displayed total, with a stated consequence on a miss. The six-dimension
checklist (freshness, latency, completeness, correctness, availability, retention), run against
the same ask, finds that freshness and latency got real values while two dimensions —
completeness and correctness — got none at all, and those two are exactly where engineering and
finance's numbers diverged. The same ask, run through four definitions of "correct" (exactly-once
effect, eventual completeness by a stated cutoff, bounded error, at-most-once), produces four
different systems with four different dominant costs rather than four phrasings of one idea, and
the dashboard's own consequence (a board losing confidence, not a bill going out wrong) selects
the cheapest of the four that still holds. A second ask, "make it reliable," fails the same five
questions outright — not because the room disagrees on what "reliable" means, but because no
indicator, measurement point, target, window or consequence was proposed at all.

</section>

<section data-section="internals">

## Internals

The SRE book keeps the three terms carefully separate for a reason: an SLI is a measurement, an
SLO is a target for that measurement, and an SLA is a contract with a stated consequence —
usually financial — for missing the SLO. SRE deliberately stays out of writing SLAs themselves
(that's a business and legal decision), but does help set the SLOs an SLA leans on, since
disagreements need an objective way to measure them. The book's own practical test for telling
an SLO from an SLA is to ask what happens if it's missed: no explicit consequence means it's
almost certainly an SLO. It also prefers percentiles over the mean for any latency-shaped
indicator, because response-time data is skewed (no request takes less than zero milliseconds,
and a timeout caps the top end), so a high percentile shows a plausible worst case while the mean
can hide it entirely.

</section>

<section data-section="lab">

## Lab

This topic's own `examples.py` is the method's lab (`CHAPTER.md`'s own lab is hosted by topic 9,
the capstone); here, `five_questions_to_slo`, `six_dimension_checklist`, `four_definitions_of_
correct` and `reject_unmeasurable` run the derivation as data and assert every number the reel
shows, rather than letting the screen state a number nobody checked. Try the same four functions
against a real ask from your own work: run it through the five questions, tick the six
dimensions, and see which ones come back empty.

</section>

<section data-section="production">

## Production failures this topic warns about

**Treating "real-time" and "accurate" as if they were already specifications.** Both words sound
precise. Neither one, on its own, says which of the six dimensions it constrains — "real-time"
is a freshness-and-latency word that says nothing about completeness, "accurate" is a correctness
word that says nothing about by when a number must stop changing. Two teams who each honestly
satisfy their own reading of the sentence can and will build two different systems, exactly as
this topic's hook shows, and the disagreement surfaces only once both numbers are already live in
front of the people who act on them.

**Agreeing on a word instead of building an SLO.** "Make it reliable" can absorb an entire
meeting of consensus-building about what "reliable" should mean, and still leave nothing an
implementer can build against. An SLO is five things together — an indicator, a measurement
point, a target, a window, a consequence — and a shared vocabulary supplies none of them. The
fix this topic teaches is not "define the word better"; it's "run the five questions and see
which ones still have no answer."

**The practiced version of this habit.** The SRE Workbook's own method for a real system starts
from the same place this topic does — list how users actually interact with the system, then
derive indicators from that list — and adds two disciplines worth carrying forward: keep to five
or fewer SLI types per critical function, so the set stays something a team can actually act on,
and define SLOs around a **critical user journey** (a core task sequence in the user's
experience) rather than around an individual component in isolation. A journey also inherits the
reliability ceiling of its weakest critical dependency: a component with a lower guarantee than
the journey needs forces either a different component or an explicit defense (caching,
store-and-forward, graceful degradation), never a guarantee the component can't actually give.

</section>

<section data-section="frontier">

## Frontier

This topic claims nothing new: the SLI/SLO/SLA vocabulary is a stable, widely practiced discipline
(the SRE book's own chapter on it is now over a decade old and essentially unchanged in its core
definitions), and the four-definitions-of-correct framework is this course's own synthesis of
Chapter 14's consistency and exactly-once vocabulary and Chapter 5's sketches, not a claim about
an emerging technique. Where the field does keep moving is in automated SLO tooling (burn-rate
dashboards, error-budget policies wired into deploy gates) — named here only as a forward pointer,
since Chapter 11 and Chapter 13 own that material.

</section>

<section data-section="where-this-goes-next">

## Where this goes next

There is now a list of numbers the system must meet. The next question is how big the thing is:
how many events a second, how many bytes a year, and what that does to storage, network and cost.
The next topic is capacity estimation, and it is the arithmetic every later choice in this
chapter rests on.

</section>
