use std::collections::HashSet;
use std::sync::Mutex;
use std::sync::OnceLock;

fn live_handles() -> &'static Mutex<HashSet<u32>> {
    static LIVE: OnceLock<Mutex<HashSet<u32>>> = OnceLock::new();
    LIVE.get_or_init(|| Mutex::new(HashSet::new()))
}

static NEXT_HANDLE: Mutex<u32> = Mutex::new(1);

#[unsafe(no_mangle)]
pub extern "C" fn allocate_buffer_handle() -> u32 {
    let mut next = NEXT_HANDLE.lock().unwrap();
    let handle = *next;
    *next += 1;
    live_handles().lock().unwrap().insert(handle);
    handle
}

#[unsafe(no_mangle)]
pub extern "C" fn free_buffer_handle(handle: u32) -> bool {
    live_handles().lock().unwrap().remove(&handle)
}

const STATUS_OK: i32 = 0;
const STATUS_DIVIDE_BY_ZERO: i32 = 1;

#[unsafe(no_mangle)]
pub extern "C" fn checked_divide(numerator: i32, denominator: i32, out: *mut i32) -> i32 {
    if denominator == 0 {
        return STATUS_DIVIDE_BY_ZERO;
    }
    unsafe {
        *out = numerator / denominator;
    }
    STATUS_OK
}

#[unsafe(no_mangle)]
pub unsafe extern "C-unwind" fn run_step(trigger_panic: bool) {
    if trigger_panic {
        panic!("a foreign-visible failure, carried as a defined unwind");
    }
}

fn main() {
    let mut double_free_rejected = false;
    let mut correct_pair_accepted = true;

    for _ in 0..5 {
        let h = allocate_buffer_handle();
        if !free_buffer_handle(h) {
            correct_pair_accepted = false;
        }
        if free_buffer_handle(h) {
            correct_pair_accepted = false;
        } else {
            double_free_rejected = true;
        }
    }
    let leaked_at_end = live_handles().lock().unwrap().len();

    let a_every_correct_allocate_free_pair_is_accepted_exactly_once = correct_pair_accepted;
    let b_a_second_free_on_the_same_handle_is_genuinely_rejected_not_performed = double_free_rejected;
    let c_no_handle_is_ever_left_outstanding_after_its_own_correct_free = leaked_at_end == 0;

    let mut out_value: i32 = -1;
    let ok_status = checked_divide(10, 2, &mut out_value);
    let d_a_genuine_success_writes_the_real_out_value_through_the_status_code_boundary =
        ok_status == STATUS_OK && out_value == 5;

    let mut untouched: i32 = -99;
    let err_status = checked_divide(10, 0, &mut untouched);
    let e_a_genuine_failure_reports_its_own_status_code_and_leaves_the_out_value_untouched =
        err_status == STATUS_DIVIDE_BY_ZERO && untouched == -99;

    let unwind_result = std::panic::catch_unwind(|| unsafe {
        run_step(true);
    });
    let caught_the_panic = unwind_result.is_err();
    let ran_cleanly_afterward = std::panic::catch_unwind(|| unsafe {
        run_step(false);
    })
    .is_ok();
    let f_a_panic_crossing_a_c_unwind_boundary_is_genuinely_caught_and_the_caller_keeps_running =
        caught_the_panic && ran_cleanly_afterward;

    println!(
        "a_every_correct_allocate_free_pair_is_accepted_exactly_once {}",
        a_every_correct_allocate_free_pair_is_accepted_exactly_once
    );
    println!(
        "b_a_second_free_on_the_same_handle_is_genuinely_rejected_not_performed {}",
        b_a_second_free_on_the_same_handle_is_genuinely_rejected_not_performed
    );
    println!(
        "c_no_handle_is_ever_left_outstanding_after_its_own_correct_free {}",
        c_no_handle_is_ever_left_outstanding_after_its_own_correct_free
    );
    println!(
        "d_a_genuine_success_writes_the_real_out_value_through_the_status_code_boundary {}",
        d_a_genuine_success_writes_the_real_out_value_through_the_status_code_boundary
    );
    println!(
        "e_a_genuine_failure_reports_its_own_status_code_and_leaves_the_out_value_untouched {}",
        e_a_genuine_failure_reports_its_own_status_code_and_leaves_the_out_value_untouched
    );
    println!(
        "f_a_panic_crossing_a_c_unwind_boundary_is_genuinely_caught_and_the_caller_keeps_running {}",
        f_a_panic_crossing_a_c_unwind_boundary_is_genuinely_caught_and_the_caller_keeps_running
    );
}
