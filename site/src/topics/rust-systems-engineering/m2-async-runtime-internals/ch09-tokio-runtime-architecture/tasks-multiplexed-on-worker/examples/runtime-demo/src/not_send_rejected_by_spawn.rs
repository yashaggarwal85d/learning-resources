use std::rc::Rc;

#[tokio::main]
async fn main() {
    let data = Rc::new(String::from("x"));
    tokio::spawn(async move {
        println!("{}", data);
    }).await.unwrap();
}
