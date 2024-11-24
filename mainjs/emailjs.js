let emailJsServiceId, emailJsTemplateId; // Global variables for EmailJS serviceId and templateId

// Fetch and initialize EmailJS
document.addEventListener("DOMContentLoaded", async function () {
    try {
        // Fetch EmailJS keys from the server
        const response = await fetch('https://api.imranfaith.com/get-emailjs-keys');
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const { publicKey, serviceId, templateId } = await response.json();

        // Initialize EmailJS with the fetched public key
        emailjs.init(publicKey);

        // Assign the fetched serviceId and templateId to global variables
        emailJsServiceId = serviceId;
        emailJsTemplateId = templateId;

    } catch (error) {
        console.error('Error fetching EmailJS keys:', error);
        document.getElementById('status').textContent = "Error initializing email service.";
        document.getElementById('status').style.color = "red";
    }
});

// Function to send an email to the admin (you) with order details
async function sendEmailWithUserDetails(orderID, cartItems) {
    const name = `${document.getElementById('firstName').value} ${document.getElementById('lastName').value}`;
    const email = document.getElementById('email').value;
    const phone = document.getElementById('phone').value;
    const address = document.getElementById('address').value;
    const city = document.getElementById('city').value;
    const state = document.getElementById('state').value;
    const zipcode = document.getElementById('zip').value;
    const totalAmount = document.getElementById('totalAmount').textContent.replace('$', '');

    // Prepare the product details (title and quantity)
    const products = cartItems.map(item => {
        return `${item.title} (Quantity: ${item.quantity})`;
    }).join(', '); // Combine products into a single string for the email template

    // Include the generated Order ID and products in the email parameters
    const templateParams = {
        orderID, // Add the Order ID to the email template
        name,
        email,
        phone,
        address,
        city,
        state,
        zipcode,
        total: totalAmount,
        products // Send product details (title and quantity)
    };

    try {
        // Use the globally stored serviceId and templateId
        const response = await emailjs.send(emailJsServiceId, emailJsTemplateId, templateParams);
        console.log('Email sent successfully to admin!', response.status, response.text);
    } catch (error) {
        console.error('Error sending email to admin:', error);
        document.getElementById('status').textContent = "Failed to send email to admin. Please try again.";
        document.getElementById('status').style.color = "red";
    }
}

// Function to send an order confirmation email to the user
async function sendOrderConfirmationToUser(orderID, cartItems) {
    const userEmail = document.getElementById('email').value;
    const userName = `${document.getElementById('firstName').value} ${document.getElementById('lastName').value}`;
    const totalAmount = document.getElementById('totalAmount').textContent.replace('$', '');

    // Prepare the product details (title and quantity)
    const products = cartItems.map(item => {
        return `${item.title} (Quantity: ${item.quantity})`;
    }).join(', '); // Combine products into a single string for the email template

    // Include the user's details, order summary, and a Thank You message in the email parameters
    const templateParams = {
        to_email: userEmail, // User's email
        user_name: userName,
        order_id: orderID,
        total: totalAmount,
        items: products,
        shipping_address: `${document.getElementById('address').value}, ${document.getElementById('city').value}, ${document.getElementById('state').value}, ${document.getElementById('zip').value}`,
        thank_you_message: `Thank you for your order, ${userName}! We appreciate your business and hope to serve you again soon.`
    };

    try {
        // Use the globally stored serviceId and templateId
        const response = await emailjs.send(emailJsServiceId, emailJsTemplateId, templateParams);
        console.log('Order confirmation email sent successfully to the user!', response.status, response.text);
    } catch (error) {
        console.error('Error sending order confirmation email to the user:', error);
        document.getElementById('status').textContent = "Failed to send order confirmation email to the user. Please try again.";
        document.getElementById('status').style.color = "red";
    }
}
