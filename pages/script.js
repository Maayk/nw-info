document.addEventListener("DOMContentLoaded", () => {
    const nameTextarea = document.getElementById("names");
    const searchInput = document.getElementById("search");
    const groupContainer = document.getElementById("pt-groups");
    const playerListContainer = document.getElementById("player-list");
    const playerGroupMap = JSON.parse(localStorage.getItem("playerGroupMap")) || {};
    const playerColorMap = JSON.parse(localStorage.getItem("playerColors")) || {};

    function loadPlayerNames() {
        playerListContainer.innerHTML = "";
        const names = nameTextarea.value.split('\n').map(name => name.trim()).filter(name => name);
        names.forEach(createPlayerElement);
        localStorage.setItem("playerNames", nameTextarea.value);
    }

    function formatNameToId(name) {
        return name.replace(/\s+/g, '_');
    }

    function createPlayerElement(name) {
        const playerElement = document.createElement("div");
        playerElement.classList.add("name");
        playerElement.textContent = name;
        playerElement.draggable = true;
        playerElement.id = `name-${formatNameToId(name)}`;
        playerElement.style.backgroundColor = playerColorMap[name] || "transparent";
        playerElement.addEventListener("dragstart", handleDragStart);
        playerElement.addEventListener("contextmenu", (e) => {
            e.preventDefault();
            showColorMenu(e, name);
        });
        playerListContainer.appendChild(playerElement);
    }

    function filterPlayerNames() {
        const searchTerm = searchInput.value.toLowerCase();
        const names = nameTextarea.value.split('\n').map(name => name.trim()).filter(name => name);

        playerListContainer.innerHTML = "";
        names.forEach(name => {
            if (name.toLowerCase().includes(searchTerm)) {
                createPlayerElement(name);
            }
        });
    }

    for (let i = 1; i <= 10; i++) {
        const group = document.createElement("div");
        group.classList.add("group");
        group.id = `pt-${i}`;
        group.innerHTML = `<span class="group-name">GRUPO ${i}</span>`;
        for (let j = 1; j <= 5; j++) {
            const slot = document.createElement("div");
            slot.classList.add("slot");
            slot.addEventListener("dragover", handleDragOver);
            slot.addEventListener("drop", handleDrop);
            group.appendChild(slot);
        }
        groupContainer.appendChild(group);
    }

    function handleDragStart(e) {
        const target = e.target.closest(".name, .slot > span");
        if (!target) return;
        e.dataTransfer.setData("text/plain", target.id);
    }

    function handleDragOver(e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
    }

    function handleDrop(e) {
        e.preventDefault();
        const draggedPlayerId = e.dataTransfer.getData("text/plain");
        const sourceElement = document.getElementById(draggedPlayerId);
        if (!sourceElement) return;

        const draggedPlayerName = sourceElement.textContent;
        const targetSlot = e.target.closest(".slot");
        if (!targetSlot) return;

        const targetPlayerElement = targetSlot.querySelector("span");
        if (targetPlayerElement) {
            swapPlayers(draggedPlayerName, targetPlayerElement.textContent);
        } else {
            movePlayerToSlot(draggedPlayerName, sourceElement, targetSlot);
        }

        saveGroupData();
    }

    function movePlayerToSlot(playerName, sourceElement, targetSlot) {
        const previousSlot = playerGroupMap[playerName];
        if (previousSlot) {
            previousSlot.innerHTML = "";
            previousSlot.style.backgroundColor = "transparent";
            delete playerGroupMap[playerName];
        }

        const playerColor = sourceElement.style.backgroundColor || "transparent";
        targetSlot.style.backgroundColor = playerColor;
        targetSlot.innerHTML = `
            <span id="slot-${formatNameToId(playerName)}" draggable="true" style="background-color: ${playerColor};">${playerName}</span>
            <button class="remove-btn" onclick="removePlayer('${playerName}')">X</button>
        `;
        playerGroupMap[playerName] = targetSlot;
        sourceElement.classList.add("allocated");
        sourceElement.draggable = false;

        const slotPlayerElement = targetSlot.querySelector(`#slot-${formatNameToId(playerName)}`);
        slotPlayerElement.addEventListener("dragstart", handleDragStart);

        saveGroupData();
    }

    function swapPlayers(playerName1, playerName2) {
        const slot1 = playerGroupMap[playerName1];
        const slot2 = playerGroupMap[playerName2];
        if (!slot1 || !slot2) return;

        const playerColor1 = slot1.querySelector(`#slot-${formatNameToId(playerName1)}`).style.backgroundColor;
        const playerColor2 = slot2.querySelector(`#slot-${formatNameToId(playerName2)}`).style.backgroundColor;

        slot1.innerHTML = `
            <span id="slot-${formatNameToId(playerName2)}" draggable="true" style="background-color: ${playerColor2};">${playerName2}</span>
            <button class="remove-btn" onclick="removePlayer('${playerName2}')">X</button>
        `;
        slot2.innerHTML = `
            <span id="slot-${formatNameToId(playerName1)}" draggable="true" style="background-color: ${playerColor1};">${playerName1}</span>
            <button class="remove-btn" onclick="removePlayer('${playerName1}')">X</button>
        `;

        playerGroupMap[playerName1] = slot2;
        playerGroupMap[playerName2] = slot1;

        slot1.querySelector(`#slot-${formatNameToId(playerName2)}`).addEventListener("dragstart", handleDragStart);
        slot2.querySelector(`#slot-${formatNameToId(playerName1)}`).addEventListener("dragstart", handleDragStart);

        slot1.style.backgroundColor = playerColor2;
        slot2.style.backgroundColor = playerColor1;

        saveGroupData();
    }

    function saveGroupData() {
        const groupData = {};
        Object.keys(playerGroupMap).forEach(playerName => {
            const slot = playerGroupMap[playerName];
            groupData[playerName] = {
                group: slot.closest(".group").id,
                slotIndex: Array.from(slot.parentNode.children).indexOf(slot),
                color: slot.style.backgroundColor
            };
        });
        localStorage.setItem("groupData", JSON.stringify(groupData));
    }

    function loadGroupData() {
        const groupData = JSON.parse(localStorage.getItem("groupData"));
        if (!groupData) return;
    
        Object.keys(groupData).forEach(playerName => {
            const data = groupData[playerName];
            const group = document.getElementById(data.group);
            const targetSlot = group.children[data.slotIndex];
            const playerColor = data.color;
    
            targetSlot.style.backgroundColor = playerColor;
            targetSlot.innerHTML = `
                <span id="slot-${formatNameToId(playerName)}" draggable="true" style="background-color: ${playerColor};">${playerName}</span>
                <button class="remove-btn" onclick="removePlayer('${playerName}')">X</button>
            `;
            
            playerGroupMap[playerName] = targetSlot;
            
            const slotPlayerElement = targetSlot.querySelector(`#slot-${formatNameToId(playerName)}`);
            slotPlayerElement.addEventListener("dragstart", handleDragStart);
        });
    }

    window.removePlayer = function(playerName) {
        const slot = playerGroupMap[playerName];
        if (slot) {
            slot.innerHTML = "";
            slot.style.backgroundColor = "transparent";
            delete playerGroupMap[playerName];

            const playerElement = document.getElementById(`name-${formatNameToId(playerName)}`);
            playerElement.classList.remove("allocated");
            playerElement.draggable = true;

            saveGroupData();
        }
    };

    window.setPlayerColor = function(color) {
        const selectedPlayerId = document.querySelector(".selected-player").id;
        const selectedPlayerElement = document.getElementById(selectedPlayerId);
        if (selectedPlayerElement) {
            selectedPlayerElement.style.backgroundColor = color;
            playerColorMap[selectedPlayerElement.textContent] = color;
            localStorage.setItem("playerColors", JSON.stringify(playerColorMap));
        }
        hideColorMenu();
    };

    function showColorMenu(event, playerName) {
        const colorMenu = document.getElementById("color-menu");
        colorMenu.style.top = `${event.clientY}px`;
        colorMenu.style.left = `${event.clientX}px`;
        colorMenu.style.display = "block";

        document.querySelectorAll(".name").forEach(nameElement => {
            nameElement.classList.remove("selected-player");
        });
        document.getElementById(`name-${formatNameToId(playerName)}`).classList.add("selected-player");
    }

    function hideColorMenu() {
        document.getElementById("color-menu").style.display = "none";
    }

    const savedNames = localStorage.getItem("playerNames");
    if (savedNames) {
        nameTextarea.value = savedNames;
    }

    nameTextarea.addEventListener("input", loadPlayerNames);
    searchInput.addEventListener("input", filterPlayerNames);
    loadPlayerNames();
    loadGroupData();
});
