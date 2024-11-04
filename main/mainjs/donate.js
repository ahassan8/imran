document.addEventListener("DOMContentLoaded", function() {
    let stripePublicKey = '';
    let paypalClientId = '';
    let donationAmountInCents = 0;
    let isProceedingToPayment = true; // State to track button behavior

    // Fetch Stripe and PayPal keys from the server
    fetch('http://localhost:5000/get-stripe-publishable-key').then(response => response.json()).then(data => {
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

        // Handle "Pay Now" button click for Stripe
        document.getElementById("pay-now-button").addEventListener("click", async function(event) {
            event.preventDefault();

            // Validate billing fields before payment
            if (!validateBillingAddress()) {
                return;
            }

            try {
                const paymentIntentResponse = await fetch('http://localhost:5000/create-payment-intent', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ amount: donationAmountInCents }) // Send amount in cents
                });

                const paymentIntentData = await paymentIntentResponse.json();
                const clientSecret = paymentIntentData.clientSecret;

                const result = await stripe.confirmCardPayment(clientSecret, {
                    payment_method: {
                        card: card,
                        billing_details: {
                            name: document.getElementById("donor-name").value,
                            address: {
                                line1: document.getElementById("street-address").value,
                                city: document.getElementById("city").value,
                                state: document.getElementById("state").value,
                                postal_code: document.getElementById("zip-code").value,
                            }
                        }
                    }
                });

                if (result.error) {
                    alert(result.error.message); // Show alert with error message
                } else {
                    if (result.paymentIntent.status === 'succeeded') {
                        showPaymentAlert(); // Show alert popup on success
                    }
                }
            } catch (error) {
                alert("An error occurred during the payment process.");
                console.error("Error processing payment:", error);
            }
        });
    });

    // Fetch PayPal Client ID and render PayPal button
    fetch('http://localhost:5000/get-paypal-client-id').then(response => response.json()).then(data => {
        paypalClientId = data.clientId;

        paypal.Buttons({
            fundingSource: paypal.FUNDING.PAYPAL,
            createOrder: function(data, actions) {
                return actions.order.create({
                    purchase_units: [{
                        amount: {
                            value: (donationAmountInCents / 100).toFixed(2) // Convert cents to dollars for PayPal
                        }
                    }]
                });
            },
            onApprove: function(data, actions) {
                return actions.order.capture().then(function(details) {
                    showPaymentAlert(); // Show alert popup on success
                });
            },
            onError: function(err) {
                alert("An error occurred during PayPal transaction.");
                console.error("PayPal Error:", err);
            }
        }).render('#paypal-button-container');
    });

    // Handle the flow of showing the payment options and toggling between buttons
    document.getElementById("donate-button").addEventListener("click", function() {
        document.getElementById("donation-input-area").style.display = "flex";
        this.style.display = "none"; // Hide the donate button once clicked
    });

    // Handle the "Proceed to Payment" button
    document.getElementById("proceed-to-payment-button").addEventListener("click", function() {
        let donationAmount = document.getElementById("donation-amount").value;

        // Validate the donation amount
        if (!donationAmount || isNaN(donationAmount) || donationAmount <= 0) {
            alert("Please enter a valid donation amount.");
            return;
        }

        if (isProceedingToPayment) {
            // Format the donation amount to two decimal places
            donationAmount = parseFloat(donationAmount).toFixed(2);

            // Convert to cents for Stripe and PayPal processing
            donationAmountInCents = parseFloat(donationAmount) * 100;

            // Keep the numeric value in the input field
            document.getElementById("donation-amount").value = donationAmount;

            // Disable the donation amount input and show payment options
            document.getElementById("donation-amount").disabled = true;
            document.getElementById("payment-options").style.display = "block";
            document.getElementById("billing-address-section").style.display = "block";
            document.getElementById("name-section").style.display = "block";
            document.getElementById("note-section").style.display = "block";
            this.innerText = "Change Amount";

            // Apply dark yellow color when button is "Change Payment"
            this.style.backgroundColor = "#f0ad4e";
            this.style.color = "white";

            // Update state
            isProceedingToPayment = false;
        } else {
            // Change payment logic (reset)
            document.getElementById("donation-amount").disabled = false;
            document.getElementById("payment-options").style.display = "none";
            document.getElementById("billing-address-section").style.display = "none";
            document.getElementById("name-section").style.display = "none";
            document.getElementById("note-section").style.display = "none";
            this.innerText = "Proceed to Payment";

            // Revert to green background when button is "Proceed to Payment"
            this.style.backgroundColor = "#28a745";  // Green color
            this.style.color = "white";

            // Update state
            isProceedingToPayment = true;
        }
    });

    // Function to validate billing address
    function validateBillingAddress() {
        const streetAddress = document.getElementById("street-address").value;
        const city = document.getElementById("city").value;
        const state = document.getElementById("state").value;
        const zipCode = document.getElementById("zip-code").value;

        if (!streetAddress || !city || !state || !zipCode) {
            alert("Please fill out all the required billing address fields.");
            return false;
        }
        return true;
    }

    // Function to show the payment success alert
    function showPaymentAlert() {
        document.getElementById("payment-alert").style.display = "flex"; // Show the alert div
    }

    // Handle the "OK" button in the alert box to refresh the page
    document.getElementById("alert-ok-button").addEventListener("click", function() {
        // Refresh the page completely to reset all states
        location.reload();
    });
});
