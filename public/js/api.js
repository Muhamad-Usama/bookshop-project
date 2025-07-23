// API utility functions
const api = {
    baseURL: '/api',
    
    // Generic fetch wrapper
    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...auth.getAuthHeaders(),
                ...options.headers
            },
            ...options
        };
        
        try {
            const response = await fetch(url, config);
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || 'Request failed');
            }
            
            return data;
        } catch (error) {
            console.error('API request failed:', error);
            throw error;
        }
    },
    
    // Book API methods
    books: {
        getAll: () => api.request('/books'),
        getByISBN: (isbn) => api.request(`/books/isbn/${isbn}`),
        getByAuthor: (author) => api.request(`/books/author/${author}`),
        getByTitle: (title) => api.request(`/books/title/${title}`),
        getReviews: (bookId) => api.request(`/books/${bookId}/reviews`),
        
        // External API searches
        searchByISBN: (isbn) => api.request(`/books/search/isbn/${isbn}`),
        searchByAuthor: (author) => api.request(`/books/search/author/${author}`),
        searchByTitle: (title) => api.request(`/books/search/title/${title}`)
    },
    
    // Review API methods
    reviews: {
        add: (reviewData) => api.request('/reviews', {
            method: 'POST',
            body: JSON.stringify(reviewData)
        }),
        update: (reviewId, reviewData) => api.request(`/reviews/${reviewId}`, {
            method: 'PUT',
            body: JSON.stringify(reviewData)
        }),
        delete: (reviewId) => api.request(`/reviews/${reviewId}`, {
            method: 'DELETE'
        })
    }
};