#![allow(dead_code, unused_variables, unused_mut)]
include!("pipeline.rs");
use std::mem;
fn delta<F: FnOnce()>(f: F) -> (usize, usize) {
    let (a0, d0) = (allocs(), DEALLOCS.load(Relaxed));
    f();
    (allocs() - a0, DEALLOCS.load(Relaxed) - d0)
}
fn main() {
    let mut pool = Pool::new();
    let mut frame = Frame { header: Header { kind: 1, len: 0 }, payload: pool.get() };
    let mut slot: Option<Buf> = Some(pool.get());
    let mut spare = pool.get();
    let mut out_take = None; let mut out_bytes = Vec::new(); let mut out_rep = None; let mut out_opt_rep = None;
    let t = delta(|| { out_take = slot.take(); });
    println!("Option::take: allocs={} deallocs={} slot_is_none={}", t.0, t.1, slot.is_none());
    let cap_before = frame.payload.bytes.capacity();
    let t = delta(|| { out_bytes = mem::take(&mut frame.payload.bytes); });
    println!("mem::take(bytes): allocs={} deallocs={} left_cap={} taken_cap={} before={}", t.0, t.1, frame.payload.bytes.capacity(), out_bytes.capacity(), cap_before);
    let fresh = pool.get();
    let t = delta(|| { out_rep = Some(mem::replace(&mut frame.payload, fresh)); });
    println!("mem::replace(payload, pooled): allocs={} deallocs={}", t.0, t.1);
    let t = delta(|| { mem::swap(&mut frame.payload, &mut spare); });
    println!("mem::swap: allocs={} deallocs={}", t.0, t.1);
    let t = delta(|| { out_opt_rep = slot.replace(Buf { id: 99, bytes: Vec::new() }); });
    println!("Option::replace: allocs={} deallocs={} old_was_none={}", t.0, t.1, out_opt_rep.is_none());
    let t = delta(|| { let r = mem::replace(&mut frame.payload.bytes, Vec::with_capacity(BUF_CAP)); drop(r); });
    println!("mem::replace(bytes, with_capacity): allocs={} deallocs={}", t.0, t.1);
    let mut v = vec![pool.get(), pool.get(), pool.get()];
    let t = delta(|| { let x = v.pop(); let y = v.swap_remove(0); let z = v.remove(0); mem::forget((x, y, z)); });
    println!("pop/swap_remove/remove: allocs={} deallocs={} len={}", t.0, t.1, v.len());
    println!("default Vec cap={} String cap={}", Vec::<u8>::default().capacity(), String::default().capacity());
}
