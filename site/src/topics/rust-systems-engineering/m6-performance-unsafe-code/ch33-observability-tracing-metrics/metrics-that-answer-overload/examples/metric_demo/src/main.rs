// One real operation, called with a deliberately uneven real delay
// pattern, recorded through a real counter, a real gauge, and a real
// histogram. At one real checkpoint while some calls are still
// running, only one of the three metric shapes can correctly answer
// a real question: is anything backed up right now?
use std::sync::atomic::{AtomicI64, AtomicU64, Ordering};
use std::sync::{Arc, Mutex};
use std::time::Duration;
use tokio::time::sleep;

struct Metrics {
    completed_counter: AtomicU64,
    in_flight_gauge: AtomicI64,
    completed_latencies_ms: Mutex<Vec<u64>>,
}

impl Metrics {
    fn new() -> Self {
        Metrics {
            completed_counter: AtomicU64::new(0),
            in_flight_gauge: AtomicI64::new(0),
            completed_latencies_ms: Mutex::new(Vec::new()),
        }
    }
}

async fn operation(m: Arc<Metrics>, delay_ms: u64) {
    m.in_flight_gauge.fetch_add(1, Ordering::SeqCst);
    sleep(Duration::from_millis(delay_ms)).await;
    m.in_flight_gauge.fetch_sub(1, Ordering::SeqCst);
    m.completed_counter.fetch_add(1, Ordering::SeqCst);
    m.completed_latencies_ms.lock().unwrap().push(delay_ms);
}

#[tokio::main]
async fn main() {
    let metrics = Arc::new(Metrics::new());

    // A deliberately uneven delay pattern: three calls finish quickly,
    // two calls are deliberately still running at the checkpoint below.
    let delays = [20u64, 20, 20, 100, 100];
    let mut handles = Vec::new();
    for d in delays {
        handles.push(tokio::spawn(operation(metrics.clone(), d)));
    }

    // The real checkpoint: a point in real time after the short calls
    // have finished but while the long calls are still genuinely
    // in-flight.
    sleep(Duration::from_millis(50)).await;
    let checkpoint_counter = metrics.completed_counter.load(Ordering::SeqCst);
    let checkpoint_gauge = metrics.in_flight_gauge.load(Ordering::SeqCst);
    let checkpoint_histogram_len = metrics.completed_latencies_ms.lock().unwrap().len();

    println!("checkpoint_counter={checkpoint_counter}");
    println!("checkpoint_gauge={checkpoint_gauge}");
    println!("checkpoint_histogram_len={checkpoint_histogram_len}");

    for h in handles {
        h.await.unwrap();
    }

    let final_counter = metrics.completed_counter.load(Ordering::SeqCst);
    let final_gauge = metrics.in_flight_gauge.load(Ordering::SeqCst);
    let final_histogram_len = metrics.completed_latencies_ms.lock().unwrap().len();

    println!("final_counter={final_counter}");
    println!("final_gauge={final_gauge}");
    println!("final_histogram_len={final_histogram_len}");
}
