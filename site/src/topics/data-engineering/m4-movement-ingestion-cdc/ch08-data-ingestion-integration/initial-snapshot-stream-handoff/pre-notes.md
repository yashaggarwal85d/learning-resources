- **Snapshot**: a one-time read of a table's full contents, taken as of some single fixed
  instant, as opposed to the ongoing stream of changes a slot emits afterward.
- **Consistent read**: a read that sees a table exactly as it stood at one instant, never a mix
  of before-and-after states from rows that changed while the read was running.
- **Exported snapshot**: a snapshot a session hands off so a different session can read against
  the identical instant, used here to let a new consumer dump a table at exactly the moment a
  slot's own stream begins.
- **Cutover position**: the single point in the log where a snapshot's own view ends and a
  slot's own stream of changes begins.
- **Gap**: a change that happened but shows up in neither the snapshot nor the stream.
- **Overlap**: a change that shows up twice, once from the snapshot and once again from the
  stream.
- **Snapshot mode**: a setting that decides whether a connector snapshots at all, and what a
  restart does with a snapshot that never finished.
