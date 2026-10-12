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

## Looks and learning review (ROUTINE.md section 5)

- **Reviewer:** a fresh Sonnet agent (effort high) that wrote nothing in this topic.
- **Date:** 2026-10-12.
- **Looked at:** all 40 screenshots in `site/test-results/` (`desktop-` and `phone-memory-hierarchy-latency-numbers-01` to `-15`, including the `-q` question frames of steps 2, 8, 13, 14 and 15), against `OUTLINE.md`, `narration.json`, `DESIGN.md` ("The looks review checks"), the CHAPTER.md "One visual language" grammar, and `examples.py` for every value shown. Where a claim about a drawing needed the code (step 5 paths, step 12 slider text), I read `scenes.tsx` too.
- **Truthfulness of values:** every number on screen that I could recompute matches `examples.py` and the caption. On the log axes the marks sit where the values say they should (step 4: 80 µs at 0.54 of the axis, 6 ms at 0.75, the chip+DRAM bar ending at 100 ns; step 6: NVMe 6.8 GB/s, RAM 12 to 460.8 GB/s, object storage ring at 100 ms and 12.5 GB/s; step 10: 162 s at 2.21 decades, 5,952 s at 3.77). Steps 7, 11, 12, 13, 14 and 15 arithmetic checks out (98% wait, 28.7 s, 160 s at k = 41, k ≈ 52 and 82, 13.1 s, 1.3 × 13.7 min). No value contradicts a caption. The findings below are about looks and teaching, not numbers.
- **What works and should not be disturbed:** step 2's answer frame (one bracket, "× 1,000,000", six decades); step 3's ladder (cycles on the left, ns on the right, 2 GHz conversion stated); step 7's three bars (taupe wait, caramel transfer, one formula; the best step of the reel); step 11 on a deliberately linear axis; step 9's staircase against a stack; step 12's tie back to the opening problem.
- **Summary:** 19 findings, **6 major and 13 minor**. The majors: step 4 (text out of its card on phone, and no focal point among about 13 text items), step 5 (the cost is not drawn in the final frame), step 8 (the "20×" label sits under the 158 ns bar), step 12 (the payoff text is the smallest on the page), and the three Prove it steps (text pills, no mechanism picture).

**Fix status (2026-10-12, fix agent):** 16 findings fixed in full (1, 2, 4, 5, 6 and 8 to 18), 2 partly (7: the thread picture; 19: pacing, no step split) and 1 not fixed: finding 3 (the phone answer panel is shared-player behaviour: **for the owner**, see its Status). Each finding has a **Status** line.

Numbering restarts at 1 in this section. "Phone" means the 390 px screenshots, "desktop" the 1440 px ones.

### Step by step

1. **Step 1, both sizes. Minor.**
   - **What:** the two "pipes" are identical grey bars and the stopwatches are decoration; nothing in the picture hints that the two sources differ, so the "?" is the only content. The frame is the problem statement, so this is acceptable, but on phone the drawing fills only the top 45% of the frame.
   - **Evidence:** `desktop-…-01.png`, `phone-…-01.png`: both pipes 140 units, same weight and colour, both stopwatches "≥ ? s".
   - **Fix:** let the NVMe pipe be short and the object-storage pipe visibly longer or dashed (length, not a number), so the question "how much longer?" is visible before any value. Optional: drop the stopwatch glyphs and keep "≥ ? s" as the one big text.
   - **Status:** FIXED. `Problem`: the NVMe pipe is short and solid (40 units), the object-storage pipe long and dashed (100 units), and the caption line says "longer pipe, longer wait", so the "how much longer?" is visible before any value. The stopwatches stay (they carry the "≥ ? s"). NOT CHANGED: the phone frame still uses only the top part of the visual area; the drawing is width-limited, and the frame is the problem statement (the reviewer called it acceptable).

