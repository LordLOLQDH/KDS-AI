const VERSION = "4.2";
const ENDPOINT = "https://eopvkwhcgznvubesaszv.supabase.co/functions/v1/ai-chat-v3";

const messages = document.querySelector("#messages");
const form = document.querySelector("#chat");
const input = document.querySelector("#input");
const updateApp = document.querySelector("#updateApp");

let messageCount = Number(sessionStorage.getItem("kds_ai_message_count") || "0");
let adminToken = "";
let adminMode = false;
let selectedModel = "default";

function setAdminStatus() {
  const status = document.querySelector("#modeStatus");
  if (status) status.textContent = adminMode ? "Admin-Modus" : "Online";
}

setAdminStatus();

const modelSelect = document.querySelector("#modelSelect");
if (modelSelect) {
  selectedModel = localStorage.getItem("kds_ai_model") || "default";
  if ([...modelSelect.options].some(o => o.value === selectedModel)) {
    modelSelect.value = selectedModel;
  } else {
    selectedModel = "default";
  }
  modelSelect.addEventListener("change", () => {
    selectedModel = modelSelect.value;
    localStorage.setItem("kds_ai_model", selectedModel);
  });
}

function add(text, cls) {
  const el = document.createElement("div");
  el.className = "msg " + cls;
  el.textContent = text;
  messages.appendChild(el);
  el.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

updateApp.addEventListener("click", (event) => {
  event.preventDefault();
  event.stopPropagation();

  updateApp.disabled = true;
  updateApp.textContent = "Aktualisiere …";

  // Admin-Status bewusst verwerfen.
  adminToken = "";
  adminMode = false;

  // Cache-Busting für die aktuelle Seite.
  const url = new URL(window.location.href);
  url.search = "";
  url.searchParams.set("update", Date.now().toString());

  // Navigation statt location.reload(), damit auch die HTML-Version neu geladen wird.
  window.location.href = url.toString();
});

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  e.stopPropagation();

  const message = input.value.trim();
  if (!message) return;

  // /exit beendet den Admin-Modus sofort.
  if (message.toLowerCase() === "/exit") {
    input.value = "";
    adminToken = "";
    adminMode = false;
    setAdminStatus();
    add(message, "user");
    add("Admin-Modus beendet.", "ai");
    input.focus();
    return;
  }

  input.value = "";
  add(message, "user");

  const normalizedMessage = message.toLowerCase().replace(/[!,.?]/g, "").trim();
  if (/^(hallo|hi|hey|guten morgen|guten tag|guten abend)$/.test(normalizedMessage)) {
    messageCount++;
    sessionStorage.setItem("kds_ai_message_count", String(messageCount));
    add("Hallo! Wie kann ich dir helfen?", "ai");
    input.focus();
    return;
  }

  add("…", "ai");

  const pending = messages.lastElementChild;
  const isFirstMessage = messageCount === 0;
  messageCount++;
  sessionStorage.setItem("kds_ai_message_count", String(messageCount));

  try {
    const r = await fetch(ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        message,
        isFirstMessage,
        adminToken,
        model: selectedModel
      })
    });

    const d = await r.json();

    if (!r.ok) {
      pending.textContent = d.error || `Serverfehler (${r.status}).`;
      return;
    }

    if (d.adminToken) {
      adminToken = d.adminToken;
      adminMode = true;
      setAdminStatus();
      pending.textContent = d.reply || "Admin-Modus aktiviert.";
    }

    if (d.mode === "exit") {
      adminToken = "";
      adminMode = false;
      setAdminStatus();
    }

    if (!d.adminToken) pending.textContent = d.reply || d.error || "Keine Antwort erhalten.";
  } catch (err) {
    console.error(err);
    pending.textContent = "Verbindungsfehler.";
  }

  input.focus();
});
