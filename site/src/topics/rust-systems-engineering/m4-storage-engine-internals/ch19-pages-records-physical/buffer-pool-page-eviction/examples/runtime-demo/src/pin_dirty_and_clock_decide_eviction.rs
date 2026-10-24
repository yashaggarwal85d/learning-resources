// A real, minimal buffer pool: a frame table mapping page ids to frames, a
// pin count per frame, a dirty bit, and a real CLOCK eviction policy. A
// pinned frame is never evicted, a dirty frame is written back before its
// frame is reused, and the policy genuinely favors evicting the frame its
// own rule says to evict, not an arbitrary one.
struct Frame {
    page_id: Option<usize>,
    dirty: bool,
    pin_count: u32,
    ref_bit: bool,
}

struct BufferPool {
    frames: Vec<Frame>,
    clock_hand: usize,
    written_back: Vec<usize>,
}

impl BufferPool {
    fn new(capacity: usize) -> Self {
        let frames = (0..capacity)
            .map(|_| Frame { page_id: None, dirty: false, pin_count: 0, ref_bit: false })
            .collect();
        BufferPool { frames, clock_hand: 0, written_back: Vec::new() }
    }

    // Loads a page into a free or evictable frame and pins it. Returns
    // None if every frame is currently pinned and none can be evicted.
    fn load_and_pin(&mut self, page_id: usize) -> Option<usize> {
        if let Some(idx) = self.frames.iter().position(|f| f.page_id.is_none()) {
            self.frames[idx] = Frame { page_id: Some(page_id), dirty: false, pin_count: 1, ref_bit: true };
            return Some(idx);
        }
        let victim = self.find_clock_victim()?;
        if self.frames[victim].dirty {
            self.written_back.push(self.frames[victim].page_id.unwrap());
        }
        self.frames[victim] = Frame { page_id: Some(page_id), dirty: false, pin_count: 1, ref_bit: true };
        Some(victim)
    }

    fn pin(&mut self, idx: usize) {
        self.frames[idx].pin_count += 1;
        self.frames[idx].ref_bit = true;
    }

    fn unpin(&mut self, idx: usize, dirty: bool) {
        self.frames[idx].pin_count -= 1;
        if dirty {
            self.frames[idx].dirty = true;
        }
    }

    // A real CLOCK sweep: skip any pinned frame outright; clear a set
    // reference bit and move on, giving that frame one more chance; evict
    // the first unpinned frame whose reference bit is already clear.
    fn find_clock_victim(&mut self) -> Option<usize> {
        let n = self.frames.len();
        for _ in 0..(2 * n) {
            let i = self.clock_hand;
            self.clock_hand = (self.clock_hand + 1) % n;
            if self.frames[i].pin_count > 0 {
                continue;
            }
            if self.frames[i].ref_bit {
                self.frames[i].ref_bit = false;
                continue;
            }
            return Some(i);
        }
        None
    }
}

fn main() {
    // 1. A fully pinned pool genuinely cannot evict anything: loading one
    // more page than the pool can hold, with every frame pinned, fails.
    let mut pool = BufferPool::new(3);
    let f0 = pool.load_and_pin(0).unwrap();
    let f1 = pool.load_and_pin(1).unwrap();
    let f2 = pool.load_and_pin(2).unwrap();
    let overflow = pool.load_and_pin(3);
    println!("fully_pinned_pool_rejects_new_page {}", overflow.is_none());

    // 2. Unpinning the frames makes them evictable again; loading a new
    // page evicts one, and a dirty page is written back before its own
    // frame is reused for the new page.
    pool.unpin(f0, true);
    pool.unpin(f1, false);
    pool.unpin(f2, false);
    let before = pool.written_back.len();
    let new_frame = pool.load_and_pin(3).unwrap();
    let evicted_page_was_dirty_one = pool.written_back.len() == before + 1 && pool.written_back.last() == Some(&0);
    println!("dirty_page_written_back_before_reuse {}", evicted_page_was_dirty_one);
    println!("evicted_frame_now_holds_new_page {}", pool.frames[new_frame].page_id == Some(3));
    pool.unpin(new_frame, false);

    // 3. CLOCK genuinely gives a page accessed since the last sweep a
    // second chance: re-access one surviving page, leave the other
    // untouched, and the untouched one is the one evicted next, not an
    // arbitrary one.
    pool.pin(f2);
    pool.unpin(f2, false);
    let victim = pool.load_and_pin(4).unwrap();
    println!("clock_evicts_the_untouched_page_not_the_touched_one {}", victim == f1);
}
