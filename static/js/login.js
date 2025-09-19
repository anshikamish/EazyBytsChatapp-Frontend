// login.js

document.getElementById("loginForm").addEventListener("submit", async function(event) {
    event.preventDefault();

    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();

    if (!username || !password) {
        alert("Fill username or password");
        return;
    }

    try {
        const response = await fetch("/api/auth/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ username, password })
        });

        if (response.ok) {
            const data = await response.json();
            localStorage.setItem("jwt", data.token);  // Token localStorage me save karo
            alert("Login successful!");
            window.location.href = "/chat.html";  // Chat page pe redirect karo
        } else {
            alert("Invalid username or password");
        }
    } catch (error) {
        console.error("Login error:", error);
        alert("login error, try again");
    }
});
