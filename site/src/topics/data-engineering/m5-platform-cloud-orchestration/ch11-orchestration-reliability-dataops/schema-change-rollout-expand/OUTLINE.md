# Outline: Schema-change rollout: expand/contract

## Engagement arc

1. **Hook** — a column is renamed in one deploy, every consumer expected to "just pick it up," and three downstream dashboards go blank the next morning because nobody migrated them first.
2. **Predict: is a single-deploy rename ever safe?** — before the reveal, ask whether a breaking-looking rename can be made safe by better timing alone.
3. **Reveal: expand, migrate, contract, named** — the same rename split into three phases: add the new field alongside the old, migrate every consumer one at a time, only then remove the old field.
4. **Reveal: the compatibility modes that decide what's allowed** — backward, forward and full, each applied to the expand step and shown passing.
5. **Predict: is contracting right after expand just as safe as contracting after migrate?** — before the reveal, ask what changes about the rollout's safety between those two moments.
6. **Reveal: a premature contract genuinely breaks the laggard** — the same contract step, run while one consumer hasn't migrated yet, raises a real error on that exact consumer and no one else.
7. **Reveal: dual-write, bounded** — the producer writes both the old and new field for a measured window, and the window has an end, not an indefinite life.
8. **Recap** — expand, migrate, contract; the compatibility mode that lets expand through; a premature contract's real failure; a dual-write window with a bound.
9. **Prove it** — this topic's own real rollout: the shop's own `orders.amount` renamed to `orders.total_amount`, one consumer deliberately left behind mid-migration.

## Deep dives

- **Internals**: why BACKWARD is Confluent's own default rather than FORWARD, and what that choice assumes about being able to rewind a consumer to the start of a topic; the asymmetry between adding a field (safe with a default) and removing one (safe only once nothing still reads it).
- **Frontier**: this rollout discipline is exactly what a contract-enforcement CI gate (a later topic) checks automatically before a breaking schema change ever reaches production, and the streaming analogue of expand/migrate/contract shows up again wherever a CDC stream must evolve its own schema without breaking a downstream consumer mid-stream.
