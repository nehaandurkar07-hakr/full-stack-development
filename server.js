
const signupForm = document.getElementById("signupForm");
const loginForm = document.getElementById("loginForm");

const signupTab = document.getElementById("signupTab");
const loginTab = document.getElementById("loginTab");

const profileSection = document.getElementById("profileSection");
const profileName = document.getElementById("profileName");
const profileEmail = document.getElementById("profileEmail");
const logoutButton = document.getElementById("logoutButton");
const message = document.getElementById("message");

// Show a message on the page
function showMessage(text) {
    message.textContent = text;
}

// Send requests to our backend API
async function apiRequest(url, method = "GET", data) {
    const options = {
        method: method,
        credentials: "same-origin",
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

// Switch between signup and login
signupTab.addEventListener("click", function () {
    signupForm.hidden = false;
    loginForm.hidden = true;
    profileSection.hidden = true;
    showMessage("");
});

loginTab.addEventListener("click", function () {
    signupForm.hidden = true;
    loginForm.hidden = false;
    profileSection.hidden = true;
    showMessage("");
});

// Signup
signupForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    try {
        const result = await apiRequest("/api/signup", "POST", {
            name: document.getElementById("signupName").value,
            email: document.getElementById("signupEmail").value,
            password: document.getElementById("signupPassword").value
        });

        showMessage(result.message);
        signupForm.reset();

        signupForm.hidden = true;
        loginForm.hidden = false;
    } catch (error) {
        showMessage(error.message);
    }
});

// Login
loginForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    try {
        const result = await apiRequest("/api/login", "POST", {
            email: document.getElementById("loginEmail").value,
            password: document.getElementById("loginPassword").value
        });

        loginForm.reset();
        showMessage(result.message);

        await loadProfile();
    } catch (error) {
        showMessage(error.message);
    }
});

// Load protected profile
async function loadProfile() {
    try {
        const user = await apiRequest("/api/profile");

        profileName.textContent = "Name: " + user.name;
        profileEmail.textContent = "Email: " + user.email;

        signupForm.hidden = true;
        loginForm.hidden = true;
        profileSection.hidden = false;
    } catch (error) {
        profileSection.hidden = true;
    }
}

// Logout
logoutButton.addEventListener("click", async function () {
    try {
        const result = await apiRequest("/api/logout", "POST");

        profileSection.hidden = true;
        signupForm.hidden = true;
        loginForm.hidden = false;

        showMessage(result.message);
    } catch (error) {
        showMessage(error.message);
    }
});

// Check whether a session already exists
loadProfile();
