import * as wasm from "./wasm";
const exim = wasm.exim;

const SAVE_ID: string = "save-button";
const HIDDEN_CLASS: string = "hidden";
const HEADER_BUTTON_CLASS = "header-button";

interface Font {
    height: number,
    width: number,
    content: boolean[][],
}

let currentFont: Font | null = null;
let currentCharacter: number = 0;

let dragCurrent: [number, number] = [-1, -1];
let dragValue: boolean = false;
let mouseDown: boolean = false;

let resizeTimer: ReturnType<typeof setTimeout>;

window.addEventListener("resize", () => {
    document.body.classList.add("resize-anim-stop");
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
        document.body.classList.remove("resize-anim-stop");
    }, 250);
})

document.addEventListener("DOMContentLoaded", () => {
    wasm.initWasm();

    document.getElementById("save-expand")?.addEventListener("change", (ev) => {
        console.log((<HTMLInputElement>document.getElementById("save-expand")).checked)
    });

    document.getElementById("new-button")?.addEventListener("click", (ev) => {
        const modal = <any>document.getElementById("new-modal");
        modal?.showModal();
        modal?.classList.add("open");
    });

    document.getElementById("import-file")?.addEventListener("change", async (ev) => {
        const files = (<HTMLInputElement>document.getElementById("import-file")!).files;

        if(files != null) {
            const file = files[0];
            await file.stream().getReader().read().then((font) => {
                const iFont = exim._import(font.value!);
                const newFont = {
                    width: iFont.get_width(),
                    height: iFont.get_height(),
                    content: <boolean[][]>iFont.get_content(),
                };

                initFont(newFont);
            });
        }
    }, false);

    document.getElementById("save-button")?.addEventListener("click", () => {
        
    });

    document.getElementById("new-close")?.addEventListener("click", (ev) => {
        closeModal("new-modal");
    });

    document.getElementById("new-create")?.addEventListener("click", (ev) => {
        ev.preventDefault();

        const form = <HTMLFormElement>document.getElementById("new-form")!;
        const formData = new FormData(form);
        form.reset();

        const width = parseInt(formData.get("new-width")! as string);
        const height = parseInt(formData.get("new-height")! as string);
        const chars = parseInt(formData.get("new-characters")! as string);

        let content: boolean[][] = new Array(chars);
        for (let i = 0; i < content.length; i++) {
            content[i] = new Array(width * height).fill(false);
        }

        const newFont = {
            width: width,
            height: height,
            content: content
        };

        initFont(newFont);
    });

    document.getElementById("select-open")?.addEventListener("click", (ev) => {
        const footer = document.getElementById("footer")!;
        const header = document.getElementById("header")!;
        const openArrow = document.getElementById("select-open")!;

        if(footer.classList.contains("open")) {
            closeFooter();
        } else {
            footer.classList.add("open");
            header.classList.add("close");
            openArrow.classList.add("rot-180");
            
            setTimeout(() => {
                const menu = document.getElementById("character-menu")!;
                menu.classList.remove("sink");
            }, 500);

            setTimeout(() => {
                const blocker = document.getElementById("footer-blocker")!;
                blocker.classList.remove("hidden");
            }, 500);
            
            setTimeout(() => {
                document.getElementById("edit-table")!.style.zIndex = "97";
            }, 100);

        }
    });

    document.getElementById("select-next")?.addEventListener("click", (ev) => {
        if(currentFont != null && currentCharacter < currentFont.content.length) {
            currentCharacter++;
            updateIndex();

            const table = <HTMLTableElement>document.getElementById("edit-table")!;
            updateCharacter(table, currentFont);
        }
    });

    document.getElementById("select-prev")?.addEventListener("click", (ev) => {
        if (currentFont != null && currentCharacter > 0) {
            currentCharacter--;
            updateIndex();
            
            const table = <HTMLTableElement>document.getElementById("edit-table")!;
            updateCharacter(table, currentFont);
        }
    });

    document.addEventListener("mouseup", (_) => {
        mouseDown = false;
    });

    document.addEventListener("dragend", (_) => {
        mouseDown = false;
    });
});

const initFont = (font: Font) => {
    currentFont = font;
    currentCharacter = 0;

    updateEditor(currentFont!);
    populateCharacters(currentFont!);
    addSaveButton();
    showCharacterSelect();

    closeModal("new-modal");
}

