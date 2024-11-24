// JavaScript to handle scrolling effect on navigation bar
document.addEventListener('DOMContentLoaded', function () {
    const nav = document.querySelector('.main-nav'); // Select the main navigation
    const navLeft = document.querySelector('.nav-left');
    const navRight = document.querySelector('.nav-right');
    const footer = document.querySelector('footer'); // Select the footer element

    // Function to toggle scrolled class based on scroll position
    function handleScroll() {
        if (window.scrollY > 50) { // Adjust value based on when you want the effect to kick in
            nav.classList.add('scrolled');
            navLeft.classList.add('scrolled');
            navRight.classList.add('scrolled');
        } else {
            nav.classList.remove('scrolled');
            navLeft.classList.remove('scrolled');
            navRight.classList.remove('scrolled');
        }
    }

    // Attach the scroll event listener to window
    window.addEventListener('scroll', handleScroll);

    // JavaScript for toggling the side menu
    const menuButton = document.querySelector('.menu-button');
    const sideMenu = document.getElementById('sideMenu');
    const closeMenuButton = document.getElementById('closeMenu'); // Select the close button

    // Toggle the menu when the button is clicked
    menuButton.addEventListener('click', () => {
        sideMenu.classList.toggle('open'); // Toggle the 'open' class
        toggleFooterVisibility(sideMenu.classList.contains('open')); // Show/hide the footer based on menu state
    });

    // Close the menu when the close button is clicked
    closeMenuButton.addEventListener('click', () => {
        sideMenu.classList.remove('open'); // Remove the 'open' class
        toggleFooterVisibility(false); // Show the footer when menu is closed
    });

    // Function to toggle footer visibility
    function toggleFooterVisibility(hide) {
        if (hide) {
            footer.style.display = 'none'; // Hide the footer
        } else {
            footer.style.display = 'block'; // Show the footer
        }
    }
});
