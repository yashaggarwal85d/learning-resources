// A hand-rolled Future (no async/.await anywhere) and a minimal executor built the way the
// standard library's own Wake trait documentation describes: a runnable task is an Arc<Task>, a
// Waker is built from it via Wake, and waking a task means re-enqueueing it. No hidden thread
// does the future's work for it — the executor is the only thing that ever calls poll.
use std::future::Future;
use std::pin::Pin;
use std::sync::atomic::{AtomicUsize, Ordering};
use std::sync::mpsc::{sync_channel, Receiver, SyncSender};
use std::sync::{Arc, Mutex};
use std::task::{Context, Poll, Wake, Waker};
use std::thread;
use std::time::Duration;

struct Task {
    future: Mutex<Option<Pin<Box<dyn Future<Output = ()> + Send>>>>,
    sender: SyncSender<Arc<Task>>,
}

impl Wake for Task {
    fn wake(self: Arc<Self>) {
        self.sender.send(self.clone()).expect("executor queue closed");
    }
}

struct Executor {
    ready: Receiver<Arc<Task>>,
    sender: SyncSender<Arc<Task>>,
    pending: Arc<AtomicUsize>,
}

impl Executor {
    fn new() -> Self {
        let (sender, ready) = sync_channel(1024);
        Executor { ready, sender, pending: Arc::new(AtomicUsize::new(0)) }
    }

    fn spawn(&self, future: impl Future<Output = ()> + Send + 'static) {
        self.pending.fetch_add(1, Ordering::SeqCst);
        let task = Arc::new(Task { future: Mutex::new(Some(Box::pin(future))), sender: self.sender.clone() });
        self.sender.send(task).expect("executor queue closed");
    }

    // Blocks, polling only tasks a Waker actually re-enqueued, until every spawned future
    // has returned Ready exactly once — never a tight re-poll loop.
    fn run(&self) {
        while self.pending.load(Ordering::SeqCst) > 0 {
            let task = self.ready.recv().expect("executor queue closed");
            let mut slot = task.future.lock().unwrap();
            if let Some(mut fut) = slot.take() {
                let waker = Waker::from(task.clone());
                let mut cx = Context::from_waker(&waker);
                match fut.as_mut().poll(&mut cx) {
                    Poll::Ready(()) => {
                        self.pending.fetch_sub(1, Ordering::SeqCst);
                    }
                    Poll::Pending => {
                        *slot = Some(fut);
                    }
                }
            }
        }
    }
}

// A future representing a value being computed by a conduit thread elsewhere, exactly the
// shape the Future trait's own docs describe (a socket becoming readable, a signal arriving).
struct Delay {
    state: Arc<Mutex<DelayState>>,
}

struct DelayState {
    done: bool,
    waker: Option<Waker>,
}

impl Delay {
    // `result` is set by the conduit thread itself, right before marking the future done —
    // this keeps the whole example free of async/.await sugar; it is a hand-written Future.
    fn new(duration: Duration, result: Arc<AtomicUsize>) -> Self {
        let state = Arc::new(Mutex::new(DelayState { done: false, waker: None }));
        let state2 = state.clone();
        thread::spawn(move || {
            thread::sleep(duration);
            result.store(1, Ordering::SeqCst);
            let mut s = state2.lock().unwrap();
            s.done = true;
            if let Some(w) = s.waker.take() {
                w.wake();
            }
        });
        Delay { state }
    }
}

impl Future for Delay {
    type Output = ();
    fn poll(self: Pin<&mut Self>, cx: &mut Context<'_>) -> Poll<()> {
        let mut state = self.state.lock().unwrap();
        if state.done {
            Poll::Ready(())
        } else {
            state.waker = Some(cx.waker().clone());
            Poll::Pending
        }
    }
}

fn main() {
    let result = Arc::new(AtomicUsize::new(0));
    let executor = Executor::new();
    executor.spawn(Delay::new(Duration::from_millis(20), result.clone()));
    executor.run();
    println!("{}", result.load(Ordering::SeqCst));
}
