// A blanket impl: implementing a trait for every type satisfying a bound in one declaration,
// exactly the shape of std's own impl<T: Display> ToString for T.
trait Describe {
    fn describe(&self) -> String;
}

impl<T: std::fmt::Debug> Describe for T {
    fn describe(&self) -> String {
        format!("{:?}", self)
    }
}

struct Point {
    x: i32,
    y: i32,
}
impl std::fmt::Debug for Point {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "Point({}, {})", self.x, self.y)
    }
}

fn main() {
    let n = 7;
    let p = Point { x: 1, y: 2 };
    println!("{} {}", n.describe(), p.describe());
}
