# REVIEW: Memory hierarchy and latency numbers (`de.memory-hierarchy-latency-numbers`)

## Content review (ROUTINE.md section 4): flow, basics, gap hunt, expert reader

- **Reviewer:** a fresh content-review agent (Opus) that wrote nothing in this topic.
- **Date:** 2026-10-12.
- **Read, in order:**
  - `ROUTINE.md` section 4, `QUALITY.md`, and `CHAPTER.md` (the shared sections and entries 5, 6 and 10).
  - The previous topic as it is now, `de.asymptotic-notation-logarithms` (held, unfinished): its reel step titles (from "Counting cost, in five minutes" to "In one breath"), its registry entry (bridge, and the handoff "Big-O counts steps as if each cost the same. Next: the memory hierarchy…") and its Deep dive headings.
  - This topic's registry entry, `reel.tsx`, `scenes.tsx`, `narration.json`, `index.mdx`, `prerequisites.mdx`, `coverage.json`, `SOURCES.md`, `FACT-CHECK.md`, `OUTLINE.md`, `EXPERT-LIST.md` and `examples.py`.
  - The syllabus line for this topic and for the next topic that is not skipped: "Storage devices and fsync durability". Topics 7–9 are *(skipped)*.
- **Run:**
  - `python3 examples.py` passes: in order 0.67 ns, random 14.9 ns (22×), dependent 169 ns, 12.0 GB/s on one core; loopback median 40 µs; one NUMA node.
  - I recomputed the doubtful numbers in Python. They are listed with each finding.
