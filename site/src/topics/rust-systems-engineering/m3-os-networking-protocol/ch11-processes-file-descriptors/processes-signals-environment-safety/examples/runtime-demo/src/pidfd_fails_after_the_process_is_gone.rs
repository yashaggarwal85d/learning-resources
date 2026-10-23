use std::process::Command;

fn main() {
    let mut child = Command::new("/bin/sh")
        .arg("-c")
        .arg("exit 0")
        .spawn()
        .expect("Command should fork and exec a real child process");
    let pid = child.id() as i32;

    let pidfd = unsafe { libc::syscall(libc::SYS_pidfd_open, pid, 0) } as i32;
    assert!(pidfd >= 0, "pidfd_open should succeed on a real, live child");

    // signal 0 only checks whether a real signal could be delivered, without sending one
    let while_alive = unsafe {
        libc::syscall(libc::SYS_pidfd_send_signal, pidfd, 0, std::ptr::null::<u8>(), 0)
    };

    child.wait().expect("waiting on the real child should succeed"); // reaps it — it's now genuinely gone

    let after_exit = unsafe {
        libc::syscall(libc::SYS_pidfd_send_signal, pidfd, 0, std::ptr::null::<u8>(), 0)
    };
    let errno_after_exit = std::io::Error::last_os_error().raw_os_error().unwrap_or(0);

    unsafe {
        libc::close(pidfd);
    }

    println!("{while_alive} {after_exit} {errno_after_exit}");
    assert_eq!(while_alive, 0, "pidfd_send_signal should succeed while the process is genuinely alive");
    assert_eq!(after_exit, -1, "pidfd_send_signal must fail once the exact process it refers to is gone");
    assert_eq!(errno_after_exit, libc::ESRCH, "the failure must be ESRCH — this exact process, not merely some process, is gone");
}
