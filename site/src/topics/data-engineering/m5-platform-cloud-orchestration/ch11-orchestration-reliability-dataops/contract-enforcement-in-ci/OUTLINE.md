# Outline: Contract enforcement in CI

1. **Hook** — a producer renames a column with every internal test green, because nothing in their own pipeline reads the old name; three other teams' dashboards, which do, find out only when they break in production. The same rename, attempted against an ODCS contract, is rejected by the producer's own CI before it ever merges, with the three downstream owners named in the error message.
2. **Predict: does passing CI also protect a pipeline's downstream consumers?** Topic 18's WAP protects a pipeline's own publish from corrupting itself.
   - Answer: no — CI only enforces what the pipeline's own tests check. Nothing protects a downstream consumer unless something states, in a form CI can read, exactly what the producer promises them.
3. **Reveal: a contract as code** — ODCS holds a table's schema, quality rules, SLAs and ownership together in one versioned, machine-readable file, built for the shop's own `fct_orders`.
4. **Reveal: breaking-change classification blocks a premature rename, allows expand-first** — the same classifier topic 17 ran for state-aware builds, now the producer's own CI gate: a straight rename with no migration path is blocked; the identical change proposed through expand first, or a purely additive change, is not.
5. **Predict: does catching it before the merge catch every violation?**
   - Answer: no — a write that never goes through a pull request at all, from an out-of-band job, never runs through CI in the first place.
6. **Reveal: runtime enforcement catches the out-of-band write** — the same contract, checked again at write time, is the only thing that ever sees a violation CI had no chance to.
7. **Reveal: automated owner notification via lineage** — an approved change to `fct_orders` still reaches three real downstream tables owned by three different teams; the lineage graph finds and notifies every one of them automatically.
8. **Recap** — contract-as-code, a producer-side CI gate, runtime enforcement, and lineage-driven notification: four mechanisms closing the one gap WAP left open, a change that breaks a consumer's expectations even when every internal test passed.
9. **Prove it** — the shop's own contract, the shop's own CI gate, run for real against both a blocked rename and an allowed one.

## Internals / Frontier
- Internals: the classifier's real safety property is conservative by construction -- it only calls a removed field "migrated" when some new field explicitly names what it deprecates; anything else that disappears is treated as unannounced, exactly the failure mode the hook demonstrates.
- Frontier: the expand/migrate/contract rollout discipline this gate automates is topic 14's, used not re-taught; the lineage mechanism used for notification is topic 8's and Chapter 13's, used not re-taught; the quality-rule and SLA vocabulary inside the contract reuses topic 11's SLI/SLO work, used not re-taught.
