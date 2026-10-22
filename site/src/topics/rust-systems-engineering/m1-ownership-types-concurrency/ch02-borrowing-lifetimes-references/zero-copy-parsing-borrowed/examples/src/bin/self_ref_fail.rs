// The naive self-referential struct: a String field and a &str field meant to borrow from it,
// built and returned together. This cannot compile in plain Rust: the struct is moved into place
// (and could be moved again later), but a reference baked in at construction time would then
// point at the old, no-longer-there location of the String.
struct Parsed<'a> {
    owner: String,
    view: &'a str,
}

fn build() -> Parsed<'static> {
    let owner = String::from("hello");
    let view = &owner[..];
    Parsed { owner, view }
}

fn main() {
    let p = build();
    println!("{}", p.view);
}
