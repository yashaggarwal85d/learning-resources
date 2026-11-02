# Outline: Federated governance operating model (`de.federated-governance-operating-model`)

**Hook:** three domain teams (orders, customers, marketing) each run their own tables; a
regulator asks for one list of every table holding restricted personal data and its owner,
within a day. With a central team hand-maintaining the list it takes weeks and is wrong; with
no central rules every domain gives a different answer. What's the smallest set of things that
must be central, and what must be impossible to bypass?

**Predicts:** (1) central policy, central ownership, central tooling, or some split; (2) which
of six governance decisions are automated vs. human.

## Steps

1. **Hook.** The regulator's one-day request; the central-team-hand-maintains-it failure and
   the no-central-rules failure, side by side.
2. **Reveal: the data-mesh shape, named.** Domain teams own data products; a platform team
   supplies self-serve tooling; a central body defines policy once and the platform enforces it
   in code -- Dehghani's own four principles, with governance as the piece this topic adds.
3. **Predict 1.** Given the regulator's ask: should policy, ownership and tooling each be
   central, each be domain-local, or split -- and if split, which way?
4. **Reveal 1.** Policy (the rule) is central; ownership (who answers for a table) stays with
   the domain; tooling (the self-serve platform) is central and automates the rule's
   enforcement -- a three-way split, not one answer for all three.
5. **Takeaway 1.** A rule defined once and enforced by the platform beats either a central team
   maintaining every table by hand or every domain inventing its own rule.
6. **Elaborate: reverse Conway's law.** Conway's own 1968 thesis -- an organization that
   designs a system produces a design copying its own communication structure. Reversed: choose
   the team structure that produces the governance architecture you want, instead of fighting
   the org chart.
7. **Predict 2.** For six decisions (a mask on a PII column; a table with no declared owner; a
   retention exception for one table with a stated legal reason; a free-text column that might
   be PII; a quality floor on a new table; a cross-domain naming conflict): which are automated,
   which are human, and who is the named steward for the human ones?
8. **Reveal 2.** A rule over an attribute automates (mask the tag, block the ownerless table,
   enforce the quality floor); judgment that needs a human stays human (the retention
   exception's legal reason, the ambiguous free-text column, the naming conflict) -- each with a
   named steward and a review cadence.
9. **Takeaway 2.** Automate what a machine can check against a rule; keep human what needs a
   reason a machine can't evaluate.
10. **Reveal: the self-serve registration gate, run.** `examples.py` runs a table-registration
    check against schema, contract and classification-tag rules -- admits a compliant table,
    rejects one missing a tag, with the exact rule it failed.
11. **Takeaway 3 / Recap.** Governance that is only policy written down is optional; governance
    that a platform enforces automatically is not -- and the line between the two is exactly
    where a human judgment call cannot yet be turned into a rule.

## Coverage mapping (syllabus clause → steps)

- domain teams own products, platform self-serve, central policy computational → steps 2, 4, 10
- reverse Conway's law → steps 6
- human stewardship vs. automate → steps 7-9
- links to data mesh / team topology → step 2 (data mesh), named only for team topology
