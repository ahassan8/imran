document.addEventListener("DOMContentLoaded", function() {
    let stripePublicKey = '';
    let emailjsPublicKey = '';
    let emailjsServiceId = '';
    let emailjsTemplateId = '';
    let ebookPriceInCents = 0;
    const confirmationData = {};

    // Load eBook details from URL params
    const urlParams = new URLSearchParams(window.location.search);
    const title = urlParams.get('title');
    const price = parseInt(urlParams.get('price'), 10);
    ebookPriceInCents = price;

    // Fetch eBooks from JSON
    fetch('../maindata/ebook.json')
        .then(response => response.json())
        .then(ebooks => {
            const ebook = ebooks.find(ebook => ebook.title === title);
            if (ebook) {
                const ebookDetailsDiv = document.getElementById('ebook-details');
                ebookDetailsDiv.innerHTML = `
                    <img src="${ebook.image}" alt="${ebook.title}" class="ebook-image" style="width:350px;height:350px;"/>
                    <h3>${ebook.title}</h3>
                    <p>${ebook.description ? ebook.description : 'No description available'}</p>
                    <p>Total: $${(ebook.price / 100).toFixed(2)}</p>
                `;
                confirmationData.title = ebook.title;
                confirmationData.price = ebook.price;
                confirmationData.image = ebook.image;
                confirmationData.pdf = ebook.pdf;
                confirmationData.description = ebook.description; // Store the description
            } else {
                console.error("E-book not found!");
            }
        })
        .catch(error => console.error('Error loading e-book data:', error));


    // Fetch Stripe and EmailJS keys from the server
    Promise.all([
        fetch('https://imranfaith.com/get-stripe-publishable-key').then(response => response.json()),
        fetch('https://imranfaith.com/get-emailjs-keys').then(response => response.json())
    ]).then(([stripeData, emailKeysData]) => {
        stripePublicKey = stripeData.publishableKey;
        emailjsPublicKey = emailKeysData.publicKey;
        emailjsServiceId = emailKeysData.serviceId;
        emailjsTemplateId = emailKeysData.templateId;

        emailjs.init(emailjsPublicKey);

        const stripe = Stripe(stripePublicKey);
        const elements = stripe.elements();
        const card = elements.create("card", { style: { base: { fontSize: '16px', color: "#32325d" }}});
        card.mount("#card-element");

        // Handle form submission for Stripe
        const form = document.getElementById('payment-form');
        form.addEventListener("submit", async function(event) {
            event.preventDefault();
            document.getElementById("submit-button").disabled = true;
            document.getElementById("submit-button").textContent = "Processing...";

            const firstName = document.getElementById('first-name').value;
            const lastName = document.getElementById('last-name').value;
            const email = document.getElementById('email').value;
            const phone = document.getElementById('phone').value;
            const streetAddress = document.getElementById('street-address').value;
            const city = document.getElementById('city').value;
            const state = document.getElementById('state').value;
            const zipCode = document.getElementById('zip-code').value;

            if (!firstName || !lastName || !email || !phone || !streetAddress || !city || !state || !zipCode) {
                document.getElementById("card-errors").textContent = "Please fill in all the required fields.";
                document.getElementById("submit-button").disabled = false;
                document.getElementById("submit-button").textContent = "Pay";
                return;
            }

            try {
                const paymentIntentResponse = await fetch('https://api.imranfaith.com/create-payment-intent', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ amount: ebookPriceInCents })
                });
                const paymentIntentData = await paymentIntentResponse.json();
                const clientSecret = paymentIntentData.clientSecret;

                const result = await stripe.confirmCardPayment(clientSecret, {
                    payment_method: {
                        card: card,
                        billing_details: {
                            name: `${firstName} ${lastName}`,
                            email: email,
                            phone: phone,
                            address: {
                                line1: streetAddress,
                                city: city,
                                state: state,
                                postal_code: zipCode
                            }
                        }
                    }
                });

                if (result.error) {
                    document.getElementById("card-errors").textContent = result.error.message;
                } else if (result.paymentIntent && result.paymentIntent.status === 'succeeded') {
                    confirmationData.firstName = firstName;
                    confirmationData.lastName = lastName;
                    sendEmailNotification(firstName, lastName, email, phone, streetAddress, city, state, zipCode, title);
                    showConfirmation(confirmationData);
                }
            } catch (error) {
                document.getElementById("card-errors").textContent = "An error occurred during the payment process.";
                console.error("Error processing payment:", error);
            } finally {
                document.getElementById("submit-button").disabled = false;
                document.getElementById("submit-button").textContent = "Pay";
            }
        });
    });

    // PayPal Button integration
    fetch('https://api.imranfaith.com/get-paypal-client-id')
        .then(response => response.json())
        .then(data => {
            const paypalClientId = data.clientId;

            paypal.Buttons({
                fundingSource: paypal.FUNDING.PAYPAL,
                createOrder: function(data, actions) {
                    const firstName = document.getElementById('first-name').value;
                    const lastName = document.getElementById('last-name').value;
                    const email = document.getElementById('email').value;
                    const phone = document.getElementById('phone').value;
                    const streetAddress = document.getElementById('street-address').value;
                    const city = document.getElementById('city').value;
                    const state = document.getElementById('state').value;
                    const zipCode = document.getElementById('zip-code').value;

                    if (!firstName || !lastName || !email || !phone || !streetAddress || !city || !state || !zipCode) {
                        document.getElementById("card-errors").textContent = "Please fill in all required fields.";
                        throw new Error("Missing required fields for PayPal.");
                    }

                    return actions.order.create({
                        purchase_units: [{
                            amount: { value: (ebookPriceInCents / 100).toFixed(2) }
                        }]
                    });
                },
                onApprove: function(data, actions) {
                    return actions.order.capture().then(function(details) {
                        const firstName = document.getElementById('first-name').value;
                        const lastName = document.getElementById('last-name').value;
                        const email = document.getElementById('email').value;
                        const phone = document.getElementById('phone').value;
                        const streetAddress = document.getElementById('street-address').value;
                        const city = document.getElementById('city').value;
                        const state = document.getElementById('state').value;
                        const zipCode = document.getElementById('zip-code').value;

                        sendEmailNotification(firstName, lastName, email, phone, streetAddress, city, state, zipCode, title);
                        confirmationData.firstName = firstName;
                        confirmationData.lastName = lastName;
                        showConfirmation(confirmationData);
                    });
                },
                onError: function(err) {
                    document.getElementById("card-errors").textContent = "An error occurred during PayPal transaction.";
                    console.error("PayPal Error:", err);
                }
            }).render('#paypal-button-container');
        });

    function sendEmailNotification(firstName, lastName, email, phone, streetAddress, city, state, zipCode, productTitle) {
        const emailParams = {
            user_name: `${firstName} ${lastName}`,
            user_email: email,
            user_phone: phone,
            street_address: streetAddress,
            city: city,
            state: state,
            zip_code: zipCode,
            product_title: productTitle,
            quantity: 1
        };

        emailjs.send(emailjsServiceId, emailjsTemplateId, emailParams)
            .then(function(response) {
                console.log('Email successfully sent!', response.status, response.text);
            }, function(error) {
                console.error('Failed to send email via EmailJS:', error);
            });
    }

    function showConfirmation(paymentDetails) {
        const confirmationDiv = document.createElement('div');
        confirmationDiv.classList.add('confirmation');

        confirmationDiv.innerHTML = `
            <h2>Thank you for your purchase, ${paymentDetails.firstName} ${paymentDetails.lastName}!</h2>
            <p>You have purchased: <strong>${paymentDetails.title}</strong></p>
            <p> $${(paymentDetails.price / 100).toFixed(2)}</p>
            <div class="confirmation-links">
                <a href="${paymentDetails.pdf}" download>Download your eBook</a>
                <a href="../mainhtml/index.html" class="continue-shopping">Continue Shopping</a>
            </div>
        `;

        document.body.innerHTML = '';
        document.body.appendChild(confirmationDiv);
    }

    // Validation for first-name, last-name, and city to prevent numeric input
    ['first-name', 'last-name', 'city'].forEach(id => {
        document.getElementById(id).addEventListener('keypress', function(event) {
            if (/\d/.test(event.key)) event.preventDefault();
        });
    });

    // Validation for phone to restrict to numbers only and limit to 15 digits
    document.getElementById('phone').addEventListener('keypress', function(event) {
        const phoneNumber = event.target.value;
        if (!/^\d*$/.test(event.key) || phoneNumber.length >= 15) event.preventDefault();
    });
});
