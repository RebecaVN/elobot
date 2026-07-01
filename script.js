const form = document.getElementById("chatForm");
const input = document.getElementById("userInput");
const messages = document.getElementById("messages");
const homeScreen = document.getElementById("homeScreen");
const sideLogo = document.getElementById("sideLogo");

const micButton = document.querySelector(".icon-btn");

let started = false;
let voiceEnabled = true;

let CONFIG = {};
let history = [];

fetch("keys.json")
  .then(response => response.json())
  .then(data => {

    CONFIG = data;

    history = [
      {
        role: "system",
        content: CONFIG.bot.systemMessage
      }
    ];

  })
  .catch(error => {

    console.error("Erro ao carregar keys.json", error);

  });

form.addEventListener("submit", function (event) {

  event.preventDefault();

  const text = input.value.trim();

  if (!text) return;

  if (!started) {
    startChat();
  }

  addMessage(text, "user");

  input.value = "";

  askAzure(text);

});

function startChat() {

  homeScreen.style.display = "none";

  messages.style.display = "block";

  sideLogo.classList.remove("hidden");

  input.placeholder = "PERGUNTE QUALQUER COISA...";

  started = true;

}

function addMessage(text, type) {

  const div = document.createElement("div");

  div.className = "message " + type;

  const span = document.createElement("span");

  span.textContent = text;

  div.appendChild(span);

  if (type === "bot") {

    const speakBtn = document.createElement("button");

    speakBtn.className = "speak-btn";

    speakBtn.innerHTML = "🔊";

    speakBtn.title = "Ouvir resposta";

    speakBtn.addEventListener("click", () => {

      speak(text);

    });

    div.appendChild(speakBtn);

  }

  messages.appendChild(div);

  messages.scrollTop = messages.scrollHeight;

}

function showTyping() {

  const div = document.createElement("div");

  div.className = "message bot typing";

  div.id = "typing";

  div.innerHTML = "<span>Digitando...</span>";

  messages.appendChild(div);

  messages.scrollTop = messages.scrollHeight;

}

function removeTyping() {

  const typing = document.getElementById("typing");

  if (typing) {

    typing.remove();

  }

}

async function askAzure(userText) {

  history.push({
    role: "user",
    content: userText
  });

  showTyping();

  try {

    const response = await fetch(CONFIG.azure.endpoint, {

      method: "POST",

      headers: {

        "Content-Type": "application/json",

        "Authorization": "Bearer " + CONFIG.azure.apiKey

      },

      body: JSON.stringify({

        model: CONFIG.azure.model,

        messages: history,

        max_completion_tokens: CONFIG.request.maxCompletionTokens,

        reasoning_effort: CONFIG.request.reasoningEffort

      })

    });

    if (!response.ok) {

      throw new Error(await response.text());

    }

    const data = await response.json();

    removeTyping();

    const answer =
      data.choices?.[0]?.message?.content ||
      "Não consegui gerar uma resposta.";

    history.push({

      role: "assistant",

      content: answer

    });

    addMessage(answer, "bot");

  }
  catch (error) {

    removeTyping();

    addMessage("Erro ao conectar com a IA.", "bot");

    console.error(error);

  }

}


const SpeechRecognition =
    window.SpeechRecognition ||
    window.webkitSpeechRecognition;

let recognition = null;

if (SpeechRecognition) {

    recognition = new SpeechRecognition();

    recognition.lang = "pt-BR";

    recognition.continuous = false;

    recognition.interimResults = false;

    recognition.maxAlternatives = 1;

}

micButton.addEventListener("click", () => {

    startRecognition();

});

function startRecognition() {

    if (!recognition) {

        alert("Seu navegador não suporta reconhecimento de voz.");

        return;

    }

    micButton.disabled = true;

    recognition.start();

}

recognition && (recognition.onstart = () => {

    console.log("🎤 Ouvindo...");

});

recognition && (recognition.onresult = (event) => {

    micButton.disabled = false;

    const texto = event.results[0][0].transcript.trim();

    if (!texto)
        return;

    input.value = texto;

    form.requestSubmit();

});

recognition && (recognition.onerror = (event) => {

    micButton.disabled = false;

    console.error(event.error);

    switch (event.error) {

        case "not-allowed":
            alert("Permita o uso do microfone.");
            break;

        case "no-speech":
            console.log("Nenhuma fala detectada.");
            break;

        case "audio-capture":
            alert("Nenhum microfone encontrado.");
            break;

        default:
            console.log(event.error);

    }

});

recognition && (recognition.onend = () => {

    micButton.disabled = false;

});


async function speak(text) {

    if (!voiceEnabled)
        return;

    if (!CONFIG.speech)
        return;

    try {

        const ssml =
`<speak version="1.0"
xml:lang="pt-BR">

<voice name="${CONFIG.speech.voiceName}">

${escapeXml(text)}

</voice>

</speak>`;

        const response = await fetch(

            `https://${CONFIG.speech.region}.tts.speech.microsoft.com/cognitiveservices/v1`,

            {

                method: "POST",

                headers: {

                    "Ocp-Apim-Subscription-Key": CONFIG.speech.key,

                    "Content-Type": "application/ssml+xml",

                    "X-Microsoft-OutputFormat":
                        "audio-24khz-48kbitrate-mono-mp3"

                },

                body: ssml

            }

        );

        if (!response.ok) {

            throw new Error(await response.text());

        }

        const blob = await response.blob();

        const url = URL.createObjectURL(blob);

        const audio = new Audio(url);

        audio.play();

        audio.onended = () => {

            URL.revokeObjectURL(url);

        };

    }

    catch (error) {

        console.error(error);

    }

}

function toggleVoice() {

    voiceEnabled = !voiceEnabled;

    console.log(
        "Resposta por voz:",
        voiceEnabled ? "Ligada" : "Desligada"
    );

}
function escapeXml(text) {

    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&apos;");

}
