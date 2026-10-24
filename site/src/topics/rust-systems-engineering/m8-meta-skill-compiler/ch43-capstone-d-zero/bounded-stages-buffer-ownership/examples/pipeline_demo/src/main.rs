use std::sync::atomic::{AtomicUsize, Ordering};
use std::sync::Arc;
use std::time::Duration;
use tokio::sync::mpsc;
use tokio::time::sleep;

const RECORD_SIZE: usize = 100;
const RECORDS_PER_BATCH: usize = 10;
const BATCH_SIZE: usize = RECORD_SIZE * RECORDS_PER_BATCH;
const N_BATCHES: usize = 50;
const CAPACITY: usize = 4;
const SINK_DELAY_MS: u64 = 20;

struct Batch {
    data: Vec<u8>,
}

fn make_batch() -> Batch {
    Batch {
        data: vec![0u8; BATCH_SIZE],
    }
}

fn bump_peak(bytes_in_flight: &AtomicUsize, peak: &AtomicUsize) {
    let current = bytes_in_flight.load(Ordering::SeqCst);
    peak.fetch_max(current, Ordering::SeqCst);
}

async fn run_bounded_pipeline() -> usize {
    let bytes_in_flight = Arc::new(AtomicUsize::new(0));
    let peak_bytes_in_flight = Arc::new(AtomicUsize::new(0));

    let (record_tx, mut record_rx) = mpsc::channel::<()>(RECORDS_PER_BATCH * 4);
    let (batch_tx, mut batch_rx) = mpsc::channel::<Batch>(CAPACITY);

    let source = tokio::spawn(async move {
        for _ in 0..(N_BATCHES * RECORDS_PER_BATCH) {
            record_tx.send(()).await.ok();
        }
    });

    let bif_builder = bytes_in_flight.clone();
    let peak_builder = peak_bytes_in_flight.clone();
    let builder = tokio::spawn(async move {
        let mut count = 0usize;
        while record_rx.recv().await.is_some() {
            count += 1;
            if count == RECORDS_PER_BATCH {
                count = 0;
                let batch = make_batch();
                bif_builder.fetch_add(BATCH_SIZE, Ordering::SeqCst);
                bump_peak(&bif_builder, &peak_builder);
                if batch_tx.send(batch).await.is_err() {
                    break;
                }
            }
        }
    });

    let bif_sink = bytes_in_flight.clone();
    let sink = tokio::spawn(async move {
        let mut received = 0usize;
        while let Some(batch) = batch_rx.recv().await {
            sleep(Duration::from_millis(SINK_DELAY_MS)).await;
            drop(batch);
            bif_sink.fetch_sub(BATCH_SIZE, Ordering::SeqCst);
            received += 1;
            if received == N_BATCHES {
                break;
            }
        }
    });

    let _ = source.await;
    let _ = builder.await;
    let _ = sink.await;

    peak_bytes_in_flight.load(Ordering::SeqCst)
}

async fn run_unbounded_pipeline() -> usize {
    let bytes_in_flight = Arc::new(AtomicUsize::new(0));
    let peak_bytes_in_flight = Arc::new(AtomicUsize::new(0));

    let (record_tx, mut record_rx) = mpsc::unbounded_channel::<()>();
    let (batch_tx, mut batch_rx) = mpsc::unbounded_channel::<Batch>();

    let source = tokio::spawn(async move {
        for _ in 0..(N_BATCHES * RECORDS_PER_BATCH) {
            record_tx.send(()).ok();
        }
    });

    let bif_builder = bytes_in_flight.clone();
    let peak_builder = peak_bytes_in_flight.clone();
    let builder = tokio::spawn(async move {
        let mut count = 0usize;
        while record_rx.recv().await.is_some() {
            count += 1;
            if count == RECORDS_PER_BATCH {
                count = 0;
                let batch = make_batch();
                bif_builder.fetch_add(BATCH_SIZE, Ordering::SeqCst);
                bump_peak(&bif_builder, &peak_builder);
                let cloned = Batch { data: batch.data.clone() };
                bif_builder.fetch_add(BATCH_SIZE, Ordering::SeqCst);
                bump_peak(&bif_builder, &peak_builder);
                drop(batch);
                bif_builder.fetch_sub(BATCH_SIZE, Ordering::SeqCst);
                if batch_tx.send(cloned).is_err() {
                    break;
                }
            }
        }
    });

    let bif_sink = bytes_in_flight.clone();
    let sink = tokio::spawn(async move {
        let mut received = 0usize;
        while let Some(batch) = batch_rx.recv().await {
            sleep(Duration::from_millis(SINK_DELAY_MS)).await;
            drop(batch);
            bif_sink.fetch_sub(BATCH_SIZE, Ordering::SeqCst);
            received += 1;
            if received == N_BATCHES {
                break;
            }
        }
    });

    let _ = source.await;
    let _ = builder.await;
    let _ = sink.await;

    peak_bytes_in_flight.load(Ordering::SeqCst)
}

#[tokio::main]
async fn main() {
    let bounded_peak_bytes = run_bounded_pipeline().await;
    let unbounded_peak_bytes = run_unbounded_pipeline().await;

    println!("batch_size_bytes={}", BATCH_SIZE);
    println!("capacity_batches={}", CAPACITY);
    println!("n_batches={}", N_BATCHES);
    println!("bounded_peak_bytes={}", bounded_peak_bytes);
    println!("unbounded_peak_bytes={}", unbounded_peak_bytes);
}
