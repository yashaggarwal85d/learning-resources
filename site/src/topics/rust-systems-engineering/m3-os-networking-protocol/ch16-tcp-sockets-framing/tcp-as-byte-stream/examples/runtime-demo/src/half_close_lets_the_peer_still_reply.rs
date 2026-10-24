// Opens a real loopback TCP connection, writes a real message, then calls the
// real shutdown(Write) half-close on the client side. Confirms the server's
// own read() calls genuinely observe EOF (the client's half of the stream is
// closed) while the server can still write a real reply back, and the client
// genuinely receives it — a half-close is a different, real operation from an
// abrupt connection reset.
use std::io::{Read, Write};
use std::net::{Shutdown, TcpListener, TcpStream};
use std::thread;

fn main() {
    let listener = TcpListener::bind("127.0.0.1:0").expect("bind a real loopback listener");
    let addr = listener.local_addr().expect("local addr");

    let client = thread::spawn(move || {
        let mut stream = TcpStream::connect(addr).expect("connect to the listener");
        stream.write_all(b"hello").expect("a real write");
        stream.shutdown(Shutdown::Write).expect("a real half-close");
        let mut buf = [0u8; 16];
        let n = stream.read(&mut buf).expect("a real read after half-closing");
        String::from_utf8_lossy(&buf[..n]).to_string()
    });

    let (mut sock, _) = listener.accept().expect("accept the real connection");
    let mut buf = [0u8; 16];
    let mut got = Vec::new();
    let saw_eof;
    loop {
        let n = sock.read(&mut buf).expect("a real read on the server side");
        if n == 0 {
            saw_eof = true;
            break;
        }
        got.extend_from_slice(&buf[..n]);
    }
    sock.write_all(b"world").expect("the server can still reply after the client half-closed");
    let reply = client.join().expect("client thread");

    let server_got = String::from_utf8_lossy(&got).into_owned();
    println!("{saw_eof} {server_got} {reply}");
}
