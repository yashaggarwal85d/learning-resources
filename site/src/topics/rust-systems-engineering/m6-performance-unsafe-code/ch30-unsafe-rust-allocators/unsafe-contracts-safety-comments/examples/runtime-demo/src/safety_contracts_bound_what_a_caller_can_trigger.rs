// A real, documented safety contract, a real safe guard that enforces
// it before ever delegating to the real unsafe code, and a real counter
// tracking how many times that unsafe code actually ran, measuring that
// soundness ("no safe caller can trigger UB") genuinely holds: every
// request outside the contract is genuinely rejected before the unsafe
// code ever runs, and every request inside it returns the genuinely
// correct value. This topic never executes a real invalid case, since
// undefined behavior is not something a correct measurement can observe.

use std::cell::Cell;

struct Buffer {
    data: [i32; 8],
    unsafe_call_count: Cell<u64>,
}

impl Buffer {
    /// # Safety
    /// `index` must be less than `self.data.len()`. Calling this with an
    /// out-of-range index is undefined behavior: it reads past the end
    /// of `data` without a bounds check.
    unsafe fn get_unchecked_counted(&self, index: usize) -> i32 {
        self.unsafe_call_count.set(self.unsafe_call_count.get() + 1);
        // SAFETY: every real caller in this file is `get_guarded` below,
        // which has already checked `index < self.data.len()` before
        // ever reaching this line, so the documented contract holds.
        unsafe { *self.data.get_unchecked(index) }
    }

    /// A real safe guard: genuinely enforces `get_unchecked_counted`'s
    /// own documented contract before ever delegating to it, so no safe
    /// caller of `get_guarded` can trigger the unsafe code's own UB.
    fn get_guarded(&self, index: usize) -> Option<i32> {
        if index < self.data.len() {
            // SAFETY: just checked `index < self.data.len()` above.
            Some(unsafe { self.get_unchecked_counted(index) })
        } else {
            None
        }
    }
}

fn main() {
    let buf = Buffer { data: [10, 20, 30, 40, 50, 60, 70, 80], unsafe_call_count: Cell::new(0) };

    let valid_indices = [0usize, 3, 7];
    let invalid_indices = [8usize, 9, 100];

    let valid_results: Vec<Option<i32>> = valid_indices.iter().map(|&i| buf.get_guarded(i)).collect();
    let invalid_results: Vec<Option<i32>> = invalid_indices.iter().map(|&i| buf.get_guarded(i)).collect();

    let a_every_in_contract_call_genuinely_returns_the_correct_value =
        valid_results == vec![Some(10), Some(40), Some(80)];

    let unsafe_calls_after_every_request = buf.unsafe_call_count.get();
    let b_the_guard_genuinely_never_invoked_the_unsafe_function_outside_its_contract =
        unsafe_calls_after_every_request == valid_indices.len() as u64
            && invalid_results.iter().all(|r| r.is_none());

    // ---- A real, safe model of what an unguarded caller's own logic ----
    // ---- would do for the identical invalid inputs, checked directly ----
    // ---- against the real documented contract, without ever actually ----
    // ---- calling the real unsafe function out of contract to find out. ----
    let buffer_len = buf.data.len();
    let c_an_unguarded_caller_would_genuinely_violate_the_documented_contract_for_the_identical_input =
        invalid_indices.iter().all(|&i| i >= buffer_len);

    println!("valid_results {:?}", valid_results);
    println!("invalid_results {:?}", invalid_results);
    println!("unsafe_calls_after_every_request {}", unsafe_calls_after_every_request);
    println!("buffer_len {}", buffer_len);
    println!(
        "a_every_in_contract_call_genuinely_returns_the_correct_value {}",
        a_every_in_contract_call_genuinely_returns_the_correct_value
    );
    println!(
        "b_the_guard_genuinely_never_invoked_the_unsafe_function_outside_its_contract {}",
        b_the_guard_genuinely_never_invoked_the_unsafe_function_outside_its_contract
    );
    println!(
        "c_an_unguarded_caller_would_genuinely_violate_the_documented_contract_for_the_identical_input {}",
        c_an_unguarded_caller_would_genuinely_violate_the_documented_contract_for_the_identical_input
    );
}
