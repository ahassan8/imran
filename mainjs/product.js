// Initialize cart from localStorage or set to an empty object if not present
let cart = JSON.parse(localStorage.getItem('cart')) || {};

// Update cart count when loading the page
updateCartCount();

// Function to fetch and render products from MySQL database
function fetchAndRenderProducts() {
    fetch('// Initialize cart from localStorage or set to an empty object if not present
let cart = JSON.parse(localStorage.getItem('cart')) || {};

// Update cart count when loading the page
updateCartCount();

// Function to fetch and render products from MySQL database
function fetchAndRenderProducts() {
    fetch('https://imranfaith.com/products') // Fetch products from live server
        .then(response => response.json())
        .then(data => {
            const productContainer = document.getElementById('productContainer');
            productContainer.innerHTML = ''; // Clear the previous product display

            // Create category containers
            const categories = ['Books', 'Car Decals', 'Accessories'];
            categories.forEach(category => {
                // Filter products by category
                const filteredProducts = data.filter(product => product.category === category);

                // Only create and append the category section if there are products
                if (filteredProducts.length > 0) {
                    const categorySection = document.createElement('section');
                    categorySection.classList.add('category-section');

                    const categoryHeader = document.createElement('h2');
                    categoryHeader.textContent = category;
                    categorySection.appendChild(categoryHeader);

                    filteredProducts.forEach(product => {
                        const stockAvailable = product.stock > 0;

                        // Create product card
                        const productDiv = document.createElement('div');
                        productDiv.classList.add('product-card');

                        productDiv.innerHTML = `
                            <div class="product-image-container">
                                <a href="../mainhtml/details.html?id=${product.id}">
                                    <img src="../images/${product.image}" alt="${product.title}" class="product-image">
                                </a>
                            </div>
                            <div class="product-details">
                                <a href="../mainhtml/details.html?id=${product.id}" class="product-title-link">
                                    <h4 class="product-title">${product.title}</h4>
                                </a>
                                <p class="product-available">${product.stock} available</p>
                                <p class="product-price">$${(product.price / 100).toFixed(2)}</p>
                                <div class="button-container">
                                    <button class="atcart" id="addToCart-${product.id}" 
                                        onclick="addToCart(${product.id}, ${product.price}, '${product.title}', '${product.image}', ${product.stock})"
                                        ${stockAvailable ? '' : 'disabled'}
                                        style="${stockAvailable ? '' : 'background-color: grey; cursor: not-allowed;'}">
                                        Add to cart
                                    </button>
                                    <button class="view-cart" id="viewCart-${product.id}" 
                                        onclick="toggleCartVisibility()" 
                                        style="display: none;">
                                        View Cart
                                    </button>
                                </div>
                            </div>
                        `;
                        categorySection.appendChild(productDiv);
                    });

                    // Append category section to product container
                    productContainer.appendChild(categorySection);
                }
            });
        })
        .catch(error => console.error('Error fetching products:', error));
}

// Call fetchAndRenderProducts on page load
fetchAndRenderProducts();

// Function to add items to the cart
function addToCart(productId, productPrice, productTitle, productImage, availableStock) {
    const quantity = 1; // Default quantity to add

    if (cart[productId]) {
        // Check if adding the item exceeds stock
        if (cart[productId].quantity + quantity <= availableStock) {
            cart[productId].quantity += quantity; // Increment quantity
        } else {
            alert(`Only ${availableStock} items in stock. Cannot add more.`);
            return; // Stop further execution if stock limit is reached
        }
    } else {
        // Add new item to the cart
        cart[productId] = {
            quantity,
            price: productPrice,
            title: productTitle,
            image: productImage,
            stock: availableStock
        };
    }

    // Save the updated cart to localStorage
    localStorage.setItem('cart', JSON.stringify(cart));
    console.log('Product added to cart:', cart);

    // Update cart count
    updateCartCount();

    // Show the "View Cart" button for the product
    document.getElementById(`viewCart-${productId}`).style.display = 'inline-block';
}

// Function to update the cart count in the navbar
function updateCartCount() {
    const cartCount = Object.values(cart).reduce((acc, item) => acc + item.quantity, 0);
    document.getElementById('cart-count').textContent = cartCount;
}

// Function to toggle the cart div visibility
function toggleCartVisibility() {
    const cartContainer = document.getElementById('cartContainer');
    const overlay = document.getElementById('overlay');
    const footer = document.querySelector('.site-footer'); // Select the footer

    // Toggle cart and overlay display
    if (cartContainer.style.display === 'none' || cartContainer.style.display === '') {
        cartContainer.style.display = 'block'; // Show the cart container
        overlay.style.display = 'block'; // Show the overlay
        document.body.style.overflow = 'hidden'; // Disable page scroll
        footer.style.display = 'none'; // Hide the footer when cart is open
    } else {
        cartContainer.style.display = 'none'; // Hide the cart container
        overlay.style.display = 'none'; // Hide the overlay
        document.body.style.overflow = 'auto'; // Enable page scroll
        footer.style.display = 'block'; // Show the footer again
    }

    // Refresh the cart items to reflect the latest changes
    renderCartItems();
}

// Function to remove an item from the cart
function removeItem(productId) {
    if (cart[productId]) {
        delete cart[productId]; // Remove item from cart
        localStorage.setItem('cart', JSON.stringify(cart)); // Save updated cart
        updateCartCount(); // Update cart count
        fetchAndRenderProducts(); // Refresh product display
    }
}

// Add event listener to the reset button
document.getElementById('resetCartButton').addEventListener('click', resetCart);

// Function to reset the entire cart
function resetCart() {
    cart = {}; // Clear the cart object
    localStorage.setItem('cart', JSON.stringify(cart)); // Save empty cart to localStorage
    updateCartCount(); // Update the cart count display
    console.log('Cart has been reset.');

    // Optionally, re-render the products to reflect the reset state
    fetchAndRenderProducts();
}
/products')
        .then(response => response.json())
        .then(data => {
            const productContainer = document.getElementById('productContainer');
            productContainer.innerHTML = ''; // Clear the previous product display

            // Create category containers
            const categories = ['Books', 'Car Decals', 'Accessories'];
            categories.forEach(category => {
                // Filter products by category
                const filteredProducts = data.filter(product => product.category === category);

                // Only create and append the category section if there are products
                if (filteredProducts.length > 0) {
                    const categorySection = document.createElement('section');
                    categorySection.classList.add('category-section');

                    const categoryHeader = document.createElement('h2');
                    categoryHeader.textContent = category;
                    categorySection.appendChild(categoryHeader);

                    filteredProducts.forEach(product => {
                        const stockAvailable = product.stock > 0;

                        // Create product card
                        const productDiv = document.createElement('div');
                        productDiv.classList.add('product-card');

                        productDiv.innerHTML = `
                            <div class="product-image-container">
                                <a href="../mainhtml/details.html?id=${product.id}">
                                    <img src="../images/${product.image}" alt="${product.title}" class="product-image">
                                </a>
                            </div>
                            <div class="product-details">
                                <a href="../mainhtml/details.html?id=${product.id}" class="product-title-link">
                                    <h4 class="product-title">${product.title}</h4>
                                </a>
                                <p class="product-available">${product.stock} available</p>
                                <p class="product-price">$${(product.price / 100).toFixed(2)}</p>
                                <div class="button-container">
                                    <button class="atcart" id="addToCart-${product.id}" 
                                        onclick="addToCart(${product.id}, ${product.price}, '${product.title}', '${product.image}', ${product.stock})"
                                        ${stockAvailable ? '' : 'disabled'}
                                        style="${stockAvailable ? '' : 'background-color: grey; cursor: not-allowed;'}">
                                        Add to cart
                                    </button>
                                    <button class="view-cart" id="viewCart-${product.id}" 
                                        onclick="toggleCartVisibility()" 
                                        style="display: none;">
                                        View Cart
                                    </button>
                                </div>
                            </div>
                        `;
                        categorySection.appendChild(productDiv);
                    });

                    // Append category section to product container
                    productContainer.appendChild(categorySection);
                }
            });
        })
        .catch(error => console.error('Error fetching products:', error));
}

// Call fetchAndRenderProducts on page load
fetchAndRenderProducts();

// Function to add items to the cart
function addToCart(productId, productPrice, productTitle, productImage, availableStock) {
    const quantity = 1; // Default quantity to add

    if (cart[productId]) {
        // Check if adding the item exceeds stock
        if (cart[productId].quantity + quantity <= availableStock) {
            cart[productId].quantity += quantity; // Increment quantity
        } else {
            alert(`Only ${availableStock} items in stock. Cannot add more.`);
            return; // Stop further execution if stock limit is reached
        }
    } else {
        // Add new item to the cart
        cart[productId] = {
            quantity,
            price: productPrice,
            title: productTitle,
            image: productImage,
            stock: availableStock
        };
    }

    // Save the updated cart to localStorage
    localStorage.setItem('cart', JSON.stringify(cart));
    console.log('Product added to cart:', cart);

    // Update cart count
    updateCartCount();

    // Show the "View Cart" button for the product
    document.getElementById(`viewCart-${productId}`).style.display = 'inline-block';
}

// Function to update the cart count in the navbar
function updateCartCount() {
    const cartCount = Object.values(cart).reduce((acc, item) => acc + item.quantity, 0);
    document.getElementById('cart-count').textContent = cartCount;
}

// Function to toggle the cart div visibility
function toggleCartVisibility() {
    const cartContainer = document.getElementById('cartContainer');
    const overlay = document.getElementById('overlay');
    const footer = document.querySelector('.site-footer'); // Select the footer

    // Toggle cart and overlay display
    if (cartContainer.style.display === 'none' || cartContainer.style.display === '') {
        cartContainer.style.display = 'block'; // Show the cart container
        overlay.style.display = 'block'; // Show the overlay
        document.body.style.overflow = 'hidden'; // Disable page scroll
        footer.style.display = 'none'; // Hide the footer when cart is open
    } else {
        cartContainer.style.display = 'none'; // Hide the cart container
        overlay.style.display = 'none'; // Hide the overlay
        document.body.style.overflow = 'auto'; // Enable page scroll
        footer.style.display = 'block'; // Show the footer again
    }

    // Refresh the cart items to reflect the latest changes
    renderCartItems();
}

// Function to remove an item from the cart
function removeItem(productId) {
    if (cart[productId]) {
        delete cart[productId]; // Remove item from cart
        localStorage.setItem('cart', JSON.stringify(cart)); // Save updated cart
        updateCartCount(); // Update cart count
        fetchAndRenderProducts(); // Refresh product display
    }
}

// Add event listener to the reset button
document.getElementById('resetCartButton').addEventListener('click', resetCart);

// Function to reset the entire cart
function resetCart() {
    cart = {}; // Clear the cart object
    localStorage.setItem('cart', JSON.stringify(cart)); // Save empty cart to localStorage
    updateCartCount(); // Update the cart count display
    console.log('Cart has been reset.');

    // Optionally, re-render the products to reflect the reset state
    fetchAndRenderProducts();
}
