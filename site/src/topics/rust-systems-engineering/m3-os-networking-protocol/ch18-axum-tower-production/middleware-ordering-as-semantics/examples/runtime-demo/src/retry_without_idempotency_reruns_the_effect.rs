use std::future::{self, Future};
use std::pin::Pin;
use std::sync::atomic::{AtomicBool, AtomicUsize, Ordering};
use std::sync::Arc;
use std::task::{Context, Poll};

use tower::retry::{Policy, Retry};
use tower::{Service, ServiceExt};

// A retry policy that retries every error, up to the attempts it is given.
#[derive(Clone)]
struct RetryOnError;

impl Policy<(), (), ()> for RetryOnError {
    type Future = future::Ready<()>;

    fn retry(&mut self, _req: &mut (), result: &mut Result<(), ()>) -> Option<Self::Future> {
        match result {
            Ok(_) => None,
            Err(_) => Some(future::ready(())),
        }
    }

    fn clone_request(&mut self, req: &()) -> Option<()> {
        Some(*req)
    }
}

// A handler whose own side effect is not guarded by any idempotency check:
// it runs once per attempt, every attempt, including retried ones.
#[derive(Clone)]
struct NonIdempotentHandler {
    attempts_left_to_fail: Arc<AtomicUsize>,
    side_effect_count: Arc<AtomicUsize>,
}

impl Service<()> for NonIdempotentHandler {
    type Response = ();
    type Error = ();
    type Future = Pin<Box<dyn Future<Output = Result<(), ()>> + Send>>;

    fn poll_ready(&mut self, _cx: &mut Context<'_>) -> Poll<Result<(), ()>> {
        Poll::Ready(Ok(()))
    }

    fn call(&mut self, _req: ()) -> Self::Future {
        let attempts_left = self.attempts_left_to_fail.clone();
        let side_effect = self.side_effect_count.clone();
        Box::pin(async move {
            side_effect.fetch_add(1, Ordering::SeqCst);
            let left = attempts_left.load(Ordering::SeqCst);
            if left > 0 {
                attempts_left.fetch_sub(1, Ordering::SeqCst);
                Err(())
            } else {
                Ok(())
            }
        })
    }
}

// The same handler, but guarded by a real idempotency key: its own side
// effect runs exactly once, no matter how many attempts the retry policy
// makes before the handler finally reports success.
#[derive(Clone)]
struct IdempotentHandler {
    attempts_left_to_fail: Arc<AtomicUsize>,
    side_effect_count: Arc<AtomicUsize>,
    already_ran: Arc<AtomicBool>,
}

impl Service<()> for IdempotentHandler {
    type Response = ();
    type Error = ();
    type Future = Pin<Box<dyn Future<Output = Result<(), ()>> + Send>>;

    fn poll_ready(&mut self, _cx: &mut Context<'_>) -> Poll<Result<(), ()>> {
        Poll::Ready(Ok(()))
    }

    fn call(&mut self, _req: ()) -> Self::Future {
        let attempts_left = self.attempts_left_to_fail.clone();
        let side_effect = self.side_effect_count.clone();
        let already_ran = self.already_ran.clone();
        Box::pin(async move {
            if !already_ran.swap(true, Ordering::SeqCst) {
                side_effect.fetch_add(1, Ordering::SeqCst);
            }
            let left = attempts_left.load(Ordering::SeqCst);
            if left > 0 {
                attempts_left.fetch_sub(1, Ordering::SeqCst);
                Err(())
            } else {
                Ok(())
            }
        })
    }
}

#[tokio::main]
async fn main() {
    // Without an idempotency key, the side effect runs once per attempt.
    let side_effect_count = Arc::new(AtomicUsize::new(0));
    let inner = NonIdempotentHandler {
        attempts_left_to_fail: Arc::new(AtomicUsize::new(2)),
        side_effect_count: side_effect_count.clone(),
    };
    let mut svc = Retry::new(RetryOnError, inner);
    let result = svc.ready().await.unwrap().call(()).await;
    println!("non_idempotent_eventually_succeeded {}", result.is_ok());
    println!("non_idempotent_side_effect_ran_times {}", side_effect_count.load(Ordering::SeqCst));

    // With a real idempotency key, the same number of retries only ever
    // runs the side effect once.
    let idempotent_side_effect_count = Arc::new(AtomicUsize::new(0));
    let inner = IdempotentHandler {
        attempts_left_to_fail: Arc::new(AtomicUsize::new(2)),
        side_effect_count: idempotent_side_effect_count.clone(),
        already_ran: Arc::new(AtomicBool::new(false)),
    };
    let mut svc = Retry::new(RetryOnError, inner);
    let result = svc.ready().await.unwrap().call(()).await;
    println!("idempotent_eventually_succeeded {}", result.is_ok());
    println!("idempotent_side_effect_ran_times {}", idempotent_side_effect_count.load(Ordering::SeqCst));
}
