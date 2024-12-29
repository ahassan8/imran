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

        // Handle card validation errors
        const cardErrorsContainer = document.getElementById('card-errors'); // Reference the error container

        const handleCardErrors = (event) => {
            const errorContainer = document.getElementById('card-errors');
            if (errorContainer) {
                errorContainer.textContent = event.error ? event.error.message : '';
            }
        };
        cardNumberElement.on('change', handleCardErrors);
        cardExpiryElement.on('change', handleCardErrors);
        cardCvcElement.on('change', handleCardErrors);

        // Create spinner element
        const spinner = document.createElement('div');
        spinner.classList.add('spinner');
        spinner.style.display = 'none'; // Initially hidden
        spinner.innerHTML = `
            <div class="spinner-overlay">
                <div class="spinner-circle"></div>
                <p>Processing Payment...</p>
            </div>
        `;
        document.body.appendChild(spinner);

        // Add spinner styles
        const spinnerStyle = document.createElement('style');
        spinnerStyle.textContent = `
            .spinner-overlay {
                position: fixed;
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

            .spinner-overlay p {
                margin-top: 15px;
                font-size: 16px;
                color: #555;
                text-align: center;
            }

            @keyframes spin {
                0% {
                    transform: rotate(0deg);
                }
                100% {
                    transform: rotate(360deg);
                }
            }
        `;
        document.head.appendChild(spinnerStyle);

        confirmPurchaseButton.addEventListener('click', async (event) => {
            event.preventDefault();
            confirmPurchaseButton.disabled = true; // Prevent multiple clicks
            cardErrorsContainer.textContent = ''; // Clear previous errors
        
            const totalAmountElement = document.getElementById('totalAmount');
            if (!totalAmountElement) {
                cardErrorsContainer.textContent = 'Total amount element not found.';
                confirmPurchaseButton.disabled = false;
                return;
            }
        
            const totalAmount = parseFloat(totalAmountElement.textContent.replace('$', ''));
            if (isNaN(totalAmount) || totalAmount <= 0) {
                cardErrorsContainer.textContent = 'Invalid total amount.';
                confirmPurchaseButton.disabled = false;
                return;
            }

            // Generate Order ID
            const orderID = generateOrderID();

        
            const cart = JSON.parse(localStorage.getItem('cart')) || {};
            const cartItems = Object.values(cart).map((item) => ({
                title: item.title,
                price: item.price / 100,
                quantity: item.quantity,
            }));
        
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
                // Show spinner
                spinner.style.display = 'block';
        
                // Step 1: Create a Payment Intent
                const paymentIntentResponse = await fetch('http://localhost:5000/create-payment-intent', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ amount: Math.round(totalAmount * 100) }),
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
                    // Hide spinner and show errors
                    spinner.style.display = 'none';
                    cardErrorsContainer.textContent = `Payment failed: ${result.error.message}`;
                } else if (result.paymentIntent.status === 'succeeded') {
                    // Store Order Summary
                    storeOrderSummary(orderID, cart, totalAmount, shipping);
        
                    // Send confirmation emails
                    try {
                        const adminEmailContent = createAdminEmail(orderID, cartItems, shipping, totalAmount);
                        const userEmailContent = createUserEmail(orderID, cartItems, shipping, totalAmount);
        
                        await sendEmailToServer(adminEmailContent);
                        await sendEmailToServer(userEmailContent);
        
                        // Redirect to confirmation page after success
                        spinner.style.display = 'none';
                        window.location.href = 'confirmation.html';
                    } catch (emailError) {
                        // Hide spinner and show email error
                        spinner.style.display = 'none';
                        cardErrorsContainer.textContent = 'Payment succeeded, but an issue occurred while sending confirmation emails.';
                    }
                }
            } catch (error) {
                // Hide spinner and show error
                spinner.style.display = 'none';
                cardErrorsContainer.textContent = `Error during payment processing: ${error.message}`;
            } finally {
                confirmPurchaseButton.disabled = false; // Re-enable button
            }
        });
        
        
        

        function storeOrderSummary(orderID, cart, totalAmount, shipping) {
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
                shipping: shipping,
            };

            localStorage.setItem('orderSummary', JSON.stringify(orderSummary));
        }

        function generateOrderID() {
            const prefix = '99';
            const randomNumbers = Math.floor(10000000 + Math.random() * 90000000);
            return `${prefix}${randomNumbers}`;
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
                to: 'mysticvoiid2@gmail.com',
                subject: `New Order: ${orderID}`,
                html: `
                    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto;">
                        <h1 style="color: #D32F2F; text-align: center;">New Order Received</h1>
                        <p style="text-align: center; font-size: 16px; color: #555;">An order has been successfully placed on your website.</p>
                        
                        <h2 style="color: #333; margin-top: 20px;">Order Details</h2>
                        <p><strong>Order ID:</strong> ${orderID}</p>
                        <p><strong>Total Amount:</strong> $${totalAmount.toFixed(2)}</p>
                        
                        <h2 style="color: #333; margin-top: 20px;">Shipping Information</h2>
                        <ul style="list-style: none; padding: 0; font-size: 14px;">
                            <li><strong>Name:</strong> ${shipping.name}</li>
                            <li><strong>Email:</strong> <a href="mailto:${shipping.email}" style="color: #D32F2F;">${shipping.email}</a></li>
                            <li><strong>Phone:</strong> ${shipping.phone}</li>
                            <li><strong>Address:</strong> ${shipping.address}, ${shipping.apartment || ''}, ${shipping.city}, ${shipping.state} ${shipping.zip}</li>
                        </ul>
                        
                        <h2 style="color: #333; margin-top: 20px;">Items Ordered</h2>
                        <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
                            <thead>
                                <tr style="background-color: #f8f8f8; border-bottom: 2px solid #ddd;">
                                    <th style="text-align: left; padding: 8px;">Item</th>
                                    <th style="text-align: center; padding: 8px;">Quantity</th>
                                    <th style="text-align: right; padding: 8px;">Price</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${cartItems.map(item => `
                                    <tr style="border-bottom: 1px solid #ddd;">
                                        <td style="padding: 8px;">${item.title}</td>
                                        <td style="text-align: center; padding: 8px;">${item.quantity}</td>
                                        <td style="text-align: right; padding: 8px;">$${item.price.toFixed(2)}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                        
                        <div style="margin-top: 30px; text-align: center;">
                            <p style="font-size: 14px; color: #777;">This is an automated email from <strong>Imran Faith</strong>.</p>
                        </div>
                    </div>
                    `, 
            };
        }

        function createUserEmail(orderID, cartItems, shipping, totalAmount) {
            return {
                to: shipping.email,
                subject: `Order Confirmation: ${orderID}`,
                html: `
                <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto;">
                    <h1 style="color: #007BFF; text-align: center;">Thank You for Your Order!</h1>
                    <p style="text-align: center; font-size: 16px; color: #555;">We appreciate your business. Below are the details of your order.</p>
                    
                    <h2 style="color: #333; margin-top: 20px;">Order Summary</h2>
                    <p><strong>Order ID:</strong> ${orderID}</p>
                    <p><strong>Total Amount:</strong> $${totalAmount.toFixed(2)}</p>
                    
                    <h2 style="color: #333; margin-top: 20px;">Shipping Information</h2>
                    <ul style="list-style: none; padding: 0; font-size: 14px;">
                        <li><strong>Name:</strong> ${shipping.name}</li>
                        <li><strong>Email:</strong> <a href="mailto:${shipping.email}" style="color: #007BFF;">${shipping.email}</a></li>
                        <li><strong>Phone:</strong> ${shipping.phone}</li>
                        <li><strong>Address:</strong> ${shipping.address}, ${shipping.apartment || ''}, ${shipping.city}, ${shipping.state} ${shipping.zip}</li>
                    </ul>
                    
                    <h2 style="color: #333; margin-top: 20px;">Items Ordered</h2>
                    <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
                        <thead>
                            <tr style="background-color: #f8f8f8; border-bottom: 2px solid #ddd;">
                                <th style="text-align: left; padding: 8px;">Item</th>
                                <th style="text-align: center; padding: 8px;">Quantity</th>
                                <th style="text-align: right; padding: 8px;">Price</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${cartItems.map(item => `
                                <tr style="border-bottom: 1px solid #ddd;">
                                    <td style="padding: 8px;">${item.title}</td>
                                    <td style="text-align: center; padding: 8px;">${item.quantity}</td>
                                    <td style="text-align: right; padding: 8px;">$${item.price.toFixed(2)}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                    
                    <div style="margin-top: 30px; text-align: center;">
                        <p style="font-size: 16px;">If you have any questions about your order, feel free to contact us at <a href="mailto:imranfaith7@gmail.com" style="color: #007BFF;">imranfaith7@gmail.com</a>.</p>
                        <p style="font-size: 14px; color: #555;">Thank you for shopping with <strong>Imran Faith</strong>.</p>
                    </div>
                    
                    <div style="text-align: center; margin-top: 20px;">
                        <a href="https://imranfaith.com" style="display: inline-block; padding: 10px 20px; background-color: #007BFF; color: #fff; text-decoration: none; border-radius: 5px;">Visit Our Store</a>
                    </div>
                </div>
            `,
            };
        }
    } catch (error) {
        console.error('Error initializing Stripe:', error);
    }
});



