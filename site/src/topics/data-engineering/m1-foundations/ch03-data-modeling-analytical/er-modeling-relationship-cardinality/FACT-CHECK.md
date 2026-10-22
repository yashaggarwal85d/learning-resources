# Fact-check — ER modeling and relationship cardinality

No runnable system backs this topic: it is a notation and structure refresher, not a measured system behaviour.
Every claim traces to Wikipedia's "Entity–relationship model" or "Associative entity" articles (both fetched
2026-10-22), or is a worked example traced by hand from those sourced definitions.

| # | Claim | Status | Source |
|---|---|---|---|
| 1 | Crow's foot diagrams represent entities as boxes and relationships as lines, with shapes at the line ends showing relative cardinality. | Confirmed, quoted directly. | Wikipedia, "Entity–relationship model" |
| 2 | Three symbols represent cardinality: the ring for zero, the dash for one, the crow's foot for many. | Confirmed, quoted directly. | Wikipedia, "Entity–relationship model" |
| 3 | The symbols pair up: the inner component is the minimum, the outer component is the maximum, giving four combinations (optional-to-one, mandatory-to-one, optional-to-many, mandatory-to-many). | Confirmed, quoted directly. | Wikipedia, "Entity–relationship model" |
| 4 | A relational database requires a base table to resolve many-to-many relationships. | Confirmed, quoted directly. | Wikipedia, "Associative entity" |
| 5 | A junction table maps two or more tables by holding a foreign key to each, with its own primary key typically composed of those foreign-key columns together. | Confirmed, quoted directly. | Wikipedia, "Associative entity" |
| 6 | In a 1:N relationship, the foreign key lives on the "many" side (the running example: the order table holds the customer id, not the reverse). | Not directly quoted — a standard, uncontested consequence of claim 5's mechanism (a column holds one value, not a variable-length list), stated as reasoning rather than sourced fact. | — |
| 7 | The worked examples (customer/loyalty-card as 1:1, customer/order as 1:N, order/product as M:N) are this topic's own illustrations on the chapter's shop domain, not sourced claims about any real system. | Not a factual claim — worked examples built from claims 1-5. | — |

Red-team on the predict step (step 4): the plausible wrong answer is that the foreign key belongs on the "one"
side (the customer table), since that side is named first in "one customer has many orders." The reveal rules
this out mechanically: a single column can only hold one value, so the side with potentially many related rows
(the order) is the only side that can name a single customer per row; the customer side would need a
variable-length list of order ids, which an ordinary column cannot hold.
