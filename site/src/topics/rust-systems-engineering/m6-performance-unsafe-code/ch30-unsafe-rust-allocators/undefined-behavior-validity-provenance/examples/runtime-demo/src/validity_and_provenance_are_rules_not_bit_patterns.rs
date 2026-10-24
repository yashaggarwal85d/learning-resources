fn is_valid_bool_byte(byte: u8) -> bool {
    byte == 0 || byte == 1
}

fn passes_non_null_and_aligned(addr: usize, align: usize) -> bool {
    addr != 0 && addr % align == 0
}

fn main() {
    let valid_bool_bytes: Vec<u8> = (0u16..=255).map(|b| b as u8).filter(|&b| is_valid_bool_byte(b)).collect();
    let valid_bool_count = valid_bool_bytes.len();
    let total_byte_patterns = 256usize;
    let a_only_two_of_the_256_real_byte_patterns_genuinely_pass_bools_own_validity_rule =
        valid_bool_count == 2 && valid_bool_bytes == vec![0u8, 1u8];

    let candidate_addresses: [usize; 6] = [0, 4, 6, 8, 11, 16];
    let align = 4usize;
    let passing_addresses: Vec<usize> = candidate_addresses
        .iter()
        .copied()
        .filter(|&a| passes_non_null_and_aligned(a, align))
        .collect();
    let b_exactly_three_of_the_six_real_candidate_addresses_genuinely_pass_both_checks =
        passing_addresses == vec![4usize, 8usize, 16usize];

    let backing: Vec<i32> = vec![10, 20, 30, 40, 50];
    let base_ptr: *const i32 = backing.as_ptr();
    let base_addr: usize = base_ptr.addr();
    let element_size = std::mem::size_of::<i32>();
    let target_index = 3usize;
    let shifted_addr = base_addr + target_index * element_size;
    let rebuilt_ptr: *const i32 = base_ptr.with_addr(shifted_addr);
    // SAFETY: `rebuilt_ptr` carries `base_ptr`'s own provenance over `backing`,
    // and `target_index` is within `backing`'s own bounds, so this read stays
    // inside the allocation the provenance was derived from.
    let rebuilt_value = unsafe { *rebuilt_ptr };
    let c_the_real_addr_with_addr_round_trip_genuinely_recovers_the_exact_correct_value =
        rebuilt_value == backing[target_index];

    println!("valid_bool_bytes {:?}", valid_bool_bytes);
    println!("valid_bool_count {}", valid_bool_count);
    println!("total_byte_patterns {}", total_byte_patterns);
    println!("passing_addresses {:?}", passing_addresses);
    println!("base_addr {}", base_addr);
    println!("shifted_addr {}", shifted_addr);
    println!("rebuilt_value {}", rebuilt_value);
    println!(
        "a_only_two_of_the_256_real_byte_patterns_genuinely_pass_bools_own_validity_rule {}",
        a_only_two_of_the_256_real_byte_patterns_genuinely_pass_bools_own_validity_rule
    );
    println!(
        "b_exactly_three_of_the_six_real_candidate_addresses_genuinely_pass_both_checks {}",
        b_exactly_three_of_the_six_real_candidate_addresses_genuinely_pass_both_checks
    );
    println!(
        "c_the_real_addr_with_addr_round_trip_genuinely_recovers_the_exact_correct_value {}",
        c_the_real_addr_with_addr_round_trip_genuinely_recovers_the_exact_correct_value
    );
}
