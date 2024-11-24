// Get product ID from the query string
const urlParams = new URLSearchParams(window.location.search);
const productId = urlParams.get('id'); // Extract 'id' parameter

if (productId) {
    // Fetch products from the local JSON file
    fetch('./maindata/products.json') // Adjust the path to your JSON file
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to load product data');
            }
            return response.json();
        })
        .then(products => {
            // Find the specific product by its ID
            const product = products.find(p => p.id == productId);
            if (!product) {
                throw new Error('Product not found');
            }
            renderProductDetails(product);
        })
        .catch(error => {
            document.getElementById('productDetails').innerHTML = `<p>${error.message}</p>`;
        });
} else {
    document.getElementById('productDetails').innerHTML = '<p>No product selected.</p>';
}

// Render product details function
function renderProductDetails(product) {
    const productDetails = document.getElementById('productDetails');
    productDetails.innerHTML = `
        <div class="product-detail-wrapper">
            <div class="product-image">
                <img src="../images/${product.image}" alt="${product.title}">
            </div>
            <div class="product-info">
                <h1 class="product-title">${product.title}</h1>
                <p class="product-description">${product.description}</p>
                <p class="product-price">$${(product.price / 100).toFixed(2)}</p>
                <p class="product-stock">Stock: ${product.stock} available</p>
                <div class="quantity-container">
                    <button class="quantity-control" onclick="changeQuantity(${product.id}, -1, ${product.stock})">-</button>
                    <span id="quantity-${product.id}" class="quantity-display">1</span>
                    <button class="quantity-control" onclick="changeQuantity(${product.id}, 1, ${product.stock})">+</button>
                </div>
                <div class="button-container">
                    <button class="buy-now" onclick="buyNow(${product.id}, ${product.price}, '${product.title}', '${product.image}', ${product.stock})">
                        Buy Now
                    </button>
                </div>
            </div>
        </div>
    `;
}

// Change quantity function with stock validation and updates
function changeQuantity(productId, delta, stock) {
    const quantityElement = document.getElementById(`quantity-${productId}`);
    let currentQuantity = parseInt(quantityElement.textContent) || 1;
    let newQuantity = currentQuantity + delta;

    if (newQuantity > 0 && newQuantity <= stock) {
        quantityElement.textContent = newQuantity; // Update the quantity display
        updateCart(productId, newQuantity); // Sync with cart
    } else if (newQuantity > stock) {
        alert(`Only ${stock} items are available.`);
    }
}

// Update or add product to cart
function updateCart(productId, newQuantity) {
    let cart = JSON.parse(localStorage.getItem('cart')) || {};

    fetch('./maindata/products.json') // Fetch all products from JSON
        .then(response => response.json())
        .then(products => {
            const product = products.find(p => p.id == productId);
            if (product) {
                cart[productId] = {
                    quantity: newQuantity,
                    price: product.price,
                    title: product.title,
                    image: product.image,
                    stock: product.stock
                };
                localStorage.setItem('cart', JSON.stringify(cart)); // Save to localStorage
                updateCartCount(); // Update cart count in navbar
            }
        })
        .catch(error => console.error('Error fetching product:', error));
}

// Buy Now function with cart update and checkout redirection
function buyNow(productId, productPrice, productTitle, productImage, availableStock) {
    const quantity = parseInt(document.getElementById(`quantity-${productId}`).textContent);

    if (quantity > availableStock) {
        alert(`Cannot buy more than ${availableStock} items.`);
        return;
    }

    const cart = JSON.parse(localStorage.getItem('cart')) || {};

    // Update or add product to the cart
    cart[productId] = {
        quantity,
        price: productPrice,
        title: productTitle,
        image: productImage,
        stock: availableStock
    };

    localStorage.setItem('cart', JSON.stringify(cart)); // Save to localStorage
    updateCartCount(); // Update cart count in navbar
    window.location.href = '../checkout.html'; // Redirect to checkout
}

// Update cart count in the navbar
function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem('cart')) || {};
    const cartCount = Object.values(cart).reduce((acc, item) => acc + item.quantity, 0);
    document.getElementById('cart-count').textContent = cartCount;
}

// Event listener to redirect to cart.html when the cart icon is clicked
document.querySelector('.cart-icon').addEventListener('click', () => {
    window.location.href = '../cart.html';
});

// Call updateCartCount on page load
updateCartCount();
