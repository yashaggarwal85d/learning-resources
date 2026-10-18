- **CTE (WITH clause)**: a named subquery defined before the main query. *Where you meet it:* `WITH recent AS (SELECT …) SELECT … FROM recent`.
- **Tree and graph**: a tree is nodes joined with no cycles and one root; a graph may have cycles and several routes between nodes. *Where you meet it:* a folder tree versus a road map.
- **Adjacency table**: a table that stores edges as rows of (from, to). *Where you meet it:* `product_components(product_id, component_product_id, quantity)`.
- **Array / path value**: a value that holds an ordered list. *Where you meet it:* PostgreSQL `ARRAY[1,2,3]`, or a comma-separated string standing in for one.

**Check yourself:** if kit A holds 2 microphones and the bundle holds 3 kit As, how many microphones does the bundle need? (Answer: 6, since quantities multiply down the tree.)
