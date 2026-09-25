import './style.css';

let gameMode = ""; // "ako" or "ikaw"
let currentWord = "";
let history = [];
let isGameOver = false;

// Screens
const screenMenu = document.getElementById('screen-menu');
const screenGame = document.getElementById('screen-game');
const screenResult = document.getElementById('screen-result');

// Elements
const chatBox = document.getElementById('chat-box');
const formAko = document.getElementById('form-ako');
const formIkaw = document.getElementById('form-ikaw');
const inputQuestion = document.getElementById('input-question');
const revealWord = document.getElementById('reveal-word');
const resultMsg = document.getElementById('result-msg');

function switchScreen(screen) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  screen.classList.add('active');
}

function appendMsg(text, sender) {
  const div = document.createElement('div');
  div.className = `msg ${sender}`;
  div.textContent = text;
  chatBox.appendChild(div);
  chatBox.scrollTop = chatBox.scrollHeight;
}

// Menu Handlers
document.getElementById('btn-mode-ako').addEventListener('click', () => startGame('ako'));
document.getElementById('btn-mode-ikaw').addEventListener('click', () => startGame('ikaw'));
document.getElementById('btn-again').addEventListener('click', () => switchScreen(screenMenu));
document.getElementById('btn-surrender').addEventListener('click', () => endGame(false));

async function startGame(mode) {

  gameMode = mode;
  history = [];
  isGameOver = false;
  chatBox.innerHTML = '';

  switchScreen(screenGame);

  if (gameMode === 'ako') {
    formAko.style.display = 'flex';
    formIkaw.style.display = 'none';

    appendMsg("Nag-iisip ako ng salita...", "ai");

    const buttons = document.querySelectorAll('button');
    buttons.forEach(b => b.disabled = true);
    inputQuestion.disabled = true;

    try {
      const prompt = "Magbigay ka ng isang pangkaraniwang salita sa Tagalog (pangngalan) na magandang pahulaan sa larong Pinoy Henyo. Tanging ang salita lamang ang isagot mo, walang ibang text at walang bantas. Maging random ka sa pagpili.";
      const contents = [{ role: 'user', parts: [{ text: prompt }] }];
      const reply = await callGemini(contents, "");
      currentWord = reply.trim();

      chatBox.innerHTML = '';
      appendMsg("Nakapili na ako ng salita. Magtanong ka na!", "ai");
    } catch (e) {
      chatBox.innerHTML = '';
      appendMsg("May error sa pag-iisip ng salita. Subukan muli.", "ai");
    } finally {
      buttons.forEach(b => b.disabled = false);
      inputQuestion.disabled = false;
      setTimeout(() => inputQuestion.focus(), 100);
    }
  } else {
    currentWord = "Sikreto ng User";
    formAko.style.display = 'none';
    formIkaw.style.display = 'flex';
    appendMsg("Isip ka ng salita. Ako ang magtatanong...", "ai");

    // Trigger AI's first question
    await askAI("Magsimula ka nang magtanong.");
  }
}

function endGame(isWin) {
  isGameOver = true;
  switchScreen(screenResult);

  if (isWin) {
    resultMsg.textContent = "Congratulations! Tama ang hula!";
  } else {
    resultMsg.textContent = "Game Over. Sumuko na.";
  }

  if (gameMode === 'ako') {
    revealWord.textContent = `Ang salita ay: ${currentWord}`;
  } else {
    revealWord.textContent = "";
  }
}

async function callGemini(contents, systemInstruction) {
  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      contents: contents,
      systemInstruction: systemInstruction
    })
  })

  if (!response.ok) {
    throw new Error('Failed to get a response from the server');
  }

  const data = await response.json();
  return data.reply
}

async function askAI(userText) {
  if (isGameOver) return;

  // Disable inputs while waiting
  const buttons = document.querySelectorAll('button');
  buttons.forEach(b => b.disabled = true);
  inputQuestion.disabled = true;

  if (userText !== "Magsimula ka nang magtanong.") {
    appendMsg(userText, "user");
  }

  history.push({ role: 'user', content: userText });

  let systemInstruction = "";
  if (gameMode === 'ako') {
    systemInstruction = `Ikaw ay naglalaro ng Pinoy Henyo bilang taga-sagot. Ang sikretong salita ay: "${currentWord}".
TANGING ISASAGOT MO LAMANG: "Oo", "Hindi", o "Pwede".
Wag magpaliwanag. Kung nahulaan ng user (hal: "Ito ba ay ${currentWord}?"), isagot: "Tama! Panalo!"`;
  } else {
    systemInstruction = `Ikaw ay naglalaro ng Pinoy Henyo bilang huhula. May naisip na salita ang user.
Magtanong ka ng ISA-ISA LAMANG para mahulaan ito (hal: "Tao ba ito?").
Ang user ay sasagot lamang ng Oo, Hindi, o Pwede. Gamitin mo ang mga sagot para paliitin ang kategorya hanggang sa mahulaan ang eksaktong salita.`;
  }

  const contents = history.map(msg => ({
    role: msg.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: msg.content }]
  }));

  try {
    const replyText = await callGemini(contents, systemInstruction);
    const reply = replyText.trim();

    history.push({ role: 'assistant', content: reply });
    appendMsg(reply, "ai");

    if (gameMode === 'ako' && (reply.toLowerCase().includes("tama") || reply.toLowerCase().includes("panalo"))) {
      setTimeout(() => endGame(true), 1000);
    }
  } catch (error) {
    console.error(error);
    appendMsg("Error talking to AI.", "ai");
  } finally {
    if (!isGameOver) {
      buttons.forEach(b => b.disabled = false);
      inputQuestion.disabled = false;
      if (gameMode === 'ako') inputQuestion.focus();
    }
  }
}

// User guesses (Mode: Ako)
formAko.addEventListener('submit', (e) => {
  e.preventDefault();
  const q = inputQuestion.value.trim();
  if (q) {
    inputQuestion.value = '';
    askAI(q);
  }
});

// AI guesses (Mode: Ikaw)
document.querySelectorAll('.ans-btn').forEach(btn => {
  btn.addEventListener('click', (e) => {
    const ans = e.target.getAttribute('data-ans');
    askAI(ans);
  });
});

document.getElementById('btn-tama').addEventListener('click', () => {
  appendMsg("Tama!", "user");
  setTimeout(() => endGame(true), 500);
});
