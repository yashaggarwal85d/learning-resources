# Before you watch

- **Shuffle partition.** One slice of a shuffle's output, assigned to one reduce task. Where you
  meet it: the unit this whole topic measures skew across — one partition versus the rest.
- **Task duration / shuffle-read bytes.** The two per-task numbers the Spark UI's stage tab
  reports for every task in a stage. Where you meet it: the diagnosis itself, as a max-vs-median
  ratio, before anything about a remedy comes up.
- **AQE skew-join splitting.** The last topic's own handoff: an AQE feature that splits one
  skewed shuffle partition into several smaller ones once a configured threshold is cleared.
  Where you meet it: the first remedy on this topic's own ladder, and the first one measured.
- **BroadcastHashJoin.** Sending one entire side of a join to every worker, skipping a shuffle on
  that side altogether. Where you meet it: two topics back as the planner's static choice; here,
  as a remedy applied on purpose.
- **Map-side partial aggregation.** A combinable aggregate function (`sum`, `count`, `min`, `max`,
  `avg`) gets partially combined on each task before its shuffle ever runs, shrinking what that
  task actually has to send. Where you meet it: this topic's own reveal that a skewed key isn't
  always a skewed shuffle.
- **Salting.** Splitting one key into several by appending a random suffix, so rows that used to
  land in one partition spread across many. Where you meet it: both as a join remedy and, salted
  differently, as half of this topic's own two-phase aggregation fix.
