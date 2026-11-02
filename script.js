// ===== Running totals (in-memory only, per Chapter Three Section 3.5) =====
let totalEnergy = 0;
let totalLoad = 0;

// ===== Fixed assumptions (Chapter Three, Section 3.7 Assumptions Table) =====
const SYSTEM_EFFICIENCY = 0.80;        // accounts for wiring, dust, temperature losses
const BATTERY_DEPTH_OF_DISCHARGE = 0.80; // suitable for lithium-based batteries
const BATTERY_EFFICIENCY = 0.90;       // round-trip charge/discharge losses
const INVERTER_SAFETY_FACTOR = 1.25;   // 25% margin for surge/starting loads
const STANDARD_INVERTER_SIZES = [500, 1000, 1500, 2000, 3000, 5000, 10000];

function updateTotals() {
    document.getElementById("totalLoad").innerHTML =
        "Total Connected Load: " + totalLoad + " W";

    document.getElementById("totalEnergy").innerHTML =
        "Total Daily Energy: " + totalEnergy + " Wh";
}

function addAppliance() {
    let name = document.getElementById("applianceName").value.trim();
    let power = Number(document.getElementById("power").value);
    let quantity = Number(document.getElementById("quantity").value);
    let hours = Number(document.getElementById("hours").value);

    if (name === "" || power <= 0 || quantity <= 0 || hours <= 0 || hours > 24) {
        alert("Please enter valid appliance information.");
        return;
    }

    let applianceLoad = power * quantity;
    let dailyEnergy = applianceLoad * hours;

    totalLoad += applianceLoad;
    totalEnergy += dailyEnergy;

    let table = document.getElementById("applianceList");
    let row = table.insertRow();

    // NOTE: textContent is used (not innerHTML) so that an appliance name
    // containing HTML/script characters cannot be executed by the browser.
    row.insertCell(0).textContent = name;
    row.insertCell(1).textContent = power;
    row.insertCell(2).textContent = quantity;
    row.insertCell(3).textContent = hours;
    row.insertCell(4).textContent = dailyEnergy + " Wh";

    let actionCell = row.insertCell(5);
    let deleteButton = document.createElement("button");
    deleteButton.textContent = "Delete";

    deleteButton.onclick = function () {
        totalLoad -= applianceLoad;
        totalEnergy -= dailyEnergy;
        row.remove();
        updateTotals();
        document.getElementById("solarResult").innerHTML =
            'Enter appliances and click "Calculate Solar System".';
    };

    actionCell.appendChild(deleteButton);

    updateTotals();

    document.getElementById("applianceName").value = "";
    document.getElementById("power").value = "";
    document.getElementById("quantity").value = "";
    document.getElementById("hours").value = "";
}

function calculateSolar() {
    if (totalEnergy <= 0 || totalLoad <= 0) {
        alert("Please add at least one appliance first.");
        return;
    }

    let sunHours = Number(document.getElementById("sunHours").value);
    let panelRating = Number(document.getElementById("panelRating").value);
    let batteryVoltage = Number(document.getElementById("batteryVoltage").value);
    let batteryRating = Number(document.getElementById("batteryRating").value);

    if (sunHours <= 0 || panelRating <= 0 || batteryVoltage <= 0 || batteryRating <= 0) {
        alert("Please enter valid solar values.");
        return;
    }

    // ===== Formula 3: Required Solar Panel Capacity (Chapter 3, Section 3.7) =====
    // C_pv = E / (PSH * system efficiency)
    let requiredPanelCapacity = totalEnergy / (sunHours * SYSTEM_EFFICIENCY);

    // ===== Formula 4: Number of Panels =====
    let numberOfPanels = Math.ceil(requiredPanelCapacity / panelRating);

    // ===== Formula 5: Required Battery Capacity =====
    // C_bat = E / (V_batt * DoD * battery efficiency)
    let batteryCapacity =
        totalEnergy / (batteryVoltage * BATTERY_DEPTH_OF_DISCHARGE * BATTERY_EFFICIENCY);

    // ===== Formula 6: Number of Batteries =====
    let numberOfBatteries = Math.ceil(batteryCapacity / batteryRating);

    // ===== Formula 7: Inverter Capacity Requirement =====
    let inverterRequirement = totalLoad * INVERTER_SAFETY_FACTOR;

    let recommendedInverter = STANDARD_INVERTER_SIZES.find(function (size) {
        return size >= inverterRequirement;
    });

    if (recommendedInverter === undefined) {
        recommendedInverter = Math.ceil(inverterRequirement);
    }

    document.getElementById("solarResult").innerHTML =

        "<div class='result-card'>" +
        "<h3>Solar Panels</h3>" +
        "<p><b>Total Daily Energy:</b> " + totalEnergy.toFixed(2) + " Wh</p>" +
        "<p><b>Required Solar Capacity:</b> " + requiredPanelCapacity.toFixed(2) + " W</p>" +
        "<p><b>Recommended Panels:</b> " + numberOfPanels + " panel(s) of " + panelRating + " W</p>" +
        "</div>" +

        "<div class='result-card'>" +
        "<h3>Battery System</h3>" +
        "<p><b>Required Battery Capacity:</b> " + batteryCapacity.toFixed(2) + " Ah</p>" +
        "<p><b>Recommended Batteries:</b> " + numberOfBatteries + " battery/batteries of " + batteryRating + " Ah</p>" +
        "</div>" +

        "<div class='result-card'>" +
        "<h3>Inverter</h3>" +
        "<p><b>Total Connected Load:</b> " + totalLoad.toFixed(2) + " W</p>" +
        "<p><b>Minimum Inverter Requirement:</b> " + inverterRequirement.toFixed(2) + " W</p>" +
        "<p><b>Recommended Standard Inverter:</b> " + recommendedInverter + " W</p>" +
        "</div>";
}

function resetApp() {
    totalEnergy = 0;
    totalLoad = 0;

    document.getElementById("applianceList").innerHTML = "";
    document.getElementById("applianceName").value = "";
    document.getElementById("power").value = "";
    document.getElementById("quantity").value = "";
    document.getElementById("hours").value = "";

    updateTotals();

    document.getElementById("solarResult").innerHTML =
        'Enter appliances and click "Calculate Solar System".';
}
