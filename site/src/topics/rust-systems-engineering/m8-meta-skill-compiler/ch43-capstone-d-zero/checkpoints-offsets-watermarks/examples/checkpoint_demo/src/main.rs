use tokio::sync::mpsc;
use tokio::time::{sleep, Duration};

const N_BATCHES: usize = 20;
const RECORDS_PER_BATCH: usize = 10;
const CRASH_AFTER_FULL_COMMITS: usize = 14;
const COMMIT_DELAY_MS: u64 = 10;

struct SimResult {
    committed_batches: usize,
    checkpoint_batch: usize,
}

async fn run_pipeline(checkpoint_before_commit: bool) -> SimResult {
    let (tx, mut rx) = mpsc::channel::<usize>(N_BATCHES);
    for batch_id in 1..=N_BATCHES {
        tx.send(batch_id).await.unwrap();
    }
    drop(tx);

    let mut committed_batches = 0usize;
    let mut checkpoint_batch = 0usize;

    while let Some(batch_id) = rx.recv().await {
        if committed_batches == CRASH_AFTER_FULL_COMMITS {
            // The real commit for this batch genuinely begins here, but the
            // process crashes before that commit ever returns.
            if checkpoint_before_commit {
                checkpoint_batch = batch_id;
            }
            break;
        }

        if checkpoint_before_commit {
            // Checkpointed at handoff, before the real commit has run at all.
            checkpoint_batch = batch_id;
        }

        sleep(Duration::from_millis(COMMIT_DELAY_MS)).await;
        committed_batches += 1;

        if !checkpoint_before_commit {
            // Checkpointed only once the real commit has actually returned.
            checkpoint_batch = batch_id;
        }
    }

    SimResult {
        committed_batches,
        checkpoint_batch,
    }
}

fn restart_outcome(committed_batches: usize, checkpoint_batch: usize) -> (usize, usize) {
    let reprocessed_batches = committed_batches.saturating_sub(checkpoint_batch);
    let lost_batches = checkpoint_batch.saturating_sub(committed_batches);
    (reprocessed_batches, lost_batches * RECORDS_PER_BATCH)
}

#[tokio::main]
async fn main() {
    let correct = run_pipeline(false).await;
    let wrong = run_pipeline(true).await;

    let (correct_reprocessed, correct_lost_records) =
        restart_outcome(correct.committed_batches, correct.checkpoint_batch);
    let (wrong_reprocessed, wrong_lost_records) =
        restart_outcome(wrong.committed_batches, wrong.checkpoint_batch);

    println!("n_batches={}", N_BATCHES);
    println!("records_per_batch={}", RECORDS_PER_BATCH);
    println!("correct_committed_batches={}", correct.committed_batches);
    println!("correct_checkpoint_batch={}", correct.checkpoint_batch);
    println!("correct_reprocessed_batches={}", correct_reprocessed);
    println!("correct_lost_records={}", correct_lost_records);
    println!("wrong_committed_batches={}", wrong.committed_batches);
    println!("wrong_checkpoint_batch={}", wrong.checkpoint_batch);
    println!("wrong_reprocessed_batches={}", wrong_reprocessed);
    println!("wrong_lost_records={}", wrong_lost_records);
}