const updateEditor = (font: Font) => {
    const explainContent = document.getElementById("explain-content")!;
    explainContent.classList.add("hidden");

    const editContent = document.getElementById("edit-content")!;
    editContent.classList.remove("hidden");

    const editTable = <HTMLTableElement>document.getElementById("edit-table")!;

    editTable.replaceChildren()

    const heightPercent = 100.0 / font.height;
    const widthPercent = 100.0 / font.width;

    for (let y = 0; y < font.height; y++) {
        const row = editTable.insertRow();
        row.style.height = heightPercent.toString() + "%";
        
        for (let x = 0; x < font.width; x++) {
            const cell = row.insertCell();
            cell.style.width = widthPercent.toString() + "%";
            cell.classList.add("pixel");
            cell.draggable = false;


            cell.addEventListener("mousedown", (ev) => {
                mouseDown = true;
                dragCurrent = [x, y];
                dragValue = togglePixel(y * font.width + x, cell);
            });

            cell.addEventListener("mousemove", (ev) => {
                if (mouseDown && (dragCurrent[0] != x || dragCurrent[1] != y)) {
                    dragCurrent = [x, y];
                    const i = y * currentFont!.width + x;

                    // Use dragValue to avoid confusing drag behavior
                    setPixel(i, cell, dragValue);
                    currentFont!.content[currentCharacter][y * font.width + x] = dragValue;
                }
            });

            cell.addEventListener("dragstart", (ev) => {
                ev.preventDefault();
            });
        }
    }

    editTable.style.aspectRatio = font.width.toString() + "/" + font.height.toString();
    updateCharacter(editTable, currentFont!);
}

const updateCharacter = (table: HTMLTableElement, font: Font) => {
    for (let x = 0; x < font.width; x++) {
        for (let y = 0; y < font.height; y++) {
            const i = y * font.width + x;
            const value = font.content[currentCharacter][i];

            const body = table.children.item(0)!;
            const row = body.children.item(y)!;
            const cell = <HTMLTableCellElement>row.children.item(x)!;

            setPixel(i, cell, value);
        }
    }
}

const togglePixel = (i: number, cell: HTMLTableCellElement): boolean => {
    if (currentFont != null) {
        const value = !currentFont.content[currentCharacter][i];
        currentFont.content[currentCharacter][i] = value;
        
        setPixel(i, cell, value);

        return value;
    }

    return false;
}

const setPixel = (i: number, cell: HTMLTableCellElement, value: boolean) => {
    if (value) {
        cell.classList.remove("pixel-off");
        cell.classList.add("pixel-on");
    } else {
        cell.classList.remove("pixel-on");
        cell.classList.add("pixel-off");
    }

    const character = document.getElementById("character-menu")!.children.item(currentCharacter);
    if (character != null) {
        const x = i % currentFont!.width;
        const y = Math.floor(i / currentFont!.width);

        const menuCell = character.firstElementChild!.firstElementChild!.firstElementChild!.children.item(y)!.children.item(x)!;
        if (value) {
            menuCell.classList.remove("off");
            menuCell.classList.add("on");
        } else {
            menuCell.classList.remove("on");
            menuCell.classList.add("off");
        }
    }
}

const closeModal = (id: string) => {
    const modal = <HTMLDialogElement>document.getElementById(id)!;
    // Do this in a timeout to let the fade animation play
    modal.classList.remove("open");
    setTimeout(() => {
        modal.close();
    }, 250);
}

const showCharacterSelect = () => {
    const characterSelect = document.getElementById("character-select");
    if (characterSelect != null && currentFont != null) {
        characterSelect.classList.remove("hidden");
        updateIndex();
    }
}

const toggleSaveButton = () => {
    const saveButton = document.getElementById(SAVE_ID);
        
    if (saveButton?.classList.contains(HIDDEN_CLASS)) {
        addSaveButton();
    } else {
        removeSaveButton();
    }
}

const addSaveButton = () => {
    document.getElementById("dropdown-wrapper")?.classList.remove(HIDDEN_CLASS);
    
    const headerButtons = document.getElementsByClassName("double");
    for (let i = 0; i < headerButtons.length; i++) {
        const button = headerButtons[i];
        button.classList.add("triple");
        button.classList.remove("double");
    }
}

const removeSaveButton = () => {
    document.getElementById("dropdown-wrapper")?.classList.add(HIDDEN_CLASS);
    
    const headerButtons = document.getElementsByClassName("triple");
    for (let i = 0; i < headerButtons.length; i++) {
        const button = headerButtons[i];
        button.classList.add("double");
        button.classList.remove("triple");
    }
}

