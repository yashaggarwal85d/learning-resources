- **Source system**: the system a pipeline reads from or receives events from — a database, a
  vendor API, a partner's webhook. *Where you meet it:* the hook.
- **Schema**: the structure of a record — its fields and their types. *Where you meet it:* the
  schema-ownership reveal.
- **Rate limit**: a cap on how many requests a source will accept per unit time. *Where you meet
  it:* the volume-and-protocol reveal.
- **Quota**: a cap on total usage over a longer window, such as a day. *Where you meet it:* the
  hidden-constraint reveal.
- **Connector**: the piece of software built to pull from or receive pushes from one source.
  *Where you meet it:* the question-cards reveal.
- **Burst**: a short-lived spike in rate well above the average. *Where you meet it:* the
  volume-and-protocol reveal.
- **Seasonality**: a predictable, recurring shape in volume over a day or year. *Where you meet
  it:* the volume-and-protocol reveal.
- **Residency**: a rule on where data is allowed to be stored or processed. *Where you meet it:*
  the hidden-constraint reveal.
