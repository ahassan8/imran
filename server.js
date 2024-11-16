require('dotenv').config(); // Load environment variables

const express = require('express');
const cors = require('cors');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY); // Use secret key from .env
const bodyParser = require('body-parser'); // For handling JSON payloads

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware for serving static files and parsing JSON bodies
app.use(express.static('main'));
app.use(bodyParser.json());

// Set up CORS to allow requests from your live domain
app.use(
    cors({
        origin: ['https://imranfaith.com', 'https://api.imranfaith.com'], // Allow frontend and API subdomain
    })
);

// Route to securely send Stripe Publishable Key to the front-end
app.get('/get-stripe-publishable-key', (req, res) => {
    res.json({ publishableKey: process.env.STRIPE_PUBLISHABLE_KEY });
});

// Route to securely send PayPal Client ID to the front-end
app.get('/get-paypal-client-id', (req, res) => {
    res.json({ clientId: process.env.PAYPAL_CLIENT_ID });
});

// Route to securely send EmailJS keys to the front-end
app.get('/get-emailjs-keys', (req, res) => {
    res.json({
        publicKey: process.env.EMAILJS_PUBLIC_KEY,
        serviceId: process.env.EMAILJS_SERVICE_ID,
        templateId: process.env.EMAILJS_TEMPLATE_ID,
    });
});

// Create a Payment Intent (Stripe Payment Endpoint)
app.post('/create-payment-intent', async (req, res) => {
    const { amount } = req.body;

    try {
        // Create a PaymentIntent with the total amount and currency
        const paymentIntent = await stripe.paymentIntents.create({
            amount: amount, // Amount in cents
            currency: 'usd',
            payment_method_types: ['card'],
        });

        // Send the client secret key to the frontend to confirm the payment
        res.json({ clientSecret: paymentIntent.client_secret });
    } catch (error) {
        console.error('Error creating Payment Intent:', error);
        res.status(500).json({ error: error.message });
    }
});

// Handle successful payment (Optional - Store in JSON or other persistence layer)
app.post('/payment-success', (req, res) => {
    const { paymentId, name, email, phone, address, products, totalAmount } = req.body;

    // Simulate saving payment details
    console.log('Payment Successful:', {
        paymentId,
        name,
        email,
        phone,
        address,
        products,
        totalAmount,
    });

    res.json({ message: 'Payment details received successfully' });
});

// Start server and bind to 0.0.0.0 to make it accessible via the internet
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running and accessible on port ${PORT}`);
});
