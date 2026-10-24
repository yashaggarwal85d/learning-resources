// Opens a real loopback TCP connection where the client connects and then
// deliberately never sends anything (a stalled peer, the slow-loris pattern).
// The server sets a real per-connection read timeout and measures that the
// timeout genuinely fires, closing the connection, rather than waiting forever
// for a peer that may never send anything at all.
use std::io::Read;
use std::net::{TcpListener, TcpStream};
use std::thread;
use std::time::{Duration, Instant};

const READ_TIMEOUT: Duration = Duration::from_millis(300);
const STALL_DURATION: Duration = Duration::from_secs(3);

fn main() {
    let listener = TcpListener::bind("127.0.0.1:0").expect("bind a real loopback listener");
    let addr = listener.local_addr().expect("local addr");

    let _client = thread::spawn(move || {
        let _stalled = TcpStream::connect(addr).expect("connect to the listener");
        // Deliberately never send anything: a stalled, slow-loris-style peer.
        thread::sleep(STALL_DURATION);
    });

    let (mut sock, _) = listener.accept().expect("accept the real connection");
    sock.set_read_timeout(Some(READ_TIMEOUT)).expect("set a real per-connection read timeout");
    let start = Instant::now();
    let mut buf = [0u8; 16];
    let timed_out = sock.read(&mut buf).is_err();
    let elapsed_ms = start.elapsed().as_secs_f64() * 1000.0;

    println!("{timed_out} {elapsed_ms}");
}
