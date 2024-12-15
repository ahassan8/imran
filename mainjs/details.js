// Get product ID from the query string
const urlParams = new URLSearchParams(window.location.search);
let productId = urlParams.get('id'); // Extract 'id' parameter

if (productId) {
    fetch('./maindata/products.json') // Fetch products from the local JSON file
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to load product data');
            }
            return response.json();
        })
        .then(products => {
            const product = products.find(p => p.id == productId);
            if (!product) throw new Error('Product not found');

            renderProductDetails(product, products);
        })
        .catch(error => {
            document.getElementById('productDetails').innerHTML = `<p>${error.message}</p>`;
        });
} else {
    document.getElementById('productDetails').innerHTML = '<p>No product selected.</p>';
}

// Render product details and other products
function renderProductDetails(product, products) {
    const productDetails = document.getElementById('productDetails');
    const otherProducts = products.filter(p => p.id != product.id); // Exclude current product

    // Main product display
    productDetails.innerHTML = `
    <div class="product-detail-wrapper">
        <div class="product-image">
            <img src="../images/${product.image}" alt="${product.title}">
        </div>
        <div class="product-info">
            <h1 class="product-title">${product.title}</h1>
            <p class="product-description">${product.description}</p>
            <p class="product-price">$${(product.price / 100).toFixed(2)}</p>
            <div class="quantity-container">
                <button class="quantity-control" onclick="changeQuantity(${product.id}, -1, ${product.stock})">-</button>
                <input type="number" id="quantity-input-${product.id}" class="quantity-input" value="1" min="1" max="${product.stock}" oninput="delayedQuantityUpdate(${product.id}, ${product.stock})">
                <button class="quantity-control" onclick="changeQuantity(${product.id}, 1, ${product.stock})">+</button>
            </div>
            <div class="button-container">
                <button class="atcart" onclick="addToCart(${product.id}, ${product.price}, '${product.title}', '${product.image}', ${product.stock})">Add to Cart</button>
                <button class="buy-now" onclick="buyNow(${product.id}, ${product.price}, '${product.title}', '${product.image}', ${product.stock})">Buy Now</button>
            </div>
        </div>
    </div>
    <h2 class="more-products-header">More Products</h2>
    <div class="other-products-container"></div>
    `;


    // Other products display
    const otherProductsContainer = document.createElement('div');
    otherProductsContainer.classList.add('other-products-container');

    otherProducts.forEach(otherProduct => {
        const productDiv = document.createElement('div');
        productDiv.classList.add('other-product-card');
        productDiv.innerHTML = `
            <img src="../images/${otherProduct.image}" alt="${otherProduct.title}" class="other-product-image" onclick="swapProduct(${otherProduct.id}, ${product.id})">
            <p class="other-product-title">${otherProduct.title}</p>
        `;
        otherProductsContainer.appendChild(productDiv);
    });

    productDetails.appendChild(otherProductsContainer);
}

// Swap the current product with the clicked product
function swapProduct(newProductId, currentProductId) {
    fetch('./maindata/products.json') // Fetch all products
        .then(response => response.json())
        .then(products => {
            const newProduct = products.find(p => p.id == newProductId);
            const currentProduct = products.find(p => p.id == currentProductId);
            if (newProduct && currentProduct) {
                renderProductDetails(newProduct, products);
            }
        })
        .catch(error => console.error('Error fetching products:', error));
}

// Change quantity function
function changeQuantity(productId, delta, stock) {
    const quantityInput = document.getElementById(`quantity-input-${productId}`);
    let currentQuantity = parseInt(quantityInput.value) || 1;
    let newQuantity = currentQuantity + delta;

    if (newQuantity > 0 && newQuantity <= stock) {
        quantityInput.value = newQuantity;
    } else if (newQuantity > stock) {
        alert(`Only ${stock} items are available.`);
    }
}

// Delayed quantity update
let quantityUpdateTimeout;
function delayedQuantityUpdate(productId, stock) {
    clearTimeout(quantityUpdateTimeout);

    quantityUpdateTimeout = setTimeout(() => {
        const inputField = document.getElementById(`quantity-input-${productId}`);
        let newQuantity = parseInt(inputField.value);

        if (isNaN(newQuantity) || newQuantity < 1 || newQuantity > stock) {
            alert(`Please enter a valid quantity (1-${stock}).`);
            inputField.value = 1; // Reset to 1 if invalid
        }
    }, 3000);
}

// Add to cart function
function addToCart(productId, price, title, image, stock) {
    let cart = JSON.parse(localStorage.getItem('cart')) || {};
    const quantity = parseInt(document.getElementById(`quantity-input-${productId}`).value);

    if (quantity <= stock) {
        cart[productId] = { quantity, price, title, image, stock };
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartCount(); // Update cart count in navbar
    } else {
        alert(`Only ${stock} items are available.`);
    }
}

// Buy Now function
function buyNow(productId, price, title, image, stock) {
    const quantity = parseInt(document.getElementById(`quantity-input-${productId}`).value);
    if (quantity > stock) {
        alert(`Cannot buy more than ${stock} items.`);
        return;
    }

    const cart = JSON.parse(localStorage.getItem('cart')) || {};
    cart[productId] = { quantity, price, title, image, stock };
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount(); // Update cart count in navbar
    window.location.href = '../checkout.html'; // Redirect to checkout
}

// Update cart count in navbar
function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem('cart')) || {};
    const cartCount = Object.values(cart).reduce((acc, item) => acc + item.quantity, 0);
    document.getElementById('cart-count').textContent = cartCount;
}

// Redirect to cart page on cart icon click
document.querySelector('.cart-icon').addEventListener('click', () => {
    window.location.href = '../cart.html';
});

// Call updateCartCount on page load
updateCartCount();







