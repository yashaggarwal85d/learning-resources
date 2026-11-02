- **Raw layer / bronze**: the first landing layer, holding source data exactly as it arrived,
  never updated in place. *Where you meet it:* the structure every measurement in this topic
  runs against.
- **Append-only**: new facts are added as new records; nothing already written is ever edited
  or deleted in place.
- **Replay**: rebuilding a downstream table by reading the raw layer from the start and applying
  a transform, rather than trusting whatever state the downstream table happens to be in.
- **Source offset**: a record's own position in the source it came from (an LSN, a Kafka offset,
  a file name and byte range, an API page cursor), carried on every raw record.
- **Schema version**: the version of the record's shape in effect when it landed, carried
  alongside the data itself so an old record is never misread under new assumptions.
- **PII**: personally identifiable information, the category of data a retention or erasure duty
  applies to.
- **Retention**: how long raw data is kept; in tension with the duty to keep personal data no
  longer than necessary.
- **Tokenization**: replacing an identifying field with a stand-in value, resolvable back to the
  original only through a separate, small, mutable vault.
