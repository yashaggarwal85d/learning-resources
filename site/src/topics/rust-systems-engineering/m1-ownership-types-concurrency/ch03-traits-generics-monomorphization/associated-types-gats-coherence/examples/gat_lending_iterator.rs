// A generic associated type: Item is itself generic over a lifetime tied to each call's own &mut
// self borrow, not fixed once for the whole type. Needed for a "lending" iterator whose item
// borrows directly from the iterator, which std::iter::Iterator's plain associated Item cannot do
// (Iterator::Item has no lifetime parameter of its own).
trait LendingIterator {
    type Item<'a>
    where
        Self: 'a;
    fn next(&mut self) -> Option<Self::Item<'_>>;
}

struct ChunkWindows<'buf> {
    buf: &'buf mut [u8],
    pos: usize,
    width: usize,
}

impl<'buf> LendingIterator for ChunkWindows<'buf> {
    type Item<'a> = &'a mut [u8]
    where
        Self: 'a;

    fn next(&mut self) -> Option<Self::Item<'_>> {
        if self.pos + self.width > self.buf.len() {
            return None;
        }
        let slice = &mut self.buf[self.pos..self.pos + self.width];
        self.pos += self.width;
        Some(slice)
    }
}

fn main() {
    let mut data = [0u8, 1, 2, 3, 4, 5];
    let mut windows = ChunkWindows { buf: &mut data, pos: 0, width: 2 };
    let mut total: u32 = 0;
    while let Some(chunk) = windows.next() {
        chunk[0] = chunk[0].wrapping_add(10);
        total += chunk[0] as u32;
    }
    println!("{}", total);
}
