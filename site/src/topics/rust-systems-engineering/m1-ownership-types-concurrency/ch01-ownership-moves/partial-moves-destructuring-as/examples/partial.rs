#![allow(dead_code, unused_variables, unused_assignments)]
include!("pipeline.rs");
struct Parts { head: Trace, body: Trace, tail: Trace }
fn main() {
    // 1. partial move, remaining fields dropped at scope end
    {
        let p = Parts { head: Trace("head"), body: Trace("body"), tail: Trace("tail") };
        let body = p.body;
        push("moved");
    }
    report("partial");
    // 2. moved field dropped early
    {
        let p = Parts { head: Trace("head"), body: Trace("body"), tail: Trace("tail") };
        drop(p.body);
        push("after-drop");
    }
    report("early");
    // 3. reassign makes whole
    {
        let mut p = Parts { head: Trace("head"), body: Trace("body"), tail: Trace("tail") };
        let b = p.body;
        p.body = Trace("body2");
        let whole = p;          // usable as a whole again
        push("whole");
    }
    report("reinit");
    // 4. destructuring
    {
        let p = Parts { head: Trace("head"), body: Trace("body"), tail: Trace("tail") };
        let Parts { head, body, .. } = p;
        push("destructured");
    }
    report("destructure");
    // 5. Frame with allocator
    let mut pool = Pool::new();
    let msg = message(7, 261);
    let mut buf = pool.get();
    fill(&mut buf, &msg);
    let header = inspect(&buf);
    let frame = Frame { header, payload: buf };
    let d0 = DEALLOCS.load(Relaxed);
    let payload = frame.payload;               // partial move
    let h = frame.header;                      // Copy field still readable
    println!("frame: header={:?} payload.len={} id={}", h, payload.bytes.len(), payload.id);
    let d1 = DEALLOCS.load(Relaxed);
    drop(payload);
    let d2 = DEALLOCS.load(Relaxed);
    println!("frame deallocs: at move={} at drop(payload)={}", d1 - d0, d2 - d1);
    // 6. Box: move out of *b and a field out of Box<Frame>
    let mut pool2 = Pool::new();
    let a0 = allocs(); let dd0 = DEALLOCS.load(Relaxed);
    let bx = Box::new(Frame { header, payload: pool2.get() });
    let a1 = allocs();
    let f = *bx;                                      // move out of the box
    let dd1 = DEALLOCS.load(Relaxed);
    println!("box: allocs for Box::new+get={} deallocs right after *bx={}", a1 - a0, dd1 - dd0);
    let bx2 = Box::new(Frame { header, payload: pool2.get() });
    let p2 = bx2.payload;                              // field out of Box<Frame>
    println!("box field move ok id={}", p2.id);
}
