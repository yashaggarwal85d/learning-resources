// Without UnsafeCell, there is no legal way to mutate through &self at all: the compiler simply
// refuses it as an ordinary borrow-check error, before undefined behavior ever enters the
// picture.
struct Counter {
    value: u32,
}

impl Counter {
    fn increment(&self) {
        self.value += 1;
    }
}

fn main() {
    let counter = Counter { value: 0 };
    counter.increment();
}
