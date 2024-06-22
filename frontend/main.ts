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

document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("new-button")?.addEventListener("click", (ev) => {
        const modal = <any>document.getElementById("new-modal");
        modal?.showModal();
        modal?.classList.add("open");
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

        currentFont = {
            width: width,
            height: height,
            content: content
        };

        currentCharacter = 0;

        updateEditor(currentFont!);
        addSaveButton();
        showCharacterSelect();

        closeModal("new-modal");
    });

    document.getElementById("select-open")?.addEventListener("click", (ev) => {
        const footer = document.getElementById("footer")!;
        const header = document.getElementById("header")!;
        const openArrow = document.getElementById("select-open")!;

        if(footer.classList.contains("open")) {
            footer.classList.remove("open");
            openArrow.classList.remove("rot-180");
            
            setTimeout(() => header.classList.remove("close"), 500);
            setTimeout(() => {
                document.getElementById("edit-table")!.style.zIndex = "";
            }, 1000);
        } else {
            footer.classList.add("open");
            header.classList.add("close");
            openArrow.classList.add("rot-180");

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

const updateEditor = (font: Font) => {
    const explainContent = document.getElementById("explain-content")!;
    explainContent.classList.add("hidden");

    const editContent = document.getElementById("edit-content")!;
    explainContent.classList.remove("hidden");

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
                console.log("move " + mouseDown + " " + dragCurrent + "  " + [x, y]);
                if (mouseDown && (dragCurrent[0] != x || dragCurrent[1] != y)) {
                    dragCurrent = [x, y];
                    // Use dragValue to avoid confusing drag behavior
                    setPixel(cell, dragValue);
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

            setPixel(cell, value);
        }
    }
}

const togglePixel = (i: number, cell: HTMLTableCellElement): boolean => {
    if (currentFont != null) {
        const value = !currentFont.content[currentCharacter][i];
        currentFont.content[currentCharacter][i] = value;
        
        setPixel(cell, value);

        return value;
    }

    return false;
}

const setPixel = (cell: HTMLTableCellElement, value: boolean) => {
    if (value) {
        cell.classList.remove("pixel-off");
        cell.classList.add("pixel-on");
    } else {
        cell.classList.remove("pixel-on");
        cell.classList.add("pixel-off");
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
    document.getElementById(SAVE_ID)?.classList.remove(HIDDEN_CLASS);
    
    const headerButtons = document.getElementsByClassName(HEADER_BUTTON_CLASS);
    for (let i = 0; i < headerButtons.length; i++) {
        const button = headerButtons[i];
        button.classList.add("triple");
        button.classList.remove("double");
    }
}

const removeSaveButton = () => {
    document.getElementById(SAVE_ID)?.classList.add(HIDDEN_CLASS);
    
    const headerButtons = document.getElementsByClassName(HEADER_BUTTON_CLASS);
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
