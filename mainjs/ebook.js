document.addEventListener("DOMContentLoaded", function() {
    fetch('../maindata/ebook.json')
        .then(response => response.json())
        .then(data => initializeSlideshow(data))
        .catch(error => console.error('Error loading e-book data:', error));
});

let currentIndex = 0;

function initializeSlideshow(ebooks) {
    const ebookContainer = document.getElementById('ebook-products');
    ebookContainer.innerHTML = `
        <h3 class="e-header">E-Books</h3>
        <div class="ebook-slideshow">
            <button class="arrow left-arrow">
                <img src="../icons/wleft.png" alt="Previous" style="width: 120px; height: 120px;">
            </button>
            <div class="ebook-wrapper"></div>
            <button class="arrow right-arrow">
                <img src="../icons/wright.png" alt="Next" style="width: 120px; height: 120px;">
            </button>
        </div>
    `;
    
    const ebookWrapper = ebookContainer.querySelector('.ebook-wrapper');
    const leftArrow = ebookContainer.querySelector('.left-arrow');
    const rightArrow = ebookContainer.querySelector('.right-arrow');
    const booksPerPage = 6;

    function displayEbooks(startIndex) {
        ebookWrapper.innerHTML = '';
        
        for (let i = startIndex; i < startIndex + booksPerPage; i++) {
            const ebook = ebooks[i % ebooks.length]; 
            const ebookCard = document.createElement('div');
            ebookCard.classList.add('ebook-card');

            // Conditionally add each property based on availability
            ebookCard.innerHTML = `
                <img src="${ebook.image}" alt="${ebook.title || 'eBook Image'}" class="ebook-image" />
                ${ebook.title ? `<h3 class="ebook-title">${ebook.title}</h3>` : ''}
                ${ebook.author ? `<p class="ebook-author">Author: ${ebook.author}</p>` : ''}
                ${ebook.price ? `<p class="ebook-price">$${(ebook.price / 100).toFixed(2)}</p>` : ''}
                <a href="echeckout.html?title=${encodeURIComponent(ebook.title)}&price=${ebook.price}" class="ebook-buy-now-button">Buy Now</a>
            `;

            ebookWrapper.appendChild(ebookCard);
        }
    }

    // Initial display
    displayEbooks(currentIndex);

    // Event listeners for navigation
    leftArrow.addEventListener("click", () => {
        currentIndex = (currentIndex - 1 + ebooks.length) % ebooks.length;
        displayEbooks(currentIndex);
    });

    rightArrow.addEventListener("click", () => {
        currentIndex = (currentIndex + 1) % ebooks.length;
        displayEbooks(currentIndex);
    });
}
