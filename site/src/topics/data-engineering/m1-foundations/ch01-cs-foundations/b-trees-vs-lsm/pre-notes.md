- **Index**: a separate structure that maps column values to the rows holding them, so a query can find rows without scanning the table. *Where you meet it:* `CREATE INDEX` on a column you filter by often.
- **Key and separator**: a key is the value an index orders by; a separator is a key stored in an inner node to tell a search which way to go. *Where you meet it:* a phone book's header "Ma–Mo" at the top of a page.
- **Point lookup vs range scan**: a point lookup fetches one key; a range scan fetches every key between two bounds. *Where you meet it:* `WHERE id = 7` versus `WHERE created_at BETWEEN a AND b`.
- **Write-ahead log (WAL)**: an append-only record of changes written before the changes themselves, so a crash can be replayed. *Where you meet it:* PostgreSQL's `pg_wal` directory.

**Check yourself:** a tree with fan-out one thousand over a billion keys is how many levels deep? (Answer: three, since log<sub>1000</sub>(10<sup>9</sup>) = 3.)
