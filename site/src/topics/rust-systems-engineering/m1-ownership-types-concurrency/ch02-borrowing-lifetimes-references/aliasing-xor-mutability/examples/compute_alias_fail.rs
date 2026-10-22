// What the rule forbids: calling compute with the same place as both input and output. If this compiled, the
// hand-optimization in compute.rs would be unsound (the Nomicon's compute(&x, &mut x) counter-example).
fn compute(input: &u32, output: &mut u32) {
    if *input > 10 {
        *output = 1;
    }
    if *input > 5 {
        *output *= 2;
    }
}

fn main() {
    let mut x: u32 = 20;
    compute(&x, &mut x);
    println!("{x}");
}
