- **Latency budget**: the time a request's design allots to each hop toward a deadline. *Where
  you meet it:* the latency-budget reveal.
- **p99**: the 99th-percentile latency — the value a tail of requests is slower than. *Where you
  meet it:* the latency-budget and chain-p99 reveals.
- **Feature**: a value computed from raw events and used as model input. *Where you meet it:*
  the pipeline-strip and state-size reveals.
- **Online store**: a low-latency key-value store the request path reads features from. *Where
  you meet it:* the pipeline-strip and state-size reveals.
- **Model inference**: running a trained model against input features to produce a score.
  *Where you meet it:* the pipeline-strip reveal.
- **Timeout**: the deadline after which a request gives up waiting and takes a fallback. *Where
  you meet it:* the hook and the fallback reveal.
- **Fallback**: the action taken when a request can't complete normally in time. *Where you meet
  it:* the hook and the fallback reveal.
- **False positive**: here, a legitimate payment wrongly treated as fraud. *Where you meet it:*
  the fallback reveal.
- **Chargeback**: a payment reversed after the fact, often the signal that fraud occurred. *Where
  you meet it:* the score-time-log reveal.
- **Label**: the outcome (fraud or not) attached to a past scored event, used to retrain the
  model. *Where you meet it:* the score-time-log reveal.
