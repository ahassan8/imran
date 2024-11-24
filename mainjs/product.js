// Initialize cart from localStorage or set to an empty object if not present
let cart = JSON.parse(localStorage.getItem('cart')) || {};

// Update cart count when loading the page
updateCartCount();

// Function to fetch and render products from products.json
function fetchAndRenderProducts() {
    fetch('./maindata/products.json') // Adjust the path if necessary
        .then(response => response.json())
        .then(data => {
            const productContainer = document.getElementById('productContainer');
            productContainer.innerHTML = ''; // Clear the previous product display

            // Define categories
            const categories = ['Books', 'Car Decals', 'Accessories', 'E-books'];

            // Create sections for each category
            categories.forEach(category => {
                const filteredProducts = data.filter(product => product.category === category);

                // Only create a section if there are products in the category
                if (filteredProducts.length > 0) {
                    const categorySection = document.createElement('section');
                    categorySection.classList.add('category-section');

                    const categoryHeader = document.createElement('h2');
                    categoryHeader.textContent = category;
                    categorySection.appendChild(categoryHeader);

                    // Add products to the category section
                    filteredProducts.forEach(product => {
                        const productDiv = document.createElement('div');
                        productDiv.classList.add('product-card');

                        productDiv.innerHTML = `
                            <div class="product-image-container">
                                <a href="../details.html?id=${product.id}">
                                    <img src="../images/${product.image}" alt="${product.title}" class="product-image">
                                </a>
                            </div>
                            <div class="product-details">
                                <a href="../details.html?id=${product.id}" class="product-title-link">
                                    <h4 class="product-title">${product.title}</h4>
                                </a>
                                <p class="product-available">${product.stock} available</p>
                                <p class="product-price">$${(product.price / 100).toFixed(2)}</p>
                                <div class="button-container">
                                    <button class="atcart" 
                                        onclick="addToCart(${product.id}, ${product.price}, '${product.title}', '${product.image}', ${product.stock})"
                                        ${product.stock > 0 ? '' : 'disabled'}
                                        style="${product.stock > 0 ? '' : 'background-color: grey; cursor: not-allowed;'}">
                                        Add to Cart
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

                    productContainer.appendChild(categorySection); // Append category section
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
        if (cart[productId].quantity + quantity <= availableStock) {
            cart[productId].quantity += quantity; // Increment quantity
        } else {
            alert(`Only ${availableStock} items in stock. Cannot add more.`);
            return;
        }
    } else {
        cart[productId] = {
            quantity,
            price: productPrice,
            title: productTitle,
            image: productImage,
            stock: availableStock
        };
    }

    localStorage.setItem('cart', JSON.stringify(cart)); // Save updated cart
    updateCartCount(); // Update cart count

    document.getElementById(`viewCart-${productId}`).style.display = 'inline-block'; // Show "View Cart" button
}

// Function to update the cart count in the navbar
function updateCartCount() {
    const cartCount = Object.values(cart).reduce((acc, item) => acc + item.quantity, 0);
    document.getElementById('cart-count').textContent = cartCount;
}

// Function to toggle the cart visibility
function toggleCartVisibility() {
    const cartContainer = document.getElementById('cartContainer');
    const overlay = document.getElementById('overlay');

    if (cartContainer.style.display === 'none' || cartContainer.style.display === '') {
        cartContainer.style.display = 'block';
        overlay.style.display = 'block';
        document.body.style.overflow = 'hidden'; // Disable scrolling
    } else {
        cartContainer.style.display = 'none';
        overlay.style.display = 'none';
        document.body.style.overflow = 'auto'; // Enable scrolling
    }
}

// Function to reset the cart
function resetCart() {
    cart = {}; // Clear the cart
    localStorage.setItem('cart', JSON.stringify(cart)); // Save empty cart
    updateCartCount(); // Update cart count
    fetchAndRenderProducts(); // Re-render products
    console.log('Cart has been reset.');
}

// Add event listener to the reset button
document.getElementById('resetCartButton').addEventListener('click', resetCart);
