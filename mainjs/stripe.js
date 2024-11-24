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
            // Add more card types if needed
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

        // Function to process Stripe payment
        window.processStripePayment = async function (totalAmount) {
            try {
                // Step 1: Create a Payment Intent on the server
                const response = await fetch('https://api.imranfaith.com/create-payment-intent', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ amount: Math.round(totalAmount * 100) }) // Amount in cents
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                // Parse the JSON response to get the client secret
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

                // Step 3: Handle the result of the payment
                if (result.error) {
                    console.error("Payment failed:", result.error.message);
                    document.getElementById('card-errors').textContent = `Payment failed: ${result.error.message}`;
                } else {
                    if (result.paymentIntent.status === 'succeeded') {
                        document.getElementById('form-success').textContent = 'Your payment has been successfully processed!';
                        document.getElementById('confirmPurchaseButton').disabled = true;
                    }
                }
            } catch (error) {
                console.error("Error processing payment:", error);
                document.getElementById('card-errors').textContent = `Payment failed: ${error.message}`;
            }
        };

        // Optional function to handle payment success globally
        function handleStripePaymentSuccess() {
            console.log('Stripe Payment Successful');
            window.markPaymentAsCompleted(); // Mark payment as completed globally
        }
    } catch (error) {
        console.error('Error initializing Stripe:', error);
        document.getElementById('card-errors').textContent = `Error initializing payment process: ${error.message}`;
    }
});



