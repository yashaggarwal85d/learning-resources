use std::time::Duration;
use span_demo::Capture;
use tracing::info;
use tracing_subscriber::layer::SubscriberExt;

#[tracing::instrument(name = "task_a")]
async fn keeps_the_span_correct_via_the_macro() {
    tokio::time::sleep(Duration::from_millis(50)).await;
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
        tokio::join!(keeps_the_span_correct_via_the_macro(), task_b());
    });

    let (message, current_span) = capture.0.lock().unwrap()[0].clone();
    println!("event={message:?} current_span={current_span:?}");
}
