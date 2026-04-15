let chatOpen = false;

function toggleChat() {
  const chatbox = document.getElementById("chatbox");
  const iconOpen = document.getElementById("chat-icon-open");
  const iconClose = document.getElementById("chat-icon-close");
  const toggle = document.getElementById("chat-toggle");
  const badge = document.getElementById("chat-badge");

  if (chatbox.classList.contains("chatbox-hidden")) {
    chatbox.classList.remove("chatbox-hidden");
    chatbox.classList.add("chatbox-visible");
    iconOpen.style.display = "none";
    iconClose.style.display = "block";
    toggle.style.animation = "none";
    badge.style.display = "none";
    chatOpen = true;
    scrollToBottom();
    document.getElementById("input").focus();
  } else {
    chatbox.classList.remove("chatbox-visible");
    chatbox.classList.add("chatbox-hidden");
    iconOpen.style.display = "block";
    iconClose.style.display = "none";
    toggle.style.animation = "clinic-pulse 2.5s infinite";
    chatOpen = false;
  }
}

function handleKey(event) {
  if (event.key === "Enter") {
    event.preventDefault();
    sendMessage();
  }
}

function getTime() {
  const now = new Date();
  let hours = now.getHours();
  const minutes = now.getMinutes().toString().padStart(2, "0");
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12 || 12;
  return hours + ":" + minutes + " " + ampm;
}

function scrollToBottom() {
  const messages = document.getElementById("messages");
  setTimeout(function () {
    messages.scrollTop = messages.scrollHeight;
  }, 100);
}

function showTyping() {
  var indicator = document.getElementById("typing-indicator");
  indicator.style.display = "block";
  scrollToBottom();
}

function hideTyping() {
  document.getElementById("typing-indicator").style.display = "none";
}

function removeWelcome() {
  var welcome = document.getElementById("welcome-section");
  if (welcome) {
    welcome.style.transition = "all 0.3s ease";
    welcome.style.opacity = "0";
    welcome.style.transform = "scale(0.95)";
    setTimeout(function () {
      welcome.remove();
    }, 300);
  }
}

function appendMessage(text, sender) {
  var messages = document.getElementById("messages");
  var isUser = sender === "user";

  var messageDiv = document.createElement("div");
  messageDiv.className = "message " + (isUser ? "user-message" : "bot-message");

  var bubble = document.createElement("div");
  bubble.className = "message-bubble " + (isUser ? "user-bubble" : "bot-bubble");
  bubble.textContent = text;

  var meta = document.createElement("div");
  meta.className = "message-meta";

  if (!isUser) {
    var senderLabel = document.createElement("span");
    senderLabel.className = "message-sender";
    senderLabel.textContent = "Seven-Eight Clinic";
    meta.appendChild(senderLabel);

    var dot = document.createElement("span");
    dot.textContent = " • ";
    dot.style.color = "#b8cad6";
    dot.style.fontSize = "10px";
    meta.appendChild(dot);
  }

  var time = document.createElement("span");
  time.className = "message-time";
  time.textContent = getTime();
  meta.appendChild(time);

  messageDiv.appendChild(bubble);
  messageDiv.appendChild(meta);
  messages.appendChild(messageDiv);

  scrollToBottom();
}

function appendError(text) {
  var messages = document.getElementById("messages");

  var messageDiv = document.createElement("div");
  messageDiv.className = "message bot-message";

  var bubble = document.createElement("div");
  bubble.className = "message-bubble bot-bubble error-bubble";
  bubble.textContent = text;

  var meta = document.createElement("div");
  meta.className = "message-meta";

  var time = document.createElement("span");
  time.className = "message-time";
  time.textContent = getTime();
  meta.appendChild(time);

  messageDiv.appendChild(bubble);
  messageDiv.appendChild(meta);
  messages.appendChild(messageDiv);

  scrollToBottom();
}

async function sendMessage() {
  var input = document.getElementById("input");
  var msg = input.value.trim();

  if (!msg) return;

  removeWelcome();
  appendMessage(msg, "user");
  input.value = "";
  showTyping();

  try {
    var response = await fetch(
      "https://fanback-rosalie-touchingly.ngrok-free.dev/webhook/chat",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "true",
        },
      body: JSON.stringify({
  message: msg,
  user_id: localStorage.getItem("chat_user_id") || "fallback_user"
}),
      }
    );

    hideTyping();

    if (!response.ok) {
      throw new Error("Server error: " + response.status);
    }
var data = await response.json();

console.log("API RESPONSE:", data);

const botReply = data.text || data.message || data.reply || "No response from server";

console.log("BOT REPLY:", botReply);

appendMessage(botReply, "bot");
    
  } catch (error) {
    hideTyping();
    appendError(
      "⚠️ Sorry, we couldn't connect right now. Please try again or call our clinic directly."
    );
    console.error("Chat error:", error);
  }
}

function sendQuickMessage(msg) {
  document.getElementById("input").value = msg;
  sendMessage();
}

document.addEventListener("DOMContentLoaded", function () {
  
  // ✅ Ensure user_id is created once when page loads
if (!localStorage.getItem("chat_user_id")) {
  const id = "user_" + Math.random().toString(36).substring(2, 10);
  localStorage.setItem("chat_user_id", id);
}

console.log("USER ID INIT:", localStorage.getItem("chat_user_id"));
  var chatbox = document.getElementById("chatbox");

  var observer = new MutationObserver(function () {
    if (chatbox.classList.contains("chatbox-visible")) {
      setTimeout(function () {
        document.getElementById("input").focus();
      }, 400);
    }
  });
  observer.observe(chatbox, { attributes: true, attributeFilter: ["class"] });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && chatOpen) {
      toggleChat();
    }
  });
});
