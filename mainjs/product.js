// Initialize cart from localStorage or set to an empty array if not present
let cart = JSON.parse(localStorage.getItem('cart')) || [];

// Update cart count in the navbar
function updateCartCount() {
    const cartCount = cart.length; // Count the total number of items (individual entries) in the cart
    document.getElementById('cart-count').textContent = cartCount;
}

// Call updateCartCount on page load
updateCartCount();

// Function to fetch and render products by categories
function fetchAndRenderProducts() {
    fetch('./maindata/products.json') // Adjust the path if necessary
        .then(response => response.json())
        .then(data => {
            const mainContainer = document.getElementById('productContainer');
            mainContainer.innerHTML = ''; // Clear the previous content

            // Add a page header
            const pageHeader = document.createElement('header');
            pageHeader.classList.add('page-header');
            pageHeader.innerHTML = `
                <p class="header-description">Browse through our collection of brochures and more to come.
                    <br> Excellent way of 
                        of giving dawah to your non muslim friends, coworkers, and family.
                    <br> If you have concerns or questions, don't hesitate to contact us.
                </p>
            `;
            mainContainer.appendChild(pageHeader);

            // Product container
            const productContainer = document.createElement('div');
            productContainer.id = 'productContainer';
            mainContainer.appendChild(productContainer);

            // Group products by category
            const categories = groupByCategory(data);

            // Render each category
            for (const [category, products] of Object.entries(categories)) {
                // Add a category header
                const categoryHeader = document.createElement('h2');
                categoryHeader.textContent = category;
                categoryHeader.classList.add('category-heading');
                productContainer.appendChild(categoryHeader);

                // Create a container for the products in this category
                const categorySection = document.createElement('div');
                categorySection.classList.add('category-section');

                // Render each product in the category
                products.forEach(product => {
                    const productDiv = document.createElement('div');
                    productDiv.classList.add('product-card');

                    // Generate dropdown options dynamically based on selections in JSON
                    const options = product.selections
                        .map(selection => `<option value="${selection.quantity}|${selection.price}">${selection.quantity} copies - $${selection.price}</option>`)
                        .join('');

                    productDiv.innerHTML = `
                        <div class="product-image-container" onclick="redirectToDetails(${product.id})">
                            <img src="../images/${product.image}" alt="${product.title}" class="product-image">
                        </div>
                        <div class="product-details">
                            <h4 class="product-title" onclick="redirectToDetails(${product.id})">${product.title}</h4>
                            <label for="quantity-select-${product.id}" class="quantity-label">Select Quantity:</label>
                            <select id="quantity-select-${product.id}" class="quantity-select">
                                ${options}
                            </select>
                            <div class="button-container">
                                <button class="atcart" 
                                    id="addToCart-${product.id}"
                                    onclick="addToCart(${product.id}, '${product.title}', '${product.image}')">
                                    Add to Cart
                                </button>
                                <button class="view-cart" id="viewCart-${product.id}" style="display: none;" onclick="openCartDiv()">
                                    View Cart
                                </button>
                            </div>
                        </div>
                    `;

                    categorySection.appendChild(productDiv);
                });

                productContainer.appendChild(categorySection);
            }
        })
        .catch(error => console.error('Error fetching products:', error));
}

// Group products by category
function groupByCategory(products) {
    return products.reduce((categories, product) => {
        const category = product.category || 'Uncategorized';
        if (!categories[category]) {
            categories[category] = [];
        }
        categories[category].push(product);
        return categories;
    }, {});
}

// Add product to cart
function addToCart(productId, productTitle, productImage) {
    const selectElement = document.getElementById(`quantity-select-${productId}`);
    const [quantity, price] = selectElement.value.split('|').map(Number);

    let cart = JSON.parse(localStorage.getItem('cart')) || [];

    // Add the new item with unique data (to prevent duplicate addition of removed items)
    cart.push({
        id: productId,
        title: productTitle,
        image: productImage,
        quantity: quantity,
        price: price * 100, // Store price in cents
    });

    localStorage.setItem('cart', JSON.stringify(cart)); // Save updated cart
    updateCartCount(); // Update cart count

    // Show the "View Cart" button
    const viewCartButton = document.getElementById(`viewCart-${productId}`);
    if (viewCartButton) {
        viewCartButton.style.display = 'block';
    }
}

// Redirect to details page with product ID
function redirectToDetails(productId) {
    window.location.href = `details.html?id=${productId}`;
}

// Open the cart div immediately
function openCartDiv() {
    const cartContainer = document.getElementById('cartContainer');
    const overlay = document.getElementById('overlay');

    if (cartContainer && overlay) {
        overlay.style.display = 'block'; // Show the overlay
        cartContainer.style.display = 'block'; // Show the cart container
        document.body.style.overflow = 'hidden'; // Prevent background scroll
    }
}


// Call fetchAndRenderProducts on page load
fetchAndRenderProducts();











