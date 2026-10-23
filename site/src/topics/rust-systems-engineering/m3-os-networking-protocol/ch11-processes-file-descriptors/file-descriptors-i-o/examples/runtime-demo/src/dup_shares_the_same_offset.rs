use std::fs::File;
use std::io::{Read, Write};
use std::os::fd::{AsRawFd, FromRawFd, OwnedFd};

fn main() {
    let path = std::env::temp_dir().join(format!("fd-io-safety-dup-{}.txt", std::process::id()));
    {
        let mut f = File::create(&path).unwrap();
        f.write_all(b"0123456789").unwrap();
    }
    let mut original = File::open(&path).unwrap();

    // a real dup(2) call: a new fd referring to the same open file description
    let dup_raw = unsafe { libc::dup(original.as_raw_fd()) };
    assert!(dup_raw >= 0, "dup(2) failed");
    let duplicate: OwnedFd = unsafe { OwnedFd::from_raw_fd(dup_raw) };
    let mut duplicate_file = File::from(duplicate);

    let mut first_half = [0u8; 5];
    original.read_exact(&mut first_half).unwrap();

    // the duplicate's read must continue from where the original left off,
    // because both fds share the same open file description's offset
    let mut second_half = [0u8; 5];
    duplicate_file.read_exact(&mut second_half).unwrap();

    println!(
        "{} {}",
        String::from_utf8_lossy(&first_half),
        String::from_utf8_lossy(&second_half)
    );
    assert_eq!(&first_half, b"01234", "the original fd should read the first half");
    assert_eq!(
        &second_half, b"56789",
        "the duplicated fd must continue from the shared offset, not restart at the beginning"
    );

    let _ = std::fs::remove_file(&path);
}
