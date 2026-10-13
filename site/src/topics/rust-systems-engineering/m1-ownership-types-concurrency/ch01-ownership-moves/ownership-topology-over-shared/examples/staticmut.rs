static mut FREE_BUFFERS: u32 = 0;
fn main() {
    unsafe { FREE_BUFFERS += 1; }
    let r = unsafe { &FREE_BUFFERS };
    println!("{r}");
}
