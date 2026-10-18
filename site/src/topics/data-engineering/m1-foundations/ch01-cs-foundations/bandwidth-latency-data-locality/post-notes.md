---
id: de.bandwidth-latency-data-locality
title: Bandwidth, latency and data locality
---

<section data-section="outcomes">

## After this topic you can

- Compute a bandwidth-delay product and the window, buffer or stream count a transfer needs to reach the link's full rate.
- Separate a latency problem from a throughput problem, and use Little's law to size the concurrency a target throughput needs.
- Estimate the time and the bill for moving a dataset across availability zones or regions, before you move it.
- Argue, in bytes and in dollars, for moving compute to the data instead of data to the compute.

</section>

<section data-section="internals">

## Into the internals

The last three topics priced a call by its round trips: the handshake, slow start, a name lookup, a load balancer, a TLS exchange. Those costs dominate a *small* call. This topic is about the opposite regime, the bulk transfer, where the bytes themselves dominate, and about the two numbers that then decide everything: how wide the path is (bandwidth, β) and how long it is (latency, which for a stream is the round-trip time, RTT). The affine cost **T(n) = α + n/β** from topic 6 still holds; here n is large, so n/β wins. But α does not disappear. It sets how much data must be *in flight* to keep the pipe full, and that is the bandwidth-delay product.

### The pipe: the bandwidth-delay product

Picture the network path between two machines as a pipe. Its width is the bandwidth β; its length is the RTT. The volume of the pipe, the amount of data that is "on the wire" when it is running at full speed, is

> **BDP = β × RTT.**

This is the same shape as the object-storage break-even α·β from topic 6 and the held I/O cost model: there, α·β was the request size at which a transfer spends as long waiting as moving; here, RTT plays α's role and the BDP is the data that must be outstanding before the sender hears the first acknowledgement. RFC 7323 names a path with a large BDP a **long, fat network (LFN)** and states the problem exactly: *"the receive window limits the maximum throughput of the TCP connection over the path, i.e., the amount of unacknowledged data that TCP can send in order to keep the pipeline full."*

TCP will not send more unacknowledged bytes than the smaller of the congestion window (topic 19) and the receiver's advertised **receive window** (topic 19). So once congestion control has opened up, throughput is capped by

> **throughput ≤ receive window / RTT.**

If the window is smaller than the BDP, the sender fills the window, then stalls waiting for an ACK that is one RTT away, and the pipe runs part-empty. The table makes the trap concrete. Rates are decimal bits per second; a 10 Gbit/s link moves 1.25 GB/s of payload. BDP and window throughput are given in binary **MiB/KiB** throughout, to keep this derivation in one unit system. RTTs are stated as assumptions for the path, not measured here.

| Path | β | RTT (assumed) | BDP = β × RTT | Throughput with a 64 KiB window |
|---|---|---|---|---|
| Same availability zone | 10 Gbit/s | 0.5 ms | ≈ 610 KiB | 65,535 B / 0.5 ms ≈ 125 MiB/s ≈ 1.0 Gbit/s |
| Cross-region | 10 Gbit/s | 60 ms | ≈ 71.5 MiB | 65,535 B / 60 ms ≈ 1.0 MiB/s ≈ 8.7 Mbit/s |

The 64 KiB column is not academic: the TCP header carries the receive window in a **16-bit** field, so the largest window a classic TCP can advertise is 2^16 − 1 = 65,535 bytes. On the cross-region path that caps a 10 Gbit/s link at under one tenth of one percent of its rate, no matter how empty the network is. The problem is not bandwidth and not loss; it is a window smaller than the pipe.

**Window scaling lifts the ceiling.** RFC 7323's Window Scale option multiplies the advertised window by 2^S, where the shift S is negotiated once in the SYN handshake. The RFC caps S at 14, "for a maximum permissible receive window size of 1 GiB (2^(14+16))". So scaling, not raw link speed, is what lets a single flow fill a fat pipe, and it must be enabled on both ends at connection setup.

