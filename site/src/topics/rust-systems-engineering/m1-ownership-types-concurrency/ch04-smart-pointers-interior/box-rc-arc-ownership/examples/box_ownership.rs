// Box<T>: still single ownership, exactly like an unboxed value, just allocated on the heap. One
// parent owns its child outright; moving the parent moves the whole subtree with it.
struct Node {
    text: &'static str,
    child: Option<Box<Node>>,
}

fn main() {
    let leaf = Node { text: "leaf", child: None };
    let root = Node { text: "root", child: Some(Box::new(leaf)) };
    let moved = root; // ownership moves whole, child included
    println!("{} {}", moved.text, moved.child.unwrap().text);
}
