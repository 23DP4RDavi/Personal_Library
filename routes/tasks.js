const express = require('express');
const router = express.Router();
const Book = require('../models/Book');

// GET all books
router.get('/', async (req, res) => {
    try {
        const books = await Book.find();
        res.json(books);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch books' });
    }
});

// POST a new book
router.post('/', async (req, res) => {
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