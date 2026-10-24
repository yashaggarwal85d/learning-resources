use proptest::prelude::*;
use proptest::test_runner::{Config, FileFailurePersistence, TestError, TestRunner};

fn config() -> Config {
    Config {
        cases: 256,
        failure_persistence: Some(Box::new(FileFailurePersistence::Off)),
        ..Config::default()
    }
}

const CAPACITY: usize = 100;

struct SlotPage {
    slots: Vec<(usize, usize)>, // (start, len)
}

impl SlotPage {
    fn new() -> Self {
        SlotPage { slots: Vec::new() }
    }

    fn next_start(&self) -> usize {
        self.slots.last().map(|(s, l)| s + l).unwrap_or(0)
    }

    /// Checks only that the slot's own length fits the page's own real
    /// capacity; it never checks the slot's own real starting offset.
    fn naive_insert(&mut self, len: usize) -> bool {
        if len > CAPACITY {
            return false;
        }
        let start = self.next_start();
        self.slots.push((start, len));
        true
    }

    /// Checks that the slot's own real end offset, start plus length,
    /// fits the real capacity.
    fn checked_insert(&mut self, len: usize) -> bool {
        let start = self.next_start();
        match start.checked_add(len) {
            Some(end) if end <= CAPACITY => {
                self.slots.push((start, len));
                true
            }
            _ => false,
        }
    }

    fn bounds_ok(&self) -> bool {
        self.slots.iter().all(|(s, l)| s + l <= CAPACITY)
    }
}

/// A deliberately simpler reference model: a single running total of
/// bytes used, with no real slot list at all.
struct ReferenceModel {
    used: usize,
}

impl ReferenceModel {
    fn new() -> Self {
        ReferenceModel { used: 0 }
    }

    fn insert(&mut self, len: usize) -> bool {
        match self.used.checked_add(len) {
            Some(total) if total <= CAPACITY => {
                self.used = total;
                true
            }
            _ => false,
        }
    }
}

fn lengths_strategy() -> impl Strategy<Value = Vec<usize>> {
    prop::collection::vec(1usize..=20, 1..30)
}

fn main() {
    // Scenario 1: the naive, buggy insert against the real bounds
    // invariant. Expected to fail and shrink to a minimal case.
    let mut runner = TestRunner::new(config());
    let naive_result = runner.run(&lengths_strategy(), |lengths| {
        let mut page = SlotPage::new();
        for len in &lengths {
            page.naive_insert(*len);
        }
        if page.bounds_ok() {
            Ok(())
        } else {
            Err(TestCaseError::fail("a slot's own range ran past capacity"))
        }
    });

    match naive_result {
        Err(TestError::Fail(_, minimal)) => {
            println!("naive_failed=true");
            println!("naive_min_failing_len={}", minimal.len());
            println!("naive_min_failing_sum={}", minimal.iter().sum::<usize>());
        }
        _ => {
            println!("naive_failed=false");
        }
    }

    // Scenario 2: the checked, correct insert against the identical
    // real bounds invariant. Expected to pass across many real cases.
    let mut runner = TestRunner::new(config());
    let checked_result = runner.run(&lengths_strategy(), |lengths| {
        let mut page = SlotPage::new();
        for len in &lengths {
            page.checked_insert(*len);
        }
        if page.bounds_ok() {
            Ok(())
        } else {
            Err(TestCaseError::fail("a slot's own range ran past capacity"))
        }
    });
    println!("checked_passed={}", checked_result.is_ok());

    // Scenario 3: a real, stateful, model-based comparison between the
    // checked allocator and a real, deliberately simpler reference
    // model, across a real, random sequence of operations.
    let mut runner = TestRunner::new(config());
    let model_result = runner.run(&lengths_strategy(), |lengths| {
        let mut page = SlotPage::new();
        let mut model = ReferenceModel::new();
        for len in &lengths {
            let page_accepted = page.checked_insert(*len);
            let model_accepted = model.insert(*len);
            if page_accepted != model_accepted {
                return Err(TestCaseError::fail(
                    "the page and the reference model disagreed",
                ));
            }
        }
        Ok(())
    });
    println!("model_agreement_held={}", model_result.is_ok());
}
