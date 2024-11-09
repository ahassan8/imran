require('dotenv').config();  // Load environment variables

const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);  // Use secret key from .env
const bodyParser = require('body-parser'); // For handling JSON payloads

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware for serving static files and parsing JSON bodies
app.use(express.static('main'));
app.use(bodyParser.json());

// Set up CORS to allow requests from your live domain
app.use(cors({
    origin: ['https://imranfaith.com']
}));

// MySQL connection using environment variables
const db = mysql.createConnection({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE
});

// Connect to the MySQL database
db.connect(err => {
    if (err) {
        console.error('Error connecting to MySQL:', err);
        return;
    }
    console.log('Connected to MySQL');
});

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
        templateId: process.env.EMAILJS_TEMPLATE_ID
    });
});

// Fetch all products from MySQL
app.get('/products', (req, res) => {
    db.query('SELECT * FROM products', (err, results) => {
        if (err) {
            console.error('Error fetching products:', err);
            return res.status(500).json({ error: 'Error fetching products' });
        }
        res.json(results);
    });
});

// Fetch a single product by ID
app.get('/products/:id', (req, res) => {
    const productId = req.params.id;

    const query = 'SELECT * FROM products WHERE id = ?';
    db.query(query, [productId], (err, results) => {
        if (err) {
            console.error('Error fetching product:', err);
            return res.status(500).json({ error: 'Error fetching product' });
        }

        if (results.length === 0) {
            return res.status(404).json({ error: 'Product not found' });
        }

        res.json(results[0]); // Return the first product found
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

// Handle successful payment and save to MySQL (Optional)
app.post('/payment-success', (req, res) => {
    const { paymentId, name, email, phone, address, products, totalAmount } = req.body;

    // Insert the payment details into the MySQL database
    const query = 'INSERT INTO orders (paymentId, name, email, phone, address, products, totalAmount) VALUES (?, ?, ?, ?, ?, ?, ?)';
    const values = [paymentId, name, email, phone, address, JSON.stringify(products), totalAmount];

    db.query(query, values, (err, results) => {
        if (err) {
            console.error('Error saving payment details to MySQL:', err);
            res.status(500).json({ error: 'Error saving payment details' });
        } else {
            res.json({ message: 'Payment details saved successfully' });
        }
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
