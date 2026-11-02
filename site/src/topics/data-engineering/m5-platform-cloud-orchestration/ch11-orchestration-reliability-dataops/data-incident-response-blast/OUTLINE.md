# Outline: Data incident response and blast radius

## Engagement arc

1. **Hook** — a stale source silently feeds days of duplicate rows into a revenue table before anyone notices. The team spends the first stretch of the incident just figuring out which downstream dashboards are actually affected, because nobody had ever run the lineage query until that night.
2. **Reveal: the five-stage loop, named** — detect, triage, contain, repair, postmortem, each demonstrated on this same injected incident.
3. **Predict: how should "which dashboards are affected" actually be answered?** — before the reveal, ask whether notifying everyone downstream is the safe default.
4. **Reveal: lineage-derived blast radius** — the asset graph's own declared edges answer exactly which downstream assets are touched, computed rather than guessed.
5. **Predict: does containing an incident mean deleting the bad data?** — before the reveal, ask what "contain" actually means for a bad partition.
6. **Reveal: contain by quarantine, repair by targeted backfill** — the bad partitions are marked, not deleted; repair reloads only those partitions, reusing the resumable-backfill idea.
7. **Reveal: incident-command roles, sourced** — a commander who holds state and assigns responsibility, an Ops lead who is the only one touching the system, a Communication lead who is the public face -- named roles, so nobody drives twice.
8. **Recap** — detect, triage, contain by quarantine, repair by target, and a blameless postmortem that fixes the system, not a person.
9. **Prove it** — this topic's own real asset graph: of forty downstream dashboards, how many does the lineage query actually implicate?

## Deep dives

- **Internals**: the Incident Command System's own named roles and why a living incident document matters; blameless postmortem culture and why it exists to fix systems, not people; asset-level ownership and on-call routing as the mechanism that gets an alert to someone who can actually act on it.
- **Frontier**: OpenLineage as a vendor-neutral standard for the same lineage-derived impact analysis this topic demonstrates on a single asset graph, for organizations whose lineage spans more than one orchestrator or warehouse.
