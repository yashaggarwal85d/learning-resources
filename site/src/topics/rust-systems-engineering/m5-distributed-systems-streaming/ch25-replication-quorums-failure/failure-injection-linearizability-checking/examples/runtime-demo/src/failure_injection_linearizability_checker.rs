// Builds directly on topic 66's own toy cluster: a tiny replicated register
// (leader plus replicas) that several real, independent failures are injected
// into together, and a real linearizability checker that walks the resulting
// recorded history and mechanically decides whether it is consistent with any
// honest real-time order at all.

type Tick = u64;

#[derive(Clone, Copy, Debug, PartialEq, Eq)]
enum Op {
    Write(i64),
    Read(i64),
}

#[derive(Clone, Copy, Debug)]
struct Event {
    op: Op,
    start: Tick,
    end: Tick,
}

const NUM_NODES: usize = 3;
const LEADER: usize = 0;

struct Cluster {
    logs: Vec<i64>,
}

impl Cluster {
    fn new() -> Self {
        Cluster { logs: vec![0; NUM_NODES] }
    }
    fn commit_write(&mut self, value: i64, reaches: &[usize]) {
        self.logs[LEADER] = value;
        for &node in reaches {
            self.logs[node] = value;
        }
    }
    fn read_from(&self, node: usize) -> i64 {
        self.logs[node]
    }
}

fn precedes(a: &Event, b: &Event) -> bool {
    a.end <= b.start
}

fn respects_precedence(events: &[Event], order: &[usize]) -> bool {
    for (pos, &a) in order.iter().enumerate() {
        for &b in &order[pos + 1..] {
            if precedes(&events[b], &events[a]) {
                return false;
            }
        }
    }
    true
}

fn is_valid_sequential(events: &[Event], order: &[usize]) -> bool {
    let mut value: i64 = 0;
    for &i in order {
        match events[i].op {
            Op::Write(v) => value = v,
            Op::Read(v) => {
                if v != value {
                    return false;
                }
            }
        }
    }
    true
}

fn permutations(n: usize) -> Vec<Vec<usize>> {
    fn helper(cur: &mut Vec<usize>, remaining: &mut Vec<usize>, out: &mut Vec<Vec<usize>>) {
        if remaining.is_empty() {
            out.push(cur.clone());
            return;
        }
        for i in 0..remaining.len() {
            let v = remaining.remove(i);
            cur.push(v);
            helper(cur, remaining, out);
            cur.pop();
            remaining.insert(i, v);
        }
    }
    let mut out = Vec::new();
    helper(&mut Vec::new(), &mut (0..n).collect(), &mut out);
    out
}

struct CheckResult {
    linearizable: bool,
    candidates_checked: usize,
    precedence_respecting: usize,
    first_violation_index: Option<usize>,
}

fn check_linearizability(events: &[Event]) -> CheckResult {
    let perms = permutations(events.len());
    let mut precedence_respecting = 0;
    let mut found_witness = false;
    let mut first_violation_index = None;
    for order in &perms {
        if !respects_precedence(events, order) {
            continue;
        }
        precedence_respecting += 1;
        if is_valid_sequential(events, order) {
            found_witness = true;
        } else if first_violation_index.is_none() && order.len() == events.len() && *order == (0..events.len()).collect::<Vec<_>>() {
            let mut value: i64 = 0;
            for &i in order {
                match events[i].op {
                    Op::Write(v) => value = v,
                    Op::Read(v) => {
                        if v != value {
                            first_violation_index = Some(i);
                            break;
                        }
                    }
                }
            }
        }
    }
    CheckResult {
        linearizable: found_witness,
        candidates_checked: perms.len(),
        precedence_respecting,
        first_violation_index,
    }
}