- **Checked from outside:** AWS Network Manager docs, "How Infrastructure Performance for AWS Network Manager works" (https://docs.aws.amazon.com/network-manager/latest/infrastructure-performance/how-nmip-works.html), and the current S3 "Performance design patterns" page in English (the `sources/` copy) and Portuguese.
- **Summary:** 27 findings, **5 major and 22 minor**. The majors:
  - The Basics section leaves out several terms the reel uses.
  - Socket-level DRAM bandwidth is missing.
  - Cloud block storage (EBS) is marked out of scope for a reason that is false.
  - "AWS publishes no figure today" for same-AZ latency is wrong.
  - The HDD's 1/168 s, a per-read time measured with 16 queued, is shown and used as a latency.

Each finding gives where, what, the evidence, the fix and its severity.

### Flow

**1. The bridge promises object storage at "tens of milliseconds"; the reel uses 100–200 ms throughout** (minor)
- **Status:** FIXED (2026-10-12). Step 4's caption now says "100–200 ms to the first byte (medians for small requests: tens of ms)"; the `OffChip` object-storage row has a second note line (layout shifted, H 468 to 494); narration step 4 carries the same clause. The bridge is unchanged.
- **Where:** registry `bridge` (shown on step 1), and the previous topic's handoff ("from a nanosecond to tens of milliseconds"). Steps 2, 4, 7 and 12 then all use 100 ms or 100–200 ms.
- **What:** the first figure the learner hears for object storage is a decade lower than every figure the reel then uses. The reel never says where "tens of ms" comes from.
- **Evidence:**
  - AWS gives both figures: medians "often in the tens of milliseconds" for requests under 512 KB, and "roughly 100–200 milliseconds" for latency-sensitive planning.
  - Only the Deep dive's table says both. Step 4 says only "100–200 ms".
- **Fix:** keep the bridge, which is the chapter contract. Add a clause to step 4's caption: "Object storage: 100–200 ms to the first byte (medians for small requests: tens of ms)". Add the same clause to the narration line.

**2. Seam: the previous reel calls 100 µs "a disk read"** (minor, for the previous topic)
- **Status:** RECORDED for the release seam check (not edited: another topic's file). See "For the release seam check" below.
- **Where:** `asymptotic-notation-logarithms/reel.tsx`, step "Big-O is not a stopwatch": "at 100 µs a step (a disk read) they take about 2.8 hours".
- **What:** the next reel, this one, shows a hard-disk read at about 6 ms or more and an NVMe read at 80 µs. A learner swiping straight through sees "disk read = 100 µs", then "disk = 6 ms".
- **Evidence:** this topic's step 4 and its Deep dive table.
- **Fix:** in the previous topic, change it to "(an SSD read)". That topic is held and not final, so its run can make the change. Nothing changes here.

**3. Step 10's "5 s of waits" uses an α the reel never shows** (minor)
- **Status:** FIXED. Option 1: the drawing shows "α = 20 µs (sequential, QD1)" under case A, the body says "(α = 20 µs, sequential)" and the narration "at the sequential twenty microseconds". `examples.py` §8 comments the 20 µs as Samsung's `20/20 us` and asserts that 80 µs would give 21.0 s and the same verdict.
- **Where:** step 10 "The floor is the larger term", case A: caption and `Floor` drawing ("1 TiB from NVMe, 128 KiB reads, 32 in flight").
- **What:** the waits use α = 20 µs, the PM9A3's sequential latency at queue depth 1 (`FLOOR_A`). The reel only ever teaches 80 µs for NVMe.
- **Evidence:** with the taught 80 µs, 8,388,608 × 80 µs / 32 = **21.0 s**, not 5 s (Python). The verdict, bandwidth-bound, is the same either way.
- **Fix:** either show "α = 20 µs (sequential, QD1)" in the drawing and the caption, or use 80 µs and show 21 s. Update `examples.py` §8 to match.

**4. Prove it 2 leans on network terms the course teaches later** (minor)
- **Status:** FIXED. Prove it 2: "a single flow (one TCP connection)" in the explanation, "(instances packed close together in one availability zone)" after "cluster placement group" in the question, a gloss in the narration, and the terms are in Basics ("Same-AZ round trip, flow, placement group").
- **Where:** step 14 (Prove it · 2 of 3): "EC2 instance", "one TCP connection", "single flow", "cluster placement group".
- **What:** flows and placement belong to §1.4, topics 19 and 21. None of these terms is glossed in the reel or in Basics. The chip "one TCP connection" helps, but the explanation then says "a single flow".
- **Fix:**
  - In the explanation, write "a single flow (one TCP connection)".
  - Gloss the placement group once: "(instances packed close together in one AZ)".
  - Or cover both in Basics (finding 8).
- **Note:** the concept ledger doesn't break, because these terms aren't concepts in `uses`.

**5. Prove it 3's "per prefix" is not explained** (minor)
- **Status:** FIXED. Prove it 3 says "per key prefix (the start of an object's name)", option 1 says "the key prefix's request limit", Basics has "First byte and key prefix". The prefix-as-start-of-name reading is backed by a new S3 quote in `SOURCES.md` (the docs' own example `a1b2/log-2024-01-01.txt`).
- **Where:** step 15, explanation ("at least 5,500 allowed per prefix") and option 1 ("the prefix's request limit").
- **What:** the S3 key prefix and its request-rate limit are introduced by topic 11, after this one.
- **Fix:** "5,500 reads a second per key prefix (the start of an object's name)". Or add it to Basics (finding 8).

**6. Step 12's readout uses "166 MB/s" with no explanation** (minor)
- **Status:** FIXED. The readout is now two lines: "k ≈ 52 at 625 MB/s per request," and "k ≈ 82 at 166 MB/s (the drive's rate ÷ 41)" (examples.py §10 asserts 166).
- **Where:** `Verdict`, third readout line: "at 625 MB/s per request a real run needs k ≈ 52; at 166 MB/s, k ≈ 82".
- **What:** 166 MB/s is 6,800 MB/s ÷ 41, each request's share of the drive's rate. The screen never says so, and the caption doesn't mention it.
- **Fix:** "at 166 MB/s (the drive's rate ÷ 41), k ≈ 82".

**7. The Deep dive's lab map drops the false-sharing part of the §1.2 lab without saying so** (minor)
- **Status:** RECORDED, with the Deep dive fix. A sentence was added to the lab-map paragraph (the false-sharing part belonged to the skipped CPU-caches topic) and a dated note was appended to `syllabus/review-notes/de-cuts.md` for a human.
- **Where:** `index.mdx`, "Where the rest of the section 1.2 lab lives".
- **What:** the paragraph lists the NVMe, object-store and float-sum parts. It leaves out "reproduce false sharing between two threads and remove it with padding". That part was hosted by topic 7 (CHAPTER.md lab table), which is now skipped, so nothing hosts it.
- **Fix:**
  - Add a sentence here: "The false-sharing part belonged to the CPU-caches topic, which this course skips."
  - Log the orphaned lab clause in `syllabus/review-notes/de-cuts.md` for a human.

No prerequisite sits later in the syllabus. `uses` is only `big-o` and `logarithms`, both from topic 5. Cache lines, prefetching, TLB and the page cache are explained on the spot, as `OUTLINE.md` says. The handoff ("the drives in the middle of the ladder: why random I/O still costs more on an SSD, and what it takes for a write to survive a crash") matches the next live syllabus line (sequential vs random I/O, SSD internals, fsync) and topic 10's planned bridge.

### Basics

**8. Basics leaves out terms the reel uses** (major)
- **Status:** FIXED. Basics stays at 14 bullets and 393 words by the build's own count (was 380): new "Cache line and prefetching" and "NVMe SSD and HDD" (which absorbs Rotational latency); "Cache (L1, L2, L3) and clock cycle" merged; "First byte and key prefix"; "Floor; latency- or bandwidth-bound"; "Same-AZ round trip, flow, placement group". Θ(n) stays in section 01, which now says "Θ(n) as in the refresher (the steps grow in proportion to n)". No links.
- **Where:** `prerequisites.mdx`, section 00 (14 bullets, about 382 words with markup).
- **What:** the reel uses these with no Basics entry:
  - **cache line** and **prefetching**: step 8, "Memory moves 64-byte lines… the CPU fetches the next lines before you ask".
  - **NVMe SSD** and **HDD**: named on every step from 4 on, never defined.
  - **latency-bound / bandwidth-bound**: steps 10 and 12 and all three Prove-its. The Floor bullet only says "the larger term names the bottleneck".
  - **key prefix**: Prove it 3.
  - **single flow / placement group**: Prove it 2.
  - **Θ(n) / Big-O**: step 8's drawing ("both Θ(n)") and explanation. Section 01 covers it, which is acceptable, but Basics should name it.
- **Evidence:** ROUTINE.md section 4: "the Prerequisites panel's Basics section names every notation and term the reel uses".
- **Fix:** the section is at the 14-bullet cap and near 400 words, so merge and trim:
  - **Cache (L1, L2, L3) and clock cycle**: small, fast memories on the CPU; manuals give their latency in cycles, 0.5 ns each at 2 GHz. *Where you meet it:* a loop whose data fits in L2 runs far faster.
  - **Cache line and prefetching**: memory moves in 64-byte lines, and the CPU fetches the next lines before an in-order loop asks. *Where you meet it:* an in-order scan beats random reads of the same array.
  - **NVMe SSD and HDD**: a flash drive on the PCIe bus, and a spinning disk whose random read waits for a seek plus half a turn (Seagate: 4.16 ms at 7,200 rpm). *Where you meet it:* the two local drives the reel compares.
  - **First byte and key prefix (object storage)**: the wait before a range starts arriving over HTTP; request-rate limits apply per key prefix. *Where you meet it:* a lakehouse reading Parquet from a bucket.
  - **Floor; latency-bound or bandwidth-bound**: the least time a job can take, max(bytes / β, requests × α / k); the job is latency-bound when the waits term is larger, bandwidth-bound when the bytes term is. *Where you meet it:* checking a job before running it.
  - Remove the separate "Clock cycle" and "Rotational latency" bullets. Trim "Same-AZ round trip" to fit, and add "one TCP connection is one *flow*". That keeps 14 bullets.
  - Leave Θ(n) to section 01, and have that section say "Θ(n) as in the refresher".
  - Re-run the build's word count after the change.

**9. "Same-AZ round trip" defines an AZ as one data centre** (minor)
- **Status:** FIXED. "…in the same availability zone (one or more data centres) and back" (page-sourced: intra-AZ probes cover "across AWS data centers, and within the same data center").
- **Where:** Basics, "Same-AZ round trip: a message to a machine in the same cloud data centre and back."
- **What:** an AWS Availability Zone is one or more data centres. AWS's own intra-AZ latency metric covers "probes that are across AWS data centers, and within the same data center".
- **Fix:** "a message to a machine in the same availability zone (one or more nearby data centres) and back."

**10. "4.16 ms on average" is Seagate's truncation; half a turn at 7,200 rpm is 4.17 ms** (minor)
- **Status:** FIXED. Step 4 caption and narration: "Seagate gives 4.16 ms on average at 7,200 rpm"; Basics: "(Seagate: 4.16 ms at 7,200 rpm)"; the Deep dive says half a revolution is 4.17 ms and Seagate prints 4.16; `examples.py` asserts both (`round(rot_ms, 2) == 4.17`).
- **Where:** Basics "Rotational latency", step 4 caption and narration.
- **Evidence:** 60 / 7,200 / 2 = 4.1667 ms (Python). FACT-CHECK #24 already notes that Seagate prints 4.16.
- **Fix:** attribute it ("Seagate: 4.16 ms") or say "about 4.2 ms". The caption already names Seagate in the next clause, so a word order change is enough: "Seagate gives 4.16 ms on average at 7,200 rpm".

**11. "Memory hierarchy: … each slower and larger" contradicts step 6** (minor)
- **Status:** FIXED. "each with a longer first-byte wait, and larger".
- **Where:** Basics, "Memory hierarchy".
- **What:** step 6's point is that object storage is the slowest to answer but not the slowest at moving bytes. "Slower" without qualification reads as both.
- **Fix:** "each with a longer wait before the first byte, and larger".

The definitions are otherwise correct and in our own words. Every bullet has a scenario, there are no links, and the section stays a primer.

### Gap hunt

**12. DRAM bandwidth is given only for one core; the socket figure is missing** (major)
- **Status:** FIXED, sourced figure only. Step 6's RAM point is now a range, 12 GB/s (one core, measured here) up to 460.8 GB/s (one socket, spec peak: AMD EPYC 9654, 12 channels, up to 4,800 MT/s, "Per Socket Mem BW 460.8 GB/s" on AMD's page; 12 × 4,800 MT/s × 8 bytes reproduces it, asserted in `examples.py`). Labelled "AMD spec peak" on screen; the Deep dive table row says it is a peak, not sustained, and one named part from one vendor. Intel's ARK pages returned HTTP 403, so Intel's number is not used. NOT DONE: the optional measured multi-threaded figure; the build machine is a 4-vCPU VM and could not show a socket's bandwidth, and nothing may be invented.
- **Where:** Deep dive table, "DRAM, local" (β: "one core, in order: about 12 GB/s, measured here"); step 6 `TwoAxes` (the RAM dot at 12 GB/s).
- **What:** the syllabus clause is "order-of-magnitude… bandwidth per tier". CHAPTER.md's canonical table, which this topic owns, has "tens of GB/s for one core; hundreds of GB/s for a multi-channel server socket". Only the first half is here.
- **Why it matters:**
  - On step 6, RAM (12 GB/s) sits less than 2× above one NVMe drive (6.8 GB/s). A multi-core scan on one socket gets an order of magnitude more.
  - Every multi-threaded floor (a hash join, a scan with many workers) needs the socket figure.
- **Evidence:** the chapter plan's table, row "DRAM, local / remote NUMA node". EXPERT-LIST #5 (sustained, not pin, bandwidth) is mapped to "Cycles…" and "In production", which give no DRAM socket number.
- **Fix:**
  - Add a sourced socket figure for one named part. Intel's ARK "Max Memory Bandwidth" for a named Xeon, or channels × transfer rate × 8 bytes from the vendor's spec page, labelled peak.
  - Add a measured multi-threaded figure if the lab can take one (run the in-order walk on all cores, or a STREAM-style triad).
  - Add a "RAM, one socket" point to step 6, and assert both in `examples.py`.

**13. Cloud block storage (EBS) is marked out of scope for a reason that is false** (major)
- **Status:** FIXED. New Deep dive bullet "Network block volumes are another rung" and a table row "Network block volume (Amazon EBS)", quoted from the current EBS pages (gp3: 3,000 IOPS / 125 MiB/s baseline, up to 80,000 IOPS and 2,000 MiB/s, single-digit millisecond latency; io2 Block Express: up to 256,000 IOPS and 4,000 MiB/s, average latency under 500 µs at 16 KiB), instance store as the local rung ("physically attached to the host computer"), and the network-attached evidence (io2 Block Express uses AWS's SRD networking protocol to the instance's Nitro card). The expert item is remapped from "out" to the table and the Drives section. Not claimed, because no opened source says it: that EBS shows up as an NVMe device.
- **Where:** `coverage.json`, the expert item "Cloud block storage is specified in IOPS and MiB/s caps…" → `out`: "no opened source states their figures".
- **What:**
  - EXPERT-LIST #11 *opened* the EBS volume-types page and quotes its figures ("consistent sub-millisecond latency", "more than 16,000 IOPS"). So the reason given is untrue.
  - No syllabus line covers EBS or instance store (the syllabus has no match for "EBS", "block storage" or "instance store").
  - On EC2, an EBS volume shows up as an NVMe device but is network-attached, with per-volume IOPS and throughput caps. A data engineer's "NVMe drive" on AWS is often this, not a local PM9A3.
- **Fix:**
  - Add one Deep dive bullet under "Drives", and optionally a table row: "Network block volume (EBS)", with the current gp3 baseline and maximum IOPS and MiB/s and the io2 Block Express latency class, quoted from the current EBS volume-types page (fetch it with `sources.mjs`, add the quotes to `SOURCES.md`).
  - Say in one line that local instance-store NVMe and EBS are different rungs.
  - Map the expert item to that place.

**14. The same-AZ rung has no cross-AZ neighbour** (minor)
- **Status:** FIXED. New Deep dive bullet "Cross-AZ is the next rung down": the same Infrastructure Performance page reports inter-AZ medians for chosen zone pairs; its price is topic 21's. No cross-AZ number is quoted (the page gives none and says nothing about the size of the gap).
- **Where:** step 4, the Deep dive table "Same-AZ network", and "The network and object storage rungs".
- **What:** the syllabus names "same-AZ network", which implies the contrast with cross-AZ. EXPERT-LIST #17 says "cross-AZ and cross-Region are further rungs", and coverage maps it to these places, but none of them mentions cross-AZ latency. Cross-AZ *cost* is properly topic 21's.
- **Fix:** one sentence in the network section: AWS's Infrastructure Performance shows inter-AZ medians next to intra-AZ ones (finding 18). Cross-AZ is the next rung down, and its price is topic 21's.

**15. NUMA counters marked covered, but the section doesn't mention them** (minor)
- **Status:** FIXED. NUMA section: the per-node `/sys/devices/system/node/node*/numastat` counters and the `numastat` utility, with the kernel admin-guide quote (`numa_hit`, `numa_miss`, `numa_foreign`, counted in pages).
- **Where:** `coverage.json`, the expert item "NUMA is observable and controllable on Linux: numa_hit / numa_miss / numa_foreign counters…" → `deep: "NUMA: local and remote memory"`.
- **What:** that section covers `numactl` policies and `/proc/<pid>/numa_maps`. It doesn't cover `numastat` or the per-node `numa_hit` / `numa_miss` / `numa_foreign` counters.
- **Fix:** add a line on `numastat` (or `/sys/devices/system/node/node*/numastat`) with a quote from the kernel's admin-guide/numastat page, which the expert list opened.

**16. "NVMe queues" is mapped to places that don't say it** (minor)
- **Status:** FIXED by adding the sentence. The Drives section now cites the NVM Express Base Specification 2.1: "up to 65,535 I/O Queues with up to 65,535 outstanding commands per I/O Queue". The `io_uring` topic quote is dropped from that expert item. NOT claimed: SATA/AHCI's single queue of 32, because no opened source states it.
- **Where:** `coverage.json`, the expert item "The NVMe protocol… the number of queues and their depth is why it scales parallelism" → step 9, Deep dive "Drives…", and topic quote "async I/O via io_uring".
- **What:**
  - Step 9 and the Deep dive teach queue depth, but not that NVMe has many hardware submission/completion queues, where SATA/AHCI has one queue of 32.
  - `io_uring` is a kernel interface, not the NVMe queue model.
- **Fix:** either add one sourced sentence (NVM Express base specification: number of I/O queues and queue depth), or re-point the topic quote to the next topic's "sequential vs random I/O", whose chapter-plan scope says "SSD parallelism and queue depth".

**17. Seam: the held I/O cost model cites per-request S3 figures the current AWS docs no longer state** (minor; record for the release seam check)
- **Status:** RECORDED for the release seam check (not edited: another topic's file). See below.
- **Where:** `io-cost-model/index.mdx` lines 77 and 158: "about 90 MB/s per concurrent request (AWS's whitepaper suggests one request per 85–90 MB/s…)", "AWS names 8 MB or 16 MB as typical range sizes".
- **What:** this topic says, correctly, that the current S3 pages state neither figure (FACT-CHECK #36; `index.mdx` after the table).
- **Evidence:** I re-read the current English "Performance design patterns" page (`sources/s3-patterns.txt`, lines 100–125) and the Portuguese one. They suggest concurrent byte-range requests and "starting with a single request at a time. Measure the network…", with no MB/s figure and no range size. The 85–90 figure now survives only in the 2019 whitepaper and an AWS re:Post answer.
- **Fix:**
  - No change here.
  - For the I/O topic, label both figures "AWS whitepaper, 2019; no longer in the current S3 guide", or remove them.
  - The two topics then agree. This is not an order-of-magnitude disagreement, so it needs no `REVIEW.md` entry under CHAPTER.md's rule; it is recorded here for the seam check.

### Expert reader

**18. "AWS publishes no figure today" for same-AZ latency is wrong** (major)
- **Status:** FIXED. "AWS publishes no figure today" is gone from the step 4 caption, the `OffChip` note ("2009 figure · AWS shows live medians"), narration step 4 ("Amazon shows a live median in its network console, but no fixed number. Read yours, or measure."), the Deep dive table row and "Latency between instances" bullet, OUTLINE (change 4, claim 26, source note 9, Changes during build 8) and the expert item's mapping. The 500 µs stays, labelled 2009. New `SOURCES.md` section with the four quotes from the Network Manager page. NOT DONE: a dated console reading with Region and date; this run cannot open the console, and a figure that cannot be read is not shown.
- **Where:**
  - Step 4 caption ("AWS publishes no figure today, so measure yours").
  - The `OffChip` note "2009 · AWS publishes none today".
  - Narration step 4 ("Amazon publishes no figure today").
  - The Deep dive table row ("round trip **not published by AWS**") and "Latency between instances".
  - OUTLINE "Changes from the chapter plan" #4.
- **What:** AWS Network Manager's Infrastructure Performance publishes **intra-AZ** (and inter-AZ) round-trip latency, a P50 every five minutes, and the data is the same in every account.
- **Evidence:** https://docs.aws.amazon.com/network-manager/latest/infrastructure-performance/how-nmip-works.html:
  - "Intra-Availability Zone latency metrics, generated by aggregating latency measurements between all probes within a single Availability Zone."
  - "the same latency metric data is presented in all AWS accounts."
  - "Metric data is generated by computing the median (P50) … for every five-minute (5M) interval."
  - "Latency metrics represent round-trip traffic latency of synthetic traffic streams…"
  - FACT-CHECK #26 checked only the placement-groups and bandwidth pages.
- **Fix:**
  - Change the claim everywhere to: "AWS shows live intra-AZ medians in Network Manager (Infrastructure Performance), not a fixed figure in its docs: read yours there, or measure between your instances." Keep the 2009 500 µs, labelled historical.
  - Add the page to `SOURCES.md` with these quotes.
  - If a dated reading from the console is possible, show it with its Region and date.
  - Narration: "Amazon shows a live median in its network console, but no fixed number. Read yours, or measure."

**19. The HDD's 1/168 s is presented and used as a latency, but it is a per-read time with 16 queued** (major)
- **Status:** FIXED, with one deliberate change to the proposed wording. Step 4: dot "≥ 6 ms" with the note "1/168 s: Seagate measured 168 a second with 16 queued; one at a time is slower"; caption "…its 168 random reads a second, measured with 16 queued, give at least 6 ms each"; step 6: "HDD (≥ 6 ms)" plus a footnote; step 7: "≥ 62% wait", "≥ 9.6 ms", "at least 1.7 MB"; step 10 case B: "α ≥ 6 ms (a floor value)"; narration to match; Deep dive and `examples.py` (95 ms in the drive per read at QD16 by Little's law). The review proposed "at least two thirds", but 62% is the value at the floor α and two thirds would need α = 7.4 ms, which no source gives, so the reel says "at least 62%" (asserted).
- **Where:**
  - Step 4: the `OffChip` dot "HDD random read ≈ 6 ms", on the latency ladder.
  - Step 7: `HDD_ALPHA = 1/168` gives "nearly two thirds" waiting and α·β = "1.7 MB".
  - Step 10, case B "HDD, one at a time": 5,952 s.
  - Step 6: the HDD point at 6 ms.
- **What:** Seagate's 168 IOPS is measured at queue depth 16, with the drive reordering requests. By the reel's own step 9 rule, time ≈ requests × α / k, a rate of 168/s at k = 16 means each read spends about 16/168 s = **95 ms** in the drive (Little's law, Python). One read at a time pays a seek plus half a turn, which is *more* than 6 ms.
  - The reel teaches "latency is not throughput under k", then puts a throughput-derived number on the latency axis.
  - The Deep dive gets this right ("one at a time is slower"), and so does FACT-CHECK R3, but the reel's captions don't.
  - The floors stay valid lower bounds, because they are optimistic. The 62% split and α·β = 1.7 MB are understated.
- **Fix:**
  - Step 4: label the dot "≥ 6 ms", with the note "1/168 s: Seagate measured 168 a second with 16 queued; one at a time is slower".
  - Caption: "…and Seagate's 168 random reads a second, measured with 16 queued, give at least 6 ms each."
  - Step 7: "at least two thirds on a hard disk" and "at least 1.7 MB".
  - Step 10, case B: add "α ≥ 6 ms: a floor value".
  - Narration to match.

**20. Prove it 3's "18 is about what 8 can do" rests on an unstated per-request rate** (minor)
- **Status:** FIXED. Prove it 3's explanation now argues from measured ÷ floor ("18 minutes is only 1.3 times" the 13.7-minute waits floor: near the floor, so k is the limit) and says "at most 80 requests a second"; the 625 MB/s per-request argument and its narration line are dropped. `examples.py` asserts the measured 61 a second against the 80 floor rate.
- **Where:** step 15 explanation and narration.
- **What:**
  - The supporting check in `examples.py` §13 (`cap_t` = 17.3 min) assumes every GET streams at 625 MB/s, the EC2 single-flow cap, which FACT-CHECK #28 says is not an S3 figure.
  - At the 85–90 MB/s per request of AWS's older guidance (finding 17), 8 in flight would need about **40 min** (Python: 39.1–40.6), so 18 min would be *faster* than predicted.
  - The measured 18 min implies about 527 MB/s per request (Python).
  - "The job sends 80 requests a second" is the floor rate. Measured, it is 65,536 / 1,080 s = **61 a second**.
- **Fix:** argue from what needs no per-request rate: "18 minutes is 1.3× the 13.7-minute floor of the waits alone: near the floor, so k is the limit. Raise k, or use fewer, larger ranges." Also say "at most 80 requests a second".

**21. Step 7's "even at one flow's top speed" presents an assumption as an S3 property** (minor)
- **Status:** FIXED. Step 7 caption and narration: "98% on object storage even if one request streamed at 625 MB/s (an assumed top speed)" / "…at five gigabits a second, an assumed top speed"; the drawing's label reads "at an assumed 625 MB/s per request".
- **Where:** step 7 caption and narration ("98% on object storage even at one flow's top speed").
- **What:** 625 MB/s is EC2's instance-to-instance single-flow cap. The drawing labels it "one flow's cap", but neither the caption nor the narration says it is assumed for S3 (FACT-CHECK #28).
- **Fix:** "98% on object storage even if one request streamed at 625 MB/s (an assumed top speed)". Narration: "even if one request streamed at five gigabits a second."

**22. "At k = 41 the floor matches the drive" reads as the answer, not a minimum** (minor)
- **Status:** FIXED. Step 12 caption and narration say "with at least k = 41 in flight"; step 1 says "the least setting that could make them match" (narration too).
- **Where:** step 12 caption and narration. Step 1 promises "the setting that makes them match".
- **What:** 41 assumes instant transfers. The readout and Deep dive say a real run needs 52–82 in flight, but the sentence the learner remembers is "41".
- **Fix:** "with at least k = 41 in flight the floor matches the drive". In step 1, "the least setting that could make them match".

**23. Step 6 plots the 2009 network latency against today's bandwidth without saying so** (minor)
- **Status:** FIXED. `TwoAxes` footnote now says "network: 2009 latency · HDD: at least 6 ms". The dot was not moved to an AWS median because no fixed figure can be quoted (finding 18).
- **Where:** `TwoAxes`: the "network" point at 500 µs with 1.25–12.5 GB/s.
- **What:** the house rules say a dated number carries its date on screen. The footnote gives only "network, object storage: per instance at 100 Gbit/s".
- **Fix:** add "network latency: 2009 figure" to the footnote, or move the dot to an AWS intra-AZ median once one is sourced (finding 18).

**24. The loopback figure differs in three places and nothing asserts it** (minor)
- **Status:** FIXED. Both Deep dive places say "about 30–40 µs median here (several runs)"; the `examples.py` comment records the runs (33, 36, 40 µs; this fix's run: 34 µs). The assertion stays a wide range (1 µs to 5 ms) on purpose: a tighter bound would fail on a busy CI machine.
- **Where:** `index.mdx` table and network section ("about 36 µs median"); `examples.py` §14 comment ("about 33 µs"); this review's run printed 40 µs.
- **Fix:** say "about 30–40 µs median here (several runs)" in both Deep dive places, and make the comment in `examples.py` match.

**25. Step 8 still says "158 ns, the whole DRAM wait"** (minor)
- **Status:** FIXED. Step 8 explanation and narration: "158 ns: the whole DRAM wait, plus finding the address".
- **Where:** step 8 explanation and narration.
- **What:** FACT-CHECK R13 changed this to "the whole DRAM wait (plus address translation)". A dependent walk over 1 GiB in a KVM guest also pays TLB misses and nested paging, but the reel text did not get the change. The Deep dive lab text has it.
- **Fix:** "158 ns: the whole DRAM wait, plus finding the address". The explanation stays under 75 words.

**26. Prove it 1 prices random 8 KB reads at the sequential rate without saying so** (minor)
- **Status:** FIXED. Prove it 1: "…the 16 GB of pages, at the drive's best rate of 6,800 MB/s (2.4 s), become the floor"; narration "the bytes, at the drive's best rate, become the floor".
- **Where:** step 13 explanation ("the 16 GB of pages at 6,800 MB/s (2.4 s) become the floor").
- **What:**
  - 6,800 MB/s is the 128 KB sequential figure.
  - Samsung publishes no random 8 KB rate. Random 4 KB is rated at 1,000 KIOPS = 4.1 GB/s.
  - The floor stays valid because it is optimistic, but a reader could take 6,800 MB/s as the random-read rate.
- **Fix:** "…at the drive's best rate, 6,800 MB/s (2.4 s), become the floor".

**27. Step 5: allocation is first-touch, and numactl doesn't measure** (minor)
- **Status:** FIXED. Step 5 caption: "Linux places a page on the node of the CPU that first touches it…" and "Pin memory to each node with numactl and time the lab's walk"; narration to match; the Deep dive's NUMA "default" bullet adds first-touch, backed by a new quote from Intel's manual (Example 11-9: "Linux implements malloc to commit physical page at first touch/access").
- **Where:** step 5 caption and narration: "Linux allocates on the node of the CPU that asks… Measure your ratio with numactl."
- **What:**
  - The page is placed when it is first touched (the page fault), not when `malloc` is called.
  - `numactl` pins threads and memory; the lab's walk does the measuring.
- **Fix:** "Linux places a page on the node of the CPU that first touches it…" and "Pin memory to each node with numactl and time the lab's walk."

### For the release seam check (findings 2 and 17: other topics' files, not edited by this topic)

- **2.** `asymptotic-notation-logarithms/reel.tsx`, step "Big-O is not a stopwatch": change "at 100 µs a step (a disk read)" to "(an SSD read)". This topic's reel shows a hard-disk read at 6 ms or more and an NVMe read at 80 µs, so "disk read = 100 µs" clashes with it. (A single-line wording fix; the arithmetic of that step is unchanged.)
- **17.** `io-cost-model/index.mdx` lines 77 and 158 give "about 90 MB/s per concurrent request (AWS's whitepaper suggests one request per 85–90 MB/s…)" and "AWS names 8 MB or 16 MB as typical range sizes". The current S3 pages state neither (FACT-CHECK #36; this topic's Deep dive says so). Label both "AWS whitepaper, 2019; no longer in the current S3 guide" or remove them. Not an order-of-magnitude disagreement, so no `REVIEW.md` entry is required there under CHAPTER.md's rule; recorded here so the seam check finds it.
- **7 (also logged for a human)** in `syllabus/review-notes/de-cuts.md`: the orphaned false-sharing lab clause.

### Proposed `coverage.json` → `gapReview` (written once findings 1–27 were dealt with; see the Status lines above)

```json
"gapReview": {
  "date": "2026-10-12",
  "by": "content-review agent (fresh Opus, wrote nothing in this topic): flow, basics, gap hunt, expert reader against the syllabus line, SOURCES.md, EXPERT-LIST.md and the AWS Network Manager docs; findings 1–27 in REVIEW.md fixed (findings 2, 7 and 17 recorded for other topics, not edited here)",
  "resolved": [
    "Socket-level DRAM bandwidth added, sourced and asserted (finding 12)",
    "EBS / network block volumes: a Deep dive line and table row with current quoted figures; expert item remapped from 'out' (finding 13)",
    "Same-AZ latency: AWS Network Manager Infrastructure Performance (intra-AZ and inter-AZ P50 round trip) cited; 'AWS publishes no figure' removed (findings 14, 18)",
    "HDD 1/168 s labelled a QD16 per-read time and a floor value, not a latency (finding 19)",
    "Basics names cache line and prefetching, NVMe SSD and HDD, latency- and bandwidth-bound, key prefix and flow (finding 8)",
    "numastat counters and the NVMe queue mapping fixed (findings 15, 16)",
    "Prove it 3 argued from measured ÷ floor; per-request rate assumptions stated (findings 20, 21, 22)"
  ],
  "open": []
}
```

The coverage check needs only `date`, `by` and an empty `open`; `resolved` follows the held I/O and Python topics. If a finding is closed by recording why it is out of scope rather than by writing content, its line in `resolved` should say so.

### Fix run (2026-10-12)

- A fresh Sonnet fix agent dealt with findings 1–27 (statuses above). Checks run: `python3 examples.py`, `node scripts/sources.mjs check` (134 quotes, 0 problems), `npm run build`, `npm run test:examples`, `node scripts/check-all.mjs --only reels --topic memory-hierarchy-latency-numbers`, plus docs, sources, narration, locked and links.
- Not fixed, with reasons: the optional measured multi-threaded DRAM figure (finding 12); a dated console reading of an intra-AZ median (finding 18); the SATA/AHCI comparison (finding 16). Each would need a source or a measurement this run does not have, so the claim is left out.
- Narration audio was not regenerated (section 7 does that); the text in `narration.json` is final.
