const express = require('express');
const router = express.Router();
const { readJSONFile, writeJSONFile } = require('../utils/fileOperations');
const { authenticateToken } = require('../middleware/auth');

// Task 8: Add/Modify book review (2 points)
router.post('/', authenticateToken, async (req, res) => {
    try {
        const { bookId, rating, comment } = req.body;
        const userId = req.user.id;
        
        if (!bookId || !rating || !comment) {
            return res.status(400).json({ message: 'Book ID, rating, and comment are required' });
        }
        
        if (rating < 1 || rating > 5) {
            return res.status(400).json({ message: 'Rating must be between 1 and 5' });
        }
        
        const reviews = await readJSONFile('reviews.json');
        
        // Check if user already reviewed this book
        const existingReviewIndex = reviews.findIndex(r => r.bookId === parseInt(bookId) && r.userId === userId);
        
        if (existingReviewIndex !== -1) {
            // Update existing review
            reviews[existingReviewIndex] = {
                ...reviews[existingReviewIndex],
                rating: parseInt(rating),
                comment,
                updatedAt: new Date().toISOString()
            };
        } else {
            // Add new review
            const newReview = {
                id: reviews.length > 0 ? Math.max(...reviews.map(r => r.id)) + 1 : 1,
                bookId: parseInt(bookId),
                userId,
                rating: parseInt(rating),
                comment,
                createdAt: new Date().toISOString()
            };
            reviews.push(newReview);
        }
        
        await writeJSONFile('reviews.json', reviews);
        res.json({ message: 'Review saved successfully' });
        
    } catch (error) {
        res.status(500).json({ message: 'Error saving review', error: error.message });
    }
});

// Task 8: Modify review (PUT endpoint)
router.put('/:id', authenticateToken, async (req, res) => {
    try {
        const reviewId = parseInt(req.params.id);
        const { rating, comment } = req.body;
        const userId = req.user.id;
        
        const reviews = await readJSONFile('reviews.json');
        const reviewIndex = reviews.findIndex(r => r.id === reviewId && r.userId === userId);
        
        if (reviewIndex === -1) {
            return res.status(404).json({ message: 'Review not found or unauthorized' });
        }
        
        reviews[reviewIndex] = {
            ...reviews[reviewIndex],
            rating: parseInt(rating),
            comment,
            updatedAt: new Date().toISOString()
        };
        
        await writeJSONFile('reviews.json', reviews);
        res.json({ message: 'Review updated successfully' });
        
    } catch (error) {
        res.status(500).json({ message: 'Error updating review', error: error.message });
    }
});

// Task 9: Delete book review (2 points)
router.delete('/:id', authenticateToken, async (req, res) => {
    try {
        const reviewId = parseInt(req.params.id);
        const userId = req.user.id;
        
        const reviews = await readJSONFile('reviews.json');
        const reviewIndex = reviews.findIndex(r => r.id === reviewId && r.userId === userId);
        
        if (reviewIndex === -1) {
            return res.status(404).json({ message: 'Review not found or unauthorized' });
        }
        
        reviews.splice(reviewIndex, 1);
        await writeJSONFile('reviews.json', reviews);
        
        res.json({ message: 'Review deleted successfully' });
        
    } catch (error) {
        res.status(500).json({ message: 'Error deleting review', error: error.message });
    }
});

module.exports = router;