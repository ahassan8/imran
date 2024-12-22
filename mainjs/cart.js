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

    let cart = JSON.parse(localStorage.getItem('cart')) || {};
    let cartHTML = '';
    let totalAmount = 0;

    if (Object.keys(cart).length === 0) {
        cartItemsContainer.innerHTML = '<p>Your cart is empty</p>';
        cartTotalElement.textContent = `$0.00`;
        return;
    }

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
                        <input 
                            type="number" 
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

// Delayed quantity update with spinner activation
let quantityUpdateTimeout;
function delayedQuantityUpdate(productId, stock) {
    clearTimeout(quantityUpdateTimeout);

    // Delay spinner activation by 0.5 seconds
    quantityUpdateTimeout = setTimeout(() => {
        showCartSpinner(); // Show spinner after delay

        setTimeout(() => {
            const inputField = document.getElementById(`quantity-input-${productId}`);
            let cart = JSON.parse(localStorage.getItem('cart')) || {};
            let currentQuantity = cart[productId]?.quantity || 1;
            let newQuantity = parseInt(inputField.value);

            if (isNaN(newQuantity) || newQuantity < 1 || newQuantity > stock) {
                inputField.value = currentQuantity; // Revert to current quantity if invalid
            } else {
                updateQuantity(productId, newQuantity);
            }

            hideCartSpinner(); // Hide spinner after the update
        }, 1500); // Time taken for the update
    }, 500); // Spinner delay
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

