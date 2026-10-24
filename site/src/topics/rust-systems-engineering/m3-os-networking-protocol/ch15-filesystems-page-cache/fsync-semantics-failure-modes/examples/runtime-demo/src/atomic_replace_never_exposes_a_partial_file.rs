// Repeatedly replaces one real file's content via the write-temp + fsync + rename +
// fsync-dir atomic-replace pattern, alternating between a short and a much longer
// real byte string, while a concurrent reader thread reads that same file as fast
// as it can — and measures directly that it never once observes a length other
// than the short or the long one, i.e. never a half-written file.
use std::fs::{self, File};
use std::io::Write;
use std::sync::atomic::{AtomicBool, Ordering};
use std::sync::Arc;

const ITERATIONS: usize = 200;

fn atomic_replace(dir: &std::path::Path, target: &std::path::Path, content: &[u8], tag: &str) {
    let tmp = dir.join(format!("tmp-{tag}.bin"));
    let mut f = File::create(&tmp).expect("create temp file");
    f.write_all(content).expect("write temp file");
    f.sync_all().expect("fsync the temp file");
    drop(f);
    fs::rename(&tmp, target).expect("rename over the target");
    let dir_fd = File::open(dir).expect("open the directory");
    dir_fd.sync_all().expect("fsync the directory");
}

fn main() {
    let dir = std::env::temp_dir().join(format!("atomic-replace-demo-{}", std::process::id()));
    fs::create_dir(&dir).expect("create backing directory");
    let target = dir.join("target.bin");
    let short_content = vec![b'A'; 10];
    let long_content = vec![b'B'; 20_000];
    fs::write(&target, &short_content).expect("seed the target file");

    let stop = Arc::new(AtomicBool::new(false));
    let stop_reader = stop.clone();
    let target_reader = target.clone();
    let short_len = short_content.len();
    let long_len = long_content.len();
    let reader = std::thread::spawn(move || {
        let mut reads = 0usize;
        let mut partial_reads = 0usize;
        while !stop_reader.load(Ordering::Relaxed) {
            if let Ok(bytes) = fs::read(&target_reader) {
                reads += 1;
                if bytes.len() != short_len && bytes.len() != long_len {
                    partial_reads += 1;
                }
            }
        }
        (reads, partial_reads)
    });

    for i in 0..ITERATIONS {
        atomic_replace(&dir, &target, &long_content, &format!("long-{i}"));
        atomic_replace(&dir, &target, &short_content, &format!("short-{i}"));
    }

    stop.store(true, Ordering::Relaxed);
    let (reads, partial_reads) = reader.join().expect("reader thread should not panic");

    let _ = fs::remove_file(&target);
    let _ = fs::remove_dir_all(&dir);

    println!("{reads} {partial_reads}");
}
