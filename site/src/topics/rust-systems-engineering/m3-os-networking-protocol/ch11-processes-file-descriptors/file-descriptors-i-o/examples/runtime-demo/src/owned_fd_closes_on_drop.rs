use std::fs::File;
use std::os::fd::{AsFd, AsRawFd, OwnedFd};

fn main() {
    let path = std::env::temp_dir().join(format!("fd-io-safety-owned-{}.txt", std::process::id()));
    std::fs::write(&path, b"data").unwrap();

    let file_a = File::open(&path).unwrap();
    let file_b = File::open(&path).unwrap();

    // takes real ownership of file_a's fd; dropping this must really close it
    let owned: OwnedFd = file_a.into();
    let raw = owned.as_raw_fd();
    drop(owned);

    // a raw syscall on that exact fd number must now fail: the fd is really gone
    let after_close = unsafe { libc::fcntl(raw, libc::F_GETFD) };
    let errno_after = std::io::Error::last_os_error().raw_os_error().unwrap_or(0);

    // file_b's own fd, only ever borrowed here, must still be completely valid
    let borrowed = file_b.as_fd();
    let still_valid = unsafe { libc::fcntl(borrowed.as_raw_fd(), libc::F_GETFD) };

    println!("{} {} {}", after_close, errno_after, still_valid);
    assert_eq!(after_close, -1, "fcntl on a genuinely closed fd must fail");
    assert_eq!(errno_after, libc::EBADF, "the failure must be EBADF: the fd is really gone, not merely unlucky");
    assert!(still_valid >= 0, "a BorrowedFd taken from a different, still-owned File must remain valid");

    let _ = std::fs::remove_file(&path);
}
