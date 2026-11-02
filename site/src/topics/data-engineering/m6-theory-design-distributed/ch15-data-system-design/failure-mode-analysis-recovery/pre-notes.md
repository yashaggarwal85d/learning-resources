- **Failure mode**: a specific way a system component can fail — named, not just acknowledged as
  possible. *Where you meet it:* the failure-table reveal.
- **Blast radius**: the scope of what actually shares a failure's domain, not whatever happens to
  share a dashboard or chart. *Where you meet it:* the blast-radius reveal.
- **RPO (recovery point objective)**: how much data a class can afford to lose, measured as a
  bound on how far back recovery can fall. *Where you meet it:* the RPO/RTO reveal.
- **RTO (recovery time objective)**: how long a data class can afford to stay unavailable.
  *Where you meet it:* the RPO/RTO reveal.
- **Degraded mode**: a designed, named trade a system makes under strain — not an accident of
  whatever happened to keep working. *Where you meet it:* the degraded-modes reveal.
- **Poison record**: a record that fails to process the same way on every retry, with no separate
  path for it. *Where you meet it:* the hook.
- **Single point of failure**: a component whose failure takes down more than its own blast
  radius should allow — assumed vocabulary this topic doesn't re-derive the detection of. *Where
  you meet it:* named in the blast-radius reveal's framing.
- **Runbook**: a recorded recovery procedure for a named failure — assumed vocabulary this topic
  doesn't re-derive the authoring of. *Where you meet it:* named in the recovery-gap reveal's
  framing.
