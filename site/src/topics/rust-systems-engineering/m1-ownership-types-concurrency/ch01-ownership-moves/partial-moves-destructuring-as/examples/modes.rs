#![allow(dead_code, unused_variables, unused_mut)]
include!("pipeline.rs");
use std::any::type_name_of_val as tn;
fn short(s: &str) -> String { s.replace("modes::", "").replace("main::", "") }
fn main() {
    let mut pool = Pool::new();
    let mut frame = Frame { header: Header { kind: 1, len: 0 }, payload: pool.get() };
    match &frame { Frame { header, payload } => println!("&frame: header {} payload {}", short(tn(&header)), short(tn(&payload))) }
    match &mut frame { Frame { header, payload } => println!("&mut frame: header {} payload {}", short(tn(&header)), short(tn(&payload))) }
    let r = &mut frame;
    let rr = &r;
    match rr { Frame { header, payload } => println!("& &mut frame: header {} payload {}", short(tn(&header)), short(tn(&payload))) }
    let Frame { ref payload, .. } = frame;
    println!("ref by value: payload {} frame still whole: {}", short(tn(&payload)), frame.payload.id);
    match frame { Frame { header, payload } => println!("frame: header {} payload {}", short(tn(&header)), short(tn(&payload))) }
    // Option<Buf>
    let mut slot: Option<Buf> = Some(pool.get());
    if let Some(b) = slot.as_ref() { println!("as_ref: {}", short(tn(&b))); }
    if let Some(b) = slot.as_mut() { b.bytes.push(1); println!("as_mut: {}", short(tn(&b))); }
    if let Some(b) = &slot { println!("&slot: {}", short(tn(&b))); }
    if let Some(_) = slot { println!("wildcard: slot still Some = {}", slot.is_some()); }
    if let Some(b) = slot { println!("by value: {}", short(tn(&b))); }
    // array destructuring moves out where indexing can't
    let pair = [pool.get(), pool.get()];
    let [first, second] = pair;
    println!("array destructure ids {} {}", first.id, second.id);
}
