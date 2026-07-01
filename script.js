const form = document.getElementById("chatForm");
const input = document.getElementById("userInput");
const messages = document.getElementById("messages");
const homeScreen = document.getElementById("homeScreen");
const sideLogo = document.getElementById("sideLogo");

const micButton = document.querySelector(".icon-btn");

let started = false;
let voiceEnabled = true;

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
    startChat();
  }

  addMessage(text, "user");
  input.value = "";

  askAzure(text);
});

micButton.addEventListener("click", function () {
  startRecognition();
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
    span.innerText = text;

    div.appendChild(span);

    if (type === "bot") {

        const speakBtn = document.createElement("button");

        speakBtn.className = "speak-btn";

        speakBtn.innerHTML = "🔊";

        speakBtn.title = "Ouvir resposta";

        speakBtn.onclick = () => speak(text);

        div.appendChild(speakBtn);

    }

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

    const resposta = data.choices[0].message.content;

    addMessage(resposta, "bot");

  })
  .catch(error => {

    messages.lastChild.remove();

    addMessage("Erro ao conectar com a IA.", "bot");

    console.error(error);

  });

}


function startRecognition() {

  if (!CONFIG.speech) {
    alert("Speech não configurado no keys.json");
    return;
  }

  const speechConfig = SpeechSDK.SpeechConfig.fromSubscription(
    CONFIG.speech.key,
    CONFIG.speech.region
  );

  speechConfig.speechRecognitionLanguage = "pt-BR";

  const audioConfig =
    SpeechSDK.AudioConfig.fromDefaultMicrophoneInput();

  const recognizer =
    new SpeechSDK.SpeechRecognizer(
      speechConfig,
      audioConfig
    );

  micButton.disabled = true;

  recognizer.recognizeOnceAsync(

    function(result) {

      micButton.disabled = false;

      if (
        result.reason ===
        SpeechSDK.ResultReason.RecognizedSpeech
      ) {

        const texto = result.text.trim();

        if (texto !== "") {

          input.value = texto;

          // Envia automaticamente
          form.requestSubmit();

        }

      }
      else {

        console.log("Nenhuma fala reconhecida.");

      }

      recognizer.close();

    },

    function(err) {

      micButton.disabled = false;

      console.error(err);

      recognizer.close();

    }

  );

}



function speak(text) {

  if (!CONFIG.speech || !voiceEnabled)
    return;

  const speechConfig =
    SpeechSDK.SpeechConfig.fromSubscription(
      CONFIG.speech.key,
      CONFIG.speech.region
    );

  speechConfig.speechSynthesisLanguage = "pt-BR";

  speechConfig.speechSynthesisVoiceName =
    "pt-BR-FranciscaNeural";

  const synthesizer =
    new SpeechSDK.SpeechSynthesizer(
      speechConfig
    );

  synthesizer.speakTextAsync(

    text,

    function(result) {

      synthesizer.close();

    },

    function(err) {

      console.error(err);

      synthesizer.close();

    }

  );

}


function toggleVoice() {

  voiceEnabled = !voiceEnabled;

  console.log(
    "Resposta por voz:",
    voiceEnabled ? "Ligada" : "Desligada"
  );

}