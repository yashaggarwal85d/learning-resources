- **Dual write**: updating a service's own database and publishing an event to another system
  as two separate operations, which leaves a window where one succeeds and the other doesn't.
- **Outbox table**: a table in the same database as the state change, written to in the exact
  same transaction, holding the event a service wants to publish.
- **Aggregate**: the single entity (an order, a shipment) a domain event is about, named by its
  own id so every event about it can be grouped and ordered together.
- **Domain event**: a fact about something that happened to an aggregate — "order placed," not
  "row updated" — written into the outbox alongside the state change it describes.
- **Event router**: the SMT that reads a change event on the outbox table and reshapes it into
  the message a consumer actually receives, routing it by aggregate type.
- **Idempotent consumer**: a consumer that produces the same result no matter how many times it
  processes the same event, verified by the event's own unique id.
