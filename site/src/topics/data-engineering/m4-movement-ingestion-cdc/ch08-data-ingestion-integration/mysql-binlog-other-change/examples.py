"""de.mysql-binlog-other-change -- this sandbox has no MySQL, Oracle or SQL Server server to
measure against directly (CHAPTER.md itself anticipates this: "the sandbox may not have a
second MySQL"; "Lab: none of its own"). Every function here models the documented mechanics
in plain Python, over data structures standing in for a binlog, a replica's own offsets, and a
schema-history topic -- not a live engine. Each function's docstring names the exact
documentation claim it models, and FACT-CHECK.md says so again for each one.
"""


def binlog_row_image_full_is_required_to_decode_an_update():
    """Debezium: "The binlog-format must be set to ROW or row" and "The binlog_row_image must
    be set to FULL or full." Modelled: a STATEMENT-format event carries only the SQL text; a
    ROW-format event carries column values; only FULL carries every old column, which an
    UPDATE's before-image needs when the changed column isn't known in advance."""

    def statement_event(sql):
        return {"format": "STATEMENT", "sql": sql}

    def row_event(image, before, after):
        return {"format": "ROW", "image": image, "before": before, "after": after}

    statement = statement_event("UPDATE orders SET status = 'shipped' WHERE id = 1")
    assert "before" not in statement
    row_minimal = row_event("MINIMAL", before={"id": 1}, after={"id": 1, "status": "shipped"})
    assert "status" not in row_minimal["before"]
    row_full = row_event(
        "FULL",
        before={"id": 1, "status": "paid", "note": "gift"},
        after={"id": 1, "status": "shipped", "note": "gift"},
    )
    assert row_full["before"]["status"] == "paid"
    assert row_full["before"]["note"] == "gift"


def gtid_resolves_across_servers_file_offset_does_not():
    """Debezium: "The connector records its position in the server's binlog, which is
    different on each server in the cluster" and "Because most HA MySQL clusters use GTIDs,
    replicas are able to track all of the changes that occur on any primary server." Modelled:
    the identical transaction has two different file-and-offset positions on two servers, but
    one shared GTID."""

    transaction = {
        "gtid": "3E11FA47-71CA-11E1-9E33-C80AA9429562:23",
        "primary_position": ("mysql-bin.000003", 154),
        "replica_position": ("mysql-bin.000009", 982),
    }

    assert transaction["primary_position"] != transaction["replica_position"]

    def position_means_something_on(server_positions, position, server):
        return server_positions.get(server) == position

    known_on_primary = {"primary": transaction["primary_position"]}
    assert position_means_something_on(known_on_primary, transaction["primary_position"], "primary")
    assert not position_means_something_on(known_on_primary, transaction["primary_position"], "replica")

    assert transaction["gtid"] == transaction["gtid"]


def binlog_retention_expiry_forces_a_resnapshot():
    """Debezium: binlog_expire_logs_seconds example of 864000 (ten days), and "After the
    connector restarts, if the logs have been pruned, the connector's position in the logs
    might no longer available. The connector then fails... a new snapshot is required."
    Modelled: a consumer down longer than the retention window loses its position; one down
    for less than the window does not."""

    retention_seconds = 864000

    def resume_outcome(downtime_seconds):
        if downtime_seconds >= retention_seconds:
            return "logs pruned; position unavailable; resnapshot required"
        return "position still available; resumes from last offset"

    assert resume_outcome(downtime_seconds=3600) == "position still available; resumes from last offset"
    assert resume_outcome(downtime_seconds=900000) == "logs pruned; position unavailable; resnapshot required"


def ddl_requires_a_schema_history_to_interpret_old_row_events():
    """Debezium: "This database schema history topic is for internal connector use only,"
    recording every DDL statement so old row events (addressed by column position) can be
    interpreted against the schema in force when they were written. Modelled: a row event
    written before a column was added is unreadable without consulting the schema-history
    entry for that binlog position; PostgreSQL's own pgoutput needs no such lookup, since its
    messages carry column definitions inline."""

    schema_history = [
        {"at_position": 100, "columns": ["id", "status"]},
        {"at_position": 500, "columns": ["id", "status", "region"]},
    ]

    def schema_in_force_at(position):
        applicable = [h for h in schema_history if h["at_position"] <= position]
        return applicable[-1]["columns"]

    old_row_event = {"position": 200, "values": [1, "paid"]}

    def interpret_mysql_row_event(event):
        columns = schema_in_force_at(event["position"])
        return dict(zip(columns, event["values"]))

    assert interpret_mysql_row_event(old_row_event) == {"id": 1, "status": "paid"}

    new_row_event = {"position": 600, "values": [2, "shipped", "west"]}
    assert interpret_mysql_row_event(new_row_event) == {"id": 2, "status": "shipped", "region": "west"}

    pgoutput_message = {"relation": {"columns": ["id", "status"]}, "values": [1, "paid"]}
    assert dict(zip(pgoutput_message["relation"]["columns"], pgoutput_message["values"])) == {
        "id": 1,
        "status": "paid",
    }


def oracle_and_sql_server_sit_at_different_points_on_the_poll_vs_log_spectrum():
    """Debezium: "Oracle LogMiner is responsible only for reading redo and archive logs from
    disk and streaming the raw changes" and "To use the XStream API, you must have a license
    for the GoldenGate product" (both capture by reading a log, like topic 9's log-based
    family). Microsoft: "Change data capture utilizes the SQL Server Agent to log insertions,
    updates, and deletions" into a table named by appending _CT to the capture instance name,
    which "the function that is used to query for all changes" then reads back -- a log-fed
    table a consumer polls, a hybrid of topic 9's two families."""

    capture_mechanisms = {
        "oracle_logminer": {"reads": "redo and archive logs", "licence_required": False, "family": "log"},
        "oracle_xstream": {"reads": "redo logs via GoldenGate", "licence_required": True, "family": "log"},
        "sql_server_cdc": {
            "reads": "transaction log, written into a _CT change table",
            "consumed_by": "querying fn_cdc_get_all_changes_<capture instance>",
            "family": "hybrid",
        },
    }

    assert capture_mechanisms["oracle_logminer"]["family"] == "log"
    assert capture_mechanisms["oracle_xstream"]["licence_required"] is True
    assert capture_mechanisms["sql_server_cdc"]["family"] == "hybrid"
    assert "_CT" not in capture_mechanisms["oracle_logminer"]["reads"]
    assert "_CT" in capture_mechanisms["sql_server_cdc"]["reads"]


if __name__ == "__main__":
    binlog_row_image_full_is_required_to_decode_an_update()
    gtid_resolves_across_servers_file_offset_does_not()
    binlog_retention_expiry_forces_a_resnapshot()
    ddl_requires_a_schema_history_to_interpret_old_row_events()
    oracle_and_sql_server_sit_at_different_points_on_the_poll_vs_log_spectrum()
    print("de.mysql-binlog-other-change: all checks passed")
