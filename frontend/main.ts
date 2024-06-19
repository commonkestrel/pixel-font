const SAVE_ID: string = "save-button";
const HIDDEN_CLASS: string = "hidden";
const HEADER_BUTTON_CLASS = "header-button";

document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("new-button")?.addEventListener("click", (ev) => {
        const modal = <any>document.getElementById("new-modal");
        modal?.showModal();
        modal?.classList.add("open");
    });

    document.getElementById("new-close")?.addEventListener("click", (ev) => {
        const modal = <any>document.getElementById("new-modal");
        modal?.classList.remove("open");
        setTimeout(() => {
            modal.close();
        }, 250);
    });

    document.getElementById("new-create")?.addEventListener("click", (ev) => {
        ev.preventDefault();
    });
});

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
