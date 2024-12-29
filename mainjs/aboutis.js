document.addEventListener('DOMContentLoaded', function () {
    // Select all sections within the middle container
    const sections = document.querySelectorAll('.middle > div');

    // Select the About Islam link
    const aboutIslamLink = document.querySelector('[data-target="aboutis-section"]');

    // Event listener for the About Islam link
    aboutIslamLink.addEventListener('click', function (event) {
        event.preventDefault(); // Prevent default link behavior

        // Hide all sections
        sections.forEach(section => {
            section.style.display = 'none';
        });

        // Show the About Islam section
        const aboutIslamSection = document.getElementById('aboutis-section');
        if (aboutIslamSection) {
            aboutIslamSection.style.display = 'block';
        }
    });
});
