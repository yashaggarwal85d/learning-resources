// Two spellings of one signature: the elided form and the form the three elision rules expand it to.
// One input lifetime, so it is assigned to the elided output (Reference, "Lifetime elision in functions").
fn substr1(s: &str, until: usize) -> &str {
    &s[..until]
}

fn substr2<'a>(s: &'a str, until: usize) -> &'a str {
    &s[..until]
}

fn main() {
    let text = "hello world";
    assert_eq!(substr1(text, 5), substr2(text, 5));
    println!("{}", substr1(text, 5));
}