2. **Step 2 question frame, both sizes. Minor.**
   - **What:** the unlabelled line puts the RAM dot at about 8% and the object-storage dot at about 85% of the width, so on the question frame the two values look a normal distance apart. The narration then says "on a straight axis the RAM read would vanish". The picture implies the opposite until the answer.
   - **Evidence:** `phone-…-02-q.png`: dots 170 px and 995 px apart on an axis with no ticks.
   - **Fix:** either draw the true linear picture (the RAM dot on top of the left end, the object-storage dot far right, so "vanish" is visible and the answer frame's log axis is the repair), or draw the line broken ("//") to say the scale is not to scale.
   - **Status:** FIXED. `TwoDots` question frame is now the true linear picture: the RAM dot sits on the zero end, the object-storage dot at the far end, labelled "straight axis, drawn to scale", so "the RAM read would vanish" is visible and the answer frame's log axis is the repair.

3. **Steps 2, 8, 13, 14, 15, phone, after answering. Minor.**
   - **What:** the explanation card starts below the drawing and is cut off by the control bar, with only its first line visible ("About a million: 100 ms ÷ 100 ns = …"). Nothing says it scrolls. Predict steps are where the learner learns most; the explanation is the payoff.
   - **Evidence:** `phone-…-02.png`, `-08.png`, `-13.png`, `-14.png`, `-15.png`: card ends at the bottom bar edge in mid-sentence.
   - **Fix:** this is the shared player, so check the other topics' answered predict steps. If the card scrolls, add a fade or "more" cue; if not, collapse the option buttons to one line once answered so the card fits. Keep explanations at or under 75 words (steps 8 and 13 are about 85 and 66).
   - **Status:** NOT FIXED in this topic, for the owner of the shared player: the answer panel is the shared `ReelPlayer` (cut off by the control bar on phone, no scroll cue, option buttons not collapsing once answered). This topic does not change shared reel code or the player. FIXED here: the one part that is in this topic, the explanation length. The step 8 explanation is now 64 words (was about 85) and every explanation in this reel is 64 to 72 words, under the 75-word limit. **For the owner:** check whether the panel scrolls on phone, and add a fade or "more" cue or collapse the answered option buttons to one line; it affects every predict step of every topic.

4. **Step 3, both sizes. Minor.**
   - **What:** the time axis sits above the first row and the dots are up to five rows below it with no guide lines, so on phone you must trace a dot up to the axis to read it; the row values are written anyway, so the axis is only reassurance. Two notes plus four tick labels sit above the ladder before the eye reaches a row.
   - **Evidence:** `phone-…-03.png`: axis at y 340, DRAM dot at y 944; two taupe lines above the axis.
   - **Fix:** draw faint vertical decade lines (opacity 0.15) down through the rows, as step 6 does for its horizontal ones, and move "log scale: each tick ×10" onto the axis line.
   - **Status:** FIXED. `OnChip`: faint vertical decade lines run from the axis down through all five rows, and "log: ×10 a tick" now sits on the axis line, so one note ("at 2 GHz: 1 cycle = 0.5 ns") is left above the ladder.

5. **Step 4, phone. Major.**
   - **What:** note text runs out of its row card. The HDD note "with 16 queued; one at a time is slower" ends 48 px (about 16 CSS px) past the card's right edge; "2009 figure · AWS shows live medians" touches the edge; the label "round trip in one datacenter" ends 35 px from its note.
   - **Evidence:** `phone-…-04.png`: row cards end at x 1100; the HDD note ends at x 1148.
   - **Fix:** shorten the notes ("QD16 measured; one at a time is slower", "2009 figure; AWS shows live medians") or give the notes the full card width on their own line below the name and value. The reel test missed it because the text is inside the drawing's frame.
   - **Status:** FIXED. `OffChip`: every row note is now 24 to 30 characters on one line ("Samsung datasheet, 4 KB read", "from 2009; measure yours", "floor: 168 a second, 16 queued", "AWS docs; medians tens of ms"), so none reaches the card edge at phone scale (checked in the phone screenshot and by the reel test). The HDD value label moved left of its dot so it does not run into the right guide.

6. **Step 4, both sizes. Major.**
   - **What:** no focal point, and the brightest, widest mark is the wrong one. The eye lands on the caramel chip + DRAM bar (0.5-100 ns), but the point of the step is the jump of three decades after it. There are about 13 text items (5 names, 5 values, 4 notes, axis, bracket) and five identical caramel dots, so nothing says that the 500 µs value is a 2009 figure and the HDD value a floor, while the NVMe value is a datasheet number. The "× 1,000,000" bracket under the rows is tied to nothing: it spans 100 ns to 100 ms but is drawn below the last row.
   - **Evidence:** `desktop-…-04.png`: the bracket from x 912 to 1237 under the object-storage row; every dot the same size and colour.
   - **Fix:** make the chip + DRAM row a quiet taupe/latte bar (it is step 3's whole ladder), keep caramel for the first off-chip dot, and draw the ×1,000,000 bracket on the axis itself between the DRAM end and the object-storage dot, with a faint vertical guide from each. Show the 2009 and floor values as hollow dots (the same convention as step 2's hollow object-storage dot) and say so in one note. Cut the notes to one short line per row.
   - **Status:** FIXED. `OffChip` redrawn: the chip + DRAM bar is a quiet taupe bar; the four off-chip dots are the caramel focus; the 2009 round trip and the HDD floor value are hollow dots with one legend line ("hollow dot: a 2009 or floor figure"); the "× 1,000,000" bracket is now on the axis, from the end of DRAM (100 ns) to the object-storage dot (100 ms), with a faint caramel guide down to each. Notes cut to one short line per row. NOT DONE: the HDD 168-a-second note keeps "16 queued" (the 1/168 s derivation is in the Deep dive and the caption).

7. **Step 5, both sizes. Major.**
   - **What:** the final frame does not show the cost. The outline promised two faint caramel trips, local and the longer remote, but both are drawn at 35% opacity and read as the same brown as the taupe link. The remote path runs down the interconnect and through the CPU 1 box, so the picture says "CPU 0 reaches RAM 1 through CPU 1", and its overlap with the thick link hides it. The "local: 1×" and "remote ≈ 20% slower" readouts sit below, detached from the paths they describe. The brightest elements are the eight cream RAM bars (opacity 0.85), not the point. "node 0" and "node 1" sit on the dashed border and touch the CPU box on phone. The caption's other idea (a thread that moves leaves its memory behind) has no picture.
   - **Evidence:** `desktop-…-05.png`, `phone-…-05.png`; `scenes.tsx` `Numa`: `opacity={0.35 * …}` on both paths, remote path points `[130, …] → [130, MID[1]] → [334, MID[1]]`.
   - **Fix:** in the final frame draw the local trip as a short caramel line labelled "local 1×" beside it and the remote trip as a longer cinnamon or caramel line beside RAM node 1 labelled "remote ≈ 20% slower", both at opacity 0.8 or more; route the remote path beside the interconnect, not through CPU 1; dim the RAM bars to latte/taupe; move node labels inside the dashed border with 8 units of clearance.
   - **Status:** FIXED, except the thread picture. `Numa` final frame: the local trip is a latte line labelled "local 1×" beside it, the remote trip a caramel line (opacity 0.95) labelled "remote ≈ 20% slower" beside it, routed down the interconnect between the CPU and RAM columns instead of through CPU 1; the RAM bars are dim taupe; the node labels sit inside the dashed border with clearance. NOT FIXED: the caption's other idea (a thread that moves leaves its memory behind) still has no picture; it would need a third animated trip on a step whose one idea is local against remote cost (DESIGN.md: one idea, one picture), so it stays in the caption and narration.

8. **Step 6, both sizes. Minor.**
   - **What:** the scatter is the right idea and the eye lands on the caramel object-storage ring, which is the surprise. But: "up to 12.5 GB/s" is placed between the network bar and the ring and reads as the network's label (phone); the network bar's low end (1.25 GB/s, 10 Gbit/s) is not explained, the note only gives 100 Gbit/s; "network" appears nowhere in the caption or narration; L1, NVMe and HDD show no bandwidth value, so the learner cannot read their position except from the axis; three taupe footnote lines add to the clutter.
   - **Evidence:** `phone-…-06.png`: the label at x 768, the network bar at x 748 and the ring at x 973.
   - **Fix:** put "12.5 GB/s" directly under or above the ring (and "up to" in the note); add "1.25 to 12.5 GB/s (10 to 100 Gbit/s)" to the network note or drop the bar's lower end; label NVMe "6.8 GB/s" and HDD "285 MB/s" the way the RAM end is labelled; add one clause about the network round trip to the step 6 caption or leave the network point out of this step and keep it for step 4.
   - **Status:** FIXED, one part by omission. `TwoAxes`: the network point and its two footnote lines are removed (the reviewer's second option: the network round trip and its Gbit/s are in step 4 and the Deep dive), which also removes the misplaced "up to 12.5 GB/s" label and the unexplained 1.25 GB/s end. "up to 12.5 GB/s" now sits directly under the object-storage ring; NVMe is labelled "NVMe · 6.8 GB/s" and the hard disk "HDD (≥ 6 ms) · 285 MB/s". Two footnote lines remain. The points arrive one per 0.9 s in the order the voice names them.

9. **Step 7, both sizes. Minor.**
   - **What:** the best step; two small things. The caramel segment is never named (the grey one says "wait", the other says nothing), and each bar's total ("234 µs") sits 29 px under its own bar but 40 px above the next bar's label, so it can read as belonging to the next row.
   - **Evidence:** `phone-…-07.png`: "234 µs" at y 601, bar ends at y 572, "HDD" label at y 641.
   - **Fix:** write "bytes" inside the caramel segment (or "34% wait · 66% bytes") and put each total on the right end of the bar's own line, above the bar.
   - **Status:** FIXED. `Split`: the caramel segment is named ("66% bytes", "≤ 38% bytes" inside the bar; "2% bytes" under the object-storage bar, whose caramel part is too narrow for text) and each total moved to the right end of its own bar's label line, above the bar.

10. **Step 8 answer frame, both sizes. Major.**
    - **What:** the label "20× slower at random" is placed under the third bar (158 ns), so it reads as describing that bar (which is 225× the in-order read). The 20× is the ratio of the first two bars. The step's teaching (a 64-byte line serves eight numbers; the prefetcher; overlapping misses; the dependent chain) is in the caption only; the drawing shows three horizontal bars. The bars are on a log axis that starts at 0.1 ns, so bar length is not proportional to the time and the "20×" is only a small length difference.
    - **Evidence:** `desktop-…-08.png`: "20× slower at random" at y 561, directly under the 158 ns bar; bars end at x 727, 959, 1147.
    - **Fix:** put a bracket "20×" between the first two bars' ends and a second bracket "11×" or "the whole DRAM wait" between the second and third; draw the bars as dots on the axis (as step 3 does) so no baseline is implied. To carry the cache-line idea, animate the question frame's array so that in-order highlights one 64-byte line (eight cells) at a time and random touches one cell per line.
    - **Status:** FIXED. `RamWalk` answer frame: the bars are now dots on the log axis with faint decade lines (no baseline implied), a "20×" bracket from the in-order dot to the random dot and an "11×" bracket from random to dependent, and the third dot says "158 ns = the whole DRAM wait"; the old "20× slower at random" text under the third bar is gone. The question frame now shows 64-byte lines: eight cells per line with a line tint, in order highlights the whole line, random one cell of its line, with the label "one line = 64 bytes = 8 numbers". The "11×" is asserted in `examples.py` (158 / 14).

11. **Step 8, both sizes. Minor.**
    - **What:** colour grammar: "in order" is caramel and "at random" is cinnamon, but in the chapter grammar caramel is the cost being counted and cinnamon the alternative compared. The cost being counted here is the random read.
    - **Evidence:** `desktop-…-08.png` legend squares.
    - **Fix:** swap them (random caramel, in order cinnamon or latte), or make in order latte, since it is the baseline.
    - **Status:** FIXED. Random is caramel (the cost counted) and in order is cinnamon (the alternative compared), in the legend, the walkers and the dots; the dependent walk is taupe (waiting).

12. **Step 9, both sizes. Minor.**
    - **What:** the idea (a staircase against a stack) is clear, but the caramel transfer tip on each bar is 2 units wide and nearly invisible, and no legend says that taupe is the wait and caramel the transfer. The 8-in-flight panel has no finish mark, so the saving (640 µs against 80 µs) must be inferred from two axes. Side by side on desktop, "640 µs" ends 27 px from the next panel's "0". "32 × 4 = 128" is unexplained.
    - **Evidence:** `desktop-…-09.png`; `phone-…-09.png` notes at x 1086 almost at the right margin.
    - **Fix:** one legend line ("wait · transfer"); a caramel finish line across both panels at the time the last read ends (640 µs and 80 µs), labelled; give the panels more gap; replace "32 × 4 = 128" with "32 queues, depth 4" or move it to the Deep dive.
    - **Status:** FIXED. `InFlight`: a legend line ("wait", "transfer (drawn wider than it is)", with swatches), the transfer tip widened to 5 units, a caramel finish line across each panel labelled "done at 640 µs" and "done at 80 µs", a 50-unit gap between the desktop panels, and "32 × 4 = 128" replaced by "Samsung measured it with 128 in flight" (the 32 queues of depth 4 stay in the Deep dive).

13. **Step 10, both sizes. Minor.**
    - **What:** the core idea of the topic (the floor is the larger term) lands, but the step carries about 14 text items: a two-line formula, an axis, two two-line titles with jargon ("QD1", "α ≥ 6 ms (a floor value)"), four bar labels, two verdicts and a footnote. The verdicts use different colours ("bandwidth-bound" caramel, "latency-bound" crema), which breaks the grammar. The footnote "with nothing in flight together, the two add up" reads as contradicting max(). The bars are on a log axis starting at 1 s, so the 29 s against 5,952 s bars look about two-fold apart.
    - **Evidence:** `phone-…-10.png`: the second title runs 40 characters at y 797; the footnote at y 1056.
    - **Fix:** one-line titles ("1 TiB, NVMe, 32 in flight"; "orders, HDD, one at a time"), put "QD1" and "floor value" in the Deep dive, colour both verdicts the same, drop the footnote (or move it to the caption), and show the two terms as dots on the axis with the larger one ringed.
    - **Status:** FIXED. `Floor`: one-line titles ("1 TiB, NVMe, 32 in flight", "orders, HDD, one at a time") with one taupe sub-line ("128 KiB reads · α = 20 µs", "8 KB pages · α ≥ 6 ms"); the two terms are dots on the log axis (waits taupe, bytes caramel) with the larger one ringed in crema, so the 29 s against 5,952 s gap is a position, not a bar length; both verdicts are crema; the "nothing in flight together" footnote is dropped (the caption says a floor ignores everything else) and "ring = the floor" takes its place. "QD1" and "a floor value" stay in the caption and the Deep dive only.

14. **Step 11, both sizes. Minor.**
    - **What:** "28.7 s" appears twice, once as the serif number at the top right with no label, once on the HDD row; the first reads as a total for the table. The caption's takeaway (a scan that takes a minute on NVMe means 59 unexplained seconds) has no picture. The two short bars are tiny but the linear axis is the point and is labelled.
    - **Evidence:** `desktop-…-11.png`: unlabelled "28.7 s" at (1254, 229).
    - **Fix:** remove the top serif number (or turn it into "41×" slower for HDD than NVMe, which is the surprise) and add a final beat: a taupe "60 s (your scan)" bar that runs off the axis with "the other 59 s are not the drive".
    - **Status:** FIXED. `OrdersRace`: the unlabelled serif "28.7 s" is removed (the HDD row carries it) and a final beat is added: a taupe "your scan, if it takes a minute" bar (60 s) with a caramel 1.2 s start, running off the axis with an arrow, and "the other 59 s are not the drive" under it. The reviewer's "41×" was not used: 28.7 / 1.2 is not 41 (it is 24), and the 59 s is already asserted in `examples.py`.

15. **Step 12, desktop. Major.**
    - **What:** the interactive block under the drawing, which carries the payoff (the waits and bytes at k, and the caveat that a real run needs more: k ≈ 52 at 625 MB/s, k ≈ 82 at 166 MB/s), is set in HTML at 0.64 to 0.72 rem, uppercase, in latte and taupe. It is the smallest text in the reel and about two thirds of the drawing's smallest label. The caveat is the sentence the caption and the narration end on.
    - **Evidence:** `desktop-…-12.png` y 650 to 705; `scenes.tsx` `Verdict`: `text-[0.72rem]`, `text-[0.68rem]`, `text-[0.64rem]`.
    - **Fix:** use at least 0.9 rem for the readout, 0.8 rem for the caveat, drop the uppercase, and put the caveat in the drawing (a taupe 13-unit line) so it is also in the reduced-motion final frame.
    - **Status:** FIXED. `Verdict`: the readout is 0.95 rem and the slider label 0.8 rem, no uppercase; the caveat ("k ≈ 52 at 625 MB/s a request, k ≈ 82 at 166 MB/s") is now three 13-unit taupe lines in the drawing, so it is in the reduced-motion final frame too.

16. **Step 12, both sizes. Minor.**
    - **What:** about 12 labels compete: "k = 41" in serif at the top right, again as "K = 41" (capital) in the slider readout, "162 s · bandwidth-bound" floating mid-right with no line to the NVMe bar, a legend sentence "caramel tick: bytes at 100 Gbit/s, 88 s", "waits: 160 s", the header and its sub-line, the axis, and the slider. The slider has no end labels or "drag k" cue. A bar that mixes two quantities (a taupe wait bar with a caramel tick for the bytes) needs that legend sentence to read.
    - **Evidence:** `phone-…-12.png`: "162 s · bandwidth-bound" at y 529, the NVMe bar at y 475.
    - **Fix:** drop the top "k = 41" (the slider says it); put "162 s" at the end of the NVMe bar and "160 s waits" at the end of the object-storage bar; replace the legend sentence with a tick label "bytes 88 s" on the tick; label the slider "drag k: 1 to 128".
    - **Status:** FIXED. `Verdict`: the top "k = 41" serif is gone (the readout shows k, and now follows the animated k and moves the slider thumb); "162 s · bandwidth-bound" sits at the end of the NVMe bar; "waits: 160 s" at the end of the object-storage bar; the legend sentence is replaced by a "bytes 88 s" label on the tick; the slider reads "drag k: 1 ... 128".

17. **Steps 13, 14, 15, both sizes. Major.**
    - **What:** no picture. The question frame is a stack of text pills that repeat the caption, and the answer frame adds three or four caramel lines of arithmetic. DESIGN.md: "if the picture would make sense without the concept, it is decoration". The ideas have natural pictures that earlier steps already drew: step 13 (waits against bytes, 160 s against 2.4 s: the step 10 bar pair), step 14 (a chain runs at its slowest link: three links in a row with widths 6,800, 625 and 3,125 MB/s, the narrowest in caramel), step 15 (measured 18 min against the 13.7 min floor: one bar and one tick, and "k is the limit"). In step 14 the pills include "no cluster placement group" and "both instances: 25 Gbit/s" with no visual role.
    - **Evidence:** `desktop-…-13.png`, `-14.png`, `-15.png`: five pills and four lines of text, nothing to compare by eye.
    - **Fix:** keep the question frame as it is (it must not leak the answer), and in the answer frame replace the arithmetic lines with one small drawing per step: step 13 two bars (160 s taupe, 2.4 s caramel) with "66× lower"; step 14 a three-link pipe with the 625 MB/s link in caramel and "13 s = 8.2 GB ÷ 625 MB/s"; step 15 a measured 18 min bar, a floor tick at 13.7 min, "1.3×" and "raise k". Keep one line of arithmetic under each.
    - **Status:** FIXED. The question frames are unchanged in idea; the answer frames now draw the mechanism with numbers already on the page: step 13 two linear bars (160 s taupe, 2.4 s caramel) with "a floor 66× lower"; step 14 a three-link pipe (6,800, 625 caramel, 3,125 MB/s, width = rate) with "13 s = 8.2 GB ÷ 625 MB/s"; step 15 a 13.7 minute floor bar, an 18 minute measured bar, a dashed floor line and "1.3× the floor: near it, so raise k" with one line of arithmetic. The answer frame no longer repeats the pills. The three new facts (3,125 MB/s, 25 Gbit/s) are asserted in `examples.py`. Pills reduced as in finding 18.

18. **Steps 13, 14, 15, phone. Minor.**
    - **What:** the Prove it drawings are scaled to fit the frame height, so the pills and the answer lines render small while a quarter of the frame is empty. Step 15's answer lines measure about 8 CSS px per line (4.8 CSS px per character), step 14's about 8.7 px, step 13's about 9.6 px, against the 9 px floor.
    - **Evidence:** `phone-…-15.png` y 523 to 640: four caramel lines about 20 screenshot px high.
    - **Fix:** reduce the pill count on phone (steps 14 and 15 have five pills), or use 15 units for the answer lines, or let the drawing use the empty height; a picture per finding 17 would also use the space.
    - **Status:** FIXED. The question frame's height no longer reserves room for the answer lines (that was the empty quarter), and steps 14 and 15 have four pills instead of five ("no cluster placement group" and "one TCP connection" merge; "8 requests in flight" and "α ≈ 100 ms" merge). The answer drawings are 290 units high with 15 to 20 unit text, so they render at about 11 px on phone (the reel test's 9 px floor passes).

19. **Pacing, steps 4, 6, 10, 12. Minor.**
    - **What:** the animations finish in 3.6 to 4.2 s while the narration runs 49 s (step 4), 33 s (6), 40 s (10) and 39 s (12) at about 2.6 words a second (127, 86, 104 and 102 words). For most of the voice-over the learner looks at an unchanged final frame, and the voice cannot say "this one" about a row. Step 8's answer is 85 words (about 33 s) over a 1.6 s animation.
    - **Evidence:** word counts from `narration.json`; `duration` values in `reel.tsx`.
    - **Fix:** the cheapest fix is to split step 4 into two frames (NVMe and the network round trip; then HDD and object storage, each ending on its bracket) and trim steps 10 and 12 to about 25 s each; or add sub-beats that highlight each row or bar as the voice names it. Check against the real audio in section 7.
    - **Status:** PARTLY FIXED. Sub-beats added where cheap, in the one clock the animation has: step 4's rows now arrive in the order the voice names them (NVMe, hard disk, object storage, then the round trip), 1.2 s apart, then the bracket (duration 3.8 to 7.0 s); step 6's points arrive 0.9 s apart in narration order (4.0 to 5.6 s); step 10's two jobs build bytes dot, waits dot, ring and verdict one by one (3.8 to 7.0 s); step 12's k holds at 1 for the "1.8 hours" beat then steps 0.5 s apart (4.2 to 6.4 s); step 11 gained a closing beat (3.8 to 5.2 s). Narration trimmed: step 8's answer 85 to 81 words, step 10 104 to 91, step 12 102 to 95. NOT DONE: splitting step 4 into two steps (it would renumber every step, clip and screenshot, and rewrite the OUTLINE storyboard for a gain the real audio may not need) and trimming to 25 s each (the facts in those lines are all claims checked in the fact-check); the answer frame of step 8 stays a still because the player starts the answer frame at the question's clock. Check the beats against the real audio in section 7.
