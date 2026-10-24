// A real leveled compaction and a real tiered (universal-style)
// compaction, run against the identical sequence of flushed SSTables,
// measuring the real, different read, write, and space amplification
// each one produces.

type Key = u32;
type Value = u32;

#[derive(Clone)]
struct Run {
    entries: Vec<(Key, Value)>, // sorted by key, deduplicated within itself
}

impl Run {
    fn from_batch(mut batch: Vec<(Key, Value)>) -> Self {
        batch.sort_by_key(|&(k, _)| k);
        Run { entries: batch }
    }

    fn len(&self) -> usize {
        self.entries.len()
    }
}

/// Merges several sorted runs, oldest first, newest last. On a duplicate
/// key the value from the later (newer) run wins. Returns the merged,
/// deduplicated run plus how many input entries were actually processed
/// — the real cost this one compaction step charges against write
/// amplification.
fn merge_runs(runs: &[&Run]) -> (Run, usize) {
    let mut processed = 0;
    let mut latest: std::collections::BTreeMap<Key, Value> = std::collections::BTreeMap::new();
    for run in runs {
        processed += run.len();
        for &(k, v) in &run.entries {
            latest.insert(k, v); // later runs overwrite earlier ones
        }
    }
    (Run { entries: latest.into_iter().collect() }, processed)
}

/// No compaction at all: every flush just becomes its own permanent run.
fn run_no_compaction(batches: &[Vec<(Key, Value)>]) -> (usize, usize) {
    let runs: Vec<Run> = batches.iter().cloned().map(Run::from_batch).collect();
    let run_count = runs.len();
    let total_entries_stored: usize = runs.iter().map(Run::len).sum();
    (run_count, total_entries_stored)
}

/// A real, minimal leveled compactor: level 0 absorbs every flush
/// directly; whenever a level's total entries exceed its own capacity,
/// every run in that level is merged together with the next level's own
/// existing run into one new, deduplicated run, which replaces the next
/// level's run while this level is cleared — cascading upward as needed.
struct Leveled {
    levels: Vec<Vec<Run>>,
    capacities: Vec<usize>,
    write_cost: usize,
}

impl Leveled {
    fn new(capacities: Vec<usize>) -> Self {
        Leveled { levels: vec![Vec::new(); capacities.len() + 1], capacities, write_cost: 0 }
    }

    fn flush(&mut self, batch: Vec<(Key, Value)>) {
        self.levels[0].push(Run::from_batch(batch));
        self.cascade(0);
    }

    fn cascade(&mut self, level: usize) {
        if level >= self.capacities.len() {
            return; // the last level has no capacity limit; data rests here
        }
        let total: usize = self.levels[level].iter().map(Run::len).sum();
        if total <= self.capacities[level] {
            return;
        }
        let existing_next = self.levels[level + 1].first().cloned();
        let mut ordered: Vec<&Run> = Vec::new();
        if let Some(ref r) = existing_next {
            ordered.push(r); // the next level's own run is the oldest data
        }
        for r in &self.levels[level] {
            ordered.push(r); // this level's runs are newer than the next level's
        }
        let (merged, processed) = merge_runs(&ordered);
        self.write_cost += processed;
        self.levels[level].clear();
        self.levels[level + 1] = vec![merged];
        self.cascade(level + 1);
    }

    fn run_count(&self) -> usize {
        self.levels.iter().map(Vec::len).sum()
    }

    fn total_entries_stored(&self) -> usize {
        self.levels.iter().flatten().map(Run::len).sum()
    }
}

/// A real, minimal tiered (universal-style) compactor: every flush adds
/// one more flat, same-tier run; once the number of runs reaches the
/// trigger, every current run is merged together into one single,
/// deduplicated run, with no level hierarchy at all.
struct Tiered {
    runs: Vec<Run>,
    trigger: usize,
    write_cost: usize,
}

impl Tiered {
    fn new(trigger: usize) -> Self {
        Tiered { runs: Vec::new(), trigger, write_cost: 0 }
    }

    fn flush(&mut self, batch: Vec<(Key, Value)>) {
        self.runs.push(Run::from_batch(batch));
        if self.runs.len() >= self.trigger {
            let refs: Vec<&Run> = self.runs.iter().collect();
            let (merged, processed) = merge_runs(&refs);
            self.write_cost += processed;
            self.runs = vec![merged];
        }
    }

    fn run_count(&self) -> usize {
        self.runs.len()
    }

