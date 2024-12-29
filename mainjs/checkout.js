let cart = JSON.parse(localStorage.getItem('cart')) || {};

document.querySelectorAll('.shipping-option').forEach(option => {
    option.addEventListener('click', function () {
        // Remove 'selected' class from all options
        document.querySelectorAll('.shipping-option').forEach(opt => {
            opt.classList.remove('selected');
        });

        // Add 'selected' class to the clicked option
        this.classList.add('selected');

        // Get the selected shipping option
        const selectedOption = this.getAttribute('data-value');
        const shippingFee = calculateShipping(selectedOption);

        // Update the shipping fee and total amount dynamically
        document.getElementById('shippingFee').textContent = 
            shippingFee === 0 ? 'FREE' : `$${shippingFee.toFixed(2)}`;
        
        const subtotal = parseFloat(document.getElementById('subtotalAmount').textContent.replace('$', ''));
        const totalAmount = subtotal + shippingFee;
        document.getElementById('totalAmount').textContent = `$${totalAmount.toFixed(2)}`;
    });
});



// Load cart items and calculate total on page load
window.onload = async function () {
    const cartItemsContainer = document.getElementById('cartItemsContainer');
    const paymentSection = document.getElementById('paymentSection');
    const userInfoSection = document.getElementById('checkoutForm');
    const editInfoButton = document.getElementById('edit-info');
    const paymentOptionsDiv = document.getElementById('paymentOptions');
    const creditCardSection = document.getElementById('creditCardSection');
    const paypalSection = document.getElementById('paypalSection');

    let subtotalAmount = 0;
    let physicalItemsSubtotal = 0; // Subtotal for items that are not e-books

    if (Object.keys(cart).length === 0) {
        cartItemsContainer.innerHTML = '<div class="no-items-message">No items in Cart</div>';
        return;
    }

    // Fetch product details from product.json
    const products = await fetch('./maindata/products.json')
        .then((response) => response.json())
        .catch((error) => {
            console.error('Error loading product data:', error);
            return [];
        });

    // Render each cart item
    for (const productId in cart) {
        const product = cart[productId];

        // Find the product in the product.json file
        const productDetails = products.find((item) => item.id === parseInt(productId));
        const isEbook = productDetails?.category === 'E-books'; // Check if the product category is 'E-books'

        const itemTotal = (product.price / 100);
        subtotalAmount += itemTotal;

        // Add to physicalItemsSubtotal only if the item is not an eBook
        if (!isEbook) {
            physicalItemsSubtotal += itemTotal;
        }

        const productRow = document.createElement('div');
        productRow.classList.add('cart-item');
        productRow.innerHTML = `
            <img src="./images/${product.image}" alt="${product.title}" class="cart-item-image">
            <span class="quantity-bubble">${product.quantity}</span>
            <div class="item-details">
                <span class="title">${product.title}</span>
                <span class="price">$${itemTotal.toFixed(2)}</span>
            </div>
        `;
        cartItemsContainer.appendChild(productRow);
    }

    // Calculate shipping fee based on physicalItemsSubtotal
    const shippingFee = calculateShipping(physicalItemsSubtotal);
    const totalAmount = subtotalAmount + shippingFee;

    // Append totals to the cart items container
    cartItemsContainer.innerHTML += `
        <div class="total-section">
            <p>Subtotal: <span id="subtotalAmount">$${subtotalAmount.toFixed(2)}</span></p>
            <p>Shipping: <span id="shippingFee">$${shippingFee.toFixed(2)}</span></p>
            <p class="total-amount">Total: <span id="totalAmount">$${totalAmount.toFixed(2)}</span></p>
        </div>
    `;

    // Save the shipping and total details for later use
    saveOrderSummary(subtotalAmount, shippingFee, totalAmount);

    setupToggleFunctionality(); // Initialize toggle functionality

    setupBillingOptions(); // Initialize billing address functionality
};

// Calculate shipping fee based on selected shipping option
function calculateShipping(selectedOption) {
    let shippingFee = 0; // Default shipping fee is $0 (for free shipping)

    if (selectedOption === 'economy') {
        shippingFee = 0.00; // Free shipping
    } else if (selectedOption === 'standard') {
        shippingFee = 8.00; // $8 for standard shipping
    } else if (selectedOption === 'express') {
        shippingFee = 25.00; // $25 for express shipping
    }

    return shippingFee;
}

