// A wire format's bytes carry no information about which platform will read them, so they must
// pick one explicit byte order. Reading the same two wire bytes as big-endian (as the wire format
// specifies) versus the current platform's native order gives two very different numbers.
fn main() {
    let wire_bytes: [u8; 2] = [0x27, 0x10];
    let correct = u16::from_be_bytes(wire_bytes);
    let wrong_if_native = u16::from_ne_bytes(wire_bytes);
    println!("{correct} {wrong_if_native}");
}
