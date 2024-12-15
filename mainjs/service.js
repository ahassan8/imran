// Function to show the services section and hide others
function showServicesSection() {
    // Hide all other sections
    const sections = document.querySelectorAll(".middle > div");
    sections.forEach(section => (section.style.display = "none"));

    // Display the services section
    const servicesSection = document.getElementById("services-section");
    if (servicesSection) {
        servicesSection.style.display = "block";
    }
}

// Event listener for "Services" navigation link
document.addEventListener("DOMContentLoaded", () => {
    const servicesNavLink = document.querySelector('a[data-target="services-section"]');
    if (servicesNavLink) {
        servicesNavLink.addEventListener("click", (event) => {
            event.preventDefault(); // Prevent default link behavior
            showServicesSection(); // Show the services section
        });
    }
});
