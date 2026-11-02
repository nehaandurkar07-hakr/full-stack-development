
const expenseForm = document.getElementById("expenseForm");
const titleInput = document.getElementById("title");
const amountInput = document.getElementById("amount");
const categoryInput = document.getElementById("category");

const totalAmount = document.getElementById("totalAmount");
const expenseCount = document.getElementById("expenseCount");
const expenseList = document.getElementById("expenseList");
const message = document.getElementById("message");

const formTitle = document.getElementById("formTitle");
const saveButton = document.getElementById("saveButton");
const cancelButton = document.getElementById("cancelButton");

let expenses = [];
let editingId = null;

// Show messages
function showMessage(text) {
    message.textContent = text;
}

// Send requests to the backend
async function apiRequest(url, method = "GET", data) {
    const options = { method, headers: {} };

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

// Load expenses from the server
async function loadExpenses() {
    try {
        expenses = await apiRequest("/api/expenses");
        renderExpenses();
    } catch (error) {
        showMessage(error.message);
    }
}

// Display expenses and calculate total
function renderExpenses() {
    expenseList.replaceChildren();

    const total = expenses.reduce(
        (sum, expense) => sum + expense.amount,
        0
    );

    totalAmount.textContent = total.toLocaleString("en-IN", {
        style: "currency",
        currency: "INR"
    });

    expenseCount.textContent =
        `${expenses.length} expense${expenses.length === 1 ? "" : "s"} recorded`;

    if (expenses.length === 0) {
        const empty = document.createElement("p");
        empty.textContent = "No expenses yet. Add your first expense!";
        expenseList.appendChild(empty);
        return;
    }

    expenses.forEach(expense => {
        const card = document.createElement("article");
        card.className = "expense-card";

        const title = document.createElement("h3");
        title.textContent = expense.title;

        const amount = document.createElement("p");
        amount.className = "expense-amount";
        amount.textContent = Number(expense.amount).toLocaleString(
            "en-IN",
            { style: "currency", currency: "INR" }
        );

        const category = document.createElement("span");
        category.className = "category";
        category.textContent = expense.category;

        const actions = document.createElement("div");
        actions.className = "expense-actions";

        const editButton = document.createElement("button");
        editButton.textContent = "Edit";
        editButton.addEventListener("click", () => startEdit(expense));

        const deleteButton = document.createElement("button");
        deleteButton.textContent = "Delete";
        deleteButton.className = "delete";
        deleteButton.addEventListener(
            "click",
            () => deleteExpense(expense.id)
        );

        actions.append(editButton, deleteButton);
        card.append(title, amount, category, actions);
        expenseList.appendChild(card);
    });
}

// Add or update an expense
expenseForm.addEventListener("submit", async event => {
    event.preventDefault();

    const title = titleInput.value.trim();
    const amount = Number(amountInput.value);
    const category = categoryInput.value;

    if (
        !title ||
        !category ||
        !Number.isFinite(amount) ||
        amount <= 0 ||
        amount > 100000000
    ) {
        showMessage("Enter a valid title, amount and category.");
        return;
    }

    const isEditing = editingId !== null;

    const url = isEditing
        ? `/api/expenses/${editingId}`
        : "/api/expenses";

    const method = isEditing ? "PUT" : "POST";

    try {
        const result = await apiRequest(url, method, {
            title,
            amount,
            category
        });

        showMessage(result.message);
        resetForm();
        await loadExpenses();
    } catch (error) {
        showMessage(error.message);
    }
});

// Prepare the form for editing
function startEdit(expense) {
    editingId = expense.id;

    titleInput.value = expense.title;
    amountInput.value = expense.amount;
    categoryInput.value = expense.category;

    formTitle.textContent = "Edit Expense";
    saveButton.textContent = "Update Expense";
    cancelButton.hidden = false;

    titleInput.focus();
}

// Reset form to add mode
function resetForm() {
    expenseForm.reset();
    editingId = null;

    formTitle.textContent = "Add New Expense";
    saveButton.textContent = "Add Expense";
    cancelButton.hidden = true;
}

cancelButton.addEventListener("click", resetForm);

// Delete an expense
async function deleteExpense(id) {
    if (!confirm("Are you sure you want to delete this expense?")) {
        return;
    }

    try {
        const result = await apiRequest(`/api/expenses/${id}`, "DELETE");

        showMessage(result.message);

        if (editingId === id) {
            resetForm();
        }

        await loadExpenses();
    } catch (error) {
        showMessage(error.message);
    }
}

// Initial page load
loadExpenses();
