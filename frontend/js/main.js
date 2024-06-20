"use strict";
const SAVE_ID = "save-button";
const HIDDEN_CLASS = "hidden";
const HEADER_BUTTON_CLASS = "header-button";
let currentFont = null;
let currentCharacter = 0;
document.addEventListener("DOMContentLoaded", () => {
    var _a, _b, _c;
    (_a = document.getElementById("new-button")) === null || _a === void 0 ? void 0 : _a.addEventListener("click", (ev) => {
        const modal = document.getElementById("new-modal");
        modal === null || modal === void 0 ? void 0 : modal.showModal();
        modal === null || modal === void 0 ? void 0 : modal.classList.add("open");
    });
    (_b = document.getElementById("new-close")) === null || _b === void 0 ? void 0 : _b.addEventListener("click", (ev) => {
        closeModal("new-modal");
    });
    (_c = document.getElementById("new-create")) === null || _c === void 0 ? void 0 : _c.addEventListener("click", (ev) => {
        ev.preventDefault();
        const form = document.getElementById("new-form");
        const formData = new FormData(form);
        form.reset();
        const width = parseInt(formData.get("new-width"));
        const height = parseInt(formData.get("new-height"));
        const chars = parseInt(formData.get("new-characters"));
        let content = new Array(chars);
        for (let i = 0; i < content.length; i++) {
            content[i] = new Array(width * height).fill(false);
        }
        currentFont = {
            width: width,
            height: height,
            content: content
        };
        currentCharacter = 0;
        updateEditor(currentFont);
        closeModal("new-modal");
    });
});
const updateEditor = (font) => {
    const explainContent = document.getElementById("explain-content");
    explainContent.classList.add("hidden");
    const editContent = document.getElementById("edit-content");
    explainContent.classList.remove("hidden");
    const editTable = document.getElementById("edit-table");
    editTable.replaceChildren();
    const heightPercent = 100.0 / font.height;
    const widthPercent = 100.0 / font.width;
    for (let y = 0; y < font.height; y++) {
        const row = editTable.insertRow();
        row.style.height = heightPercent.toString() + "%";
        for (let x = 0; x < font.width; x++) {
            const cell = row.insertCell();
            cell.style.width = widthPercent.toString() + "%";
            cell.classList.add("pixel");
            cell.addEventListener("click", (ev) => {
                togglePixel(y * font.width + x, cell);
            });
        }
    }
    editTable.style.aspectRatio = font.width.toString() + "/" + font.height.toString();
    updateCharacter(editTable, currentFont);
};
const updateCharacter = (table, font) => {
    for (let x = 0; x < font.width; x++) {
        for (let y = 0; y < font.height; y++) {
            const i = y * font.width + x;
            const value = font.content[currentCharacter][i];
            const body = table.children.item(0);
            const row = body.children.item(y);
            const cell = row.children.item(x);
            setPixel(cell, value);
        }
    }
};
const togglePixel = (i, cell) => {
    if (currentFont != null) {
        const value = !currentFont.content[currentCharacter][i];
        currentFont.content[currentCharacter][i] = value;
        setPixel(cell, value);
    }
};
const setPixel = (cell, value) => {
    if (value) {
        cell.classList.remove("pixel-off");
        cell.classList.add("pixel-on");
    }
    else {
        cell.classList.remove("pixel-on");
        cell.classList.add("pixel-off");
    }
};
const closeModal = (id) => {
    const modal = document.getElementById(id);
    modal.classList.remove("open");
    setTimeout(() => {
        modal.close();
    }, 250);
};
const toggleSaveButton = () => {
    const saveButton = document.getElementById(SAVE_ID);
    if (saveButton === null || saveButton === void 0 ? void 0 : saveButton.classList.contains(HIDDEN_CLASS)) {
        addSaveButton();
    }
    else {
        removeSaveButton();
    }
};
const addSaveButton = () => {
    var _a;
    (_a = document.getElementById(SAVE_ID)) === null || _a === void 0 ? void 0 : _a.classList.remove(HIDDEN_CLASS);
    const headerButtons = document.getElementsByClassName(HEADER_BUTTON_CLASS);
    for (let i = 0; i < headerButtons.length; i++) {
        const button = headerButtons[i];
        button.classList.add("triple");
        button.classList.remove("double");
    }
};
const removeSaveButton = () => {
    var _a;
    (_a = document.getElementById(SAVE_ID)) === null || _a === void 0 ? void 0 : _a.classList.add(HIDDEN_CLASS);
    const headerButtons = document.getElementsByClassName(HEADER_BUTTON_CLASS);
    for (let i = 0; i < headerButtons.length; i++) {
        const button = headerButtons[i];
        button.classList.add("double");
        button.classList.remove("triple");
    }
};
