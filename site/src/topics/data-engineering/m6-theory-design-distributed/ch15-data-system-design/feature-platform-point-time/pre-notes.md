- **Feature**: a value computed from raw events and used as model input. *Where you meet it:*
  the one-definition and freshness-choice reveals.
- **Feature store**: a platform that computes a feature once and serves it to both training and
  online prediction. *Where you meet it:* the one-definition reveal.
- **Training set**: the historical rows, with feature values attached, a model learns from.
  *Where you meet it:* the point-in-time-join and leakage reveals.
- **Label**: the outcome a training row is trying to predict. *Where you meet it:* the
  leakage-measured reveal.
- **Online store**: a low-latency key-value store the request path reads features from. *Where
  you meet it:* the one-definition and parity reveals.
- **Offline store**: a lake or warehouse table holding a feature's full history. *Where you meet
  it:* the one-definition and backfill reveals.
- **Train/serve skew**: when a feature is computed one way for training and another for serving.
  *Where you meet it:* the one-definition reveal.
- **Point-in-time join**: joining a feature's value as it was known at a past event's own time,
  never later. *Where you meet it:* the point-in-time-join and leakage reveals.
- **Leakage**: when a training row is built with information from after the event it predicts.
  *Where you meet it:* the hook and the leakage-measured reveal.
