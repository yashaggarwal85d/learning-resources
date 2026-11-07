# Pre-notes — Union-find inside entity resolution

- **Record linkage:** deciding which records across a dataset refer to the same real-world
  entity; a matcher scores candidate pairs of records for how likely they are the same thing.
- **Match score and threshold:** a matcher's confidence that two records are the same entity;
  pairs scoring at or above a chosen threshold are treated as matches.
- **Connected component:** the set of vertices reachable from each other by following edges;
  here, every record that is linked, directly or through a chain of matches, to another.
- **Transitive:** if A matches B and B matches C, union-find puts A and C in the same group
  whether or not A and C were ever compared directly.
- **Representative (root):** the one record each group's `find` resolves to; a group's entity
  id, in practice, is just this record's own id.
- **Entity id:** the label assigned to a group of matched records, standing in for "these are
  the same real-world thing."
