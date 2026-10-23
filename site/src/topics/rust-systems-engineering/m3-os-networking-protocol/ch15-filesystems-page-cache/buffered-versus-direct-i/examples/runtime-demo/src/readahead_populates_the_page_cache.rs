// Calls the real readahead() syscall on a file whose pages have been genuinely
// dropped from the page cache first, then measures real page-residency directly
// via mincore() on a fresh, untouched mapping of the same file — no bytes are
// ever read through that mapping, so any residency it reports comes only from
// what readahead() itself pulled in.
use libc::off_t;
use std::ffi::CString;
use std::fs::File;
use std::io::Write;

const PAGE: usize = 4096;
const N_PAGES: usize = 16;
const SIZE: usize = PAGE * N_PAGES;

fn resident_pages(fd: i32) -> usize {
    unsafe {
        let addr = libc::mmap(std::ptr::null_mut(), SIZE, libc::PROT_READ, libc::MAP_SHARED, fd, 0);
        assert!(addr != libc::MAP_FAILED, "mmap should succeed");
        let mut vec = vec![0u8; N_PAGES];
        let rc = libc::mincore(addr, SIZE, vec.as_mut_ptr());
        assert_eq!(rc, 0, "mincore should succeed: {}", std::io::Error::last_os_error());
        let n = vec.iter().filter(|&&b| b & 1 == 1).count();
        libc::munmap(addr, SIZE);
        n
    }
}

fn main() {
    let path = std::env::temp_dir().join(format!("readahead-demo-{}.bin", std::process::id()));
    {
        let mut f = File::create(&path).expect("create backing file");
        f.write_all(&vec![b'x'; SIZE]).expect("write backing file");
    }
    let c_path = CString::new(path.to_str().expect("utf8 path")).expect("no NUL in path");

    // Drop any pages the write itself left resident, so this starts from a known baseline.
    unsafe {
        let fd = libc::open(c_path.as_ptr(), libc::O_RDONLY);
        libc::fsync(fd);
        libc::posix_fadvise(fd, 0, SIZE as off_t, libc::POSIX_FADV_DONTNEED);
        libc::close(fd);
    }

    let fd = unsafe { libc::open(c_path.as_ptr(), libc::O_RDONLY) };
    assert!(fd >= 0, "open should succeed");
    let before = resident_pages(fd);

    let ret = unsafe { libc::readahead(fd, 0, SIZE) };
    assert_eq!(ret, 0, "readahead should succeed: {}", std::io::Error::last_os_error());
    std::thread::sleep(std::time::Duration::from_millis(200));
    let after = resident_pages(fd);

    unsafe { libc::close(fd) };
    let _ = std::fs::remove_file(&path);

    println!("{before} {after} {N_PAGES}");
}
