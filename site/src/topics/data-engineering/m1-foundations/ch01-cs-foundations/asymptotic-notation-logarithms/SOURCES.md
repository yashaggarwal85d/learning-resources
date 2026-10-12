## MIT OpenCourseWare 6.006 Introduction to Algorithms, Spring 2020 - Recitation 1
URL: https://ocw.mit.edu/courses/6-006-introduction-to-algorithms-spring-2020/c6d8f06c6f11e3342633dec85498f551_MIT6_006S20_r01.pdf
Version: Spring 2020 (Instructors: Erik Demaine, Jason Ku, Justin Solomon), Recitation 1 PDF

> So in this class, we compare algorithms based on their asymptotic performance relative to
> problem input size, in order to ignore constant factor differences in hardware performance.

> We can use asymptotic notation to ignore constants that do not change with the size of the problem
> input.

> O Notation: Non-negative function g(n) is in O(f (n)) if and only if there exists a
> positive real number c and positive integer n0 such that g(n) ≤ c · f (n) for all n ≥ n0 .

> This definition upper bounds the asymptotic growth of a function for sufficiently large n, i.e.,
> the bound on growth is true even if we were to scale or shift our function by a constant amount.

> By convention, it is more common for people to say that a function g(n) is O(f (n)) or equal
> to O(f (n)), but what they really mean is set containment, i.e., g(n) ∈ O(f (n)).

> So since our
> problem's input size is cn for some constant c, we can forget about c and say the input size is O(n)
> (order n). A similar notation can be used for lower bounds.

> Ω Notation: Non-negative function g(n) is in Ω(f (n)) if and only if there exists a
> positive real number c and positive integer n0 such that c · f (n) ≤ g(n) for all n ≥ n0 .

> When one function both asymptotically upper bounds and asymptotically lower bounds another
> function, we use Θ notation. When g(n) = Θ(f (n)), we say that f (n) represents a tight bound
> on g(n).

> Θ Notation: Non-negative g(n) is in Θ(f (n)) if and only if g(n) ∈ O(f (n)) ∩ Ω(f (n)).

> We often use shorthand to characterize the asymptotic growth (i.e., asymptotic complexity) of
> common functions, such as those shown in the table below

Table (constant Θ(1), logarithmic Θ(log n), linear Θ(n), quadratic Θ(n2), polynomial Θ(nc), exponential 2^Θ(n^c)) is given in that order.

> Linear time is often necessary to solve problems where the entire input must be read in order to
> solve the problem.

> However, if the input is already accessible in memory, many problems can
> be solved in sub-linear time. For example, the problem of finding a value in a sorted array (that
> has already been loaded into memory) can be solved in logarithmic time via binary search.

> There's a big
> difference between logarithmic, linear, and exponential. If n = 1000, log n ≈ 10

> So when
> solving a problem on an input stored in n machine words, we will always assume our Word-RAM
> has a word size of at least w > log2 n bits, or else the machine would not be able to access all of the
> input in memory.

> Solution: Recall exponent and logarithm rules: log ab = log a + log b, log (ab ) = b log a,
> and loga b = log b/ log a.

> Show that (log n)a = O(nb ) for all positive constants a and b.

> Solution: In the first case, 2n+1 = 2 · 2n , which is a constant factor larger than 2n .

> But taking
> the logarithm of Sterling's gives log(n!) = Θ(n log n), and substituting in 6n yields only
> constant additional factors.

Contents:
- Algorithms: problem, deterministic algorithm, birthday-matching example
- Correctness: proof by induction
- Efficiency: comparing algorithms by asymptotic performance, ignoring constant factors
- Asymptotic Notation: definitions of O, Omega, Theta; table of common growth shorthands (constant to exponential); binary search as logarithmic time; input-size conventions
- Model of Computation: w-bit Word-RAM, word size w > log2 n
- Data Structure: interface, static array
- Running Time Analysis: birthday matching in O(n^2)
- Asymptotics Exercises: ordering growth, binomial bound, logarithm rules (product, power, change of base), 2^(n+1) vs 2^n, polylog vs polynomial, Stirling and log(n!)

## D. E. Knuth, "Big Omicron and big Omega and big Theta"
URL: https://danluu.com/knuth-big-o.pdf
Version: SIGACT News 8(2), April-June 1976, pp. 18-24 (scan hosted by danluu.com; reprinted in Knuth, Selected Papers on Analysis of Algorithms, CSLI, 2000)

Note: the PDF is a scan with OCR. Symbols (Omega, Theta, the inequalities) are garbled in the extracted text, so the quotes below are only passages whose words came through intact.

> Most of us have gotten accustomed to the idea of using the notation O(f(n)) to stand for any function whose magnitude is upper-bounded by a constant times f(n) , for all large n .