const selectedOption = document.querySelector('.shipping-option.selected');
const shippingSelection = selectedOption ? selectedOption.getAttribute('data-value') : "economy"; // Default to economy
saveOrderSummary(subtotalAmount, shippingFee, totalAmount, shippingSelection);



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

// Save order summary details to localStorage
function saveOrderSummary(subtotal, shipping, total, shippingSelection) {
    const orderSummary = {
        subtotal: subtotal.toFixed(2),
        shipping: shipping.toFixed(2),
        total: total.toFixed(2),
        shippingSelection: shippingSelection // Add the selected shipping option
    };
    localStorage.setItem('orderSummary', JSON.stringify(orderSummary));
}


// Toggle between sections
function setupToggleFunctionality() {
    const continueToPaymentButton = document.getElementById('continueToPaymentButton');
    const userInfoSection = document.getElementById('checkoutForm');
    const paymentSection = document.getElementById('paymentSection');
    const editInfoButton = document.getElementById('edit-info');
    const paymentOptionsDiv = document.getElementById('paymentOptions');
    const creditCardSection = document.getElementById('creditCardSection');
    const paypalSection = document.getElementById('paypalSection');
    const changeToOptionsFromCard = document.getElementById('changeToOptionsFromCard');
    const changeToOptionsFromPaypal = document.getElementById('changeToOptionsFromPaypal');

    // Initially hide all payment-related sections
    paymentSection.style.display = 'none';
    creditCardSection.style.display = 'none';
    paypalSection.style.display = 'none';

    // Show payment section when "Continue to Payment" is clicked
    continueToPaymentButton.addEventListener('click', function () {
        if (validateUserInfo()) {
            // Hide user info section and show payment section
            userInfoSection.style.display = 'none';
            paymentSection.style.display = 'block';

            // Populate the summary box in the payment section
            document.getElementById('summaryName').textContent = 
            `${document.getElementById('firstName').value} ${document.getElementById('lastName').value}`;
            document.getElementById('summaryEmail').textContent = document.getElementById('email').value;
            document.getElementById('summaryPhone').textContent = document.getElementById('phone').value;
            document.getElementById('summaryAddress').textContent = `
                ${document.getElementById('address').value},
                ${document.getElementById('city').value},
                ${document.getElementById('state').value},
                ${document.getElementById('zip').value}
            `.trim();
        } else {
            alert('Please fill out all required fields before continuing.');
        }
    });

    // Show user info section when "Edit Information" is clicked
    editInfoButton.addEventListener('click', function () {
        paymentSection.style.display = 'none';
        userInfoSection.style.display = 'block';
    });

    // Show credit card section
    document.querySelector("input[name='paymentMethod'][value='card']").addEventListener('click', function () {
        paymentOptionsDiv.style.display = 'none';
        creditCardSection.style.display = 'block';
    });

    // Show PayPal section
    document.querySelector("input[name='paymentMethod'][value='paypal']").addEventListener('click', function () {
        paymentOptionsDiv.style.display = 'none';
        paypalSection.style.display = 'block';
    });

    // Change payment method from credit card
    changeToOptionsFromCard.addEventListener('click', function () {
        creditCardSection.style.display = 'none';
        paymentOptionsDiv.style.display = 'block';
    });

    // Change payment method from PayPal
    changeToOptionsFromPaypal.addEventListener('click', function () {
        paypalSection.style.display = 'none';
        paymentOptionsDiv.style.display = 'block';
    });

    // Validate user info section
    function validateUserInfo() {
        const requiredFields = ['email', 'phone', 'firstName', 'lastName', 'address', 'city', 'state', 'zip'];
        let isValid = true;

        requiredFields.forEach(id => {
            const input = document.getElementById(id);
            if (!input.value.trim()) {
                isValid = false;
                input.nextElementSibling.textContent = 'This field is required.';
            } else {
                input.nextElementSibling.textContent = '';
            }
        });

        return isValid;
    }
}
