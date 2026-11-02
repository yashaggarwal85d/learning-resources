Last verified: 30 October 2026. No live lab (per `CHAPTER.md`); the failure-domain hierarchy and
each system's PACELC quadrant are checked executable claims (`examples.py`), run and confirmed
clean.

- Eric Brewer, "CAP Twelve Years Later: How the 'Rules' Have Changed": [infoq.com](https://www.infoq.com/articles/cap-twelve-years-later-how-the-rules-have-changed/). CAP stated precisely, as a behavior during a partition, not a permanent choice.
- Daniel Abadi, "Problems with CAP, and Yahoo's little known NoSQL system": [dbmsmusings.blogspot.com](https://dbmsmusings.blogspot.com/2010/04/problems-with-cap-and-yahoos-little.html). PACELC's own original statement, by the author who proposed it; the later formal paper ("Consistency Tradeoffs in Modern Distributed Database System Design") is hosted at `cs.umd.edu`, which serves a broken TLS chain in this sandbox — cited bibliographically, not quoted.
- DeCandia et al., "Dynamo: Amazon's Highly Available Key-value Store" (SOSP 2007): [allthingsdistributed.com](https://www.allthingsdistributed.com/files/amazon-dynamo-sosp2007.pdf). Dynamo's own documented design, classified here as PA/EL.
- Corbett et al., "Spanner: Google's Globally-Distributed Database" (OSDI 2012): [static.googleusercontent.com](https://static.googleusercontent.com/media/research.google.com/en//archive/spanner-osdi2012.pdf). Spanner's own documented design, classified here as PC/EC.

Spotted an error or something unclear? [Report it](https://github.com/yashaggarwal85d/learning-resources/issues/new?title=cap-pacelc-practice:%20).
