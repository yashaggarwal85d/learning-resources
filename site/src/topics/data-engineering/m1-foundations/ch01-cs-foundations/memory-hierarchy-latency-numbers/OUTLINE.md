# OUTLINE: Memory hierarchy and latency numbers (`de.memory-hierarchy-latency-numbers`)

Content plan and storyboard (ROUTINE.md 2.2), written 2026-10-12 before anything else was built. Writing follows this file. A change of plan during writing is made here first, with the reason.

- **Syllabus line (DE §1.2, full):** "registers → L1/L2/L3 → DRAM (local vs remote NUMA) → NVMe SSD → HDD → same-AZ network → object storage; order-of-magnitude latency and bandwidth per tier, and estimating a job's lower bound from them before running it."
- **Contract:** `CHAPTER.md` → "### 6. Memory hierarchy and latency numbers". Scope, outcomes, concepts and bridge are kept as written there. The handoff has to change (see "Changes from the chapter plan" #1).
- **Previous topic:** 5, Asymptotic notation and logarithms (refresher, built, held). Its handoff: "Big-O counts steps as if each cost the same. Next: the memory hierarchy, where the same step costs anything from a nanosecond to tens of milliseconds." Its step 10 ("Big-O is not a stopwatch") already shows two Θ(n) scans of 100,000,000 steps taking "0.1 s" and "2.8 hours" at an illustrative 1 ns and 100 µs a step. This reel picks up there: the ladder those per-step prices come from.
- **Next topic (not skipped):** CPU caches (7), Threads (8) and Virtual memory (9) are marked *(skipped)* in `syllabus/data-engineering.md` (owner decision 2026-10-12, made after CHAPTER.md was planned). The next topic that gets a reel is **10, Storage devices and fsync durability**: "sequential vs random I/O, block size and alignment, SSD internals (FTL, erase blocks, garbage collection, write amplification), async I/O via `io_uring` (now an `io_method` option in PostgreSQL 18), fsync semantics, and the 2018 "fsyncgate" lesson that a failed fsync cannot simply be retried."
- **Kind:** full, about 12 minutes, 15 steps, 5 predict steps (2, 8, 13, 14, 15). Held-topic shape: problem from the running example (1) → early predict (2) → mechanism (3–11) → "Back to the problem" (12) → "Prove it · 1 of 3 … 3 of 3" (13–15).
- **Running example (CHAPTER.md):** `orders` = 1,000,000 pages of 8 KB (8,192 bytes) = 8,192,000,000 bytes = 8.2 GB = 7.6 GiB. `order_events` = 1 TiB (2⁴⁰ bytes), today on a local NVMe drive; the plan is to read it from object storage.

## Learning outcomes

After this topic the learner can:

1. Place each tier (registers, L1/L2/L3, DRAM local and remote, NVMe, HDD, same-AZ network, object storage) on a log scale of latency, and separately of bandwidth, to within an order of magnitude, and say where each number comes from and how old it is.
2. Write the cost of one transfer as **T(n) = α + n/β** and say when a request is mostly waiting (n well below α·β).
3. Compute a job's **floor** before running it, **max(bytes/β, requests × α / k)**, and say whether it is latency-bound or bandwidth-bound.
4. Solve for the concurrency k that hides a latency (k ≥ requests × α / target time), and say what else must then hold (per-request bandwidth, request-rate limits, the NIC).
5. Explain why the remote-NUMA and network rungs matter for data systems, and measure the RAM rungs (sequential vs random) and the NUMA ratio on their own hardware.

**The problem (opened in step 1, closed in step 12).** "The nightly job reads all 1 TiB of `order_events` from a local NVMe drive. The team wants to read it straight from object storage. Will it get slower, and by how much, before anyone runs it?" Solved in step 12: NVMe's floor is 162 s (bandwidth-bound); object storage in 16 MiB ranges, one request at a time, is 6,554 s of waiting (latency-bound, 1.8 hours); with **k = 41** requests in flight its floor matches the drive. That k is a minimum: it assumes each 16 MiB arrives instantly once its wait ends. Counting each request's own transfer, a real run needs more in flight (about 52 if one request streams 625 MB/s, a single flow's cap; about 82 at 166 MB/s), so the per-request rate is what the learner must measure (topic 11's lab). (Fact-check 2026-10-12: the earlier "provided each request streams at least 166 MB/s" was necessary, not sufficient; at k = 41 and 166 MB/s per request the job takes about 321 s.)

## House rules for this reel (DESIGN.md, CHAPTER.md "One visual language", and the asymptotic topic's REVIEW.md)

- **Kit.** Import `C`, `Svg`, `T`, `Bar`, `Stack` from `../../../../../reels/kit` and the shared `seg`, `easeOut`, `easeOutBack`, `lerp` from `anim.ts`. Don't copy the kit. The held I/O topic's `scenes.tsx` (the `Crossover` slider with `data-interactive`) is the pattern for the one interactive step (12).
- **Colour (chapter grammar):** `crema` values; `latte` labels and tier names; `taupe` axes, units, notes and **waiting** (the α part of every bar: a wait is a taupe bar); `caramel` the cost being counted and the answer (the transfer, n/β, a moving block); `cinnamon` (large shapes only) the alternative compared; `cherry` fills with `C.cherryText` labels only for a bad outcome (the 1.8 hours, the remote-node detour is not "bad", so not cherry). At most two accents per step.
- **Tiers fastest at the top** (or left in landscape); a tier is a band with its name in `latte` and its latency in `crema`.
- **Every log axis is labelled** (asymptotic REVIEW #15, major): decade ticks in `taupe` 13, the 1 ns / 1 µs / 1 ms / 1 s ticks named, and a note "log scale: each tick ×1,000" (or ×10, whichever the axis uses). A linear axis says "linear" (step 11 only).
- **The drawing never contradicts the caption** (asymptotic REVIEW #14, major). Every bar length is computed from the value it labels, on the axis it sits on.
- **Predict steps:** the question frame never shows the answer; the answer frame is a complete still (the player keeps `t` at `duration` after an answer); the correct option is not always first; explanations ≤ 75 words (QUALITY #36); text in predict drawings ≥ 15 units (asymptotic "Changes during build" #2).
- **Numbers on screen:** thousands separators, no scientific notation, units per CHAPTER.md ("Sizes"): memory and files in KiB/MiB/GiB/TiB (PostgreSQL's "8 KB page" allowed), network rates in decimal Gbit/s, vendor figures in the vendor's spelling with the vendor named (Samsung's MB/s is 1,000,000 bytes/s, its own footnote). Every number in `reel.tsx` is asserted in `examples.py` (automatic check).
- **Dated numbers are labelled with their date on screen** ("2009", "2007") in `taupe`. A value measured in this topic's lab says "measured here" and the Deep dive names the machine.
- **Captions:** one idea per step, about 35–60 words, the point first. Longer reasoning goes to the predict `explain` and the Deep dive. Captions don't repeat the bridge (the player shows it on step 1) or the handoff (the end card shows it) (asymptotic REVIEW #1).
- **Narration:** no digits, symbols or code names; "alpha plus n over beta"; "a tebibyte" not "a terabyte" for 1 TiB (asymptotic REVIEW #19); "giga bits per second"; "N V M e" spelled as the lexicon says; "object storage", not a product name, except where AWS is the named source ("AWS says…").

## Reel steps and storyboard

Canvas 600 units wide. Portrait height first (the phone gets about 360 × 300 CSS px, scale ≈ 0.6), then landscape. Every number listed under "Real values" is asserted in `examples.py` (see "Examples to execute").

### 1. How fast could it possibly be? (`Problem`)

- **Visual idea:** the job's two possible sources side by side, each with a stopwatch that reads "?". The learner sees the decision the team faces before any number: same 1 TiB, two very different places to read it from. It is the frame that step 12 fills in.
- **Portrait (h 420):**
  - Top centre: a caramel-outlined block "order_events · 1 TiB" (crema 17), y ≈ 60.
  - Two source cards stacked below, each a row: left an icon-free card with its name (latte 15): "local NVMe drive" (y ≈ 170) and "object storage" (y ≈ 290); a pipe (taupe stroke) from each card to a box "nightly job" on the right (x ≈ 470).
  - Right of each pipe, a stopwatch glyph (circle, taupe) with "≥ ? s" (crema 20, the step's one big text) at x ≈ 470, under "nightly job".
  - Bottom note (taupe 13): "the floor: the least time it could take".
- **Landscape (h 320):** sources in a column on the left (x ≈ 40), the 1 TiB block in the middle, the job and its two stopwatches on the right.
- **Beats:** 0.2 s block fades in; 0.8 s NVMe card and pipe draw (pipe stroke grows left to right); 1.4 s object-storage card and pipe; 2.0 s both stopwatches appear with "?" (scale `easeOutBack`); 2.6 s the bottom note. Duration 3.0.
- **Real values:** 1 TiB.
- **Final frame:** block, two sources, two pipes, two "≥ ? s" stopwatches, the note.
- **Caption point:** the problem and the promise. Draft: "The nightly job reads all 1 TiB of `order_events` from a local NVMe drive. The team wants to read it straight from object storage instead. Before anyone runs it: what is the least time each way could take? By the end you'll compute both, and the setting that makes them match."

### 2. RAM read vs object-store wait (`TwoDots`, predict)

- **Visual idea:** two dots and a gap. The question frame shows the two latencies as words, on a bare line with no scale. The answer frame turns the line into the chapter's log axis and brackets six decades between the dots: the learner sees why every latency chart from here on is logarithmic.
- **Question frame, portrait (h 380):**
  - A bare horizontal line (taupe) at y ≈ 200, x 40–560, no ticks.
  - Left dot (crema, r 8) at x ≈ 80 with label above "one RAM read" (latte 15) and "≈ 100 ns" (crema 17).
  - Right dot (caramel outline, r 8) at x ≈ 520 with label above "first byte from object storage" (latte 15, two lines) and "≈ 100 ms" (crema 17).
  - Between them, "? RAM reads per wait" (crema 20) at y ≈ 290.
- **Question frame, landscape (h 320):** the same, line at y ≈ 170.
- **Question (body):** "One read from RAM takes about 100 ns. Object storage takes about 100 ms to send the first byte. How many RAM reads fit into one object-storage wait?"
- **Options (correct third):** "About 1,000" · "About 100,000" · **"About 1,000,000"** · "About 1,000,000,000".
- **Answer frame (a complete still):**
  - The line gains decade ticks every 1/9 of its length from 1 ns to 1 s, labelled "1 ns", "1 µs", "1 ms", "1 s" (taupe 13) under the ×1,000 ticks; note "log scale: each tick ×10" (taupe 13) at bottom left.
  - The dots move to x(100 ns) and x(100 ms). A caramel bracket spans them with "× 1,000,000" (crema 20, serif: the step's one serif) above it, and "six decades" (latte 15) below.
- **Explain (≤ 75 words):** "About a million: 100 ms ÷ 100 ns = 1,000,000. That is the gap between one second and eleven and a half days. On a linear axis the RAM read would be invisible next to the wait, so every latency chart from here on is logarithmic: equal steps are equal multiples. The numbers are orders of magnitude; the next steps say where each comes from."
- **Why each wrong option is wrong:** 1,000 confuses one unit prefix with the whole gap (ns→µs, or µs→ms); 100,000 is one decade short (reading 100 ms as 10 ms); 1,000,000,000 converts ns to s, ignoring the two "100"s.
- **Real values:** 100 ns, 100 ms, 1,000,000, 11.57 days (shown "eleven and a half" in the explain only as words; assert 1,000,000 / 86,400 rounds to 11.6).
- **Sources:** 100 ns is the classic DRAM figure (Norvig's table "fetch from main memory 100 nanosec"; Dean 2009 "Main memory reference 100 ns", historical) and agrees with Drepper's "200+ cycles" at 2 GHz (step 3); 100 ms is the low end of AWS's "roughly 100–200 milliseconds" first-byte latency.
- **Beats:** question frame arrives 0.2 / 0.6 / 1.0 s. Duration 1.4. Answer frame static.

### 3. Registers to RAM, in cycles (`OnChip`)

- **Visual idea:** the top of the ladder, the way the CPU counts it: in clock cycles. Five rungs, fastest at the top, each a band with a caramel dot placed on a shared log axis of nanoseconds. The cycle counts are what the manuals publish; the nanoseconds are a conversion at a stated clock, shown as a second label so the learner sees the conversion is ours.
- **Portrait (h 440):**
  - Header (taupe 13), y ≈ 30: "at 2 GHz: 1 cycle = 0.5 ns".
  - Log axis along the top of the plot, x 230–560, from 0.1 ns to 1 µs, ticks "1 ns", "10 ns", "100 ns", "1 µs" (taupe 13), note "log scale: each tick ×10".
  - Five bands at y ≈ 90, 160, 230, 300, 370 (height 50, `cocoa` fill at 0.5 opacity): left column x 40–220 the name (latte 15) and below it the cycles (crema 15): "registers · ≤ 1 cycle", "L1 · 4–6 cycles", "L2 · 14 cycles", "L3 · 50–70 cycles", "DRAM · 200+ cycles".
  - In each band a caramel dot (or a short caramel range bar for 4–6 and 50–70) at its ns position, with the ns value right of it (crema 15): "≤ 0.5 ns", "2–3 ns", "7 ns", "25–35 ns", "100+ ns".
  - Footer (taupe 13): "L1–L3: Skylake server (Intel manual, Oct 2026 ed.) · registers, DRAM: Drepper 2007".
- **Landscape (h 360):** bands at y ≈ 70, 125, 180, 235, 290 (height 44); same columns.
- **Beats:** 0.2 s header and axis; then each band at 0.6 + i·0.5 s: band fades in, its dot slides in from x(0.1 ns) to its position (`easeOut`, 0.4 s) and its ns label appears. 3.2 s footer. Duration 3.6.
- **Real values:** ≤ 1 cycle; 4–6; 14; 50–70; 200+ cycles; 0.5 ns per cycle at 2 GHz; ≤ 0.5, 2–3, 7, 25–35, 100+ ns.
- **Final frame:** five bands, dots climbing to the right, DRAM's dot far right of L1's (about forty times farther in time).
- **Caption point:** cycles are the native unit; convert with a stated clock. Draft: "Inside the chip, latency is counted in clock cycles. Intel's manual gives a Skylake server core 4–6 cycles to L1, 14 to L2, 50–70 to L3. Drepper's 2007 rule for main memory is 200 or more. At 2 GHz a cycle is half a nanosecond: L1 is 2–3 ns, DRAM about 100." (Fact-check: the 200+ is Drepper's, not Intel's, so the caption names him.)
- **Note for the builder:** the 200+ cycles is Drepper's (2007) round figure (his Pentium M table says "∼ 240"), not a measurement of a current CPU; step 8 measures this machine's DRAM. The ns column holds only at the stated 2 GHz: at 3 GHz the same 4–6 cycles are 1.3–2 ns. Skylake server parts run from under 2 to about 4 GHz, so the header's "at 2 GHz" must stay on screen.

### 4. Below RAM: drives and network (`OffChip`)

- **Visual idea:** zoom out. The step-3 axis (0.1 ns to 1 µs) rescales to 1 ns … 1 s, so the whole on-chip ladder squeezes into the first three decades on the left, and four new rungs drop in, spread across microseconds to a tenth of a second. The motion itself says "everything above RAM is a rounding error next to a disk or a request".
- **Portrait (h 440):**
  - Log axis x 200–560 from 1 ns to 1 s; ticks "1 ns", "1 µs", "1 ms", "1 s" (taupe 13); note "log scale: each tick ×1,000".
  - Top band (y ≈ 80): "on chip + DRAM" (latte 15), a caramel range bar from x(0.5 ns) to x(100 ns), label "0.5–100 ns".
  - New bands, fastest at the top:
    - y ≈ 150 "NVMe read · 80 µs" (Samsung PM9A3, 4 KB, queue depth 1).
    - y ≈ 220 "same-datacenter round trip · 500 µs" with a taupe tag "2009".
    - y ≈ 290 "HDD random read · ≈ 6 ms" with a taupe note "168/s with 16 queued" (and a taupe tick inside at 4.16 ms labelled "rotation alone").
    - y ≈ 360 "object storage, first byte · 100–200 ms" (a caramel range bar).
  - Each band's name in latte 15 on the left (x 30–190, two lines where needed), the value in crema 15 next to its dot.
- **Landscape (h 360):** five bands at y ≈ 60 … 300; names left (x 30–200), axis x 220–560.
- **Beats:**
  - 0.2–1.2 s: the axis rescales (tick positions `lerp` from the step-3 scale to the new one); the five on-chip dots slide left and merge into the "on chip + DRAM" range bar.
  - 1.4, 1.9, 2.4, 2.9 s: NVMe, round trip, HDD, object storage bands drop in (opacity + 12-unit slide), dots land.
  - 3.4 s: a thin taupe bracket from the DRAM end to the object-storage end, "× 1,000,000" (callback to step 2).
  - Duration 3.8.
- **Real values:** 80 µs; 500 µs (2009); 4.16 ms; ≈ 6 ms (1/168 s = 5.95 ms); 100–200 ms; 1,000,000.
- **Final frame:** the full ladder in five bands on one log axis, the top band compressed at the left, the object-storage bar at the far right.
- **Caption point:** the lower rungs and where each number comes from. Draft: "Off the chip, waits jump to microseconds and milliseconds. A random 4 KB read from an enterprise NVMe drive: 80 µs (Samsung's datasheet). A hard disk moves its head, then waits for the platter: 4.16 ms on average at 7,200 rpm. Seagate rates 168 random reads a second, about 6 ms each. Object storage: 100–200 ms to the first byte. Same-datacenter round trips were 500 µs in 2009; AWS publishes no figure today, so measure yours."
- **Fact-check corrections (2026-10-12):** (1) "4.16 ms … before the head even moves" had the order wrong: the head seeks first, then the drive waits for rotation; the 4.16 ms is that wait, and the manual publishes no seek time. (2) 168 IOPS is measured with 16 requests queued (the drive reorders them), so 5.95 ms is the average time per read at that rate; one read at a time is slower. That makes 6 ms a safe floor value, and the step says "168/s with 16 queued". (3) "No cloud publishes one" was wider than the sources: only AWS's pages were checked.
- **Order note:** the chapter's syllabus lists HDD before the network; the drawing orders by latency (fastest at the top), so the round trip sits above HDD.

### 5. The same RAM, one socket away (`Numa`)

- **Visual idea:** a two-socket server drawn as two nodes, each a CPU box with its own RAM bank, joined by an interconnect. A read from the local bank is a short caramel trip; the same read from the other node's bank crosses the link and arrives later. The rung "DRAM" splits into two: local and remote.
- **Portrait (h 420):**
  - Node 0 at top (y 60–170): CPU box (latte outline, "CPU 0") left, RAM bank (stack of 4 thin crema bars, "RAM, node 0") right.
  - Node 1 at bottom (y 250–360): same, "CPU 1", "RAM, node 1".
  - A thick taupe link between the two CPU boxes labelled "interconnect" (taupe 13).
  - Right column readout (x ≈ 400): "local: 1×" (crema 15) and "remote: reads ≈ 20% slower" (crema 15), with "AMD Opteron, measured 2007" (taupe 13) under it.
  - Footer (taupe 13): "yours: numactl --cpunodebind=0 --membind=1".
- **Landscape (h 320):** nodes side by side (node 0 left, node 1 right), link horizontal between them; readout under.
- **Beats:**
  - 0.2 s both nodes; 0.6 s link.
  - 1.0–1.8 s: a caramel block travels CPU 0 → RAM node 0 → back (local read), "local: 1×" appears.
  - 2.0–3.0 s: a caramel block travels CPU 0 → link → RAM node 1 → back (remote read), its path 1.2× the duration of the local one; "remote: reads ≈ 20% slower" appears.
  - 3.3 s: the footer. Duration 3.6.
- **Real values:** 1×; 20%; 2007.
- **Final frame:** both trips drawn as faint caramel paths (the remote one longer), both readouts, the footer.
- **Caption point:** what NUMA is, the sourced ratio with its date, the Linux default, and "measure it". Draft: "A server with several sockets gives each its own memory: a NUMA node. Memory on another node is slower to reach. On 2007 Opterons, Drepper measured remote reads 20% slower. Linux allocates on the node of the CPU that asks, so a thread that moves to another socket can leave its memory behind. Measure your ratio with `numactl`."
- **Fact-check note:** "can leave", not "leaves": with `kernel.numa_balancing` on, current kernels move pages "automatically to nodes that access it often" (docs.kernel.org, sysctl/kernel). The 20% is Drepper's one-hop read test on his four-socket Opteron (2007); it is a slowdown, not a "20% lower bandwidth" (that would be 17%).
- **Measured here:** the build sandbox has one NUMA node (`lscpu`: "NUMA node(s): 1"), so nothing is measured; `examples.py` checks the node count and runs the local/remote comparison only where there are two or more nodes (Deep dive, lab).

### 6. Latency is not bandwidth (`TwoAxes`)

- **Visual idea:** a scatter of the tiers on two log axes: latency across (time to the first byte), bandwidth up (bytes per second after that). Fast-and-wide sits top left (L1), slow-and-narrow bottom right (HDD), and object storage lands top right: the slowest to answer, yet as wide as the machine's network card with enough requests. Two independent axes, drawn as two axes, so "latency" and "bandwidth" stop being one word.
- **Portrait (h 440):**
  - Plot x 70–560, y 60–360. X axis: latency, log, 1 ns to 1 s, ticks "1 ns", "1 µs", "1 ms", "1 s" (taupe 13), title "latency (log)". Y axis: bandwidth, log, 100 MB/s to 1,000 GB/s, ticks "100 MB/s", "1 GB/s", "10 GB/s", "100 GB/s" (taupe 13, left), title "bandwidth (log)".
  - Six dots (crema, r 7) with short labels (latte 15):
    - "L1" at (2–3 ns, 266 GB/s) [133 bytes/cycle sustained × 2 GHz].
    - "RAM, 1 core" at (100 ns, about 10 GB/s, measured here) .
    - "NVMe" at (80 µs, 6,800 MB/s).
    - "network" as a short vertical range at 500 µs (2009) from 1.25 to 12.5 GB/s (10–100 Gbit/s per instance).
    - "HDD" at (6 ms, 285 MB/s).
    - "object storage" at (100 ms, up to 12.5 GB/s per instance), caramel, with a caramel ring.
  - Note (taupe 13), bottom: "RAM: one core, measured here · network and object storage: per machine, at 100 Gbit/s".
- **Landscape (h 360):** plot x 80–560, y 40–300; same content.
- **Beats:** 0.2 s axes; dots arrive in ladder order (L1, RAM, NVMe, network, HDD, object storage) at 0.6 + i·0.4 s; 3.2 s the caramel ring on object storage and a dashed taupe line from it to the y axis at 12.5 GB/s; 3.6 s the note. Duration 4.0.
- **Real values:** 266 GB/s; 10 GB/s (reference run; asserted as a range); 6,800 MB/s; 1.25–12.5 GB/s (10–100 Gbit/s); 285 MB/s; 12.5 GB/s (100 Gbit/s); 80 µs; 500 µs; 6 ms; 100 ms.
- **Final frame:** the six dots, object storage ringed at top right.
- **Caption point:** latency and bandwidth are separate axes, and object storage is the extreme case. Draft: "Latency is how long until the first byte. Bandwidth is how fast the bytes come after that. They rank the tiers differently. Object storage is the slowest rung to answer, yet AWS says one machine can pull up to 100 Gbit/s from it, given enough requests at once. A hard disk is slow on both."
- **Fact-check note:** "100 Gbit/s max" was dropped from the note: 100 Gb/s is the S3 page's data-lake example, and EC2 now lists instance types up to 600 Gigabit (c8gn.48xlarge). Traffic through an internet gateway gets at most 5 Gbit/s (under 32 vCPUs) or 50% of the instance's bandwidth (EC2 User Guide), so the 100 Gbit/s assumes the job doesn't go through one; the Deep dive says so.

### 7. One transfer: α + n/β (`Split`)

- **Visual idea:** the same 1 MiB read on three tiers, each drawn as one 100% bar split into its wait (α, taupe) and its transfer (n/β, caramel), with the total time at the right. Normalising each bar to its own total shows the share of time spent waiting, which is the thing that decides how to read from that tier.
- **Portrait (h 400):**
  - Formula at the top (y ≈ 50): "T(n) = α + n/β" (crema 20; α and β in serif tspans: the step's one serif), and under it "α: wait per request · β: bandwidth" (taupe 13).
  - Three rows at y ≈ 140, 230, 320, each: tier label above the bar (latte 15) "NVMe", "HDD", "object storage"; a 480-unit bar (x 40–520) split taupe | caramel; the wait share inside the taupe part (crema 15: "34% wait", "62% wait", "98% wait"); the total under the bar's right end (crema 15): "234 µs", "9.6 ms", "102 ms"; under the object-storage bar a taupe 13 note "at 625 MB/s, one flow's cap; slower streams wait a smaller share of a longer time".
  - Note (taupe 13), bottom: "one read of 1 MiB · each bar is 100% of its own time".
- **Landscape (h 340):** rows at y ≈ 120, 195, 270.
- **Beats:** 0.2 s formula; for each row at 0.8 + i·0.8 s the taupe part grows (0.3 s) then the caramel part (0.3 s), then the share and total appear; 3.4 s the note. Duration 3.8.
- **Real values (1 MiB = 1,048,576 bytes):**
  - NVMe: α = 80 µs, n/β = 154 µs at 6,800 MB/s, total 234 µs, wait 34%.
  - HDD: α ≈ 5.95 ms (1/168 s), n/β = 3.68 ms at 285 MB/s, total 9.6 ms, wait 62%.
  - Object storage: α = 100 ms, n/β = 1.68 ms at 625 MB/s (one flow's cap: see step 14), total 101.7 ms → "102 ms", wait 98.3% → "98%". At any slower per-request rate n/β is larger, the total larger and the wait share smaller (85 MB/s: 12.3 ms, 89%); a 1 MiB read is mostly waiting at any rate above 10.5 MB/s (n/β < α).
  - (Fact-check 2026-10-12: the plan had "n/β ≤ 1.68 ms … total ≥ 102 ms, wait ≥ 98%". With the rate capped at 625 MB/s the inequalities run the other way for n/β and the wait share, and "≥ 102" overstated 101.7. The values are now shown at the stated rate with the note.)
- **Final frame:** the formula and three split bars, the object-storage bar almost all taupe.
- **Caption point:** introduce α and β and the break-even size. Draft: "Every transfer costs a wait plus the bytes: T(n) = α + n/β. Read 1 MiB and the split depends on the tier: a third waiting on NVMe, nearly two thirds on a hard disk, 98% on object storage even at a single flow's top speed. Below n = α·β a read is mostly waiting: about 0.5 MB on this NVMe drive, 1.7 MB on the disk."
- **Narration note:** "T of n equals alpha plus n over beta".

### 8. In order or at random, in RAM (`RamWalk`, predict, the lab)

- **Visual idea:** one big array, two walkers. The sequential walker sweeps left to right; the random walker jumps. Same number of 8-byte reads, same Θ(n) count, same tier. The answer frame is the measured result: three bars on a log axis of nanoseconds per read, from this topic's executed lab.
- **Question frame, portrait (h 400):**
  - A strip of 48 small cells (crema outline) at y ≈ 120 labelled "1 GiB array of 8-byte numbers" (latte 15).
  - Above it a caramel marker that steps cell by cell ("in order"); below it a cinnamon marker that hops to seeded-random cells ("at random"); both loop slowly on `t` (deterministic, seeded).
  - Under the strip: "same 134,217,728 reads · same tier · both Θ(n)" (latte 15).
  - "time per read: ? × slower at random" (crema 20) at y ≈ 300.
- **Question frame, landscape (h 320):** the strip at y ≈ 100, text under it.
- **Question (body):** "Lab: read every number in a 1 GiB array, once in order and once in a random order. Same count, same RAM. How much longer does each random read take?"
- **Options (correct third):** "The same: it's random-access memory" · "About 2× longer" · **"About 10–20× longer"** · "About 1,000× longer".
- **Answer frame (a complete still):**
  - Log axis x 160–560, 0.1 ns to 1 µs, ticks "1 ns", "10 ns", "100 ns", "1 µs" (taupe 13), note "log scale: each tick ×10".
  - Three bars (left labels latte 15, values crema 17): "in order" caramel, 1.3 ns; "at random" cinnamon, 22 ns; "each address from the last read" taupe, 219 ns.
  - Under the bars: "17× · one run on this machine, 12 Oct 2026" (taupe 13). [The builder replaces 1.3 / 22 / 219 / 17× with the reference run's values, rounded, and asserts them; see Examples #6.]
- **Explain (≤ 75 words):** "Here, 17× (5–30× is typical). Memory moves 64-byte lines. In order, one line serves eight numbers and the CPU fetches the next lines before you ask. At random, each read uses one number of its line and waits for it, but the CPU overlaps several waits. Make each address depend on the last read and nothing overlaps: 219 ns, the whole DRAM wait (plus address translation). Big-O counted all three the same."
- **Why each wrong option is wrong:** "the same" takes the name "random-access memory" as a promise of uniform cost (it only means any address can be read); "2×" underestimates the line effect alone (1 of 8 values used); "1,000×" is the size of gap between tiers, not inside RAM (even the hard disk in step 10 is about 200× slower at random than in order for an 8 KB page). (Fact-check: the plan said the 1,000× "belongs to the HDD"; the sourced HDD ratio is 207×, 5.95 ms vs 28.7 µs per 8 KB page.)
- **Beats:** question frame walkers start at 0.2 s and loop; duration 1.6 (the frame keeps looping while it waits, as a pure function of `t`). Answer frame static.
- **Real values:** 1 GiB; 134,217,728 reads (2²⁷ × 8 bytes); 64 bytes; 8 numbers per line; reference ns values and ratio (Examples #6).
- **Explained on the spot, not introduced:** cache line (64 bytes; topic 7, which would have owned it, is skipped), prefetching ("fetches the next lines before you ask"), memory-level parallelism ("overlaps several waits").

### 9. Many requests in flight (`InFlight`)

- **Visual idea:** the request waterfall of the chapter grammar (one row per request, taupe wait then caramel transfer). Top panel: eight NVMe reads one at a time, end to end. Bottom panel: the same eight reads issued together, overlapping. The waits don't get shorter; they overlap, so their cost divides by the number in flight. Step 8's "the CPU overlaps several waits" is the same trick in hardware.
- **Portrait (h 440):**
  - Top panel label "1 in flight" (latte 15), y ≈ 40; a time axis x 40–560 for 0–640 µs, ticks "0", "320 µs", "640 µs" (taupe 13, linear, "linear"); 8 short rows (height 10, gap 4) each a taupe bar of 80 µs followed by a hairline caramel cap, staircased so each starts where the last ended.
  - Readout right of the panel title: "12,500 reads/s" (crema 17).
  - Bottom panel label "8 in flight" (latte 15), y ≈ 240; same axis; 8 rows all starting at 0, ending at 80 µs.
  - Readout: "100,000 reads/s" (crema 17).
  - Footer (taupe 13), two lines: "the drive's 1,000,000 reads/s needs at least 80 in flight" / "Samsung measured it with 32 × 4 = 128".
- **Landscape (h 340):** panels side by side (x 30–290 and x 310–570), footer under both.
- **Beats:** 0.2 s labels and axes; 0.6–2.2 s the top rows draw one after another (each 0.2 s); 2.4–2.8 s the bottom rows draw together; 3.0 s readouts; 3.4 s footer. Duration 3.8.
- **Real values:** 80 µs; 640 µs; 12,500 reads/s (1 / 80 µs); 100,000 reads/s (8 / 80 µs); 1,000,000 reads/s (1000 KIOPS); 80 in flight (1,000,000 × 80 µs); 32 × 4 = 128.
- **Final frame:** both panels, the staircase above and the block of overlapping rows below, both readouts and the footer.
- **Caption point:** concurrency divides the waiting term. Draft: "One request at a time pays α every time. With k in flight the waits overlap, so they cost about requests × α / k. One NVMe read takes 80 µs alone: 12,500 reads a second. To reach the drive's 1,000,000 a second you need at least 80 in flight; Samsung measured it with 128."
- **Fact-check note (queue depth):** in-flight = rate × latency holds for the latency *under that load*. 80 assumes each read still takes its QD1 80 µs; at Samsung's 128 in flight and 1,000,000/s each read takes about 128 µs. More in flight raises throughput until the drive saturates, then only raises latency. So "at least 80", and the 8-in-flight panel assumes the drive is far from saturation (100,000/s of 1,000,000).

### 10. The floor is the larger term (`Floor`)

- **Visual idea:** the floor as a contest between two bars on one log time axis: the bytes term (caramel, bytes / β) and the waits term (taupe, requests × α / k). A crema vertical line, "floor", snaps to the end of the longer bar, and a verdict appears: "bandwidth-bound" or "latency-bound". Two cases, one of each, so the learner sees the max pick a different winner.
- **Portrait (h 440):**
  - Formula at top (y ≈ 40): "floor = max(bytes / β, requests × α / k)" (crema 17; split over two lines at phone scale: "floor = max(" / "bytes / β ,  requests × α / k )").
  - Log axis x 60–560, 1 s to 10,000 s, ticks "1 s", "10 s", "100 s", "1,000 s", "10,000 s" (taupe 13), note "log scale: each tick ×10".
  - Case A (y ≈ 130–210), label (latte 15): "1 TiB from NVMe, 128 KiB reads, 32 in flight". Caramel bar "bytes: 162 s"; taupe bar "waits: 5 s"; floor line at 162 s; verdict "bandwidth-bound" (caramel 15).
  - Case B (y ≈ 260–340), label: "orders, page by page at random, from HDD". Caramel bar "bytes: 29 s"; taupe bar "waits: 5,952 s"; floor line at 5,952 s; verdict "latency-bound" (crema 15).
  - Footer (taupe 13): "with nothing in flight together, the two add up".
- **Landscape (h 360):** cases at y ≈ 110 and 230.
- **Beats:** 0.2 s formula and axis; 0.8 s case A bars grow together (0.6 s); 1.6 s floor line and verdict A; 2.2 s case B bars grow; 3.0 s floor line and verdict B; 3.4 s footer. Duration 3.8.
- **Real values:**
  - A: 2⁴⁰ bytes / 6,800 MB/s = 161.7 s → "162 s"; requests = 2⁴⁰ / 131,072 = 8,388,608 at α = 20 µs (Samsung's sequential 4 KB QD1 latency; the bigger transfer only adds to n/β) / 32 = 5.24 s → "5 s".
  - B: 8,192,000,000 / 285 MB/s = 28.7 s → "29 s"; 1,000,000 × 5.95 ms = 5,952 s. Here α/k is 1/168 s, the drive's rated time per random read with 16 queued; one at a time each read takes longer, so 5,952 s is still a floor (fact-check note). 8 KB pages vs the 4K rating add 29 µs of transfer per read, which the bytes term already counts.
  - Overlap check (fact-check): the max is the right floor because each term alone is a lower bound (the bytes can't move faster than β; R waits of α spread over at most k slots take at least R·α/k). When the terms add (k = 1, or each slot busy for α + s/b) the real time is larger, never smaller, so the max never overstates.
- **Final frame:** both cases with their floor lines and verdicts.
- **Caption point:** the floor, the two kinds of bound, and "floor, not forecast". Draft: "A job can't finish faster than its bytes take at bandwidth β, or than its waits take with k in flight: the floor is the larger. Read 1 TiB sequentially from NVMe: 162 s of bytes, 5 s of waits, bandwidth-bound. Read `orders` page by page at random from a hard disk: 29 s of bytes, 5,952 s of waits, latency-bound. A floor ignores everything else, so a real run is slower."

### 11. Scanning orders, three ways (`OrdersRace`)

- **Visual idea:** the floor race. Three lanes, fastest tier at the top, bars growing against a running clock until each tier's floor, like runners finishing. A full scan is sequential, so each floor is bytes / β; the race shows how far apart the tiers are on the one job every later topic prices.
- **Portrait (h 400):**
  - Header (latte 15): "`orders`: 1,000,000 pages × 8 KB = 8.2 GB (7.6 GiB)".
  - Clock (crema 20, serif: the step's one serif), top right: counts "0.0 s" → "28.7 s".
  - Linear axis x 60–540, 0–30 s, ticks "0", "10 s", "20 s", "30 s" (taupe 13) with "linear" (taupe 13).
  - Lanes at y ≈ 140, 220, 300: label above each bar (latte 15) "RAM, one core (measured here)", "NVMe, one drive", "HDD, one drive"; the bar caramel; the finish time at the bar's end (crema 17): "0.8 s", "1.2 s", "28.7 s"; a small flag when a lane finishes.
- **Landscape (h 340):** lanes at y ≈ 120, 190, 260.
- **Beats:** 0.2 s header and axis; 0.6–3.6 s the clock runs 0 → 28.7 s (scaled: 3 s of animation); each bar grows with the clock until its floor, then its time label pops (`easeOutBack`). Duration 3.8.
- **Real values:** 8,192,000,000 bytes; 8.2 GB; 7.6 GiB; RAM ≈ 0.8 s (8,192,000,000 / the reference run's single-core sequential rate, about 10 GB/s; asserted from the reference constant, and the live run asserted to be within 1–100 GB/s); NVMe 1.2 s (6,800 MB/s); HDD 28.7 s (285 MB/s).
- **Final frame:** three bars, two very short at the top, the HDD bar across the axis, the three times.
- **Caption point:** sequential floors are bytes / β, and the gap is the finding. Draft: "A full scan is sequential, so its floor is bytes / β. `orders` is 8.2 GB: 0.8 s from RAM on one core (measured here), 1.2 s from one NVMe drive, 29 s from one hard disk. If your scan takes a minute on NVMe, the drive isn't the problem: look for what's spending the other 59 seconds."

### 12. Back to the problem (`Verdict`, interactive)

- **Visual idea:** the step-1 frame solved. Two lanes on a log time axis: NVMe (a caramel bar at 162 s, bandwidth-bound) and object storage (a taupe waits bar requests × α / k plus a caramel tick for its bytes term at the NIC). A counter for k steps up 1, 2, 4, 8, 16, 32, 41 and the taupe bar shrinks until it meets the NVMe line. Then a slider hands k to the learner.
- **Portrait (h 440, drawing ≈ 330 + slider):**
  - Header (latte 15): "1 TiB · object storage in 16 MiB ranges = 65,536 requests · α = 100 ms".
  - Log axis x 60–560, 10 s to 10,000 s, ticks "10 s", "100 s", "1,000 s", "10,000 s" (taupe 13), "log scale: each tick ×10".
  - Lane 1 (y ≈ 130) "local NVMe" (latte 15): caramel bar to 162 s, label "162 s · bandwidth-bound"; a dashed crema vertical line at 162 s through both lanes ("target").
  - Lane 2 (y ≈ 230) "object storage" (latte 15): taupe bar to 6,553.6 / k s; a caramel tick at 88 s ("bytes at 100 Gbit/s"); label at the bar's end "waits: 6,554 s ÷ k".
  - Counter (crema 20, serif, the step's one serif): "k = 1" … "k = 41".
  - Under the drawing (`data-interactive`, as the held `Crossover`): a readout line "k = 41: waits 160 s · bytes 88 s → floor 160 s" and a second line (taupe 13) "a floor: with each 16 MiB streamed at 625 MB/s, k ≈ 52 · at 166 MB/s, k ≈ 82", and a range input k = 1–128 (default 41).
- **Landscape (h 340):** lanes at y ≈ 110 and 200; readout and slider under the drawing.
- **Beats:** 0.2 s header, axis, NVMe lane; 0.8 s object-storage lane at k = 1 (6,554 s, label "1.8 hours" in `C.cherryText`, the bad outcome); 1.4–3.6 s k steps 2, 4, 8, 16, 32, 41 (0.35 s each), the bar shrinking on a log axis (equal steps per doubling); at k = 41 the bar meets the dashed line and a crema ring pulses once; 3.8 s the readout and slider fade in. Duration 4.2.
- **Real values:** 1 TiB; 16 MiB; 65,536; 100 ms; 6,553.6 s → "6,554 s"; 1.8 hours; 161.7 s → "162 s"; 88 s (2⁴⁰ / 12.5 GB/s = 87.96 s); k = 41 (smallest k with 6,553.6 / k ≤ 161.7; 40.53 rounded up); at 41: 159.8 s → "160 s"; 166 MB/s (6,800 MB/s / 41 = 165.9, each request's average share of the drive's rate); k for a real run, R × (α + 16 MiB / b) / 161.7: b = 625 MB/s → 51.4 → "52", b = 166 MB/s → 81.5 → "82", even b = 12.5 GB/s → 41.1 → 42; the doubling values of the counter.
- **Slider readout (computed live):** waits = 6,553.6 / k; bytes = 2⁴⁰ / min(k × b, 12.5 GB/s) is **not** shown, because b (per-request bandwidth) is not published; the readout instead shows the bytes term at the NIC (88 s) and the fixed second line with k at two stated per-request rates. (Fact-check: the plan's "each request ≥ 166 MB/s" was dropped: 166 MB/s per request is necessary for 41 requests to carry 6,800 MB/s, but not sufficient, because each request then spends 0.1 s streaming on top of its 0.1 s wait: 41 in flight at 166 MB/s take about 321 s.) The slider's numbers are computed in TSX from the same constants `examples.py` asserts (k = 1, 8, 41, 128 checked there).
- **Final frame (the still for reduced motion):** k = 41, both lanes ending at the dashed line, the readout.
- **Caption point:** the answer to step 1, with the condition. Draft: "1 TiB from the NVMe drive: bandwidth-bound, 162 s. From object storage in 16 MiB ranges: 65,536 requests. One at a time, the 100 ms waits alone take 1.8 hours. With k in flight they take 6,554 s ÷ k, and at k = 41 the floor matches the drive. Each request also streams its 16 MiB, so a real run needs more: measure the per-request rate before you promise it."
- **Fact-check note (α):** 100 ms is the low end of AWS's "roughly 100–200 milliseconds" first-byte figure; AWS also says medians for requests under 512 KB are "often in the tens of milliseconds". A floor needs the smallest α that holds, so the Deep dive says the 6,554 s and k = 41 are "at α = 100 ms" and that a measured α is what the learner should use (at 50 ms, k = 21 would do).

### 13. Prove it · 1 of 3 (`Quiz`, predict; the held topic's chips-and-work pattern)

- **Type:** estimate the cost (latency-bound).
- **Question frame:** chips (crema 15 on cocoa): "2,000,000 random 8 KB page reads", "one NVMe drive, 80 µs per read", "one at a time", "nothing cached". No work lines until answered. (Fact-check: `orders` has 1,000,000 pages, so 2,000,000 reads repeat pages; without "nothing cached" a learner can rightly say the repeats come from RAM.)
- **Question (body):** "Going row by row through an index, a query makes 2,000,000 random 8 KB page reads of `orders`, one at a time, from one NVMe drive. What is the floor?"
- **Options (correct second):** "About 2 s" · **"About 160 s"** · "About 1.2 s" · "About 16 s".
- **Answer frame (work lines):** "2,000,000 × 80 µs = 160 s" / "full scan of the same table: 1.2 s" / "80 in flight: waits 2 s, bytes 2.4 s".
- **Explain (≤ 75 words):** "160 s. One at a time, every read pays its 80 µs wait: 2,000,000 × 80 µs. That's 130 times the 1.2 s it takes to scan the whole table in order. With 80 reads in flight the waits fall to 2 s, and the 16 GB of pages at 6,800 MB/s (2.4 s) become the floor. Same count of reads, a floor 66 times lower."
- (Fact-check: the plan said "a floor 80 times lower" and "then the drive's own random-read rate is the limit". The bytes term of 2,000,000 × 8,192 bytes is 2.41 s, above the 2 s of waits, so the floor at 80 in flight is 2.4 s, 66× lower; and the 1,000,000/s rating is for 4 KB reads, so for 8 KB pages the drive's bandwidth binds first, at most 830,000 pages/s.)
- **Why each wrong option is wrong:** "2 s" assumes the drive's 1,000,000 reads/s (a 4 KB figure), which needs at least 80 in flight; "1.2 s" is the full sequential scan, not this job; "16 s" is a slip of one decade (8 µs).
- **Real values:** 2,000,000; 8 KB; 80 µs; 160 s (162.4 s with each page's 1.2 µs transfer; "about 160"); 1.2 s; 133× ("130 times"); 80; 2 s; 2.4 s (2,000,000 × 8,192 / 6.8e9 = 2.41); "66 times lower" (160 / 2.41 = 66.4).

### 14. Prove it · 2 of 3 (`Quiz`, predict)

- **Type:** a chain of tiers; the floor is set by the slowest link (bandwidth-bound).
- **Question frame chips:** "copy `orders`: 8.2 GB", "from a local NVMe drive (6,800 MB/s)", "to another machine, one TCP connection", "no cluster placement group", "both instances: 25 Gbit/s". (Fact-check: without the instance's own bandwidth the answer is underdetermined; an "up to 10 Gbit/s" instance can fall to a baseline below 5 Gbit/s once its burst credits are spent.)
- **Question (body):** "You copy `orders` from a local NVMe drive to another EC2 instance over one TCP connection. The instances are not in a cluster placement group. Floor?"
- **Options (correct third):** "About 1.2 s" · "About 2.6 s" · **"About 13 s"** · "About 29 s".
- **Answer frame work lines:** "drive: 8.2 GB / 6,800 MB/s = 1.2 s" / "one flow: max 5 Gbit/s = 625 MB/s → 13.1 s" / "floor = the slowest link: 13 s".
- **Explain (≤ 75 words):** "13 s. A chain runs at its slowest link. AWS limits a single flow to 5 Gbit/s between instances outside a cluster placement group: 625 MB/s, so 8.2 GB takes 13 s however fast the drive is. A placement group raises one flow to 10 Gbit/s (6.6 s); several connections in parallel can use the instance's full bandwidth instead (here 25 Gbit/s: 2.6 s)."
- **Why each wrong option is wrong:** "1.2 s" prices only the drive; "2.6 s" assumes one connection can use the instance's whole 25 Gbit/s; "29 s" is the HDD scan from step 11. (Fact-check: the plan's "0.7 s, one connection fills a 100 Gbit/s NIC" no longer fits once the chips state the instances' bandwidth.)
- **Real values:** 8.2 GB; 6,800 MB/s; 1.2 s; 5 Gbit/s; 625 MB/s; 13.1 s; 10 Gbit/s; 6.6 s; 25 Gbit/s; 2.6 s (8,192,000,000 / 3.125 GB/s = 2.62 s); 29 s.
- **Source caution for the fact-check:** EC2's single-flow sentence is about traffic between instances ("When instances are not in the same cluster placement group, bandwidth for single-flow traffic is limited to 5 Gbps"); this question stays inside that wording (instance to instance). Step 7's use of 625 MB/s for one object-storage request is an inference from the same sentence and is written as "even at 625 MB/s" (an upper bound), never as a measured S3 rate.

### 15. Prove it · 3 of 3 (`Quiz`, predict)

- **Type:** debug this: compare a measurement with its floor before blaming anything.
- **Question frame chips:** "1 TiB in 16 MiB ranges", "8 requests in flight", "α ≈ 100 ms", "100 Gbit/s instance", "measured: 18 minutes". (Fact-check: the instance chip makes the "network card" option checkable.)
- **Question (body):** "The nightly job reads the 1 TiB from object storage with 8 requests in flight and takes 18 minutes. A teammate says object storage is throttling you. Is something broken?"
- **Options (correct last):** "Yes: the prefix's request limit" · "Yes: the network card is full" · "Yes: the store is having a slow day" · **"No: it's near its floor; raise k"**.
- **Answer frame work lines:** "waits: 65,536 × 100 ms / 8 = 819 s = 13.7 min" / "requests/s: 80, limit ≥ 5,500 per prefix" / "bytes at 100 Gbit/s: 88 s".
- **Explain (≤ 75 words):** "Nothing is broken. With 8 in flight the waits alone take 13.7 minutes, and each request's transfer adds to its wait, so 18 is about what 8 can do. The job sends 80 requests a second against at least 5,500 allowed per prefix, and its bytes need 88 s of a 100 Gbit/s card. It's latency-bound: raise k, or use fewer, larger ranges."
- **Why each wrong option is wrong:** the prefix limit is 69× the rate used; the NIC would carry the bytes in 88 s; a slow day would show as a time well above the estimate, but 18 minutes is about 1.3× the 13.7-minute floor (1.32) and just above the 17.3-minute estimate at the flow cap, i.e. what the design predicts. (Red team: if one request streams well below 625 MB/s, 8 in flight would take longer than 18 minutes, e.g. 41 minutes at 85 MB/s; a measurement *below* such an estimate means the assumed rate was low, not that something is broken. The verdict "nothing is broken, it is latency-bound" holds either way.) (Larger ranges are a valid second fix and are named in the explain, not offered as a "broken" cause.)
- **Real values:** 65,536; 100 ms; 8; 819.2 s → "819 s"; 13.7 min; 80 requests/s (65,536 / 819.2); 5,500; 69× (5,500 / 80 = 68.75); 88 s; 18 minutes. Also asserted (Deep dive): at the 625 MB/s flow cap the per-request sum gives 65,536 × (0.1 + 16,777,216 / 625,000,000) / 8 = 1,039 s = 17.3 min, so 18 minutes is consistent with the stated assumptions.

**Timing:** 15 captions of 40–65 words plus five predict explanations at about 140 words a minute come to about 12 minutes of narration, within CHAPTER.md's "about 12 min".

## Deep dive headings (`index.mdx`, the held I/O topic's pattern)

- `## After this topic you can`: the five outcomes.
- `## The latency and bandwidth table` (the chapter's canonical table; CHAPTER.md "The canonical numbers"):
  - One row per tier; columns **Tier · Latency (α) · Bandwidth (β) · Conditions · Source (version) · Checked**. Units stated in the header. Every value asserted in `examples.py` (#2), each row "checked 2026-10-12".
  - Rows:
    1. Registers: ≤ 1 cycle (≤ 0.5 ns at 2 GHz) · — · Pentium M table · Drepper 2007 (dated).
    2. L1d: 4–6 cycles (2–3 ns at 2 GHz) · 192 bytes/cycle peak, 133 sustained (266 GB/s at 2 GHz) · per core, Skylake server · Intel Optimization Reference Manual Vol. 1, 248966-051 (Oct 2026), Table 2-11 (Table 2-9 in the -049 edition of Jan 2024; same values).
    3. L2: 14 cycles (7 ns) · 64 peak / 52 sustained bytes/cycle (104 GB/s) · same.
    4. L3: 50–70 cycles (25–35 ns) · 32 peak / 15 sustained bytes/cycle (30 GB/s; the table gives size per core but doesn't say whether the bandwidth is per core) · same.
    5. DRAM, local: 200+ cycles (100+ ns at 2 GHz; "100 ns" in Norvig's and Dean's tables, historical) · one core, sequential: measured here (reference run, about 10 GB/s; live run asserted 1–100 GB/s) · dependent random read measured here (reference run, about 160–220 ns in a VM) · Drepper 2007; Norvig; Dean 2009; `examples.py`.
    6. DRAM, remote NUMA node: reads 9% slower one hop and 30% two hops (AMD's figures for a four-socket machine, in Drepper's Fig. 5.3); reads 20% slower one hop in Drepper's own bandwidth-style test (Fig. 5.4) · 2007 Opteron · measure with `numactl` (Deep dive lab).
    7. NVMe SSD (Samsung PM9A3 3.84 TB, PCIe 4.0 U.2; the one capacity with both headline figures): random 4 KB read 80 µs typical at queue depth 1; sequential 4 KB 20 µs · 6,800 MB/s sequential read (128 KB, QD32), 1,000 KIOPS random 4 KB read (QD32 × 4 workers) = 4.1 GB/s · Samsung datasheet Rev. 1.4 (Nov 2021; latency measured on a PCIe Gen3 host), confirmed by Samsung's current product page and brief.
    8. HDD (Seagate Exos X24, 7,200 rpm): 4.16 ms average rotational latency, plus a seek (not published); 168 random 4K read IOPS at QD16 ≈ 6 ms per read with 16 queued (one at a time is slower) · 285 MB/s (272 MiB/s) max sustained at the outer diameter (less toward the inner tracks) · Seagate Exos X24 product manual 205194300 Rev. A (2023) and Seagate data sheet DS2080-2307US (seagate.com).
    9. Same-AZ network: round trip: no fixed figure in the EC2 docs, live intra-AZ and inter-AZ medians in AWS Network Manager's Infrastructure Performance (content review); 500 µs "within same datacenter" in 2009 (Dean, historical); a loopback TCP round trip on this machine, no wire at all, measured (reference run: about 33 µs median in Python) as the software floor · 10–100 Gbit/s per instance (m5.8xlarge 10 Gbit/s, m5.16xlarge 20 Gbit/s; "up to 100 Gb/s"), each direction; one flow 5 Gbit/s (10 in a cluster placement group, 25 with ENA Express in one AZ); through an internet gateway, 5 Gbit/s under 32 vCPUs or 50% of the instance's bandwidth; the largest types now list up to 600 Gigabit · AWS EC2 User Guide and Instance Types guide (fetched 2026-10-12).
    10. Object storage (Amazon S3): first byte roughly 100–200 ms ("consistent" small-object and first-byte latency); medians "often in the tens of milliseconds" for requests under 512 KB (so a floor computed at α = 100 ms is a floor only if your measured α is at least that) · up to 100 Gbit/s per instance across many requests; per-request throughput **not published** in the current docs (measure: topic 11); ≥ 3,500 writes / 5,500 reads per second per prefix · AWS S3 User Guide (fetched 2026-10-12).
  - A short paragraph under the table: these match CHAPTER.md's planning orders of magnitude (L1/L2/L3 "about 1 ns / a few ns / 10–40 ns" vs 2–3 / 7 / 25–35 ns at 2 GHz; DRAM about 100 ns; NVMe tens of µs; HDD several ms; network under 1 ms (2009); object storage tens to hundreds of ms). Two planning values are not reproduced because no current source states them: AWS's "85–90 MB/s per request" and "8 or 16 MB" range sizes (see "Changes from the chapter plan" #3).
- `## Into the internals`
  - `### Why a hierarchy at all`: SRAM vs DRAM (Drepper §2: SRAM "much more expensive to produce and to use than DRAM"; DRAM cells smaller); the processor/memory gap ("the limiting factor for most programs is now… memory access"); caches pay off because programs reuse nearby and recent data (locality, named here; topic 7 is skipped); a working set that fits a level runs at that level's speed; the measured staircase (lab part 2) as the evidence.
  - `### Cycles, nanoseconds and the clock`: converting with a stated clock (cycles ÷ GHz = ns); why manuals publish cycles; peak vs sustained bandwidth (Intel Table 2-11: L1 192 vs 133 bytes/cycle) and why estimates use sustained, measured numbers, not datasheet peaks ("up to"); Crestmont (Intel's efficient core; the -051 manual updated its Gracemont chapter to Crestmont) as a second data point (4-cycle load-to-use, L2 17 cycles shared by four cores); the clock caveat (the same cycles are fewer ns at a higher clock; Skylake server parts run from under 2 to about 4 GHz); cache lines of 64 bytes (Drepper: "nowadays the norm is 64 bytes"; Intel manual: "Cache line size of 64 bytes"; check Arm before generalising).
  - `### NUMA: local and remote memory`: the kernel's definition (cells, "Memory access time and effective memory bandwidth varies depending on how far away"); nodes; local allocation by default ("By default, Linux will attempt to satisfy memory allocation requests from the node to which the CPU that executes the request is assigned"); fallback when the node is full; distances ("local memory accesses have the cost 10, all remote access… cost 20" in Drepper's sysfs example, with his own caveat "The accuracy of all this information is another question"); Drepper's AMD numbers with their date (1 hop +9% reads, 2 hops +30% reads, 2-hop writes +49% vs 0-hop reads; measured remote bandwidth −20%); `numactl` policies (`--localalloc`, `--preferred`, `--membind`, `--interleave`, `--cpunodebind`, `--hardware`); `/proc/<pid>/numa_maps`; why it matters for data systems: a scan or hash table whose memory sits on the other node pays the remote price on every miss, and a thread the scheduler moves can leave its memory behind ("under sufficient imbalance, tasks can migrate between nodes"), unless automatic NUMA balancing (`kernel.numa_balancing`) moves the pages after it. How to measure: `numactl --cpunodebind=0 --membind=0` vs `--membind=1` around the lab program; Intel Memory Latency Checker exists for the same job (named only: its page returned HTTP 403 to our fetch, so nothing is quoted from it).
  - `### Drives: one at a time, or many in flight`: what the datasheet numbers mean and under what conditions (QD1 latency vs QD32 × 4 IOPS vs QD32 sequential; Samsung's MB = 1,000,000 bytes); the HDD's 4.16 ms = half a revolution at 7,200 rpm (60 / 7,200 / 2 s = 4.17 ms); 168 IOPS at QD16 means about 6 ms a read *with* 16 requests queued for the drive to reorder (one at a time each read also pays a full seek, so it is slower; no QD1 figure is published); Samsung's 1,000 KIOPS is for 3.84 and 7.68 TB on PCIe 4.0 and 6,800 MB/s for 1.92 and 3.84 TB; outer vs inner diameter (272 MiB/s is the outer-diameter maximum, so a full-disk scan averages less); concurrency = rate × latency to read a datasheet (1,000,000 × 80 µs = 80); the mechanisms (FTL, queues, `io_uring`, `O_DIRECT`) are topic 10's.
  - `### The network and object storage rungs`: EC2 bandwidth applies to inbound and outbound at once; traffic through an internet gateway is limited to 5 Gbit/s under 32 vCPUs or 50% of the instance's bandwidth (so "up to 100 Gb/s" to S3 assumes the job doesn't reach it through one); "up to" instances run on a baseline with burst credits (typically 5 to 60 minutes); one flow is capped (5 / 10 / 25 Gbit/s); cluster placement groups pack instances in one AZ "for low-latency network performance" but AWS publishes no number, so measure (`ping` or a request loop between your two instances); S3: first byte, medians for small requests, request rates per prefix, 503 Slow Down while it scales, same-Region access "to reduce network latency and data transfer costs"; S3 Express One Zone as a faster rung ("single-digit millisecond latencies"); CloudFront/ElastiCache for single-digit ms. The loopback round trip measured here (about 33 µs median) is the software cost of one TCP round trip on one machine, not a network figure.
  - `### T(n) = α + n/β, and the floor`:
    - α (latency, a wait per request or transfer) and β (bandwidth) per tier; the break-even size α·β (NVMe 544,000 bytes ≈ 0.5 MB; HDD ≈ 1.7 MB) and what it means (requests smaller than α·β are latency-bound; batch or coalesce past it). The same α + n/β and α·β that the held I/O topic uses for messages, and that topic 21 meets again as the bandwidth-delay product.
    - The floor = max(bytes / β, requests × α / k), why it is a lower bound (each term alone is), and why the real time is higher: with k = 1 nothing overlaps and the terms add; with k > 1 each request still waits α before its own n/β.
    - The closer estimate (R / k) × (α + s/b) for R requests of size s at per-request rate b: for the 1 TiB at b = 166 MB/s it needs k ≈ 82, at b = 625 MB/s k ≈ 52, not 41. The floor's k is a minimum (it assumes instant transfers).
    - Which α: a floor needs the smallest α that holds. AWS gives "roughly 100–200 milliseconds" to the first byte and "tens of milliseconds" medians for small requests; use your own measured α (topic 11), and say which you used.
    - A third term for object storage: requests / (request-rate limit × prefixes); for the 1 TiB at k = 41, 65,536 requests in 160 s is about 410 per second, far under 5,500 per prefix.
    - Floors for other resources: the NIC (bytes / NIC rate), a single flow, the CPU (bytes / the rate your code processes them). A pipeline runs at its slowest stage, so take the max across resources (Prove it 2).
    - Report three things: the floor, the bottleneck tier, and measured ÷ floor. A ratio near 1 means the design is the limit (Prove it 3); a large ratio is the finding (step 11).
  - `### Same O, different seconds`: big-O (topic 5) counts the 134,217,728 reads of the lab as Θ(n) both ways, and the measured times differ 17×; the I/O cost model (topic 14) counts block transfers for this reason.
- `## Build, break, measure`
  - `### Lab · Sequential vs random reads in RAM` (hosts the §1.2 chapter-lab part "sequential vs random reads in RAM"; CHAPTER.md "The chapter labs"):
    - The program: a C file of about 40 lines that `examples.py` writes, compiles with `cc -O2` and runs (shown in full). It fills a 1 GiB array of 8-byte integers (2²⁷), asks for 2 MiB pages with `madvise(MADV_HUGEPAGE)` where available (address translation has its own small cache, the TLB; huge pages keep it from inflating the random numbers; one line, topic 9 is skipped), and times three walks: in order; through a seeded random permutation (independent reads); and a pointer chase through one seeded random cycle (each address is the value just read: Sattolo's shuffle).
    - Expected results, as ranges: in order 0.5–3 ns per 8-byte read (about 3–15 GB/s on one core); at random 5–30× slower; dependent 50–300× slower than in order, 80–250 ns, about the full DRAM latency (plus address translation; a VM adds nested paging). Reference run with machine, date and compiler, and the live run's own numbers printed.
    - Break it: shrink the array to 32 KiB, 1 MiB, 16 MiB and 1 GiB and re-run the dependent walk: the measured staircase (reference run here: about 1.8 / 8.8 / 54 / 160–220 ns) is the ladder of step 3 on your own machine, with the jumps where the working set outgrows each cache (sizes from `lscpu`).
    - Run it twice under `numactl` on a machine with two nodes (`--cpunodebind=0 --membind=0`, then `--membind=1`): the dependent walk gives the NUMA latency ratio. `examples.py` does this only when `/sys/devices/system/node/` shows two or more nodes and `numactl` is installed; this machine has one.
    - The NumPy version (`np.take` in order vs a seeded permutation, with the output array touched first so page faults aren't timed), with why it shows a smaller gap (about 3× in the reference run: per-element work and the writes of the result blur the read cost). Executed by `examples.py` when NumPy is importable; it backs no number on screen.
    - Where the rest of the §1.2 lab lives: "on NVMe with and without the page cache (`O_DIRECT`)" → topic 10 (Storage devices and fsync durability); "against an object store across range sizes" → topic 11 (Object storage as a storage tier); the float sum → topic 12.
- `## In production`:
  - The famous table is old: Dean's slide is from 2009 and Norvig's is older. DRAM latency has barely moved (still on the order of 100 ns; the lab's dependent read in a VM is about 160–220 ns), while drives changed rows entirely (no NVMe row in 2009; a disk's "read 1 MB sequentially" was 20 ms then, about 3.5 ms on the Exos X24 at 285 MB/s, 3.7 ms for 1 MiB). Re-source a number before you put it in a design document.
  - "Random-access memory" is not uniform: 5–30× between in-order and random reads, 50–300× for dependent ones (the lab). Hash tables, pointer-heavy structures and row-at-a-time code pay the bottom of that range.
  - A disk benchmark can be a RAM benchmark: Linux keeps recently read file data in memory (the page cache), so a second run reads RAM; topic 10's lab measures with and without it (`O_DIRECT`). Source: proc_meminfo(5), "Cached": "In-memory cache for files read from the disk (the page cache)".
  - "Up to" is not a promise: datasheet sequential rates are measured at queue depth 32; QD1 latency is what one-at-a-time code gets; EC2 "up to" bandwidth is a burst on credits; sustained beats peak.
  - One connection never fills a big NIC (single-flow caps), and one request at a time never fills object storage: parallelise, or the floor is set by α.
  - Small files make object storage latency-bound: 1,000,000 files of 1 MB with 100 in flight is 1,000 s of waits for 80 s of bytes; compaction into large files (as the running example does for `order_events`) moves the floor back to the bytes.
  - A thread that migrates to another socket keeps its memory on the old node; pin compute and memory together (`numactl --cpunodebind --membind`) when the lab shows a remote penalty.
  - The floor ignores serialization, decompression, skew, retries and the slowest request (topic 22): treat it as the floor, report measured ÷ floor.
- `## The frontier`:
  - More rungs, not fewer: S3 Express One Zone puts an object store at "single-digit millisecond latencies" next to the 100–200 ms general-purpose tier (AWS); `numactl --weighted-interleave` spreads memory over nodes by a per-node weight read from `/sys/kernel/mm/mempolicy/weighted_interleave/`, for memory nodes of different bandwidth (numactl(8)). Drives keep widening: Samsung's PCIe 5.0 PM1743 reads "up to 14,000 MB/s" ("2x faster than PCIe 4.0"), which would put the 1 TiB floor near 79 s. Name only what the sources say; no product predictions.
  - Latency stays flat while bandwidth grows: the single-core DRAM wait the lab measures is in the same order as the 2009 table's 100 ns, while per-instance network and drive bandwidth grew by orders of magnitude (100 Gbit/s instances, 6,800 MB/s drives). Designs that hide latency with concurrency (step 9) are the ones that scale.
- `## Sources`: the list below with versions, "Last verified: 12 October 2026", "Expert sign-off: pending", the report-an-error link as in the other topics.

## Basics (`prerequisites.mdx`, first section; 4–14 bullets, under 400 words, no links)

1. **Latency (α)**: the wait before a request's first byte arrives. *Where you meet it:* 80 µs for a random NVMe read.
2. **Bandwidth (β)**: bytes per second once the transfer flows. *Where you meet it:* 6,800 MB/s from an NVMe drive.
3. **T(n) = α + n/β**: one transfer of n bytes costs a wait plus the bytes at bandwidth. *Where you meet it:* below α·β bytes, a read is mostly waiting.
4. **Memory hierarchy**: tiers from registers and caches through RAM, drives and the network to object storage, each slower and larger than the last. *Where you meet it:* "which tier is this job reading from?"
5. **Clock cycle**: one CPU clock tick, 0.5 ns at 2 GHz. *Where you meet it:* manuals give cache latencies in cycles.
6. **Cache (L1, L2, L3)**: small, fast memories on the CPU holding recent data. *Where you meet it:* a loop whose data fits in L2 runs far faster.
7. **DRAM**: main memory, about 100 ns for a read that goes all the way there. *Where you meet it:* "the table is cached in memory".
8. **NUMA node**: one socket's own memory on a multi-socket server; another node's is slower to reach. *Where you meet it:* a thread on one socket, its data on the other.
9. **Requests in flight (queue depth, k)**: requests outstanding at once; their waits overlap. *Where you meet it:* an NVMe drive needs dozens in flight to reach its rated speed.
10. **Rotational latency**: a hard disk's wait for the platter to turn the data under the head: 4.16 ms on average at 7,200 rpm. *Where you meet it:* random disk reads.
11. **Same-AZ round trip**: a message to a machine in the same cloud data centre and back. *Where you meet it:* a database call from an app server next door.
12. **First byte (object storage)**: the wait before an object or byte range starts arriving over HTTP. *Where you meet it:* a lakehouse reading Parquet from a bucket.
13. **Floor**: the least time a job can take, max(bytes / β, requests × α / k); the larger term makes it bandwidth- or latency-bound. *Where you meet it:* checking a job before running it.
14. **Log scale**: equal steps are equal multiples, so nanoseconds and seconds share one axis. *Where you meet it:* every latency chart in this chapter.

(About 375 words with the markup; every term is one the reel uses or introduces. The builder trims if the build's count disagrees.)

## Prerequisites panel (after Basics)

- **01 Big-O and logarithms, and reading a log axis** (Before this: topic 5). The reel's axes are logarithmic and the lab's two walks are both Θ(n). Self-check: "On an axis with ticks 1 ns, 1 µs, 1 ms, 1 s, how many times longer is 1 s than 1 ns?" (A billion.)
- **02 Bits, bytes and binary prefixes.** Network rates are bits per second (divide by 8 for bytes), file sizes here are binary (1 GiB = 1,073,741,824 bytes), vendor rates are decimal (Samsung: 1 MB/s = 1,000,000 bytes/s). Self-check: "How many GB/s is 10 Gbit/s?" (1.25.)
- **03 The running example.** `orders`: 1,000,000 pages of 8 KB in PostgreSQL; `order_events`: 1 TiB of events in object storage, also kept on local NVMe for the nightly job. Self-check: "How many GiB is 1,000,000 pages of 8,192 bytes?" (About 7.6.)
- **Resources** (only ones that can be verified; the builder checks every link, title, author and length, and drops a length it cannot verify):
  - `<Resource kind="reel" host={props.host} domain="data-engineering" title="Asymptotic notation and logarithms">` (Before this).
  - "Latency Numbers Every Programmer Should Know", Jonas Bonér's gist after Jeff Dean and Peter Norvig, https://gist.github.com/jboner/2841832 (the held I/O topic links it; labelled "history: 2009–2012 numbers").
  - Jeff Dean, "Designs, Lessons and Advice from Building Large Distributed Systems", LADIS 2009 keynote slides (PDF), https://www.cs.cornell.edu/projects/ladis2009/talks/dean-keynote-ladis2009.pdf (opened for this topic; "Numbers Everyone Should Know").
  - Ulrich Drepper, "What Every Programmer Should Know About Memory" (2007, PDF), https://akkadia.org/drepper/cpumemory.pdf (opened).
  - numactl(8), man7.org, https://man7.org/linux/man-pages/man8/numactl.8.html (opened).
  - Ben Dicken, "The numbers EVERY ENGINEER should know (napkin math)", https://www.youtube.com/watch?v=PFEBo7SMX3M (listed by the held topic; re-verify via oEmbed; length only if verified).
  - sirupsen/napkin-math, https://github.com/sirupsen/napkin-math (CHAPTER.md's cross-check; verify the page and title; a cross-check, not a source).
  - `<Resource kind="reel" … title="Storage devices and fsync durability">` and `title="Object storage as a storage tier"` (Goes deeper later).

## Examples to execute (`examples.py`) and what each asserts

Python 3 standard library plus a C compiler (`cc`, present on CI: the workflow installs `g++` if missing and `gcc` ships on `ubuntu-latest`; the Rust topic's `examples.py` is the precedent for compiling in an example). Assert `shutil.which('cc')`. NumPy is optional (it is not importable from the default `python3` in this sandbox). Integer arithmetic where a count is exact; `KiB, MiB, GiB, TiB = 2**10, 2**20, 2**30, 2**40`.

1. **Running example.** 1,000,000 × 8,192 == 8,192,000,000; round(8,192,000,000 / GiB, 1) == 7.6; round(8,192,000,000 / 1e9, 1) == 8.2; TiB == 1,099,511,627,776.
2. **The canonical table** (Deep dive table; steps 2–7):
   - A `TABLE` of rows (tier, latency low/high and unit, bandwidth, conditions, source, checked = '2026-10-12'), and for every sourced value a short verbatim fragment that **must appear in `SOURCES.md`** (`assert frag in open('SOURCES.md').read()`), e.g. "14 cycles", "4.16ms", "6,800MB/s", "1000KIOPS", "roughly 100–200 milliseconds", "5,500 GET/HEAD", "up to 100 Gb/s", "limited to 5 Gbps", "200+ cycles", "168/550", "80/30 us", "7200 RPM spindle speed.", "typically from 5 to 60 minutes". This ties every table value to a checked quote (add the fragments the fact-check adds to `SOURCES.md`).
   - Conversions at 2 GHz (0.5 ns per cycle): ≤ 0.5; 2.0–3.0; 7.0; 25.0–35.0; 100.0 ns (200 cycles).
   - Bandwidths at 2 GHz: 133 × 2 = 266, 52 × 2 = 104, 15 × 2 = 30 GB/s; 1,000,000 × 4,096 = 4.096 GB/s (→ "4.1").
   - HDD: 60 / 7,200 / 2 = 4.1667 ms, abs(4.1667 − 4.16) < 0.01; 1 / 168 = 5.95 ms, round → 6; 285 MB/s vs 272 MiB/s: 272 × MiB / 1e6 = 285.2 (consistent).
   - Network: 10 Gbit/s / 8 = 1.25 GB/s; 100 Gbit/s / 8 = 12.5 GB/s; 5 Gbit/s / 8 = 625 MB/s.
   - Planning-magnitude checks against CHAPTER.md: L1 ns < 5; 10 ≤ L3 ns ≤ 40; 10 µs ≤ NVMe α < 100 µs; 1 ms ≤ HDD α < 10 ms; object storage α ≥ 10 ms.
3. **Step 2:** 100e-3 / 100e-9 == 1,000,000 (round); round(1,000,000 / 86,400, 1) == 11.6. Step 8's wrong-option note: (1/168) / (8,192 / 285e6) = 207.
4. **Steps 3–4 axis positions:** decade-tick fractions for the 0.1 ns–1 µs, 1 ns–1 s and 1 s–10,000 s axes (so drawings match their labels).
5. **Step 7 (1 MiB):** n/β: 1,048,576 / 6.8e9 = 154.2 µs; total 234.2 µs → "234 µs", wait share 0.342 → "34%"; HDD 1,048,576 / 285e6 = 3.679 ms, total 9.631 ms → "9.6 ms", wait 0.618 → "62%"; object storage 1,048,576 / 625e6 = 1.678 ms, total 101.68 ms → "102 ms", wait 0.983 → "98%"; at 85e6: wait 0.890 (smaller share at a slower rate); break-even rate 1,048,576 / 0.1 = 10.49 MB/s. α·β: 80e-6 × 6.8e9 = 544,000 bytes (→ "0.5 MB"); (1/168) × 285e6 = 1,696,429 (→ "1.7 MB").
6. **Step 8, the lab (C):**
   - Write the C source to a temp dir, `cc -O2`, run: n = 2²⁷ (1 GiB; 134,217,728 reads); seeded xorshift; `madvise(MADV_HUGEPAGE)` best effort; best of 3 for the in-order walk; 10,000,000 timed steps for the random and dependent walks.
   - **Assert ranges, not times** (robust on CI): seq_ns < 5; rand_ns / seq_ns ≥ 3; chase_ns / seq_ns ≥ 20; chase_ns ≥ 40; single-core sequential GB/s between 1 and 100; total runtime < 60 s.
   - Staircase (Deep dive): dependent walk at 32 KiB, 1 MiB, 16 MiB, 1 GiB; assert chase(32 KiB) < 5 ns and chase(1 GiB) / chase(32 KiB) ≥ 10.
   - **Reference constants** (one run in the build sandbox, recorded with `lscpu` model, clock, compiler version and date; the values on screen): planned from this plan's measurement on 2026-10-12 (4-vCPU Intel Xeon @ 2.10 GHz, KVM, gcc, THP madvise): in order ≈ 1.3 ns, at random ≈ 15–22 ns, dependent ≈ 157–219 ns, ratio ≈ 11–17×; single core ≈ 6.2 GB/s (`-O2` scalar sum) to 10.1 GB/s (`-O3 -march=native`). The builder runs once, rounds, stores them as constants, and asserts they satisfy the same ranges. Steps 6, 8 and 11 show the reference constants.
   - 64-byte line / 8-byte value == 8.
7. **Step 9:** 1 / 80e-6 == 12,500; 8 / 80e-6 == 100,000; 1,000,000 × 80e-6 == 80; 32 × 4 == 128; 8 × 80 == 640 µs; 128 / 1,000,000 == 128 µs (latency under Samsung's load).
8. **Step 10:** 2⁴⁰ / 6.8e9 = 161.69 → 162; 2⁴⁰ / 131,072 == 8,388,608; 8,388,608 × 20e-6 / 32 = 5.24 → 5; 8,192,000,000 / 285e6 = 28.74 → 29 (and 28.7); 1,000,000 × (1/168) = 5,952.4 → 5,952.
9. **Step 11:** RAM 8,192,000,000 / reference GB/s → 0.8 s (with 10.1 GB/s: 0.81); NVMe 1.2047 → 1.2; HDD 28.74 → 28.7.
10. **Step 12:** R = 2⁴⁰ // (16 × MiB) == 65,536; R × 0.1 == 6,553.6 → 6,554 and 1.82 h → "1.8 hours"; k = smallest integer with 6,553.6 / k ≤ 161.69 → 41 (and 40 fails); 6,553.6 / 41 = 159.8 → 160; 6.8e9 / 41 = 165.9e6 → 166 MB/s; 2⁴⁰ / 12.5e9 = 87.96 → 88; counter values 1, 2, 4, 8, 16, 32, 41; slider endpoints 1 and 128 (6,553.6 / 128 = 51.2 s). Deep dive: refined k at b = 165.9 MB/s: 65,536 × (0.1 + 16,777,216 / 165.9e6) / 161.69 = 81.5 → 82; request rate 65,536 / 159.8 = 410 per second < 5,500; k at b = 625e6: 65,536 × (0.1 + 16,777,216 / 625e6) / 161.69 = 51.4 → 52; at b = 12.5e9: 41.08 → 42; time at k = 41, b = 165.9e6: 321.5 s.
11. **Prove it 1:** 2,000,000 × 80e-6 == 160; 160 / 1.2047 = 132.8 → "130 times"; 2,000,000 × 80e-6 / 80 == 2; 2,000,000 × 8,192 / 6.8e9 = 2.409 → 2.4; 160 / 2.409 = 66.4 → "66 times"; 2,000,000 / 1,000,000 reads/s == 2 (the "2 s" option's reasoning); 16 s = 2,000,000 × 8e-6 (wrong option).
12. **Prove it 2:** 8,192,000,000 / 625e6 = 13.107 → 13.1 and 13; / 1.25e9 = 6.55 → 6.6; / 3.125e9 = 2.62 → 2.6; drive 1.2; 29 (step 11).
13. **Prove it 3:** 65,536 × 0.1 / 8 == 819.2 → 819 and 13.65 → 13.7 min; 65,536 / 819.2 == 80; 5,500 / 80 = 68.75 → 69; 88 s; at the 625 MB/s cap: 65,536 × (0.1 + 16,777,216 / 625e6) / 8 = 1,039.1 s → 17.3 min < 18; 18 × 60 / 819.2 = 1.32.
14. **Loopback round trip (Deep dive only):** a Python TCP echo on 127.0.0.1 with `TCP_NODELAY`, 20,000 round trips, median printed; assert 1 µs < median < 5 ms. Reference run 2026-10-12: median 33 µs. The word "median", not p50 (`latency-percentiles` is topic 11's).
15. **NUMA (Deep dive only):** count `node*` directories in `/sys/devices/system/node/`; if ≥ 2 and `numactl` is on PATH, run the dependent walk with `--cpunodebind=0 --membind=0` and `--membind=1` and assert remote ≥ 0.95 × local; else print "1 NUMA node: no remote memory to measure here". No on-screen number depends on it.
16. **NumPy variant (Deep dive only):** if `import numpy` works: 2²⁷ int64, `np.take` into a pre-touched output, in order vs `default_rng(42).permutation`; assert ratio ≥ 1.5; else print that it was skipped. Reference run (system Python 3.13, NumPy 2.5.3): 5.7 vs 18.2 ns, about 3×.

## Bridge and handoff (registry and reel)

- **Bridge (CHAPTER.md, word for word):** "Big-O treated every step alike. On real hardware a step costs a nanosecond in a cache or tens of milliseconds from object storage; here is the ladder in between." The player shows it on step 1; step 1's caption doesn't repeat it. It answers topic 5's handoff ("Big-O counts steps as if each cost the same. Next: the memory hierarchy, where the same step costs anything from a nanosecond to tens of milliseconds.").
- **Handoff (CHAPTER.md, word for word):** "Next: the top rungs, where CPU caches decide whether a scan runs at memory speed or far below it." **It can't be used:** it hands off to topic 7, CPU caches, which the syllabus now marks *(skipped)*, as it does topics 8 and 9. Proposed handoff to the next topic that has a reel, topic 10 (Storage devices and fsync durability), whose planned bridge is "Past the page cache are real devices. Here is what makes them fast or slow, and what it takes for a write to survive a crash.": **"Next: the drives in the middle of the ladder: why random I/O still costs more on an SSD, and what it takes for a write to survive a crash."** See "Changes from the chapter plan" #1.
- **Registry entry:** `id: 'de.memory-hierarchy-latency-numbers'`, `slug: 'data-engineering/m1-foundations/ch01-cs-foundations/memory-hierarchy-latency-numbers'`, `title` and `syllabusTitle`: 'Memory hierarchy and latency numbers', `kind: 'full'`, `minutes: 12`, `chapter: { number: 1, title: 'Computer-science foundations', section: '1.2' }`, `verified: '2026-10-12'`, `status: 'held'` (topics 2–5 are not live yet). Place it after `de.asymptotic-notation-logarithms` and before `de.io-cost-model`.

## Concept ledger

- **introduces:**
  - `memory-hierarchy`: the tiers and why they exist (steps 3–4; Deep dive "Why a hierarchy at all").
  - `latency-numbers`: the sourced, dated latency per tier (steps 2–4; the table).
  - `bandwidth-per-tier`: β per tier, peak vs sustained (step 6; the table).
  - `latency-bandwidth-cost`: T(n) = α + n/β and α·β (step 7).
  - `numa`: local vs remote memory, `numactl` (step 5; Deep dive "NUMA: local and remote memory").
  - `lower-bound-estimate`: the floor, max(bytes/β, requests × α / k), latency-bound vs bandwidth-bound, concurrency (steps 9–12, Prove it).
- **uses:** `big-o` (bridge; step 8's "both Θ(n)"; Deep dive "Same O, different seconds"), `logarithms` (every log axis; step 2).
- **declared:** none.
- **Explained on the spot, not introduced** (their planned owners, topics 7 and 9, are skipped; nothing later that has a reel lists them in `uses`): cache line (64 bytes), prefetching, overlapping misses (step 8); TLB and huge pages (one Deep dive line in the lab); page cache (one In-production line; topic 10 deals with it); round trip (step 4, a few words, as CHAPTER.md allows; `rtt` is topic 19's).

## Claims list

Every factual claim with its source in `SOURCES.md` (quotes checked by `node scripts/sources.mjs check`), or "measured in `examples.py`", or "arithmetic". "Add" means the fact-check must add that quote to `SOURCES.md` from the text already in `sources/` (or fetch the source) before the claim is used; otherwise the claim is dropped. Checked 2026-10-12. **Fact-check (2026-10-12): every quote marked "added" is now in `SOURCES.md` (110 quotes, `sources.mjs check` passes); verdicts, red-team findings and currency are in `FACT-CHECK.md`. Rows changed by the fact-check say so.**

| # | Claim | Source |
|---|---|---|
| 1 | Memory access is now the limiting factor for most programs | Drepper 2007, "As CPU cores become both faster and more numerous, the limiting factor for most programs is now, and will be for some time, memory access." |
| 2 | A register access takes at most 1 cycle; L1d about 3, L2 about 14, main memory about 240 cycles on a Pentium M | Drepper 2007, "These are the numbers Intel lists for a Pentium M:" + **added** the table rows ("Register", "≤1", "∼3", "∼ 14", "∼ 240") |
| 3 | Main memory takes 200+ cycles (round planning figure, 2007) | Drepper 2007, "Before we said that a main memory access takes 200+ cycles." and "Assume access to main memory takes 200 cycles…" |
| 4 | Skylake server: L1d 32 KB, 4–6 cycles, 192 peak / 133 sustained bytes/cycle; L2 1 MB, 14 cycles, 64 / 52; L3 up to 1.375 MB per core, 50–70 cycles, 32 / 15 (L3 bandwidth not stated per core) | Intel Opt. Ref. Manual Vol. 1, **248966-051 (Oct 2026), Table 2-11** (fact-check: current edition; Table 2-9 in -049), "Skylake server microarchitecture implements a mid-level (L2) cache of 1 MB capacity with a minimum load-to-use latency of 14 cycles." + **added** Table 2-9 row text (contents line already lists the values) |
| 5 | **Crestmont** (fact-check: -051 says "Gracemont content updated to Crestmont"): 4-cycle typical load-to-use; L2 64 bytes/cycle at 17 cycles shared by four cores (Deep dive only) | Intel manual -051, "The L2 cache delivers 64 bytes of data per cycle at a latency of 17 cycles, and that bandwidth is shared amongst 4 cores." + **added** "The load-to-use latency for loads is typically four cycles" |
| 6 | Cycles convert to ns at a stated clock; at 2 GHz a cycle is 0.5 ns (our stated assumption, not a vendor figure) | arithmetic, `examples.py` #2 |
| 7 | Cache lines are 64 bytes on current x86 (32 in early caches) | Drepper, "In early caches these lines were 32 bytes long; nowadays the norm is 64 bytes." + **added** Intel manual "Cache line size of 64 bytes" |
| 8 | DRAM is cheaper than SRAM, which is why main memory is DRAM and caches are SRAM | **added** Drepper §2.1, "SRAM is much more expensive to produce and to use than DRAM." |
| 9 | Main memory reference ≈ 100 ns (classic tables, historical) | Dean LADIS 2009 ("Main memory reference" + **added** the value line "100 ns"); **added** Norvig, "fetch from main memory 100 nanosec" (sources/norvig.txt; secondary, framing) |
| 10 | Same-datacenter round trip 500 µs in 2009; disk seek 10 ms; read 1 MB sequentially from disk 20 ms (historical) | Dean LADIS 2009, "Round trip within same datacenter" + **added** the value lines "500,000 ns", "10,000,000 ns", "20,000,000 ns" (pdftotext splits the columns; the contents note says the order matches) |
| 11 | Back-of-envelope with parallel reads: 30 seeks serially 560 ms vs in parallel 18 ms (Deep dive, history of the floor idea) | **added** Dean LADIS 2009, "30 seeks * 10 ms/seek + 30 * 256K / 30 MB/s = 560 ms" and "10 ms/seek + 256K read / 30 MB/s = 18 ms" |
| 12 | NUMA: memory divided into nodes; access time and bandwidth depend on distance; local is faster with higher bandwidth | kernel docs mm/numa, "Memory access time and effective memory bandwidth varies…" and "For example, access to memory by CPUs attached to the same cell will experience faster access times and higher bandwidths…"; numa(7), "Normally, each CPU on a NUMA system has a local memory node…" |
| 13 | Linux allocates from the node of the requesting CPU by default, falling back to other nodes; tasks can later migrate away; current kernels can move pages to the node that uses them (`numa_balancing`) | kernel docs mm/numa, "By default, Linux will attempt to satisfy memory allocation requests from the node to which the CPU that executes the request is assigned." + **added** "If the “local” node cannot satisfy the request…" and "Thus, under sufficient imbalance, tasks can migrate between nodes…"; sysctl/kernel `numa_balancing`, "Memory is moved automatically to nodes that access it often." |
| 14 | Remote reads were 20% slower in Drepper's measurement (one hop, bandwidth-style read test, 2007 four-socket Opteron; a slowdown, not "20% lower bandwidth") | Drepper, "The important information in this graph is that read operations are always 20% slower." |
| 15 | AMD's figures: 1-hop reads 9% slower, 2-hop reads 30% slower, 2-hop writes 49% slower than 0-hop reads | Drepper, "The fact we need to remember from this chart is that 2-hop reads and writes are 30% and 49% (respectively) slower than 0-hop reads." + **added** "the read performance falls by 9% and 30% respectively for 1- and 2-hop reads" |
| 16 | NUMA distance example: local 10, remote 20 | Drepper, "In this example all local memory accesses have the cost 10, all remote access to any other node has the cost 20." |
| 17 | `numactl` sets NUMA scheduling and memory placement; `--membind` fails when the nodes are full; `--preferred`/`--localalloc` fall back; `--hardware` shows the nodes | numactl(8), the four quotes |
| 18 | `--weighted-interleave` allocates by a per-node weight from `/sys/kernel/mm/mempolicy/weighted_interleave/node*` (frontier) | **added** numactl(8), "Set a weighted memory interleave policy. Memory will be allocated using the weighted ratio for each node, which can be read from" |
| 19 | This machine has one NUMA node, so no remote ratio is measured here | measured in `examples.py` #15 (and `lscpu`) |
| 20 | PM9A3: up to 6,800 MB/s sequential read (decimal MB) and 1,000 KIOPS random 4 KB read sustained (both only on PCIe 4.0, together only for the 3.84 TB model; fact-check) | Samsung PM9A3 datasheet Rev. 1.4, "…up to 6,800MB/s for sequential read speed…", "…up to 1000KIOPS for random 4KB read…" + **added** "1 MB/sec = 1,000,000 bytes/sec was used in sequential performance." and the Table 3 / Table 4 rows; Samsung's own product page ("sequential read speeds up to 6,800 MB/s") and brief ("up to one million IOPS of random read performance") |
| 21 | PM9A3 random 4 KB read latency 80 µs typical at QD1 (sequential 20 µs; measured on a PCIe Gen3 host) | Samsung datasheet, the QD1 method footnote + **added** "(7680/3840/1920/15360GB) 80/30 us" and "20/20 us" |
| 22 | The random IOPS are measured at QD32 × 4 workers, the sequential rate at 128 KB QD32 × 1 worker | **added** the Table 3 and Table 4 notes, which cover PCIe Gen4 ("…Gen4: CentOS7(Kernel 5.3.1) with 4KB (4,096 bytes) of data transfer size in Queue Depth=32 by 4 workers." and "…with 128KB (131,072 bytes) of data transfer size in Queue Depth=32 by 1 worker."); fact-check: footnote 2 on page 1, which the plan named, is "Based on PCI Express Gen3 x4" |
| 23 | Exos X24: 7,200 rpm; average latency 4.16 ms; max sustained transfer at OD 272 MiB/s (285 MB/s) | Seagate Exos X24 manual, "Max Sustained transfer rate OD (MiB/s 272 (285 MB/s max)", "Average latency 4.16ms" + **added** "7200 RPM spindle speed." |
| 24 | 4.16 ms is half a revolution at 7,200 rpm | arithmetic (60 / 7,200 / 2), `examples.py` #2 |
| 25 | A 7,200 rpm enterprise HDD does about 168 random 4K reads per second at QD16 (≈ 6 ms each **with 16 queued**; one at a time is slower) | **added** Seagate Exos X24 data sheet DS2080-2307US **on seagate.com** (fact-check found Seagate's own copy; same sheet as the reseller copy in `sources/hdd.txt`): "Random Read/Write 4K QD16 WCD (IOPS) 168/550" |
| 26 | The EC2 placement-group page gives no latency number (AWS shows live intra-AZ and inter-AZ medians in Network Manager's Infrastructure Performance instead: content review, finding 18); cluster placement groups pack instances in one AZ for low-latency node-to-node traffic | EC2 placement groups, "Cluster – Packs instances close together inside an Availability Zone." and "This strategy enables workloads to achieve the low-latency network performance…" (absence checked by reading the page) |
| 27 | Instance bandwidth applies to inbound and outbound simultaneously; examples m5.8xlarge 10 Gbps, m5.16xlarge 20 Gbps; smaller instances burst on credits | EC2 bandwidth, "Instance bandwidth specifications apply to both inbound and outbound traffic for the instance.", the m5 example, "To meet additional demand, they can use a network I/O credit mechanism…" + **added** "typically from 5 to 60 minutes" |
| 28 | One flow is limited to 5 Gbps outside a cluster placement group, up to 10 inside one, up to 25 with ENA Express in one AZ | EC2 bandwidth, the three quotes |
| 28b | Multi-flow traffic to another instance in the Region can use the instance's full bandwidth (Prove it 2's explain) | **added** EC2 bandwidth, "…traffic to another instance in the Region can use the full bandwidth available (20 Gbps)." |
| 29 | A single instance can reach up to 100 Gb/s to S3 (data-lake pattern) | S3 best practices, "…which can be up to 100 Gb/s on a single instance." |
| 30 | S3 first-byte latency roughly 100–200 ms (small objects, and first byte of larger ones) | S3 best practices, "These applications can achieve consistent small object latencies (and first-byte-out latencies for larger objects) of roughly 100–200 milliseconds." |
| 31 | S3 median latencies are often tens of ms for requests under 512 KB | S3 design patterns, "When you make smaller requests (for example, less than 512 KB), where median latencies are often in the tens of milliseconds range…" |
| 32 | At least 3,500 write and 5,500 read requests per second per prefix; no limit on prefixes; 10 prefixes → 55,000 reads/s | S3 best practices, the three quotes |
| 33 | Concurrent requests and byte ranges raise aggregate throughput; no limit on connections | S3 guidelines, "You can achieve the best performance by issuing multiple concurrent requests to Amazon S3.", "…fetch different byte ranges…", "This helps you achieve higher aggregate throughput…", "Amazon S3 doesn't have any limits for the number of connections…" |
| 34 | Access S3 from the same Region to reduce latency and transfer cost | S3 guidelines, the two same-Region quotes |
| 35 | S3 Express One Zone targets single-digit ms latencies; CloudFront/ElastiCache for single-digit ms (frontier, production) | **added** S3 design patterns, "…consider using Amazon S3 Express One Zone, which is designed for applications that require single-digit millisecond latencies…"; S3 best practices, "…use Amazon CloudFront or Amazon ElastiCache for caching with Amazon S3." |
| 36 | AWS does not publish a per-request S3 throughput or a typical range size in the pages fetched | absence: S3 best practices / guidelines contents ("NOT stated…"); the 85–90 MB/s and 8/16 MB figures are not used |
| 37 | Transfer time = α + n/β; break-even α·β; floor = max(bytes/β, requests × α / k); k requests in flight divide the waits | arithmetic and definitions (CHAPTER.md notation); `examples.py` #5, #7–#13 |
| 38 | Requests in flight = rate × latency (1,000,000 × 80 µs = 80) | arithmetic, `examples.py` #7 (Little's law is named only in topic 21) |
| 39 | In-order reads of a 1 GiB array take about 1.3 ns each here; random reads 11–17× longer; dependent reads about 160–220 ns; the staircase across working-set sizes | measured in `examples.py` #6 (reference run recorded; CI asserts ranges only) |
| 40 | One core reads RAM sequentially at about 6–10 GB/s on this machine | measured in `examples.py` #6 |
| 41 | A loopback TCP round trip in Python takes about 33 µs median here (no network) | measured in `examples.py` #14 |
| 42 | NumPy's take shows about 3× in order vs at random here | measured in `examples.py` #16 (optional) |
| 43 | Hardware prefetching fetches the next lines of a sequential walk; random access can't be prefetched; independent misses overlap; dependent ones can't | **added** Drepper "In anticipation of using consecutive memory regions, the processor prefetches the next cache line." and "There is no way for the processor to reliably prefetch data."; Intel -051 "…ignores the OOO engine’s ability to handle multiple outstanding load misses."; consistent with the measurement (#39) |
| 44 | Linux keeps file data in RAM (the page cache), so a repeated "disk" read can be a RAM read | **added** proc_meminfo(5), "Cached": "In-memory cache for files read from the disk (the page cache)." |
| 45 | Every orders/1 TiB floor, k = 41, 166 MB/s, 52, 82, 1.8 hours, 160 s, 2.4 s, 66×, 13 s, 2.6 s, 13.7 min, 17.3 min | arithmetic, `examples.py` #8–#13 (all recomputed by the fact-check in Python) |
| 46 | (fact-check) Current PCIe 5.0 enterprise drives read about twice as fast (Samsung PM1743 "up to 14,000 MB/s") (frontier only) | Samsung PM1743 product page |
| 47 | (fact-check) Through an internet gateway, EC2 multi-flow traffic is limited to 5 Gbit/s under 32 vCPUs or 50% of the instance's bandwidth; the largest instance types list up to 600 Gigabit | EC2 bandwidth page; EC2 Instance Types guide (compute optimized) |

**Not claimed, and why:**
- AWS "85–90 MB/s per request" and "8 or 16 MB" ranges: not in any AWS page we could open (CHAPTER.md's planning row cites them; the held topic quotes them from a whitepaper we couldn't fetch). The topic uses a chosen 16 MiB range and leaves per-request β to measurement.
- A fixed same-AZ round-trip figure: AWS shows live medians in Network Manager (content review), but no fixed number in its docs, so none is quoted.
- A modern measured NUMA ratio, a per-socket DRAM bandwidth, a current DRAM latency in ns from a vendor: no opened source. The table gives the dated ratio, the measured single-core rate and the cycle figures.
- HDD seek time: no opened source gives one. (The "3.2 / 3.4" next to "Performance seek" in the Exos manual is the acoustic power during seeks, in bels; `SOURCES.md` corrected by the fact-check.)
- Roofline (expert item 6), EBS volume classes (item 11), numastat counters (item 9): not in `SOURCES.md`; used only if the fact-check opens them (Williams, Waterman, Patterson, Roofline, EECS-2008-134; AWS EBS "Amazon EBS volume types"; docs.kernel.org admin-guide/numastat).
- Intel Memory Latency Checker: named as a tool only (its page returned HTTP 403).

## Source notes for the fact-check

(All four notes resolved by the fact-check on 2026-10-12: the contents line is corrected and the acoustics quoted; every quote in note 2 is added; note 3's "even at" wording is replaced by values at the stated 625 MB/s with a note, because the "≥" directions were wrong; see `FACT-CHECK.md`.)

1. **`SOURCES.md` error:** the Seagate contents line "Performance seek times 3.2 ms typical, 3.4 ms max (table label 'Performance seek')" is wrong. In the manual's text "Performance seek / 3.2 / 3.4 / (typical) (max)" sits under "Drive acoustics, sound power (bels)" (lines 520–537 of `sources/hdd2.txt`; repeated at line 2060 as "2.8 bels (typ)"). It is sound power, not a seek time. Fix the contents line; this plan claims no seek time.
2. Quotes to add (listed in the claims table as **add**): Drepper table rows, SRAM cost, 9%/30%, prefetch; Dean value lines and the thumbnail calculation; Norvig's "fetch from main memory 100 nanosec" (secondary); Intel Table 2-9 rows, "Cache line size of 64 bytes", Gracemont load-to-use; Samsung footnotes and the latency table lines; Seagate "7200 RPM spindle speed." and the datasheet's 168 IOPS; EC2 "typically from 5 to 60 minutes"; S3 Express One Zone; numactl weighted interleave; a page-cache kernel doc. (Fact-check: PostgreSQL "usually 8 kB" page size also added.)
3. The EC2 single-flow limit is worded for traffic between instances. Prove it 2 stays within that wording. Step 7 uses 625 MB/s only as "even at" an upper bound for one object-storage request; if the fact-check judges even that an over-reach, step 7 shows the object-storage total as "≥ 100 ms, ≥ 98% waiting at any rate up to 625 MB/s" or drops the rate and says "almost all waiting".
4. The asymptotic topic's step 10 shows "2.8 hours" for 100,000,000 steps at 100 µs (illustrative). This topic's numbers don't reuse it; no conflict.

## Coverage mapping hints (for `coverage.json`, ROUTINE.md 2.4)

**Syllabus clauses (word for word):**

| Clause | Covered by |
|---|---|
| "registers → L1/L2/L3 → DRAM (local vs remote NUMA) → NVMe SSD → HDD → same-AZ network → object storage" | steps "Registers to RAM, in cycles", "Below RAM: drives and network", "The same RAM, one socket away"; Deep dive "The latency and bandwidth table", "NUMA: local and remote memory" |
| "order-of-magnitude latency and bandwidth per tier" | steps "RAM read vs object-store wait", "Latency is not bandwidth", "One transfer: α + n/β"; Deep dive "The latency and bandwidth table", "Cycles, nanoseconds and the clock" |
| "and estimating a job's lower bound from them before running it" | steps "Many requests in flight", "The floor is the larger term", "Scanning orders, three ways", "Back to the problem", Prove it 1–3; Deep dive "T(n) = α + n/β, and the floor" |
| The §1.2 chapter lab part "sequential vs random reads in RAM" (the Lab bullet; not this topic's line, but hosted here) | step "In order or at random, in RAM"; Deep dive "Lab · Sequential vs random reads in RAM" |

**Sources (at least two, item by item; from `SOURCES.md` "Contents"):**
- Drepper: §1 memory as the limit → "Why a hierarchy at all"; §2 DRAM/SRAM, controllers → same (bus timing details out: below the depth this topic needs); §3 caches, Pentium M table, line size, prefetch → steps 3, 8, "Cycles…"; coherency (MESI), associativity, hyper-threads → out (topic 7, skipped: "beyond the ladder's numbers"); §4 virtual memory → out (topic 9, skipped; one TLB line in the lab); §5 NUMA → step 5, "NUMA…"; §6–7 what programmers can do, tools → lab "Break it" and NUMA section; dated-ness → table notes.
- Intel manual (-051): ch. 2 cache tables → step 3 and table; Crestmont (ch. 4) → "Cycles…"; outstanding-misses note (appendix) → step 8, the lab; prefetching/optimisation chapters → out ("not used").
- Samsung PM9A3: overview, Table 3, Table 6, footnotes → steps 4, 7, 9, 10, table, "Drives…"; capacities/power/endurance/registers → out (not latency or bandwidth).
- Seagate Exos X24: rpm, average latency, transfer rate → steps 4, 7, 10, 11, table; cache, interface, power, SATA commands → out.
- AWS S3 best practices / guidelines / design patterns: request rates, data-lake 100 Gb/s, 100–200 ms, medians, concurrency, byte ranges, same Region, Express One Zone, retries → steps 4, 6, 12, Prove it 3, "The network and object storage rungs", In production; retries and timeouts → topic "Object storage as a storage tier" (quote "per-prefix request-rate limits") and "Tail latency under fan-out"; KMS limits, Transfer Acceleration → out (not a tier property).
- EC2 bandwidth, placement groups: per direction, single-flow caps, credits, cluster placement → step 6, Prove it 2, "The network and object storage rungs"; partition/spread strategies → out.
- kernel NUMA, numa(7), numactl(8): → step 5 and "NUMA…"; system-call list and memoryless nodes → out (API detail).
- Dean LADIS 2009: the numbers slide and back-of-envelope → step 4 (500 µs, 2009), In production, "T(n) = α + n/β, and the floor"; the rest of the talk (GFS, BigTable, design advice) → out.

**Blind expert list (`EXPERT-LIST.md`, 25 items), every item placed:**

| # | Item (short) | Placement |
|---|---|---|
| 1 | Ladder of orders of magnitude; ratios matter; numbers date | here: steps 2–4; Deep dive table, In production ("The famous table is old") |
| 2 | Convert cycles with the clock; one unit before comparing | here: step 3; "Cycles, nanoseconds and the clock" |
| 3 | Why the hierarchy exists; locality | here: "Why a hierarchy at all" (locality named on the spot; topic 7 skipped) |
| 4 | Latency vs bandwidth separate; prefetch hides, pointer chase exposes | here: steps 6, 8; the lab |
| 5 | Sustained, not pin bandwidth | here: "Cycles…" (Intel peak vs sustained) and In production ("up to") |
| 6 | Roofline bound | here if the fact-check opens the Roofline report ("T(n)…, and the floor", "Floors for other resources"); else out: "no opened source; the floor's max-over-resources covers the data-movement half" |
| 7 | Back-of-envelope recipe: max across resources, compare with measured | here: steps 10–12, Prove it 2–3; "T(n)…, and the floor" |
| 8 | NUMA ratio, machine-specific, measure | here: step 5; "NUMA…"; lab |
| 9 | NUMA counters and memory policy | here: "NUMA…" (policies from numactl(8); numastat only if its doc is added) |
| 10 | Page cache makes disk benchmarks RAM benchmarks | here: In production (source added: proc_meminfo(5)); the measurement is topic "Storage devices and fsync durability" via the §1.2 lab host (CHAPTER.md) — in `coverage.json` map to the Deep dive bullet |
| 11 | Cloud block storage caps (EBS) | here if the EBS page is opened (In production); else out: "cloud volume classes are a product catalogue, not a tier; no opened source" |
| 12 | HDD for streaming, SSD for small I/O; access pattern decides | here: steps 7, 10, 11; table |
| 13 | Flash field failures | out: "reliability, not latency or bandwidth; no SSD-reliability clause in any later DE line we could quote" (or topic "Storage devices and fsync durability", quote "SSD internals", if the reviewer accepts it) |
| 14 | NVMe protocol, queues | here: step 9 (requests in flight, datasheet QD); protocol detail → topic "Storage devices and fsync durability", quote "async I/O via `io_uring`" |
| 15 | Per-instance bandwidth, both directions, burst, "up to" | here: table, "The network and object storage rungs", In production |
| 16 | Single-flow limits | here: Prove it 2; "The network…" |
| 17 | Placement; no published same-AZ latency; measure | here: step 4 (2009 label), table, "The network…" |
| 18 | Bandwidth-delay product | later: "Bandwidth, latency and data locality", quote "bandwidth-delay product" (α·β named here as its cousin) |
| 19 | Object storage: high latency, high parallelism | here: steps 4, 6, 12 |
| 20 | Request-rate limits; small-object jobs are request-bound | here: Prove it 3, "T(n)…, and the floor" (third term), In production (small files); later "Object storage as a storage tier", quote "per-prefix request-rate limits" |
| 21 | 100 Gb/s per instance; lower bound min(NIC, rate × size, …) | here: steps 6, 12; "T(n)…, and the floor" |
| 22 | Same Region; egress price | here: "The network…" (same Region); price → "Bandwidth, latency and data locality", quote "cross-AZ and cross-region transfer pricing as a design constraint" |
| 23 | Tail latency, slowest request | later: "Tail latency under fan-out", quote "why the p99 of a request fanned out to N servers approaches each server's p99.9+"; here one In-production line |
| 24 | Floor not forecast; report bound, bottleneck, ratio | here: step 10, Prove it 3, "T(n)…, and the floor" |
| 25 | Five-minute rule | out: "no readable source (the expert list's fetch failed)" |

## Progress

Progress: built (examples.py, reel, scenes, Deep dive, Prerequisites, narration.json, registry entry); build and examples pass; next: content review (gapReview open), looks review, narration audio.

- 2026-10-12, fact-check (2.3): every claim re-derived from the raw texts; `SOURCES.md` corrected (Seagate acoustics line) and extended to 110 quotes (Intel manual moved to the current -051 edition; Seagate's own data sheet for the 168 IOPS; Samsung first-party pages; Norvig; proc_meminfo(5); sysctl numa_balancing; EC2 instance types); `sources.mjs check` passes. Corrections applied above (steps 3, 4, 5, 6, 7, 8, 9, 10, 12, Prove it 1–3, Deep dive, examples, claims). See `FACT-CHECK.md`.
- 2026-10-12, content plan (2.2): `OUTLINE.md` written from `SOURCES.md` (56 quotes), the raw texts in `sources/`, `EXPERT-LIST.md`, CHAPTER.md, the held I/O topic and the asymptotic topic's OUTLINE and REVIEW. Measured in this sandbox while planning (to set the lab's ranges, not as final values): the C walks, the NumPy variant, the loopback round trip, the NUMA node count (1). Nothing else written.

## Changes from the chapter plan

1. **Handoff.** CHAPTER.md's handoff points to topic 7 (CPU caches), which the syllabus marks *(skipped)* since the owner's decision of 12 October 2026, as it does topics 8 and 9. The handoff goes to the next topic with a reel, 10 (Storage devices and fsync durability): "Next: the drives in the middle of the ladder: why random I/O still costs more on an SSD, and what it takes for a write to survive a crash." The release seam check should confirm it against topic 10's real bridge.
2. **The lab explains its own mechanism.** CHAPTER.md says topic 7's walks explain the mechanism behind this topic's RAM lab. With 7 skipped, step 8 and the lab explain cache lines, prefetching and overlapping misses on the spot (not as concepts in `introduces`), and the Deep dive adds the working-set staircase.
3. **Object storage figures.** The chapter's planning row for S3 (85–90 MB/s per request, 8 or 16 MB ranges) has no source we could open. The topic shows only sourced S3 figures (100–200 ms first byte, tens of ms medians under 512 KB, 3,500 / 5,500 requests per second per prefix, up to 100 Gb/s per instance), uses a chosen 16 MiB range, solves k from the waits (41, a minimum that assumes instant transfers), and shows the k a real run needs at two stated per-request rates (52 at 625 MB/s, 82 at 166 MB/s), leaving the per-request rate to measure in topic 11's lab.
4. **Same-AZ latency** is shown as Dean's 2009 "500 µs within the same datacenter", labelled 2009, with "AWS publishes no figure today: measure" (fact-check: narrowed from "no cloud"; withdrawn in the content review, see Changes during build 8: AWS Network Manager shows live intra-AZ medians). The loopback round trip measured here is labelled as a software floor, not a network figure.
5. **NUMA is sourced, not measured.** CHAPTER.md says "topic 6 measures the ratio". This sandbox has one NUMA node, so the reel states Drepper's 2007 ratio with its date and the lab measures it only on a machine with two or more nodes.
6. **The lab is C, with NumPy as an option.** CHAPTER.md allows "a C or NumPy array walk". NumPy isn't importable from the default `python3` here and isn't guaranteed on CI, and its `take` blurs the gap (about 3× vs about 15× in C). The C program is compiled and asserted by `examples.py`; the NumPy version runs when available.
7. **The waits term is taupe, not a caramel tick.** CHAPTER.md's visual idea draws "a caramel tick for the requests × α part"; its visual language says a wait is a taupe bar and caramel is the transfer. The steps follow the visual language (waits taupe, bytes caramel).

## Changes during build

1. **Reference run and what it changes (2026-10-12, builder).** The lab is compiled with `cc -O3 -march=native` (falling back to `-O3`, then `-O2`): with `-O2` the scalar sum gave 6.6 GB/s, which would have made the RAM scan in step 11 (1.2 s) tie the NVMe scan (1.2 s) and hide the point of the race. Reference run (4-vCPU Intel Xeon at 2.10 GHz under KVM, gcc 13.3.0, median of five runs of the 1 GiB walk): in order 0.7 ns per read (about 12 GB/s on one core), at random 14 ns, dependent 158 ns, so the random walk is **20×** slower than in order (not 17×) and the dependent walk about 230× (not 130-ish). Consequences: step 8's correct option is "About 20× longer" (was "About 10-20× longer": 20 sits on its edge), step 11's RAM scan is **0.7 s** (8.2 GB / 12 GB/s; was 0.8 s), step 6's RAM dot is at 12 GB/s (was 10), the Deep dive's DRAM row and "In production" use 158 ns / 20× / 230×. `examples.py` asserts the ranges, never these constants against the live run.
2. **Random walk = random indices, not a permutation.** Step 8's "random" walk reads `a[xorshift() & (n - 1)]`: independent random addresses, which is the property the lab needs (nothing depends on a loaded value, so the CPU can overlap the misses). The array itself holds a Sattolo cycle for the dependent walk; the in-order walk sums it. No permutation array is allocated (it would double the 1 GiB).
3. **Loopback round trip** measured 33-36 µs median in three runs; the Deep dive says "about 36 µs".
4. **`coverage.json`:** one mapping quote had backticks ("async I/O via `io_uring`") that the syllabus parser strips; the quote is now "async I/O via io_uring". Nothing else in the map changed; `gapReview` is untouched.
5. **Resources:** sirupsen/napkin-math is not listed: github.com returned HTTP 403 to our fetch, so its page and title could not be verified. The YouTube video is listed without a length (oEmbed gives title and author only).
6. **Predict drawings are compact** (heights 246-318 for steps 2 and 8, computed for the Prove-it steps): the visual area of a predict step on a phone is smaller because the answer panel takes room, so taller drawings render below the 9 px text floor.
7. **Step 12:** the readout under the drawing is three short lines (k; waits, bytes and floor; the two real-run k values) so it doesn't wrap on a phone; the drawing's `k` counter sits below the axis.
8. **Content review fixes (2026-10-12; `REVIEW.md` findings 1-27), plan changes first.**
   - **Same-AZ latency (finding 18):** "AWS publishes no figure today" is withdrawn everywhere (step 4, `OffChip`, narration, Deep dive, claims 26, change 4 above). AWS Network Manager's Infrastructure Performance page (`SOURCES.md`) says it shows intra-AZ and inter-AZ round-trip medians (P50 per five minutes; the same data in every account). The reel says: AWS shows a live median in its network console, not a fixed figure in its docs; read yours there or measure. The 500 µs stays, labelled 2009. No dated console reading is shown: this run cannot open the console. Cross-AZ is named as the next rung in the Deep dive (finding 14); its price is topic 21's.
   - **Socket-level DRAM bandwidth (finding 12):** step 6's RAM point becomes a range, one core (12 GB/s, measured here) to one socket (460.8 GB/s, peak, AMD EPYC 9654: 12 channels, up to 4,800 MT/s, "Per Socket Mem BW 460.8 GB/s" on AMD's product page; 12 x 4,800 MT/s x 8 bytes reproduces it). Labelled a spec peak, not sustained. No multi-threaded measurement is added: the build machine is a 4-vCPU VM, which cannot show a socket's bandwidth.
   - **Network block volumes (finding 13):** the expert item moves from "out" to a Deep dive bullet and table row (EBS gp3 and io2 Block Express figures from the current EBS pages, plus instance store as the local rung). The old reason ("no opened source states their figures") was untrue.
   - **HDD 1/168 s (finding 19):** it is a throughput-derived per-read time at queue depth 16, so it is shown as "at least 6 ms" and as a floor value: step 4 (dot, caption), step 6 (dot and footnote), step 7 (shares are "at least"), step 10 case B. Step 7 says "at least 62%", not the review's "at least two thirds": 62% is the floor value's share, and two thirds would need an alpha of 7.4 ms, which no source gives.
   - **Step 10 case A (finding 3):** keeps the sequential 20 µs (Samsung's `20/20 us`), now shown on screen, instead of the 80 µs the reel teaches for random reads.
   - **Prove it 3 (finding 20):** argued from measured / floor (18 min is 1.3x the 13.7 min waits floor) and "at most 80 requests a second"; the 625 MB/s per-request argument is dropped.
   - **Basics (findings 8, 9, 10, 11):** 14 bullets kept by merging: cache + clock cycle; cache line + prefetching (new); NVMe SSD + HDD (replaces Rotational latency); first byte + key prefix; floor + latency-/bandwidth-bound; same-AZ round trip + flow + placement group. Theta(n) stays in section 01.
   - **Expert items (findings 15, 16):** `numastat` counters get a Deep dive line (kernel admin guide quote); the NVMe queue model gets one sentence from the NVMe base specification (up to 65,535 I/O queues, 65,535 commands each), and the `io_uring` topic quote is dropped from that item (a kernel interface, not the NVMe queue model).
   - **Seams recorded, not edited here (findings 2, 7, 17):** the previous topic's "disk read = 100 us" and the held I/O topic's per-request S3 figures go to `REVIEW.md` for the release seam check; the orphaned false-sharing lab clause goes to `syllabus/review-notes/de-cuts.md`.

9. **Looks and learning review fixes (2026-10-12; `REVIEW.md`, second section, findings 1-19).** The storyboard changes, in step order:
   - **Step 1:** the NVMe pipe is short and solid, the object-storage pipe long and dashed. **Step 2:** the question frame is a true linear axis (RAM dot on the zero end).
   - **Step 3:** decade guide lines through the rows. **Step 4:** the rows arrive in the order the voice names them (NVMe, HDD, object storage, the 2009 round trip); the chip + DRAM bar is quiet taupe; hollow dots mark the 2009 and floor figures; the "× 1,000,000" bracket is on the axis from DRAM to object storage; notes are one short line each; duration 7.0 s.
   - **Step 5:** local and remote trips both drawn and labelled beside their paths; the remote path runs down the interconnect, not through CPU 1. The "thread leaves its memory behind" idea stays in the caption only.
   - **Step 6:** the network point and its footnotes are removed from the scatter (the round trip and Gbit/s stay in step 4); NVMe and HDD show their bandwidth; points arrive in narration order (5.6 s).
   - **Step 7:** the caramel segment is labelled "bytes" and each total sits on its own bar's label line.
   - **Step 8:** the answer frame is three dots on the log axis with "20×" and "11×" brackets (the 11× is asserted in `examples.py`); the question frame shows 64-byte lines; random is caramel, in order cinnamon.
   - **Step 9:** legend, wider transfer tips, a finish line per panel ("done at 640 µs", "done at 80 µs"), "Samsung measured it with 128 in flight". **Step 10:** the two terms are dots on the log axis with the larger ringed, one-line titles, no footnote; the build is sequential (7.0 s).
   - **Step 11:** the unlabelled top number is gone; a closing beat shows a 60 s scan running off the axis, "the other 59 s are not the drive" (5.2 s). **Step 12:** the caveat moved into the drawing, larger readout, the animated k drives the slider, "drag k: 1 ... 128" (6.4 s).
   - **Steps 13-15:** the question frame keeps four pills (steps 14 and 15 merge two pairs); the answer frame is one small drawing each (two bars 160 s / 2.4 s; a three-link pipe at 6,800 / 625 / 3,125 MB/s; a 13.7 min floor against the 18 min measured run), not the old arithmetic lines.
   - **Narration:** the step 8 answer and steps 10 and 12 are trimmed (about 85 to 81, 104 to 91 and 102 to 95 words); no fact is dropped. Step 4 is not split into two steps.
   - **Not changed:** the phone answer panel being cut off is shared-player behaviour (recorded in `REVIEW.md` as "for the owner").

## Changes after final

