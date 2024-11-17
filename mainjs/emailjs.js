let emailJsServiceId, emailJsTemplateId;  // Global variables for EmailJS serviceId and templateId

// Fetch and initialize EmailJS
document.addEventListener("DOMContentLoaded", async function () {
    try {
        // Fetch EmailJS keys from the server
        const response = await fetch('https://imranfaith.com/get-emailjs-keys');
        
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

// Function to send email with user details, including Order ID and product info (title and quantity)
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
    }).join(', ');  // Combine products into a single string for the email template

    // Include the generated Order ID and products in the email parameters
    const templateParams = {
        orderID,  // Add the Order ID to the email template
        name,
        email,
        phone,
        address,
        city,
        state,
        zipcode,
        total: totalAmount,
        products  // Send product details (title and quantity)
    };

    try {
        // Use the globally stored serviceId and templateId
        const response = await emailjs.send(emailJsServiceId, emailJsTemplateId, templateParams);
        console.log('Email sent successfully!', response.status, response.text);
    } catch (error) {
        console.error('Error sending email:', error);
        document.getElementById('status').textContent = "Failed to send email. Please try again.";
        document.getElementById('status').style.color = "red";
    }
}
