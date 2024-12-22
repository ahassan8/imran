document.addEventListener("DOMContentLoaded", () => {
    const sections = document.querySelectorAll(".middle > div"); // All sections
    const productContainer = document.getElementById("productContainer"); // Product Display Div
    const sideMenu = document.getElementById("sideMenu"); // Side Menu

    // Function to hide all sections, including productContainer
    function hideAllSections() {
        sections.forEach(section => {
            section.style.display = "none";
        });
        if (productContainer) {
            productContainer.style.display = "none";
        }
    }

    // Function to show a specific section by ID
    function showSection(sectionId) {
        hideAllSections();
        const targetSection = document.getElementById(sectionId);
        if (targetSection) {
            targetSection.style.display = "block";
        }
    }

    // Handle Side Menu Links (data-menu-target)
    const sideMenuLinks = document.querySelectorAll('a[data-menu-target]');
    sideMenuLinks.forEach(link => {
        link.addEventListener("click", (event) => {
            event.preventDefault();

            // Show target section and close the menu
            const targetId = link.getAttribute("data-menu-target");
            showSection(targetId);
            sideMenu.classList.remove("open"); // Close the side menu
        });
    });

    // Handle Main Nav Links (data-target)
    const mainNavLinks = document.querySelectorAll('a[data-target]');
    mainNavLinks.forEach(link => {
        link.addEventListener("click", (event) => {
            event.preventDefault();

            // Show target section
            const targetId = link.getAttribute("data-target");
            showSection(targetId);
        });
    });
});




