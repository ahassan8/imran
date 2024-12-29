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

    const images = [product.image, ...(product.images || [])]; // Main image and additional images

    productDetails.innerHTML = `
    <div class="product-detail-wrapper">
        <div class="main-image-container">
            <img src="../images/${images[0]}" alt="${product.title}" class="main-image" id="mainImage" onclick="openImageOverlay()">
        </div>
        <div class="thumbnail-container" id="thumbnailContainer">
            ${images
                .map((img, index) => `
                <img src="../images/${img}" alt="Thumbnail ${index + 1}" class="thumbnail" onclick="changeMainImage(${index})">
            `)
                .join('')}
        </div>
        <div class="product-info">
            <h1 class="product-title">${product.title}</h1>
            <p class="product-description">${product.description}</p>
            <label for="quantity-select" class="quantity-label">Select Quantity:</label>
            <select id="quantity-select" class="quantity-select">
                ${product.selections
                    .map(selection => `<option value="${selection.quantity}|${selection.price}">${selection.quantity} - $${selection.price}</option>`)
                    .join('')}
            </select>
            <div class="button-container">
                <button class="atcart" onclick="addToCart(${product.id}, '${product.title}', '${product.image}')">Add to Cart</button>
                <button class="buy-now" onclick="buyNow(${product.id}, '${product.title}', '${product.image}')">Buy Now</button>
            </div>
        </div>
    </div>
    <div id="imageOverlay" class="image-overlay" onclick="closeImageOverlay()">
        <img src="" alt="Large View" class="overlay-image" id="overlayImage">
    </div>
    <h2 class="more-products-header">More Products</h2>
    <div class="other-products-container"></div>
    `;

    // Render other products
    const otherProductsContainer = document.querySelector('.other-products-container');
    otherProducts.forEach(otherProduct => {
        const productDiv = document.createElement('div');
        productDiv.classList.add('other-product-card');
        productDiv.innerHTML = `
            <img src="../images/${otherProduct.image}" alt="${otherProduct.title}" class="other-product-image" onclick="swapProduct(${otherProduct.id}, ${product.id})">
            <p class="other-product-title">${otherProduct.title}</p>
        `;
        otherProductsContainer.appendChild(productDiv);
    });
}

// Change the main image when a thumbnail is clicked
function changeMainImage(index) {
    const mainImage = document.getElementById('mainImage');
    const thumbnails = document.querySelectorAll('.thumbnail');
    const newSrc = thumbnails[index].src;

    // Swap the clicked image with the main image
    thumbnails[index].src = mainImage.src;
    mainImage.src = newSrc;
}

// Open the image overlay
function openImageOverlay() {
    const mainImage = document.getElementById('mainImage');
    const overlay = document.getElementById('imageOverlay');
    const overlayImage = document.getElementById('overlayImage');

    overlayImage.src = mainImage.src;
    overlay.style.display = 'flex'; // Show overlay
    document.body.style.overflow = 'hidden'; // Prevent scrolling
}

// Close the image overlay
function closeImageOverlay() {
    const overlay = document.getElementById('imageOverlay');
    overlay.style.display = 'none'; // Hide overlay
    document.body.style.overflow = 'auto'; // Re-enable scrolling
}

// Add to cart function
function addToCart(productId, productTitle, productImage) {
    const selectElement = document.getElementById('quantity-select');
    const [quantity, price] = selectElement.value.split('|').map(Number);

    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    cart.push({
        id: productId,
        title: productTitle,
        image: productImage,
        quantity: quantity,
        price: price * 100 // Store price in cents
    });

    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount(); // Update cart count in the navbar
}

// Buy now function
function buyNow(productId, productTitle, productImage) {
    addToCart(productId, productTitle, productImage);
    window.location.href = '../checkout.html'; // Redirect to checkout
}

// Swap the current product with the clicked product
function swapProduct(newProductId) {
    fetch('./maindata/products.json') // Fetch all products
        .then(response => response.json())
        .then(products => {
            const newProduct = products.find(p => p.id == newProductId);
            if (newProduct) {
                renderProductDetails(newProduct, products);
            }
        })
        .catch(error => console.error('Error fetching products:', error));
}

// Update cart count in navbar
function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const cartCount = cart.length; // Count the number of individual items in the cart
    document.getElementById('cart-count').textContent = cartCount;
}

// Call updateCartCount on page load
updateCartCount();










