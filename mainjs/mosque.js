// Initialize mosque data array
let mosqueData = [];

// Function to show the mosque section
function showMosqueSection() {
    // Hide all other sections
    const sections = document.querySelectorAll(".middle > div");
    sections.forEach(section => (section.style.display = "none"));

    // Display the mosque section
    const mosqueSection = document.getElementById("mosque-section");
    mosqueSection.style.display = "block";
}

// Event listener for "Mosques near You" navigation link
document.addEventListener("DOMContentLoaded", () => {
    const mosqueNavLink = document.querySelector('a[data-target="mosque-section"]');
    if (mosqueNavLink) {
        mosqueNavLink.addEventListener("click", (event) => {
            event.preventDefault(); // Prevent default link behavior
            showMosqueSection();
        });
    }

    // Load mosque data
    loadMosqueData();
});

// Function to load mosque data
async function loadMosqueData() {
    try {
        const response = await fetch("../maindata/mosques.json");
        mosqueData = await response.json();
        console.log("Mosque Data Loaded Successfully:", mosqueData);

        // Add event listener to search input for "Enter" key
        const locationInput = document.getElementById("locationInput");
        locationInput.addEventListener("keydown", (event) => {
            if (event.key === "Enter") {
                searchMosques(); // Trigger search on Enter key
            }
        });
    } catch (error) {
        console.error("Error loading mosque data:", error);
    }
}

// Function to search mosques
function searchMosques() {
    const locationInput = document.getElementById("locationInput");
    const locationInputValue = locationInput.value.trim().toLowerCase();
    const mosqueList = document.getElementById("mosqueList");
    mosqueList.innerHTML = ""; // Clear previous results

    console.log("Search Input:", locationInputValue); // Debug search input

    // Normalize state input (handle full state names and abbreviations)
    const normalizedStateInput = normalizeState(locationInputValue);

    // Filter mosques with loose matching (fuzzy search)
    const filteredMosques = mosqueData.filter(mosque =>
        mosque.name.toLowerCase().includes(locationInputValue) ||
        mosque.city.toLowerCase().includes(locationInputValue) ||
        mosque.state.toLowerCase().includes(normalizedStateInput) ||
        mosque.address.toLowerCase().includes(locationInputValue) ||
        mosque.phone.toLowerCase().includes(locationInputValue)
    );

    console.log("Filtered Mosques:", filteredMosques); // Debug filtered results

    // Handle no matches and fallback
    if (filteredMosques.length === 0) {
        const fallbackMosques = mosqueData.filter(mosque =>
            mosque.state.toLowerCase().includes(normalizedStateInput) ||
            mosque.city.toLowerCase().startsWith(locationInputValue.slice(0, 3))
        );

        if (fallbackMosques.length > 0) {
            displayMosques(fallbackMosques, mosqueList, "No exact matches. Showing nearby mosques:");
        } else {
            const topMosques = mosqueData.slice(0, 5); // Show first 5 mosques as default
            displayMosques(topMosques, mosqueList, "No matches found. Here are some suggestions:");
        }
    } else {
        displayMosques(filteredMosques, mosqueList, "Search Results:");
    }
}

// Helper function to normalize state input
function normalizeState(input) {
    for (const [fullName, abbreviation] of Object.entries(stateMap)) {
        if (input === fullName.toLowerCase() || input === abbreviation.toLowerCase()) {
            return abbreviation.toLowerCase(); // Always return abbreviation in lowercase
        }
    }
    return input; // Return input as is if no match found
}

// Helper function to display mosques
function displayMosques(mosques, container, message) {
    const heading = document.createElement("p");
    heading.textContent = message;
    heading.className = "results-heading";
    container.appendChild(heading);

    mosques.forEach(mosque => {
        const mosqueDiv = document.createElement("div");
        mosqueDiv.className = "mosque";
        mosqueDiv.innerHTML = `
            <h2>${mosque.name}</h2>
            <p><strong>Address:</strong> ${mosque.address}</p>
            <p><strong>City:</strong> ${mosque.city}</p>
            <p><strong>State:</strong> ${mosque.state}</p>
            <p><strong>Phone:</strong> ${mosque.phone}</p>
            <p><strong>Website:</strong> <a href="${mosque.website}" target="_blank">${mosque.website}</a></p>
        `;
        container.appendChild(mosqueDiv);
    });

    console.log("Displayed Mosques:", mosques); // Debug displayed mosques
}

// State map for normalizing state input
const stateMap = {
    "alabama": "AL", "alaska": "AK", "arizona": "AZ", "arkansas": "AR",
    "california": "CA", "colorado": "CO", "connecticut": "CT", "delaware": "DE",
    "florida": "FL", "georgia": "GA", "hawaii": "HI", "idaho": "ID",
    "illinois": "IL", "indiana": "IN", "iowa": "IA", "kansas": "KS",
    "kentucky": "KY", "louisiana": "LA", "maine": "ME", "maryland": "MD",
    "massachusetts": "MA", "michigan": "MI", "minnesota": "MN", "mississippi": "MS",
    "missouri": "MO", "montana": "MT", "nebraska": "NE", "nevada": "NV",
    "new hampshire": "NH", "new jersey": "NJ", "new mexico": "NM", "new york": "NY",
    "north carolina": "NC", "north dakota": "ND", "ohio": "OH", "oklahoma": "OK",
    "oregon": "OR", "pennsylvania": "PA", "rhode island": "RI", "south carolina": "SC",
    "south dakota": "SD", "tennessee": "TN", "texas": "TX", "utah": "UT",
    "vermont": "VT", "virginia": "VA", "washington": "WA", "west virginia": "WV",
    "wisconsin": "WI", "wyoming": "WY"
};

