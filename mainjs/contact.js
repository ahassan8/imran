let emailJsServiceId, emailJsTemplateId, emailJsPublicKey;

// Fetch and initialize EmailJS
document.addEventListener("DOMContentLoaded", async function () {
    try {
        // Fetch EmailJS keys from the server
        const response = await fetch('https://imranfaith.com/get-emailjs-keys');

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const { publicKey, serviceId, templateId } = await response.json();

        // Assign the fetched keys to global variables
        emailJsServiceId = serviceId;
        emailJsTemplateId = templateId;
        emailJsPublicKey = publicKey;

        // Initialize EmailJS with the fetched public key
        emailjs.init(emailJsPublicKey);

    } catch (error) {
        console.error('Error fetching EmailJS keys:', error);
        document.getElementById('status').textContent = "Error initializing email service.";
        document.getElementById('status').style.color = "red";
    }
});

// Add keypress validation for phone number input
document.getElementById('user_phone').addEventListener('keypress', function(event) {
    // Prevent any non-numeric characters
    if (!/[0-9]/.test(event.key)) {
        event.preventDefault();
    }
});

// Handle form submission
document.getElementById('contact-form').addEventListener('submit', function(event) {
    event.preventDefault();

    // Get form field values
    let userName = document.getElementById('user_name').value;
    let userEmail = document.getElementById('user_email').value;
    let userPhone = document.getElementById('user_phone').value;
    let userMessage = document.getElementById('message').value;

    // Validation for name (no numbers allowed)
    const namePattern = /^[a-zA-Z\s]+$/;
    if (!namePattern.test(userName)) {
        document.getElementById('status').textContent = "Please enter a valid name (letters only).";
        document.getElementById('status').style.color = "red";
        return;
    }

    // Validation for phone number (only digits, max 15 digits)
    const phonePattern = /^[0-9]{1,15}$/;
    if (!phonePattern.test(userPhone)) {
        document.getElementById('status').textContent = "Please enter a valid phone number (up to 15 digits).";
        document.getElementById('status').style.color = "red";
        return;
    }

    // Ensure all fields are filled out
    if (userName === '' || userEmail === '' || userPhone === '' || userMessage === '') {
        document.getElementById('status').textContent = "Please fill out all fields before submitting.";
        document.getElementById('status').style.color = "red";  // Display error in red
        return;  // Stop form submission if fields are empty
    }

    // Send form via EmailJS with dynamically fetched serviceId and templateId
    emailjs.send(emailJsServiceId, emailJsTemplateId, {
        user_name: userName,
        user_email: userEmail,
        user_phone: userPhone,
        message: userMessage
    }).then(function() {
        // Display success message
        document.getElementById('status').textContent = "Your message has been sent successfully!";
        document.getElementById('status').style.color = "green";  // Display success in green

        // Clear the form fields
        document.getElementById('contact-form').reset();
    }, function(error) {
        // Display error message
        console.error("Failed to send email", error);
        document.getElementById('status').textContent = "Failed to send message, please try again.";
        document.getElementById('status').style.color = "red";  // Display error in red
    });
});
