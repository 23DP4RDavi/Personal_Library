const API_URL = 'http://localhost:3000/api/tasks';

// Load books and render them
async function loadBooks() {
    try {
        const res = await fetch(API_URL);
        if (!res.ok) throw new Error(`Failed to fetch books: ${res.statusText}`);
        const books = await res.json();
        document.getElementById('books').innerHTML = books.map(renderBook).join('');
    } catch (error) {
        console.error('Error loading books:', error);
    }
}

// Render a single book
function renderBook(book) {
    return `
        <div class="task">
            <strong>${book.title}</strong><br>
            Author: ${book.author}<br>
            Year: ${book.year}<br>
            Genre: ${book.genre}<br>
            Read: <input type="checkbox" ${book.read ? 'checked' : ''} onchange="toggleRead('${book._id}', this.checked)">
            <button class="delete-button" onclick="deleteBook('${book._id}')">Delete</button>
        </div>
    `;
}

// Add a new book
async function addBook() {
    const title = document.getElementById('title').value.trim();
    const author = document.getElementById('author').value.trim();
    const year = parseInt(document.getElementById('year').value, 10);
    const genre = document.getElementById('genre').value.trim();
    const read = document.getElementById('read').checked;

    if (!title || !author || !year || !genre) {
        alert('All fields are required!');
        return;
    }

    try {
        await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title, author, year, genre, read })
        });
        clearForm();
        loadBooks();
    } catch (error) {
        console.error('Error adding book:', error);
    }
}

// Toggle read status
async function toggleRead(id, read) {
    try {
        await fetch(`${API_URL}/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ read })
        });
        loadBooks();
    } catch (error) {
        console.error(`Error updating book ${id}:`, error);
    }
}

// Delete a book
async function deleteBook(id) {
    if (!confirm('Are you sure you want to delete this book?')) return;

    try {
        await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
        loadBooks();
    } catch (error) {
        console.error(`Error deleting book ${id}:`, error);
    }
}

// Clear the form inputs
function clearForm() {
    document.getElementById('title').value = '';
    document.getElementById('author').value = '';
    document.getElementById('year').value = '';
    document.getElementById('genre').value = '';
    document.getElementById('read').checked = false;
}

// Remove logout button functionality
document.getElementById('logout-btn').style.display = 'none';

// Initial load
loadBooks();