- **Tenant**: one customer or business whose data and workload share a platform with others.
  *Where you meet it:* the hook and the isolation-ladder reveal.
- **Isolation**: how separately each tenant's data and compute are kept from every other
  tenant's. *Where you meet it:* the isolation-ladder reveal.
- **Noisy neighbour**: a tenant whose heavy usage degrades shared resources for everyone else on
  them. *Where you meet it:* the noisy-neighbour reveal.
- **Quota**: a hard limit on one tenant's own resource consumption. *Where you meet it:* the
  noisy-neighbour and fairness reveals.
- **Metering**: measuring each tenant's own actual resource consumption from the engine itself.
  *Where you meet it:* the remainder-policy reveal.
- **Attribution**: assigning a measured cost to the specific tenant that caused it. *Where you
  meet it:* the remainder-policy reveal.
- **Chargeback**: billing a tenant for its own attributed share of a shared platform's cost.
  *Where you meet it:* the remainder-policy reveal.
- **Row-level security**: an engine-enforced policy that restricts which rows a query may see,
  based on the querying tenant. *Where you meet it:* the isolation-ladder reveal.
