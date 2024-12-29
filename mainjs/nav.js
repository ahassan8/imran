document.addEventListener('DOMContentLoaded', function () {
    const nav = document.querySelector('.main-nav'); // Main navigation
    const navLeft = document.querySelector('.nav-left'); // Left-aligned navigation
    const navRight = document.querySelector('.nav-right'); // Right-aligned navigation
    const footer = document.querySelector('footer'); // Footer
    const menuButton = document.querySelector('.menu-button'); // Menu button
    const sideMenu = document.getElementById('sideMenu'); // Side menu
    const cartCount = document.querySelector('#cart-count'); // Cart count span
    const cartIcon = document.querySelector('.cart-icon img'); // Cart icon image
    const closeMenuButton = document.getElementById('closeMenu'); // Close menu button
    const sections = document.querySelectorAll('[data-section]'); // All sections with data-section attribute
    const defaultSection = document.getElementById('productContainer'); // Default section (Product Display)

    // Initialize: Show default section and hide others
    function initializeSections() {
        sections.forEach(section => {
            section.style.display = 'none'; // Hide all sections
        });
        if (defaultSection) {
            defaultSection.style.display = 'block'; // Show the default section
        }
    }

    initializeSections();

    // Function to toggle scrolled class on the navigation, cart count, and cart icon
    function handleScroll() {
        if (window.scrollY > 50) {
            nav.classList.add('scrolled');
            navLeft.classList.add('scrolled');
            navRight.classList.add('scrolled');
            if (cartCount) {
                cartCount.classList.add('scrolled'); // Change cart count color
            }
            if (cartIcon) {
                cartIcon.src = '../icons/scart.png'; // Switch to white cart icon
            }
        } else {
            nav.classList.remove('scrolled');
            navLeft.classList.remove('scrolled');
            navRight.classList.remove('scrolled');
            if (cartCount) {
                cartCount.classList.remove('scrolled'); // Revert cart count color
            }
            if (cartIcon) {
                cartIcon.src = '../icons/bcart.png'; // Switch back to black cart icon
            }
        }
    }

    // Attach scroll event listener
    window.addEventListener('scroll', handleScroll);
    // Toggle side menu
    menuButton.addEventListener('click', () => {
        sideMenu.classList.toggle('open');
        toggleFooterVisibility(sideMenu.classList.contains('open'));
    });

    closeMenuButton.addEventListener('click', () => {
        sideMenu.classList.remove('open');
        toggleFooterVisibility(false);
    });

    // Function to toggle footer visibility
    function toggleFooterVisibility(hide) {
        footer.style.display = hide ? 'none' : 'block';
    }

    // Handle section switching for nav links
    const navLinks = document.querySelectorAll('[data-target]');
    const sideMenuLinks = document.querySelectorAll('[data-menu-target]');

    function handleSectionSwitch(targetId) {
        const targetSection = document.querySelector(`[data-section="${targetId}"]`);

        if (targetSection) {
            // Hide all sections
            sections.forEach(section => {
                section.style.display = 'none';
            });

            // Show the target section
            targetSection.style.display = 'block';
        }
    }

    // Main nav links
    navLinks.forEach(link => {
        link.addEventListener('click', function (event) {
            event.preventDefault();
            const targetId = this.getAttribute('data-target');
            handleSectionSwitch(targetId);
        });
    });

    // Side menu links
    sideMenuLinks.forEach(link => {
        link.addEventListener('click', function (event) {
            event.preventDefault();
            const targetId = this.getAttribute('data-menu-target');
            handleSectionSwitch(targetId);

            // Close side menu after selecting a section
            sideMenu.classList.remove('open');
            toggleFooterVisibility(false);
        });
    });

    // Handle "Return to Shopping" buttons
    document.querySelectorAll('.return-to-shopping').forEach(button => {
        button.addEventListener('click', () => {
            // Hide all sections
            sections.forEach(section => {
                section.style.display = 'none';
            });

            // Show the default section
            if (defaultSection) {
                defaultSection.style.display = 'block';
            }
        });
    });

    // Specific handler for Donate Section
    const donateNavLink = document.querySelector('a[data-target="donate-section"]');
    if (donateNavLink) {
        donateNavLink.addEventListener('click', (event) => {
            event.preventDefault(); // Prevent default link behavior
            handleSectionSwitch("donate-section");
        });
    }

    // Load any donation-specific setup
    setupDonationHandlers();
});

// Function to show the donate section
function setupDonationHandlers() {
    // Additional logic for donations can go here
}
