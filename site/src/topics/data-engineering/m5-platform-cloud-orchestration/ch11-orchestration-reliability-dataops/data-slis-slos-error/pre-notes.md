# Before you watch

- **SLI (service level indicator)** — a measured quality dimension, turned into a number: what fraction of reads, over some window, met a stated bar.
- **SLO (service level objective)** — the target percentage an SLI is held to over a stated window.
- **Error budget** — the SLO's allowed slack: 100% minus the SLO, spendable on purpose by risky changes.
- **Data tier** — a table's own stakes (customer-facing vs. internal), used to set how tight its SLO should be.
- **Consumer read point** — where a person or system actually reads the data, as opposed to where a pipeline finishes writing it.
- **Burn rate** — how fast, relative to the SLO, something is consuming its error budget right now.
