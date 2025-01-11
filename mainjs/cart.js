document.addEventListener('DOMContentLoaded', () => {
    // Create spinner container above the cart items
    const spinnerContainer = document.createElement('div');
    spinnerContainer.id = 'cart-spinner';
    spinnerContainer.style.display = 'none'; // Initially hidden
    spinnerContainer.innerHTML = `
        <div class="spinner-container">
            <div></div>
            <div></div>
            <div></div>
            <div></div>
            <div></div>
            <div></div>
            <div></div>
            <div></div>
            </div>
        <p>Updating Cart...</p>
    `;
    document.body.insertAdjacentElement('beforebegin', spinnerContainer); // Add spinner to the page

    renderCartItems(); // Render cart items when the page loads
    updateCartCount(); // Update the cart count in the navbar
});

// Function to render cart items dynamically in `cart.html`
function renderCartItems() {
    const cartItemsContainer = document.getElementById('cartItems');
    const cartTotalElement = document.getElementById('cartTotal');

    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    let cartHTML = '';
    let totalAmount = 0;

    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<p>Your cart is empty</p>';
        cartTotalElement.textContent = `$0.00`;
        return;
    }

    cart.forEach((item, index) => {
        const { title, image, quantity, price } = item;
        const itemTotal = (price / 100);
        totalAmount += itemTotal;

        // Generate dropdown options dynamically
        const options = [
            { quantity: 25, price: 50 },
            { quantity: 50, price: 100 },
            { quantity: 100, price: 200 },
            { quantity: 250, price: 500 },
            { quantity: 500, price: 1000 },
            { quantity: 1000, price: 2000 },
        ]
            .map(
                (selection) => `
                <option value="${selection.quantity}|${selection.price}" ${
                    selection.quantity === quantity ? 'selected' : ''
                }>
                    ${selection.quantity} - $${selection.price}
                </option>
            `
            )
            .join('');

        cartHTML += `
            <div class="cart-item" id="cart-item-${index}">
                <div class="cart-item-image">
                    <img src="../images/${image}" alt="${title}">
                </div>
                <div class="cart-item-details">
                    <p class="cart-item-title">${title}</p>
                    <label for="cart-quantity-select-${index}" class="quantity-label"></label>
                    <select id="cart-quantity-select-${index}" 
                            class="quantity-select" 
                            onchange="updateCartSelection(${index}, this.value)">
                        ${options}
                    </select>
                    <p class="cart-item-price">$${itemTotal.toFixed(2)}</p>
                    <button class="remove-item" onclick="removeCartItem(${index})">Remove</button>
                </div>
            </div>
        `;
    });

    cartItemsContainer.innerHTML = cartHTML;
    cartTotalElement.textContent = `$${totalAmount.toFixed(2)}`;
}

// Update selection in the cart
function updateCartSelection(index, value) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    const [quantity, price] = value.split('|').map(Number);

    if (cart[index]) {
        cart[index].quantity = quantity;
        cart[index].price = price * 100; // Store price in cents
        localStorage.setItem('cart', JSON.stringify(cart)); // Save updated cart
        renderCartItems(); // Re-render cart items
        updateCartCount(); // Update cart count
    }
}

// Function to update the cart count in the navbar
function updateCartCount() {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    const cartCount = cart.length; // Count the number of unique items in the cart
    document.getElementById('cart-count').textContent = cartCount;
}

// Function to remove an item from the cart in `cart.html`
function removeCartItem(index) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];

    if (cart[index]) {
        cart.splice(index, 1); // Remove item by index
        localStorage.setItem('cart', JSON.stringify(cart)); // Update cart in localStorage
        renderCartItems(); // Re-render cart items
        updateCartCount(); // Update cart count
    }
}

// Show and hide the spinner
function showCartSpinner() {
    const spinnerContainer = document.getElementById('cart-spinner');
    if (spinnerContainer) {
        spinnerContainer.style.display = 'flex'; // Show spinner
        document.body.classList.add('spinner-active'); // Disable background interactions
    }
}

function hideCartSpinner() {
    const spinnerContainer = document.getElementById('cart-spinner');
    if (spinnerContainer) {
        spinnerContainer.style.display = 'none'; // Hide spinner
        document.body.classList.remove('spinner-active'); // Enable background interactions
    }
}


