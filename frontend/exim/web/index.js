import * as exim from "wasm-exim";

const font = new exim.Font(
    2,
    3,
    [[true, false, true, true, true, false]]
);

console.log(exim.serialize(font));
