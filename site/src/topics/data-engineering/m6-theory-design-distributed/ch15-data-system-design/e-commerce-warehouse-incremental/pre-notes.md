- **Fact table**: a table of measured events or snapshots, at a stated grain. *Where you meet
  it:* the grain-first reveal.
- **Dimension**: a table of descriptive attributes a fact is joined to. *Where you meet it:*
  the grain-first reveal.
- **Grain**: the level of detail one row of a fact table represents. *Where you meet it:* the
  grain-first reveal.
- **Slowly changing dimension**: a dimension whose attributes change over time, tracked by a
  stated policy. *Where you meet it:* the SCD-and-merge reveal.
- **Merge**: a single statement that inserts, updates, or deletes rows by matching a source
  against a target. *Where you meet it:* the SCD-and-merge reveal.
- **Incremental load**: a load that pulls only rows changed since a high-water mark, instead of
  the whole table. *Where you meet it:* the hook and the deleted-row reveal.
- **Mart**: a derived table serving one group of dominant queries. *Where you meet it:* the
  marts-and-semantic-layer reveal.
- **Semantic layer**: a place a business term like "revenue" is defined once. *Where you meet
  it:* the marts-and-semantic-layer reveal.
- **High-water mark**: the last point an incremental load successfully read up to. *Where you
  meet it:* the deleted-row reveal.
