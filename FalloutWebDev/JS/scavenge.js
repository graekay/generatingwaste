function rollCombatDice() {
    let roll = Math.floor(Math.random() * 6) + 1;  // Random number between 1 and 6
    if (roll === 1) return 1;
    if (roll === 2) return 2;
    if (roll === 3 || roll === 4) return 0;
    if (roll === 5 || roll === 6) return 1;
}

function rollD20() {
    return Math.floor(Math.random() * 20) + 1;  // Random number between 1 and 20
}

function determineOtherCategory() {
    let roll = rollD20();
    if (roll <= 3) return 'Ammunition';
    if (roll <= 5) return 'Armor';
    if (roll <= 8) return 'Clothing';
    if (roll <= 11) return 'Food';
    if (roll <= 14) return 'Beverages';
    if (roll <= 16) return 'Chems';
    if (roll <= 18) return 'Weapons';
    return 'Oddities';
}

function generateLocation() {
    let locationType = document.getElementById("locationType").value;
    let locationScale = document.getElementById("locationScale").value;
    let degreeOfSearch = document.getElementById("degreeOfSearch").value;

    let scaleItems = {
        "Tiny": 6,
        "Small": 12,
        "Average": 18,
        "Large": 24
    };

    let totalItems = scaleItems[locationScale];

    let searchDifficulty = {
        "Untouched": { difficulty: 0, itemsReduced: 2 },
        "Partly Searched": { difficulty: 1, itemsReduced: 3 },
        "Mostly Searched": { difficulty: 2, itemsReduced: 4 },
        "Heavily Searched": { difficulty: 3, itemsReduced: 5 }
    };

    let degree = searchDifficulty[degreeOfSearch];
    let itemsReduced = degree.itemsReduced * (scaleItems[locationScale] / scaleItems["Tiny"]);

    let locationCategories = {
        "Residential": { Clothing: 1, Food: 1, Beverages: 1, Junk: 2, Other: 1 },
        "Commercial": { Food: 1, Beverages: 1, Junk: 2, Other: 2 },
        "Industry": { Clothing: 1, Armor: 1, Beverages: 1, Junk: 2, Other: 1 },
        "Medical": { Clothing: 1, Chems: 2, Junk: 2, Other: 1 },
        "Agriculture": { Food: 3, Beverages: 1, Junk: 1, Other: 1 },
        "Military": { Ammunition: 1, Armor: 1, Clothing: 1, Weapons: 1, Other: 2 }
    };

    let categoryItems = locationCategories[locationType];

    let scaleMultiplier = {
        "Tiny": 1,
        "Small": 2,
        "Average": 3,
        "Large": 4
    };

    let multiplier = scaleMultiplier[locationScale];
    let adjustedItems = {};

    // Calculate initial max and min items
    for (let item in categoryItems) {
        adjustedItems[item] = {
            max: categoryItems[item] * multiplier,
            min: categoryItems[item] * multiplier
        };
    }

    // Determine "Other" category items
    for (let i = 0; i < categoryItems['Other'] * multiplier; i++) {
        let otherCategory = determineOtherCategory();
        if (!adjustedItems[otherCategory]) {
            adjustedItems[otherCategory] = { max: 1, min: 1 };
        } else {
            adjustedItems[otherCategory].max += 1;
            adjustedItems[otherCategory].min += 1;
        }
    }

    // Remove 'Other' from the adjustedItems
    delete adjustedItems['Other'];

    // Adjust minimums based on degree of search
    let categories = Object.keys(adjustedItems);
    for (let i = 0; i < itemsReduced; i++) {
        let randomCategory = categories[Math.floor(Math.random() * categories.length)];
        if (adjustedItems[randomCategory].min > 0) {
            adjustedItems[randomCategory].min--;
        } else if (adjustedItems[randomCategory].max > 1) {
            adjustedItems[randomCategory].max--;
        }
    }

    // Displaying the result
    let resultDiv = document.querySelector(".result");
    resultDiv.innerHTML = `<p>Location Type: ${locationType}</p>
                           <p>Location Scale: ${locationScale}</p>
                           <p>Degree of Search: ${degreeOfSearch}</p>
                           <p>Search Difficulty: ${degree.difficulty}</p>
                           <p>Total Items: ${totalItems}</p>`;

    for (let item in adjustedItems) {
        resultDiv.innerHTML += `<p>${item}: Min ${adjustedItems[item].min}, Max ${adjustedItems[item].max}</p>`;
    }
}
