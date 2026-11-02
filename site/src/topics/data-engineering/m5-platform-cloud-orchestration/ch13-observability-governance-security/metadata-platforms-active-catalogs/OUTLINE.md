# Outline: de.metadata-platforms-active-catalogs

1. **Hook.** The shop's catalog was last crawled on Sunday. On Wednesday a table was dropped,
   another created, and a column renamed. A stakeholder searching Thursday finds the old table,
   confidently marked certified. What would the catalog need to be built differently to be right
   within seconds, and what does that change in who has to do the work?
2. **Reveal: a metadata graph -- tables, columns, a glossary term, an owner and a tag, as nodes;
   owns/derives-from/tagged-with as edges.** [from] DataHub's and OpenMetadata's own
   architecture pages: an entity store plus a search index.
3. **Predict: the Wednesday rename. Does a crawl-based catalog or a push-based one show it
   first on Thursday?** [idx5]
4. **Reveal: push wins by the whole gap, measured directly -- push sees the rename
   immediately; crawl shows the old name until its next scheduled run.**
5. **Elaborate: search, usage statistics and a glossary are the three things a catalog is used
   for day to day.** [takeaway1] Finding a dataset, trusting it, and agreeing what a column
   means.
6. **Predict: a table is created and dropped entirely between two crawl runs. Does a crawl-
   based catalog ever see it existed?** [idx8]
7. **Reveal: no -- measured directly, a crawl-based catalog never sees it at all; a push-based
   one sees both the create and the drop events.**
8. **Elaborate: a technical catalog answers where a table's files are and who may read them; a
   business catalog answers what a column means, who owns it, and where it came from.**
   [takeaway2]
9. **Reveal: open source splits along that line -- Unity Catalog OSS and Apache Polaris are
   technical catalogs; DataHub and OpenMetadata are business/discovery catalogs; Collibra,
   Atlan and Alation are commercial products covering the business side.**
10. **Reveal: Polaris graduated to a top-level Apache project in February 2026; Amundsen was
    archived for inactivity in September 2026 -- stronger than the syllabus's own "low-activity."**
11. **Recap.** [takeaway3]
