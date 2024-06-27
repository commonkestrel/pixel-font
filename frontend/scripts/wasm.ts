import init from "./exim/dist/exim";
import * as exim from "./exim/dist/exim";
export * as exim from "./exim/dist/exim";
import wasmData from "./exim/dist/exim_bg.wasm";

export const initWasm = async () => {
    await init(wasmData);
    exim.init_hooks();
}
