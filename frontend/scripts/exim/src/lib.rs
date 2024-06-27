use std::io::Write;

mod utils;

use js_sys::{Array, Number};
use wasm_bindgen::prelude::*;
use wasm_bindgen_test::console_log;

#[wasm_bindgen]
#[derive(Debug)]
pub struct Font {
    width: usize,
    height: usize,
    content: Vec<Vec<bool>>
}

#[wasm_bindgen]
impl Font {
    pub fn get_width(&self) -> usize {
        self.width
    }

    pub fn get_height(&self) -> usize {
        self.height
    }

    pub fn get_content(&self) -> Vec<Array> {
        self.content.iter().map(|c| c.iter().map(|pixel| JsValue::from_bool(*pixel)).collect::<Array>()).collect()
    }
}

#[wasm_bindgen]
pub fn init_hooks() {
    utils::set_panic_hook();
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

    let i_size = (font.content.len() - 1).checked_ilog2().unwrap_or(0) + 1;
    let y_size = (font.height - 1).checked_ilog2().unwrap_or(0) + 1;
    // `x_size` is divided by 8 because we are packing 8 bits into a byte,
    // and x generally works best for this since screens typically scan ltr.
    let x_size = ((font.width - 1) / 8).checked_ilog2().unwrap_or(0);
    let index_size = i_size + x_size + y_size;

    let mut exp = vec![0x00; 1 << index_size];

    for (c, character) in font.content.into_iter().enumerate() {
        for y in 0..font.height {
            for x in 0..font.width {
                let index = (c << (x_size + y_size)) + (y << x_size) + x/8;
                // We subtract from 7 to flip correct the bit order, since otherwise we flip to bit-endian
                let bit = 7 - (x % 8);

                exp[index] |= (character[y*font.width + x] as u8) << bit;
            }
        }
    }

    console_log!("{exp:?}");

    exp
}

fn deserialize(char_size: usize, stream: &[u8]) -> Vec<Vec<bool>> {
    // Multiplying (and dividing `char_size` later) by 8 since they are packed into u8's
    let mut content = Vec::with_capacity(8 * stream.len() / char_size);

    for character in stream.chunks_exact(char_size / 8) {
        let mut char_content = Vec::with_capacity(char_size);

        for i in 0..char_size / 8 {
            let byte = character[i];
            for bit in 0..8 {
                // We do `7-bit` here to correct the reverse ordering
                let mask = 1 << (7-bit);
                let value = (byte & mask) != 0;
                char_content.push(value);
            }
        }

        content.push(char_content);
    }

    content
}

#[wasm_bindgen]
pub fn export(font: Font) -> Vec<u8> {
    let width = font.width as u64;
    let height = font.height as u64;

    let mut content: Vec<u8> = font.content.iter().flat_map(|character| character.chunks_exact(8).map(|bits| {
        let mut byte: u8 = 0;

        for bit in 0..8 {
            byte |= if bits[7-bit] { 1 } else { 0 } << bit
        }

        byte
    })).collect();

    let width_arr = width.to_le_bytes();
    let height_arr = height.to_le_bytes();
    let _ = content.write_all(&width_arr);
    let _ = content.write_all(&height_arr);

    content
}

#[wasm_bindgen]
pub fn import(stream: &[u8]) -> Font {
    if stream.len() < 16 {
        panic!("missing dimensions in stream");
    }

    let mut height_arr: [u8; 8] = Default::default();
    height_arr.copy_from_slice(&stream[stream.len()-8..stream.len()]);
    let height = u64::from_le_bytes(height_arr) as usize;

    let mut width_arr: [u8; 8] = Default::default();
    width_arr.copy_from_slice(&stream[stream.len()-16..stream.len()-8]);
    let width = u64::from_le_bytes(width_arr) as usize;

    let content = deserialize(height*width, &stream[0..stream.len()-16]);


    Font {
        width,
        height,
        content
    }
}

#[wasm_bindgen]
pub enum ImportError {
    MismatchedSize,
    MissingDimensions,
}
