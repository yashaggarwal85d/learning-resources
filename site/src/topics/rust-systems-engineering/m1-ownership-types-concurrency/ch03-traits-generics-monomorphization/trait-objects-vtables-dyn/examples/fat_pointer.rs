// A reference or Box to a concrete type is one word: just the data pointer. A reference or Box to
// a dyn Trait value is two words: the data pointer plus a pointer to the trait's vtable (the Reference's
// own wording for this topic's main claim).
trait Codec {
    fn encode(&self) -> u8;
}

struct A;
impl Codec for A {
    fn encode(&self) -> u8 {
        1
    }
}

fn main() {
    let word = std::mem::size_of::<usize>();
    let thin_ref = std::mem::size_of::<&A>();
    let fat_ref = std::mem::size_of::<&dyn Codec>();
    let thin_box = std::mem::size_of::<Box<A>>();
    let fat_box = std::mem::size_of::<Box<dyn Codec>>();
    println!("{} {} {} {} {}", word, thin_ref, fat_ref, thin_box, fat_box);
}
