// A minimal, real per-connection output buffer with an explicit, enforced cap:
// pushing a message once the buffer is at its cap is rejected by policy (drop-by-
// policy backpressure), not silently queued without bound. Demonstrates that the
// cap is a real, enforced limit, not a soft suggestion: filling it to exactly the
// cap succeeds, and the very next push past it is genuinely rejected.
const OUTPUT_BUFFER_CAP: usize = 16;

struct BoundedOutputBuffer {
    queue: Vec<Vec<u8>>,
    cap: usize,
}

impl BoundedOutputBuffer {
    fn new(cap: usize) -> Self {
        Self { queue: Vec::new(), cap }
    }

    fn push(&mut self, msg: Vec<u8>) -> bool {
        if self.queue.len() >= self.cap {
            return false; // drop by policy: the connection is already at its cap.
        }
        self.queue.push(msg);
        true
    }
}

fn main() {
    let mut buf = BoundedOutputBuffer::new(OUTPUT_BUFFER_CAP);
    let mut accepted = 0usize;
    for i in 0..OUTPUT_BUFFER_CAP {
        if buf.push(vec![i as u8]) {
            accepted += 1;
        }
    }
    let at_cap_len = buf.queue.len();
    let one_more_accepted = buf.push(vec![255u8]);
    let final_len = buf.queue.len();

    println!("{accepted} {at_cap_len} {one_more_accepted} {final_len}");
}
