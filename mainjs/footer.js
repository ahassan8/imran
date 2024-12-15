document.addEventListener("DOMContentLoaded", () => {
    // Handle footer navigation links
    const footerNavLinks = document.querySelectorAll(".footer-nav-link");

    footerNavLinks.forEach(link => {
        link.addEventListener("click", (event) => {
            event.preventDefault();

            // Get the target section ID from the data attribute
            const targetId = link.getAttribute("data-target");
            const targetSection = document.getElementById(targetId);

            if (targetSection) {
                // Hide all sections
                const sections = document.querySelectorAll(".middle > div");
                sections.forEach(section => {
                    section.style.display = "none";
                });

                // Display the target section
                targetSection.style.display = "block";

                // Smoothly scroll to the target section
                targetSection.scrollIntoView({ behavior: "smooth" });
            }
        });
    });
});

