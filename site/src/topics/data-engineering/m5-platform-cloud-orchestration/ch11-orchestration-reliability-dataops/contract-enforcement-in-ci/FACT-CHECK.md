# Fact-check

1. **ODCS describes the keys and values expected in a YAML data contract, per the standard.** Sourced directly: `examples.py` asserts ODCS's own documentation states this, verified word for word against the fetched page text.

2. **ODCS's schema section supports both a business representation of the data and a physical implementation.** Sourced directly: `examples.py` asserts ODCS's own documentation states this, verified word for word against the fetched page text.

3. **ODCS's data quality rules are tightly linked to the schema described in the contract's schema section.** Sourced directly: `examples.py` asserts ODCS's own documentation states this, verified word for word against the fetched page text.

4. **ODCS has a dedicated section describing service-level agreements (SLA).** Sourced directly: `examples.py` asserts ODCS's own documentation states this, verified word for word against the fetched page text.

5. **ODCS's team section lists team members and the history of their relation with the data contract.** Sourced directly: `examples.py` asserts ODCS's own documentation states this, verified word for word against the fetched page text.

6. **A data contract defines the agreement between a data producer and consumer.** Sourced directly: `examples.py` asserts PayPal's own open-sourced `data-contract-template` README states this, verified word for word against the fetched page text.

7. **Breaking changes and data migrations happen as a regular part of an application's evolution, without knowledge of how the data has been used downstream, breaking key reports and data-driven products.** Sourced directly: `examples.py` asserts Andrew Jones's own account of the problem (the GoCardless engineer who introduced data contracts there) states this, verified word for word against the fetched page text.

8. **An ODCS-conformant contract for the shop's own fct_orders holds every one of the standard's required top-level sections together: schema, quality, SLAs and ownership.** Run and reproduced directly: `examples.py`'s `validate_contract_structure` confirms none of the required sections are missing from the real contract dictionary built for this topic.

9. **A straight column rename with no migration path is classified breaking with no path and blocked by the producer's own CI gate; the identical rename done through expand first, naming what it deprecates, is classified breaking with a migration path and let through; a purely additive change is classified non-breaking.** Run and reproduced directly: `examples.py`'s `run_premature_rename_blocked`, `run_expand_first_rename_allowed` and `run_purely_additive_change_allowed` each apply the real classifier to a real proposed schema and assert the correct classification and gate verdict.

10. **A real out-of-band write that never goes through CI is still caught by a runtime check against the same contract, which flags both a missing required field and a negative amount; and an approved change to fct_orders is traced through a real lineage graph to exactly three downstream tables, owned by three different teams, all notified automatically.** Run and reproduced directly: `examples.py`'s `run_runtime_catches_out_of_band_write` and `run_approved_change_notifies_every_downstream_owner` each construct the real case and assert the expected result.
