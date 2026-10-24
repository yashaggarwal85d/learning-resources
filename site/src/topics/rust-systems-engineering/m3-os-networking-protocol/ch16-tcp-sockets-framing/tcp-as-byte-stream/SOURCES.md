# Sources — TCP as a byte stream

## RFC 9293: Transmission Control Protocol (TCP)

URL: https://www.rfc-editor.org/rfc/rfc9293.txt
Fetched: 2026-10-24, cached at `sources/rfc9293.txt`.

> Applications may perform writes at the granularity of messages in the upper-layer protocol, but TCP guarantees no correlation between the boundaries of TCP segments sent and received and the boundaries of the read or write buffers of user application data.

> TIME-WAIT - represents waiting for enough time to pass to be sure the remote TCP peer received the acknowledgment of its connection termination request and to avoid new connections being impacted by delayed segments from previous connections.

## Linux man-pages: `tcp(7)`

URL: https://man7.org/linux/man-pages/man7/tcp.7.html
Fetched: 2026-10-24, cached at `sources/tcp-7.txt`.

> TCP_NODELAY
> If set, disable the Nagle algorithm. This means that segments are always sent as soon as possible, even if there is only a small amount of data. When not set, data is buffered until there is a sufficient amount to send out, thereby avoiding the frequent sending of small packets, which results in poor utilization of the network.

> In quickack mode, acks are sent immediately, rather than delayed if needed in accordance to normal TCP operation.

## Linux man-pages: `socket(7)`

URL: https://man7.org/linux/man-pages/man7/socket.7.html
Fetched: 2026-10-24, cached at `sources/socket-7.txt`.

> When enabled, a close(2) or shutdown(2) will not return until all queued messages for the socket have been successfully sent or the linger timeout has been reached. Otherwise, the call returns immediately and the closing is done in the background.

## Linux man-pages: `shutdown(2)`

URL: https://man7.org/linux/man-pages/man2/shutdown.2.html
Fetched: 2026-10-24, cached at `sources/shutdown-2.txt`.

> If how is SHUT_WR, further transmissions will be disallowed.
