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
    content: Vec<Vec<bool>>
}

#[wasm_bindgen]
pub fn create_font(width: usize, height: usize, content: Vec<js_sys::Array>) -> Font {
    let content = content.into_iter().map(|c| c.into_iter().filter_map(|p| p.as_bool()).collect::<Vec<bool>>()).collect();
    Font {width, height, content}
}

#[wasm_bindgen]
pub fn serialize(font: Font) -> Vec<u8> {
    utils::set_panic_hook();
    console_log!("{:?}", font);

    let i_size = font.content.len().checked_ilog2().unwrap_or(0) + 1;
    let y_size = font.height.checked_ilog2().unwrap_or(0) + 1;
    // `x_size` is divided by 8 because we are packing 8 bits into a byte,
    // and x generally works best for this since screens typically scan ltr.
    let x_size = ((font.width.checked_ilog2().unwrap_or(0) + 1) / 8);
    let index_size = i_size + x_size + y_size;

    let mut exp = vec![0x00; 1 << index_size];

    for (c, character) in font.content.into_iter().enumerate() {
        for y in 0..font.height {
            for x in 0..font.width {
                let index = (c << (x_size + y_size)) + (y << x_size) + x/8;
                let bit = x % 8;

                exp[index] |= (character[y*font.width + x] as u8) << bit;
            }
        }
    }

    console_log!("{exp:?}");

    exp
}
