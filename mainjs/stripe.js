document.addEventListener("DOMContentLoaded", async function () {
    try {
        // Fetch the Stripe public key from the server
        const response = await fetch('http://localhost:5000/get-stripe-publishable-key');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const { publishableKey } = await response.json();

        // Initialize Stripe
        const stripe = Stripe(publishableKey);
        const elements = stripe.elements();

        // Create Stripe Elements
        const cardNumberElement = elements.create('cardNumber', { placeholder: 'Card Number' });
        const cardExpiryElement = elements.create('cardExpiry', { placeholder: 'MM / YY' });
        const cardCvcElement = elements.create('cardCvc', { placeholder: 'CVC' });

        // Mount the card elements
        cardNumberElement.mount('#card-number-element');
        cardExpiryElement.mount('#card-expiry-element');
        cardCvcElement.mount('#card-cvc-element');

        // Handle card validation errors
        const handleCardErrors = (event) => {
            const errorContainer = document.getElementById('card-errors');
            if (errorContainer) {
                errorContainer.textContent = event.error ? event.error.message : '';
            }
        };
        cardNumberElement.on('change', handleCardErrors);
        cardExpiryElement.on('change', handleCardErrors);
        cardCvcElement.on('change', handleCardErrors);

        // Handle Confirm Purchase button click
        const confirmPurchaseButton = document.getElementById('confirmPurchaseButton');
        const successMessage = document.createElement('p');
        successMessage.style.color = 'green';
        successMessage.style.marginTop = '10px';
        successMessage.style.display = 'none';
        confirmPurchaseButton.parentNode.appendChild(successMessage);

        confirmPurchaseButton.addEventListener('click', async (event) => {
            event.preventDefault();
            confirmPurchaseButton.disabled = true; // Prevent multiple clicks
            successMessage.style.display = 'none';

            const totalAmountElement = document.getElementById('totalAmount');
            if (!totalAmountElement) {
                console.error('Total amount element not found!');
                confirmPurchaseButton.disabled = false;
                return;
            }

            const totalAmount = parseFloat(totalAmountElement.textContent.replace('$', ''));
            if (isNaN(totalAmount) || totalAmount <= 0) {
                document.getElementById('card-errors').textContent = 'Invalid total amount.';
                confirmPurchaseButton.disabled = false;
                return;
            }

            const orderID = generateOrderID();
            const cart = JSON.parse(localStorage.getItem('cart')) || {};
            const cartItems = Object.values(cart).map((item) => ({
                title: item.title,
                price: (item.price / 100),
                quantity: item.quantity,
            }));

            // Retrieve shipping information
            const shipping = {
                name: `${document.getElementById('firstName')?.value || ''} ${document.getElementById('lastName')?.value || ''}`,
                email: document.getElementById('email')?.value || '',
                phone: document.getElementById('phone')?.value || '',
                address: document.getElementById('address')?.value || '',
                apartment: document.getElementById('apartment')?.value || '',
                city: document.getElementById('city')?.value || '',
                state: document.getElementById('state')?.value || '',
                zip: document.getElementById('zip')?.value || '',
            };

            try {
                // Step 1: Create a Payment Intent
                const paymentIntentResponse = await fetch('http://localhost:5000/create-payment-intent', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ amount: Math.round(totalAmount * 100) }), // Convert to cents
                });

                if (!paymentIntentResponse.ok) {
                    throw new Error('Failed to create Payment Intent.');
                }

                const { clientSecret } = await paymentIntentResponse.json();

                // Step 2: Confirm the payment
                const result = await stripe.confirmCardPayment(clientSecret, {
                    payment_method: {
                        card: cardNumberElement,
                        billing_details: {
                            name: shipping.name,
                            email: shipping.email,
                        },
                    },
                });

                if (result.error) {
                    document.getElementById('card-errors').textContent = `Payment failed: ${result.error.message}`;
                } else if (result.paymentIntent.status === 'succeeded') {
                    successMessage.textContent = 'Payment successfully completed!';
                    successMessage.style.display = 'block';

                    // Store Order Summary
                    storeOrderSummary(orderID, cart, totalAmount, shipping);

                    // Send confirmation emails
                    try {
                        const adminEmailContent = createAdminEmail(orderID, cartItems, shipping, totalAmount);
                        const userEmailContent = createUserEmail(orderID, cartItems, shipping, totalAmount);

                        await sendEmailToServer(adminEmailContent);
                        await sendEmailToServer(userEmailContent);

                        // Redirect to confirmation page
                        setTimeout(redirectToConfirmationAndClearCart, 2000); // Wait 2 seconds for the success message
                    } catch (emailError) {
                        console.error('Error sending emails:', emailError);
                        document.getElementById('card-errors').textContent = 'Payment succeeded, but there was an issue sending confirmation emails.';
                    }
                }
            } catch (error) {
                console.error('Error during payment processing:', error);
                document.getElementById('card-errors').textContent = `Error during payment processing: ${error.message}`;
            } finally {
                confirmPurchaseButton.disabled = false;
            }
        });

        function storeOrderSummary(orderID, cart) {
            const orderSummary = {
                orderID: orderID,
                totalAmount: parseFloat(
                    document.getElementById('totalAmount')?.textContent.replace('$', '') || '0'
                ),
                items: Object.values(cart).map((item) => ({
                    title: item.title,
                    price: item.price / 100,
                    quantity: item.quantity,
                })),
                shipping: {
                    name: `${document.getElementById('firstName')?.value || ''} ${document.getElementById('lastName')?.value || ''}`,
                    email: document.getElementById('email')?.value || '',
                    phone: document.getElementById('phone')?.value || '',
                    address: document.getElementById('address')?.value || '',
                    apartment: document.getElementById('apartment')?.value || '',
                    city: document.getElementById('city')?.value || '',
                    state: document.getElementById('state')?.value || '',
                    zip: document.getElementById('zip')?.value || '',
                },
            };
    
            localStorage.setItem('orderSummary', JSON.stringify(orderSummary));
        }

        function generateOrderID() {
            const prefix = '99';
            const randomNumbers = Math.floor(10000000 + Math.random() * 90000000);
            return `${prefix}${randomNumbers}`;
        }

        function redirectToConfirmationAndClearCart() {
            localStorage.removeItem('cart');
            window.location.href = 'confirmation.html';
        }

        async function sendEmailToServer(emailPayload) {
            const response = await fetch('http://localhost:5000/send-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(emailPayload),
            });

            if (!response.ok) {
                throw new Error('Failed to send email');
            }
        }

        function createAdminEmail(orderID, cartItems, shipping, totalAmount) {
            return {
                to: 'admin@example.com',
                subject: `New Order: ${orderID}`,
                html: `
                    <h1>New Order Received</h1>
                    <p><strong>Order ID:</strong> ${orderID}</p>
                    <p><strong>Shipping Information:</strong></p>
                    <ul>
                        <li><strong>Name:</strong> ${shipping.name}</li>
                        <li><strong>Email:</strong> ${shipping.email}</li>
                        <li><strong>Phone:</strong> ${shipping.phone}</li>
                        <li><strong>Address:</strong> ${shipping.address}, ${shipping.apartment}, ${shipping.city}, ${shipping.state} ${shipping.zip}</li>
                    </ul>
                    <p><strong>Items:</strong></p>
                    <ul>${cartItems.map(item => `<li>${item.title} (x${item.quantity})</li>`).join('')}</ul>
                    <p><strong>Total Amount:</strong> $${totalAmount.toFixed(2)}</p>
                `,
            };
        }

        function createUserEmail(orderID, cartItems, shipping, totalAmount) {
            return {
                to: shipping.email,
                subject: `Order Confirmation: ${orderID}`,
                html: `
                    <h1>Thank You for Your Order!</h1>
                    <p><strong>Order ID:</strong> ${orderID}</p>
                    <p><strong>Shipping Information:</strong></p>
                    <ul>
                        <li><strong>Name:</strong> ${shipping.name}</li>
                        <li><strong>Email:</strong> ${shipping.email}</li>
                    </ul>
                    <p><strong>Items:</strong></p>
                    <ul>${cartItems.map(item => `<li>${item.title} (x${item.quantity})</li>`).join('')}</ul>
                    <p><strong>Total Amount:</strong> $${totalAmount.toFixed(2)}</p>
                `,
            };
        }
    } catch (error) {
        console.error('Error initializing Stripe:', error);
    }
});