> Sometimes we also need a corresponding notation for lower-bounded functions,

> when they reject a particular sorting method

> the following definitions will prove to be most useful for computer scientists:

> can be read as "order at most f(n) ";

> Cf(n) < g(n) < C'f(n)

> O-notation and its relatives are used in formulas, we are actually speaking about sets of functions rather than single functions.

> The equal sign here really means

> My feeling is that we should continue to use one-way equality together with

Contents:
- O(f(n)) is an upper bound: functions whose magnitude is at most a constant times f(n) for all large n.
- A matching lower-bound notation is needed; people misuse O for lower bounds, e.g. rejecting a sorting method "because its running time is O(n^2)", which says only "at most", not "at least".
- Omega (from Hardy and Littlewood, 1914) existed, but their definition was the negation of o and held only for infinitely many n; Knuth redefines it for all large n.
- Definitions: O(f(n)) is the set of g with |g(n)| <= C f(n) for n >= n0; Omega(f(n)) is the set with g(n) >= C f(n); Theta(f(n)) is the set with C f(n) <= g(n) <= C' f(n). Read as "order at most", "order at least", "order exactly".
- Theta is the tight bound: it is O and Omega at once, so it pins the growth rate from both sides. Theta was suggested independently by Tarjan and Paterson.
- The definitions concern n -> infinity; for x -> 0 use a neighborhood of zero instead.
- Sets view (suggested by Rivest): O(...) in a formula denotes a set of functions, e.g. 1 + O(n^-1) is a set. "=" is one-way: 1 + O(n^-1) = O(1) but not the reverse; it really means set inclusion. Knuth keeps the convention.
- Optional o and omega (little) notations are mentioned; Knuth prefers to prove O-estimates.
- History: Bachmann 1894 (O), Landau (o), du Bois-Reymond 1871 relational notation, Hardy's orders of infinity; Vinogradov's << differs.

## NIST Digital Library of Mathematical Functions, §4.2 Definitions
URL: https://dlmf.nist.gov/4.2
Version: DLMF Version 1.2.8, release date 2026-09-15 (© 2010–2026 NIST)

Definition of the natural logarithm (principal value, eq. 4.2.2):
> The principal value, or principal branch, is defined by

> ln⁡z=∫1zdtt,

The natural logarithm is real-valued on the positive reals:
> ln⁡z is a single-valued analytic function on
> ℂ∖(−∞,0] and real-valued when z ranges over the
> positive real numbers.

Logarithm to a general base (eq. 4.2.8):
> With a,b≠0 or 1,

> loga⁡z
> =ln⁡z/ln⁡a,

Change of base (eq. 4.2.9) and reciprocal rule (eq. 4.2.10):
> loga⁡z
> =logb⁡zlogb⁡a,

> loga⁡b
> =1logb⁡a.

Natural logarithm as base e, and common logarithm (eqs. 4.2.14, 4.2.15):
> Natural logarithms have as base the unique positive number

> such that

> ln⁡e=1.

> loge⁡z=ln⁡z,

> log10⁡z=(ln⁡z)/(ln⁡10)=(log10⁡e)⁢ln⁡z,

> loge⁡x=ln⁡x is also called the Napierian or
> hyperbolic logarithm. log10⁡x is the common or
> Briggs logarithm.

Powers defined through the logarithm (eq. 4.2.26):
> The general ath power of z is defined by

> za=exp⁡(a⁢Ln⁡z),

Inverse of the exponential (eq. 4.2.25) and the only zero of ln (§4.2(i)):
> exp⁡z=ζ⟺z=Ln⁡ζ.

> The only zero of ln⁡z is at z=1.

Value of ln 10 (eq. 4.2.18), used for mental conversions between base 10 and base e:
> ln⁡10=2.30258 50929 94045 68401⁢….

A whole-number power is repeated multiplication (eq. 4.2.27), so log_b x counts how many factors of b make x:
> In particular, z0=1, and if a=n=1,2,3,…, then

> za=z⋅z⁢⋯⁢z⏟n⁢ times=1/z−a.

Note: §4.2 does not state the product rule or the power rule for logarithms (log of a product, log of a power) as separate identities; the closest statement is the definition of z^a via exp(a Ln z) above. The formulas are garbled in plain text, so only the lines that appear verbatim are quoted.

