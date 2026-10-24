use axum::{extract::State, routing::post, Router};
use reqwest::Client;
use std::sync::atomic::{AtomicU64, Ordering};
use std::sync::Arc;
use tokio::net::TcpListener;
use tokio::sync::mpsc;
use tokio::task::JoinHandle;
use tokio::time::Duration;

struct Counters {
    enqueued: AtomicU64,
    started: AtomicU64,
}

impl Counters {
    fn new() -> Self {
        Counters {
            enqueued: AtomicU64::new(0),
            started: AtomicU64::new(0),
        }
    }

    fn queue_len(&self) -> u64 {
        self.enqueued.load(Ordering::SeqCst) - self.started.load(Ordering::SeqCst)
    }
}

#[derive(Clone)]
struct BoundedState {
    tx: mpsc::Sender<u64>,
    counters: Arc<Counters>,
}

#[derive(Clone)]
struct UnboundedState {
    tx: mpsc::UnboundedSender<u64>,
    counters: Arc<Counters>,
}

async fn submit_bounded(State(state): State<BoundedState>) -> &'static str {
    match state.tx.try_send(1) {
        Ok(()) => {
            state.counters.enqueued.fetch_add(1, Ordering::SeqCst);
            "ok"
        }
        Err(_) => "rejected",
    }
}

async fn submit_unbounded(State(state): State<UnboundedState>) -> &'static str {
    let _ = state.tx.send(1);
    state.counters.enqueued.fetch_add(1, Ordering::SeqCst);
    "ok"
}

fn build_bounded(capacity: usize, worker_delay_ms: u64) -> (Router, JoinHandle<()>, Arc<Counters>) {
    let (tx, mut rx) = mpsc::channel::<u64>(capacity);
    let counters = Arc::new(Counters::new());
    let worker_counters = counters.clone();
    let worker = tokio::spawn(async move {
        while let Some(_job) = rx.recv().await {
            worker_counters.started.fetch_add(1, Ordering::SeqCst);
            tokio::time::sleep(Duration::from_millis(worker_delay_ms)).await;
        }
    });
    let state = BoundedState {
        tx,
        counters: counters.clone(),
    };
    let router = Router::new()
        .route("/submit", post(submit_bounded))
        .with_state(state);
    (router, worker, counters)
}

fn build_unbounded(worker_delay_ms: u64) -> (Router, JoinHandle<()>, Arc<Counters>) {
    let (tx, mut rx) = mpsc::unbounded_channel::<u64>();
    let counters = Arc::new(Counters::new());
    let worker_counters = counters.clone();
    let worker = tokio::spawn(async move {
        while let Some(_job) = rx.recv().await {
            worker_counters.started.fetch_add(1, Ordering::SeqCst);
            tokio::time::sleep(Duration::from_millis(worker_delay_ms)).await;
        }
    });
    let state = UnboundedState {
        tx,
        counters: counters.clone(),
    };
    let router = Router::new()
        .route("/submit", post(submit_unbounded))
        .with_state(state);
    (router, worker, counters)
}

async fn run_burst(client: &Client, base: &str, count: usize) -> (u64, u64) {
    let mut admitted = 0u64;
    let mut rejected = 0u64;
    for _ in 0..count {
        let resp = client
            .post(format!("{base}/submit"))
            .send()
            .await
            .unwrap();
        let body = resp.text().await.unwrap();
        if body == "ok" {
            admitted += 1;
        } else {
            rejected += 1;
        }
    }
    (admitted, rejected)
}

#[tokio::main]
async fn main() {
    let client = Client::new();
    let burst_count = 8usize;
    let capacity = 2usize;
    let worker_delay_ms = 150u64;

    // Bounded instance: explicit backpressure point.
    let (bounded_router, bounded_worker, bounded_counters) =
        build_bounded(capacity, worker_delay_ms);
    let bounded_listener = TcpListener::bind("127.0.0.1:0").await.unwrap();
    let bounded_addr = bounded_listener.local_addr().unwrap();
    let bounded_server = tokio::spawn(async move {
        axum::serve(bounded_listener, bounded_router).await.unwrap();
    });
    let bounded_base = format!("http://{bounded_addr}");

    let (bounded_admitted, bounded_rejected) =
        run_burst(&client, &bounded_base, burst_count).await;
    let bounded_queue_len_at_checkpoint = bounded_counters.queue_len();
    println!("bounded_admitted={bounded_admitted}");
    println!("bounded_rejected={bounded_rejected}");
    println!("bounded_queue_len_at_checkpoint={bounded_queue_len_at_checkpoint}");

    bounded_server.abort();
    drop(bounded_worker);

    // Unbounded instance: implicit backpressure point.
    let (unbounded_router, unbounded_worker, unbounded_counters) =
        build_unbounded(worker_delay_ms);
    let unbounded_listener = TcpListener::bind("127.0.0.1:0").await.unwrap();
    let unbounded_addr = unbounded_listener.local_addr().unwrap();
    let unbounded_server = tokio::spawn(async move {
        axum::serve(unbounded_listener, unbounded_router)
            .await
            .unwrap();
    });
    let unbounded_base = format!("http://{unbounded_addr}");

    let (unbounded_admitted, unbounded_rejected) =
        run_burst(&client, &unbounded_base, burst_count).await;
    let unbounded_queue_len_at_checkpoint = unbounded_counters.queue_len();
    println!("unbounded_admitted={unbounded_admitted}");
    println!("unbounded_rejected={unbounded_rejected}");
    println!("unbounded_queue_len_at_checkpoint={unbounded_queue_len_at_checkpoint}");

    unbounded_server.abort();
    drop(unbounded_worker);
}
