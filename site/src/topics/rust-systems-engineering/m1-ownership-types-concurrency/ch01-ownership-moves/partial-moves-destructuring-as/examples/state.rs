#![allow(dead_code, unused_variables, unused_mut)]
include!("pipeline.rs");
use std::mem;
// A state machine advanced through `&mut self`: the owned payload leaves the old variant by value.
enum Stage { Empty, Full(Buf), Done(Buf) }
impl Stage {
    fn advance(&mut self) {
        *self = match mem::replace(self, Stage::Empty) {
            Stage::Full(buf) => Stage::Done(buf),
            other => other,
        };
    }
    fn tag(&self) -> &'static str { match self { Stage::Empty => "Empty", Stage::Full(_) => "Full", Stage::Done(_) => "Done" } }
}
// let ... else: a pattern place where ownership changes hands.
fn hand_out(slot: &mut Option<Buf>) -> Option<u32> {
    let Some(buf) = slot.take() else { return None; };
    Some(buf.id)
}
fn main() {
    let mut pool = Pool::new();
    let mut stage = Stage::Full(pool.get());
    let (a0, d0) = (allocs(), DEALLOCS.load(Relaxed));
    let before = stage.tag();
    stage.advance();
    let after = stage.tag();
    stage.advance();
    let (a1, d1) = (allocs(), DEALLOCS.load(Relaxed));
    println!("stage: {before} -> {after} -> {} allocs={} deallocs={}", stage.tag(), a1 - a0, d1 - d0);
    let mut slot = Some(pool.get());
    let first = hand_out(&mut slot);
    let second = hand_out(&mut slot);
    println!("let-else: first={first:?} second={second:?} slot_is_none={}", slot.is_none());
    println!("sizes: Vec<u8>={} Buf={} id={}", mem::size_of::<Vec<u8>>(), mem::size_of::<Buf>(), mem::size_of::<u32>());
}
