# Before you watch

- **Circuit breaker** — a mechanism that halts a table's downstream publication the moment an incident is detected, rather than letting bad data keep flowing.
- **Quarantine (a partition)** — marking a partition as affected and blocking reads from it, without deleting its data.
- **Incident commander** — the person who holds the incident's overall state and assigns responsibility to everyone else working it.
- **Blast radius** — exactly which downstream assets an incident actually touches, as opposed to everything that could conceivably be touched.
- **Blameless postmortem** — a write-up that looks for the systemic cause of a failure, not the person who happened to be involved.
- **Asset-level ownership** — attaching an owner to each table or asset, so an alert routes to someone who can actually act on it.
