struct Noisy(&'static str);
impl Drop for Noisy {
    fn drop(&mut self) {
        println!("drop {}", self.0);
    }
}

fn main() {
    let mode = std::env::args().nth(1).unwrap_or_default();
    let a = Noisy("a");
    let b = Noisy("b");
    match mode.as_str() {
        "panic" => panic!("boom"),
        "exit" => std::process::exit(3),
        "dtorpanic" => {
            struct Bad;
            impl Drop for Bad {
                fn drop(&mut self) {
                    panic!("second");
                }
            }
            let _bad = Bad;
            panic!("first");
        }
        _ => println!("end of main"),
    }
}
