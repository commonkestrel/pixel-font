mod utils;

use wasm_bindgen::prelude::*;

#[wasm_bindgen]
extern "C" {
    fn alert(s: &str);
}

#[wasm_bindgen]
pub fn serialize(font: Font) -> Vec<u8> {
    alert("Hello, exim!");
}
