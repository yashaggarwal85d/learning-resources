use std::sync::{Arc, Mutex};
use tracing::field::{Field, Visit};
use tracing::{Event, Subscriber};
use tracing_subscriber::layer::{Context, Layer};
use tracing_subscriber::registry::LookupSpan;

/// Captures every event this binary records, together with the name of
/// whichever span tracing considers "current" the instant that event fires.
/// A real interleaving bug shows up directly as the wrong name here.
#[derive(Default, Clone)]
pub struct Capture(pub Arc<Mutex<Vec<(String, Option<String>)>>>);

struct MessageVisitor<'a>(&'a mut String);
impl Visit for MessageVisitor<'_> {
    fn record_debug(&mut self, field: &Field, value: &dyn std::fmt::Debug) {
        if field.name() == "message" {
            *self.0 = format!("{value:?}");
        }
    }
}

impl<S> Layer<S> for Capture
where
    S: Subscriber + for<'a> LookupSpan<'a>,
{
    fn on_event(&self, event: &Event<'_>, ctx: Context<'_, S>) {
        let current_span_name = ctx.event_span(event).map(|s| s.name().to_string());
        let mut message = String::new();
        event.record(&mut MessageVisitor(&mut message));
        self.0.lock().unwrap().push((message, current_span_name));
    }
}

pub fn marker_event() -> &'static str {
    "marker_from_task_b"
}
