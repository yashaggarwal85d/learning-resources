- **Schema evolution**: changing a schema over time while existing producers and consumers keep
  running against old and new versions. *Where you meet it:* the hook and throughout.
- **Backward / forward / full compatibility**: whether a new schema can read old data, an old
  schema can read new data, or both. *Where you meet it:* the first predict/reveal.
- **Transitive**: a compatibility mode checked against every previously registered version, not
  just the immediately prior one. *Where you meet it:* the first reveal.
- **Subject**: the name a schema is registered under in the registry, determined by a naming
  strategy. *Where you meet it:* the subject-naming reveal.
- **Schema id**: a small identifier a serialized record carries in its wire format, resolved
  against the registry to get the actual schema. *Where you meet it:* the subject-naming reveal.
