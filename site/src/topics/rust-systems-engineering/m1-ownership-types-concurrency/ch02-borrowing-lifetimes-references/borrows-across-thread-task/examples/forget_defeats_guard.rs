// The primitive fact behind "there is no sound scoped spawn in async": std::mem::forget is
// 100% safe and skips a value's destructor outright. A hypothetical async scope that relies
// on a Drop guard to enforce "wait for every spawned task" can have that guard forgotten by
// completely ordinary safe code, so the guarantee never actually fires.
use std::mem;

struct JoinOnDrop {
    label: &'static str,
}

impl Drop for JoinOnDrop {
    fn drop(&mut self) {
        println!("joined: {}", self.label);
    }
}

fn main() {
    let guard = JoinOnDrop { label: "scoped-task" };
    println!("about to forget the guard, from ordinary safe code");
    mem::forget(guard);
    println!("the guard's Drop never ran: no \"joined\" line was printed above this one");
}
