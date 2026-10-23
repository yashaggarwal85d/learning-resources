// Writes a real file and calls either File::sync_all or File::sync_data on it,
// selected by the first command-line argument. examples.py runs this under
// strace to confirm which real syscall each one actually makes.
use std::fs::File;
use std::io::Write;

fn main() {
    let mode = std::env::args().nth(1).expect("pass 'all' or 'data'");
    let path = std::env::temp_dir().join(format!("sync-demo-{}.bin", std::process::id()));
    let mut f = File::create(&path).expect("create backing file");
    f.write_all(b"hello").expect("write backing file");
    match mode.as_str() {
        "all" => f.sync_all().expect("sync_all should succeed"),
        "data" => f.sync_data().expect("sync_data should succeed"),
        other => panic!("unknown mode: {other}"),
    }
    let _ = std::fs::remove_file(&path);
}
