## Documenting Architecture Decisions (Michael Nygard, Cognitect)

URL: https://cognitect.com/blog/2011/11/15/documenting-architecture-decisions
Version: 15 November 2011, retrieved 2026-10-30

> Nobody ever reads large documents, either. Most developers have been on at least one project where the specification document was larger (in bytes) than the total source code size.

> Decision This section describes our response to these forces. It is stated in full sentences, with active voice.

> If a decision is reversed, we will keep the old one around, but mark it as superseded.

> Consequences This section describes the resulting context, after applying the decision. All consequences should be listed here, not just the "positive" ones.

Contents: why large, valueless specification documents go unread and unmaintained, and why small,
modular records have at least a chance of staying current; an architecture decision record's five
parts (Title, Context, Decision, Status, Consequences), each with a stated purpose — Context as
value-neutral forces in tension, Decision as an active-voice response, Status as proposed,
accepted, deprecated or superseded, Consequences as every resulting effect, not only the favorable
ones; the rule that a reversed decision is marked superseded rather than edited away, so the
record of what the team used to believe stays intact; the stated experience report that developers
rotating onto a project appreciated the context ADRs gave them, with no one left "scratching their
heads" about a past decision's motivation.

## Architectural Decision Records (ADR GitHub organization)

URL: https://adr.github.io/
Version: retrieved 2026-10-30

> An Architectural Decision (AD) is a justified design choice that addresses a functional or non-functional requirement that is architecturally significant.

> An Architectural Decision Record (ADR) captures a single AD and its rationale; Put it simply, ADR can help you understand the reasons for a chosen architectural decision, along with its trade-offs and consequences.

Contents: the definition of an architecturally significant requirement as one with a measurable
effect on a system's architecture and quality; the collection of ADRs for a project framed as its
own "decision log"; Nygard's 2011 post named directly as the post that popularized the concept,
with the organization's own guidance building on it rather than replacing it.
