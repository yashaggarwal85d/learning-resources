"""de.message-queues-vs-event — executable evidence.

Runs against a real, on-disk SQLite database: a per-message queue (delete-on-acknowledge, the
real mechanics RabbitMQ's and SQS's own documentation describes) and an offset-based log (a
message's own row never deleted, only a consumer's own offset advances), built as real schemas
and queried for real — not asserted from a description. Kafka's own share groups (KIP-932) are
sourced and named, not separately run, since this sandbox doesn't stand up a real multi-broker
Kafka cluster.
"""

import os
import sqlite3

DB_PATH = "queue_vs_log.db"


def fresh_db():
    if os.path.exists(DB_PATH):
        os.remove(DB_PATH)
    return sqlite3.connect(DB_PATH)


def build_queue(con):
    con.execute("CREATE TABLE queue_messages (id INTEGER PRIMARY KEY, body TEXT)")
    for i in range(5):
        con.execute("INSERT INTO queue_messages (id, body) VALUES (?, ?)", (i, f"event-{i}"))
    con.commit()


def queue_consume_and_ack(con, message_id):
    row = con.execute("SELECT body FROM queue_messages WHERE id = ?", (message_id,)).fetchone()
    if row is None:
        return None
    # acknowledging a delivery marks it for deletion — RabbitMQ's/SQS's own real mechanics
    con.execute("DELETE FROM queue_messages WHERE id = ?", (message_id,))
    con.commit()
    return row[0]


def build_log(con):
    con.execute("CREATE TABLE log_messages (offset INTEGER PRIMARY KEY, body TEXT)")
    for i in range(5):
        con.execute("INSERT INTO log_messages (offset, body) VALUES (?, ?)", (i, f"event-{i}"))
    con.commit()
    con.execute("CREATE TABLE consumer_position (consumer TEXT PRIMARY KEY, next_offset INTEGER)")
    con.execute("INSERT INTO consumer_position VALUES ('consumer-a', 0)")
    con.commit()


def log_consume_next(con, consumer):
    pos = con.execute("SELECT next_offset FROM consumer_position WHERE consumer = ?", (consumer,)).fetchone()[0]
    row = con.execute("SELECT body FROM log_messages WHERE offset = ?", (pos,)).fetchone()
    if row is None:
        return None
    # the message row itself is never touched — only the consumer's own position advances
    con.execute("UPDATE consumer_position SET next_offset = ? WHERE consumer = ?", (pos + 1, consumer))
    con.commit()
    return row[0]


def log_rewind(con, consumer, offset):
    con.execute("UPDATE consumer_position SET next_offset = ? WHERE consumer = ?", (offset, consumer))
    con.commit()


def run():
    con = fresh_db()
    build_queue(con)
    build_log(con)

    first_delivery = queue_consume_and_ack(con, 2)
    second_attempt = queue_consume_and_ack(con, 2)
    print(f"Queue: first delivery of message 2 returned {first_delivery!r}; the same message, asked for again after being acknowledged, returned {second_attempt!r}.")
    assert first_delivery == "event-2"
    assert second_attempt is None  # acknowledged, deleted, genuinely gone

    seen = [log_consume_next(con, "consumer-a") for _ in range(3)]
    log_rewind(con, "consumer-a", 0)
    replayed = [log_consume_next(con, "consumer-a") for _ in range(3)]
    print(f"\nLog: a consumer reads {seen}, then rewinds its own offset back to the start and reads {replayed} again.")
    assert seen == ["event-0", "event-1", "event-2"]
    assert replayed == seen  # the identical messages, still there, replayed rather than redelivered

    con.close()
    os.remove(DB_PATH)


if __name__ == "__main__":
    run()
