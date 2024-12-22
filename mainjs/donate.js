
document.addEventListener("DOMContentLoaded", function () {
    let stripePublicKey = '';
    let paypalClientId = '';
    let donationAmountInCents = 0;
    let isProceedingToPayment = true; // State to track button behavior

    // Fetch Stripe and PayPal keys from the server
    fetch('https://api.imranfaith.com/get-stripe-publishable-key')
        .then(response => response.json())
        .then(data => {
            stripePublicKey = data.publishableKey;

            // Initialize Stripe with the fetched public key
            const stripe = Stripe(stripePublicKey);
            const elements = stripe.elements();
            const card = elements.create("card", {
                style: {
                    base: {
                        fontSize: '16px',
                        color: "#32325d",
                    }
                }
            });
            card.mount("#card-element"); // Mount the Stripe card element

             // Stripe "Pay Now" button handler
             document.getElementById("pay-now-button").addEventListener("click", async function (event) {
                event.preventDefault();
                try {
                    const response = await fetch('https://api.imranfaith.com/create-payment-intent', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ amount: donationAmountInCents })
                    });

                    const data = await response.json();
                    const result = await stripe.confirmCardPayment(data.clientSecret, {
                        payment_method: { card: card }
                    });

                    if (result.error) {
                        alert(result.error.message);
                    } else if (result.paymentIntent.status === 'succeeded') {
                        await sendAdminEmail(); // Send email to admin
                        showPaymentAlert();
                    }
                } catch (error) {
                    console.error("Payment error:", error);
                    alert("An error occurred while processing the payment.");
                }
            });
        });

    // Fetch PayPal Client ID and render PayPal button
    fetch('https://api.imranfaith.com/get-paypal-client-id')
        .then(response => response.json())
        .then(data => {
            paypalClientId = data.clientId;

            paypal.Buttons({
                fundingSource: paypal.FUNDING.PAYPAL,
                createOrder: function (data, actions) {
                    return actions.order.create({
                        purchase_units: [{
                            amount: {
                                value: (donationAmountInCents / 100).toFixed(2) // Convert cents to dollars for PayPal
                            }
                        }]
                    });
                },
                onApprove: function (data, actions) {
                    return actions.order.capture().then(function (details) {
                        sendAdminEmail(); // Send email to admin
                        showPaymentAlert(); // Show alert popup on success
                        
                    });
                },
                onError: function (err) {
                    alert("An error occurred during PayPal transaction.");
                    console.error("PayPal Error:", err);
                }
            }).render('#paypal-button-container');
        });

        // Handle the flow of showing the payment options and toggling between buttons
        document.getElementById("donate-button").addEventListener("click", function () {
            document.getElementById("donation-input-area").style.display = "flex";
            this.style.display = "none"; // Hide the donate button once clicked
        });

    // "Proceed to Payment" button handler
    document.getElementById("proceed-to-payment-button").addEventListener("click", function () {
        const donationInput = document.getElementById("donation-amount");
        let donationAmount = donationInput.value;

        if (!donationAmount || isNaN(donationAmount) || donationAmount <= 0) {
            alert("Please enter a valid donation amount.");
            return;
        }

        if (isProceedingToPayment) {
            donationAmount = parseFloat(donationAmount).toFixed(2);
            donationAmountInCents = parseFloat(donationAmount) * 100;

            donationInput.value = donationAmount; // Ensure the donation amount stays visible
            donationInput.disabled = true;

            document.getElementById("payment-options").style.display = "block";
            document.getElementById("note-section").style.display = "block";
            this.innerText = "Change Amount";
            isProceedingToPayment = false;
        } else {
            donationInput.disabled = false;
            document.getElementById("payment-options").style.display = "none";
            document.getElementById("note-section").style.display = "none";
            this.innerText = "Proceed to Payment";
            isProceedingToPayment = true;
        }
    });

    // Function to send an email to the admin
    async function sendAdminEmail() {
        const donationAmount = document.getElementById("donation-amount").value;
        const donationNote = document.getElementById("donation-note").value || "No note provided.";

        const emailPayload = {
            to: "ahassan8844@gmail.com", // Replace with your admin email
            subject: "New Donation Received",
            html: `
                <h1>New Donation</h1>
                <p><strong>Amount:</strong> $${donationAmount}</p>
                <p><strong>Note:</strong> ${donationNote}</p>
            `
        };

        try {
            await fetch("https://api.imranfaith.com/send-email", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(emailPayload)
            });
        } catch (error) {
            console.error("Failed to send email:", error);
        }
    }


    // Function to show the payment success alert
    function showPaymentAlert() {
        document.getElementById("payment-alert").style.display = "flex"; // Show the alert div
    }

    // Handle the "OK" button in the alert box to refresh the page
    document.getElementById("alert-ok-button").addEventListener("click", function () {
        // Refresh the page completely to reset all states
        location.reload();
    });
});
