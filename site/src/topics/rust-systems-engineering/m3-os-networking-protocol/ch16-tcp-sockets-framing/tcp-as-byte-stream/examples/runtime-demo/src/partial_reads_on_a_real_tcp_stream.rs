// Writes one real 4 MiB payload to a real loopback TCP connection in a single
// write_all() call, then reads it back on the other end with a small 64 KiB
// buffer, counting exactly how many real read() calls it genuinely takes.
// Demonstrates that TCP delivers an undifferentiated byte stream: one write
// call does not correspond to one read call on the other side.
use std::io::{Read, Write};
use std::net::TcpListener;
use std::thread;

const PAYLOAD_BYTES: usize = 4 * 1024 * 1024;
const READ_CHUNK: usize = 64 * 1024;

fn main() {
    let listener = TcpListener::bind("127.0.0.1:0").expect("bind a real loopback listener");
    let addr = listener.local_addr().expect("local addr");
    let payload = vec![7u8; PAYLOAD_BYTES];
    let payload_for_writer = payload.clone();

    let writer = thread::spawn(move || {
        let mut stream = std::net::TcpStream::connect(addr).expect("connect to the listener");
        stream.write_all(&payload_for_writer).expect("one real write_all call");
    });

    let (mut sock, _) = listener.accept().expect("accept the real connection");
    let mut total = 0usize;
    let mut reads = 0usize;
    let mut buf = vec![0u8; READ_CHUNK];
    while total < payload.len() {
        let n = sock.read(&mut buf).expect("a real read() call");
        if n == 0 {
            break;
        }
        total += n;
        reads += 1;
    }
    writer.join().expect("writer thread");

    println!("{total} {reads}");
}
