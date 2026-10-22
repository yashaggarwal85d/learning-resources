// RFC 2025's own counter-example: a borrow created during the reservation and used *after* the call still spans
// the activation point, so it is rejected. A reservation is not a blanket exemption from the aliasing rule.
fn borrow_first(x: &Vec<i32>) -> &i32 {
    &x[0]
}

fn main() {
    let mut v = vec![0, 1, 2];
    let p;
    v.push({
        p = borrow_first(&v);
        3
    });
    println!("{}", *p);
}
