#![allow(dead_code, unused_variables, unused_mut)]
include!("pipeline.rs");
enum Stage { Empty, Full(Buf), Done(Buf) }
impl Stage {
    fn advance(&mut self) {
        *self = match *self {            // E0507: the payload cannot leave the old variant through `&mut self`
            Stage::Full(buf) => Stage::Done(buf),
            other => other,
        };
    }
}
fn main() {}