**The kernel sizes the window for you, within limits.** On Linux the receive and send buffers are governed by `net.ipv4.tcp_rmem` and `tcp_wmem`, each a vector of three integers: minimum, default and maximum. Receive-side autotuning (`tcp_moderate_rcvbuf`, on by default) grows the buffer toward `tcp_rmem[2]` "to match the size required by the path for full throughput." The out-of-the-box default receive buffer is small, about 87,380 bytes, which the kernel docs note "results in [a] window of 65535"; autotuning raises it as the BDP reveals itself, but only up to the configured maximum. On a high-BDP WAN link whose BDP exceeds that maximum, autotuning cannot save you, and you either raise `tcp_rmem[2]`/`tcp_wmem[2]` (and set `SO_RCVBUF`/`SO_SNDBUF` large enough) or you open more flows. Note that a program calling `setsockopt(SO_RCVBUF)` turns autotuning *off* for that socket, so a hand-set buffer that is too small is worse than leaving it alone.

### Throughput and latency are different axes

A common error is to treat "fast" as one number. Latency and throughput are independent, and a design can be good on one and terrible on the other:

- **Latency** is how long one unit of work takes end to end: α, the first-byte wait, the RTT. You cannot buy it down with more hardware; it is set by distance and queueing. Light in fibre crosses a continent in tens of milliseconds and no amount of money changes that.
- **Throughput** is how much work completes per unit time: β, bytes per second, requests per second. You *can* buy it up, by widening the pipe or by running more work at once.

The bridge between them is **Little's law** (Little, 1961): for any stable system, the average number of items inside it is the arrival rate times the average time each spends inside,

> **L = λ · W**,  or in our words,  **in-flight = throughput × latency.**