Contents:
- §4.2(i) The Logarithm: Ln z defined by the integral of dt/t from 1 to z (general, multivalued); the principal value ln z by the same integral avoiding the cut (−∞,0]; ln z = ln|z| + i ph z; the only zero of ln z is z=1; closed definition on the branch cut; Ln z = ln z + 2kπi.
- §4.2(ii) Logarithms to a General Base a: log_a z = ln z / ln a (4.2.8); log_a z = log_b z / log_b a (4.2.9); log_a b = 1 / log_b a (4.2.10); e = 2.71828…; ln e = 1; log_e z = ln z; log_10 z = ln z / ln 10 = (log_10 e) ln z; ln z = (ln 10) log_10 z; log_10 e = 0.4342944819…; ln 10 = 2.302585092994…; ln is also called Napierian or hyperbolic logarithm, log_10 the common or Briggs logarithm.
- §4.2(iii) The Exponential Function: exp z as a power series; entire, no zeros, period 2πi; exp(−z) = 1/exp z; |exp z| = exp(Re z); exp z = ζ iff z = Ln ζ.
- §4.2(iv) Powers: z^a = exp(a Ln z) for z≠0; z^n as repeated product for positive integers n; principal value z^a = exp(a ln z); |z^a| and ph(z^a) formulas; e^z = exp z; e = 1 + 1/1! + 1/2! + ⋯.

## PostgreSQL documentation: 65.1. B-Tree Indexes
URL: https://www.postgresql.org/docs/current/btree.html
Version: PostgreSQL 18 documentation (the "current" version when fetched)

> PostgreSQL B-Tree indexes are multi-level tree structures, where each level of the tree can be used as a doubly-linked list of pages.

> Leaf pages are the pages on the lowest level of the tree. All other levels consist of internal pages. Each leaf page contains tuples that point to table rows. Each internal page contains tuples that point to the next level down in the tree. Typically, over 99% of all pages are leaf pages. Both internal pages and leaf pages use the standard page format described in Section 66.6.

> When the root page finally cannot fit a new downlink, a root page split operation takes place. This adds a new level to the tree structure by creating a new root page that is one level above the original root page.

Contents:
- 65.1.1 to 65.1.3: introduction, behaviour of B-tree operator classes (ordering, comparison, equality), support functions.
- 65.1.4.1 B-Tree Structure: multi-level tree of pages; metapage, internal pages, leaf pages; over 99% of pages are leaf pages; both use the standard page format; page splits cascade upward and a root split adds one level, so height grows only when the root overflows.
- 65.1.4.2 Bottom-up index deletion, 65.1.4.3 Deduplication: how version churn and duplicates are handled (no height or fan-out figures given).
- The page states no numeric height bound or fan-out; the logarithmic-height claim must come from elsewhere.

## PostgreSQL documentation: 66.6. Database Page Layout
URL: https://www.postgresql.org/docs/current/storage-page-layout.html
Version: PostgreSQL 18 documentation (the "current" version when fetched)

> Every table and index is stored as an array of pages of a fixed size (usually 8 kB, although a different page size can be selected when compiling the server).

> The first 24 bytes of each page consists of a page header (PageHeaderData).

> For example, b-tree indexes store links to the page's left and right siblings, as well as some other data relevant to the index structure.

Item identifiers (the line pointers), one per item on the page:
> Array of item identifiers pointing to the actual items. Each entry is an (offset,length) pair. 4 bytes per item.

Contents:
- Overview: tables and indexes are arrays of fixed-size pages, usually 8 kB, chosen at compile time; the first index page is generally a metapage.
- Table 66.2 and following: overall page layout (page header, item identifiers, free space, items, special space).
- Page header: first 24 bytes (PageHeaderData) with LSN, checksum, flags, pd_lower, pd_upper, pd_special, page size and version, prune hint.
- Special section: the access method's own space; b-tree stores left and right sibling links there.
- Table row layout (heap tuples, null bitmap, alignment): not needed for B-tree height.

Not used: Bayer and McCreight 1972 (Acta Informatica 1, 173-189) has no freely fetchable PDF; the only free copy found (infolab.usc.edu) is the 1970 Boeing report, a different document.


