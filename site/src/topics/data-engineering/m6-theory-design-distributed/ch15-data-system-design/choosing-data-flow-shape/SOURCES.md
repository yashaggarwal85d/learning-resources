## Jay Kreps — "Questioning the Lambda Architecture" (O'Reilly Radar)

URL: https://www.oreilly.com/radar/questioning-the-lambda-architecture/
Version: O'Reilly Radar, 2 July 2014 (accessed 2026-10-30)

> The problem with the Lambda Architecture is that maintaining code that needs to produce the same result in two complex distributed systems is exactly as painful as it seems like it would be. I don't think this problem is fixable.

> We have actually been through a number of rounds of this at LinkedIn. We have built various hybrid-Hadoop architectures and even a domain-specific API that would allow code to be "transparently" run either in real time or in Hadoop. These approaches worked, but none were very pleasant or productive. Keeping code written in two different systems perfectly in sync was really, really hard.

> By "reprocessing," I mean processing input data over again to re-derive output. This is a completely obvious but often ignored requirement. Code will always change. So, if you have code that derives output data from an input stream, whenever the code changes, you will need to recompute your output to see the effect of the change.

> Use Kafka or some other system that will let you retain the full log of the data you want to be able to reprocess and that allows for multiple subscribers. For example, if you want to reprocess up to 30 days of data, set your retention in Kafka to 30 days.

> When you want to do the reprocessing, start a second instance of your stream processing job that starts processing from the beginning of the retained data, but direct this output data to a new output table.

> Maybe we could call this the Kappa Architecture, though it may be too simple of an idea to merit a Greek letter.

> The efficiency and resource trade-offs between the two approaches are somewhat of a wash. The Lambda Architecture requires running both reprocessing and live processing all the time, whereas what I have proposed only requires running the second copy of the job when you need reprocessing. However, my proposal requires temporarily having 2x the storage space in the output database and requires a database that supports high-volume writes for the re-load.

Contents (for the coverage map):
1. The core Lambda criticism: maintaining equivalent logic in two separate distributed systems (a batch layer and a speed layer) is painful and, in Kreps's view, not fixable.
2. LinkedIn's own lived experience with hybrid-Hadoop architectures and a "transparent" dual-run API, which "worked" but was never pleasant or productive — code written in two systems drifting apart in practice.
3. The precise definition of "reprocessing": re-deriving output from the same input after the processing code changes — an obvious, frequently-ignored requirement.
4. The Kappa proposal: retain the full input log (e.g. in Kafka) and, to reprocess, start a second instance of the *same* stream-processing job from the start of the log, writing to a new output table — one code path, not two.
5. The naming of "Kappa Architecture" itself, offered with explicit modesty ("too simple an idea to merit a Greek letter").
6. The real resource trade-off Kreps names explicitly: Kappa's reprocessing run needs roughly double the output storage temporarily and a database that can absorb a high-volume reload — not a free lunch, just a different cost than Lambda's "always-on dual pipeline."

Note: this topic also names unified-engine triggers (Spark Structured Streaming's `availableNow`,
Flink's unified batch/stream execution) per `CHAPTER.md`'s own scope line, attributed to those
projects' own engines/documentation without an independent fetch here, since Chapters 7 and 9
(which own those mechanics) are not yet built and this topic only points at them by name, per
`CHAPTER.md`'s "Leaves out" instruction for this entry.

## Akidau, Bradshaw, Chambers, et al. — "The Dataflow Model" (VLDB 2015)

URL: https://vldb.org/pvldb/vol8/p1792-Akidau.pdf
Version: Proceedings of the VLDB Endowment, Vol. 8, No. 12, 2015 (accessed 2026-10-30)

> It is lastly worth noting that there is nothing magical about this model. Things which are computationally impractical in existing strongly-consistent batch, micro-batch, streaming, or Lambda Architecture systems remain so, with the inherent constraints of CPU, RAM, and disk left steadfastly in place.

> When describing infinite/finite data sets, we prefer the terms unbounded/bounded over streaming/batch, because the latter terms carry with them an implication of the use of a specific type of execution engine. In reality, unbounded datasets have been processed using repeated runs of batch systems since their conception, and well-designed streaming systems are perfectly capable of processing bounded data. From the perspective of the model, the distinction of streaming or batch is largely irrelevant, and we thus reserve those terms exclusively for describing runtime execution engines.

Contents (for the coverage map):
1. The paper's own framing: nothing about the unified model is magical — what's computationally impractical in a batch, micro-batch, streaming, or Lambda Architecture system stays impractical, since CPU, RAM, and disk constraints never move.
2. The paper's explicit reservation of "streaming" and "batch" for execution engines only, not for the shape of the data itself — the theoretical basis this topic's own decision card (framed around shapes, not engines) rests on.
