const express = require('express');
const router = express.Router();
const Book = require('../models/Book');
const UserBook = require('../models/UserBook');

// Dummy admin check middleware
function isAdmin(req, res, next) {
    // Replace with real authentication/authorization
    if (req.headers['x-admin'] === 'true') return next();
    return res.status(403).json({ error: 'Admins only' });
}

// GET all books (everyone)
router.get('/', async (req, res) => {
    try {
        const books = await Book.find();
        res.json(books);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch books' });
    }
});

// POST a new book (admin only)
router.post('/', isAdmin, async (req, res) => {
    const { title, author, year, genre, read } = req.body;
    if (!title || !author || !year || !genre) {
        return res.status(400).json({ error: 'All fields are required' });
    }
    try {
        const book = new Book({ title, author, year, genre, read });
        await book.save();
        res.status(201).json(book);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create book' });
    }
});

// User selects a book
router.post('/select', async (req, res) => {
    const { userId, bookId } = req.body;
    if (!userId || !bookId) {
        return res.status(400).json({ error: 'userId and bookId required' });
    }
    try {
        const userBook = new UserBook({ userId, bookId });
        await userBook.save();
        res.status(201).json(userBook);
    } catch (error) {
        res.status(500).json({ error: 'Failed to select book' });
    }
});

// GET selected books for a user
router.get('/selected', async (req, res) => {
    const { userId } = req.query;
    if (!userId) return res.status(400).json({ error: 'userId required' });
    try {
        const userBooks = await UserBook.find({ userId });
        const bookIds = userBooks.map(ub => ub.bookId);
        const books = await Book.find({ _id: { $in: bookIds } });
        res.json(books);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch selected books' });
    }
});

// PUT (update) a book
router.put('/:id', async (req, res) => {
    const { title, author, year, genre, read } = req.body;
    try {
        const book = await Book.findByIdAndUpdate(
            req.params.id,
            { title, author, year, genre, read },
            { new: true }
        );
        if (!book) return res.status(404).json({ error: 'Book not found' });
        res.json(book);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update book' });
    }
});

// DELETE a book
router.delete('/:id', async (req, res) => {
    try {
        const book = await Book.findByIdAndDelete(req.params.id);
        if (!book) return res.status(404).json({ error: 'Book not found' });
        res.json({ message: 'Book deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete book' });
    }
});

module.exports = router;