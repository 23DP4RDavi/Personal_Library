const API_URL = 'http://localhost:3000/api/tasks';
const isAdmin = localStorage.getItem('isAdmin') === 'true';

// Load books and render them
async function loadBooks() {
    try {
        let books = [];
        if (isAdmin) {
            // Admin sees all books
            const res = await fetch(API_URL);
            if (!res.ok) throw new Error(`Failed to fetch books: ${res.statusText}`);
            books = await res.json();
        } else {
            // User sees only their selected books
            let userId = localStorage.getItem('userId');
            // If no userId, generate a random one and store it (no prompt)
            if (!userId) {
                userId = 'user_' + Math.random().toString(36).substr(2, 9);
                localStorage.setItem('userId', userId);
            }
            const res = await fetch(`${API_URL}/selected?userId=${encodeURIComponent(userId)}`);
            if (!res.ok) throw new Error(`Failed to fetch selected books: ${res.statusText}`);
            books = await res.json();

            // Populate dropdown with ALL books, not just selected
            populateDropdown();
        }
        document.getElementById('books').innerHTML = books.map(renderBook).join('');
        if (isAdmin) {
            document.getElementById('user-select-section').style.display = 'none';
        }
    } catch (error) {
        console.error('Error loading books:', error);
    }
}

// Populate dropdown for users (show all books)
async function populateDropdown() {
    const dropdown = document.getElementById('book-dropdown');
    if (!dropdown) return;
    try {
        const res = await fetch(API_URL);
        if (!res.ok) throw new Error('Failed to fetch all books for dropdown');
        const allBooks = await res.json();
        dropdown.innerHTML = '<option value="">Select a book</option>' +
            allBooks.map(book =>
                `<option value="${book._id}">${book.title} (${book.author}, ${book.year})</option>`
            ).join('');
    } catch (error) {
        console.error('Error populating dropdown:', error);
    }
}

// User selects a book from dropdown
async function selectBookFromDropdown() {
    const dropdown = document.getElementById('book-dropdown');
    const bookId = dropdown.value;
    if (!bookId) {
        alert('Please select a book.');
        return;
    }
    await selectBook(bookId);
    await loadBooks();
}

// Add Book (admin only)
async function addBook() {
    const title = document.getElementById('title').value.trim();
    const author = document.getElementById('author').value.trim();
    const year = parseInt(document.getElementById('year').value, 10);
    const genre = document.getElementById('genre').value.trim();

    if (!title || !author || !year || !genre) {
        alert('All fields are required!');
        return;
    }

    try {
        await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-admin': 'true'
            },
            body: JSON.stringify({ title, author, year, genre, read: false }) // Always set read: false
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
}

// User selects a book
async function selectBook(bookId) {
    let userId = localStorage.getItem('userId');
    // If no userId, generate a random one and store it (no prompt)
    if (!userId) {
        userId = 'user_' + Math.random().toString(36).substr(2, 9);
        localStorage.setItem('userId', userId);
    }
    try {
        await fetch(`${API_URL}/select`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, bookId })
        });
        alert('Book selected!');
    } catch (error) {
        console.error('Error selecting book:', error);
    }
}

// Render a single book
function renderBook(book) {
    return `
        <div class="task">
            <strong>${book.title}</strong>
            <span>Author: ${book.author}</span>
            <span>Year: ${book.year}</span>
            <span>Genre: ${book.genre}</span>
            ${!isAdmin ? `
            <label class="read-label">
                <input type="checkbox" class="read-checkbox" ${book.read ? 'checked' : ''} 
                    onchange="toggleRead('${book._id}', this.checked)">
                Read
            </label>
            ` : ''}
            ${isAdmin
                ? `<button class="delete-button" onclick="deleteBook('${book._id}')">Delete</button>
                   <button class="delete-button" onclick="editBook('${book._id}', '${book.title}', '${book.author}', '${book.year}', '${book.genre}', ${book.read})">Edit</button>`
                : ''
            }
        </div>
    `;
}

// Edit book (admin only)
async function editBook(id, title, author, year, genre, read) {
    const newTitle = prompt('Edit title:', title);
    if (newTitle === null) return;
    const newAuthor = prompt('Edit author:', author);
    if (newAuthor === null) return;
    const newYear = prompt('Edit year:', year);
    if (newYear === null) return;
    const newGenre = prompt('Edit genre:', genre);
    if (newGenre === null) return;

    try {
        await fetch(`${API_URL}/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'x-admin': 'true'
            },
            body: JSON.stringify({
                title: newTitle,
                author: newAuthor,
                year: parseInt(newYear, 10),
                genre: newGenre
                // No 'read' field here
            })
        });
        loadBooks();
    } catch (error) {
        console.error('Error editing book:', error);
    }
}

// Logout function
function logout() {
    localStorage.removeItem('isAdmin');
    localStorage.removeItem('userId');
    location.reload();
}

function setAdmin(isAdmin) {
    localStorage.setItem('isAdmin', isAdmin ? 'true' : 'false');
    location.reload();
}

// Admin login
async function loginAdmin() {
    const username = prompt('Enter admin username:');
    if (username === null) return;
    const password = prompt('Enter admin password:');
    if (password === null) return;

    try {
        const res = await fetch('http://localhost:3000/api/admin/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        if (!res.ok) {
            alert('Invalid credentials!');
            return;
        }
        localStorage.setItem('isAdmin', 'true');
        location.reload();
    } catch (error) {
        alert('Login failed!');
        console.error('Admin login error:', error);
    }
}

// Show greeting and toggle UI based on mode
document.addEventListener('DOMContentLoaded', () => {
    const greeting = document.getElementById('greeting');
    const isAdmin = localStorage.getItem('isAdmin') === 'true';
    greeting.textContent = isAdmin ? 'Admin' : 'User';

    // Toggle form and dropdown visibility
    document.getElementById('book-form').style.display = isAdmin ? 'block' : 'none';
    const userSelectSection = document.getElementById('user-select-section');
    if (isAdmin) {
        userSelectSection.classList.remove('show');
    } else {
        userSelectSection.classList.add('show');
    }

    // Show logout button only for admin
    const logoutBtn = document.getElementById('logout-btn');
    logoutBtn.style.display = isAdmin ? 'inline-block' : 'none';

    // Show admin settings only for admin
    const adminSettings = document.querySelectorAll('.admin-settings');
    adminSettings.forEach(el => {
        el.style.display = isAdmin ? 'inline-block' : 'none';
    });
});

// Initial load
loadBooks();