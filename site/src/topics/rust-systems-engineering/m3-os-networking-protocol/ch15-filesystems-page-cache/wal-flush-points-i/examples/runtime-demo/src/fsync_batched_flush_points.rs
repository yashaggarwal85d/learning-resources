// Writes the exact same thousand small, real log records to a real file, but fsyncs
// only at explicit, batched flush points — once every fifty records, plus a final
// flush — the real WAL-style approach the syllabus describes. Prints the real
// elapsed time so examples.py can compare it against the per-update version, and is
// run under strace by examples.py to count the real, much smaller number of fsync
// syscalls this approach actually makes.
use std::fs::File;
use std::io::Write;
use std::time::Instant;

const UPDATES: usize = 1000;
const FLUSH_EVERY: usize = 50;

fn main() {
    let path = std::env::temp_dir().join(format!("fsync-batched-{}.bin", std::process::id()));
    let mut f = File::create(&path).expect("create the log file");
    let start = Instant::now();
    for i in 0..UPDATES {
        f.write_all(format!("record {i}\n").as_bytes()).expect("write a record");
        if (i + 1) % FLUSH_EVERY == 0 {
            f.sync_all().expect("sync_all at a batched flush point");
        }
    }
    f.sync_all().expect("a final flush point for any remainder");
    let elapsed_ms = start.elapsed().as_secs_f64() * 1000.0;
    let _ = std::fs::remove_file(&path);
    println!("{elapsed_ms}");
}
