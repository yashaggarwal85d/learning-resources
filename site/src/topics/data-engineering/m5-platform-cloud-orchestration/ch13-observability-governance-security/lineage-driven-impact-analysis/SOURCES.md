# Sources — de.lineage-driven-impact-analysis

## Marquez — Get a lineage graph (API docs)

URL: https://marquezproject.ai/docs/api/get-lineage

> The ID of the node. A node can either be a dataset node, a dataset field node or a job node.

> The format of nodeId for dataset is dataset:<namespace_of_dataset>:<name_of_the_dataset>, for dataset field is datasetField:<namespace_of_dataset>:<name_of_the_dataset>:<name_of_field>, and for job is job:<namespace_of_the_job>:<name_of_the_job>.

> origin stringThe ID of the origin node.

> destination stringThe ID of the destination node.

## DataHub — Data Lineage Impact Analysis: How to Run One

URL: https://datahub.com/blog/data-lineage-impact-analysis/

> A data lineage impact analysis reads the lineage graph outward from a chosen asset to find everything connected to it. Read downstream, it answers what breaks if this changes. Read upstream, it answers where a wrong number came from.

> The resolution of that graph determines how precise either answer can be. Table-level lineage tells you which datasets are connected to the one you are changing. Column-level lineage tells you which of them actually read the specific field you are touching, and which ones do not.

## Google SRE Workbook — Incident Response

URL: https://sre.google/workbook/incident-response/

> It’s important to remember that first responders must prioritize mitigation above all else, or time to resolution suffers.

> Assess the impact of the incident.
