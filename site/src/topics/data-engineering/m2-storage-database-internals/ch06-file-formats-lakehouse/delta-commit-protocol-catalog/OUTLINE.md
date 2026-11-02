# Outline — de.delta-commit-protocol-catalog

10 steps. Predicts at 2 and 5. Takeaways at 4, 6, 9.

1. **Hook.** Topic 27 ended on: a JSON log entry is only a commit once it's written atomically as
   the next version number. This topic is exactly that, for real — using topic 10's own
   conditional-write primitive, now named as Delta's commit mechanism.
2. **Predict.** Two writers race to commit the same next version. Writer A's write lands first.
   What happens to writer B's write — does it silently overwrite A's, merge with it, or get
   rejected outright?
3. **Reveal.** A real `IfNoneMatch="*"` PUT of `_delta_log/00000000000000000001.json` — writer A's
   write succeeds, writer B's identical attempt is rejected with a real HTTP 412
   `PreconditionFailed`. The same primitive topic 10 demonstrated on a plain key, now committing a
   real Delta log version.
4. **Reveal + takeaway.** Writer B's operation is an append, so it has nothing to re-check — it
   just re-proposes against the new tip and wins version 2. Takeaway: a put-if-absent commit is
   the mechanism; what the loser does next depends entirely on what kind of commit it was.
5. **Predict.** A concurrent insert lands at version 3. A delete that read the table before that
   insert then tries to commit at version 4. Under Delta's default isolation level, does that
   delete commit or get rejected as a conflict?
6. **Reveal + takeaway.** WriteSerializable (the default) lets it commit, because the two
   operations can still be ordered as if the insert happened after the delete. Serializable would
   refuse it. Takeaway: WriteSerializable orders transactions after the fact; Serializable refuses
   to, even when no row actually overlaps.
7. **Reveal.** The overlapping case: the delete's one target row is exactly the insert's one new
   row. WriteSerializable still allows the commit (same ordering logic); Serializable now refuses
   it, because a reader must never see a snapshot that disagrees with that ordering.
8. **Reveal.** Why any of this needed a lock service before conditional writes existed on S3:
   before S3 supported `If-None-Match`, two writers racing to publish the same next version could
   both succeed, silently overwriting one another — so Delta's DynamoDB Commit Coordinator
   existed specifically to serialize that race externally.
9. **Reveal + takeaway.** Catalog-managed tables: Delta 4.0 (September 2025) previews the catalog
   as the source of truth for commits; Delta 4.2 moves the commit itself under the catalog; Delta
   4.3 moves every other table operation under the same catalog APIs. Takeaway: this isn't a
   bigger lock — it is the catalog becoming the only place "did this commit happen" can be
   answered, which is what makes a multi-table transaction possible at all.
10. **Recap.** A commit is a put-if-absent write of the next version; an isolation level decides
    which non-overlapping race outcomes are even allowed to commit; catalog-managed tables move
    that decision from the filesystem into the catalog, one operation type at a time.
