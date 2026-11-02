# Outline — Keyed state, key groups and rescaling

1. Hook: killing a TaskManager and measuring real recovery time shows it's dominated by how much
   state that instance's key groups held, not by how complex the job is.
2. Setup: a checkpoint or savepoint snapshots state — this topic is what that state actually is
   for a keyed operator.
3. Predict: when a job rescales, does it move individual keys one at a time, or something else?
4. Reveal: every key is hashed into a fixed key group, set once by max parallelism; key groups,
   not keys, are what gets assigned to an instance.
5. Reveal: rescaling moves whole key groups between instances, never splitting one — verified by
   checksumming every key's state against its pre-rescale value.
6. Reveal: heap and RocksDB state backends trade access speed for capacity.
7. Predict: does a more complex job (more operators) take longer to recover from a failure?
8. Reveal: recovery time is driven by how much state the failed instance held, not by job
   complexity.
9. Reveal: state TTL expires idle keys automatically; schema evolution has real, named limits.
10. Reveal: 1.x state is not compatible with 2.x, by Flink's own current documentation.
11. Prove it.
12. Recap.

Predicts at steps 3 and 7. Takeaways planned on steps 5, 9, and 10 (never on 4 or 8, the steps
right after a predict step).
