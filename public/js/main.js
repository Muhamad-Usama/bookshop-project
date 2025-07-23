// Main application logic
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
});

function initializeApp() {
    updateAuthUI();
    setupEventListeners();
    loadAllBooks(); // Load books on page load
}

function setupEventListeners() {
    // Tab switching
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            switchTab(e.target.dataset.tab);
        });
    });
    
    // Search forms
    document.getElementById('isbn-search').addEventListener('submit', handleISBNSearch);
    document.getElementById('author-search').addEventListener('submit', handleAuthorSearch);
    document.getElementById('title-search').addEventListener('submit', handleTitleSearch);
    
    // Load all books button
    document.getElementById('load-all-books').addEventListener('click', loadAllBooks);
    
    // Review form
    document.getElementById('review-form').addEventListener('submit', handleReviewSubmit);
}

function switchTab(tabName) {
    // Remove active class from all tabs and forms
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.search-form').forEach(form => form.classList.remove('active'));
    
    // Add active class to selected tab and form
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
    document.getElementById(`${tabName}-search`).classList.add('active');
}

// Task 1: Load all books (2 points)
async function loadAllBooks() {
    try {
        const books = await api.books.getAll();
        displayBooks(books, 'Available Books in Shop');
    } catch (error) {
        showError('Failed to load books: ' + error.message);
    }
}

// Task 2: Search by ISBN (2 points)
async function handleISBNSearch(e) {
    e.preventDefault();
    const isbn = document.getElementById('isbn-input').value.trim();
    
    if (!isbn) return;
    
    try {
        const book = await api.books.getByISBN(isbn);
        displayBooks([book], `Book with ISBN: ${isbn}`);
    } catch (error) {
        showError('Book not found with ISBN: ' + isbn);
    }
}

// Task 3: Search by Author (2 points)
async function handleAuthorSearch(e) {
    e.preventDefault();
    const author = document.getElementById('author-input').value.trim();
    
    if (!author) return;
    
    try {
        const books = await api.books.getByAuthor(author);
        displayBooks(books, `Books by: ${author}`);
    } catch (error) {
        showError('Failed to search by author: ' + error.message);
    }
}

// Task 4: Search by Title (2 points)
async function handleTitleSearch(e) {
    e.preventDefault();
    const title = document.getElementById('title-input').value.trim();
    
    if (!title) return;
    
    try {
        const books = await api.books.getByTitle(title);
        displayBooks(books, `Books with title: ${title}`);
    } catch (error) {
        showError('Failed to search by title: ' + error.message);
    }
}

function displayBooks(books, title) {
    const container = document.getElementById('books-container');
    
    if (books.length === 0) {
        container.innerHTML = `
            <div class="no-results">
                <h3>${title}</h3>
                <p>No books found.</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = `
        <h3>${title}</h3>
        <div class="books-grid">
            ${books.map(book => `
                <div class="book-card">
                    <h4>${book.title}</h4>
                    <p><strong>Author:</strong> ${book.author}</p>
                    <p><strong>ISBN:</strong> ${book.isbn}</p>
                    <p><strong>Price:</strong> ${book.price}</p>
                    <p>${book.description}</p>
                    <button onclick="loadBookReviews(${book.id}, '${book.title}')" class="btn-reviews">
                        View Reviews
                    </button>
                </div>
            `).join('')}
        </div>
    `;
}

// Task 5: Load book reviews (2 points)
async function loadBookReviews(bookId, bookTitle) {
    try {
        const reviews = await api.books.getReviews(bookId);
        displayReviews(reviews, bookTitle, bookId);
        
        // Show reviews section
        document.getElementById('reviews-section').style.display = 'block';
        document.getElementById('reviews-section').scrollIntoView({ behavior: 'smooth' });
    } catch (error) {
        showError('Failed to load reviews: ' + error.message);
    }
}

function displayReviews(reviews, bookTitle, bookId) {
    const container = document.getElementById('reviews-container');
    
    container.innerHTML = `
        <h3>Reviews for: ${bookTitle}</h3>
        ${reviews.length === 0 ? 
            '<p>No reviews yet. Be the first to review this book!</p>' :
            reviews.map(review => `
                <div class="review-card" data-review-id="${review.id}">
                    <div class="review-header">
                        <strong>${review.username}</strong>
                        <span class="rating">${'★'.repeat(review.rating)}${'☆'.repeat(5-review.rating)}</span>
                        <small>${new Date(review.createdAt).toLocaleDateString()}</small>
                    </div>
                    <p>${review.comment}</p>
                    ${auth.isLoggedIn() && auth.getUser().id === review.userId ? `
                        <div class="review-actions">
                            <button onclick="editReview(${review.id}, ${review.rating}, '${review.comment}')" class="btn-edit">Edit</button>
                            <button onclick="deleteReview(${review.id})" class="btn-delete">Delete</button>
                        </div>
                    ` : ''}
                </div>
            `).join('')
        }
    `;
    
    // Set book ID for review form
    document.getElementById('review-book-id').value = bookId;
}

// Task 8: Submit review (2 points)
async function handleReviewSubmit(e) {
    e.preventDefault();
    
    if (!auth.isLoggedIn()) {
        showError('Please login to submit a review');
        return;
    }
    
    const bookId = document.getElementById('review-book-id').value;
    const rating = document.getElementById('review-rating').value;
    const comment = document.getElementById('review-comment').value;
    
    try {
        await api.reviews.add({ bookId: parseInt(bookId), rating: parseInt(rating), comment });
        showSuccess('Review submitted successfully!');
        
        // Reload reviews
        const bookTitle = document.querySelector('#reviews-container h3').textContent.replace('Reviews for: ', '');
        loadBookReviews(parseInt(bookId), bookTitle);
        
        // Reset form
        document.getElementById('review-form').reset();
    } catch (error) {
        showError('Failed to submit review: ' + error.message);
    }
}

// Task 8: Edit review (2 points)
async function editReview(reviewId, currentRating, currentComment) {
    const rating = prompt('Enter new rating (1-5):', currentRating);
    const comment = prompt('Enter new comment:', currentComment);
    
    if (rating && comment) {
        try {
            await api.reviews.update(reviewId, { 
                rating: parseInt(rating), 
                comment 
            });
            showSuccess('Review updated successfully!');
            
            // Reload reviews
            const bookId = document.getElementById('review-book-id').value;
            const bookTitle = document.querySelector('#reviews-container h3').textContent.replace('Reviews for: ', '');
            loadBookReviews(parseInt(bookId), bookTitle);
        } catch (error) {
            showError('Failed to update review: ' + error.message);
        }
    }
}

// Task 9: Delete review (2 points)
async function deleteReview(reviewId) {
    if (confirm('Are you sure you want to delete this review?')) {
        try {
            await api.reviews.delete(reviewId);
            showSuccess('Review deleted successfully!');
            
            // Reload reviews
            const bookId = document.getElementById('review-book-id').value;
            const bookTitle = document.querySelector('#reviews-container h3').textContent.replace('Reviews for: ', '');
            loadBookReviews(parseInt(bookId), bookTitle);
        } catch (error) {
            showError('Failed to delete review: ' + error.message);
        }
    }
}

function showError(message) {
    alert('Error: ' + message);
}

function showSuccess(message) {
    alert('Success: ' + message);
}