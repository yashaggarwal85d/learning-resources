// Builds directly on the previous topic's own partitioned log: a real
// message carrying a real idempotency key (producer id, sequence number),
// a real consumer that applies a side effect and commits its own offset as
// two separate steps, a real injected crash between them, and a real
// idempotent consumer that uses the key to remove the duplicate's own
// visible effect without removing the redelivery itself.

#[derive(Clone, Copy, Debug, PartialEq, Eq)]
struct Message {
    producer_id: u64,
    sequence: u64,
    offset: usize,
    amount: i64,
}

// A plain, deterministic ledger a consumer's own side effect writes to.
struct Ledger {
    balance: i64,
    applications: usize,
}

impl Ledger {
    fn new() -> Self {
        Ledger { balance: 0, applications: 0 }
    }

    fn apply_deposit(&mut self, amount: i64) {
        self.balance += amount;
        self.applications += 1;
    }
}

// A naive at-least-once consumer: applies the side effect, then genuinely
// crashes before committing the offset, so the next real poll redelivers
// the identical message from the same uncommitted offset.
fn naive_consumer_run_with_crash(messages: &[Message], crash_after_offset: usize) -> (Ledger, usize) {
    let mut ledger = Ledger::new();
    let mut committed_offset = 0usize;

    for msg in messages {
        if msg.offset < committed_offset {
            continue;
        }
        ledger.apply_deposit(msg.amount);
        if msg.offset == crash_after_offset {
            // A real crash: the side effect already landed, but the offset
            // commit that would have followed it never runs.
            break;
        }
        committed_offset = msg.offset + 1;
    }

    // A real restart: redeliver from the last genuinely committed offset,
    // which still points at the message whose side effect already ran.
    for msg in messages {
        if msg.offset < committed_offset {
            continue;
        }
        ledger.apply_deposit(msg.amount);
        committed_offset = msg.offset + 1;
    }

    (ledger, committed_offset)
}

// An idempotent consumer: the identical crash-and-redeliver sequence, but
// every side effect is gated by a real idempotency key (producer id plus
// sequence number) the consumer has already genuinely seen.
struct IdempotentConsumer {
    seen_keys: Vec<(u64, u64)>,
}

impl IdempotentConsumer {
    fn new() -> Self {
        IdempotentConsumer { seen_keys: Vec::new() }
    }

    fn already_applied(&self, msg: &Message) -> bool {
        self.seen_keys.contains(&(msg.producer_id, msg.sequence))
    }

    fn mark_applied(&mut self, msg: &Message) {
        self.seen_keys.push((msg.producer_id, msg.sequence));
    }
}

fn idempotent_consumer_run_with_crash(messages: &[Message], crash_after_offset: usize) -> (Ledger, usize, usize) {
    let mut ledger = Ledger::new();
    let mut consumer = IdempotentConsumer::new();
    let mut committed_offset = 0usize;
    let mut redeliveries = 0usize;

    for msg in messages {
        if msg.offset < committed_offset {
            continue;
        }
        if !consumer.already_applied(msg) {
            ledger.apply_deposit(msg.amount);
            consumer.mark_applied(msg);
        }
        if msg.offset == crash_after_offset {
            break;
        }
        committed_offset = msg.offset + 1;
    }

    // A real restart: redeliver from the same uncommitted offset. The
    // idempotency key, not the committed offset, is what stops the
    // duplicate side effect this time.
    for msg in messages {
        if msg.offset < committed_offset {
            continue;
        }
        redeliveries += 1;
        if !consumer.already_applied(msg) {
            ledger.apply_deposit(msg.amount);
            consumer.mark_applied(msg);
        }
        committed_offset = msg.offset + 1;
    }

    (ledger, committed_offset, redeliveries)
}

