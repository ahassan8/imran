let cart = JSON.parse(localStorage.getItem('cart')) || {};
let paymentCompleted = false; // Track payment completion
let paymentMethod = ''; // Store payment method

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
            <p>Subtotal <span id="subtotalAmount">$${subtotalAmount.toFixed(2)}</span></p>
            <p>Shipping <span id="shippingFee">$${shippingFee.toFixed(2)}</span></p>
            <p class="total-amount">Total <span id="totalAmount">$${totalAmount.toFixed(2)}</span></p>
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

// Confirm Purchase button logic (for Stripe)
document.getElementById('confirmPurchaseButton').addEventListener('click', async (event) => {
    event.preventDefault();

    if (!validateForm()) {
        displayError(document.getElementById('form-error'), 'Please complete all required fields.');
        return;
    }

    const totalAmount = parseFloat(document.getElementById('totalAmount').textContent.replace('$', ''));

    try {
        const orderID = generateOrderID(); // Generate Order ID

        // Ensure that cartItems is correctly populated as an array
        const cartItems = Object.values(cart).map(item => ({
            title: item.title,
            quantity: item.quantity
        })) || [];

        if (cartItems.length === 0) {
            displayError(document.getElementById('form-error'), 'Your cart is empty.');
            return;
        }

        await window.processStripePayment(totalAmount); // Trigger Stripe payment function from stripe.js
        await sendEmailWithUserDetails(orderID, cartItems); // Send email with Order ID and cartItems
        storeOrderSummary(orderID); // Store order details before clearing the cart
        clearCartAndRedirect(); // Clear the cart and redirect to confirmation page
    } catch (error) {
        displayError(document.getElementById('form-error'), `Payment failed: ${error.message}`);
    }
});

// Store order summary in localStorage to display on confirmation page
function storeOrderSummary(orderID) {
    const orderSummary = {
        orderID: orderID,
        totalAmount: parseFloat(document.getElementById('totalAmount').textContent.replace('$', '')),
        items: Object.values(cart).map(item => ({
            title: item.title,
            price: (item.price / 100),
            quantity: item.quantity
        })),
        shipping: {
            name: document.getElementById('firstName').value + ' ' + document.getElementById('lastName').value,
            address: document.getElementById('address').value,
            city: document.getElementById('city').value,
            state: document.getElementById('state').value,
            zip: document.getElementById('zip').value
        }
    };

    console.log("Storing order summary: ", orderSummary); // Debugging
    localStorage.setItem('orderSummary', JSON.stringify(orderSummary));
}

// Generate unique order ID
function generateOrderID() {
    return 'ORD-' + Math.random().toString(36).substr(2, 9).toUpperCase();
}

// Validate form inputs (ensure all required fields are filled)
function validateForm() {
    const requiredFields = ['firstName', 'lastName', 'email', 'address', 'city', 'state', 'zip', 'cardName'];
    let isValid = true;

    requiredFields.forEach(id => {
        const input = document.getElementById(id);
        if (!input.value.trim()) {
            displayError(input, 'This field is required.');
            isValid = false;
        } else {
            clearError(input);
        }
    });

    return isValid;
}

// Display error message
function displayError(input, message) {
    const errorContainer = input.nextElementSibling || document.createElement('div');
    errorContainer.classList.add('error-message');
    errorContainer.textContent = message;
    input.after(errorContainer);
    input.classList.add('input-error');
}

// Clear error messages
function clearError(input) {
    const errorContainer = input.nextElementSibling;
    if (errorContainer && errorContainer.classList.contains('error-message')) {
        errorContainer.textContent = '';
    }
    input.classList.remove('input-error');
}

// Clear cart and redirect to confirmation page
function clearCartAndRedirect() {
    window.location.href = 'confirmation.html';
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




