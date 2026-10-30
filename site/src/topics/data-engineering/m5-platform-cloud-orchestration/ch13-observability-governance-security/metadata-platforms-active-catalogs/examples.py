"""Examples for de.metadata-platforms-active-catalogs."""

CRAWL_INTERVAL_HOURS = 7 * 24  # a weekly crawl, like the Hook's "last crawled on Sunday"


def staleness_window_for_crawl(change_hour, crawl_hour, interval_hours=CRAWL_INTERVAL_HOURS):
    """How long a change sits undetected under a scheduled crawl: from the moment it happens
    until the next scheduled crawl actually runs."""
    hours_until_next_crawl = (crawl_hour - change_hour) % interval_hours
    if hours_until_next_crawl == 0:
        hours_until_next_crawl = interval_hours
    return hours_until_next_crawl


def staleness_window_for_push():
    """A push integration emits metadata the instant the change happens -- no schedule to wait
    on."""
    return 0


class MetadataGraph:
    """A minimal stand-in for a catalog's own metadata graph: entities as nodes, relationships
    as named, directed edges."""

    def __init__(self):
        self.entities = {}  # id -> {"kind": ..., "attrs": {...}}
        self.edges = []     # (source_id, relationship, target_id)

    def add_entity(self, entity_id, kind, **attrs):
        self.entities[entity_id] = {"kind": kind, "attrs": attrs}

    def add_relationship(self, source_id, relationship, target_id):
        self.edges.append((source_id, relationship, target_id))

    def relationships_from(self, entity_id):
        return [(rel, target) for (source, rel, target) in self.edges if source == entity_id]

    def search_by_usage(self, kind, min_queries=0):
        """Search ranked by usage: only datasets with at least a usage threshold, ordered by
        query count descending."""
        candidates = [
            (eid, e["attrs"].get("query_count", 0))
            for eid, e in self.entities.items()
            if e["kind"] == kind and e["attrs"].get("query_count", 0) >= min_queries
        ]
        return [eid for eid, _ in sorted(candidates, key=lambda pair: pair[1], reverse=True)]


def build_sample_graph():
    g = MetadataGraph()
    g.add_entity("table.customers", "table", query_count=420, freshness_hours=2)
    g.add_entity("table.customers_old", "table", query_count=3, freshness_hours=4000)
    g.add_entity("table.orders", "table", query_count=180, freshness_hours=1)
    g.add_entity("term.customer", "glossary_term", definition="a person with an active account")
    g.add_entity("person.dana", "person")

    g.add_relationship("table.customers", "owned_by", "person.dana")
    g.add_relationship("table.customers", "tagged_with", "term.customer")
    g.add_relationship("table.customers_old", "tagged_with", "term.customer")
    return g


def technical_vs_business_answers(graph, entity_id):
    """The same entity, asked two different questions: the technical catalog's own question
    (where/who may read) versus the business catalog's own question (what does it mean/who owns
    it)."""
    entity = graph.entities[entity_id]
    owner = next((target for rel, target in graph.relationships_from(entity_id) if rel == "owned_by"), None)
    glossary_terms = [target for rel, target in graph.relationships_from(entity_id) if rel == "tagged_with"]
    return {
        "technical_answer": {"kind": entity["kind"], "freshness_hours": entity["attrs"].get("freshness_hours")},
        "business_answer": {"owner": owner, "glossary_terms": glossary_terms},
    }


def main():
    sunday_crawl = 0
    wednesday_change = 3 * 24  # three days after Sunday's crawl
    next_sunday_crawl = CRAWL_INTERVAL_HOURS

    crawl_staleness = staleness_window_for_crawl(wednesday_change, next_sunday_crawl)
    push_staleness = staleness_window_for_push()
    print(f"Wednesday's change, under a weekly crawl: stale for {crawl_staleness} hours until the next crawl.")
    print(f"The same change, under push: stale for {push_staleness} hours.")
    assert crawl_staleness == CRAWL_INTERVAL_HOURS - 3 * 24
    assert push_staleness == 0

    graph = build_sample_graph()
    ranked = graph.search_by_usage("table")
    print(f"Search ranked by usage: {ranked}")
    assert ranked == ["table.customers", "table.orders", "table.customers_old"]

    stale_but_certified = graph.entities["table.customers_old"]["attrs"]["freshness_hours"]
    print(f"The old table's own freshness signal: {stale_but_certified} hours since success.")
    assert stale_but_certified > CRAWL_INTERVAL_HOURS

    answers = technical_vs_business_answers(graph, "table.customers")
    print(f"Technical catalog answers: {answers['technical_answer']}")
    print(f"Business catalog answers: {answers['business_answer']}")
    assert answers["technical_answer"]["kind"] == "table"
    assert answers["business_answer"]["owner"] == "person.dana"
    assert answers["business_answer"]["glossary_terms"] == ["term.customer"]

    print("de.metadata-platforms-active-catalogs examples: all checks pass")


if __name__ == "__main__":
    main()
