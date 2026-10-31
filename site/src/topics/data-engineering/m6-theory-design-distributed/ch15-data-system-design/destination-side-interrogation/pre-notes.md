- **Consumer**: anyone or anything that reads a dataset — a dashboard, a model, an API, a
  report. *Where you meet it:* the list-every-consumer reveal.
- **Use case**: what a consumer actually does with the data once they have it. *Where you meet
  it:* the list-every-consumer reveal.
- **Dashboard**: a BI consumer that tolerates minutes and reads aggregates. *Where you meet it:*
  the several-stores reveal.
- **API**: an operational consumer that needs a point lookup at low latency. *Where you meet
  it:* the several-stores reveal.
- **Grain**: the level of detail a consumer needs — per event, per order, per day. *Where you
  meet it:* the grain-concurrency-retention reveal.
- **Concurrency**: how many queries run against a dataset at once. *Where you meet it:* the
  grain-concurrency-retention reveal.
- **Export**: a copy of the data leaving the engine through a download, an extract, or an API
  call. *Where you meet it:* the export-paths reveal.
- **Access control**: who may see which rows and columns of a dataset. *Where you meet it:* the
  export-paths reveal.
- **Retention**: how long a consumer needs history to stay queryable. *Where you meet it:* the
  grain-concurrency-retention reveal.
