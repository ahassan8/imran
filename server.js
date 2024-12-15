require('dotenv').config(); // Load environment variables

const express = require('express');
const cors = require('cors');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY); // Stripe secret key from .env
const bodyParser = require('body-parser'); // For handling JSON payloads
const sgMail = require('@sendgrid/mail'); // SendGrid for sending emails

// Set SendGrid API Key
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.static('main')); // Serve static files from the 'main' folder
app.use(bodyParser.json()); // Parse JSON bodies

// CORS configuration
const allowedOrigins = [
    'https://imranfaith.com',
    'https://api.imranfaith.com',
]; // Production origins

app.use(
    cors({
        origin: allowedOrigins,
        methods: ['GET', 'POST'],
        allowedHeaders: ['Content-Type'],
    })
);

// --- Routes ---

// Stripe Publishable Key
app.get('/get-stripe-publishable-key', (req, res) => {
    res.json({ publishableKey: process.env.STRIPE_PUBLISHABLE_KEY });
});

// PayPal Client ID
app.get('/get-paypal-client-id', (req, res) => {
    res.json({ clientId: process.env.PAYPAL_CLIENT_ID });
});

// Email credentials for SendGrid
app.get('/get-email-credentials', (req, res) => {
    res.json({
        emailUser: process.env.EMAIL_USER, // Email sender address
    });
});

// Stripe Payment Intent Endpoint
app.post('/create-payment-intent', async (req, res) => {
    const { amount } = req.body;

    try {
        const paymentIntent = await stripe.paymentIntents.create({
            amount: amount, // Amount in cents
            currency: 'usd',
            payment_method_types: ['card'],
        });

        res.json({ clientSecret: paymentIntent.client_secret });
    } catch (error) {
        console.error('Error creating Payment Intent:', error);
        res.status(500).json({ error: error.message });
    }
});

// Payment success handler
app.post('/payment-success', (req, res) => {
    const { paymentId, name, email, phone, address, products, totalAmount } = req.body;

    // Log payment details
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

// Email-Sending Endpoint
app.post('/send-email', async (req, res) => {
    const { to, subject, html } = req.body;

    const msg = {
        to, // Receiver email
        from: `Imran Faith <${process.env.EMAIL_USER}>`, // Sender email from .env
        subject, // Email subject
        html, // Email body content
    };

    try {
        // Send email via SendGrid
        await sgMail.send(msg);
        console.log('Email sent successfully');
        res.status(200).json({ message: 'Email sent successfully!' });
    } catch (error) {
        console.error('Error sending email:', error.response ? error.response.body : error);
        res.status(500).json({ error: 'Failed to send email.' });
    }
});

// Catch-all route for undefined paths
app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

// Start server
app.listen(PORT, () => {
    console.log(
        `Server running in ${process.env.NODE_ENV || 'production'} mode on https://imranfaith.com`
    );
});
