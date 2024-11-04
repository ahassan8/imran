document.addEventListener('DOMContentLoaded', () => {
    const cartContainer = document.getElementById('cartContainer');
    const cartIcon = document.querySelector('.cart-icon');
    const closeCartButton = document.querySelector('.close-cart');
    const overlay = document.getElementById('overlay');
    const footer = document.querySelector('.site-footer');
    const progressBar = document.getElementById('progressBar');

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
                        <span id="quantity-${productId}">${product.quantity}</span>
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

// Update cart count and ensure View Cart button visibility
function updateCartCount() {
    let cart = JSON.parse(localStorage.getItem('cart')) || {};
    const cartCount = Object.values(cart).reduce((acc, item) => acc + item.quantity, 0);
    document.getElementById('cart-count').textContent = cartCount;

    // Show View Cart button if the cart is not empty
    Object.keys(cart).forEach(productId => {
        const viewCartButton = document.getElementById(`viewCart-${productId}`);
        if (viewCartButton) {
            viewCartButton.style.display = 'inline-block';
        }
    });
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

// Remove item and update cart instantly
function removeItem(productId) {
    let cart = JSON.parse(localStorage.getItem('cart')) || {};

    if (cart[productId]) {
        delete cart[productId];
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
