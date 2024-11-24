// Load mosque data on page load
let mosqueData = [];

document.addEventListener("DOMContentLoaded", async () => {
    try {
        const response = await fetch("../maindata/mosques.json");
        mosqueData = await response.json();
    } catch (error) {
        console.error("Error loading mosque data:", error);
    }
});

// Listen for Enter key press in the search input
document.getElementById("locationInput").addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
        searchMosques();
    }
});

function searchMosques() {
    const locationInput = document.getElementById("locationInput").value.trim().toLowerCase();
    const mosqueList = document.getElementById("mosqueList");
    mosqueList.innerHTML = "";

    // Filter mosques based on the input matching either the city or state
    const filteredMosques = mosqueData.filter(mosque =>
        mosque.city.toLowerCase().includes(locationInput) || 
        mosque.state.toLowerCase().includes(locationInput)
    );

    // Display the filtered list of mosques
    if (filteredMosques.length > 0) {
        filteredMosques.forEach(mosque => {
            const mosqueDiv = document.createElement("div");
            mosqueDiv.className = "mosque";
            mosqueDiv.innerHTML = `
                <h2>${mosque.name}</h2>
                <p><strong>Address:</strong> ${mosque.address}</p>
                <p><strong>Phone:</strong> ${mosque.phone}</p>
                <p><strong>Website:</strong> <a href="${mosque.website}" target="_blank">${mosque.website}</a></p>
            `;
            mosqueList.appendChild(mosqueDiv);
        });
    } else {
        mosqueList.innerHTML = "<p>No Mosques found, enter a specific city for better use.</p>";
    }
}

