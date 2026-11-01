# Pre-notes: Hybrid connectivity, egress and latency

- **Dedicated interconnect.** A physical or virtual circuit reserved for one customer between
  their own site and a cloud region, bought for steadier, more predictable latency than the
  public internet offers.
- **Bandwidth-delay product.** A link's capacity multiplied by its round-trip delay: the most
  data that can be "in flight," sent but not yet acknowledged, at any instant.
- **Cluster linking.** The general name for replicating a stream across a WAN link between two
  clusters (MirrorMaker 2 is Kafka's own implementation of this).
- **Latency budget.** The portion of an end-to-end deadline left over for processing once the
  network hop and any fixed overhead have been subtracted.
- **Data gravity.** The tendency for compute to move toward where data already sits, because
  moving the data itself costs more than moving the compute to it.
