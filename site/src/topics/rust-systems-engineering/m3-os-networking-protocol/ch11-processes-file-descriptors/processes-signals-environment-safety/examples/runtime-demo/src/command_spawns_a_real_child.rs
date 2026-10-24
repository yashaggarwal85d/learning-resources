use std::process::Command;

fn main() {
    let my_pid = std::process::id();

    let mut child = Command::new("/bin/sh")
        .arg("-c")
        .arg("exit 7")
        .spawn()
        .expect("Command should fork and exec a real child process");
    let child_pid = child.id();

    let status = child.wait().expect("waiting on the real child should succeed");

    println!("{} {} {}", my_pid != child_pid, status.code().unwrap(), child_pid);
    assert_ne!(my_pid, child_pid, "a spawned child must be a genuinely separate process, with its own pid");
    assert_eq!(status.code(), Some(7), "the child's real exit code must be observed exactly");
}
