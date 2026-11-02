- **Data quality**: whether data meets the expectations the people using it rely on. *Where you
  meet it:* the hook and the two-layers reveal.
- **Check**: an automated test of one expectation about a dataset. *Where you meet it:* the
  two-layers reveal.
- **Anomaly**: a measurement that deviates from what a statistical check expects. *Where you
  meet it:* the two-layers reveal.
- **Threshold**: the boundary a check compares a measurement against to decide pass or fail.
  *Where you meet it:* the suppression reveal.
- **Blast radius**: everything downstream that a failure's effects actually reach. *Where you
  meet it:* the lineage-routing reveal.
- **Owner**: the person or team responsible for a dataset, who an alert about it should reach.
  *Where you meet it:* the lineage-routing reveal.
- **Alert fatigue**: the state in which so many alerts fire that people stop acting on any of
  them. *Where you meet it:* the hook and the suppression reveal.
- **Suppression**: a named rule that silences an alert during a specific, expected condition.
  *Where you meet it:* the suppression reveal.
- **Incident**: an alert that has become a tracked, owned event with a workflow of its own.
  *Where you meet it:* the incident-workflow reveal.
- **Runbook**: a documented procedure for responding to a known kind of incident. *Where you
  meet it:* the incident-workflow reveal.
