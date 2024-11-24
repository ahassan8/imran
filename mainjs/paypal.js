document.addEventListener('DOMContentLoaded', async function () {
    try {
        // Fetch PayPal client ID from the server
        const response = await fetch('https://api.imranfaith.com/get-paypal-client-id');
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const { clientId } = await response.json();

        // Initialize PayPal buttons
        paypal.Buttons({
            fundingSource: paypal.FUNDING.PAYPAL, // Only show PayPal button
            style: {
                layout: 'vertical',
                color: 'blue',
                shape: 'pill',
                label: 'paypal'
            },
            createOrder: function (data, actions) {
                const totalAmount = calculateTotalAmount();
                if (totalAmount <= 0) {
                    document.getElementById('form-error').textContent = 'Your cart is empty. Please add items to your cart.';
                    return actions.reject();
                }
                return actions.order.create({
                    purchase_units: [{
                        amount: {
                            value: totalAmount.toFixed(2) // Pass total amount to PayPal
                        }
                    }]
                });
            },
            onApprove: function (data, actions) {
                return actions.order.capture().then(async function (details) {
                    console.log('PayPal Payment Successful:', details);
                    document.getElementById('form-success').textContent = `Payment completed by ${details.payer.name.given_name}.`;

                    // Generate Order ID
                    const orderID = generateOrderID();

                    // Prepare cart items to send (title and quantity only)
                    const cart = JSON.parse(localStorage.getItem('cart')) || {};
                    const cartItems = Object.values(cart).map(item => ({
                        title: item.title,
                        quantity: item.quantity
                    }));

                    // Store the order summary and shipping details in localStorage
                    storeOrderSummary(orderID, cart);

                    // Send confirmation email including Order ID and product quantity
                    try {
                        await sendEmailWithUserDetails(orderID, cartItems); // Pass the Order ID and cartItems to EmailJS
                        redirectToConfirmationAndClearCart(); // Clear cart and redirect
                    } catch (error) {
                        console.error('Error sending email:', error);
                        alert('An error occurred while sending the confirmation email. Please try again.');
                    }
                });
            },
            onError: function (err) {
                console.error('PayPal Error:', err);
                alert('An error occurred with PayPal. Please try again.');
            }
        }).render('#paypal-button-container'); // Render PayPal button
    } catch (error) {
        console.error('Error initializing PayPal:', error);
        document.getElementById('form-error').textContent = `Error initializing PayPal: ${error.message}`;
    }

    // Store order summary in localStorage to display on confirmation page
    function storeOrderSummary(orderID, cart) {
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

    // Calculate the total amount (subtotal + shipping)
    function calculateTotalAmount() {
        let cart = JSON.parse(localStorage.getItem('cart')) || {};
        const subtotal = calculateSubtotal(cart);
        const shippingFee = calculateShipping(subtotal);
        return subtotal + shippingFee;
    }

    // Function to calculate subtotal from cart items
    function calculateSubtotal(cart) {
        return Object.values(cart).reduce((total, item) => {
            return total + (item.price * item.quantity) / 100;
        }, 0);
    }

    // Function to calculate shipping fee based on subtotal
    function calculateShipping(subtotal) {
        if (subtotal <= 20.99) return 6.00;
        if (subtotal <= 50.99) return 8.50;
        if (subtotal <= 64.99) return 10.00;
        if (subtotal <= 99.99) return 12.00;
        if (subtotal <= 199.99) return 17.00;
        if (subtotal <= 299.99) return 23.00;
        if (subtotal <= 399.99) return 31.00;
        if (subtotal <= 499.99) return 35.00;
        return 0.00; // Free shipping for orders above $500
    }

    // Generate a unique order ID
    function generateOrderID() {
        return 'ORD-' + Math.random().toString(36).substr(2, 9).toUpperCase();
    }

    // Redirect to confirmation page and clear cart
    function redirectToConfirmationAndClearCart() {
        window.location.href = 'confirmation.html';
        localStorage.removeItem('cart'); // Clear cart
        updateCartCount(); // Update cart count in the navbar
    }

    // Update cart count in the navbar
    function updateCartCount() {
        const cart = JSON.parse(localStorage.getItem('cart')) || {};
        const cartCount = Object.values(cart).reduce((acc, item) => acc + item.quantity, 0);
        document.getElementById('cart-count').textContent = cartCount;
    }
});
