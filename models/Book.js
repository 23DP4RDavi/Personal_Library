const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
    title: { type: String, required: true },
    author: { type: String, required: true },
    year: { type: Number, required: true },
    genre: { type: String, required: true },
    read: { type: Boolean, default: false },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

module.exports = mongoose.model('Book', bookSchema);

// Example JSON:
// {
//  "title": "To Kill a Mockingbird",
//  "author": "Harper Lee",
//  "year": 1960,
//  "genre": "Novel",
//  "read": true
// }