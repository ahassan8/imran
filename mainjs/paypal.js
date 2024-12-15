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
                color: 'blue',
                shape: 'pill',
                label: 'paypal',
            },
            createOrder: function (data, actions) {
                if (!validateUserInfo()) {
                    const formErrorElement = document.getElementById('form-error');
                    if (formErrorElement) {
                        formErrorElement.textContent = 'Please complete all required fields before proceeding.';
                    }
                    return actions.reject();
                }

                const totalElement = document.getElementById('totalAmount');
                if (!totalElement) {
                    console.error('Total amount element not found!');
                    return actions.reject();
                }

                const totalAmount = parseFloat(totalElement.textContent.replace('$', ''));

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
                        quantity: item.quantity,
                    }));

                    // Store order details
                    storeOrderSummary(orderID, cart);

                    try {
                        // Admin email content
                        const adminEmailContent = createAdminEmailContent(orderID, cartItems);

                        // User email content
                        const userEmailContent = createUserEmailContent(orderID, cartItems);

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

    // Validate user information
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
        const prefix = '99'; // Fixed prefix
        const randomNumbers = Math.floor(10000000 + Math.random() * 90000000); // 8 random digits
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

    function createAdminEmailContent(orderID, cartItems) {
        return {
            to: 'mysticvoiid2@gmail.com',
            subject: `New Order: ${orderID}`,
            html: `
                <h1>New Order Received</h1>
                <p><strong>Order ID:</strong> ${orderID}</p>
                <p><strong>User Details:</strong></p>
                <ul>
                    <li><strong>Name:</strong> ${document.getElementById('firstName')?.value || ''} ${document.getElementById('lastName')?.value || ''}</li>
                    <li><strong>Email:</strong> ${document.getElementById('email')?.value || ''}</li>
                    <li><strong>Phone:</strong> ${document.getElementById('phone')?.value || ''}</li>
                </ul>
                <p><strong>Shipping Details:</strong></p>
                <ul>
                    <li><strong>Address:</strong> ${document.getElementById('address')?.value || ''}, ${document.getElementById('apartment')?.value || ''}, ${document.getElementById('city')?.value || ''}, ${document.getElementById('state')?.value || ''} ${document.getElementById('zip')?.value || ''}</li>
                </ul>
                <p><strong>Items:</strong></p>
                <ul>
                    ${cartItems.map(item => `<li><strong>${item.title}</strong> (Quantity: ${item.quantity})</li>`).join('')}
                </ul>
            `,
        };
    }

    function createUserEmailContent(orderID, cartItems) {
        return {
            to: document.getElementById('email')?.value || '',
            subject: `Order Confirmation: ${orderID}`,
            html: `
                <h1>Thank You for Your Order!</h1>
                <p><strong>Order ID:</strong> ${orderID}</p>
                <p><strong>Items:</strong></p>
                <ul>
                    ${cartItems.map(item => `<li><strong>${item.title}</strong> (Quantity: ${item.quantity})</li>`).join('')}
                </ul>
            `,
        };
    }
});
