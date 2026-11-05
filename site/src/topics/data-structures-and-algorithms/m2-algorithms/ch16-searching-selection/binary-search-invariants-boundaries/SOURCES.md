## Bloch — "Extra, Extra — Read All About It: Nearly All Binary Searches and Mergesorts are Broken" (Google Research blog, 2 June 2006)

URL: https://research.google/blog/extra-extra-read-all-about-it-nearly-all-binary-searches-and-mergesorts-are-broken/
Version: fetched 2026-11-05, the post as currently published (with its 17 Feb 2008 update note)

> Fast forward to 2006. I was shocked to learn that the binary search program that Bentley proved correct and subsequently tested in Chapter 5 of Programming Pearls contains a bug. Once I tell you what it is, you will understand why it escaped detection for two decades. Lest you think I'm picking on Bentley, let me tell you how I discovered the bug: The version of binary search that I wrote for the JDK contained the same bug. It was reported to Sun recently when it broke someone's program, after lying in wait for nine years or so.

> 6: int mid = (low + high) / 2;

> In Programming Pearls Bentley says that the analogous line "sets m to the average of l and u, truncated down to the nearest integer." On the face of it, this assertion might appear correct, but it fails for large values of the int variables low and high. Specifically, it fails if the sum of low and high is greater than the maximum positive int value (231 - 1). The sum overflows to a negative value, and the value stays negative when divided by two. In C this causes an array index out of bounds with unpredictable results. In Java, it throws ArrayIndexOutOfBoundsException.

> This bug can manifest itself for arrays whose length (in elements) is 230 or greater (roughly a billion elements). This was inconceivable back in the '80s, when Programming Pearls was written, but it is common these days at Google and other places.

> 6: int mid = low + ((high - low) / 2);

> 6: int mid = (low + high) >>> 1;

> Update 17 Feb 2008: Thanks to Antoine Trux, Principal Member of Engineering Staff at Nokia Research Center Finland for pointing out that the original proposed fix for C and C++ (Line 6), was not guaranteed to work by the relevant C99 standard (INTERNATIONAL STANDARD - ISO/IEC - 9899 - Second edition - 1999-12-01, 3.4.3.3), which says that if you add two signed quantities and get an overflow, the result is undefined.

### Contents (item by item, this topic's scope)

- The bug: JDK's own `Arrays.binarySearch` (Bloch's own code) carried the same midpoint-overflow bug as Bentley's *Programming Pearls* Chapter 5 listing, undetected for about nine years. Used by the hook and the topic's main claim.
- The broken line: `int mid = (low + high) / 2;` — fails when `low + high` overflows a 32-bit signed int (threshold: array length ≥ 2^30, "roughly a billion elements"). Used as the `cherry` frame.
- The portable fix: `int mid = low + ((high - low) / 2);` — avoids ever summing two large values; this is the form the reel teaches as *the* safe midpoint (language-independent). Used throughout the topic.
- The Java-specific fix actually shipped: `int mid = (low + high) >>> 1;` (unsigned right shift) — named as the JDK's own fix, kept distinct from the portable form above since it relies on Java's unsigned-shift operator, not available the same way in C/C++.
- The 2008 correction: the originally proposed C/C++ cast-to-unsigned fix is not guaranteed by the C99 standard (signed overflow is undefined behaviour), which is why the topic teaches `low + ((high - low) / 2)` as the one safe form across languages, not the unsigned-cast version. Out of scope for the reel's main line (one post-notes sentence only); not re-derived, only cited.

## cplusplus.com reference — `std::lower_bound`

URL: https://cplusplus.com/reference/algorithm/lower_bound/
Version: fetched 2026-11-05, the page as currently published

> Returns an iterator pointing to the first element in the range [first,last) which does not compare less than val.

### Contents (item by item, this topic's scope)

- The naming convention and contract for `lower_bound`: first position where the element is not less than the target (equivalently, first position where `a[i] >= x`). Used to define the topic's `lower_bound` predicate exactly as mainstream standard libraries define it.

## cplusplus.com reference — `std::upper_bound`

URL: https://cplusplus.com/reference/algorithm/upper_bound/
Version: fetched 2026-11-05, the page as currently published

> Returns an iterator pointing to the first element in the range [first,last) which compares greater than val.

> If no element in the range compares greater than val, the function returns last.

### Contents (item by item, this topic's scope)

- The naming convention and contract for `upper_bound`: first position where the element compares greater than the target; returns `last` (the end of the half-open range) when nothing does. Used to define the topic's `upper_bound` predicate, and to justify the half-open convention's "boundary equals the range's own end" case directly from a primary source rather than asserting it.
