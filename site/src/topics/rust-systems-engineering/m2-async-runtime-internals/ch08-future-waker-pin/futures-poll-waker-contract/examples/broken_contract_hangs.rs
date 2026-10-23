// A future that returns Pending without ever arranging for its Waker to be called, run through
// the identical executor from delay_executor.rs. The Future trait's own contract says a pending
// future must be scheduled for a wakeup; this one breaks that contract on purpose, and the
// executor's run() — which only polls a task again once something re-enqueues it — never gets a
// reason to poll it a second time. examples.py proves this by running this binary under a
// generous timeout and asserting it never exits: the hang is real, not merely described.
use std::future::Future;
use std::pin::Pin;
use std::sync::atomic::{AtomicUsize, Ordering};
use std::sync::mpsc::{sync_channel, Receiver, SyncSender};
use std::sync::{Arc, Mutex};
use std::task::{Context, Poll, Wake, Waker};

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

// Breaks the contract on purpose: never stores cx.waker() anywhere, never calls wake().
struct NeverWakes;

impl Future for NeverWakes {
    type Output = ();
    fn poll(self: Pin<&mut Self>, _cx: &mut Context<'_>) -> Poll<()> {
        Poll::Pending
    }
}

fn main() {
    let executor = Executor::new();
    executor.spawn(NeverWakes);
    executor.run();
    println!("unreachable: a contract-breaking future should never let run() return");
}
