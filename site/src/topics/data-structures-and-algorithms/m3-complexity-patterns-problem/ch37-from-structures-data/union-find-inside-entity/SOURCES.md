# Sources — Union-find inside entity resolution

## Clustering (Splink documentation)

URL: https://moj-analytical-services.github.io/splink/api_docs/clustering.html
Version: fetched 2026-11-07

> cluster_pairwise_predictions_at_threshold(nodes, edges, db_api, node_id_column_name, edge_id_column_name_left=None, edge_id_column_name_right=None, threshold_match_probability=None, threshold_match_weight=None)

> Clusters the pairwise match predictions into groups of connected records using
> the connected components graph clustering algorithm.

> Records with an estimated match probability at or above threshold_match_probability
> are considered to be a match (i.e. they represent the same entity).

Contents (for the coverage map): entity resolution's clustering step named exactly as
connected components over the pairwise match predictions, with a threshold on match
probability deciding which pairs count as edges.

## graphframes package (GraphFrames Python API documentation)

URL: https://graphframes.io/api/python/graphframes.html
Version: fetched 2026-11-07

> connectedComponents(algorithm: str = 'graphframes', checkpointInterval: int = 2, broadcastThreshold: int = 1000000, useLabelsAsComponents: bool = False, use_local_checkpoints: bool = False, max_iter: int = 2147483646, storage_level: StorageLevel = StorageLevel(True, True, False, True, 1)) → DataFrame[source]

> Computes the connected components of the graph.

> algorithm – connected components algorithm to use (default: "graphframes")
> Supported algorithms are "two_phase", "randomized_contraction",
> "graphframes" (deprecated alias for "two_phase") and "graphx".

> checkpointInterval – checkpoint interval in terms of number of iterations (default: 2)

Contents (for the coverage map): `connectedComponents`'s signature — an iterative algorithm
(not a shared disjoint-set structure) with a `checkpointInterval` and a `broadcastThreshold`,
not a single pass. The chapter plan's provisional default name `'graphframes'` is read here as
a deprecated alias for the current default, `'two_phase'`; the topic states the current names
and defers to this source rather than the provisional plan text, since the API changed between
planning and research.

## Connected Components in MapReduce and Beyond (citation only, paper not read)

URL: https://api.crossref.org/works/10.1145/2670979.2670997
Version: Crossref metadata, fetched 2026-11-07

> "title":["Connected Components in MapReduce and Beyond"]

> "given":"Raimondas","family":"Kiveris"

> "DOI":"10.1145\/2670979.2670997"

Contents (for the coverage map): the citation for the MapReduce connected-components
rounds-versus-communication literature, checked against Crossref for the exact title, first
author and DOI; the paper's own content is named only, not read or quoted, per the chapter
plan.

