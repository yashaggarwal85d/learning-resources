#![allow(dead_code, unused_variables)]
use std::fs::{self, File};
use std::mem::{size_of, ManuallyDrop};
use std::path::PathBuf;
use std::sync::atomic::{AtomicUsize, Ordering::Relaxed};

static CLOSES: AtomicUsize = AtomicUsize::new(0);

struct SpillFile { path: PathBuf, file: File }
impl Drop for SpillFile {
    fn drop(&mut self) {
        let _ = fs::remove_file(&self.path);
        CLOSES.fetch_add(1, Relaxed);
    }   // then drop glue closes `file`
}
impl SpillFile {
    fn create(path: PathBuf) -> std::io::Result<SpillFile> {
        let file = File::create(&path)?;
        Ok(SpillFile { path, file })
    }
}
fn pass(s: SpillFile) -> SpillFile { s }

fn main() -> std::io::Result<()> {
    let p = std::env::temp_dir().join(format!("raii-spill-{}.bin", std::process::id()));
    {
        let s = pass(pass(SpillFile::create(p.clone())?));
        println!("inside: closes={} exists={}", CLOSES.load(Relaxed), p.exists());
    }
    println!("closes={} exists={}", CLOSES.load(Relaxed), p.exists());
    println!("size_file={} size_pathbuf={} size_spill={} size_md={}", size_of::<File>(), size_of::<PathBuf>(), size_of::<SpillFile>(), size_of::<ManuallyDrop<SpillFile>>());
    Ok(())
}
