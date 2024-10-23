const currentNightTime = "14:23"; // Hora atual do night time
const intervalMinutes = 90; // Intervalo entre os ciclos em minutos

// Função para gerar a lista de horários
function generateNightTimes(currentNightTime) {
  const nightTimes = [];
  const [currentHours, currentMinutes] = currentNightTime.split(':').map(Number);
  const currentDate = new Date();
  
  // Adicionando horários anteriores
  for (let i = 0; i < 8; i++) { // 8 ciclos anteriores
    const pastTime = new Date(currentDate.getTime());
    pastTime.setHours(currentHours);
    pastTime.setMinutes(currentMinutes - (intervalMinutes * (8 - i)));
    nightTimes.unshift(pastTime.toTimeString().slice(0, 5)); // Formato "HH:MM"
  }

  // Adicionando o horário atual
  nightTimes.push(currentNightTime);

  // Adicionando horários futuros
  for (let i = 1; i <= 7; i++) { // 7 ciclos futuros
    const futureTime = new Date(currentDate.getTime());
    futureTime.setHours(currentHours);
    futureTime.setMinutes(currentMinutes + (intervalMinutes * i));
    nightTimes.push(futureTime.toTimeString().slice(0, 5)); // Formato "HH:MM"
  }

  return nightTimes.sort(); // Ordena os horários em ordem crescente
}

// Gerando os horários baseados no currentNightTime
const nightTimes = generateNightTimes(currentNightTime);

let nextNightTime = getNextNightTime();

function getNextNightTime() {
  const now = new Date();
  for (let time of nightTimes) {
    const [hours, minutes] = time.split(':');
    const nextTime = new Date();
    nextTime.setHours(hours, minutes, 0, 0);
    if (nextTime > now) return nextTime;
  }

  // Se não houver horários futuros, retorna o primeiro horário do próximo dia
  const firstTime = new Date();
  firstTime.setDate(now.getDate() + 1);
  const [hours, minutes] = nightTimes[0].split(':');
  firstTime.setHours(hours, minutes, 0, 0);
  return firstTime;
}

function startCountdown() {
  const countdownEl = document.getElementById('countdown');
  const dayNightMessageEl = document.getElementById('day-night-message'); // A nova div para a mensagem
  setInterval(() => {
    const now = new Date();
    const diff = nextNightTime - now;

    if (diff <= 0) {
      nextNightTime = getNextNightTime();
    }

    // Verifica em qual parte do ciclo estamos
    const nightDuration = 30 * 60 * 1000; // 30 minutos em milissegundos
    const totalDuration = 1.5 * 60 * 60 * 1000; // 1h30 em milissegundos
    const timeSinceNightStarted = now - nextNightTime + totalDuration; // Tempo desde que começou a noite

    let displayText = '';
    let remainingTime = diff;

    // Ajusta o tempo restante dependendo se está de noite ou de dia
    if (timeSinceNightStarted < nightDuration) {
      // Se ainda estamos nas primeiras 30 minutos
      remainingTime = nightDuration - timeSinceNightStarted;
      displayText = 'Está de noite - Noite termina em';
    } else if (timeSinceNightStarted < totalDuration) {
      // Se estamos na segunda parte do ciclo
      remainingTime = totalDuration - timeSinceNightStarted;
      displayText = 'Está de dia - Dia termina em:';
    }

    const hours = Math.floor((remainingTime / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((remainingTime / (1000 * 60)) % 60);
    const seconds = Math.floor((remainingTime / 1000) % 60);
    countdownEl.textContent = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    dayNightMessageEl.textContent = displayText; // Atualiza a mensagem na div

    updateNightTimesDisplay(now);
  }, 1000);
}

function updateNightTimesDisplay(now) {
  const nightTimesList = document.getElementById('night-times-list');
  nightTimesList.innerHTML = ''; // Limpa a lista antes de atualizar

  nightTimes.forEach(time => {
    const li = document.createElement('li');
    li.textContent = time;

    // Adiciona um símbolo de verificação para horários que já passaram
    const [hours, minutes] = time.split(':');
    const nightTimeDate = new Date();
    nightTimeDate.setHours(hours, minutes, 0, 0);
    
    if (nightTimeDate < now) {
      li.textContent += ' ✔️'; // Adiciona o símbolo de check
    }

    nightTimesList.appendChild(li);
  });
}

document.getElementById('enable-notifications').addEventListener('click', () => {
  const notificationMinutes = parseInt(document.getElementById('notification-time').value);
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

const currentMode = localStorage.getItem('mode') || 'dark'; // Define o modo escuro como padrão
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
    const response = await fetch('api/wars.json');
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

      const countdownText = timeDiff > 0 ? `Inicia em ${hours}h ${minutes}min` : 'A guerra já começou/terminou';
      const CorridaText = timeDiff > 0 ? `Corrida em ${hours}h ${minutes}min` : 'Corrida já começou/terminou';
      
      if (war.tipo === "default") {
        warItem.innerHTML = `
        <div class="war-header">
          <span>${war.attackingGuild} vs ${war.defendingGuild}</span>
        </div>

        <div class="war-details">
          <span class="TempoGuerra">${countdownText}</span>
          <span class="war-time">${warTime}</span>
        </div>
        
        <div class="bottom-war">
          <span class="war-map">${war.map}</span><b>
          <div class="guild-icons">
             <img src="${war.attackingIcon}" alt="Icone da Guilda Atacante"></img>
             <img src="${war.defendingIcon}" alt="Icone da Guilda Defensora"></img>
          </div>
        </div>
        `;
        warsList.appendChild(warItem);
      } else {
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

fetchWars();
