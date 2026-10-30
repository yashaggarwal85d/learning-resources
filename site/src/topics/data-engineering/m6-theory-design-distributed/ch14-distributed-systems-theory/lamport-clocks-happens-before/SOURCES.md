## Time, Clocks, and the Ordering of Events in a Distributed System (Lamport, CACM 1978)

URL: https://lamport.azurewebsites.net/pubs/time-clocks.pdf
Version: Communications of the ACM, Volume 21, Issue 7, July 1978, pages 558–565 (author's own posted copy)

> Definition. The relation "---->"on the set of events of a system is the smallest relation satisfying the following three conditions: (1) I f a and b are events in the same process, and a comes before b, then a ~ b. (2) I f a is the sending of a message by one process and b is the receipt o f the same message by another process, then a ~ b. (3) I f a ~ b and b ~ c then a ---* c. Two distinct events a and b are said to be concurrent if a ~ b and b -/-* a.

> happened before" is therefore only a partial ordering

> Clock Condition. For any events a, b:
if a---> b then C ( a ) < C(b).

> C 1. I f a and b are events in process P~, and a comes before b, then Ci(a) < Ci(b).
C2. If a is the sending of a message by process Pi
and b is the receipt of that message by process Pi, then
Ci(a) < Ci(b).

> IR1. Each process P~ increments Ci between any
two successive events.

> IR2. (a) I f event a is the sending of a message m
by process P~, then the message m contains a timestamp
T m = Ci(a). (b) U p o n receiving a message m, process
Pi sets Ci greater than or equal to its present value and
greater than Tin.

> if a is an event in process
Pi and b is an event in process Pj, then a ~ b if and only
if either (i) Ci{a) < Cj(b) or (ii) El(a)
Cj(b) and Pi
< Py. It is easy to see that this defines a total ordering,
and that the Clock Condition implies that if
a ----> b then a ~ b.

> T h e total ordering defined by the algorithm is somewhat arbitrary. It can produce a n o m a l o u s b e h a v i o r if it
disagrees with the ordering perceived by the system's
users.

> Let O° be the set of all system events. Let us
introduce a set of events which contains the events in b°
together with all other relevant external events, such as
the phone calls in our example. Let ~ denote the "happened before" relation for ~. In our example, we had A
B, but A-~ B.

## Physical clocks and why they lie — internal cross-reference, not re-fetched

URL: internal-not-fetched-physical-clocks-why-they-lie-topic
Version: already fetched and quoted for topic 2 (`../physical-clocks-why-they-lie/SOURCES.md`); this topic only reuses the `clock-drift-ntp-error` and `last-write-wins-clock-hazard` concepts topic 2 introduced, with no new claim of its own from that topic's sources.

Contents (for the coverage map): the formal happens-before definition and its three conditions (program order, message send/receipt, transitivity), concurrency defined as the absence of any such chain either way; the Clock Condition and its implementation via rules IR1/IR2 (increment between events, stamp outgoing messages, advance on receipt past the message's timestamp); the tie-broken total ordering construction using an arbitrary total order of process identifiers, and the proof sketch that it extends happens-before without contradicting it; the mutual-exclusion resource-scheduling algorithm built on that total order (named here, not built); the anomalous-behavior example (the phone-call-outside-the-system case where an external precedence the algorithm cannot see gets the wrong total-order answer), and the two fixes it proposes (carry the timestamp out-of-band, or use physical clocks satisfying the Strong Clock Condition) — the second of which is topic 2's subject, already covered.
