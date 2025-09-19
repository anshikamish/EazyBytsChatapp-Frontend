let stompClient = null;
let currentRoom = null; // default hata diya for privacy

window.onload = function () {
  const senderInput = document.getElementById("sender");
  const storedUsername = localStorage.getItem("username");
  if (storedUsername) {
    senderInput.value = storedUsername;
  }

  if (Notification.permission !== "granted") {
    Notification.requestPermission();
  }

  // ❌ connect(); // automatic connect hata diya
};

// ✅ Connect function now needs room as parameter
function connect(room) {
  const socket = new SockJS("/chat-websocket");
  stompClient = Stomp.over(socket);
  currentRoom = room;

  stompClient.connect({}, function () {
    console.log("✅ Connected to WebSocket");

    stompClient.subscribe("/topic/" + room, function (messageOutput) {
      console.log("📩 Message received:", messageOutput.body);
      const message = JSON.parse(messageOutput.body);
      displayMessage(message.sender, message.receiver, message.content, message.timestamp, message.room);
      showNotification(message.sender, message.content);
    });

    // 🕐 Load messages for this room only
    loadMessageHistory(room);

  }, function (error) {
    console.error("❌ WebSocket connection error:", error);
  });
}

// ✅ User clicks Join Room to trigger connection
function joinRoom() {
  const room = document.getElementById("room").value.trim();
  if (!room) {
    alert("Please enter a room name to join.");
    return;
  }

  if (stompClient && stompClient.connected) {
    stompClient.disconnect(() => {
      console.log("🔌 Disconnected from previous room.");
      connect(room); // Reconnect to new room
    });
  } else {
    connect(room); // First time connect
  }
}

function sendMessage() {
  const sender = document.getElementById("sender").value;
  const receiver = document.getElementById("receiver").value;
  const content = document.getElementById("message").value;

  const roomInput = document.getElementById("room");
  const room = roomInput && roomInput.value ? roomInput.value : "";

  if (!room || !stompClient || !stompClient.connected) {
    alert("Please join a room before sending messages.");
    return;
  }

  if (sender && receiver && content) {
    stompClient.send("/app/chat/" + room, {}, JSON.stringify({
      sender,
      receiver,
      content,
      room
    }));
    document.getElementById("message").value = "";
  } else {
    console.warn("⚠️ Sender, receiver or content missing!");
  }
}

function displayMessage(sender, receiver, content, timestamp, room) {
  const chatArea = document.getElementById("chatArea");
  const messageElement = document.createElement("div");
  messageElement.className = "message-bubble";
  messageElement.innerHTML = `<strong>${sender}</strong> to <strong>${receiver}</strong>: ${content}<br/><small>Room: ${room} | ${timestamp}</small>`;
  chatArea.appendChild(messageElement);
  chatArea.scrollTop = chatArea.scrollHeight;
}

function showNotification(title, message) {
  if (Notification.permission === "granted") {
    new Notification(title, {
      body: message,
      icon: "favicon.ico"
    });
  }
}

function loadMessageHistory(room) {
  fetch(`/api/chat-messages/room/${room}`) // ✅ correct endpoint
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      const chatArea = document.getElementById("chatArea");
      chatArea.innerHTML = "";
      data.forEach(msg => {
        displayMessage(msg.sender, msg.receiver, msg.content, msg.timestamp, msg.room);
      });
    })
    .catch(error => {
      console.error("❌ Error loading message history:", error.message);
      alert("❌ Failed to load chat history: " + error.message);
    });
}//logout function 

  function logout() {
  localStorage.removeItem("username");
  window.location.href = "login.html";
}




// ✅🧹 CLEAR CHAT HISTORY FUNCTION
function clearChatHistory() {
  const room = document.getElementById("room").value.trim();

  if (!room) {
    alert("Please enter a room name to clear chat history.");
    return;
  }

  fetch(`/api/chat-messages/room/${room}`, {
    method: "DELETE"
  })
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      document.getElementById("chatArea").innerHTML = "";
      alert("✅ Chat history cleared from server.");
    })
    .catch(error => {
      console.error("❌ Failed to delete chat history from server:", error);
      alert("❌ Failed to delete chat history from server.");
    });
}


