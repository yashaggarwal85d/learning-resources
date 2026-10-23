// Maps a real file, touches every page so the kernel's page cache genuinely
// holds it resident, then reads the same file through a normal `read` into a
// separate, hand-built application-level cache — and measures, from
// /proc/self/smaps and /proc/self/status, that both copies are resident in
// memory at the same time: the double-caching problem, measured, not assumed.
use memmap2::Mmap;
use std::fs::{self, File};
use std::io::Write;

const FILE_LEN: usize = 8 * 1024 * 1024;

fn vmrss_kb() -> u64 {
    let status = fs::read_to_string("/proc/self/status").expect("read /proc/self/status");
    for line in status.lines() {
        if let Some(rest) = line.strip_prefix("VmRSS:") {
            let digits: String = rest.chars().filter(|c| c.is_ascii_digit()).collect();
            return digits.parse().expect("VmRSS value");
        }
    }
    panic!("no VmRSS line in /proc/self/status");
}

fn mapped_rss_kb(addr: usize) -> u64 {
    let smaps = fs::read_to_string("/proc/self/smaps").expect("read /proc/self/smaps");
    let mut lines = smaps.lines();
    while let Some(header) = lines.next() {
        let Some(range) = header.split_whitespace().next() else { continue };
        let Some((start_hex, end_hex)) = range.split_once('-') else { continue };
        let Ok(start) = usize::from_str_radix(start_hex, 16) else { continue };
        let Ok(end) = usize::from_str_radix(end_hex, 16) else { continue };
        if addr < start || addr >= end {
            continue;
        }
        for field in lines.by_ref() {
            if let Some(rest) = field.strip_prefix("Rss:") {
                let digits: String = rest.chars().filter(|c| c.is_ascii_digit()).collect();
                return digits.parse().expect("Rss value");
            }
            if field.contains('-') && field.contains(' ') {
                break;
            }
        }
    }
    panic!("no smaps entry covers address {addr:#x}");
}

fn main() {
    let path = std::env::temp_dir().join(format!("mmap-double-cache-{}.bin", std::process::id()));
    {
        let mut f = File::create(&path).expect("create backing file");
        let pattern: Vec<u8> = (0..FILE_LEN).map(|i| (i % 251) as u8).collect();
        f.write_all(&pattern).expect("write backing file");
    }

    let file = File::open(&path).expect("open backing file");
    let map = unsafe { Mmap::map(&file).expect("mmap the file") };
    let mut checksum: u64 = 0;
    for &byte in map.iter() {
        checksum = checksum.wrapping_add(byte as u64);
    }
    std::hint::black_box(checksum);

    let mapped_rss = mapped_rss_kb(map.as_ptr() as usize);

    let rss_before_app_cache = vmrss_kb();
    let app_cache: Vec<u8> = fs::read(&path).expect("read the same file into an app-level cache");
    let mut app_checksum: u64 = 0;
    for &byte in &app_cache {
        app_checksum = app_checksum.wrapping_add(byte as u64);
    }
    std::hint::black_box(app_checksum);
    let rss_after_app_cache = vmrss_kb();

    let _ = fs::remove_file(&path);

    println!(
        "{} {} {}",
        mapped_rss,
        rss_after_app_cache.saturating_sub(rss_before_app_cache),
        FILE_LEN / 1024
    );
}
