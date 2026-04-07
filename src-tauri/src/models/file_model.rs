use serde::{Deserialize, Serialize};

#[derive(Deserialize, Serialize)]
pub struct TreeOption {
    pub path: String,
    pub dir: bool,
    pub date: u64,
    pub size: u64,
}
