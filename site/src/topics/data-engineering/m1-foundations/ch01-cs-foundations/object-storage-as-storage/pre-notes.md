- **HTTP method and status code**: a request names an action (GET reads, PUT writes, DELETE removes, HEAD asks for metadata) and the reply carries a numeric status. *Where you meet it:* a 404 means missing, a 503 means the server is shedding load.
- **Bucket**: a named container that holds objects, one per customer or project. *Where you meet it:* every cloud console starts by asking which bucket you want.
- **Replication for durability**: the provider stores several copies of your data in separate failure domains so one dead disk loses nothing. *Where you meet it:* storage classes quote "eleven nines" of durability.
- **Columnar file (such as Parquet)**: a file that stores each column's values together rather than row by row. *Where you meet it:* analytics tools read only the columns a query names.
- **Percentile (p50, p99)**: the value below which that share of observations fall; p99 is the slowest one in a hundred. *Where you meet it:* dashboards show p99 latency because the average hides slow requests.

**Check yourself:** a request returns status 412. Is that a server failure or a refused condition? (Answer: a refused condition: "Precondition Failed", the request said "only if" and the check did not hold.)
