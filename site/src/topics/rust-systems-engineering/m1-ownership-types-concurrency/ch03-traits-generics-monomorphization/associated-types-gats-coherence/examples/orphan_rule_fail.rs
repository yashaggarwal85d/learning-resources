// The orphan rule: an impl of Trait for Type is only allowed in the crate that defines Trait or the
// crate that defines Type. std::fmt::Display and Vec<u8> are both foreign here, so this impl is
// rejected outright, guaranteeing exactly one impl of any trait for any type exists program-wide.
use std::fmt;

impl fmt::Display for Vec<u8> {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "{:?}", self)
    }
}

fn main() {}
