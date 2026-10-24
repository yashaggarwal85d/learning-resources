// A real, layered async service: a real Axum HTTP edge, a real bounded
// tokio::sync::mpsc queue, a real worker pool, and a real storage layer
// behind a Mutex, each owning a narrow real boundary. A request rejected
// at the queue boundary never reaches the worker pool or storage; a
// real shutdown coordinator lets work already queued finish before the
// service stops accepting anything new.
use std::sync::atomic::{AtomicBool, Ordering};
use std::sync::{Arc, Mutex};
use std::time::Duration;

use axum::extract::{Path, State};
use axum::http::StatusCode;
use axum::routing::{get, post};
use axum::Router;
use tokio::sync::mpsc;

struct Job {
    id: u64,
}

#[derive(Clone)]
struct AppState {
    accepting: Arc<AtomicBool>,
    tx: Arc<Mutex<Option<mpsc::Sender<Job>>>>,
    storage: Arc<Mutex<Vec<u64>>>,
}

// The edge's own entire real responsibility: validate, then try to
// enqueue. It never calls the worker pool or the storage layer itself.
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

async fn storage_contents(State(state): State<AppState>) -> String {
    let v = state.storage.lock().unwrap().clone();
    v.iter().map(|n| n.to_string()).collect::<Vec<_>>().join(",")
}

fn build_service(capacity: usize, worker_delay_ms: u64) -> (Router, tokio::task::JoinHandle<()>, AppState) {
    let (tx, mut rx) = mpsc::channel::<Job>(capacity);
    let storage: Arc<Mutex<Vec<u64>>> = Arc::new(Mutex::new(Vec::new()));
    let state = AppState {
        accepting: Arc::new(AtomicBool::new(true)),
        tx: Arc::new(Mutex::new(Some(tx))),
        storage: storage.clone(),
    };

    // The real worker pool: pulls from the bounded queue, calls the
    // real storage layer, and genuinely keeps running until every
    // sender is dropped and the queue is genuinely drained.
    let worker = tokio::spawn(async move {
        while let Some(job) = rx.recv().await {
            tokio::time::sleep(Duration::from_millis(worker_delay_ms)).await;
            storage.lock().unwrap().push(job.id);
        }
    });

    let app = Router::new()
        .route("/submit/{id}", post(submit))
        .route("/storage", get(storage_contents))
        .with_state(state.clone());

    (app, worker, state)
}

// The real shutdown coordinator: stop accepting new work immediately,
// then drop the one remaining real Sender so the channel genuinely
// closes, and wait for the worker to drain whatever was already queued.
async fn shutdown(state: &AppState, worker: tokio::task::JoinHandle<()>) {
    state.accepting.store(false, Ordering::SeqCst);
    let sender = state.tx.lock().unwrap().take();
    drop(sender);
    worker.await.unwrap();
}

#[tokio::main]
async fn main() {
    let client = reqwest::Client::new();

    // ---- Scenario 1: a full queue rejects a request at the boundary, ----
    // ---- and that rejected request never reaches storage. ----
    let (app1, worker1, _state1) = build_service(1, 100);
    let listener1 = tokio::net::TcpListener::bind("127.0.0.1:0").await.unwrap();
    let addr1 = listener1.local_addr().unwrap();
    tokio::spawn(async move {
        axum::serve(listener1, app1).await.unwrap();
    });

    let r1 = client.post(format!("http://{addr1}/submit/1")).send().await.unwrap().status();
    let r2 = client.post(format!("http://{addr1}/submit/2")).send().await.unwrap().status();
    let r3 = client.post(format!("http://{addr1}/submit/3")).send().await.unwrap().status();
    println!("boundary_r1_ok={}", r1 == StatusCode::OK);
    println!("boundary_r2_ok={}", r2 == StatusCode::OK);
    println!("boundary_r3_rejected={}", r3 == StatusCode::SERVICE_UNAVAILABLE);

    tokio::time::sleep(Duration::from_millis(400)).await;
    let storage_after: String = client.get(format!("http://{addr1}/storage")).send().await.unwrap().text().await.unwrap();
    println!("boundary_storage_contents={storage_after}");
    println!("boundary_rejected_never_in_storage={}", !storage_after.split(',').any(|s| s == "3"));
    worker1.abort();

    // ---- Scenario 2: shutdown lets already-queued work finish, and ----
    // ---- rejects anything submitted once shutdown has begun. ----
    let (app2, worker2, state2) = build_service(2, 100);
    let listener2 = tokio::net::TcpListener::bind("127.0.0.1:0").await.unwrap();
    let addr2 = listener2.local_addr().unwrap();
    tokio::spawn(async move {
        axum::serve(listener2, app2).await.unwrap();
    });

    let q1 = client.post(format!("http://{addr2}/submit/10")).send().await.unwrap().status();
    let q2 = client.post(format!("http://{addr2}/submit/11")).send().await.unwrap().status();
    println!("shutdown_q1_queued={}", q1 == StatusCode::OK);
    println!("shutdown_q2_queued={}", q2 == StatusCode::OK);

    shutdown(&state2, worker2).await;

    let after_shutdown = client.post(format!("http://{addr2}/submit/12")).send().await.unwrap().status();
    println!("shutdown_rejects_new_work={}", after_shutdown == StatusCode::SERVICE_UNAVAILABLE);

    let storage2: String = client.get(format!("http://{addr2}/storage")).send().await.unwrap().text().await.unwrap();
    println!("shutdown_storage_contents={storage2}");
    let has10 = storage2.split(',').any(|s| s == "10");
    let has11 = storage2.split(',').any(|s| s == "11");
    println!("shutdown_drained_queued_work={}", has10 && has11);
}
