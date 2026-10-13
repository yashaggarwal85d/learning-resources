pub struct T(pub u8);
impl Drop for T { fn drop(&mut self) {} }
pub struct Parts { pub head: T, pub body: T }
#[inline(never)] pub fn consume(t: T) { drop(t) }
pub fn maybe(c: bool) {
    let p = Parts { head: T(1), body: T(2) };
    if c { consume(p.body); }
}
