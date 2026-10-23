// Populates the page cache for real with readahead(), confirms real residency via
// mincore(), then calls posix_fadvise(POSIX_FADV_DONTNEED) and measures that the
// same pages are genuinely gone afterward — a hint that, applied, has a real,
// measured effect, not just a documented intention.
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
    let path = std::env::temp_dir().join(format!("fadvise-demo-{}.bin", std::process::id()));
    {
        let mut f = File::create(&path).expect("create backing file");
        f.write_all(&vec![b'x'; SIZE]).expect("write backing file");
    }
    let c_path = CString::new(path.to_str().expect("utf8 path")).expect("no NUL in path");

    let fd = unsafe { libc::open(c_path.as_ptr(), libc::O_RDONLY) };
    assert!(fd >= 0, "open should succeed");
    unsafe {
        libc::fsync(fd);
        let ret = libc::readahead(fd, 0, SIZE);
        assert_eq!(ret, 0, "readahead should succeed: {}", std::io::Error::last_os_error());
    }
    std::thread::sleep(std::time::Duration::from_millis(200));
    let resident_after_readahead = resident_pages(fd);

    let rc = unsafe { libc::posix_fadvise(fd, 0, SIZE as off_t, libc::POSIX_FADV_DONTNEED) };
    assert_eq!(rc, 0, "posix_fadvise should succeed: {}", std::io::Error::last_os_error());
    let resident_after_dontneed = resident_pages(fd);

    unsafe { libc::close(fd) };
    let _ = std::fs::remove_file(&path);

    println!("{resident_after_readahead} {resident_after_dontneed} {N_PAGES}");
}
