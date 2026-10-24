use axum::{extract::State, routing::post, Router};
use reqwest::Client;
use std::time::Instant;
use tokio::net::TcpListener;
use tokio::sync::{mpsc, oneshot};
use tokio::task::JoinHandle;
use tokio::time::Duration;

struct Job {
    done_tx: Option<oneshot::Sender<()>>,
}

#[derive(Clone)]
struct AppState {
    tx: mpsc::Sender<Job>,
    reply_on_persist: bool,
}

async fn submit(State(state): State<AppState>) -> &'static str {
    if state.reply_on_persist {
        let (done_tx, done_rx) = oneshot::channel();
        if state.tx.send(Job { done_tx: Some(done_tx) }).await.is_err() {
            return "error";
        }
        let _ = done_rx.await;
        "ok"
    } else {
        if state.tx.send(Job { done_tx: None }).await.is_err() {
            return "error";
        }
        "ok"
    }
}

fn build_service(
    capacity: usize,
    worker_delay_ms: u64,
    reply_on_persist: bool,
) -> (Router, JoinHandle<()>) {
    let (tx, mut rx) = mpsc::channel::<Job>(capacity);
    let worker = tokio::spawn(async move {
        while let Some(job) = rx.recv().await {
            tokio::time::sleep(Duration::from_millis(worker_delay_ms)).await;
            if let Some(done_tx) = job.done_tx {
                let _ = done_tx.send(());
            }
        }
    });
    let state = AppState { tx, reply_on_persist };
    let router = Router::new()
        .route("/submit", post(submit))
        .with_state(state);
    (router, worker)
}

async fn measure_latencies(client: &Client, base: &str, count: usize) -> Vec<f64> {
    let mut latencies = Vec::with_capacity(count);
    for _ in 0..count {
        let start = Instant::now();
        let resp = client.post(format!("{base}/submit")).send().await.unwrap();
        let _ = resp.text().await.unwrap();
        latencies.push(start.elapsed().as_secs_f64() * 1000.0);
    }
    latencies
}

fn mean(values: &[f64]) -> f64 {
    values.iter().sum::<f64>() / values.len() as f64
}

#[tokio::main]
async fn main() {
    let client = Client::new();
    let capacity = 10usize;
    let worker_delay_ms = 50u64;
    let request_count = 5usize;

    // Reply-on-queue: the handler responds as soon as the job is enqueued.
    let (queue_router, queue_worker) = build_service(capacity, worker_delay_ms, false);
    let queue_listener = TcpListener::bind("127.0.0.1:0").await.unwrap();
    let queue_addr = queue_listener.local_addr().unwrap();
    let queue_server = tokio::spawn(async move {
        axum::serve(queue_listener, queue_router).await.unwrap();
    });
    let queue_base = format!("http://{queue_addr}");

    let queue_latencies = measure_latencies(&client, &queue_base, request_count).await;
    let queue_mean_ms = mean(&queue_latencies);
    println!("reply_on_queue_mean_ms={queue_mean_ms:.3}");

    queue_server.abort();
    drop(queue_worker);

    // Reply-on-persist: the handler responds only once the worker confirms
    // the storage write for that specific job has completed.
    let (persist_router, persist_worker) = build_service(capacity, worker_delay_ms, true);
    let persist_listener = TcpListener::bind("127.0.0.1:0").await.unwrap();
    let persist_addr = persist_listener.local_addr().unwrap();
    let persist_server = tokio::spawn(async move {
        axum::serve(persist_listener, persist_router).await.unwrap();
    });
    let persist_base = format!("http://{persist_addr}");

    let persist_latencies = measure_latencies(&client, &persist_base, request_count).await;
    let persist_mean_ms = mean(&persist_latencies);
    println!("reply_on_persist_mean_ms={persist_mean_ms:.3}");

    persist_server.abort();
    drop(persist_worker);

    println!("worker_delay_ms={worker_delay_ms}");
}
