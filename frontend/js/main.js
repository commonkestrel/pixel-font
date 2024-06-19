"use strict";
const SAVE_ID = "save-button";
const HIDDEN_CLASS = "hidden";
const HEADER_BUTTON_CLASS = "header-button";
document.addEventListener("DOMContentLoaded", () => {
    var _a, _b, _c;
    (_a = document.getElementById("new-button")) === null || _a === void 0 ? void 0 : _a.addEventListener("click", (ev) => {
        const modal = document.getElementById("new-modal");
        modal === null || modal === void 0 ? void 0 : modal.showModal();
        modal === null || modal === void 0 ? void 0 : modal.classList.add("open");
    });
    (_b = document.getElementById("new-close")) === null || _b === void 0 ? void 0 : _b.addEventListener("click", (ev) => {
        const modal = document.getElementById("new-modal");
        modal === null || modal === void 0 ? void 0 : modal.classList.remove("open");
        setTimeout(() => {
            modal.close();
        }, 250);
    });
    (_c = document.getElementById("new-create")) === null || _c === void 0 ? void 0 : _c.addEventListener("click", (ev) => {
        ev.preventDefault();
    });
});
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