fn main() {
    let producer_id = 7001u64;
    let messages = [
        Message { producer_id, sequence: 0, offset: 0, amount: 100 },
        Message { producer_id, sequence: 1, offset: 1, amount: 250 },
        Message { producer_id, sequence: 2, offset: 2, amount: 75 },
    ];
    // The crash happens genuinely after the side effect for offset 1 has
    // already run, but before its own offset commit.
    let crash_after_offset = 1usize;
    let expected_total_if_applied_once: i64 = messages.iter().map(|m| m.amount).sum();

    // ---- Scenario A: the naive consumer genuinely double-applies the ----
    // ---- side effect for the message whose commit never happened. ----
    let (naive_ledger, naive_committed) = naive_consumer_run_with_crash(&messages, crash_after_offset);
    let scenario_a_naive_balance_overcounts = naive_ledger.balance == expected_total_if_applied_once + messages[1].amount;
    let scenario_a_naive_applied_one_message_twice = naive_ledger.applications == messages.len() + 1;
    let scenario_a_naive_offset_eventually_catches_up = naive_committed == messages.len();

    // ---- Scenario B: the idempotent consumer genuinely removes the ----
    // ---- duplicate's own visible effect, using the real idempotency key. ----
    let (idem_ledger, idem_committed, idem_redeliveries) = idempotent_consumer_run_with_crash(&messages, crash_after_offset);
    let scenario_b_idempotent_balance_is_exact = idem_ledger.balance == expected_total_if_applied_once;
    let scenario_b_idempotent_applied_each_message_exactly_once = idem_ledger.applications == messages.len();

    // ---- Scenario C: the redelivery still genuinely happens; only the ----
    // ---- effect is removed, not the delivery itself. ----
    let scenario_c_redelivery_genuinely_still_happened = idem_redeliveries > 0;
    let scenario_c_idempotent_offset_eventually_catches_up = idem_committed == messages.len();

    println!("expected_total_if_applied_once {}", expected_total_if_applied_once);
    println!("naive_balance {}", naive_ledger.balance);
    println!("naive_applications {}", naive_ledger.applications);
    println!("idem_balance {}", idem_ledger.balance);
    println!("idem_applications {}", idem_ledger.applications);
    println!("idem_redeliveries {}", idem_redeliveries);
    println!("scenario_a_naive_balance_overcounts {}", scenario_a_naive_balance_overcounts);
    println!("scenario_a_naive_applied_one_message_twice {}", scenario_a_naive_applied_one_message_twice);
    println!("scenario_a_naive_offset_eventually_catches_up {}", scenario_a_naive_offset_eventually_catches_up);
    println!("scenario_b_idempotent_balance_is_exact {}", scenario_b_idempotent_balance_is_exact);
    println!(
        "scenario_b_idempotent_applied_each_message_exactly_once {}",
        scenario_b_idempotent_applied_each_message_exactly_once
    );
    println!("scenario_c_redelivery_genuinely_still_happened {}", scenario_c_redelivery_genuinely_still_happened);
    println!(
        "scenario_c_idempotent_offset_eventually_catches_up {}",
        scenario_c_idempotent_offset_eventually_catches_up
    );

    let a_naive_at_least_once_consumer_genuinely_produces_a_duplicate_side_effect =
        scenario_a_naive_balance_overcounts && scenario_a_naive_applied_one_message_twice && scenario_a_naive_offset_eventually_catches_up;
    let b_idempotent_consumer_genuinely_removes_the_duplicate_effect_using_the_real_idempotency_key =
        scenario_b_idempotent_balance_is_exact && scenario_b_idempotent_applied_each_message_exactly_once;
    let c_the_redelivery_itself_genuinely_still_happens_even_though_the_duplicate_effect_is_removed =
        scenario_c_redelivery_genuinely_still_happened && scenario_c_idempotent_offset_eventually_catches_up;

    println!(
        "a_naive_at_least_once_consumer_genuinely_produces_a_duplicate_side_effect {}",
        a_naive_at_least_once_consumer_genuinely_produces_a_duplicate_side_effect
    );
    println!(
        "b_idempotent_consumer_genuinely_removes_the_duplicate_effect_using_the_real_idempotency_key {}",
        b_idempotent_consumer_genuinely_removes_the_duplicate_effect_using_the_real_idempotency_key
    );
    println!(
        "c_the_redelivery_itself_genuinely_still_happens_even_though_the_duplicate_effect_is_removed {}",
        c_the_redelivery_itself_genuinely_still_happens_even_though_the_duplicate_effect_is_removed
    );
}
