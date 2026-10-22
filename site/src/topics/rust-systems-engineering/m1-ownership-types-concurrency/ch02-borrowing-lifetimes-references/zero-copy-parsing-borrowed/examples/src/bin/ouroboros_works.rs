// The same shape self_ref_fail.rs couldn't build, made safe by ouroboros's own macro: it owns the
// String field and hands back a reference tied to the struct's own stable storage instead of to
// a local variable that moves away.
use ouroboros::self_referencing;

#[self_referencing]
struct Parsed {
    owner: String,
    #[borrows(owner)]
    view: &'this str,
}

fn main() {
    let owner = String::from("hello");
    let parsed = ParsedBuilder {
        owner,
        view_builder: |owner: &String| &owner[..],
    }
    .build();
    assert_eq!(*parsed.borrow_view(), "hello");
    println!("{}", parsed.borrow_view());
}
