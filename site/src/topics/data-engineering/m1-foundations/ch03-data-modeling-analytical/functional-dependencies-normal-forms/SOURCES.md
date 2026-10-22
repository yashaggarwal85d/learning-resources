Fetched: 2026-10-22.

## Wikipedia, "Functional dependency"
URL: https://en.wikipedia.org/wiki/Functional_dependency
> In relational database theory, a functional dependency (FD) is constraint between two attribute sets, whereby values in one set (the determinant set) determine the values of the other set (the dependent set).

> then X is said to functionally determine Y (written X → Y) if each X value is associated with precisely one Y value. R is then said to satisfy the functional dependency X → Y.

> An important notion in this context is a candidate key, defined as a minimal set of attributes that functionally determine all of the attributes in a relation.

> The closure of a set of values is the set of attributes that can be determined using its functional dependencies for a given relationship. One uses Armstrong's axioms to provide a proof - i.e. reflexivity, augmentation, transitivity.

> ensuring that when the two parts are joined back no data is lost, i.e. a functional dependency provides a simple way to construct a lossless join decomposition of R in two smaller relations. This fact is sometimes called Heaths theorem; it is one of the early results in database theory.

## Wikipedia, "Database normalization"
URL: https://en.wikipedia.org/wiki/Database_normalization
> An insertion anomaly. Until the new faculty member, Dr. Newsome, is assigned to teach at least one course, their details cannot be recorded.

> An update anomaly. Employee 519 is shown as having different addresses on different records.

> A deletion anomaly. All information about Dr. Giddens is lost if they temporarily cease to be assigned to any courses.

> Informally, a relational database relation is often described as "normalized" if it meets third normal form.

> Most 3NF relations are free of insertion, updation, and deletion anomalies.

## Wikipedia, "Boyce–Codd normal form"
URL: https://en.wikipedia.org/wiki/Boyce%E2%80%93Codd_normal_form
> A table (or relation schema) R is in Boyce–Codd normal form if and only if for every one of its functional dependencies X → Y, at least one of the following conditions hold:

> X → Y is a trivial functional dependency (Y ⊆ X),

> X is a superkey for table R.

> If a relation schema is in BCNF, then it is automatically also in 3NF because BCNF is a stricter form of 3NF. While all BCNF relations satisfy the conditions for 3NF, not all 3NF relations satisfy the stricter requirements of BCNF, which eliminates all redundancy caused by functional dependencies.

## Wikipedia, "Fourth normal form"
URL: https://en.wikipedia.org/wiki/Fourth_normal_form
> Whereas the second, third, and Boyce–Codd normal forms are concerned with functional dependencies, 4NF is concerned with a more general type of dependency known as a multivalued dependency.

> A functional dependency is a special case of multivalued dependency. In a functional dependency X → Y, every x determines exactly one y, never more than one.

## Measured directly
URL: n/a — measured on a throwaway schema built for this topic on the existing PostgreSQL 16.15 sandbox, dropped
immediately after.

A denormalized table (`fd_demo_denorm`: order_id, customer_id, customer_email, amount — customer_email repeated
once per order) and a normalized two-table version (`fd_demo_customers` keyed by customer_id, `fd_demo_orders`
referencing it) were loaded with the same six orders across two customers, one of whom (customer_id 100) has
five orders.

Updating that customer's email address required `UPDATE 5` rows in the denormalized table but `UPDATE 1` row in
the normalized table. Simulating the realistic mistake of updating only four of the five denormalized rows left
two different email addresses on file for the same customer at once (`SELECT DISTINCT customer_email ... WHERE
customer_id = 100` returned two rows) — the update anomaly itself, reproduced directly, not merely described.
