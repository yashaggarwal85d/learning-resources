#![allow(dead_code, unused_variables, unused_assignments)]
use std::cell::RefCell;
use std::fs::{self, File};
use std::mem;
use std::path::PathBuf;

thread_local! {
    static LOG: RefCell<Vec<&'static str>> = RefCell::new(Vec::new());
}
fn push(name: &'static str) {
    LOG.with(|l| l.borrow_mut().push(name));
}
fn report(label: &str) {
    let v = LOG.with(|l| mem::take(&mut *l.borrow_mut()));
    println!("{label}: {v:?}");
}

struct Trace(&'static str);          // logs its name in Drop
impl Drop for Trace {
    fn drop(&mut self) {
        push(self.0);
    }
}
impl Trace {
    fn some(&self) -> Option<()> {
        Some(())
    }
    fn none(&self) -> Option<()> {
        None
    }
    fn len(&self) -> usize {
        0
    }
}

struct SpillFile {
    path: PathBuf,
    file: File,
}
impl SpillFile {
    fn create(path: PathBuf) -> std::io::Result<SpillFile> {
        let file = File::create(&path)?;
        Ok(SpillFile { path, file })
    }
}
impl Drop for SpillFile {
    fn drop(&mut self) {
        push("spill");
        let _ = fs::remove_file(&self.path);
    }
}
struct Stage {
    name: Trace,
    input: Trace,
    spill: SpillFile,                // closes + unlinks in Drop
}
impl Drop for Stage {
    fn drop(&mut self) {
        push("stage");
    }
}

fn consume(t: Trace) {}
fn params(a: Trace, (b, c): (Trace, Trace)) {
    let d = Trace("d");
}
fn condmove(flag: bool) {
    let t = Trace("cond");
    if flag {
        consume(t);
    }
    let z = Trace("z");
}
fn tail_case() -> usize {
    let local = Trace("local");
    Trace("tail").len()
}

fn main() {
    let dir = std::env::temp_dir();
    let pid = std::process::id();
    {
        let a = Trace("a");
        let b = Trace("b");
        let c = Trace("c");
    }
    report("locals");
    {
        let p = dir.join(format!("raii-trace-{pid}.bin"));
        let s = Stage { name: Trace("name"), input: Trace("input"), spill: SpillFile::create(p).unwrap() };
    }
    report("stage");
    {
        let t = (Trace("t0"), Trace("t1"), Trace("t2"));
    }
    report("tuple");
    {
        let e = [Trace("e0"), Trace("e1"), Trace("e2")];
    }
    report("array");
    {
        let (p, q) = (Trace("p"), Trace("q"));
    }
    report("pattern");
    params(Trace("a"), (Trace("b"), Trace("c")));
    report("params");
    {
        let x = Trace("x");
        let y = Trace("y");
        let x = Trace("x2");
    }
    report("shadow");
    {
        let m = Trace("m");
        let n = Trace("n");
        consume(m);
        drop(n);
    }
    report("memdrop");
    {
        let mut v = Trace("v1");
        v = Trace("v2");
    }
    report("assign");
    {
        let f = Trace("f");
        let _ = Trace("wild");
        let g = Trace("g");
    }
    report("wildcard");
    condmove(false);
    report("condmove");
    condmove(true);
    report("condmove-moved");
    {
        let tm = Trace("tmpmatch");
        match Trace("scrut").len() {
            _ => push("arm"),
        }
        push("after-stmt");
    }
    report("match");
    {
        Trace("stmt-temp").len();
        push("next-stmt");
    }
    report("stmt");
    {
        let r = &Trace("ext");
        push("after-let");
    }
    report("ext");
    {
        let outer = Trace("outer");
        match Trace("guard").none() {
            Some(()) => push("then"),
            _ => push("else"),
        }
        push("after-match");
    }
    report("match-else");
    {
        let outer = Trace("outer");
        if let Some(()) = Trace("guard").some() {
            push("then");
        }
        push("after-if");
    }
    report("then-path");
    tail_case();
    report("tail");
    {
        let outer = Trace("outer");
        if let Some(()) = Trace("guard").none() {
            push("then");
        } else {
            push("else");
        }
        push("after-if");
    }
    report("else-path");
}
