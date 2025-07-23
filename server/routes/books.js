const express = require('express');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const router = express.Router();

// Helper functions (moved from utils/fileOperations.js)
const readJSONFile = (filename) => {
    return new Promise((resolve, reject) => {
        const filePath = path.join(__dirname, '../data', filename);
        fs.readFile(filePath, 'utf8', (err, data) => {
            if (err) {
                reject(err);
            } else {
                try {
                    resolve(JSON.parse(data));
                } catch (parseErr) {
                    reject(parseErr);
                }
            }
        });
    });
};

// Task 10: Async callback function
const getAllBooksCallback = (callback) => {
    const filePath = path.join(__dirname, '../data/books.json');
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            return callback(err, null);
        }
        try {
            const books = JSON.parse(data);
            callback(null, books);
        } catch (parseErr) {
            callback(parseErr, null);
        }
    });
};

// Task 1: Get all books available in shop (2 points)
router.get('/', (req, res) => {
    readJSONFile('books.json')
        .then(books => {
            res.json(books);
        })
        .catch(error => {
            res.status(500).json({ message: 'Error reading books', error: error.message });
        });
});

// Task 10: Get all books using async callback (2 points)
router.get('/callback', (req, res) => {
    getAllBooksCallback((err, books) => {
        if (err) {
            return res.status(500).json({ message: 'Error reading books', error: err.message });
        }
        res.json(books);
    });
});

// Task 2: Get books based on ISBN (2 points)
router.get('/isbn/:isbn', async (req, res) => {
    try {
        const { isbn } = req.params;
        const books = await readJSONFile('books.json');
        const book = books.find(b => b.isbn === isbn);
        
        if (book) {
            res.json(book);
        } else {
            res.status(404).json({ message: 'Book not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error searching by ISBN', error: error.message });
    }
});

// Task 11: Search by ISBN using Promises with Axios (2 points)
router.get('/search/isbn/:isbn', (req, res) => {
    const { isbn } = req.params;
    
    // Using Promises with Axios
    axios.get(`https://openlibrary.org/api/books?bibkeys=ISBN:${isbn}&format=json&jscmd=data`)
        .then(response => {
            const data = response.data;
            if (Object.keys(data).length > 0) {
                res.json(data);
            } else {
                res.status(404).json({ message: 'Book not found in external API' });
            }
        })
        .catch(error => {
            res.status(500).json({ message: 'Error searching external API', error: error.message });
        });
});

// Task 3: Get all books by Author (2 points)
router.get('/author/:author', async (req, res) => {
    try {
        const { author } = req.params;
        const books = await readJSONFile('books.json');
        const authorBooks = books.filter(book => 
            book.author.toLowerCase().includes(author.toLowerCase())
        );
        res.json(authorBooks);
    } catch (error) {
        res.status(500).json({ message: 'Error searching by author', error: error.message });
    }
});

// Task 12: Search by Author using async/await (2 points)
router.get('/search/author/:author', async (req, res) => {
    try {
        const { author } = req.params;
        
        // Using async/await with Axios
        const response = await axios.get(`https://openlibrary.org/search.json?author=${encodeURIComponent(author)}&limit=10`);
        const books = response.data.docs.map(book => ({
            title: book.title,
            author: book.author_name ? book.author_name[0] : 'Unknown',
            isbn: book.isbn ? book.isbn[0] : 'N/A',
            publishYear: book.first_publish_year || 'Unknown'
        }));
        
        res.json(books);
    } catch (error) {
        res.status(500).json({ message: 'Error searching by author in external API', error: error.message });
    }
});

// Task 4: Get books based on Title (2 points)
router.get('/title/:title', async (req, res) => {
    try {
        const { title } = req.params;
        const books = await readJSONFile('books.json');
        const titleBooks = books.filter(book => 
            book.title.toLowerCase().includes(title.toLowerCase())
        );
        res.json(titleBooks);
    } catch (error) {
        res.status(500).json({ message: 'Error searching by title', error: error.message });
    }
});

// Task 13: Search by Title using async/await (2 points)
router.get('/search/title/:title', async (req, res) => {
    try {
        const { title } = req.params;
        
        // Using async/await with Axios
        const response = await axios.get(`https://openlibrary.org/search.json?title=${encodeURIComponent(title)}&limit=10`);
        const books = response.data.docs.map(book => ({
            title: book.title,
            author: book.author_name ? book.author_name.join(', ') : 'Unknown',
            isbn: book.isbn ? book.isbn[0] : 'N/A',
            publishYear: book.first_publish_year || 'Unknown'
        }));
        
        res.json(books);
    } catch (error) {
        res.status(500).json({ message: 'Error searching by title in external API', error: error.message });
    }
});

// Task 5: Get book reviews (2 points)
router.get('/:id/reviews', async (req, res) => {
    try {
        const bookId = parseInt(req.params.id);
        const reviews = await readJSONFile('reviews.json');
        const users = await readJSONFile('users.json');
        
        const bookReviews = reviews
            .filter(review => review.bookId === bookId)
            .map(review => {
                const user = users.find(u => u.id === review.userId);
                return {
                    ...review,
                    username: user ? user.username : 'Unknown User'
                };
            });
        
        res.json(bookReviews);
    } catch (error) {
        res.status(500).json({ message: 'Error getting reviews', error: error.message });
    }
});

module.exports = router;