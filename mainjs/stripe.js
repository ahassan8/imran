document.addEventListener("DOMContentLoaded", async function () {
    try {
        // Fetch the Stripe public key from the server
        const response = await fetch('https://api.imranfaith.com/get-stripe-publishable-key');

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const { publishableKey } = await response.json();

        // Initialize Stripe with the fetched public key
        const stripe = Stripe(publishableKey);
        const elements = stripe.elements();

        // Create the card number, expiry, and CVC elements
        const cardNumberElement = elements.create('cardNumber', { placeholder: 'Card Number' });
        const cardExpiryElement = elements.create('cardExpiry', { placeholder: 'Expiration date MM / YY' });
        const cardCvcElement = elements.create('cardCvc', { placeholder: 'Security code' });

        // Mount each element to its respective div
        cardNumberElement.mount('#card-number-element');
        cardExpiryElement.mount('#card-expiry-element');
        cardCvcElement.mount('#card-cvc-element');

        // Handle card brand detection and validation
        cardNumberElement.on('change', handleStripeError);
        cardExpiryElement.on('change', handleStripeError);
        cardCvcElement.on('change', handleStripeError);

        function handleStripeError(event) {
            const displayError = document.getElementById('card-errors');
            displayError.textContent = event.error ? event.error.message : '';
        }

        // Handle confirm purchase button logic
        document.getElementById('confirmPurchaseButton').addEventListener('click', async (event) => {
            event.preventDefault();

            if (!validateForm()) {
                displayError(document.getElementById('form-error'), 'Please complete all required fields.');
                return;
            }

            const totalAmount = parseFloat(document.getElementById('totalAmount').textContent.replace('$', ''));
            const orderID = generateOrderID();

            try {
                const cart = JSON.parse(localStorage.getItem('cart')) || {};
                const cartItems = Object.values(cart).map(item => ({
                    title: item.title,
                    price: (item.price / 100),
                    quantity: item.quantity
                }));

                if (cartItems.length === 0) {
                    displayError(document.getElementById('form-error'), 'Your cart is empty.');
                    return;
                }

                // Step 1: Create a Payment Intent on the server
                const paymentIntentResponse = await fetch('https://api.imranfaith.com/create-payment-intent', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ amount: totalAmount * 100 }) // Convert dollars to cents
                });

                const { clientSecret } = await paymentIntentResponse.json();

                // Step 2: Confirm the payment using the client secret and the card element
                const result = await stripe.confirmCardPayment(clientSecret, {
                    payment_method: {
                        card: cardNumberElement,
                        billing_details: {
                            name: `${document.getElementById('firstName').value} ${document.getElementById('lastName').value}`,
                            email: document.getElementById('email').value,
                        }
                    }
                });

                if (result.error) {
                    displayError(document.getElementById('form-error'), `Payment failed: ${result.error.message}`);
                } else if (result.paymentIntent.status === 'succeeded') {
                    document.getElementById('form-success').textContent = 'Your payment has been successfully processed!';
                    
                    // Store the order summary in localStorage
                    storeOrderSummary(orderID, cart);

                    // Send confirmation email using emailjs.js
                    try {
                        await sendEmailWithUserDetails(orderID, cartItems); // Call the function from emailjs.js
                    } catch (error) {
                        console.error('Error sending email:', error);
                    }

                    // Redirect to confirmation page
                    redirectToConfirmationAndClearCart();
                }
            } catch (error) {
                displayError(document.getElementById('form-error'), `Payment failed: ${error.message}`);
            }
        });

        // Store order summary in localStorage
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
                    name: `${document.getElementById('firstName').value} ${document.getElementById('lastName').value}`,
                    address: document.getElementById('address').value,
                    city: document.getElementById('city').value,
                    state: document.getElementById('state').value,
                    zip: document.getElementById('zip').value
                }
            };

            console.log("Order Summary Stored: ", orderSummary);
            localStorage.setItem('orderSummary', JSON.stringify(orderSummary));
        }

        // Redirect to confirmation page and clear the cart
        function redirectToConfirmationAndClearCart() {
            window.location.href = 'confirmation.html';
            localStorage.removeItem('cart');
        }

        // Validate form inputs
        function validateForm() {
            const requiredFields = ['firstName', 'lastName', 'email', 'address', 'city', 'state', 'zip'];
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

        function displayError(input, message) {
            const errorContainer = input.nextElementSibling || document.createElement('div');
            errorContainer.classList.add('error-message');
            errorContainer.textContent = message;
            input.after(errorContainer);
            input.classList.add('input-error');
        }

        function clearError(input) {
            const errorContainer = input.nextElementSibling;
            if (errorContainer && errorContainer.classList.contains('error-message')) {
                errorContainer.textContent = '';
            }
            input.classList.remove('input-error');
        }

        // Generate a unique order ID
        function generateOrderID() {
            const timestamp = Date.now();
            const randomNumber = Math.floor(Math.random() * 1000);
            return `ORD-${timestamp}-${randomNumber}`;
        }
    } catch (error) {
        console.error('Error initializing Stripe:', error);
    }
});
