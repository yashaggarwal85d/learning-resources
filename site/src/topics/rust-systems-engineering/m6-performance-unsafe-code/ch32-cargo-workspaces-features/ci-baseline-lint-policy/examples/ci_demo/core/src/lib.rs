pub fn greet(name: &str) -> String {
    format!("Hello, {name}!")
}

pub fn is_valid_feature_name(name: &str) -> bool {
    !name.is_empty() && name.chars().all(|c| c.is_ascii_lowercase() || c == '_')
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn greet_includes_the_name() {
        assert_eq!(greet("ferris"), "Hello, ferris!");
    }

    #[test]
    fn empty_name_is_not_a_valid_feature_name() {
        assert!(!is_valid_feature_name(""));
    }

    #[test]
    fn a_name_with_a_space_is_not_valid() {
        assert!(!is_valid_feature_name("fast mode"));
    }
}
