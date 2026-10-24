# Sources — Connection-level backpressure

## RFC 9293: Transmission Control Protocol (TCP)

URL: https://www.rfc-editor.org/rfc/rfc9293.txt
Fetched: 2026-10-24, cached at `sources/rfc9293.txt`.

> A TCP implementation MAY keep its offered receive window closed indefinitely (MAY-8). As long as the receiving TCP peer continues to send acknowledgments in response to the probe segments, the sending TCP peer MUST allow the connection to stay open (MUST-37).

## Linux man-pages: `tcp(7)`

URL: https://man7.org/linux/man-pages/man7/tcp.7.html
Fetched: 2026-10-24, cached at `sources/tcp-7.txt`.

> The socket receive buffer space is shared between the application and kernel. TCP maintains part of the buffer as the TCP window, this is the size of the receive window advertised to the other end.

## `tokio::time::timeout`

URL: https://docs.rs/tokio/latest/tokio/time/fn.timeout.html
Fetched: 2026-10-24, cached at `sources/tokio-timeout.txt`.

> Requires a Future to complete before the specified duration has elapsed. If the future completes before the duration has elapsed, then the completed value is returned. Otherwise, an error is returned and the future is canceled.
