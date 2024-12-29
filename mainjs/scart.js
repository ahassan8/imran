document.addEventListener('DOMContentLoaded', () => {
    const cartContainer = document.getElementById('cartContainer');
    const cartIcon = document.querySelector('.cart-icon');
    const closeCartButton = document.querySelector('.close-cart');
    const overlay = document.getElementById('overlay');
    const TWO_DAYS = 2 * 24 * 60 * 60 * 1000; 

    // Check and clear data if the session has expired
    checkAndClearSession();

    // Initialize cart visibility from localStorage
    const isCartOpen = localStorage.getItem('cartOpen') === 'true';
    if (isCartOpen) openCart();

    function toggleCartVisibility() {
        const isCartVisible = cartContainer.style.display === 'block';
        isCartVisible ? closeCart() : openCart();
    }

    function openCart() {
        cartContainer.style.display = 'block';
        overlay.style.display = 'block';
        document.body.style.overflow = 'hidden';
        localStorage.setItem('cartOpen', 'true');
        renderCartItems();
    }

    function closeCart() {
        cartContainer.style.display = 'none';
        overlay.style.display = 'none';
        document.body.style.overflow = 'auto';
        localStorage.setItem('cartOpen', 'false');
    }

    // Clear all data and refresh the page
    function clearAllDataAndRefresh() {
        localStorage.clear(); // Clear all localStorage data
        sessionStorage.clear(); // Clear sessionStorage data
        document.body.style.overflow = 'auto'; // Reset scroll
        location.reload(); // Force a full page refresh
    }

    // Check session expiration
    function checkAndClearSession() {
        const sessionStart = localStorage.getItem('sessionStart');
        const now = Date.now();

        if (!sessionStart) {
            // If no session start time exists, set it now
            localStorage.setItem('sessionStart', now);
        } else if (now - sessionStart > TWO_DAYS) {
            // If more than 4 minutes have passed, clear data and refresh
            clearAllDataAndRefresh();
        }
    }

    cartIcon.addEventListener('click', toggleCartVisibility);
    closeCartButton.addEventListener('click', closeCart);
    overlay.addEventListener('click', closeCart);

    renderCartItems();
    updateCartCount();
});

function renderCartItems() {
    const cartItemsContainer = document.getElementById('cartItems');
    const cartTotalElement = document.getElementById('cartTotal');
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    let totalAmount = 0;
    let cartHTML = '';

    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<p>Your cart is empty</p>';
        cartTotalElement.textContent = `$0.00`;
        return;
    }


    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<p>Your cart is empty</p>';
        cartTotalElement.textContent = `$0.00`;
        return;
    }

    cart.forEach((item, index) => {
        const { quantity, price, title, image } = item; // Destructure valid properties
        totalAmount += price;

        // Generate dropdown options dynamically
        const options = [
            { quantity: 25, price: 50 },
            { quantity: 50, price: 100 },
            { quantity: 100, price: 200 },
            { quantity: 250, price: 300 },
            { quantity: 500, price: 500 },
            { quantity: 1000, price: 800 },
        ]
            .map(
                selection => `                
                <option value="${selection.quantity}|${selection.price}" ${
                    selection.quantity === quantity ? 'selected' : ''
                }>
                    ${selection.quantity} copies - $${selection.price}
                </option>
            `
            )
            .join('');

        cartHTML += `
        <div class="cart-item" id="cart-item-${index}">
            <img src="../images/${image}" alt="${title}" class="cart-item-image">
            <div class="cart-item-details">
                <p class="cart-item-title">${title}</p>
                <div class="quantity-div">
                <label for="cart-quantity-select-${index}" class="quantity-label"></label>
                <select id="cart-quantity-select-${index}" 
                        class="quantity-select" 
                        onchange="updateCartSelection(${index}, this.value)">
                        ${options}
                </select>
                </div>
                <div class="cart-item-price-container">
                <p class="cart-item-price">$ ${(price / 100).toFixed(2)}</p>
                <button class="remove-item" onclick="removeItem(${index})">Remove</button>               
                </div>
            </div>
        </div>
        `;

        // JavaScript for customizing the display in the dropdown
        setTimeout(() => {
            const dropdown = document.getElementById(`cart-quantity-select-${index}`);
            if (dropdown) {
                dropdown.addEventListener('change', () => {
                    dropdown.style.background = 'white';
                });

                // Customizing the display for the selected value
                dropdown.addEventListener('mousedown', function () {
                    dropdown.value = quantity; // Adjust dropdown for user clicks!
                });
            }
        });
    });

    cartItemsContainer.innerHTML = cartHTML;
    cartTotalElement.textContent = `$${(totalAmount / 100).toFixed(2)}`;
}

// Update cart count
function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const cartCount = cart.length; // Count the number of individual entries in the cart
    document.getElementById('cart-count').textContent = cartCount;
}

// Update selection in cart
function updateCartSelection(index, value) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    const [quantity, price] = value.split('|').map(Number);

    cart[index].quantity = quantity;
    cart[index].price = price * 100; // Store price in cents

    localStorage.setItem('cart', JSON.stringify(cart)); // Save updated cart
    renderCartItems(); // Re-render the cart items
    updateCartCount(); // Update cart count
}

// Remove item from cart
function removeItem(index) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];

    // Check if the item at the given index exists and remove it
    if (index >= 0 && index < cart.length) {
        cart.splice(index, 1); // Remove the item
    }

    // Update localStorage with the modified cart array
    localStorage.setItem('cart', JSON.stringify(cart));

    renderCartItems(); // Re-render the cart items
    updateCartCount(); // Update the cart count
}








