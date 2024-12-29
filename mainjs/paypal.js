document.addEventListener('DOMContentLoaded', async function () {
    try {
        // Fetch PayPal client ID from the server
        const response = await fetch('http://localhost:5000/get-paypal-client-id');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const { clientId } = await response.json();

        // Initialize PayPal buttons
        paypal.Buttons({
            fundingSource: paypal.FUNDING.PAYPAL,
            style: {
                layout: 'vertical',
                color: 'gold', // Set button style to gold
                shape: 'pill',
                label: 'paypal',
            },
            createOrder: function (data, actions) {
                // Validate user information
                if (!validateUserInfo()) {
                    const formErrorElement = document.getElementById('form-error');
                    if (formErrorElement) {
                        formErrorElement.textContent = 'Please complete all required fields before proceeding.';
                    }
                    return actions.reject();
                }

                // Get the total amount
                const totalAmountElement = document.getElementById('totalAmount');
                if (!totalAmountElement) {
                    console.error('Total amount element not found!');
                    return actions.reject();
                }

                const totalAmount = parseFloat(totalAmountElement.textContent.replace('$', '').trim()) || 0;

                if (isNaN(totalAmount) || totalAmount <= 0) {
                    const formErrorElement = document.getElementById('form-error');
                    if (formErrorElement) {
                        formErrorElement.textContent = 'Invalid total amount. Please ensure your cart is updated.';
                    }
                    return actions.reject();
                }

                return actions.order.create({
                    purchase_units: [
                        {
                            amount: {
                                value: totalAmount.toFixed(2),
                            },
                        },
                    ],
                });
            },
            onApprove: function (data, actions) {
                return actions.order.capture().then(async function (details) {
                    console.log('PayPal Payment Successful:', details);

                    const formSuccessElement = document.getElementById('form-success');
                    if (formSuccessElement) {
                        formSuccessElement.textContent = `Payment completed by ${details.payer.name.given_name}.`;
                    }

                    const orderID = generateOrderID();
                    const cart = JSON.parse(localStorage.getItem('cart')) || {};

                    // Extract cart items
                    const cartItems = Object.values(cart).map((item) => ({
                        title: item.title,
                        price: item.price / 100,
                        quantity: item.quantity,
                    }));


                    // Get total amount
                    const totalAmount = parseFloat(
                        document.getElementById('totalAmount')?.textContent.replace('$', '').trim()
                    ) || 0;

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

                    storeOrderSummary(orderID, cart, totalAmount, shipping);

                    try {
                        // Admin email content
                        const adminEmailContent = createAdminEmailContent(orderID, cartItems, shipping, totalAmount);

                        // User email content
                        const userEmailContent = createUserEmailContent(orderID, cartItems, shipping, totalAmount);

                        // Send emails to admin and user
                        await sendEmailToServer(adminEmailContent);
                        await sendEmailToServer(userEmailContent);

                        redirectToConfirmationAndClearCart();
                    } catch (error) {
                        console.error('Error sending emails:', error);
                        alert('An error occurred while sending the confirmation email. Please try again.');
                    }
                });
            },
            onError: function (err) {
                console.error('PayPal Error:', err);
                alert('An error occurred with PayPal. Please try again.');
            },
        }).render('#paypal-button-container');
    } catch (error) {
        console.error('Error initializing PayPal:', error);
        const formErrorElement = document.getElementById('form-error');
        if (formErrorElement) {
            formErrorElement.textContent = `Error initializing PayPal: ${error.message}`;
        }
    }

    // Helper Functions
    function validateUserInfo() {
        const requiredFields = ['firstName', 'lastName', 'email', 'phone', 'address', 'city', 'state', 'zip'];
        let isValid = true;

        requiredFields.forEach((id) => {
            const input = document.getElementById(id);
            if (!input || !input.value.trim()) {
                displayError(input, 'This field is required.');
                isValid = false;
            } else {
                clearError(input);
            }
        });

        return isValid;
    }

    function displayError(input, message) {
        if (input) {
            const errorContainer = input.nextElementSibling;
            if (errorContainer) {
                errorContainer.textContent = message;
            }
            input.classList.add('input-error');
        }
    }

    function clearError(input) {
        if (input) {
            const errorContainer = input.nextElementSibling;
            if (errorContainer) {
                errorContainer.textContent = '';
            }
            input.classList.remove('input-error');
        }
    }

    function storeOrderSummary(orderID, cart, totalAmount, shipping) {
        const orderSummary = {
            orderID: orderID,
            totalAmount: totalAmount,
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

    function redirectToConfirmationAndClearCart() {
        window.location.href = 'confirmation.html';
        localStorage.removeItem('cart');
        updateCartCount();
    }

    function updateCartCount() {
        const cart = JSON.parse(localStorage.getItem('cart')) || {};
        const cartCount = Object.values(cart).reduce(
            (acc, item) => acc + item.quantity,
            0
        );
        const cartCountElement = document.getElementById('cart-count');
        if (cartCountElement) {
            cartCountElement.textContent = cartCount;
        }
    }

    async function sendEmailToServer(emailPayload) {
        try {
            const response = await fetch('http://localhost:5000/send-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(emailPayload),
            });

            if (!response.ok) {
                throw new Error('Failed to send email');
            }
        } catch (error) {
            console.error('Error sending email:', error);
            throw error;
        }
    }

    function createAdminEmailContent(orderID, cartItems, shipping, totalAmount) {
        return {
            to: 'mysticvoiid2@gmail.com',
            subject: `New Order Received: ${orderID}`,
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
                                <th style="text-align: left; padding: 8px;">Item(s)</th>
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
    

    function createUserEmailContent(orderID, cartItems, shipping, totalAmount) {
        return {
            to: shipping.email,
            subject: `Order Confirmation: ${orderID}`,
            html: `
                <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto;">
                    <h1 style="color: #007BFF; text-align: center;">Thank You for Your Order!</h1>
                    <p style="text-align: center; font-size: 16px; color: #555;">We appreciate your business. 
                    You will be notified when your are items have been shipped. Below are the details for your order:</p>
                    
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
                                <th style="text-align: left; padding: 8px;">Item(s)</th>
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
    
});



