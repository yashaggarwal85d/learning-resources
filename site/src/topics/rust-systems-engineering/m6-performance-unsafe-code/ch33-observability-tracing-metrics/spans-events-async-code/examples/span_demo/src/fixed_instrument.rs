use std::time::Duration;
use span_demo::Capture;
use tracing::{info, info_span, Instrument};
use tracing_subscriber::layer::SubscriberExt;

async fn keeps_the_span_correct_across_await() {
    let span = info_span!("task_a");
    async {
        tokio::time::sleep(Duration::from_millis(50)).await;
    }
    .instrument(span)
    .await;
}

async fn task_b() {
    tokio::time::sleep(Duration::from_millis(10)).await;
    info!("marker_from_task_b");
}

fn main() {
    let capture = Capture::default();
    let subscriber = tracing_subscriber::registry().with(capture.clone());
    tracing::subscriber::set_global_default(subscriber).unwrap();

    let rt = tokio::runtime::Builder::new_current_thread()
        .enable_all()
        .build()
        .unwrap();
    rt.block_on(async {
        tokio::join!(keeps_the_span_correct_across_await(), task_b());
    });

    let (message, current_span) = capture.0.lock().unwrap()[0].clone();
    println!("event={message:?} current_span={current_span:?}");
}
