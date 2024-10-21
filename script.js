const nightTimes = [
  "01:06", "02:35", "04:06", "05:35", "07:06", "08:35", 
  "10:06", "11:35", "13:06", "14:35", "16:06", "17:35", 
  "19:06", "20:35", "22:06", "23:35"
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

async function fetchWars() {
  try {
    const response = await fetch('wars.json');
    const wars = await response.json();
    const warsList = document.getElementById('wars-list');
    warsList.innerHTML = '';

    wars.forEach(war => {
      const warItem = document.createElement('div');
      warItem.className = 'war-card';
      const warTime = new Date(war.time).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
      const TimeCount = new Date(war.time);
      const now = new Date();
      const timeDiff = TimeCount - now;
      const hours = Math.floor((timeDiff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((timeDiff / (1000 * 60)) % 60);

      const countdownText = timeDiff > 0 ? `Inicia em ${hours}h ${minutes}min` : 'A guerra já começou/acabou';
      const CorridaText = timeDiff > 0 ? `Corrida em ${hours}h ${minutes}min` : 'Corrida ja começou';
      console.log(war.tipo);
      
      if (war.tipo === "default"){

        warItem.innerHTML = `
        <div class="war-header">
          <span>${war.attackingGuild} vs ${war.defendingGuild}</span>
        </div>

        <div class="war-details">
          <span class="TempoGuerra">${countdownText}</span>
          <span class="war-time">${warTime}</span>
        </div>
        
        <span class="war-map">${war.map}</span><b>
      `;

      warsList.appendChild(warItem);

      } else{
        warItem.innerHTML = `
        <div class="war-header">
          <span>Corrida - ${war.map}</span>
        </div>

        <div class="war-details">
          <span class="TempoGuerra">${CorridaText}</span>
          <span class="war-time">${warTime}</span>
        </div>
        
        <span class="war-map-desc">Guild Ocupante: <texto class="war-map">${war.mapOwner} <cor class="${war.mapcolor}">[${war.colorfield}]</cor></texto></span><b>
      `;

      warsList.appendChild(warItem);
      }
      
    });
  } catch (error) {
    console.error('Erro ao carregar as guerras:', error);
  }
}

function startAutoUpdate(interval = 60000) {
  fetchWars();
  setInterval(fetchWars, interval);
}

startAutoUpdate();


