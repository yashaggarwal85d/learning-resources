// Reads one real file through the normal buffered path and a second, identical
// file through a real O_DIRECT open, and measures via mincore() that the buffered
// read populates the page cache while the O_DIRECT read genuinely never does.
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

fn aligned_buffer(len: usize) -> *mut u8 {
    let mut ptr: *mut libc::c_void = std::ptr::null_mut();
    let rc = unsafe { libc::posix_memalign(&mut ptr, PAGE, len) };
    assert_eq!(rc, 0, "posix_memalign should succeed");
    ptr as *mut u8
}

fn fresh_file(path: &std::path::Path) -> CString {
    let mut f = File::create(path).expect("create backing file");
    f.write_all(&vec![b'x'; SIZE]).expect("write backing file");
    drop(f);
    let c_path = CString::new(path.to_str().expect("utf8 path")).expect("no NUL in path");
    unsafe {
        let fd = libc::open(c_path.as_ptr(), libc::O_RDONLY);
        libc::fsync(fd);
        libc::posix_fadvise(fd, 0, SIZE as off_t, libc::POSIX_FADV_DONTNEED);
        libc::close(fd);
    }
    c_path
}

fn main() {
    let pid = std::process::id();
    let buf_path = std::env::temp_dir().join(format!("direct-vs-buffered-buffered-{pid}.bin"));
    let dio_path = std::env::temp_dir().join(format!("direct-vs-buffered-direct-{pid}.bin"));

    let buf_c_path = fresh_file(&buf_path);
    let buf_fd = unsafe { libc::open(buf_c_path.as_ptr(), libc::O_RDONLY) };
    assert!(buf_fd >= 0, "open should succeed");
    let mut buf = vec![0u8; SIZE];
    let n = unsafe { libc::read(buf_fd, buf.as_mut_ptr() as *mut libc::c_void, SIZE) };
    assert_eq!(n as usize, SIZE, "buffered read should read the whole file");
    let buffered_resident = resident_pages(buf_fd);
    unsafe { libc::close(buf_fd) };

    let dio_c_path = fresh_file(&dio_path);
    let dio_fd = unsafe { libc::open(dio_c_path.as_ptr(), libc::O_RDONLY | libc::O_DIRECT) };
    assert!(dio_fd >= 0, "O_DIRECT open should succeed: {}", std::io::Error::last_os_error());
    let aligned = aligned_buffer(SIZE);
    let n = unsafe { libc::pread(dio_fd, aligned as *mut libc::c_void, SIZE, 0) };
    assert_eq!(n as usize, SIZE, "O_DIRECT read should read the whole file: {}", std::io::Error::last_os_error());
    let direct_resident = resident_pages(dio_fd);
    unsafe {
        libc::free(aligned as *mut libc::c_void);
        libc::close(dio_fd);
    }

    let _ = std::fs::remove_file(&buf_path);
    let _ = std::fs::remove_file(&dio_path);

    println!("{buffered_resident} {direct_resident} {N_PAGES}");
}
