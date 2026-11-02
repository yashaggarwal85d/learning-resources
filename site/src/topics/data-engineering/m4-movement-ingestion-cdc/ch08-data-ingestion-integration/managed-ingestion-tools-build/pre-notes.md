- **Connector**: the piece of software that moves data from one specific source into one
  specific destination, whether hand-built or provided by a managed tool.
- **Managed service**: a connector platform run by a vendor, priced on usage rather than
  infrastructure. *Where you meet it:* Fivetran, Airbyte and the pricing model this topic
  measures directly.
- **Monthly Active Rows (MAR)**: Fivetran's own pricing unit, billing a key once in a calendar
  month no matter how many times it changes that month.
- **Schema drift**: a source adding, dropping or changing the type of a column without warning.
- **Schema contract**: a declared policy for how a tool reacts to drift. *Where you meet it:*
  dlt's four named modes, measured directly.
- **Singer / state**: Meltano's underlying spec for a connector's output and the position it
  resumes from.
- **Long tail**: the many low-volume, uncommon sources no managed tool covers well, which a
  team is left to build and maintain itself.
