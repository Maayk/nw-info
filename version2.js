const nightTimes = [
  "01:06", "02:35", "04:06", "05:35", "07:06", "08:35", 
  "10:06", "11:35", "13:06", "14:35", "16:06", "17:35", 
  "19:06", "20:35", "22:06", "23:35"
];

let notificationMinutes = 0;
let nextNightTime = null;

async function getCurrentTimeInSaoPaulo() {
  const response = await fetch('http://worldtimeapi.org/api/timezone/America/Sao_Paulo');
  const data = await response.json();
  return new Date(data.datetime); // Retorna a hora oficial de São Paulo
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
