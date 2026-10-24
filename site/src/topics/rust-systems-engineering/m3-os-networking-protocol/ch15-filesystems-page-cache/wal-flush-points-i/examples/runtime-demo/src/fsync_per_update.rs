// Writes a thousand small, real log records to a real file, calling File::sync_all()
// after every single one — the naive "durable update" approach the syllabus names as
// what a real database deliberately avoids. Prints the real elapsed time so
// examples.py can compare it against the batched version, and is run under strace by
// examples.py to count the real number of fsync syscalls this approach actually makes.
use std::fs::File;
use std::io::Write;
use std::time::Instant;

const UPDATES: usize = 1000;

fn main() {
    let path = std::env::temp_dir().join(format!("fsync-per-update-{}.bin", std::process::id()));
    let mut f = File::create(&path).expect("create the log file");
    let start = Instant::now();
    for i in 0..UPDATES {
        f.write_all(format!("record {i}\n").as_bytes()).expect("write a record");
        f.sync_all().expect("sync_all after every record");
    }
    let elapsed_ms = start.elapsed().as_secs_f64() * 1000.0;
    let _ = std::fs::remove_file(&path);
    println!("{elapsed_ms}");
}
