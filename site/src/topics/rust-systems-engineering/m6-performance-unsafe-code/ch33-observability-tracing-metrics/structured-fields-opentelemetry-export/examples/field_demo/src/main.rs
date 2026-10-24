mod tracecontext;

use std::sync::{Arc, Mutex};
use tracing::field::{Field, Visit};
use tracing::{info, Event, Subscriber};
use tracing_subscriber::layer::{Context, Layer, SubscriberExt};
use tracing_subscriber::registry::LookupSpan;

/// Captures every event's own structured `attempt` field (a real, typed
/// u64, when present) alongside its own rendered, formatted message.
#[derive(Default, Clone)]
struct Capture(Arc<Mutex<Vec<(String, Option<u64>)>>>);

struct FieldVisitor<'a>(&'a mut String, &'a mut Option<u64>);
impl Visit for FieldVisitor<'_> {
    fn record_u64(&mut self, field: &Field, value: u64) {
        if field.name() == "attempt" {
            *self.1 = Some(value);
        }
    }
    fn record_debug(&mut self, field: &Field, value: &dyn std::fmt::Debug) {
        if field.name() == "message" {
            *self.0 = format!("{value:?}").trim_matches('"').to_string();
        }
    }
}

impl<S> Layer<S> for Capture
where
    S: Subscriber + for<'a> LookupSpan<'a>,
{
    fn on_event(&self, event: &Event<'_>, _ctx: Context<'_, S>) {
        let mut message = String::new();
        let mut attempt = None;
        event.record(&mut FieldVisitor(&mut message, &mut attempt));
        self.0.lock().unwrap().push((message, attempt));
    }
}

fn structured_total(events: &[(String, Option<u64>)]) -> u64 {
    events.iter().filter_map(|(_, a)| *a).sum()
}

/// A deliberately naive extractor standing in for "re-parse the rendered
/// sentence": it takes the first run of digits in the message, or zero
/// when the message spells the number out instead of using a digit.
fn formatted_total(events: &[(String, Option<u64>)]) -> u64 {
    events
        .iter()
        .map(|(message, _)| {
            message
                .chars()
                .skip_while(|c| !c.is_ascii_digit())
                .take_while(|c| c.is_ascii_digit())
                .collect::<String>()
                .parse::<u64>()
                .unwrap_or(0)
        })
        .sum()
}

fn main() {
    let capture = Capture::default();
    let subscriber = tracing_subscriber::registry().with(capture.clone());
    tracing::subscriber::set_global_default(subscriber).unwrap();

    info!(attempt = 1u64, "attempt 1 of 3 failed, retrying");
    info!(attempt = 2u64, "retry number 2 under way");
    info!(attempt = 3u64, "third attempt now running");

    let events = capture.0.lock().unwrap().clone();
    println!("structured_total={}", structured_total(&events));
    println!("formatted_total={}", formatted_total(&events));

    let header = tracecontext::format_traceparent(
        0x4bf9_2f35_77b3_4da6_a3ce_929d_0e0e_4736,
        0x00f0_67aa_0ba9_02b7,
        true,
    );
    println!("traceparent={header}");
    println!("parsed={:?}", tracecontext::parse_traceparent(&header));
    println!("malformed_parsed={:?}", tracecontext::parse_traceparent("01-not-a-real-header"));
}
