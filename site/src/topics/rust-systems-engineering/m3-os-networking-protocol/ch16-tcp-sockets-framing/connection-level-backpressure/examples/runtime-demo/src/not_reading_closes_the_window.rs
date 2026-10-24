// Opens a real loopback TCP connection where the server accepts the connection and
// then deliberately never reads from it. Measures that the client's own write()
// calls genuinely start blocking once the server's receive window fills and closes
// — a real, observable backpressure signal the kernel enforces on its own, not a
// simulated one. The server deliberately stops reading rather than call any policy
// code; the blocking the client observes is TCP's own flow control, not application logic.
use std::io::Write;
use std::net::{TcpListener, TcpStream};
use std::thread;
use std::time::{Duration, Instant};

const WRITE_CHUNK: usize = 64 * 1024;
const SLOW_WRITE_THRESHOLD: Duration = Duration::from_millis(100);
const DEADLINE: Duration = Duration::from_millis(1500);

fn main() {
    let listener = TcpListener::bind("127.0.0.1:0").expect("bind a real loopback listener");
    let addr = listener.local_addr().expect("local addr");

    let server = thread::spawn(move || {
        let (sock, _) = listener.accept().expect("accept the real connection");
        // Deliberately never read: let the kernel's own receive window fill and close.
        thread::sleep(Duration::from_secs(2));
        drop(sock);
    });

    thread::sleep(Duration::from_millis(50));
    let mut client = TcpStream::connect(addr).expect("connect to the listener");
    let chunk = vec![0u8; WRITE_CHUNK];
    let start = Instant::now();
    let mut total_written: u64 = 0;
    let mut saw_a_slow_write = false;
    loop {
        let write_start = Instant::now();
        match client.write(&chunk) {
            Ok(n) => {
                total_written += n as u64;
                if write_start.elapsed() > SLOW_WRITE_THRESHOLD {
                    saw_a_slow_write = true;
                    break;
                }
            }
            Err(_) => break,
        }
        if start.elapsed() > DEADLINE {
            break;
        }
    }
    server.join().expect("server thread");

    println!("{total_written} {saw_a_slow_write}");
}
