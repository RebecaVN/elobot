const form = document.getElementById("chatForm");
const input = document.getElementById("userInput");
const messages = document.getElementById("messages");
const homeScreen = document.getElementById("homeScreen");
const sideLogo = document.getElementById("sideLogo");

let started = false;

let CONFIG = {};

fetch("keys.json")
  .then(response => response.json())
  .then(data => {
    CONFIG = data;
  })
  .catch(error => {
    console.error("Erro ao carregar keys.json", error);
  });

form.addEventListener("submit", function(event) {
  event.preventDefault();

  const text = input.value.trim();

  if (text === "") {
    return;
  }

  if (started === false) {
    homeScreen.style.display = "none";
    messages.style.display = "block";
    sideLogo.classList.remove("hidden");
    input.placeholder = "PERGUNTE QUALQUER COISA...";
    started = true;
  }

  addMessage(text, "user");
  input.value = "";

  askAzure(text);
});

function addMessage(text, type) {
  const div = document.createElement("div");
  div.className = "message " + type;
  div.innerText = text;

  messages.appendChild(div);
  messages.scrollTop = messages.scrollHeight;
}

function askAzure(userText) {
  addMessage("Digitando...", "bot");

  fetch(CONFIG.azure.endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + CONFIG.azure.apiKey
    },
    body: JSON.stringify({
      model: CONFIG.azure.model,
      messages: [
        {
          role: "system",
          content: CONFIG.bot.systemMessage
        },
        {
          role: "user",
          content: userText
        }
      ],
      max_completion_tokens: CONFIG.request.maxCompletionTokens,
      reasoning_effort: CONFIG.request.reasoningEffort
    })
  })
  .then(response => {
    if (!response.ok) {
      throw new Error("Erro HTTP: " + response.status);
    }
    return response.json();
  })
  .then(data => {
    messages.lastChild.remove();
    addMessage(data.choices[0].message.content, "bot");
  })
  .catch(error => {
    messages.lastChild.remove();
    addMessage("Erro ao conectar com a IA.", "bot");
    console.error(error);
  });
}