- **Remote log manager**: the broker-side component that copies a closed segment, with its
  indexes, to object storage. *Where you meet it:* the second predict/reveal pair.
- **Local retention**: how long a segment's copy stays on the broker's own disk after it has been
  tiered. *Where you meet it:* the reveal on two retention knobs.
- **Total retention**: how long the data exists at all, locally or remotely. *Where you meet it:*
  the reveal on two retention knobs.
- **`RemoteStorageManager`**: the pluggable interface a storage backend implements; Kafka ships
  the copying mechanism, the plugin supplies the destination. *Where you meet it:* the setup and
  the second reveal.
- **Cold read**: a read served from object storage instead of local disk, with no different API,
  just more latency. *Where you meet it:* the third predict/reveal pair.
