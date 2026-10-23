// Opens a real file with O_DIRECT, the kernel's own page-cache bypass, and
// reads it into two real buffers: one deliberately misaligned, one aligned to
// a safe, portable block boundary (4096 bytes, always a multiple of any real
// filesystem's own logical block size). The misaligned read must fail with
// the kernel's own EINVAL; the aligned one must genuinely succeed.
use libc::c_void;
use std::ffi::CString;
use std::fs::File;
use std::io::Write;
use std::os::unix::io::RawFd;

const ALIGN: usize = 4096;
const FILE_LEN: usize = ALIGN * 4;

fn aligned_buffer(len: usize) -> *mut u8 {
    let mut ptr: *mut c_void = std::ptr::null_mut();
    let rc = unsafe { libc::posix_memalign(&mut ptr, ALIGN, len) };
    assert_eq!(rc, 0, "posix_memalign should succeed");
    ptr as *mut u8
}

fn main() {
    let path = std::env::temp_dir().join(format!("direct-io-align-{}.bin", std::process::id()));
    {
        let mut f = File::create(&path).expect("create backing file");
        let pattern: Vec<u8> = (0..FILE_LEN).map(|i| (i % 251) as u8).collect();
        f.write_all(&pattern).expect("write backing file");
    }

    let c_path = CString::new(path.to_str().expect("utf8 path")).expect("no NUL in path");
    let fd: RawFd = unsafe { libc::open(c_path.as_ptr(), libc::O_RDONLY | libc::O_DIRECT) };
    assert!(
        fd >= 0,
        "open with O_DIRECT should succeed on this filesystem: {}",
        std::io::Error::last_os_error()
    );

    let base = aligned_buffer(ALIGN * 2);
    let misaligned_ptr = unsafe { base.add(1) };
    let misaligned_result = unsafe { libc::pread(fd, misaligned_ptr as *mut c_void, ALIGN, 0) };
    let misaligned_errno = if misaligned_result < 0 {
        std::io::Error::last_os_error().raw_os_error().unwrap_or(0)
    } else {
        0
    };

    let aligned_ptr = aligned_buffer(ALIGN);
    let aligned_result = unsafe { libc::pread(fd, aligned_ptr as *mut c_void, ALIGN, 0) };

    unsafe {
        libc::free(base as *mut c_void);
        libc::free(aligned_ptr as *mut c_void);
        libc::close(fd);
    }
    let _ = std::fs::remove_file(&path);

    println!("{misaligned_result} {misaligned_errno} {aligned_result}");
}