fn build_history_with_failures(delayed_ack_lags: bool) -> Vec<Event> {
    let mut cluster = Cluster::new();
    let mut events = Vec::new();

    // W1: a healthy quorum write, reaching every node.
    cluster.commit_write(1, &[1, 2]);
    events.push(Event { op: Op::Write(1), start: 0, end: 3 });

    // R1: a healthy read, after W1 has genuinely reached node 1.
    events.push(Event { op: Op::Read(cluster.read_from(1)), start: 5, end: 7 });

    // W2: the leader commits a second value. Injected failure one (delayed
    // acknowledgement): node 1 does not receive it yet, so it stays stale.
    let reaches: &[usize] = if delayed_ack_lags { &[2] } else { &[1, 2] };
    cluster.commit_write(2, reaches);
    events.push(Event { op: Op::Write(2), start: 9, end: 11 });

    // R2: a read served from node 1, the possibly-lagging replica.
    events.push(Event { op: Op::Read(cluster.read_from(1)), start: 13, end: 15 });

    // Injected failure two (a duplicated message): node 2 is asked to apply
    // the already-committed value a second time. Idempotent, so the real
    // value on node 2 never actually changes because of it.
    cluster.commit_write(2, &[2]);
    events.push(Event { op: Op::Read(cluster.read_from(2)), start: 17, end: 19 });

    events
}

fn build_concurrent_pair_history() -> Vec<Event> {
    let mut cluster = Cluster::new();
    let before_write = cluster.read_from(1);
    cluster.commit_write(1, &[1, 2]);
    let after_write = cluster.read_from(2);
    vec![
        Event { op: Op::Write(1), start: 0, end: 10 },
        Event { op: Op::Read(before_write), start: 4, end: 6 },
        Event { op: Op::Read(after_write), start: 12, end: 14 },
    ]
}

fn main() {
    let failure_history = build_history_with_failures(true);
    let failure_result = check_linearizability(&failure_history);

    let fixed_history = build_history_with_failures(false);
    let fixed_result = check_linearizability(&fixed_history);

    let concurrent_history = build_concurrent_pair_history();
    let concurrent_result = check_linearizability(&concurrent_history);

    println!("failure_linearizable {}", failure_result.linearizable);
    println!("failure_candidates_checked {}", failure_result.candidates_checked);
    println!("failure_precedence_respecting {}", failure_result.precedence_respecting);
    println!(
        "failure_first_violation_index {}",
        failure_result.first_violation_index.map(|i| i as i64).unwrap_or(-1)
    );

    println!("fixed_linearizable {}", fixed_result.linearizable);
    println!("fixed_precedence_respecting {}", fixed_result.precedence_respecting);

    println!("concurrent_linearizable {}", concurrent_result.linearizable);
    println!("concurrent_precedence_respecting {}", concurrent_result.precedence_respecting);

    let a_failure_history_is_genuinely_not_linearizable = !failure_result.linearizable;
    let b_fixing_the_stale_read_makes_history_genuinely_linearizable = fixed_result.linearizable;
    let c_concurrent_pair_history_is_genuinely_linearizable = concurrent_result.linearizable;
    let d_precedence_respecting_count_matches_the_real_order_structure = failure_result.precedence_respecting == 1
        && fixed_result.precedence_respecting == 1
        && concurrent_result.precedence_respecting == 2;
    let e_checker_names_the_delayed_ack_read_not_the_duplicate_message_read =
        failure_result.first_violation_index == Some(3);

    println!("a_failure_history_is_genuinely_not_linearizable {}", a_failure_history_is_genuinely_not_linearizable);
    println!(
        "b_fixing_the_stale_read_makes_history_genuinely_linearizable {}",
        b_fixing_the_stale_read_makes_history_genuinely_linearizable
    );
    println!("c_concurrent_pair_history_is_genuinely_linearizable {}", c_concurrent_pair_history_is_genuinely_linearizable);
    println!(
        "d_precedence_respecting_count_matches_the_real_order_structure {}",
        d_precedence_respecting_count_matches_the_real_order_structure
    );
    println!(
        "e_checker_names_the_delayed_ack_read_not_the_duplicate_message_read {}",
        e_checker_names_the_delayed_ack_read_not_the_duplicate_message_read
    );
}
