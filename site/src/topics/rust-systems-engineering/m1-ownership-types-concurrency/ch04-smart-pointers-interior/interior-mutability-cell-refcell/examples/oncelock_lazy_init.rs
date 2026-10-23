// OnceCell/OnceLock can be written at most once, after which they're read freely; LazyLock
// computes its value once, from a closure supplied up front, the first time it's touched.
use std::sync::{LazyLock, OnceLock};

static DEFAULT_NAME: OnceLock<String> = OnceLock::new();
static COMPUTED: LazyLock<u32> = LazyLock::new(|| 2 + 2);

fn default_name() -> &'static str {
    DEFAULT_NAME.get_or_init(|| "root".to_string())
}

fn main() {
    let first = default_name();
    let second = default_name();
    println!("{} {} {}", first, second, *COMPUTED);
}
