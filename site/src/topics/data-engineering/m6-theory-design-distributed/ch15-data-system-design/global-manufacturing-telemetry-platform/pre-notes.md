- **Sensor**: a device that reports a reading, such as a temperature or a vibration level. *Where
  you meet it:* the capacity-estimate reveal.
- **Plant**: one factory site, with its own line of machines and its own network link. *Where
  you meet it:* the capacity-estimate and plant-autonomy reveals.
- **Gateway**: the device at the edge of a plant that buffers and forwards sensor data. *Where
  you meet it:* the buffer-sizing reveal.
- **Buffer**: durable storage that holds readings until they can be forwarded. *Where you meet
  it:* the buffer-sizing reveal.
- **MQTT**: a lightweight publish-subscribe protocol common in industrial sensor networks. *Where
  you meet it:* the protocol-and-delivery reveal.
- **Time-series database**: a store specialized for fast writes and range queries over
  timestamped readings. *Where you meet it:* the hot-store-versus-lakehouse reveal.
- **Asset hierarchy**: the plant, line and machine structure a reading belongs to. *Where you
  meet it:* the hot-store-versus-lakehouse reveal.
- **Cardinality**: the number of distinct time series a store has to track. *Where you meet it:*
  the hot-store-versus-lakehouse reveal.
- **Retention**: how long data stays in a given store before it ages out or moves. *Where you
  meet it:* the hot-store-versus-lakehouse reveal.
- **Edge**: computation or storage placed at the plant itself, rather than in the cloud. *Where
  you meet it:* the buffer-sizing and plant-autonomy reveals.
