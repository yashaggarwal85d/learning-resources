- **Partition**: Kafka's own unit of order; records inside one partition keep the order they
  were written in, and records in different partitions make no promise to each other at all.
- **Change-event key**: the primary key of the source row, carried on every change event so a
  consumer can route every change to one row onto the same partition.
- **Transaction**: the source database's own commit boundary, which may touch one row or many
  rows across several different tables in a single atomic unit.
- **Commit order**: the order a database's log actually recorded transactions in, which a
  change stream tries to preserve within whatever unit it delivers.
- **Transaction id**: the identifier a consumer uses to regroup a transaction's own scattered
  changes; for PostgreSQL it is built from the real transaction id and the commit's log position.
- **Event count**: the number of change events a transaction produced, carried on its own end
  marker so a consumer knows when every one of them has arrived.
- **Orphan row**: a change event a consumer has received but cannot yet join against the other
  table its own transaction touched, because that table's own changes haven't arrived yet.
