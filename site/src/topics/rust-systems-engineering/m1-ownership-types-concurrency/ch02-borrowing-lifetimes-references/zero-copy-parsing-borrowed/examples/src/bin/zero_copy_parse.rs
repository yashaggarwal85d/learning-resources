// A header struct that borrows its fields straight out of the buffer it was parsed from: no copy
// of the bytes is made, every field is a view into the caller's own slice.
struct Header<'a> {
    magic: &'a [u8],
    name: &'a [u8],
}

fn parse<'a>(buf: &'a [u8]) -> Header<'a> {
    Header {
        magic: &buf[0..4],
        name: &buf[4..8],
    }
}

fn main() {
    let buf: [u8; 8] = [b'R', b'U', b'S', b'T', b'C', b'H', b'0', b'2'];
    let header = parse(&buf);
    assert_eq!(header.magic, b"RUST");
    assert_eq!(header.name, b"CH02");
    // The header's fields point straight at buf's own memory: no byte of buf was copied.
    assert_eq!(header.magic.as_ptr(), buf.as_ptr());
    assert_eq!(header.name.as_ptr(), unsafe { buf.as_ptr().add(4) });
    println!("{:?} {:?}", std::str::from_utf8(header.magic).unwrap(), std::str::from_utf8(header.name).unwrap());
}
