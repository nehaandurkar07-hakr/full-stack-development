const express = require("express");
const app = express();
const PORT = 3000;

// JSON data read karne ke liye
app.use(express.json());

// Sample Contacts Data
let contacts = [
    { id: 1, name: "Neha", email: "neha@example.com" }
];

// 1. Home Route
app.get("/", (req, res) => {
    res.send("Contacts API is running successfully!");
});

// 2. GET: Sabhi contacts dekhne ke liye
app.get("/contacts", (req, res) => {
    res.json(contacts);
});

// 3. POST: Naya contact add karne ke liye
app.post("/contacts", (req, res) => {
    const { name, email } = req.body;

    if (!name || !email) {
        return res.status(400).json({ message: "Name and email are required!" });
    }

    const newContact = {
        id: contacts.length + 1,
        name: name,
        email: email
    };

    contacts.push(newContact);
    res.status(201).json({ message: "Contact added!", contact: newContact });
});

// Server Start
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});