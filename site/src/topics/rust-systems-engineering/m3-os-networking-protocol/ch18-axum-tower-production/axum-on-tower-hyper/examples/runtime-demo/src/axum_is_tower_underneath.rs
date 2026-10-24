use std::sync::atomic::{AtomicUsize, Ordering};
use std::sync::Arc;
use std::time::Duration;

use axum::extract::{Path, State};
use axum::http::{HeaderValue, Request, StatusCode};
use axum::middleware::{self, Next};
use axum::response::Response;
use axum::routing::get;
use axum::Router;
use tower::ServiceBuilder;
use tower_http::timeout::TimeoutLayer;

#[derive(Clone)]
struct AppState {
    hits: Arc<AtomicUsize>,
}

// The 0.8 routing syntax: a real path parameter, extracted by a real
// extractor, not a string split written by hand.
async fn greet(Path(name): Path<String>) -> String {
    format!("Hello, {name}")
}

// A real State extractor, sharing one counter across every real request.
async fn counter(State(state): State<AppState>) -> String {
    let n = state.hits.fetch_add(1, Ordering::SeqCst) + 1;
    n.to_string()
}

// A handler slow enough for a real tower-http Timeout layer to cut off.
async fn slow() -> &'static str {
    tokio::time::sleep(Duration::from_secs(2)).await;
    "done"
}

// A real middleware::from_fn layer: Axum's own stated way to write
// middleware, with no system of its own beyond the Service it wraps.
async fn mark_ran(req: Request<axum::body::Body>, next: Next) -> Response {
    let mut resp = next.run(req).await;
    resp.headers_mut().insert("x-mw-ran", HeaderValue::from_static("true"));
    resp
}

#[tokio::main]
async fn main() {
    let state = AppState { hits: Arc::new(AtomicUsize::new(0)) };

    let app = Router::new()
        .route("/greet/{name}", get(greet))
        .route("/counter", get(counter))
        .route(
            "/slow",
            get(slow).layer(ServiceBuilder::new().layer(TimeoutLayer::with_status_code(
                StatusCode::REQUEST_TIMEOUT,
                Duration::from_millis(100),
            ))),
        )
        .layer(middleware::from_fn(mark_ran))
        .with_state(state);

    // A real TcpListener and a real running Axum server, not a mock.
    let listener = tokio::net::TcpListener::bind("127.0.0.1:0").await.unwrap();
    let addr = listener.local_addr().unwrap();
    tokio::spawn(async move {
        axum::serve(listener, app).await.unwrap();
    });

    let client = reqwest::Client::new();

    // 1. The 0.8 routing syntax genuinely extracts a real path parameter.
    let resp = client.get(format!("http://{addr}/greet/Ada")).send().await.unwrap();
    let body = resp.text().await.unwrap();
    println!("path_param_extracted {}", body == "Hello, Ada");

    // 2. State is genuinely shared across real requests, not re-created per request.
    let r1: usize = client.get(format!("http://{addr}/counter")).send().await.unwrap().text().await.unwrap().parse().unwrap();
    let r2: usize = client.get(format!("http://{addr}/counter")).send().await.unwrap().text().await.unwrap().parse().unwrap();
    let r3: usize = client.get(format!("http://{addr}/counter")).send().await.unwrap().text().await.unwrap().parse().unwrap();
    println!("state_genuinely_shared {}", r1 == 1 && r2 == 2 && r3 == 3);

    // 3. middleware::from_fn genuinely ran against a real response.
    let resp = client.get(format!("http://{addr}/greet/Grace")).send().await.unwrap();
    let ran = resp.headers().get("x-mw-ran").map(|v| v == "true").unwrap_or(false);
    println!("from_fn_middleware_ran {}", ran);

    // 4. A real tower-http layer (Timeout) genuinely cuts off a slow handler.
    let start = std::time::Instant::now();
    let resp = client.get(format!("http://{addr}/slow")).send().await.unwrap();
    let elapsed = start.elapsed();
    println!("tower_http_timeout_fired {}", resp.status().as_u16() == StatusCode::REQUEST_TIMEOUT.as_u16());
    println!("tower_http_timeout_elapsed_ms_is_small {}", elapsed.as_millis() < 1000);
}
