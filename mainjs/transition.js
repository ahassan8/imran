document.addEventListener('DOMContentLoaded', () => {
    const footer = document.querySelector('footer'); // Select the footer
    const allSections = document.querySelectorAll('.middle > div'); // All section divs
    const aboutIslamSection = document.getElementById('aboutis-section'); // About Islam section

    // Hide all sections initially
    allSections.forEach((section) => {
        section.style.display = 'none';
    });

    // Show About Islam section as the default
    if (aboutIslamSection) {
        aboutIslamSection.style.display = 'block';
    }

    // Hide the footer initially
    if (footer) {
        footer.style.display = 'none';
    }

    // Add delay on page load
    setTimeout(() => {
        document.body.style.visibility = 'visible';

        // Show the footer after delay
        if (footer) {
            footer.style.display = 'block';
        }
    }, 800); // 0.8-second delay

    // Section transition for links with data-target attribute
    const sectionNavLinks = document.querySelectorAll('a[data-target]');

    sectionNavLinks.forEach((link) => {
        link.addEventListener('click', (event) => {
            event.preventDefault(); // Prevent default behavior

            const targetSectionId = link.getAttribute('data-target'); // Get target section ID
            const targetSection = document.getElementById(targetSectionId);

            if (targetSection) {
                // Hide all sections and footer first
                allSections.forEach((section) => {
                    section.style.display = 'none';
                });
                if (footer) {
                    footer.style.display = 'none';
                }

                // Add delay before showing the target section and footer
                setTimeout(() => {
                    targetSection.style.display = 'block';
                    if (footer) {
                        footer.style.display = 'block';
                    }
                }, 600); // 0.6-second delay
            }
        });
    });
});








