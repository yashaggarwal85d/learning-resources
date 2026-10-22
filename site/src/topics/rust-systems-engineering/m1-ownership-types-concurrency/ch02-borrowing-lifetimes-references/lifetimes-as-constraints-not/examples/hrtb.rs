// The Nomicon's own example: `func`'s lifetime can't be named until call() runs, because &self's lifetime
// isn't fixed. `for<'a> F: Fn(&'a (u8, u16)) -> &'a u8` ("for all choices of 'a") is what the elided
// `where F: Fn(&(u8, u16)) -> &u8` really desugars to.
struct Closure<F> {
    data: (u8, u16),
    func: F,
}

impl<F> Closure<F>
where
    F: Fn(&(u8, u16)) -> &u8,
{
    fn call(&self) -> &u8 {
        (self.func)(&self.data)
    }
}

fn do_it(data: &(u8, u16)) -> &u8 {
    &data.0
}

fn main() {
    let clo = Closure { data: (0, 1), func: do_it };
    println!("{}", clo.call());
}
