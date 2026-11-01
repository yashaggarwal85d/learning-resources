- **REST**: an API style where resources are addressed by URL and manipulated with standard HTTP
  methods. *Where you meet it:* the mock API this topic pages, rate-limits and writes to.
- **Pagination**: splitting a large result set into pages a client fetches one at a time.
  *Where you meet it:* the whole first half of this topic, compared two ways.
- **Offset**: a page parameter naming a position ("skip this many rows"), not an identity.
  *Where you meet it:* the pagination style this topic shows drifting under concurrent writes.
- **Cursor**: a page parameter naming the last row actually seen, not a position. *Where you
  meet it:* the fix for offset's own drift, measured directly.
- **HTTP 429**: the status code a server returns to say a client is being rate-limited. *Where
  you meet it:* returned by this topic's own mock limiter, by the book.
- **Token bucket**: a rate-limiting model where each request spends a token from a balance that
  refills on a schedule. *Where you meet it:* implemented and measured directly.
- **Jitter**: randomness added to a backoff delay so competing clients don't retry in lockstep.
  *Where you meet it:* measured against fixed backoff under real contention.
- **Idempotency key**: a client-generated identifier attached to a write so a retry can be told
  apart from a genuinely new request. *Where you meet it:* measured directly against a mock
  write endpoint.
- **OAuth access and refresh token**: a short-lived token used for every call, and a longer-lived
  one exchanged for a new access token when it expires. *Where you meet it:* the race this
  topic's own "Prove it" step reproduces.