const toHex = (value: number, padding: number): string => {
    let str = "0x" + new Array(padding + 1).join('0');
    const hex = value.toString(16);

    str = str.substring(0, padding + 2 - hex.length) + hex;

    return str;
}

const hexSpaces = (maxValue: number): number => {
    let log = Math.floor(Math.log2(maxValue)) + 1;

    return Math.ceil(log / 4);
}

const updateIndex = () => {
    if (currentFont != null) {
        const padding = hexSpaces(currentFont.content.length - 1);
        document.getElementById("character-index")!.innerHTML = toHex(currentCharacter, padding);
    }
}

const populateCharacters = (font: Font) => {
    const menu = document.getElementById("character-menu");

    if(menu != null) {
        menu.replaceChildren();

        for (let i = 0; i < font.content.length; i++) {
            let character = <HTMLDivElement>document.createElement("div");
            let characterInner = character.appendChild(document.createElement("div"));
            let table = characterInner.appendChild(document.createElement("table"));
            character.classList.add("menu-character");
            characterInner.classList.add("menu-character-inner");
            characterInner.style.aspectRatio = font.width.toString() + "/" + font.height.toString();

            character.addEventListener("click", (ev) => {
                currentCharacter = i;
                updateIndex();

                const table = <HTMLTableElement>document.getElementById("edit-table")!;

                updateCharacter(table, currentFont!);
                closeFooter();
            });
            
            const heightPercent = 100.0 / font.height;
            const widthPercent = 100.0 / font.width;

            for (let y = 0; y < font.height; y++) {
                const row = table.insertRow();
                row.style.height = heightPercent.toString() + "%";

                for (let x = 0; x < font.width; x++) {
                    const cell = row.insertCell();
                    cell.style.width = widthPercent.toString() + "%";
                    cell.classList.add("menu-pixel");
                    
                    if (font.content[i][y*font.width + x]) {
                        cell.classList.add("on");
                    } else {
                        cell.classList.add("off");
                    }
                }
            }

            const padding = hexSpaces(font.content.length - 1);
            const indexStr = toHex(i, padding);

            const index = document.createElement("h3");
            index.innerText = indexStr;
            index.classList.add("menu-index");
            character.appendChild(index);

            menu.appendChild(character);
        }
    }
}

const closeFooter = () => {
    const footer = document.getElementById("footer")!;
    const header = document.getElementById("header")!;
    const openArrow = document.getElementById("select-open")!;

    footer.classList.remove("open");
    openArrow.classList.remove("rot-180");
    
    const menu = document.getElementById("character-menu")!;
    menu.classList.add("sink");
    setTimeout(() => {
        const blocker = document.getElementById("footer-blocker")!;
        blocker.classList.add("hidden");
    }, 700);

    setTimeout(() => header.classList.remove("close"), 500);
    setTimeout(() => {
        document.getElementById("edit-table")!.style.zIndex = "";
    }, 1000);
    
}

const saveROM = () => {
    if (currentFont != null) {
        const font = exim.create_font(currentFont.width, currentFont.height, currentFont.content);
        const content = exim.serialize(font);

        const file = new Blob([content], { type: "application/octet-stream" });
        if('msSaveOrOpenBlob' in window.navigator) {
            (<any>window.navigator.msSaveOrOpenBlob)(file, "font.rom");
        } else {
            const a = document.createElement('a');
            const url = URL.createObjectURL(file);
            a.href = url;
            a.download = "font.rom";
            document.body.appendChild(a);
            a.click();
            setTimeout(() => {
                document.removeChild(a);
                window.URL.revokeObjectURL(url);
            }, 0);
        }
    }
}

const saveFont = () => {
    if (currentFont != null) {
        const font = exim.create_font(currentFont.width, currentFont.height, currentFont.content);
        const content = exim._export(font);

        const file = new Blob([content], { type: "application/octet-stream" });
        if('msSaveOrOpenBlob' in window.navigator) {
            (<any>window.navigator.msSaveOrOpenBlob)(file, ".font");
        } else {
            const a = document.createElement('a');
            const url = URL.createObjectURL(file);
            a.href = url;
            a.download = ".font";
            document.body.appendChild(a);
            a.click();
            setTimeout(() => {
                document.removeChild(a);
                window.URL.revokeObjectURL(url);
            }, 0);
        }
    }
}
