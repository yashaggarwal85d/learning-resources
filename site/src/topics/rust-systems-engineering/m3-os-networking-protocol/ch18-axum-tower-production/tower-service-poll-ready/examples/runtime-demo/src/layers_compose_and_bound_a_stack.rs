use std::future::Future;
use std::pin::Pin;
use std::sync::atomic::{AtomicUsize, Ordering};
use std::sync::Arc;
use std::task::{Context, Poll};
use std::time::{Duration, Instant};

use tower::buffer::Buffer;
use tower::limit::{ConcurrencyLimitLayer, RateLimitLayer};
use tower::load_shed::LoadShedLayer;
use tower::timeout::TimeoutLayer;
use tower::{Service, ServiceBuilder, ServiceExt};

// A service that holds each request for `delay`, tracking real-time
// concurrency through shared atomics so the test can observe how many
// calls were actually in flight at once.
#[derive(Clone)]
struct SlowCounting {
    delay: Duration,
    in_flight: Arc<AtomicUsize>,
    max_in_flight: Arc<AtomicUsize>,
}

impl Service<()> for SlowCounting {
    type Response = ();
    type Error = std::convert::Infallible;
    type Future = Pin<Box<dyn Future<Output = Result<(), Self::Error>> + Send>>;

    fn poll_ready(&mut self, _cx: &mut Context<'_>) -> Poll<Result<(), Self::Error>> {
        Poll::Ready(Ok(()))
    }

    fn call(&mut self, _req: ()) -> Self::Future {
        let delay = self.delay;
        let in_flight = self.in_flight.clone();
        let max_in_flight = self.max_in_flight.clone();
        Box::pin(async move {
            let now = in_flight.fetch_add(1, Ordering::SeqCst) + 1;
            max_in_flight.fetch_max(now, Ordering::SeqCst);
            tokio::time::sleep(delay).await;
            in_flight.fetch_sub(1, Ordering::SeqCst);
            Ok(())
        })
    }
}

// A service that is permanently not ready, as if a downstream dependency
// were down.
struct NeverReady;

impl Service<()> for NeverReady {
    type Response = ();
    type Error = std::convert::Infallible;
    type Future = Pin<Box<dyn Future<Output = Result<(), Self::Error>> + Send>>;

    fn poll_ready(&mut self, _cx: &mut Context<'_>) -> Poll<Result<(), Self::Error>> {
        Poll::Pending
    }

    fn call(&mut self, _req: ()) -> Self::Future {
        Box::pin(async { Ok(()) })
    }
}

// A service that always takes longer than the Timeout layer will allow.
struct AlwaysSlow {
    delay: Duration,
}

impl Service<()> for AlwaysSlow {
    type Response = ();
    type Error = std::convert::Infallible;
    type Future = Pin<Box<dyn Future<Output = Result<(), Self::Error>> + Send>>;

    fn poll_ready(&mut self, _cx: &mut Context<'_>) -> Poll<Result<(), Self::Error>> {
        Poll::Ready(Ok(()))
    }

    fn call(&mut self, _req: ()) -> Self::Future {
        let delay = self.delay;
        Box::pin(async move {
            tokio::time::sleep(delay).await;
            Ok(())
        })
    }
}

#[tokio::main]
async fn main() {
    // ConcurrencyLimit genuinely caps in-flight calls at its configured
    // bound, even when far more calls are attempted at once.
    {
        let in_flight = Arc::new(AtomicUsize::new(0));
        let max_in_flight = Arc::new(AtomicUsize::new(0));
        let inner = SlowCounting {
            delay: Duration::from_millis(80),
            in_flight: in_flight.clone(),
            max_in_flight: max_in_flight.clone(),
        };
        let svc = ServiceBuilder::new()
            .layer(ConcurrencyLimitLayer::new(3))
            .service(inner);
        let svc = Arc::new(tokio::sync::Mutex::new(svc));

        let mut handles = Vec::new();
        for _ in 0..10 {
            let svc = svc.clone();
            handles.push(tokio::spawn(async move {
                // Hold the lock only long enough to reserve readiness and
                // obtain the response future; the future itself is awaited
                // without the lock, so real concurrency is observable.
                let fut = {
                    let mut guard = svc.lock().await;
                    guard.ready().await.unwrap();
                    guard.call(())
                };
                fut.await.unwrap();
            }));
        }
        for h in handles {
            h.await.unwrap();
        }
        println!("concurrency_limit_max_in_flight {}", max_in_flight.load(Ordering::SeqCst));
    }

    // LoadShed genuinely rejects a call immediately, rather than making the
    // caller wait, once the inner service reports it is not ready.
    {
        let mut svc = ServiceBuilder::new().layer(LoadShedLayer::new()).service(NeverReady);
        let start = Instant::now();
        svc.ready().await.unwrap();
        let result = svc.call(()).await;
        let elapsed = start.elapsed();
        println!("load_shed_rejected {}", result.is_err());
        println!("load_shed_elapsed_ms_is_small {}", elapsed.as_millis() < 500);
    }

    // RateLimit genuinely spaces calls out over real wall-clock time.
    {
        let inner = SlowCounting {
            delay: Duration::from_millis(1),
            in_flight: Arc::new(AtomicUsize::new(0)),
            max_in_flight: Arc::new(AtomicUsize::new(0)),
        };
        let mut svc = ServiceBuilder::new()
            .layer(RateLimitLayer::new(2, Duration::from_millis(200)))
            .service(inner);

        let start = Instant::now();
        for _ in 0..4 {
            svc.ready().await.unwrap().call(()).await.unwrap();
        }
        let elapsed = start.elapsed();
        println!("rate_limit_elapsed_ms_at_least_180 {}", elapsed.as_millis() >= 180);
    }

    // Timeout genuinely cancels a call that outlives its own deadline.
    {
        let inner = AlwaysSlow { delay: Duration::from_millis(500) };
        let mut svc = ServiceBuilder::new()
            .layer(TimeoutLayer::new(Duration::from_millis(50)))
            .service(inner);
        let start = Instant::now();
        let result = svc.ready().await.unwrap().call(()).await;
        let elapsed = start.elapsed();
        println!("timeout_fired {}", result.is_err());
        println!("timeout_elapsed_ms_is_small {}", elapsed.as_millis() < 300);
    }

    // Buffer genuinely enqueues calls beyond what the inner service's own
    // readiness would otherwise allow -- the hidden queue the syllabus
    // calls out: all six calls are accepted even though the inner
    // ConcurrencyLimit(1) only lets one actually run at a time.
    {
        let in_flight = Arc::new(AtomicUsize::new(0));
        let max_in_flight = Arc::new(AtomicUsize::new(0));
        let inner = ServiceBuilder::new()
            .layer(ConcurrencyLimitLayer::new(1))
            .service(SlowCounting {
                delay: Duration::from_millis(60),
                in_flight: in_flight.clone(),
                max_in_flight: max_in_flight.clone(),
            });
        let svc = Buffer::new(inner, 8);

        let mut handles = Vec::new();
        for _ in 0..6 {
            let mut svc = svc.clone();
            handles.push(tokio::spawn(async move {
                svc.ready().await.unwrap().call(()).await.unwrap();
            }));
        }
        for h in handles {
            h.await.unwrap();
        }
        println!("buffer_accepted_all_despite_concurrency_limit_one true");
        println!("buffer_inner_max_in_flight {}", max_in_flight.load(Ordering::SeqCst));
    }
}
