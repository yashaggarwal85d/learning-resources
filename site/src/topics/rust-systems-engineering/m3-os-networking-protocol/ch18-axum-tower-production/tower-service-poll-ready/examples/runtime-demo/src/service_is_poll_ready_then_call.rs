use std::future::Future;
use std::pin::Pin;
use std::task::{Context, Poll};
use std::time::Instant;

use tower::Service;

// A real tower::Service whose poll_ready reports Pending for a fixed number
// of polls before reporting Ready. Proves poll_ready and call are genuinely
// two separate steps: a caller must wait for Ready before it may call.
struct FlakyReady {
    not_ready_polls_left: usize,
}

impl Service<()> for FlakyReady {
    type Response = ();
    type Error = std::convert::Infallible;
    type Future = Pin<Box<dyn Future<Output = Result<(), Self::Error>> + Send>>;

    fn poll_ready(&mut self, cx: &mut Context<'_>) -> Poll<Result<(), Self::Error>> {
        if self.not_ready_polls_left > 0 {
            self.not_ready_polls_left -= 1;
            cx.waker().wake_by_ref();
            Poll::Pending
        } else {
            Poll::Ready(Ok(()))
        }
    }

    fn call(&mut self, _req: ()) -> Self::Future {
        Box::pin(async { Ok(()) })
    }
}

#[tokio::main]
async fn main() {
    let mut svc = FlakyReady { not_ready_polls_left: 3 };
    let start = Instant::now();
    let mut poll_count = 0usize;
    loop {
        let ready = std::future::poll_fn(|cx| Poll::Ready(svc.poll_ready(cx))).await;
        poll_count += 1;
        if ready.is_ready() {
            break;
        }
        tokio::task::yield_now().await;
    }
    svc.call(()).await.unwrap();

    println!("poll_ready_polls_before_ready {}", poll_count);
    println!("poll_ready_waited_for_real_pending {}", poll_count > 1);
    println!("poll_ready_elapsed_ms_is_small {}", start.elapsed().as_millis() < 1000);
}
