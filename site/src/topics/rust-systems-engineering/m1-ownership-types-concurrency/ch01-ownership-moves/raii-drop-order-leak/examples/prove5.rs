#![allow(dead_code)]
use std::fs::{self, File};
use std::io::Write;
use std::path::PathBuf;

struct SpillFile {
    path: PathBuf,
    file: File,
}
impl Drop for SpillFile {
    fn drop(&mut self) {
        let _ = fs::remove_file(&self.path);
    }
}
struct Trailer {
    dir: PathBuf,
}
impl Drop for Trailer {
    fn drop(&mut self) {
        let r = File::create(self.dir.join("trailer.bin")).and_then(|mut f| f.write_all(b"END"));
        println!("trailer write is_err={}", r.is_err());
    }
}
struct SpillDir(PathBuf);
impl Drop for SpillDir {
    fn drop(&mut self) {
        let _ = fs::remove_dir_all(&self.0);
    }
}

// Bug: the directory guard is declared first, so it drops first; the trailer then has no directory.
struct Bad {
    dir: SpillDir,
    trailer: Trailer,
}
// Fix: a field that must outlive another is declared after it.
struct Good {
    trailer: Trailer,
    dir: SpillDir,
}

fn main() {
    let base = std::env::temp_dir().join(format!("raii-p5-{}", std::process::id()));
    let d1 = base.join("bad");
    fs::create_dir_all(&d1).unwrap();
    drop(Bad { dir: SpillDir(d1.clone()), trailer: Trailer { dir: d1.clone() } });
    let d2 = base.join("good");
    fs::create_dir_all(&d2).unwrap();
    drop(Good { trailer: Trailer { dir: d2.clone() }, dir: SpillDir(d2.clone()) });
    let _ = fs::remove_dir_all(&base);
}
