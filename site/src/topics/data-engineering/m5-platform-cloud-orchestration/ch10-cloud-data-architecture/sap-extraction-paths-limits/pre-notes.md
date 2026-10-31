# Pre-notes: SAP extraction paths and their limits

- **CDS view.** A Core Data Services view: SAP's own semantic layer over raw module tables, written in a SQL-like language with annotations and relationships added.
- **ODP delta queue.** SAP's Operational Data Provisioning change-tracking mechanism for incremental, delta-only extraction.
- **SLT.** SAP Landscape Transformation: trigger-based replication, where database triggers on the SAP source capture changes as they happen.
- **OData.** A REST-based interface SAP exposes for both reading and writing data, used for SuccessFactors and other SAP services.
- **Effective-dated record.** A record whose change takes effect on a future date, already present in the data before it becomes "true" — a different cursor problem from an `updated_at` column.
- **Special-category data.** Sensitive data such as health information, carrying heightened handling obligations under data-protection law.
