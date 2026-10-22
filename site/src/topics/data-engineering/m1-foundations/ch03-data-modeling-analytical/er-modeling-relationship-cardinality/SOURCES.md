Fetched: 2026-10-22.

## Wikipedia, "Entity–relationship model"
URL: https://en.wikipedia.org/wiki/Entity%E2%80%93relationship_model
> Crow's foot diagrams represent entities as boxes, and relationships as lines between the boxes. Different shapes at the ends of these lines represent the relative cardinality of the relationship.

> Three symbols are used to represent cardinality:

> the ring represents "zero"

> the dash represents "one"

> the crow's foot represents "many" or "infinite"

> These symbols are used in pairs to represent the four types of cardinality that an entity may have in a relationship. The inner component of the notation represents the minimum, and the outer component represents the maximum.

> ring and dash → minimum zero, maximum one (optional)

> dash and dash → minimum one, maximum one (mandatory)

> ring and crow's foot → minimum zero, maximum many (optional)

> dash and crow's foot → minimum one, maximum many (mandatory)

## Wikipedia, "Associative entity"
URL: https://en.wikipedia.org/wiki/Associative_entity
> A relational database requires the implementation of a base relation (or base table) to resolve many-to-many relationships.

> An associative (or junction) table maps two or more tables together by referencing the primary keys (PK) of each data table. In effect, it contains a number of foreign keys (FK), each in a many-to-one relationship from the junction table to the individual data tables. The PK of the associative table is typically composed of the FK columns themselves.

## Measured directly
URL: n/a — this topic is a refresher with no runnable measurement; it is a notation and structure refresher, demonstrated with a worked example (one running 1:1, one 1:N and one M:N relationship, traced through to their foreign-key and junction-table consequences) rather than a measured system behaviour.
