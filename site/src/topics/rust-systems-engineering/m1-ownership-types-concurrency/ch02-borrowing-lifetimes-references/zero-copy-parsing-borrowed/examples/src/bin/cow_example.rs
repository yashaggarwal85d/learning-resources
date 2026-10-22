// The std docs' own abs_all example: Cow only clones into an owned Vec when a mutation is
// actually attempted; a read-only pass over the same Cow never copies the underlying slice.
use std::borrow::Cow;

fn abs_all(input: &mut Cow<'_, [i32]>) {
    for i in 0..input.len() {
        let v = input[i];
        if v < 0 {
            // Clones into a vector if not already owned.
            input.to_mut()[i] = -v;
        }
    }
}

fn main() {
    // No clone occurs because `input` doesn't need to be mutated: every value is already >= 0.
    let slice = [0, 1, 2];
    let mut input = Cow::from(&slice[..]);
    abs_all(&mut input);
    assert!(matches!(input, Cow::Borrowed(_)), "a read-only pass must not clone");

    // Clone occurs because `input` needs to be mutated: one value is negative.
    let slice = [-1, 0, 1];
    let mut input = Cow::from(&slice[..]);
    abs_all(&mut input);
    assert!(matches!(input, Cow::Owned(_)), "a mutating pass must clone into an owned Vec");
    assert_eq!(&*input, &[1, 0, 1]);

    println!("borrowed-when-read-only, owned-when-mutated: both confirmed");
}
