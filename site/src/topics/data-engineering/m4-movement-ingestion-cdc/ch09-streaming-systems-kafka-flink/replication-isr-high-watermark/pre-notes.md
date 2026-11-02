- **Leader / follower**: the one replica of a partition that accepts writes, and the replicas
  that pull copies of it. *Where you meet it:* the setup step, and every step after it.
- **In-sync replica set (ISR)**: the replicas caught up enough to the leader to be eligible for
  election and counted toward a committed write. *Where you meet it:* the setup step, and the
  high-watermark predict/reveal pair.
- **High watermark**: the highest offset guaranteed to be on every in-sync replica — the point a
  consumer is actually allowed to read up to. *Where you meet it:* the first predict/reveal pair,
  measured for real.
- **`min.insync.replicas`**: the configured minimum number of in-sync replicas a write (or a
  moving high watermark) must have behind it. *Where you meet it:* the last predict/reveal pair.
- **Leader epoch**: a number stamped on every message marking one continuous period of
  leadership, used to decide what a restarted follower should truncate. *Where you meet it:* the
  second predict/reveal pair.
- **Unclean leader election**: promoting a replica outside the ISR to leader, trading durability
  for availability. *Where you meet it:* the last predict/reveal pair, as the classic rule this
  topic contrasts with a safer one.
