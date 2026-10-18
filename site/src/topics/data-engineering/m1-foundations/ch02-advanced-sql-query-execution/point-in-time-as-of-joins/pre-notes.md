- **Reference (history) table**: a table with a row per change of a value, with the time it took effect. *Where you meet it:* a price list or an address history.
- **Equi-join vs inequality join**: matching on equal keys versus on a comparison such as `<=`. *Where you meet it:* `ON a.id = b.id` versus `ON b.valid_from <= a.event_time`.
- **Feature (in machine learning)**: an input value computed for a training example. *Where you meet it:* "the customer's order count so far".
- **Training / serving**: building a model from history, versus using it on new data as it arrives. *Where you meet it:* offline accuracy versus production accuracy.

**Check yourself:** a price is 10 from day 1 and 12 from day 10. What is the price on day 9? (Answer: 10, the latest change on or before day 9.)
