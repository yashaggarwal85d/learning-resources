use std::net::{self, SocketAddr};
use std::time::Duration;

use mio::net::TcpStream;
use mio::{Events, Interest, Poll, Token};

fn main() {
    let addr: SocketAddr = "127.0.0.1:0".parse().unwrap();
    let server = net::TcpListener::bind(addr).unwrap();

    let mut poll = Poll::new().unwrap();
    let mut events = Events::with_capacity(16);

    let mut stream = TcpStream::connect(server.local_addr().unwrap()).unwrap();
    poll.registry()
        .register(&mut stream, Token(0), Interest::WRITABLE)
        .unwrap();

    let mut saw_writable = false;
    for _ in 0..10 {
        poll.poll(&mut events, Some(Duration::from_secs(5))).unwrap();
        for event in &events {
            if event.token() == Token(0) && event.is_writable() {
                saw_writable = true;
            }
        }
        if saw_writable {
            break;
        }
    }

    println!("{}", saw_writable);
    assert!(
        saw_writable,
        "registering interest and polling should eventually deliver a real writable readiness event"
    );
}
