const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
    title: { type: String, required: true },
    author: { type: String, required: true },
    year: { type: Number, required: true },
    genre: { type: String, required: true },
    read: { type: Boolean, default: false }

}, { timestamps: true });

module.exports = mongoose.model('Book', bookSchema);