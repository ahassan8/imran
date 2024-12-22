// Function to show the About section
function showAboutSection() {
    // Hide all other sections
    const sections = document.querySelectorAll(".middle > div");
    sections.forEach(section => (section.style.display = "none"));

    // Display the About section
    const aboutSection = document.getElementById("about-section");
    aboutSection.style.display = "block";
}

// Event listener for "About" navigation link
document.addEventListener("DOMContentLoaded", () => {
    const aboutNavLink = document.querySelector('a[data-target="about-section"]');
    if (aboutNavLink) {
        aboutNavLink.addEventListener("click", (event) => {
            event.preventDefault(); // Prevent default link behavior
            showAboutSection();
        });
    }
});
