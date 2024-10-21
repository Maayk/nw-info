const nightTimes = [
  "01:06", "02:35", "04:06", "05:35", "07:06", "08:35", 
  "10:06", "11:35", "13:06", "14:35", "16:06", "17:35", 
  "19:06", "20:35", "22:06", "23:35"
];

let notificationMinutes = 0;
let nextNightTime = null;

let cachedTime = null;
let lastFetchTime = null;

async function getCurrentTimeInSaoPaulo() {
  const now = new Date();
  
  // Verifique se temos um tempo cacheado e se não passou de 60 segundos
  if (cachedTime && lastFetchTime && (now - lastFetchTime < 60000)) {
    return cachedTime; // Retorna o tempo cacheado
  }
  
  try {
    const response = await fetch('https://worldtimeapi.org/api/timezone/America/Sao_Paulo');
    if (!response.ok) throw new Error('Erro ao buscar a hora');
    const data = await response.json();
    cachedTime = new Date(data.datetime); // Armazena o tempo cacheado
    lastFetchTime = now; // Armazena o tempo da última requisição
    return cachedTime; // Retorna a hora oficial de São Paulo
  } catch (error) {
    console.error('Erro ao obter a hora de São Paulo:', error);
    // Como fallback, definindo a hora local como a hora de São Paulo
    const offset = -3; // São Paulo está em UTC-3
    const localDate = new Date();
    return new Date(localDate.getTime() + (offset * 60 * 60 * 1000));
  }
}


async function getNextNightTime() {
  const now = await getCurrentTimeInSaoPaulo();
  for (let time of nightTimes) {
    const [hours, minutes] = time.split(':');
    const nextTime = new Date(now);
    nextTime.setHours(hours, minutes, 0, 0);
    if (nextTime > now) return nextTime;
  }
  const firstTime = new Date(now);
  firstTime.setDate(now.getDate() + 1);
  const [hours, minutes] = nightTimes[0].split(':');
  firstTime.setHours(hours, minutes, 0, 0);
  return firstTime;
}

async function startCountdown() {
  const countdownEl = document.getElementById('countdown');
  nextNightTime = await getNextNightTime();

  setInterval(async () => {
    const now = await getCurrentTimeInSaoPaulo();
    const diff = nextNightTime - now;

    if (diff <= 0) {
      nextNightTime = await getNextNightTime();
      updateHistory(now);
    }

    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / (1000 * 60)) % 60);
    const seconds = Math.floor((diff / 1000) % 60);
    countdownEl.textContent = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }, 1000);
}

function updateHistory(time) {
  const historyList = document.getElementById('history-list');
  const li = document.createElement('li');
  li.textContent = `Night Time às ${time.getHours().toString().padStart(2, '0')}:${time.getMinutes().toString().padStart(2, '0')}`;
  historyList.prepend(li);
}

// Notificações
document.getElementById('enable-notifications').addEventListener('click', () => {
  notificationMinutes = parseInt(document.getElementById('notification-time').value);
  Notification.requestPermission().then(permission => {
    if (permission === "granted") {
      const notifyTime = new Date(nextNightTime.getTime() - notificationMinutes * 60000);
      const now = new Date();
      const timeUntilNotification = notifyTime - now;

      setTimeout(() => {
        new Notification('NIGHT TIME', { body: `Night Time começa em ${notificationMinutes} minutos!` });
      }, timeUntilNotification);
    }
  });
});

// Alternar entre claro/escuro
const currentMode = localStorage.getItem('mode') || 'light';
document.body.classList.add(`${currentMode}-mode`);
const toggleButton = document.getElementById('toggleMode');
toggleButton.textContent = currentMode === 'light' ? 'Ativar Modo Escuro' : 'Ativar Modo Claro';

toggleButton.addEventListener('click', () => {
  const newMode = document.body.classList.contains('light-mode') ? 'dark' : 'light';
  document.body.classList.toggle('light-mode');
  document.body.classList.toggle('dark-mode');
  localStorage.setItem('mode', newMode);
  toggleButton.textContent = newMode === 'light' ? 'Ativar Modo Escuro' : 'Ativar Modo Claro';
});

startCountdown();