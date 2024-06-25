import * as exim from "wasm-exim";

const font = new exim.Font(
    8,
    16,
    [true, false, true]
);

exim.serialize(font);
