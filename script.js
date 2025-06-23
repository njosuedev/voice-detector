// Select elements
const recordBtn = document.querySelector(".record");
const result = document.querySelector(".result");
const downloadBtn = document.querySelector(".download");
const inputLanguage = document.querySelector("#language");
const clearBtn = document.querySelector(".clear");

let recognition;
let recording = false;

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

// Populate language options from languages.js
function populateLanguages() {
  languages.forEach(lang => {
    const option = document.createElement("option");
    option.value = lang.code;
    option.textContent = lang.name;
    inputLanguage.appendChild(option);
  });
}
populateLanguages();

// Start speech recognition
function startSpeechToText() {
  try {
    recognition = new SpeechRecognition();
    recognition.lang = inputLanguage.value;
    recognition.interimResults = true;

    // Update UI to show recording state
    recordBtn.classList.add("recording");
    recordBtn.querySelector("span").textContent = "Listening...";

    recognition.start();

    recognition.onresult = (event) => {
      let speechResult = event.results[0][0].transcript;

      if (event.results[0].isFinal) {
        // Command example
        if (speechResult.toLowerCase().includes("open my github")) {
          window.open("https://github.com/njosuedev", "_blank");
        } else {
          result.innerHTML += ` ${speechResult}`;
          const interim = result.querySelector(".interim");
          if (interim) interim.remove();
        }
        downloadBtn.disabled = false;
      } else {
        let interim = result.querySelector(".interim");
        if (!interim) {
          interim = document.createElement("p");
          interim.classList.add("interim");
          result.appendChild(interim);
        }
        interim.textContent = ` ${speechResult}`;
      }
    };

    recognition.onspeechend = () => {
      // Restart listening automatically
      startSpeechToText();
    };

    recognition.onerror = (event) => {
      stopRecording();

      const messages = {
        "no-speech": "No speech was detected. Try again.",
        "audio-capture": "No microphone was found. Please connect one.",
        "not-allowed": "Microphone permission is blocked.",
        "aborted": "Listening was stopped manually."
      };

      alert(messages[event.error] || `Recognition error: ${event.error}`);
    };

  } catch (err) {
    console.error("Speech recognition error:", err);
    stopRecording();
  }
}

// Handle Record Button Click
recordBtn.addEventListener("click", () => {
  if (!recording) {
    startSpeechToText();
    recording = true;
  } else {
    stopRecording();
  }
});

// Stop recording
function stopRecording() {
  if (recognition) recognition.stop();
  recording = false;
  recordBtn.querySelector("span").textContent = "Start Listening";
  recordBtn.classList.remove("recording");
}

// Download transcript
function downloadText() {
  const text = result.innerText.trim();
  if (!text) return;

  const blob = new Blob([text], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");

  a.href = url;
  a.download = "speech.txt";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Clear transcript
clearBtn.addEventListener("click", () => {
  result.innerHTML = "";
  downloadBtn.disabled = true;
});

// Enable download on click
downloadBtn.addEventListener("click", downloadText);
