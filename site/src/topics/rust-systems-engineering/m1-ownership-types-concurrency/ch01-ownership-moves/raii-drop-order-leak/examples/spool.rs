#![allow(dead_code, unused_variables)]
use std::fs::{self, File};
use std::path::PathBuf;

struct SpillDir(PathBuf);
impl Drop for SpillDir {
    fn drop(&mut self) {
        let _ = fs::remove_dir(&self.0);       // fails if the directory is not empty
    }
}
struct SpillFile(PathBuf, File);
impl Drop for SpillFile {
    fn drop(&mut self) {
        let _ = fs::remove_file(&self.0);
    }
}

mod bad {
    use super::*;
    struct Spool {
        dir: SpillDir,     // remove_dir in Drop
        spill: SpillFile,  // remove_file in Drop
    }
    pub fn run(dir: SpillDir, spill: SpillFile) {
        drop(Spool { dir, spill });
    }
}
mod good {
    use super::*;
    struct Spool {
        spill: SpillFile,  // remove_file in Drop
        dir: SpillDir,     // remove_dir in Drop
    }
    pub fn run(dir: SpillDir, spill: SpillFile) {
        drop(Spool { spill, dir });
    }
}

fn make(name: &str) -> (SpillDir, SpillFile, PathBuf, PathBuf) {
    let d = std::env::temp_dir().join(format!("{name}-{}", std::process::id()));
    fs::create_dir_all(&d).unwrap();
    let f = d.join("spill.bin");
    let file = File::create(&f).unwrap();
    (SpillDir(d.clone()), SpillFile(f.clone(), file), d, f)
}

fn main() {
    let (dir, spill, d, f) = make("spool-bad");
    bad::run(dir, spill);
    println!("bad: dir exists={} file exists={}", d.exists(), f.exists());
    let _ = fs::remove_dir(&d);

    let (dir, spill, d, f) = make("spool-good");
    good::run(dir, spill);
    println!("good: dir exists={} file exists={}", d.exists(), f.exists());
}