Read one way, it *is* the BDP: bytes in flight = (bytes/s) × RTT. Read another way, it tells you the **concurrency** a throughput target demands. To copy `order_events` (1 TiB, about 1.1 TB on the wire) across a region on a path with a 71.5 MiB BDP, a *single* stream needs a 71.5 MiB window to run flat out; one default-tuned stream will crawl. The fix is either a bigger window or **N parallel streams** whose windows sum to the BDP: ten streams each need only about 7.2 MiB in flight. This is exactly why bulk-copy tools (`s3 cp`/multipart, `distcp`, `iperf3 -P`) default to many connections. The same law governs object storage from topic 11: to reach a bandwidth target when each request waits α before its first byte, the number of requests in flight must equal your target **request rate × α** (Little's law again; divide your byte target by the bytes one request carries to get the rate), which is the "k parallel range GETs" the held cost model counts.

Separating the axes also diagnoses faults. A transfer that is slow but whose bytes-in-flight sits pinned at the window maximum is **window-bound** (raise the buffer or add streams). One whose window is nearly empty is **latency- or loss-bound** (an RTT or a congestion-control problem, topic 19), and a bigger buffer does nothing.

### Why moving compute to the data wins

The cheapest byte to send over the network is the one you never send. This is **data locality**, and it is the oldest idea in big-data systems. HDFS states it as a design principle: *"Moving Computation is Cheaper than Moving Data … A computation requested by an application is much more efficient if it is executed near the data it operates on. This is especially true when the size of the data set is huge."* MapReduce (Dean & Ghemawat, 2004) built its scheduler around it: *"Network bandwidth is a relatively scarce resource … [we] conserve network bandwidth by taking advantage of the fact that the input data … is stored on the local disks of the machines,"* and the master *"attempts to schedule a map task on a machine that contains a replica of the corresponding input data,"* so that *"most input data is read locally and consumes no network bandwidth."*

The modern lakehouse form of the same principle is **pushdown**: send the query to the data rather than the data to the query.

- **Projection pushdown** reads only the needed columns of a columnar file (topic 7's `columnar-layout`), so n in T(n) = α + n/β shrinks before the transfer even starts.
- **Predicate pushdown** uses per-block min/max statistics to skip blocks that cannot match, and pushes filters into the storage layer or the remote scan so only surviving rows cross the wire.

Both shrink N at the source. The held I/O cost model's rule, "N is what you actually move," is the locality argument counted in bytes.

**The shop's join, repriced.** The held cost model fixed the numbers: joining the 1 TB `orders`-scale table with the 100 MB `customers` dimension on 100 machines costs about **990 GB** across the network for a shuffle (re-partition both sides by key) against about **9.9 GB** for a broadcast (ship the small side everywhere). Those bytes are fixed; this topic prices them in time and money. At 10 Gbit/s per machine (1.25 GB/s each way) the shuffle has every machine send about 9.9 GB, roughly **8 s** of sending per machine; the broadcast has every machine receive about 0.1 GB, roughly **0.08 s**. Same answer, same CPU work, **a hundred times** less traffic and time, because the broadcast moved the small table to the data instead of dragging the big table to a common point. The crossover is relative, not absolute (held cost model): broadcast wins on bytes while the small side is below |R| / (p − 1) ≈ |R|/p, and it must still fit in each machine's memory.

### The bill is a design constraint

Inside one machine, data movement is free after you have paid for the RAM. Across the network it is metered, and the meter is often the dominant line item in a data platform's bill. The prices below are AWS's, from its EC2 On-Demand "Data Transfer" page, verified on the date in Sources; every provider's prices move, so treat the *shape* as the lesson and re-check the current page for the exact figure.

| Movement (AWS, us-east-1 shape) | Price | Note |
|---|---|---|
| Within an availability zone, private IPv4 | free | keep chatty traffic here |
| Across AZs in the same region | **$0.01/GB in each direction** | a cross-AZ replica pays both the send and the receive |
| Across regions | higher, per-pair (verify on the pricing page) | the long pipe is also the expensive one |
| Out to the internet (egress) | higher still, tiered; first 100 GB/month free | ingress is free, egress is not |

The asymmetry is the trap: **ingress is free, egress is metered.** Data flows into a cloud cheaply and is expensive to move out again, which is the "data gravity" that keeps compute pinned next to its storage. Two worked numbers from the shop, using the confirmed cross-AZ rate of $0.01/GB each direction (so about $0.02 per GB that crosses a zone boundary round-trip-equivalent):

- The **shuffle** join above moves about 990 GB across AZs: on the order of **$20** per run of that one stage, every night.
- The **broadcast** moves about 9.9 GB: on the order of **$0.20**, a hundredfold cut that tracks the byte ratio exactly.

Multiply the shuffle by a nightly cadence and a year and it is real money for a stage that a broadcast, a co-partitioning, or keeping both tables in one AZ would have made nearly free. The design lever is the same one locality gave us: don't pay to move bytes you could have left where they were, or computed over in place.

</section>

<section data-section="lab">

## Build, break, measure

This hosts the §1.4 chapter-lab part **"with BDP-sized buffers."** It reuses the shared `tc netem` setup that topic 19 (TCP handshakes) writes; here we add delay to expose the window/BDP cap and then lift it two ways: a bigger buffer, and more streams.

**Setup.** On a loopback or a pair of hosts, add a one-way delay so the RTT is large enough to make the BDP visible (topic 19 explains `netem`):

```bash
# ~30 ms each way => ~60 ms RTT; add it on both directions for a symmetric path
sudo tc qdisc add dev lo root netem delay 30ms
# BDP at 10 Gbit/s and 60 ms RTT = 1.25e9 B/s * 0.060 s = 75,000,000 B =~ 71.5 MiB
```

**Measure the cap, then lift it with a buffer.** `iperf3` lets you set the socket buffer with `-w` (it sets `SO_SNDBUF`/`SO_RCVBUF`, which also pins the window):

```bash
iperf3 -s &                                  # server
iperf3 -c 127.0.0.1 -t 10                     # default window: throughput ~ window/RTT
iperf3 -c 127.0.0.1 -t 10 -w 128k             # too small for a 71.5 MiB BDP: still capped
iperf3 -c 127.0.0.1 -t 10 -w 96M              # >= BDP: a single stream fills the pipe
```

Expected shape (measure in build; exact numbers depend on your machine and kernel tuning): the default and the 128 KiB runs sit near `window / RTT`, far below the link rate; the BDP-sized run climbs toward the link rate. Confirm with `ss -ti` that `cwnd` and the send buffer actually grew, and that window scaling is negotiated (`tcpdump` the SYN: look for `wscale`).

**Lift it with streams instead.** Little's law says N smaller windows can sum to the BDP:

```bash
iperf3 -c 127.0.0.1 -t 10 -P 10               # 10 parallel streams, default window each
```

Ten default-tuned streams should together approach what one BDP-sized stream did. A minimal Python sender shows the same control knob without iperf3:

```python
import socket
# Set the buffer BEFORE connect/accept; this disables autotuning for the socket.
s = socket.socket()
s.setsockopt(socket.SOL_SOCKET, socket.SO_SNDBUF, 96 * 1024 * 1024)  # ~BDP
s.connect(("127.0.0.1", 5201))
# ... stream a few hundred MB, time it, divide bytes by seconds ...
```

**Break it.** (1) Set the buffer *too small* with `setsockopt` and watch throughput fall and stay fallen, because the hand-set buffer disabled autotuning. (2) Raise `netem` delay to 150 ms and watch a fixed window's throughput drop proportionally (throughput = window / RTT). (3) Turn window scaling off (`sysctl -w net.ipv4.tcp_window_scaling=0`) and observe the hard 64 KiB ceiling no buffer size can beat.

```bash
sudo tc qdisc del dev lo root netem           # tidy up
```

</section>

<section data-section="production">

## In production

A review checklist for any pipeline that moves data between machines, zones or regions.

- **Trust autotuning on the LAN; check the ceiling on the WAN.** Within a region, Linux receive/send autotuning sizes windows well and you rarely touch `tcp_rmem`/`tcp_wmem`. On a high-BDP WAN link, compute BDP = β × RTT and confirm `tcp_rmem[2]`/`tcp_wmem[2]` exceed it; otherwise a single flow cannot fill the pipe however fast the link.
- **Never hand-set a socket buffer unless you must, and then size it to the BDP.** `setsockopt(SO_RCVBUF/SO_SNDBUF)` disables autotuning for that socket. A too-small manual buffer is the classic "fast link, slow transfer" bug.
- **Prefer many streams for bulk transfer.** Parallel connections reach the aggregate BDP without any per-socket tuning and ride over a single stream's loss recovery. This is why `aws s3 cp` (multipart), `distcp` and `iperf3 -P` default to concurrency.
- **Decide latency vs throughput before you tune.** A window pinned at its max is window-bound: add buffer or streams. A near-empty window is latency- or loss-bound: tuning the buffer won't help; look at RTT, loss and congestion control (topic 19).
- **Put compute next to data, and push work down.** Co-locate executors with their input (same AZ, same region); read only the columns you need (projection pushdown) and skip blocks you can prove won't match (predicate pushdown). Every byte not sent is the cheapest byte.
- **Price data movement as a design constraint.** Within-AZ private traffic is free; cross-AZ is $0.01/GB each direction; cross-region and internet egress are higher and egress is one-way-metered. A nightly cross-AZ shuffle is a recurring bill a broadcast or co-partitioning can erase. Model it before you ship, and re-check the provider's current pricing page.

</section>

<section data-section="next">

## Where this goes next

That closes the hardware and the network. Next: the language you use to ask for the data, starting with what a SQL query actually means.

</section>
