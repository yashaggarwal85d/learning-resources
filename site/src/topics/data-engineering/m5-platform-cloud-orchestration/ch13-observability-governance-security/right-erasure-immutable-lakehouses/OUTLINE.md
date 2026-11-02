# Outline: de.right-erasure-immutable-lakehouses

1. **Hook.** A customer exercises the right to erasure; `DELETE FROM customers WHERE id = 42`
   runs, and the row is gone from every query. A month later an auditor time-travels to last
   week's snapshot and reads the customer's name -- in the lakehouse, in a Kafka topic, and in
   last night's backup. Which of the three can a SQL statement fix, and which needs a key?
2. **Reveal: a DELETE writes a new snapshot; the old snapshot still references the old data
   file, untouched.** [from] Iceberg's own documentation: old snapshots aren't removed from
   metadata until expired.
3. **Predict: time-travel to the snapshot from before the DELETE. Does it still show the
   subject?** [idx2]
4. **Reveal: yes, measured directly -- the current read hides them, the old snapshot does
   not.**
5. **Elaborate: expiring the old snapshots and compacting physically removes the row.**
   [takeaway1] Delta's own documentation: `VACUUM` is not automatic and defaults to a 7-day
   retention window.
6. **Predict: a Kafka tombstone removes the value. Does it remove the record that a deletion
   ever happened?** [idx5]
7. **Reveal: not immediately -- the tombstone itself only disappears after
   `delete.retention.ms`, measured directly.**
8. **Elaborate: a lagging consumer can miss the delete marker entirely.** [takeaway2]
   Confluent's own documented risk, and why a backup taken before the key was deleted still
   holds the subject.
9. **Reveal: crypto-shredding -- deleting one subject's key makes every copy unreadable at
   once, measured directly, including the backup; an untouched subject stays fully readable.**
10. **Reveal: proving deletion to an auditor; retention policies as code.** The snapshot list,
    file listing and key store's own deletion record as evidence; retention rules as versioned,
    checkable configuration.
11. **Recap.** [takeaway3]
