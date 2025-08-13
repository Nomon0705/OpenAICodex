import bot from './assets/bot.svg';
import user from './assets/user.svg';

const form = document.querySelector('form');
const chatContainer = document.querySelector('#chat_container');

let loadInterval;

function loader(element) {
  element.textContent = '';

  loadInterval = setInterval(() => {
    element.textContent += '.';
    if (element.textContent === '....') {
      element.textContent = '';
    }
  }, 300);
}

function typeText(element, text) {
  let index = 0;

  const interval = setInterval(() => {
    if (index < text.length) {
      element.innerHTML += text.charAt(index);
      index++;
    } else {
      clearInterval(interval);
    }
  }, 20);
}

function generateUniqueId() {
  const timestamp = Date.now();
  const randomNumber = Math.random().toString(16).slice(2);
  return `id-${timestamp}-${randomNumber}`;
}

function chatStripe(isAi, value, uniqueId) {
  return `
    <div class="wrapper ${isAi ? 'ai' : ''}">
      <div class="chat">
        <div class="profile">
          <img 
            src=${isAi ? bot : user} 
            alt="${isAi ? 'bot' : 'user'}" 
          />
        </div>
        <div class="message" id="${uniqueId}">${value}</div>
      </div>
    </div>
  `;
}

async function handleSubmit(e) {
  e.preventDefault();

  const prompt = new FormData(form).get('prompt').trim();
  if (!prompt) return;

  // User message
  chatContainer.innerHTML += chatStripe(false, prompt);
  form.reset();

  // Bot placeholder
  const uniqueId = generateUniqueId();
  chatContainer.innerHTML += chatStripe(true, '', uniqueId);
  chatContainer.scrollTop = chatContainer.scrollHeight;

  const messageDiv = document.getElementById(uniqueId);
  loader(messageDiv);

  try {
    const response = await fetch('https://codex-im0y.onrender.com/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt })
    });

    clearInterval(loadInterval);
    messageDiv.innerHTML = '';

    if (!response.ok) {
      throw new Error(await response.text());
    }

    const { bot } = await response.json();
    typeText(messageDiv, bot.trim());
  } catch (err) {
    messageDiv.innerHTML = 'Something went wrong';
    alert(err.message || err);
  }
}

form.addEventListener('submit', handleSubmit);
form.addEventListener('keyup', (e) => {
  if (e.key === 'Enter') {
    handleSubmit(e);
  }
});
