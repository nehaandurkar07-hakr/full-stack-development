
const contactForm = document.getElementById("contactForm");
const nameInput = document.getElementById("name");
const emailInput = document.getElementById("email");

const contactList = document.getElementById("contactList");
const contactCount = document.getElementById("contactCount");
const message = document.getElementById("message");

const formTitle = document.getElementById("formTitle");
const saveButton = document.getElementById("saveButton");
const cancelButton = document.getElementById("cancelButton");

let contacts = [];
let editingId = null;

// Show success or error messages
function showMessage(text) {
    message.textContent = text;
}

// Make a request to the backend API
async function apiRequest(url, method = "GET", data) {
    const options = {
        method,
        headers: {}
    };

    if (data !== undefined) {
        options.headers["Content-Type"] = "application/json";
        options.body = JSON.stringify(data);
    }

    const response = await fetch(url, options);
    const result = await response.json();

    if (!response.ok) {
        throw new Error(result.message || "Request failed");
    }

    return result;
}

// READ: Load all contacts
async function loadContacts() {
    try {
        contacts = await apiRequest("/api/contacts");
        renderContacts();
    } catch (error) {
        showMessage(error.message);
        contactCount.textContent = "Could not load contacts.";
    }
}

// Display contact cards
function renderContacts() {
    contactList.replaceChildren();
    contactCount.textContent = `Total contacts: ${contacts.length}`;

    if (contacts.length === 0) {
        const emptyMessage = document.createElement("p");
        emptyMessage.textContent = "No contacts yet. Add your first contact!";
        contactList.appendChild(emptyMessage);
        return;
    }

    contacts.forEach(contact => {
        const card = document.createElement("article");
        card.className = "contact-card";

        const heading = document.createElement("h3");
        heading.textContent = contact.name;

        const email = document.createElement("p");
        email.textContent = contact.email;

        const actions = document.createElement("div");
        actions.className = "contact-actions";

        const editButton = document.createElement("button");
        editButton.textContent = "Edit";
        editButton.addEventListener("click", () => startEdit(contact));

        const deleteButton = document.createElement("button");
        deleteButton.textContent = "Delete";
        deleteButton.className = "delete";
        deleteButton.addEventListener("click", () => deleteContact(contact.id));

        actions.append(editButton, deleteButton);
        card.append(heading, email, actions);
        contactList.appendChild(card);
    });
}

// CREATE and UPDATE: Submit the form
contactForm.addEventListener("submit", async event => {
    event.preventDefault();

    const name = nameInput.value.trim();
    const email = emailInput.value.trim();

    if (!name || !email) {
        showMessage("Please enter both name and email.");
        return;
    }

    const isEditing = editingId !== null;
    const url = isEditing
        ? `/api/contacts/${editingId}`
        : "/api/contacts";

    const method = isEditing ? "PUT" : "POST";

    try {
        const result = await apiRequest(url, method, { name, email });

        showMessage(result.message);
        resetForm();
        await loadContacts();
    } catch (error) {
        showMessage(error.message);
    }
});

// Prepare the form for editing
function startEdit(contact) {
    editingId = contact.id;

    nameInput.value = contact.name;
    emailInput.value = contact.email;

    formTitle.textContent = "Edit Contact";
    saveButton.textContent = "Update Contact";
    cancelButton.hidden = false;

    nameInput.focus();
}

// Reset the form
function resetForm() {
    contactForm.reset();
    editingId = null;

    formTitle.textContent = "Add New Contact";
    saveButton.textContent = "Add Contact";
    cancelButton.hidden = true;
}

cancelButton.addEventListener("click", resetForm);

// DELETE: Remove a contact
async function deleteContact(id) {
    const confirmed = confirm("Are you sure you want to delete this contact?");

    if (!confirmed) return;

    try {
        const result = await apiRequest(`/api/contacts/${id}`, "DELETE");

        showMessage(result.message);

        if (editingId === id) {
            resetForm();
        }

        await loadContacts();
    } catch (error) {
        showMessage(error.message);
    }
}

// Load contacts when the page opens
loadContacts();
