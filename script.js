const nightTimes = [
  "01:11", "02:41", "04:11", "05:41", "07:11", "08:41", 
  "10:11", "11:41", "13:11", "14:41", "16:11", "17:41", 
  "19:11", "20:41", "22:11", "23:41"
];

let notificationMinutes = 0;
let nextNightTime = getNextNightTime();

function getNextNightTime() {
  const now = new Date();
  for (let time of nightTimes) {
    const [hours, minutes] = time.split(':');
    const nextTime = new Date();
    nextTime.setHours(hours, minutes, 0, 0);
    if (nextTime > now) return nextTime;
  }
  // Se já passou de 23:41, retorna o próximo dia
  const firstTime = new Date();
  firstTime.setDate(now.getDate() + 1);
  const [hours, minutes] = nightTimes[0].split(':');
  firstTime.setHours(hours, minutes, 0, 0);
  return firstTime;
}

function startCountdown() {
  const countdownEl = document.getElementById('countdown');
  setInterval(() => {
    const now = new Date();
    const diff = nextNightTime - now;

    if (diff <= 0) {
      nextNightTime = getNextNightTime();
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
