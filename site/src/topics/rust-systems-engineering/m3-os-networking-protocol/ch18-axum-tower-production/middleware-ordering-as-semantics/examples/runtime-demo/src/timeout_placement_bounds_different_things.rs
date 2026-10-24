use std::future::Future;
use std::pin::Pin;
use std::task::{Context, Poll};
use std::time::{Duration, Instant};

use tower::timeout::TimeoutLayer;
use tower::{Service, ServiceBuilder, ServiceExt};

// A deliberately slow auth step, standing in for a real authorization
// check that calls out to a slow dependency.
#[derive(Clone)]
struct SlowAuth {
    delay: Duration,
}

impl Service<()> for SlowAuth {
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

#[derive(Clone)]
struct FastHandler;

impl Service<()> for FastHandler {
    type Response = ();
    type Error = std::convert::Infallible;
    type Future = Pin<Box<dyn Future<Output = Result<(), Self::Error>> + Send>>;

    fn poll_ready(&mut self, _cx: &mut Context<'_>) -> Poll<Result<(), Self::Error>> {
        Poll::Ready(Ok(()))
    }

    fn call(&mut self, _req: ()) -> Self::Future {
        Box::pin(async { Ok(()) })
    }
}

#[tokio::main]
async fn main() {
    // A real deadline placed OUTSIDE a slow auth step bounds the auth step
    // too, and genuinely fires before the slow auth step would finish.
    {
        let auth = SlowAuth { delay: Duration::from_millis(200) };
        let mut outer_timeout = ServiceBuilder::new()
            .layer(TimeoutLayer::new(Duration::from_millis(50)))
            .service(auth);
        let start = Instant::now();
        let result = outer_timeout.ready().await.unwrap().call(()).await;
        let elapsed = start.elapsed();
        println!("timeout_outside_slow_auth_fired {}", result.is_err());
        println!("timeout_outside_slow_auth_elapsed_ms_is_small {}", elapsed.as_millis() < 150);
    }

    // The same real deadline placed INSIDE, around only the fast handler,
    // with the slow auth step run ahead of it: the deadline never sees the
    // slow auth step at all, so the slow auth step is genuinely unbounded.
    {
        let mut handler = ServiceBuilder::new()
            .layer(TimeoutLayer::new(Duration::from_millis(50)))
            .service(FastHandler);
        let mut auth = SlowAuth { delay: Duration::from_millis(200) };
        let start = Instant::now();
        let _ = auth.ready().await.unwrap().call(()).await;
        let result = handler.ready().await.unwrap().call(()).await;
        let elapsed = start.elapsed();
        println!("timeout_inside_slow_auth_fired {}", result.is_err());
        println!("timeout_inside_slow_auth_elapsed_ms_is_large {}", elapsed.as_millis() >= 200);
    }
}
