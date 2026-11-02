Last verified: 30 October 2026. Expert sign-off: pending. One measured experiment run in this
sandbox (`examples.py`): a small SQLite mart where two correctly-written queries disagree because
of an undocumented grain, and where a single compiled metric function makes them agree by
construction.

Airbnb's own Minerva posts are hosted on medium.com, which returned HTTP 403 to this sandbox's
fetcher on every URL tried (confirmed domain-wide, not specific to these posts). Substituted two
independent secondary sources instead, documented in FACT-CHECK.md's Problem Solving section.

- Vu Trinh, "How did Airbnb build their semantic layer?": [vutr.substack.com](https://vutr.substack.com/p/how-did-airbnb-build-their-semantic). Quotes and summarizes Airbnb's own Minerva posts directly; Minerva's architecture and scale figures, quoted directly.
- StarRocks, "Airbnb Builds a New Generation of Fast Analytics Experience with StarRocks": [starrocks.io](https://www.starrocks.io/blog/airbnb-builds-a-new-generation-of-fast-analytics-experience-with-starrocks/index.html). Independent corroboration of Minerva's scale and stack, quoted directly.
- This course's own Chapter 3 topics, "Data contracts as a modeling artifact" (`de.data-contracts-as-modeling`) and "Semantic and metrics layers" (`de.semantic-metrics-layers`), both live: the mechanism this topic's handoff receives, reused by id, not re-derived.

Spotted an error or something unclear? [Report it](https://github.com/yashaggarwal85d/learning-resources/issues/new?title=serving-contract-ownership-handoff:%20).
