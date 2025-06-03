const mongoose = require('mongoose');

const userBookSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    bookId: { type: mongoose.Schema.Types.ObjectId, ref: 'Book', required: true },
    selectedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('UserBook', userBookSchema);