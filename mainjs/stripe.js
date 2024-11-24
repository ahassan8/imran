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
        const cardNumberElement = elements.create('cardNumber', {
            placeholder: 'Card Number' // Custom placeholder for card number
        });
        const cardExpiryElement = elements.create('cardExpiry', {
            placeholder: 'Expiration date MM / YY' // Custom placeholder for expiry date
        });
        const cardCvcElement = elements.create('cardCvc', {
            placeholder: 'Security code' // Custom placeholder for CVC
        });

        // Mount each element to its respective div
        cardNumberElement.mount('#card-number-element');
        cardExpiryElement.mount('#card-expiry-element');
        cardCvcElement.mount('#card-cvc-element');

        // Handle card brand detection and validation
        cardNumberElement.on('change', function(event) {
            const cardType = event.brand;

            // Hide all icons by default
            document.querySelectorAll('.card-icon').forEach(icon => icon.style.display = 'none');

            // Show the relevant card icon based on the detected brand
            if (cardType === 'visa') {
                document.getElementById('visa-icon').style.display = 'block';
            } else if (cardType === 'mastercard') {
                document.getElementById('mastercard-icon').style.display = 'block';
            } else if (cardType === 'amex') {
                document.getElementById('amex-icon').style.display = 'block';
            } else if (cardType === 'jcb') {
                document.getElementById('jcb-icon').style.display = 'block';
            }
        });

        // Handle validation errors from the Stripe elements
        cardNumberElement.on('change', event => handleStripeError(event));
        cardExpiryElement.on('change', event => handleStripeError(event));
        cardCvcElement.on('change', event => handleStripeError(event));

        // Function to handle Stripe errors and display them in the UI
        function handleStripeError(event) {
            const displayError = document.getElementById('card-errors');
            if (event.error) {
                displayError.textContent = event.error.message;
            } else {
                displayError.textContent = '';
            }
        }

        // Handle confirm purchase button logic
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

                // Step 1: Create a Payment Intent on the server
                const response = await fetch('https://api.imranfaith.com/create-payment-intent', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ amount: totalAmount * 100 }) // Convert dollars to cents
                });

                const { clientSecret } = await response.json();

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

                // Handle the result of the payment
                if (result.error) {
                    displayError(document.getElementById('form-error'), `Payment failed: ${result.error.message}`);
                } else {
                    if (result.paymentIntent.status === 'succeeded') {
                        document.getElementById('form-success').textContent = 'Your payment has been successfully processed!';
                        storeOrderSummary(orderID); // Store order details before clearing the cart
                        clearCartAndRedirect(); // Clear the cart and redirect to confirmation page
                    }
                }
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

            localStorage.setItem('orderSummary', JSON.stringify(orderSummary));
        }

        // Clear cart and redirect to confirmation page
        function clearCartAndRedirect() {
            localStorage.removeItem('cart');
            window.location.href = 'confirmation.html';
        }

        // Validate form inputs
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
    } catch (error) {
        console.error('Error initializing Stripe:', error);
    }
});
