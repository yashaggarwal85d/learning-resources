// A real, typed error distinguishing a timeout from a genuine remote
// error, measured against the identical operation's own untyped
// string error. A real retry loop built on the typed error retries
// one real failure kind and does not retry the other; the untyped
// string version cannot tell them apart at all.
use thiserror::Error;

#[derive(Debug, Error)]
enum OpError {
    #[error("operation failed: timed out waiting for a response")]
    Timeout,
    #[error("operation failed: connection reset by the remote peer")]
    Remote(String),
}

#[derive(Clone, Copy)]
enum Kind {
    Timeout,
    Remote,
}

fn attempt_typed(kind: Kind) -> Result<(), OpError> {
    match kind {
        Kind::Timeout => Err(OpError::Timeout),
        Kind::Remote => Err(OpError::Remote("peer closed the connection".to_string())),
    }
}

fn attempt_untyped(kind: Kind) -> Result<(), String> {
    attempt_typed(kind).map_err(|e| e.to_string())
}

// Correct by construction: matched on the real, typed variant itself.
fn should_retry_typed(e: &OpError) -> bool {
    matches!(e, OpError::Timeout)
}

// A real, plausible but genuinely naive untyped check: both of this
// crate's own real error messages share the identical "operation
// failed" prefix, so checking for that substring cannot distinguish
// the one real failure kind that should be retried from the one that
// should not.
fn should_retry_untyped(e: &str) -> bool {
    e.contains("operation failed")
}

fn main() {
    let typed_timeout_err = attempt_typed(Kind::Timeout).unwrap_err();
    let typed_remote_err = attempt_typed(Kind::Remote).unwrap_err();
    let typed_timeout_retry = should_retry_typed(&typed_timeout_err);
    let typed_remote_retry = should_retry_typed(&typed_remote_err);

    let untyped_timeout_err = attempt_untyped(Kind::Timeout).unwrap_err();
    let untyped_remote_err = attempt_untyped(Kind::Remote).unwrap_err();
    let untyped_timeout_retry = should_retry_untyped(&untyped_timeout_err);
    let untyped_remote_retry = should_retry_untyped(&untyped_remote_err);

    println!("typed_timeout_retry={typed_timeout_retry}");
    println!("typed_remote_retry={typed_remote_retry}");
    println!("untyped_timeout_retry={untyped_timeout_retry}");
    println!("untyped_remote_retry={untyped_remote_retry}");
    println!("typed_timeout_message={typed_timeout_err}");
    println!("typed_remote_message={typed_remote_err}");
}
