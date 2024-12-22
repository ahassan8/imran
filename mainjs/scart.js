document.addEventListener('DOMContentLoaded', () => {
    const cartContainer = document.getElementById('cartContainer');
    const cartIcon = document.querySelector('.cart-icon');
    const closeCartButton = document.querySelector('.close-cart');
    const overlay = document.getElementById('overlay');
    const footer = document.querySelector('.site-footer');

    // Create a spinner container above the scart div
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
    cartContainer.insertAdjacentElement('beforebegin', spinnerContainer); // Insert spinner above the cartContainer

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
        footer.style.display = 'none';
        document.body.style.overflow = 'hidden';
        localStorage.setItem('cartOpen', 'true');
        renderCartItems();
    }

    function closeCart() {
        cartContainer.style.display = 'none';
        overlay.style.display = 'none';
        footer.style.display = 'block';
        document.body.style.overflow = 'auto';
        localStorage.setItem('cartOpen', 'false');
    }

    cartIcon.addEventListener('click', toggleCartVisibility);
    closeCartButton.addEventListener('click', closeCart);
    overlay.addEventListener('click', closeCart);

    renderCartItems();
    updateCartCount();
});

// Render cart items and display the View Cart button if needed
function renderCartItems() {
    const cartItemsContainer = document.getElementById('cartItems');
    const cartTotalElement = document.getElementById('cartTotal');
    let cart = JSON.parse(localStorage.getItem('cart')) || {};
    let totalAmount = 0;
    let cartHTML = '';

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
                <img src="../images/${product.image}" alt="${product.title}" class="cart-item-image">
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
                            oninput="delayedQuantityUpdate(${productId}, ${product.stock})"
                        >
                        <button onclick="changeQuantity(${productId}, 1, ${product.stock})">+</button>
                    </div>
                    <div class="cart-item-price-container">
                        <span class="cart-item-price">$${itemTotal.toFixed(2)}</span>
                        <button class="remove-item" onclick="removeItem(${productId})">Remove</button>
                    </div>
                </div>
            </div>
        `;
    }

    cartItemsContainer.innerHTML = cartHTML;
    cartTotalElement.textContent = `$${totalAmount.toFixed(2)}`;
}

// Update cart count and show spinner above the scart div
function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem('cart')) || {};
    const cartCount = Object.values(cart).reduce((acc, item) => acc + item.quantity, 0);

    const cartCountElement = document.getElementById('cart-count');
    cartCountElement.textContent = cartCount;

}

// Change item quantity and update the cart instantly
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
            alert(`Only ${stock} items in stock. Cannot add more.`);
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
        }, 2000); // Time taken for the update
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

// Add to cart and show View Cart button if added
function addToCart(productId, price, title, image, stock) {
    let cart = JSON.parse(localStorage.getItem('cart')) || {};

    if (!cart[productId]) {
        cart[productId] = { quantity: 1, price, title, image, stock };
    } else if (cart[productId].quantity < stock) {
        cart[productId].quantity += 1;
    } else {
        alert(`Only ${stock} items in stock. Cannot add more.`);
        return;
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    renderCartItems();
    updateCartCount();

    // Ensure the View Cart button is shown
    const viewCartButton = document.getElementById(`viewCart-${productId}`);
    if (viewCartButton) {
        viewCartButton.style.display = 'inline-block';
    }
}

// CSS for spinner (Add this to your CSS file)
/*
#cart-spinner .spinner-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(255, 255, 255, 0.8);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    z-index: 9999;
}

.spinner-circle {
    border: 6px solid rgba(0, 0, 0, 0.1);
    border-top: 6px solid #007BFF;
    border-radius: 50%;
    width: 50px;
    height: 50px;
    animation: spin 1s linear infinite;
}

@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}
*/



