// Compiled with -O --emit=llvm-ir: compute_ref's parameters carry the `noalias` attribute (the checker's guarantee,
// handed to the optimizer); compute_raw's don't, because raw pointers carry no aliasing guarantee of their own.
#[unsafe(no_mangle)]
pub fn compute_ref(input: &u32, output: &mut u32) {
    if *input > 10 {
        *output = 1;
    }
    if *input > 5 {
        *output *= 2;
    }
}

#[unsafe(no_mangle)]
pub fn compute_raw(input: *const u32, output: *mut u32) {
    unsafe {
        if *input > 10 {
            *output = 1;
        }
        if *input > 5 {
            *output *= 2;
        }
    }
}
