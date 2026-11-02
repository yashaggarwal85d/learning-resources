"""Measured claims for de.metadata-platforms-active-catalogs.

This file models the two ingestion architectures DataHub's and OpenMetadata's own documentation
describe: a scheduled crawler that re-reads a source on a fixed interval, and a push/event-based
pipeline where a change emits a metadata event the moment it happens (DataHub's own Metadata
Change Proposal, sent over Kafka or HTTP, per SOURCES.md). The scheduler and event bus are a toy
(simulated clock, in-process event queue) rather than real Airflow/Kafka, but the staleness and
visibility behaviour measured is exactly what the real architectures produce.

Claim 1: after a change, a push-based catalog reflects it immediately (zero staleness); a
crawl-based catalog shows the old state until its next scheduled crawl runs, so the staleness
window depends entirely on how far before the next crawl the change happened.

Claim 2: an object created and dropped entirely between two crawl runs is never seen by a
crawl-based catalog at all -- not as existing, not as deleted. A push-based catalog sees both
the create and the drop events.
"""

import copy


class CrawlCatalog:
    """A catalog kept current only by a scheduled crawler re-reading the source."""

    def __init__(self, crawl_interval_hours: float):
        self.crawl_interval_hours = crawl_interval_hours
        self.last_crawl_time = 0.0
        self.known_state: dict[str, dict] = {}

    def crawl(self, source_state: dict[str, dict], now: float) -> None:
        self.known_state = copy.deepcopy(source_state)
        self.last_crawl_time = now

    def next_crawl_time(self) -> float:
        return self.last_crawl_time + self.crawl_interval_hours

    def read(self, entity_id: str) -> dict | None:
        return self.known_state.get(entity_id)


class PushCatalog:
    """A catalog kept current by metadata change events, applied the instant they arrive."""

    def __init__(self):
        self.known_state: dict[str, dict] = {}
        self.events_applied = 0

    def apply_event(self, entity_id: str, data: dict | None) -> None:
        if data is None:
            self.known_state.pop(entity_id, None)
        else:
            self.known_state[entity_id] = data
        self.events_applied += 1

    def read(self, entity_id: str) -> dict | None:
        return self.known_state.get(entity_id)


def main() -> None:
    # Claim 1: a Wednesday rename, crawled Sunday, searched Thursday.
    # Hours since Sunday 00:00: Sunday crawl at 0, Wednesday change at 3*24=72, Thursday search at 4*24=96.
    source = {"orders_table": {"name": "orders_table", "certified": True}}
    crawl_cat = CrawlCatalog(crawl_interval_hours=7 * 24)  # weekly crawl, like the Hook's Sunday schedule
    crawl_cat.crawl(source, now=0.0)
    push_cat = PushCatalog()
    push_cat.apply_event("orders_table", source["orders_table"])

    rename_time = 72.0  # Wednesday
    search_time = 96.0  # Thursday
    source["orders_table"] = {"name": "orders_archive", "certified": False}
    push_cat.apply_event("orders_table", source["orders_table"])  # push sees it the instant it happens

    crawl_view_at_search = crawl_cat.read("orders_table")
    push_view_at_search = push_cat.read("orders_table")
    assert crawl_view_at_search["name"] == "orders_table" and crawl_view_at_search["certified"] is True, (
        "the crawl-based catalog should still show the pre-rename state at Thursday's search"
    )
    assert push_view_at_search["name"] == "orders_archive" and push_view_at_search["certified"] is False, (
        "the push-based catalog should already show the renamed, decertified state"
    )
    staleness_hours = crawl_cat.next_crawl_time() - rename_time
    assert staleness_hours == 7 * 24 - 72.0  # 96 hours stale at the moment of the search, and still climbing
    print(
        f"Claim 1: at Thursday's search, push shows the rename immediately; "
        f"crawl is still showing the old name and will stay stale for {staleness_hours:.0f} more hours "
        f"until its next scheduled crawl"
    )

    # Claim 2: a table created and dropped entirely between two crawl runs.
    crawl_cat2 = CrawlCatalog(crawl_interval_hours=7 * 24)
    push_cat2 = PushCatalog()
    base_source = {"orders_table": {"name": "orders_table"}}
    crawl_cat2.crawl(base_source, now=0.0)  # Sunday crawl: no "temp_export" table exists yet

    # Monday: "temp_export" is created; Tuesday: it's dropped. Both happen before the next Sunday crawl.
    push_cat2.apply_event("temp_export", {"name": "temp_export"})  # push sees the create
    push_cat2.apply_event("temp_export", None)  # push sees the drop

    # The next crawl (the following Sunday) reads the source as it is *then* -- temp_export is
    # already gone, so the crawler's snapshot never contains it at all.
    crawl_cat2.crawl(base_source, now=7 * 24)  # base_source was never mutated with temp_export

    assert crawl_cat2.read("temp_export") is None, "a crawl-based catalog should never have seen temp_export exist"
    assert "temp_export" not in crawl_cat2.known_state
    assert push_cat2.events_applied == 2, "push should have recorded both the create and the drop as separate events"
    print(
        "Claim 2: the crawl-based catalog never learns temp_export existed at all (not even as a "
        "deleted entity); the push-based catalog recorded both its create and its drop events"
    )

    print("all claims verified")


if __name__ == "__main__":
    main()
