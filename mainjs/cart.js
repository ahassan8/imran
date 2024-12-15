document.addEventListener('DOMContentLoaded', () => {
    renderCartItems(); // Render cart items when the page loads
    updateCartCount(); // Update the cart count in the navbar
});

// Function to render cart items dynamically in `cart.html`
function renderCartItems() {
    const cartItemsContainer = document.getElementById('cartItems'); // Container where cart items are displayed
    const cartTotalElement = document.getElementById('cartTotal'); // Total price display element

    let cart = JSON.parse(localStorage.getItem('cart')) || {}; // Retrieve cart data from localStorage
    let cartHTML = ''; // HTML to be inserted into the cart container
    let totalAmount = 0; // Track total amount

    if (Object.keys(cart).length === 0) {
        cartItemsContainer.innerHTML = '<p>Your cart is empty</p>';
        cartTotalElement.textContent = `$0.00`;
        return;
    }

    // Loop through cart items and create HTML structure for each
    for (const productId in cart) {
        const product = cart[productId];
        const itemTotal = (product.price * product.quantity) / 100;
        totalAmount += itemTotal;

        cartHTML += `
            <div class="cart-item" id="cart-item-${productId}">
                <div class="cart-item-image">
                    <img src="../images/${product.image}" alt="${product.title}">
                </div>
                <div class="cart-item-details">
                    <p class="cart-item-title">${product.title}</p>
                    <div class="cart-quantity-controls">
                        <button onclick="changeQuantity(${productId}, -1, ${product.stock})">-</button>
                        <input type="number" 
                               id="quantity-input-${productId}" 
                               class="quantity-input" 
                               value="${product.quantity}" 
                               min="1" 
                               max="${product.stock}" 
                               oninput="delayedQuantityUpdate(${productId}, ${product.stock})">
                        <button onclick="changeQuantity(${productId}, 1, ${product.stock})">+</button>
                    </div>
                    <span class="cart-item-price">$${itemTotal.toFixed(2)}</span>
                    <button class="remove-item" onclick="removeCartItem(${productId})">Remove</button>
                </div>
            </div>
        `;
    }

    cartItemsContainer.innerHTML = cartHTML;
    cartTotalElement.textContent = `$${totalAmount.toFixed(2)}`;
}

// Function to update the cart count in the navbar
function updateCartCount() {
    let cart = JSON.parse(localStorage.getItem('cart')) || {};
    const cartCount = Object.values(cart).reduce((acc, item) => acc + item.quantity, 0);
    document.getElementById('cart-count').textContent = cartCount;
}

// Function to change item quantity with stock control
function changeQuantity(productId, delta, stock) {
    let cart = JSON.parse(localStorage.getItem('cart')) || {};

    if (cart[productId]) {
        const newQuantity = cart[productId].quantity + delta;

        if (newQuantity > 0 && newQuantity <= stock) {
            cart[productId].quantity = newQuantity;
            localStorage.setItem('cart', JSON.stringify(cart));
            renderCartItems();
            updateCartCount();
        } else if (newQuantity > stock) {
            alert(`Only ${stock} items are available.`);
        }
    }
}

// Delayed quantity update function
let quantityUpdateTimeout;
function delayedQuantityUpdate(productId, stock) {
    clearTimeout(quantityUpdateTimeout);

    quantityUpdateTimeout = setTimeout(() => {
        const inputElement = document.getElementById(`quantity-input-${productId}`);
        let newQuantity = parseInt(inputElement.value);

        if (isNaN(newQuantity) || newQuantity < 1 || newQuantity > stock) {
            alert(`Please enter an amount between (1-${stock}).`);
            const cart = JSON.parse(localStorage.getItem('cart')) || {};
            inputElement.value = cart[productId]?.quantity || 1; // Reset to the cart's current quantity
        } else {
            updateQuantity(productId, newQuantity);
        }
    }, 3000);
}

// Update quantity directly from the input field
function updateQuantity(productId, newQuantity) {
    let cart = JSON.parse(localStorage.getItem('cart')) || {};

    if (cart[productId]) {
        cart[productId].quantity = newQuantity;
        localStorage.setItem('cart', JSON.stringify(cart));
        renderCartItems();
        updateCartCount();
    }
}

// Function to remove an item from the cart in `cart.html`
function removeCartItem(productId) {
    let cart = JSON.parse(localStorage.getItem('cart')) || {};

    if (cart[productId]) {
        delete cart[productId];
        localStorage.setItem('cart', JSON.stringify(cart));
        renderCartItems();
        updateCartCount();
    }
}