    fn total_entries_stored(&self) -> usize {
        self.runs.iter().map(Run::len).sum()
    }
}

fn workload(num_batches: usize, key_range: u32) -> Vec<Vec<(Key, Value)>> {
    (0..num_batches)
        .map(|batch_index| (0..key_range).map(|k| (k, batch_index as u32)).collect())
        .collect()
}

fn main() {
    const KEY_RANGE: u32 = 50;
    const NUM_BATCHES: usize = 20;
    let batches = workload(NUM_BATCHES, KEY_RANGE);
    let total_logical_puts = NUM_BATCHES * KEY_RANGE as usize;

    // ---- Claim A: without compaction, SSTables accumulate forever, so
    // both read amplification (every run must be checked) and space
    // amplification (every stale version is still physically present)
    // genuinely grow without bound. ----
    let (no_compaction_run_count, no_compaction_entries_stored) = run_no_compaction(&batches);
    let a_run_count_genuinely_matches_the_flush_count = no_compaction_run_count == NUM_BATCHES;
    let a_every_stale_version_is_genuinely_still_present = no_compaction_entries_stored == total_logical_puts;

    // ---- leveled and tiered, run against the identical batches ----
    let mut leveled = Leveled::new(vec![3 * KEY_RANGE as usize, usize::MAX / 2]);
    for batch in &batches {
        leveled.flush(batch.clone());
    }
    let mut tiered = Tiered::new(8);
    for batch in &batches {
        tiered.flush(batch.clone());
    }

    let leveled_write_amp = leveled.write_cost as f64 / total_logical_puts as f64;
    let tiered_write_amp = tiered.write_cost as f64 / total_logical_puts as f64;
    let leveled_read_amp = leveled.run_count();
    let tiered_read_amp = tiered.run_count();
    let leveled_space_amp = leveled.total_entries_stored() as f64 / KEY_RANGE as f64;
    let tiered_space_amp = tiered.total_entries_stored() as f64 / KEY_RANGE as f64;

    // ---- Claim B: both real compaction strategies genuinely beat no
    // compaction at all, on both read and space amplification. ----
    let b_leveled_beats_no_compaction_on_read_amp = leveled_read_amp < no_compaction_run_count;
    let b_tiered_beats_no_compaction_on_read_amp = tiered_read_amp < no_compaction_run_count;
    let b_leveled_beats_no_compaction_on_space_amp = leveled.total_entries_stored() < no_compaction_entries_stored;
    let b_tiered_beats_no_compaction_on_space_amp = tiered.total_entries_stored() < no_compaction_entries_stored;

    // ---- Claim C: leveled and tiered compaction, run against the
    // identical write workload, genuinely produce different write
    // amplification and different read/space amplification from each
    // other. ----
    let c_write_amplification_genuinely_differs = (leveled_write_amp - tiered_write_amp).abs() > 0.001;
    let c_read_or_space_amplification_genuinely_differs =
        leveled_read_amp != tiered_read_amp || (leveled_space_amp - tiered_space_amp).abs() > 0.001;

    println!("a_run_count_genuinely_matches_the_flush_count {}", a_run_count_genuinely_matches_the_flush_count);
    println!("a_every_stale_version_is_genuinely_still_present {}", a_every_stale_version_is_genuinely_still_present);
    println!("b_leveled_beats_no_compaction_on_read_amp {}", b_leveled_beats_no_compaction_on_read_amp);
    println!("b_tiered_beats_no_compaction_on_read_amp {}", b_tiered_beats_no_compaction_on_read_amp);
    println!("b_leveled_beats_no_compaction_on_space_amp {}", b_leveled_beats_no_compaction_on_space_amp);
    println!("b_tiered_beats_no_compaction_on_space_amp {}", b_tiered_beats_no_compaction_on_space_amp);
    println!("c_write_amplification_genuinely_differs {}", c_write_amplification_genuinely_differs);
    println!("c_read_or_space_amplification_genuinely_differs {}", c_read_or_space_amplification_genuinely_differs);
    println!("leveled_write_amp {:.4}", leveled_write_amp);
    println!("tiered_write_amp {:.4}", tiered_write_amp);
    println!("leveled_read_amp {}", leveled_read_amp);
    println!("tiered_read_amp {}", tiered_read_amp);
    println!("leveled_space_amp {:.4}", leveled_space_amp);
    println!("tiered_space_amp {:.4}", tiered_space_amp);
}
