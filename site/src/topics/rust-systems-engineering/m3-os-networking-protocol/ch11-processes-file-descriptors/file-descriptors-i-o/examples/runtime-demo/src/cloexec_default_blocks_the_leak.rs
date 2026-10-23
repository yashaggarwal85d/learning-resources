use std::ffi::CString;
use std::fs::File;
use std::os::fd::AsRawFd;
use std::process::Command;

fn fd_visible_in_a_real_child(fd: i32) -> bool {
    Command::new("/bin/sh")
        .arg("-c")
        .arg(format!("test -e /proc/self/fd/{fd}"))
        .status()
        .unwrap()
        .success()
}

fn main() {
    let path = std::env::temp_dir().join(format!("fd-io-safety-cloexec-{}.txt", std::process::id()));
    std::fs::write(&path, b"data").unwrap();

    // std::fs::File opens with O_CLOEXEC by default
    let default_file = File::open(&path).unwrap();
    let default_fd = default_file.as_raw_fd();
    let default_flags = unsafe { libc::fcntl(default_fd, libc::F_GETFD) };
    assert!(default_flags >= 0);
    let default_has_cloexec = default_flags & libc::FD_CLOEXEC != 0;

    // open the same file again, raw, then explicitly clear its close-on-exec
    // flag, simulating exactly the leak a missing O_CLOEXEC opens up
    let c_path = CString::new(path.to_str().unwrap()).unwrap();
    let leaked_fd = unsafe { libc::open(c_path.as_ptr(), libc::O_RDONLY) };
    assert!(leaked_fd >= 0);
    let cleared = unsafe { libc::fcntl(leaked_fd, libc::F_SETFD, 0) };
    assert_eq!(cleared, 0);
    let leaked_flags = unsafe { libc::fcntl(leaked_fd, libc::F_GETFD) };
    let leaked_has_cloexec = leaked_flags & libc::FD_CLOEXEC != 0;

    // fork and exec a real child, and check which fd is actually still open inside it
    let default_visible = fd_visible_in_a_real_child(default_fd);
    let leaked_visible = fd_visible_in_a_real_child(leaked_fd);

    println!(
        "{default_has_cloexec} {leaked_has_cloexec} {default_visible} {leaked_visible}"
    );
    assert!(default_has_cloexec, "std::fs::File must open with FD_CLOEXEC set by default");
    assert!(!leaked_has_cloexec, "the explicitly-cleared fd must not have FD_CLOEXEC set");
    assert!(!default_visible, "the default, CLOEXEC-protected fd must not survive into the child");
    assert!(leaked_visible, "the CLOEXEC-cleared fd must leak straight into the child");

    unsafe {
        libc::close(leaked_fd);
    }
    let _ = std::fs::remove_file(&path);
}
