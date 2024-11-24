let cart = JSON.parse(localStorage.getItem('cart')) || {};

// Load cart items and calculate total on page load
window.onload = function () {
    const cartItemsContainer = document.getElementById('cartItemsContainer');
    let subtotalAmount = 0;

    if (Object.keys(cart).length === 0) {
        cartItemsContainer.innerHTML = '<div class="no-items-message">No items in Cart</div>';
        return;
    }

    // Render each cart item
    for (const productId in cart) {
        const product = cart[productId];
        const itemTotal = (product.price / 100) * product.quantity;
        subtotalAmount += itemTotal;

        const productRow = document.createElement('div');
        productRow.classList.add('cart-item');
        productRow.innerHTML = `
            <img src="../images/${product.image}" alt="${product.title}">
            <span class="quantity-bubble">${product.quantity}</span>
            <div class="item-details">
                <span class="title">${product.title}</span>
                <span class="price">$${itemTotal.toFixed(2)}</span>
            </div>
        `;
        cartItemsContainer.appendChild(productRow);
    }

    const shippingFee = calculateShipping(subtotalAmount);
    const totalAmount = subtotalAmount + shippingFee;

    cartItemsContainer.innerHTML += `
        <div class="total-section">
            <p>Subtotal: <span id="subtotalAmount">$${subtotalAmount.toFixed(2)}</span></p>
            <p>Shipping: <span id="shippingFee">$${shippingFee.toFixed(2)}</span></p>
            <p class="total-amount">Total: <span id="totalAmount">$${totalAmount.toFixed(2)}</span></p>
        </div>
    `;

    setupBillingOptions(); // Initialize billing address functionality
};

// Calculate shipping fee
function calculateShipping(subtotal) {
    if (subtotal <= 20.99) return 6.00;
    if (subtotal <= 50.99) return 8.50;
    if (subtotal <= 64.99) return 10.00;
    if (subtotal <= 99.99) return 12.00;
    if (subtotal <= 199.99) return 17.00;
    if (subtotal <= 299.99) return 23.00;
    if (subtotal <= 399.99) return 31.00;
    if (subtotal <= 499.99) return 35.00;
    return 0.00;
}

// Set up the billing address radio buttons functionality
function setupBillingOptions() {
    const billingOptions = document.getElementsByName('billingOption');
    const billingAddressFields = document.getElementById('billingAddressFields');

    billingOptions.forEach(option => {
        option.addEventListener('change', function () {
            if (this.value === 'different') {
                billingAddressFields.style.display = 'block';
            } else {
                billingAddressFields.style.display = 'none';
            }
        });
    });
}

// Restrict phone input to numbers only, limit to 15 digits
document.getElementById('phone').addEventListener('keypress', function (event) {
    const phoneNumber = document.getElementById('phone').value;
    if (!validateNumbersOnly({ value: event.key }) || phoneNumber.length >= 15) {
        event.preventDefault();
    }
});

// Prevent numbers in name and city fields
['firstName', 'lastName', 'city'].forEach(id => {
    document.getElementById(id).addEventListener('keypress', function (event) {
        if (/\d/.test(event.key)) {
            event.preventDefault(); // Prevent number input
        }
    });
});

// Function to validate numbers only input
function validateNumbersOnly(input) {
    const numbersPattern = /^[0-9]+$/;
    return numbersPattern.test(input.value);
}



