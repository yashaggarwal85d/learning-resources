use std::fs;
use std::thread;
use std::time::Duration;

// Reading /proc/<pid>/task from the parent, about a real pid, is a plain file read —
// never anything done from inside a forked, not-yet-exec'd child itself.
fn count_tasks(pid: i32) -> usize {
    fs::read_dir(format!("/proc/{pid}/task")).map(|rd| rd.count()).unwrap_or(0)
}

fn main() {
    // real background threads, running in the parent, before it ever forks
    for _ in 0..4 {
        thread::spawn(|| thread::sleep(Duration::from_secs(2)));
    }
    thread::sleep(Duration::from_millis(50));

    let parent_tasks = count_tasks(std::process::id() as i32);
    assert!(parent_tasks > 1, "the parent should genuinely have more than one thread running");

    let pid = unsafe { libc::fork() };
    assert!(pid >= 0, "fork() failed");
    if pid == 0 {
        // the child: touch nothing inherited, just pause briefly and exit directly
        unsafe {
            libc::usleep(100_000);
            libc::_exit(0);
        }
    }

    // give the child a moment to actually exist, then inspect it from the parent
    thread::sleep(Duration::from_millis(20));
    let child_tasks = count_tasks(pid);

    let mut status = 0;
    unsafe {
        libc::waitpid(pid, &mut status, 0);
    }

    println!("{parent_tasks} {child_tasks}");
    assert!(parent_tasks > 1, "the parent must really have had multiple threads");
    assert_eq!(child_tasks, 1, "a forked child must be created with exactly one thread, no matter how many the parent had");
}
