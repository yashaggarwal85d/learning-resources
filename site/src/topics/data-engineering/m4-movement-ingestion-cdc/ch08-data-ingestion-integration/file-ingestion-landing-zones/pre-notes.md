- **Landing zone**: a prefix where a producer writes files and a reader never looks, so a
  half-written batch is never mistaken for a complete one. *Where you meet it:* the first stage
  of every protocol this topic measures.
- **Manifest**: a small object, written last, listing exactly which files belong to a batch.
  *Where you meet it:* the gate this topic's own crash reproduction relies on.
- **Success marker**: an empty object written strictly after every data file, the Hadoop S3A
  committers' own signal that a batch is complete.
- **Atomic rename**: a filesystem operation that swaps a name for another in one step. *Where
  you meet it:* the operation an object store does not give you at all.
- **Conditional write**: a write that only succeeds if a condition about the target key holds,
  such as the key not already existing. *Where you meet it:* measured directly against a
  two-producer race.
- **Quarantine**: moving a file that fails validation aside, with a reason, instead of retrying
  it forever or silently dropping it.
- **Schema-on-read**: deferring a file's schema check until something actually reads it,
  trading an earlier failure for a later, often costlier one.
- **Event notification**: a message a storage system sends when an object is created, used to
  discover new files without listing a whole prefix.
