// A minimal, real length-prefixed frame decoder over a real bytes::BytesMut buffer,
// with an explicit cap on the claimed frame length. Demonstrates two real outcomes:
// a frame under the cap decodes and round-trips correctly, extracted without copying
// (BytesMut::split_to's own documented O(1) behavior, confirmed here by comparing raw
// pointers rather than trusting the API's documentation alone); and a frame whose
// length prefix claims a size over the cap is rejected before any buffer the size of
// that claim is ever allocated — the real denial-of-service vector an uncapped length
// prefix creates, and the real fix for it.
use bytes::BytesMut;

const MAX_FRAME: usize = 1024;

fn try_decode(buf: &mut BytesMut) -> Result<Option<BytesMut>, String> {
    if buf.len() < 4 {
        return Ok(None);
    }
    let len = u32::from_be_bytes([buf[0], buf[1], buf[2], buf[3]]) as usize;
    if len > MAX_FRAME {
        return Err(format!("frame of length {len} exceeds the cap of {MAX_FRAME}"));
    }
    if buf.len() < 4 + len {
        return Ok(None);
    }
    let _ = buf.split_to(4);
    let frame = buf.split_to(len);
    Ok(Some(frame))
}

fn main() {
    // A frame under the cap: decodes correctly, and the extraction is genuinely
    // zero-copy (the returned frame's own data pointer lands exactly where the
    // payload started in the original buffer, not at a freshly allocated address).
    let mut buf = BytesMut::new();
    let payload = b"hello world";
    buf.extend_from_slice(&(payload.len() as u32).to_be_bytes());
    buf.extend_from_slice(payload);
    let payload_start = buf.as_ptr().wrapping_add(4);
    let (under_cap_ok, zero_copy) = match try_decode(&mut buf) {
        Ok(Some(frame)) => (frame[..] == payload[..], frame.as_ptr() == payload_start),
        _ => (false, false),
    };

    // A frame claiming a length far over the cap: rejected before this decoder ever
    // allocates a buffer anywhere near that claimed size. The claimed length is 1 GiB;
    // the real buffer behind it is never allocated at all.
    let mut attack_buf = BytesMut::new();
    let claimed_len: u32 = 1_000_000_000;
    attack_buf.extend_from_slice(&claimed_len.to_be_bytes());
    let rejected = try_decode(&mut attack_buf).is_err();

    println!("{under_cap_ok} {zero_copy} {rejected}");
}
