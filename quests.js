document.addEventListener("DOMContentLoaded", async () => {
    try {
        npcData = await loadJSON('npc.json');
        locationData = await loadJSON('location.json');
        itemsData = await loadJSON('items.json');

        setupFactionList(npcData);
        setupEventListeners();
    } catch (error) {
        console.error("Error loading data files:", error);
    }
});

let factionDisposition = {}; // Stores faction dispositions (Friendly, Neutral, Hostile)
let npcData, locationData, itemsData; // Store JSON data

// Load JSON files
async function loadJSON(file) {
    const response = await fetch(file);
    if (!response.ok) throw new Error(`Failed to load ${file}`);
    return await response.json();
}

// Set up factions with disposition radio buttons
function setupFactionList(npcs) {
    const factionTable = document.getElementById("factionColumn");

    // Extract unique factions from npc data
    const factions = [...new Set(npcs.map(npc => npc.faction))];

    factions.forEach(faction => {
        // Create a row for the faction
        const row = document.createElement("tr");
        const factionCell = document.createElement("td");
        factionCell.textContent = faction;
        row.appendChild(factionCell);

        ["Friendly", "Neutral", "Hostile"].forEach(disposition => {
            const dispositionCell = document.createElement("td");
            const label = document.createElement("label");
            const radio = document.createElement("input");
            radio.type = "radio";
            radio.name = faction;
            radio.value = disposition;
            label.appendChild(radio);
            dispositionCell.appendChild(label);
            dispositionCell.classList.add(disposition.toLowerCase());

            radio.addEventListener("change", () => {
                factionDisposition[faction] = disposition;
                console.log(`Disposition set for ${faction}: ${disposition}`); // Debugging: Track disposition change
            });
        
            row.appendChild(dispositionCell);
        });
        
        factionTable.tBodies[0].appendChild(row);
    });
}

// Event listeners for buttons
function setupEventListeners() {
    document.getElementById("generateQuestButton").addEventListener("click", generateQuest);
    document.getElementById("clearButton").addEventListener("click", clearDispositions);
}

// Clear all faction dispositions
function clearDispositions() {
    factionDisposition = {};
    document.querySelectorAll("input[type=radio]").forEach(radio => radio.checked = false);
}

// Filter suitable factions, NPCs, locations, and items
function getSuitableData() {
    const suitableFactions = Object.keys(factionDisposition).filter(faction =>
        factionDisposition[faction] === "Friendly" || factionDisposition[faction] === "Neutral"
    );

    const hostileFactions = Object.keys(factionDisposition).filter(faction =>
        factionDisposition[faction] === "Hostile" || factionDisposition[faction] === "Neutral"
    );

    const suitableNPCs = npcData.filter(npc => suitableFactions.includes(npc.faction));
    const hostileNPCs = npcData.filter(npc => hostileFactions.includes(npc.faction));

    const suitableItems = itemsData.filter(item => {
        return locationData.some(location => item.locationClass.includes(location.class));
    });

    return {
        suitableFactions,
        hostileFactions,
        suitableNPCs,
        hostileNPCs,
        suitableLocations: locationData,
        suitableItems
    };
}

// Generate a quest based on selected or random quest type
function generateQuest() {
    const questType = document.getElementById("questTypeDropdown").value;
    const data = getSuitableData();

    // Randomly pick a location to get its class
    const randomLocation = getRandomElement(data.suitableLocations);
    const selectedClass = randomLocation.class;

    // Filter items based on the randomly selected class
    const filteredItems = data.suitableItems.filter(item => item.locationClass.includes(selectedClass));

    // Choose quest components based on quest type and dispositions
    const questFaction = getRandomElement(data.suitableFactions);
    const questNPC = getRandomElement(data.suitableNPCs.filter(npc => npc.faction === questFaction));
    const questLocation = randomLocation; // Use the randomly selected location
    const questItem = getRandomElement(filteredItems); // Randomly select from filtered items
    console.log("Quest Item:", questItem);
    const targetFaction = getRandomElement(data.hostileFactions);
    const targetNPC = getRandomElement(data.hostileNPCs.filter(npc => npc.faction === targetFaction));
    const targetLocation = getRandomElement(data.suitableLocations);

    const questDetails = {
        Retrieve: `Retrieve the ${questItem.item} for the ${questFaction} from ${targetLocation.type}. Size: ${targetLocation.size} Class: ${targetLocation.class}.`,
        Rescue: `Rescue the ${questFaction} ${questNPC.name} from the ${targetFaction} at ${targetLocation.size} ${targetLocation.class} ${targetLocation.type}.`,
        Escort: `Escort the ${questFaction} ${questNPC.name} from ${questLocation.size} ${questLocation.class} ${questLocation.type} to ${targetLocation.size} ${targetLocation.class} ${targetLocation.type} through ${targetFaction} territory.`,
        Eliminate: `Eliminate ${targetFaction} ${targetNPC.name} at ${targetLocation.size} ${targetLocation.class} ${targetLocation.type} on behalf of ${questFaction}.`
    };

    // Display quest, selecting random type if "Random" is chosen
    displayQuest(questDetails[questType] || questDetails[getRandomElement(Object.keys(questDetails))]);
}

// Utility function to get random array element
function getRandomElement(array) {
    return array[Math.floor(Math.random() * array.length)];
}

// Display the generated quest in the UI
function displayQuest(questText) {
    const questDisplay = document.getElementById("questDisplay");
    questDisplay.textContent = `Quest: ${questText}`;
}
