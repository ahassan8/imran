window.onload = function () {
    // Retrieve order details from localStorage (common for both PayPal and Stripe)
    const orderSummary = JSON.parse(localStorage.getItem('orderSummary')) || {};

    // If there is no orderSummary, redirect to the homepage
    if (!orderSummary.items || Object.keys(orderSummary.items).length === 0) {
        window.location.href = 'index.html';
        return;
    }

    // Generate a unique Order ID (use the existing ID if generated, otherwise create one)
    const orderID = orderSummary.orderID || generateOrderID();

    // Store the order ID back to localStorage if newly generated
    if (!orderSummary.orderID) {
        orderSummary.orderID = orderID;
        localStorage.setItem('orderSummary', JSON.stringify(orderSummary));
    }

    // Display Order ID
    document.getElementById('orderID').textContent = orderID;

    // Display Total Amount
    if (orderSummary.totalAmount) {
        document.getElementById('orderTotal').textContent = `$${orderSummary.totalAmount.toFixed(2)}`;
    } else {
        document.getElementById('orderTotal').textContent = 'Total not available';
    }

    // Display Purchased Items (iterate through the cart items)
    const orderItems = orderSummary.items;
    const itemListHTML = Object.values(orderItems).map(item => `
        <li>${item.title} - ${item.quantity} x $${item.price.toFixed(2)}</li>
    `).join('');
    document.getElementById('orderItems').innerHTML = itemListHTML;

    // Check for E-books in the purchased items and display a download link
    const ebookSection = document.getElementById('ebookSection');
    const ebooks = orderItems.filter(item => item.isEbook); // Assuming `isEbook` property marks E-books
    if (ebooks.length > 0) {
        const ebookLinksHTML = ebooks.map(ebook => `
            <p>E-book: ${ebook.title} - <a href="${ebook.downloadLink}" target="_blank">Download PDF</a></p>
        `).join('');
        ebookSection.innerHTML = ebookLinksHTML;
        ebookSection.style.display = 'block';
    } else {
        ebookSection.style.display = 'none';
    }

    // Display Shipping Information (if available)
    if (orderSummary.shipping) {
        const { name, address, city, state, zip } = orderSummary.shipping;
        document.getElementById('shippingName').textContent = name || 'N/A';
        document.getElementById('shippingAddress').textContent = `${address || 'N/A'}, ${city || 'N/A'}, ${state || 'N/A'}, ${zip || 'N/A'}`;
    } else {
        document.getElementById('shippingName').textContent = 'N/A';
        document.getElementById('shippingAddress').textContent = 'N/A';
    }

    // Clear the cart and order summary after details are displayed
    clearCartAndOrderSummary();
};

// Function to generate a unique order ID using timestamp and random number
function generateOrderID() {
    const timestamp = Date.now();
    const randomNumber = Math.floor(Math.random() * 1000);
    return `ORD-${timestamp}-${randomNumber}`;
}

// Function to clear cart and order summary from localStorage
function clearCartAndOrderSummary() {
    localStorage.removeItem('cart');
    localStorage.removeItem('orderSummary');
}
