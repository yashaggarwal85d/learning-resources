// The Nomicon's optimization example. compute() is the function as written; compute_opt() is the hand-optimized
// version the Nomicon says is sound only because &u32 and &mut u32 can never alias. We run both over many inputs
// and assert they always agree, which is the *point*: the rule lets the compiler treat them as interchangeable.
pub fn compute(input: &u32, output: &mut u32) {
    if *input > 10 {
        *output = 1;
    }
    if *input > 5 {
        *output *= 2;
    }
}

pub fn compute_opt(input: &u32, output: &mut u32) {
    let cached_input = *input;
    if cached_input > 10 {
        *output = 2;
    } else if cached_input > 5 {
        *output *= 2;
    }
}

fn main() {
    for input in 0u32..=20 {
        for start in [0u32, 1, 3, 7, 9] {
            let mut a = start;
            let mut b = start;
            compute(&input, &mut a);
            compute_opt(&input, &mut b);
            assert_eq!(a, b, "input={input} start={start}");
            println!("{input} {start} {a}");
        }
    }
}
