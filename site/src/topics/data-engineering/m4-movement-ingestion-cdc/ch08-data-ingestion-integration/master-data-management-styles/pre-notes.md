- **Master data**: the core entities a business runs on (customer, product, plant) that many
  systems need to agree about, as opposed to the transactions those systems record.
- **Golden record**: the one version of an entity a master data style treats as correct, built
  by resolving what several sources disagree about.
- **Registry**: a style where a hub only cross-references and links source records; no master
  copy exists anywhere, and sources stay authoritative.
- **Hub**: the system that holds the master data style's own golden record, if it has one.
- **Steward**: the person who resolves the cases a match-merge pipeline's own rules can't,
  through a queue of pending exceptions.
- **Survivorship**: the rule set that picks which source's value wins for a field when two
  records are merged into one golden record.
- **ERP**: the system of record for a company's own transactions (orders, inventory, finance).
- **CRM**: the system of record for a company's own customer relationships and sales activity.
