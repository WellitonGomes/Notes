const notesApp = {
    note: document.querySelector("note"),
    newNoteButton: document.querySelector(".add-box"),
    popupBox: document.querySelector(".popup-box"),
    popupTitle: document.querySelector(".popup-box header p"),
    closeIcon: document.querySelector(".popup-box header i"),
    titleInput: document.querySelector(".popup-box input"),
    descTextarea: document.querySelector(".popup-box textarea"),
    saveButton: document.querySelector(".popup-box button"),
    months: [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ],
    notes: loadNotesFromStorage(),
    isEditing: false,
    currentEditIndex: null
};

// Utils
function loadNotesFromStorage() {
    return JSON.parse(localStorage.getItem("notes") || "[]");
}

function saveNotesToStorage() {
    localStorage.setItem("notes", JSON.stringify(notesApp.notes));
}

function getFormattedDate() {
    const now = new Date();
    return `${notesApp.months[now.getMonth()]} ${now.getDate()}, ${now.getFullYear()}`;
}

function resetNoteForm() {
    notesApp.titleInput.value = "";
    notesApp.descTextarea.value = "";
    notesApp.popupBox.classList.remove("show");
    notesApp.popupTitle.innerText = "Adicionar nova nota";
    notesApp.saveButton.innerText = "Adicionar nota";
    notesApp.isEditing = false;
    notesApp.currentEditIndex = null;
}

function validateInputs(title, description) {
    const isValid = title.trim() !== "" && description.trim() !== "";

    if (!isValid) {
        notesApp.titleInput.placeholder = "Título obrigatório";
        notesApp.descTextarea.placeholder = "Descrição obrigatória";
        notesApp.titleInput.style.border = "1px solid red";
        notesApp.descTextarea.style.border = "1px solid red";

        setTimeout(() => {
            notesApp.titleInput.style.border = "";
            notesApp.descTextarea.style.border = "";
            notesApp.titleInput.placeholder = "";
            notesApp.descTextarea.placeholder = "";
        }, 3000);
    }

    return isValid;
}

function createNote(title, description) {
    return {
        title: title.trim(),
        description: description.trim(),
        date: getFormattedDate()
    };
}

function renderNotes() {
    document.querySelectorAll(".note").forEach(note => note.remove());

    notesApp.notes.forEach((note, index) => {
        if (!note.title || !note.description || !note.date) return;

        const noteElement = document.createElement("li");
        noteElement.classList.add("note");
        noteElement.innerHTML = `
            <div class="details">
                <p>${note.title}</p>
                <h2>${note.description}</h2>
            </div>
            <div class="bottom-content">
                <span>${note.date}</span>
                <div class="settings">
                    <i class="fa-solid fa-ellipsis"></i>
                    <ul class="menu">
                        <li onclick="editNote(${index})">
                            <i class="fa-solid fa-pen"></i>Edit
                        </li>
                        <li onclick="removeNote(${index})">
                            <i class="fa-solid fa-trash"></i>Delete
                        </li>
                    </ul>
                </div>
            </div>
        `;
        notesApp.newNoteButton.insertAdjacentElement("afterend", noteElement);
    });

    attachMenuListeners();
}

function attachMenuListeners() {
    document.querySelectorAll(".settings i").forEach(icon => {
        icon.addEventListener("click", function (e) {
            this.parentElement.classList.add("show");
            e.stopPropagation();

            document.addEventListener("click", (event) => {
                if (event.target !== this) {
                    this.parentElement.classList.remove("show");
                }
            }, { once: true });
        });
    });
}

// Note Actions
function saveNote() {
    const title = notesApp.titleInput.value;
    const description = notesApp.descTextarea.value;

    if (!validateInputs(title, description)) return;

    const note = createNote(title, description);

    if (notesApp.isEditing && notesApp.currentEditIndex !== null) {
        notesApp.notes[notesApp.currentEditIndex] = note;
    } else {
        notesApp.notes.push(note);
    }

    saveNotesToStorage();
    renderNotes();
    resetNoteForm();
}

window.editNote = function (index) {
    const note = notesApp.notes[index];

    if (!note) return;

    notesApp.titleInput.value = note.title;
    notesApp.descTextarea.value = note.description;
    notesApp.popupBox.classList.add("show");
    notesApp.popupTitle.innerText = "Edit Note";
    notesApp.saveButton.innerText = "Update Note";
    notesApp.isEditing = true;
    notesApp.currentEditIndex = index;
};

window.removeNote = function (index) {
    if (!confirm("Are you sure you want to delete this note?")) return;

    notesApp.notes.splice(index, 1);
    saveNotesToStorage();
    renderNotes();
};

// Events
notesApp.newNoteButton.onclick = () => {
    resetNoteForm();
    notesApp.popupBox.classList.add("show");
    notesApp.titleInput.focus();
};

notesApp.closeIcon.onclick = resetNoteForm;

notesApp.saveButton.onclick = e => {
    e.preventDefault();
    saveNote();
};

// Init
renderNotes();