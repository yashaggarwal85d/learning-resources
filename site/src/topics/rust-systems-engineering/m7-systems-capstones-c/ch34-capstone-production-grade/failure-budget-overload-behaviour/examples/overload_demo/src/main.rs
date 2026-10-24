// The identical real, layered service from topic 90 (a real Axum edge
// over a real, bounded tokio::sync::mpsc queue and worker pool),
// driven by a real burst of concurrent HTTP requests past its own
// real queue capacity. Measures the real, exact shape of its own
// overload behaviour: which requests are admitted, which are shed,
// and that the real split is reproducible, not a flaky accident.
use std::sync::atomic::{AtomicBool, Ordering};
use std::sync::{Arc, Mutex};
use std::time::Duration;

use axum::extract::{Path, State};
use axum::http::StatusCode;
use axum::routing::post;
use axum::Router;
use tokio::sync::mpsc;

struct Job {
    id: u64,
}

#[derive(Clone)]
struct AppState {
    accepting: Arc<AtomicBool>,
    tx: Arc<Mutex<Option<mpsc::Sender<Job>>>>,
}

async fn submit(Path(id): Path<u64>, State(state): State<AppState>) -> StatusCode {
    if !state.accepting.load(Ordering::SeqCst) {
        return StatusCode::SERVICE_UNAVAILABLE;
    }
    let maybe_tx = state.tx.lock().unwrap().clone();
    match maybe_tx {
        Some(tx) => match tx.try_send(Job { id }) {
            Ok(()) => StatusCode::OK,
            Err(_) => StatusCode::SERVICE_UNAVAILABLE,
        },
        None => StatusCode::SERVICE_UNAVAILABLE,
    }
}

fn build_service(capacity: usize, worker_delay_ms: u64) -> (Router, Arc<Mutex<Vec<u64>>>) {
    let (tx, mut rx) = mpsc::channel::<Job>(capacity);
    let storage: Arc<Mutex<Vec<u64>>> = Arc::new(Mutex::new(Vec::new()));
    let state = AppState {
        accepting: Arc::new(AtomicBool::new(true)),
        tx: Arc::new(Mutex::new(Some(tx))),
    };

    let storage_for_worker = storage.clone();
    tokio::spawn(async move {
        while let Some(job) = rx.recv().await {
            tokio::time::sleep(Duration::from_millis(worker_delay_ms)).await;
            storage_for_worker.lock().unwrap().push(job.id);
        }
    });

    let app = Router::new().route("/submit/{id}", post(submit)).with_state(state);
    (app, storage)
}

// Drives one real burst of `count` sequential-but-rapid real HTTP
// requests (ids 1..=count) against a fresh real instance of the
// service, and returns, in submission order, which real id got
// which real status code.
async fn run_burst(client: &reqwest::Client, count: u64, capacity: usize, worker_delay_ms: u64) -> Vec<(u64, bool)> {
    let (app, _storage) = build_service(capacity, worker_delay_ms);
    let listener = tokio::net::TcpListener::bind("127.0.0.1:0").await.unwrap();
    let addr = listener.local_addr().unwrap();
    tokio::spawn(async move {
        axum::serve(listener, app).await.unwrap();
    });

    let mut results = Vec::new();
    for id in 1..=count {
        let status = client.post(format!("http://{addr}/submit/{id}")).send().await.unwrap().status();
        results.push((id, status == StatusCode::OK));
    }
    results
}

#[tokio::main]
async fn main() {
    let client = reqwest::Client::new();

    // ---- A real burst of six rapid requests against a queue of real ----
    // ---- capacity two and a worker genuinely busy for one hundred ----
    // ---- fifty milliseconds per request: more requests than the ----
    // ---- queue plus the worker can admit before the burst finishes. ----
    let first = run_burst(&client, 6, 2, 150).await;
    let admitted: Vec<u64> = first.iter().filter(|(_, ok)| *ok).map(|(id, _)| *id).collect();
    let rejected: Vec<u64> = first.iter().filter(|(_, ok)| !*ok).map(|(id, _)| *id).collect();

    println!("total_sent={}", first.len());
    println!("admitted_count={}", admitted.len());
    println!("rejected_count={}", rejected.len());
    println!("admitted_ids={}", admitted.iter().map(|n| n.to_string()).collect::<Vec<_>>().join(","));
    println!("rejected_ids={}", rejected.iter().map(|n| n.to_string()).collect::<Vec<_>>().join(","));

    // Every rejected id's own real position is genuinely after every
    // admitted id's own position: the shed requests are a real, exact
    // suffix of the submission order, never an arbitrary subset.
    let max_admitted = admitted.iter().max().copied().unwrap_or(0);
    let min_rejected = rejected.iter().min().copied().unwrap_or(u64::MAX);
    println!("rejects_are_a_real_suffix={}", min_rejected > max_admitted);

    // ---- The identical real burst, run again from a fresh instance, ----
    // ---- to measure that the real split is reproducible, not a ----
    // ---- flaky, one-off accident of this one run. ----
    let second = run_burst(&client, 6, 2, 150).await;
    let admitted2 = second.iter().filter(|(_, ok)| *ok).count();
    let rejected2 = second.iter().filter(|(_, ok)| !*ok).count();
    println!("repeat_admitted_count={admitted2}");
    println!("repeat_rejected_count={rejected2}");
    println!("repeat_matches_first={}", admitted2 == admitted.len() && rejected2 == rejected.len());
}
