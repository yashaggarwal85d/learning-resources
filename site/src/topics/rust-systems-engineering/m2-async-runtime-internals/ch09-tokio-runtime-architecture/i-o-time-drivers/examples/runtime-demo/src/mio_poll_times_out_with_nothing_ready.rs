use std::net::{self, SocketAddr};
use std::time::{Duration, Instant};

use mio::net::TcpStream;
use mio::{Events, Interest, Poll, Token};

fn main() {
    let addr: SocketAddr = "127.0.0.1:0".parse().unwrap();
    let server = net::TcpListener::bind(addr).unwrap();

    let mut poll = Poll::new().unwrap();
    let mut events = Events::with_capacity(16);

    // A real socket, registered only for READABLE. Nothing is ever written to it,
    // so no readiness event can ever arrive.
    let mut stream = TcpStream::connect(server.local_addr().unwrap()).unwrap();
    poll.registry()
        .register(&mut stream, Token(0), Interest::READABLE)
        .unwrap();

    let started = Instant::now();
    poll.poll(&mut events, Some(Duration::from_millis(300))).unwrap();
    let waited = started.elapsed();

    println!("{} {}", events.is_empty(), waited.as_millis());
    assert!(
        events.is_empty(),
        "nothing was ever written to the socket, so no readable event should have arrived"
    );
    assert!(
        waited >= Duration::from_millis(250),
        "with no readiness event, poll should park for close to the full timeout: waited {waited:?}"
    );
}
