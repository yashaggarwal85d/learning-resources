// bytes::Bytes escapes exactly the scope a plain &[u8] cannot (owned_vs_borrowed_fail.rs): the
// function owns a Vec<u8>, converts it once into a Bytes, and can hand that out freely, because
// Bytes owns a reference-counted handle to the data rather than borrowing someone else's slice.
use bytes::Bytes;

fn make_and_share() -> Bytes {
    let owned: Vec<u8> = vec![b'H', b'i', b'!'];
    Bytes::from(owned)
}

fn main() {
    let a = make_and_share();
    // Cloning a Bytes is cheap: it bumps a reference count, it does not copy the three bytes.
    let b = a.clone();
    assert_eq!(a, b);
    assert_eq!(a.as_ptr(), b.as_ptr(), "a clone shares the same underlying memory");

    // Slicing is also a cheap, non-copying view into the same shared memory.
    let whole = Bytes::from_static(b"Hello world");
    let hello = whole.slice(0..5);
    assert_eq!(hello, "Hello");
    assert_eq!(hello.as_ptr(), whole.as_ptr(), "a slice points into the same shared memory");

    println!("shared, cheaply cloned, cheaply sliced: {:?} {:?}", a, hello);
}
