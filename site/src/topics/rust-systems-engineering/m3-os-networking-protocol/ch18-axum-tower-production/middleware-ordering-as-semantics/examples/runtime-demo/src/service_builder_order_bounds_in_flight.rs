use std::future::Future;
use std::pin::Pin;
use std::sync::atomic::{AtomicUsize, Ordering};
use std::sync::Arc;
use std::task::{Context, Poll};
use std::time::{Duration, Instant};

use tower::{Service, ServiceBuilder, ServiceExt};

// Reproduces tower::ServiceBuilder's own documented order example
// (buffer(100).concurrency_limit(10) admits up to 110 in flight; the
// reverse order admits only 10) with real code and a real measurement,
// rather than only citing the claim.
#[derive(Clone)]
struct SlowEcho;

impl Service<()> for SlowEcho {
    type Response = ();
    type Error = std::convert::Infallible;
    type Future = Pin<Box<dyn Future<Output = Result<(), Self::Error>> + Send>>;

    fn poll_ready(&mut self, _cx: &mut Context<'_>) -> Poll<Result<(), Self::Error>> {
        Poll::Ready(Ok(()))
    }

    fn call(&mut self, _req: ()) -> Self::Future {
        Box::pin(async move {
            tokio::time::sleep(Duration::from_millis(60)).await;
            Ok(())
        })
    }
}

// Measures how many of a large batch of concurrent callers get admitted
// almost instantly -- the real, caller-visible effect of which layer is
// outermost -- rather than how many calls run concurrently at the
// innermost service, which both orderings still cap at ten.
async fn drive<S>(svc: S) -> usize
where
    S: Service<()> + Clone + Send + 'static,
    S::Future: Send,
    S::Error: std::fmt::Debug,
{
    let fast_admits = Arc::new(AtomicUsize::new(0));
    let mut handles = Vec::new();
    for _ in 0..150 {
        let mut svc = svc.clone();
        let fast_admits = fast_admits.clone();
        handles.push(tokio::spawn(async move {
            let start = Instant::now();
            let ready = svc.ready().await.unwrap();
            if start.elapsed().as_millis() < 20 {
                fast_admits.fetch_add(1, Ordering::SeqCst);
            }
            let _ = ready.call(()).await;
        }));
    }
    for h in handles {
        let _ = h.await;
    }
    fast_admits.load(Ordering::SeqCst)
}

#[tokio::main]
async fn main() {
    // buffer(100).concurrency_limit(10): buffer receives the request
    // first and admits up to its own queue capacity immediately.
    let buffer_first = ServiceBuilder::new()
        .buffer(100)
        .concurrency_limit(10)
        .service(SlowEcho);
    let buffer_first_fast = drive(buffer_first).await;

    // concurrency_limit(10).buffer(100): concurrency_limit receives the
    // request first and admits only ten at a time, regardless of the
    // buffer sitting behind it.
    let concurrency_first = ServiceBuilder::new()
        .concurrency_limit(10)
        .buffer(100)
        .service(SlowEcho);
    let concurrency_first_fast = drive(concurrency_first).await;

    println!("buffer_first_fast_admits {buffer_first_fast}");
    println!("concurrency_first_fast_admits {concurrency_first_fast}");
}
