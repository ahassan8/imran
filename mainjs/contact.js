// Function to show the contact section
function showContactSection() {
    // Hide all other sections
    const sections = document.querySelectorAll(".middle > div");
    sections.forEach(section => (section.style.display = "none"));

    // Display the contact section
    const contactSection = document.getElementById("contact-section");
    contactSection.style.display = "block";
}

// Event listener for "Contact" navigation link
document.addEventListener("DOMContentLoaded", function () {
    const contactNavLink = document.querySelector('a[data-target="contact-section"]');
    if (contactNavLink) {
        contactNavLink.addEventListener("click", function (event) {
            event.preventDefault(); // Prevent default link behavior
            showContactSection();
        });
    }

    // Add keypress validation for phone number input
    const userPhoneInput = document.getElementById("user_phone");
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
});

// Function to handle form submission
async function handleContactFormSubmit(event) {
    event.preventDefault();

    // Get form field values
    const userName = document.getElementById("user_name").value;
    const userEmail = document.getElementById("user_email").value;
    const userPhone = document.getElementById("user_phone").value;
    const userMessage = document.getElementById("message").value;

    // Get the selected preferred way of contact
    const preferredContactInput = document.querySelector('input[name="preferred_contact"]:checked');
    if (!preferredContactInput) {
        displayStatusMessage("Please select your preferred way of contact.", "red");
        return;
    }
    const preferredContact = preferredContactInput.value;

    // Validation for name
    if (!/^[a-zA-Z\s]+$/.test(userName)) {
        displayStatusMessage("Please enter a valid name (letters only).", "red");
        return;
    }

    // Validation for phone number
    if (!/^[0-9]{1,15}$/.test(userPhone)) {
        displayStatusMessage("Please enter a valid phone number (up to 15 digits).", "red");
        return;
    }

    // Ensure all fields are filled out
    if (!userName || !userEmail || !userPhone || !userMessage) {
        displayStatusMessage("Please fill out all fields before submitting.", "red");
        return;
    }

    try {
        // Construct email payload for admin
        const adminEmailContent = {
            to: "mysticvoiid2@gmail.com", // Replace with your admin email
            subject: `New Message from ${userName}`,
            html: `
                <h1>Contact Form Submission</h1>
                <p><strong>Name:</strong> ${userName}</p>
                <p><strong>Email:</strong> ${userEmail}</p>
                <p><strong>Phone:</strong> ${userPhone}</p>
                <p><strong>Preferred Contact:</strong> ${preferredContact}</p>
                <p><strong>Message:</strong></p>
                <p>${userMessage}</p>
            `,
        };

        // Construct acknowledgment email payload for the user
        const acknowledgmentEmailContent = {
            to: userEmail,
            subject: "We Got Your Message!",
            html: `
                <h1>Thank You, ${userName}!</h1>
                <p>We received your message and will respond to your request very soon.</p>
                <p>Feel free to reply to this email if you have any more questions.</p>
                <br>
                <p><strong>Contact Information:</strong></p>
                <p>Email: princelegend00@gmail.com</p>
                <p>Phone: +1 (123) 456-7890</p>
                <p>Address: 123 Faith Avenue, City Name, Country</p>
            `,
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
