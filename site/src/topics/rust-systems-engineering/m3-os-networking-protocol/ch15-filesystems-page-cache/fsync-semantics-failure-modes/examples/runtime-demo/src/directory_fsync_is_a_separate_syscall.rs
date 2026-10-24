// Writes a real file in a real directory, fsyncs the file's own fd, then opens
// and fsyncs the parent directory's own fd — two genuinely separate file
// descriptors, confirmed distinct here and confirmed as two separate fsync
// syscalls by examples.py's own strace run of this binary.
use std::fs::File;
use std::io::Write;
use std::os::unix::io::AsRawFd;

fn main() {
    let dir = std::env::temp_dir().join(format!("dirsync-demo-{}", std::process::id()));
    std::fs::create_dir(&dir).expect("create backing directory");
    let file_path = dir.join("f.bin");

    let mut f = File::create(&file_path).expect("create backing file");
    f.write_all(b"hello").expect("write backing file");
    f.sync_all().expect("file sync_all should succeed");

    let dir_fd = File::open(&dir).expect("open the directory itself");
    dir_fd.sync_all().expect("directory sync_all should succeed");

    let distinct_fds = f.as_raw_fd() != dir_fd.as_raw_fd();

    let _ = std::fs::remove_file(&file_path);
    let _ = std::fs::remove_dir(&dir);

    println!("{distinct_fds}");
}
