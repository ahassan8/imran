// Add keypress validation for phone number input
const userPhoneInput = document.getElementById("phone");
if (userPhoneInput) {
    userPhoneInput.addEventListener("keypress", function (event) {
        if (!/[0-9]/.test(event.key)) {
            event.preventDefault();
        }
    });
}

// Handle form submission
const contactForm = document.getElementById("contact-form");
if (contactForm) {
    contactForm.addEventListener("submit", handleContactFormSubmit);
}

// Function to handle form submission
async function handleContactFormSubmit(event) {
    event.preventDefault();

    // Get form field values
    const firstName = document.getElementById("firstName").value.trim();
    const lastName = document.getElementById("lastName").value.trim();
    const userEmail = document.getElementById("email").value.trim();
    const userPhone = document.getElementById("phone").value.trim();
    const userMessage = document.getElementById("message").value.trim();

    // Get the selected preferred way of contact
    const preferredContactInput = document.querySelector('input[name="preferred_contact"]:checked');
    if (!preferredContactInput) {
        displayStatusMessage("Please select your preferred way of contact.", "red");
        return;
    }
    const preferredContact = preferredContactInput.value;

    // Validation for first and last name
    if (!/^[a-zA-Z\s]+$/.test(firstName) || !/^[a-zA-Z\s]+$/.test(lastName)) {
        displayStatusMessage("Please enter valid names (letters only).", "red");
        return;
    }

    // Validation for phone number
    if (!/^[0-9]{1,15}$/.test(userPhone)) {
        displayStatusMessage("Please enter a valid phone number (up to 15 digits).", "red");
        return;
    }

    // Ensure all fields are filled out
    if (!firstName || !lastName || !userEmail || !userPhone || !userMessage) {
        displayStatusMessage("Please fill out all fields before submitting.", "red");
        return;
    }

    try {
        const fullName = `${firstName} ${lastName}`;

        // Construct email payload for admin
        const adminEmailContent = {
            to: "ahassan8844@gmail.com", // Replace with your admin email
            subject: `New Message from ${fullName}`,
            html: `
            <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
                <h1 style="color: #007bff; font-size: 24px;">New Contact Form Submission</h1>
                
                <p style="font-size: 16px;">You have received a new message through the contact form:</p>
                
                <hr style="border: 0; border-top: 1px solid #ccc; margin: 20px 0;">
                
                <h2 style="color: #555; font-size: 18px;">Contact Details</h2>
                <p style="font-size: 16px; margin: 5px 0;"><strong>Name:</strong> ${fullName}</p>
                <p style="font-size: 16px; margin: 5px 0;"><strong>Email:</strong> <a href="mailto:${userEmail}" style="color: #007bff; text-decoration: none;">${userEmail}</a></p>
                <p style="font-size: 16px; margin: 5px 0;"><strong>Phone:</strong> <a href="tel:${userPhone}" style="color: #007bff; text-decoration: none;">${userPhone}</a></p>
                <p style="font-size: 16px; margin: 5px 0;"><strong>Preferred Contact Method:</strong> ${preferredContact}</p>
                
                <hr style="border: 0; border-top: 1px solid #ccc; margin: 20px 0;">
                
                <h2 style="color: #555; font-size: 18px;">Message</h2>
                <p style="font-size: 16px; background-color: #f9f9f9; padding: 10px; border-radius: 5px;">${userMessage}</p>
                
                <hr style="border: 0; border-top: 1px solid #ccc; margin: 20px 0;">
                
                <p style="font-size: 14px; color: #555;">Please respond to the user as soon as possible.</p>
                
                <p style="font-size: 14px; color: #555; margin-top: 20px;">Best regards,</p>
                <p style="font-size: 14px; color: #555; font-weight: bold;">Imran Faith Website</p>
            </div>
        `
        
        };

        // Construct acknowledgment email payload for the user
        const acknowledgmentEmailContent = {
            to: userEmail,
            subject: "We Got Your Message!",
            html: `
            <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
                <h1 style="color: #007bff; font-size: 24px;">Thank You, ${firstName}!</h1>
                <p style="font-size: 16px;">We have received your message and will respond to your request as soon as possible. Thank you for reaching out to us!</p>
                
                <p style="font-size: 16px;">If you have any additional questions or need immediate assistance, feel free to reply to this email.</p>
                
                <hr style="border: 0; border-top: 1px solid #ccc; margin: 20px 0;">
                
                <h2 style="color: #555; font-size: 18px;">Contact Information</h2>
                <p style="font-size: 16px; margin: 5px 0;"><strong>Email:</strong> <a href="imranfaith7@gmail.com" style="color: #007bff; text-decoration: none;">imranfaith7@gmail.com</a></p>
                <p style="font-size: 16px; margin: 5px 0;"><strong>Phone:</strong> <a href="tel:+1 (803) 260-1982" style="color: #007bff; text-decoration: none;">+1 (803) 260-1982</a></p>
                
                
                <hr style="border: 0; border-top: 1px solid #ccc; margin: 20px 0;">
                
                <p style="font-size: 14px; color: #555;">Thank you for trusting us. We look forward to assisting you!</p>
                
        
                <p style="font-size: 14px; color: #555; font-weight: bold;">Imran Faith Team</p>
            </div>
        `
        
        };

        // Send email to the server (admin email)
        await sendEmailToServer(adminEmailContent);

        // Send email to the server (user acknowledgment email)
        await sendEmailToServer(acknowledgmentEmailContent);

        // Display success message
        displayStatusMessage("Your message has been sent successfully!", "green");

        // Clear the form
        document.getElementById("contact-form").reset();
    } catch (error) {
        displayStatusMessage("Failed to send your message. Please try again.", "red");
    }
}

// Function to display status messages
function displayStatusMessage(message, color) {
    const statusElement = document.getElementById("status");
    if (statusElement) {
        statusElement.textContent = message;
        statusElement.style.color = color;
    }
}

// Function to send email by making a POST request to the server
async function sendEmailToServer(emailPayload) {
    try {
        const response = await fetch("https://api.imranfaith.com/send-email", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(emailPayload),
        });

        if (!response.ok) {
            throw new Error("Failed to send email");
        }
    } catch (error) {
        console.error("Error sending email:", error);
        throw error;
    }
}