## J. S. Vitter, "Algorithms and Data Structures for External Memory"
URL: https://www.ittc.ku.edu/~jsv/Papers/Vit.IO_book.pdf
Version: Foundations and Trends in Theoretical Computer Science 2(4), 2008, pp. 305–474 (author's copy; the same monograph the held I/O cost model topic cites). Added 2026-10-12 by the content plan, because SOURCES.md had no source for B-tree height or the sort's pass count (Bayer and McCreight 1972 could not be fetched).

Note: the PDF text flattens superscripts and subscripts, so "1010" below is 10^10, "logB N" is log_B N and "logm n" is log_m n.

The model's letters:
> N = problem size (in units of data items);
> M = internal memory size (in units of data items);
> B = block transfer size (in units of data items);

> It is convenient to refer to some of the above PDM parameters in
> units of disk blocks rather than in units of data items

B-tree height is a logarithm in base B (the fan-out), and the B-tree is Bayer and McCreight's:
> The well-known
> balanced multiway B-tree due to Bayer and McCreight [74, 114, 220],
> is the most widely used nontrivial EM data structure.

> The degree of
> each node in the B-tree (with the exception of the root) is required
> to be Θ(B), which guarantees that the height of a B-tree storing N
> items is roughly logB N.

> Splittings can thus propagate up to
> the root, which is how the tree grows in height.

Merge sort: run formation, then merge passes, so the pass count is a logarithm in base m = M/B:
> At the
> end of the run formation phase, there are N/M = n/m (sorted) runs,
> each striped across the disks.

> In each pass of the merging phase,
> we merge groups of R runs.

> At most R = Θ(m) runs can be merged at a time, and the resulting
> number of passes is O(logm n).

Large bases make these logarithms small constants, and the bases should not be hidden inside big-O:
> In practice, the logarithmic terms logm n in the Sort(N) bound and
> logDB N in the Search(N) bound are small constants.

> For example,
> in units of items, we could have N = 1010, M = 107, B = 104, and
> thus we get n = 106, m = 103, and logm n = 2, in which case sorting
> can be done in a linear number of I/Os.

> It still makes sense to explicitly identify terms such as logm n and
> logB N in the I/O bounds and not hide them within the big-oh or bigtheta factors, since the terms can have a signiﬁcant eﬀect in practice.

> (Of course, it is equally important to consider any other constants
> hidden in big-oh and big-theta notations!)

> The nonlinear I/O bound
> Θ(n logm n) usually indicates that multiple or extra passes over the data
> are required.

Contents (only the parts this topic uses):
- Ch. 2.1: the parallel disk model's parameters N, M, B, D, P, Q, Z, and the lowercase n = N/B, m = M/B in blocks.
- Ch. 3, Table 3.1: Scan Θ(n), Sort Θ(n log_m n), Search Θ(log_B N), Output Θ(max{1, z}); the log terms are "small constants" in practice (N = 10^10, M = 10^7, B = 10^4 gives log_m n = 2; B = 10^2 gives log_B N = 5); bases and constants should be stated, not hidden in the O.
- Ch. 5.2: merge sort: run formation leaves N/M runs; each merge pass merges up to R = Θ(m) runs; O(log_m n) passes.
- Ch. 11: B-trees (Bayer and McCreight): node degree Θ(B), height about log_B N, O(log_B N) I/Os per operation; splits propagate to the root, which is how the tree grows; B+-trees keep items in linked leaves.

## Python documentation: math — Mathematical functions
URL: https://docs.python.org/3/library/math.html
Version: Python 3.15.0 documentation (the "3" docs when fetched, 2026-10-12)

The two-argument logarithm is the change of base, computed in floating point:
> With two arguments, return the logarithm of x to the given base,
> calculated as log(x)/log(base).

> Return the base-2 logarithm of x. This is usually more accurate than
> log(x, 2).

> Return the base-10 logarithm of x. This is usually more accurate
> than log(x, 10).

> int.bit_length() returns the number of bits necessary to represent
> an integer in binary, excluding the sign and leading zeros.

Contents (only the parts this topic uses):
- math.log(x[, base]): natural log with one argument; with two, log(x)/log(base).
- math.log2, math.log10: usually more accurate than the two-argument form.
- int.bit_length(): exact bit count of an integer (an exact way to get floor(log2 n) + 1 without floats).
- math.ceil, math.floor: rounding used for level and pass counts.

## PostgreSQL source: src/include/storage/itemptr.h
URL: https://raw.githubusercontent.com/postgres/postgres/REL_18_STABLE/src/include/storage/itemptr.h
Version: REL_18_STABLE branch, fetched 2026-10-12

Used only to state the index fan-out assumption (the row pointer in each index entry is six bytes):
> This is a pointer to an item within a disk page of a known file

> (for example, a cross-link from an index to its parent table).

> The struct is designed to be six bytes long

> (it contains three int16 fields)

Contents: ItemPointerData (block number and offset, six bytes), the pointer every index tuple carries to its table row.

## PostgreSQL source: src/include/access/itup.h
URL: https://raw.githubusercontent.com/postgres/postgres/REL_18_STABLE/src/include/access/itup.h
Version: REL_18_STABLE branch, fetched 2026-10-12

Used only to state the index fan-out assumption (each index entry is a small header, then the key, aligned):
> All index tuples start with IndexTupleData.

> values follow, beginning at a MAXALIGN boundary.

> ItemPointerData t_tid; /* reference TID to heap tuple */

> unsigned short t_info; /* various info about tuple */

Contents: IndexTupleData = the heap TID (ItemPointerData, six bytes) plus t_info (holds the tuple size and flags); key values follow at a MAXALIGN boundary.
