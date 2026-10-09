# Verification log: syllabus/data-structures-and-algorithms.md

Checked on 2026-10-09. Sources: Crossref DOI records (publisher metadata), USENIX, OpenProceedings, VLDB, arXiv, official release notes and source repositories. DBLP returned a bot wall, so Crossref and DOI records were used in its place.

## Confirmed (claim → source URL)

### Systems and runtimes
- Go 1.24 built-in map now based on Swiss Tables → https://go.dev/doc/go1.24
- Go 1.19 `sort` rewritten to use pdqsort → https://go.dev/doc/go1.19
- Rust 1.81: stable sort uses driftsort and unstable sort uses ipnsort (PR #124032) → https://github.com/rust-lang/rust/blob/master/RELEASES.md (1.81.0 section); https://github.com/rust-lang/rust/pull/124032
- hashbrown has been std `HashMap` since Rust 1.36 and is a port of SwissTable → https://docs.rs/crate/hashbrown/
- CPython 3.11 list.sort uses Munro & Wild's Powersort merge policy (bpo-34561) → https://raw.githubusercontent.com/python/cpython/3.11/Misc/NEWS.d/3.11.0a1.rst ; Objects/listsort.txt
- Linux 6.1 maple tree is an RCU-safe range-based B-tree → https://kernelnewbies.org/Linux_6.1
- Maple tree replaced the VMA augmented rbtree, vmacache and VMA linked list → https://lkml.iu.edu/hypermail/linux/kernel/2202.2/09535.html
- StackRot is CVE-2023-3269, a maple-tree use-after-free in Linux 6.1–6.4 → https://github.com/lrh2000/StackRot
- C++26 hazard pointers (P2530R3) and RCU (P2545R4), adopted at Varna in 2023-06 → https://releases.llvm.org/20.1.0/projects/libcxx/docs/Status/Cxx2c.html
- Delta liquid clustering uses Hilbert-clustered ZCubes and Delta `ZORDER BY` uses Z-order → https://delta.io/blog/delta-lake-3-2/
- ExaLogLog (Ertl): accepted at EDBT 2025, 43% less space than HLL at equal error → https://arxiv.org/abs/2402.13726
- Abseil Swiss tables: H1/H2 split, 7-bit metadata, 16 candidates winnowed with SSE (©2017); Kulukundis CppCon 2017 talk → https://abseil.io/about/design/swisstables ; https://cppcon2017.sched.com
- VS Code piece-tree (piece table) text buffer, shipped in 1.21 in March 2018 → https://code.visualstudio.com/blogs/2018/03/23/text-buffer-reimplementation
- PostgreSQL 13 B-tree deduplication → https://www.postgresql.org/docs/release/13.0/
- RocksDB cache-local Bloom filter (probes in one cache line) and Ribbon filter saving ~30% space vs Bloom → https://github.com/facebook/rocksdb/wiki/RocksDB-Bloom-Filter
- Roaring users include Lucene, Druid, Pinot and Spark → https://roaringbitmap.org/
- NGINX `random two` (least_conn by default) → https://nginx.org/en/docs/http/ngx_http_upstream_module.html#random
- Envoy least-request uses P2C (power of two choices) → https://www.envoyproxy.io/docs/envoy/latest/intro/arch_overview/upstream/load_balancing/load_balancers
- DuckDB sort encodes all ORDER BY columns into one memcmp-able binary key (key normalization) → https://duckdb.org/2021/08/27/external-sorting
- PostgreSQL `geqo_threshold` default is 12 → https://www.postgresql.org/docs/current/runtime-config-query.html
- PubGrub (Weizenbaum, April 2018) is used by Dart pub and by uv (via pubgrub-rs) → https://nex3.medium.com/pubgrub-2fb6470504f ; https://github.com/dart-lang/pub/blob/master/doc/solver.md ; https://github.com/astral-sh/uv/blob/main/docs/reference/internals/resolver.md
- Caffeine uses W-TinyLFU → https://github.com/ben-manes/caffeine/wiki/Efficiency
- RocksDB began at Facebook in 2012 as a fork of LevelDB → https://github.com/facebook/rocksdb (README); https://en.wikipedia.org/wiki/RocksDB (secondary, for the year)
- glibc memmem uses Two-Way → https://sourceware.org/git/?p=glibc.git;a=blob;f=string/str-two-way.h
- NumPy vendors intel/x86-simd-sort (AVX-512 np.sort) → https://github.com/numpy/numpy/blob/main/.gitmodules ; 1.25.0 release notes
- OSRM supports Contraction Hierarchies → https://github.com/Project-OSRM/osrm-backend
- Redis uses approximated LRU → https://github.com/redis/redis-doc/blob/master/docs/reference/eviction/index.md

### Papers: venue and year
- S3-FIFO, SOSP 2023 → https://doi.org/10.1145/3600006.3613147
- SIEVE, NSDI 2024 → https://www.usenix.org/conference/nsdi24/presentation/zhang-yazhuo
- ARC, Megiddo & Modha, FAST 2003 → https://www.usenix.org/conference/fast-03/arc-self-tuning-low-overhead-replacement-cache
- Consistent hashing with bounded loads, SODA 2018 → https://doi.org/10.1137/1.9781611975031.39
- Maglev, NSDI 2016 → https://www.usenix.org/conference/nsdi16/technical-sessions/presentation/eisenbud
- Jump consistent hash, Lamping & Veach 2014 → https://arxiv.org/abs/1406.2294
- HRW hashing, Thaler & Ravishankar → https://doi.org/10.1109/90.663936
- RUM conjecture, EDBT 2016 → https://openproceedings.org/2016/conf/edbt/paper-12.pdf
- Monkey, SIGMOD 2017 → https://doi.org/10.1145/3035918.3064054
- Dostoevsky, SIGMOD 2018 → https://doi.org/10.1145/3183713.3196927
- Brodal & Fagerberg, SODA 2003 → https://cs.au.dk/~gerth/papers/soda03.pdf
- Kraska et al., SIGMOD 2018 → https://doi.org/10.1145/3183713.3196909
- PGM-index, PVLDB 2020 → https://doi.org/10.14778/3389133.3389135
- Poptrie, SIGCOMM 2015 → https://doi.org/10.1145/2785956.2787474
- ART, ICDE 2013 → https://doi.org/10.1109/icde.2013.6544812
- OLC (The ART of practical synchronization), DaMoN 2016 → https://doi.org/10.1145/2933349.2933352
- Bw-tree, ICDE 2013 → https://doi.org/10.1109/icde.2013.6544834 ; Wang et al., SIGMOD 2018 → https://doi.org/10.1145/3183713.3196895
- Lehman & Yao, TODS 1981 → https://doi.org/10.1145/319628.319663
- Herlihy & Wing, TOPLAS 1990 → https://doi.org/10.1145/78969.78972
- Michael–Scott queue, PODC 1996 → https://doi.org/10.1145/248052.248106
- Hazard pointers, Michael 2004 (TPDS) → https://doi.org/10.1109/tpds.2004.8
- Split-ordered lists, JACM 2006 → https://doi.org/10.1145/1147954.1147958
- Aggarwal & Vitter, CACM 1988 → https://doi.org/10.1145/48529.48535
- Frigo et al., FOCS 1999 → https://doi.org/10.1109/sffcs.1999.814600
- Tarjan union–find 1975 (JACM) → https://doi.org/10.1145/321879.321884
- HNSW, TPAMI 2020 → https://doi.org/10.1109/tpami.2018.2889473
- DiskANN, NeurIPS 2019 → https://papers.nips.cc/paper_files/paper/2019/hash/09853c7fb1d3f8ee67a61b6bf4a7f8e6-Abstract.html
- PQ, Jégou et al., TPAMI 2011 → https://doi.org/10.1109/tpami.2010.57
- Cuckoo filter, CoNEXT 2014; less space than Bloom below ~3% FPR → https://doi.org/10.1145/2674005.2674994 ; https://www.pdl.cmu.edu/ftp/FS/cuckoo-conext2014.pdf
- Counting quotient filter, SIGMOD 2017 → https://doi.org/10.1145/3035918.3035963
- Xor filters, Graf & Lemire 2020 (JEA) → https://doi.org/10.1145/3376122
- Binary fuse filters 2022, within 13% of the lower bound (~1.13×) → https://doi.org/10.1145/3510449 ; https://arxiv.org/abs/2201.01174
- Ribbon filter, Dillinger & Walzer 2021 → https://arxiv.org/abs/2103.02515
- SuRF, SIGMOD 2018 → https://doi.org/10.1145/3183713.3196931
- Putze, Sanders & Singler 2007 (WEA 2007) → https://doi.org/10.1007/978-3-540-72845-0_9
- Driscoll et al., JCSS 1989 → https://doi.org/10.1016/0022-0000(89)90034-2
- Bagwell, Ideal Hash Trees, 2001 → https://infoscience.epfl.ch/record/64398
- CHAMP, OOPSLA 2015 → https://doi.org/10.1145/2814270.2814312
- Jacobson 1989 (FOCS) → https://doi.org/10.1109/sfcs.1989.63533
- Vigna, WSDM 2013 → https://doi.org/10.1145/2433396.2433409
- Roaring, Chambi, Lemire et al. (SPE vol. 46, 2016; online 2015) → https://doi.org/10.1002/spe.2325
- BlockQuicksort, ESA 2016 → https://drops.dagstuhl.de/entities/document/10.4230/LIPIcs.ESA.2016.38
- Timsort bug, de Gouw et al., CAV 2015 → https://doi.org/10.1007/978-3-319-21690-4_16
- Eytzinger layout, Khuong & Morin 2017 → https://doi.org/10.1145/3053370
- Direction-optimizing BFS, SC 2012 → https://doi.org/10.1109/sc.2012.50
- Contraction hierarchies, Geisberger et al. 2008 → https://doi.org/10.1007/978-3-540-68552-4_24
- Haeupler et al., FOCS 2024 best paper → https://doi.org/10.1109/focs61266.2024.00125 ; https://barc.ku.dk/news/jakub-ttek-awarded-best-paper-distinction-at-focs-2024/
- Duan et al., STOC 2025 best paper, deterministic O(m log^{2/3} n) → https://doi.org/10.1145/3717823.3718179 ; https://arxiv.org/abs/2504.17033 ; https://www.mpi-inf.mpg.de/news/detail/stoc-best-paper-award-how-to-find-the-shortest-path-faster
- Bernstein, Nanongkai, Wulff-Nilsen 2022 (FOCS 2022) → https://doi.org/10.1109/focs54457.2022.00063
- Chen, Kyng, Liu, Peng, Probst Gutenberg, Sachdeva, FOCS 2022 best paper → https://doi.org/10.1109/focs54457.2022.00064 ; https://focs2022.eecs.berkeley.edu/awards.html
- simdjson, VLDB Journal 2019 → https://doi.org/10.1007/s00778-019-00578-5
- SA-IS, Nong, Zhang & Chan 2009 (DCC) → https://doi.org/10.1109/dcc.2009.42
- Suffix trees take ~10–20 bytes per character (Kurtz 1999: 10.1 average, 20 worst case) → https://doi.org/10.1002/(sici)1097-024x(199911)29:13<1149::aid-spe274>3.0.co;2-o
- Shewchuk 1997 (DCG) → https://doi.org/10.1007/pl00009321
- Azar et al. 1994 (STOC) → https://doi.org/10.1145/195058.195412
- Mergeable summaries, PODS 2012 → https://doi.org/10.1145/2213556.2213562
- HyperLogLog 2007 (AofA, DMTCS) → https://dmtcs.episciences.org/3545/pdf
- HLL++, EDBT 2013 → https://doi.org/10.1145/2452376.2452456
- KLL, FOCS 2016 → https://doi.org/10.1109/focs.2016.17
- DDSketch, VLDB 2019 → https://doi.org/10.14778/3352063.3352135
- Exponential histograms, Datar et al. 2002 → https://doi.org/10.1137/s0097539701398363
- Boncz, Manegold & Kersten, VLDB 1999 → https://vldb.org/dblp/db/conf/vldb/BonczMK99.html
- Lazy funnelsort, Brodal & Fagerberg 2002 (ICALP) → https://doi.org/10.1007/3-540-45465-9_37
- Blumofe & Leiserson, JACM 1999 → https://doi.org/10.1145/324133.324234
- Pregel, SIGMOD 2010 → https://doi.org/10.1145/1807167.1807184
- COST, HotOS 2015 → https://www.usenix.org/conference/hotos15/workshop-program/presentation/mcsherry
- Backurs & Indyk, STOC 2015 → https://doi.org/10.1145/2746539.2746612
- Karlin, Klein & Oveis Gharan, STOC 2021 → https://doi.org/10.1145/3406325.3451009
- Sleator & Tarjan 1985 (CACM) → https://doi.org/10.1145/2786.2793
- Yannakakis, VLDB 1981 → https://www.vldb.org/dblp/db/conf/vldb/Yannakakis81.html
- AGM bound, FOCS 2008 → https://doi.org/10.1109/focs.2008.43
- Leapfrog Triejoin, ICDT 2014 → https://openproceedings.org/ICDT/2014/paper_13.pdf
- Selinger et al., SIGMOD 1979 → https://doi.org/10.1145/582095.582099
- Moerkotte & Neumann, VLDB 2006 → https://www.vldb.org/conf/2006/p930-moerkotte.pdf
- Quincy, SOSP 2009 → https://doi.org/10.1145/1629575.1629601
- Firmament, OSDI 2016 → https://www.usenix.org/conference/osdi16/technical-sessions/presentation/gog

### Book editions
- CLRS 4th ed. (MIT Press, 2022) adds bipartite matching and online algorithms → ISBN 9780262046305 listings, https://campusstore.miamioh.edu/introduction-algorithms-fourth-edition/bk/9780262046305 (the MIT Press page returned 403)
- Sedgewick & Wayne, Algorithms 4th ed. (Addison-Wesley, 2011; ISBN 9780321573513) → https://algs4.cs.princeton.edu/home/ ; https://www.abebooks.com/Algorithms-4th-Edition-Sedgewick-Robert-Wayne/32183019305/bd (bookseller record; the booksite gives no year)
- Skiena 3rd ed. (Springer, 2020) → https://doi.org/10.1007/978-3-030-54256-6
- Erickson, 1st ed., June 2019 → https://jeffe.cs.illinois.edu/teaching/algorithms/
- Kleinberg & Tardos (Pearson/Addison-Wesley, 2005; ©2006) → https://www.pearson.com/en-us/subject-catalog/p/algorithm-design/P200000003259/9780321295354
- Knuth Vol. 4B appeared in 2022 (imprint dated 2023) → https://www-cs-faculty.stanford.edu/~knuth/taocp.html
- Mehlhorn, Sanders, Dietzfelbinger, Dementiev (Springer, 2019) → https://doi.org/10.1007/978-3-030-25209-0
- Okasaki (CUP, 1998) → https://doi.org/10.1017/cbo9780511530104 ; Navarro (CUP, 2016) → https://doi.org/10.1017/cbo9781316588284
- Herlihy, Shavit, Luchangco, Spear, 2nd ed. (Morgan Kaufmann, 2020) → https://www.elsevier.com/books/catalog/isbn/9780124159501
- Mitzenmacher & Upfal, 2nd ed. (CUP, 2017) → https://assets.cambridge.org/97811071/54889/copyright/9781107154889_copyright_info.pdf
- Cormode & Yi (CUP, 2020) → https://doi.org/10.1017/9781108769938
- Vitter (Now, 2008; first appeared as FnT TCS vol. 2 no. 4, 2006) → https://nowpublishers.com/article/Details/TCS-014
- Gusfield (CUP, 1997) → https://doi.org/10.1017/cbo9780511574931
- Williamson & Shmoys (CUP, 2011) → https://doi.org/10.1017/cbo9780511921735 ; Cygan et al. (Springer, 2015) → https://doi.org/10.1007/978-3-319-21275-3

### Non-standard bounds spot-checked
- Ribbon ~30% smaller than Bloom: the RocksDB wiki (above).
- Binary fuse ~1.13×: the arXiv abstract (above).
- Suffix trees 10–20 B/char: Kurtz 1999 (above).
- Cuckoo filters beat Bloom below ~3% FPR: Fan et al. (above).

## Corrected (old → new, source URL)
1. Ch.20 Dinic: "O(E√V) on unit-capacity networks" → "O(E√V) on unit networks such as bipartite matching". On general unit-capacity networks the bound is O(E·min(V^{2/3}, E^{1/2})). O(E√V) needs a unit network (every inner vertex has one entering or one leaving unit edge). Sources: Even & Tarjan 1975 https://doi.org/10.1137/0204043 ; https://arxiv.org/pdf/1004.3363 ; https://en.wikipedia.org/wiki/Dinic%27s_algorithm
2. Ch.3 MPHFs: "~1.5–3 bits per key" → "~1.5–4 bits per key". BBHash reports 3.7 bits/key in its standard configuration. RecSplit can reach 1.56 and PtrHash uses 2.4. Sources: https://arxiv.org/abs/1702.03154 ; https://arxiv.org/abs/1910.06416 ; https://arxiv.org/abs/2502.15539

## Removed or softened
- None. Every venue/year attribution checked out.

## Could not check
- MIT Press page for CLRS 4th ed. (HTTP 403) and cppreference (HTTP 403). The CLRS claims were confirmed through ISBN retail/catalog listings and the C++26 claims through libc++ status, as listed above.
- DBLP API (bot wall). Crossref DOI metadata and proceedings pages were used instead.
- Not attempted (out of scope, standard or uncontroversial): Java ConcurrentHashMap treeified bins, Lucene FST/postings internals, IPS⁴o and vqsort details, Redis sorted-set internals, MongoDB/Cassandra Merkle anti-entropy, and the textbook complexity bounds.
