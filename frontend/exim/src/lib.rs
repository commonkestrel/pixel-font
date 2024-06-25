mod utils;

use wasm_bindgen::prelude::*;
use wasm_bindgen_test::console_log;

#[wasm_bindgen]
extern "C" {
    fn alert(s: &str);
}

#[wasm_bindgen]
#[derive(Debug)]
pub struct Font {
    width: usize,
    height: usize,
    content: Vec<bool>
}

#[wasm_bindgen]
impl Font {
    #[wasm_bindgen(constructor)]
    pub fn new(width: usize, height: usize, content: Vec<js_sys::Boolean>) -> Font {
        let content = content.into_iter().filter_map(|p| p.as_bool()).collect();
        Font {width, height, content}
    }
}

#[wasm_bindgen]
pub fn serialize(font: Font) -> Vec<u8> {
    console_log!("{:?}", font);

    vec![0, 1, 2]
}
