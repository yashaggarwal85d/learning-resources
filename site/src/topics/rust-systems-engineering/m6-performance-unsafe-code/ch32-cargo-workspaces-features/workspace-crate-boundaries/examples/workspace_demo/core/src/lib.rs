use once_cell::sync::Lazy;

static GREETING: Lazy<String> = Lazy::new(|| "hello from core".to_string());

pub fn greeting() -> &'static str {
    &GREETING
}
