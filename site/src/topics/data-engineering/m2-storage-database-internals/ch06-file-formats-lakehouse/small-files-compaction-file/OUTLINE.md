# Outline — de.small-files-compaction-file

1. **Hook.** Topic 17 answered how far back a table lets you go, and how it forgets. This topic
   answers a question every snapshot assumed along the way: what if the files underneath it are
   small, and there are a lot of them?
2. **Predict: a streaming job commits one small file per micro-batch — does that cost anything
   beyond the bytes themselves?** No, same data either way / Yes, real extra overhead. Correct:
   yes, real extra overhead.
3. **Reveal: reproduced for real — streaming produces 200 real small files for one partition.**
   A real streaming micro-batch pattern: 200 separate small files, 400,000 bytes of real data
   total, same logical partition.
4. **Reveal: Iceberg's own words — more files means more metadata and slower opens.** Iceberg's
   maintenance docs on why file count itself is the cost, independent of the data.
5. **Reveal: reproduced for real — 200 small files cost real extra manifest bytes and real extra
   open/LIST overhead.** Measured directly: a fixed-width manifest entry per file, and a fixed
   open/LIST cost per file touched — both scale with file count alone.
6. **Reveal: reproduced for real — a real bin-pack compaction, byte for byte.** The same 200
   files' real bytes, repacked into 10 target-sized files; every byte checked to survive in the
   same order.
7. **Reveal: reproduced for real — both costs collapse by the same factor the file count did.**
   Manifest bytes and open/LIST overhead both collapse after compaction, by exactly the factor
   the file count dropped, while the data itself — 400,000 bytes — never changes.
8. **Predict: is compacting a partition a streaming job is still actively writing to a free
   action?** Free / A real conflict. Correct: a real conflict — a compaction is itself a commit.
9. **Reveal: reproduced for real — the same bytes compress worse split into small files.** The
   identical data, compressed once as 200 separate streams versus once as a single stream:
   measurably more bytes split than whole.
10. **Reveal: the real scheduling trade-off, and who runs this today.** AWS's and Databricks'
    own words: compaction can run with no manual intervention at all (S3 Tables, Databricks
    predictive optimization) or as a self-run job (Iceberg's `rewriteDataFiles`, Delta's
    `OPTIMIZE`) — and either way, compacting a partition streaming is still actively writing to
    is a real scheduling trade-off, not a free action.
11. **Recap.** Small files cost real metadata and open overhead that scale with file count alone;
    a bin-pack compaction collapses both without touching the data; and today that compaction
    either runs itself or is a job someone has to schedule.
