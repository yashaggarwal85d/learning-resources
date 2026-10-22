# Sources — de.lambda-vs-kappa-architectures

Both architectures are quoted from their own originators' own writing, not a secondary
explainer, matching CHAPTER.md's explicit attribution instruction. This topic has no lab of its
own (`CHAPTER.md`).

## Nathan Marz, "How to beat the CAP theorem"

URL: http://nathanmarz.com/blog/how-to-beat-the-cap-theorem.html
Fetched: 2026-10-22.

Quotes:
> To compensate for those few hours of data, you need a realtime system that runs in parallel with the batch system. The realtime system precomputes each query function for the last few hours of data. To resolve a query function, you query the batch view and the realtime view and merge the results together to get the final answer.

> The realtime layer is where you use read/write databases like Riak or Cassandra, and the realtime layer relies on incremental algorithms to update the state in those databases.

> Since the realtime layer only compensates for the last few hours of data, everything the realtime layer computes is eventually overridden by the batch layer. So if you make a mistake or something goes wrong in the realtime layer, the batch layer will correct it. All that complexity is transient.

> In the batch layer, you only have to think about data and functions on that data. The batch layer is really simple to reason about. In the realtime layer, on the other hand, you have to use incremental algorithms and extremely complex NoSQL databases.

Items: (1) the architecture itself, in its own originator's words — batch and realtime layers run in parallel, merged at query time; (2) the batch layer's results always override the realtime layer's, making the realtime layer's own complexity transient; (3) the two layers' own differing reasoning models (pure functions on data vs. incremental algorithms) are what the later dual-logic cost traces back to.

## Jay Kreps, "Questioning the Lambda Architecture"

URL: https://www.oreilly.com/radar/questioning-the-lambda-architecture/
Fetched: 2026-10-22.

Quotes:
> Nathan Marz wrote a popular blog post describing an idea he called the Lambda Architecture ("How to beat the CAP theorem"). The Lambda Architecture is an approach to building stream processing applications on top of MapReduce and Storm or similar systems.

> The way this works is that an immutable sequence of records is captured and fed into a batch system and a stream processing system in parallel. You implement your transformation logic twice, once in the batch system and once in the stream processing system. You stitch together the results from both systems at query time to produce a complete answer.

> The problem with the Lambda Architecture is that maintaining code that needs to produce the same result in two complex distributed systems is exactly as painful as it seems like it would be. I don't think this problem is fixable.

> I also like that this architecture highlights the problem of reprocessing data. Reprocessing is one of the key challenges of stream processing but is very often ignored. By "reprocessing," I mean processing input data over again to re-derive output.

> Use Kafka or some other system that will let you retain the full log of the data you want to be able to reprocess and that allows for multiple subscribers. For example, if you want to reprocess up to 30 days of data, set your retention in Kafka to 30 days.

> When you want to do the reprocessing, start a second instance of your stream processing job that starts processing from the beginning of the retained data, but direct this output data to a new output table.

> Maybe we could call this the Kappa Architecture, though it may be too simple of an idea to merit a Greek letter.

> The Lambda Architecture requires running both reprocessing and live processing all the time, whereas what I have proposed only requires running the second copy of the job when you need reprocessing. However, my proposal requires temporarily having 2x the storage space in the output database and requires a database that supports high-volume writes for the re-load.

> The real advantage isn't about efficiency at all, but rather about allowing people to develop, test, debug, and operate their systems on top of a single processing framework. So, in cases where simplicity is important, consider this approach as an alternative to the Lambda Architecture.

Items: (1) Lambda's own definition and attribution to Marz, from Kreps's own words; (2) Lambda's actual named cost is maintaining duplicate transformation logic across two distributed systems, which Kreps calls not fixable; (3) reprocessing (re-deriving output when code changes) is the real shared challenge both architectures answer differently; (4) the Kappa alternative — reprocess by replaying a fully-retained log through a second instance of the same stream-processing job — named by Kreps himself as "the Kappa Architecture"; (5) Kreps's own efficiency comparison, which is a wash, not a one-sided win; (6) Kreps's actual stated reason for preferring Kappa is operating one framework, not raw efficiency — the basis for "why the industry drifted to unified engines."

### Disclosure

No numeric claim is made anywhere in this topic beyond what these two primary sources state
qualitatively — neither source gives a reproducible number for the dual-logic or reprocessing
cost, and this topic has no lab to measure one independently.

The "batch correction layer still earns its cost" exception (CHAPTER.md's own closing clause) is
not a new primary-source claim: it follows directly from Marz's own description of the batch
layer correcting the realtime layer, plus Kreps's own reprocessing-by-replay cost — a unified
streaming engine with low reprocessing cost removes most of Lambda's reason to exist, but a
system where reprocessing-by-replay is itself expensive (a very large retained log, or logic
that must be corrected without ever serving wrong answers in the interim) still has a reason to
keep a separate, slower, more exactly-correct batch layer, exactly as Marz's own post describes
the batch layer's role.
