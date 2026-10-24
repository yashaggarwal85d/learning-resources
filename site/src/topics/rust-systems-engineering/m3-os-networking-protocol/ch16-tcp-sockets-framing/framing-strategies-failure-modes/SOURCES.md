# Sources — Framing strategies and failure modes

## `tokio_util::codec` module documentation — the Decoder trait

URL: https://docs.rs/tokio-util/latest/tokio_util/codec/index.html
Fetched: 2026-10-24, cached at `sources/tokio-util-codec.txt`.

> The job of the decoder trait is to specify how sequences of bytes are turned into a sequence of frames, and to determine where the boundaries between frames are.

## `tokio_util::codec::length_delimited::LengthDelimitedCodec`

URL: https://docs.rs/tokio-util/latest/tokio_util/codec/length_delimited/struct.LengthDelimitedCodec.html
Fetched: 2026-10-24, cached at `sources/length-delimited-codec.txt`.

> This is the largest size this codec will accept from the wire. Larger frames will be rejected.

## `bytes::BytesMut::split_to`

URL: https://docs.rs/bytes/latest/bytes/struct.BytesMut.html
Fetched: 2026-10-24, cached at `sources/bytesmut.txt`.

> Splits the buffer into two at the given index. Afterwards self contains elements [at, len), and the returned BytesMut contains elements [0, at). This is an O(1) operation that just increases the reference count and sets a few indices.
