const API_URL = 'http://localhost:3000/api/tasks';

if (!localStorage.getItem('token')) {
    window.location.href = '/login/login.html';
}

// Show greeting with username
const username = localStorage.getItem('username');
if (username) {
    document.getElementById('greeting').innerText = `Hello, ${username} ! :)`;
}

// Load tasks and render them
async function loadTasks() {
    try {
        const res = await fetch(API_URL, { headers: getAuthHeaders() });
        if (!res.ok) throw new Error(`Failed to fetch tasks: ${res.statusText}`);
        const tasks = await res.json();
        document.getElementById('tasks').innerHTML = tasks.map(renderTask).join('');
    } catch (error) {
        console.error('Error loading tasks:', error);
    }
}

// Render a single task
function renderTask(task) {
    return `
        <div class="task">
            <strong>${task.title}</strong><br>
            Description: ${task.description}<br>
            Status: ${renderSelect('status', task._id, task.status, ['not started', 'started', 'almost done', 'finished'])}<br>
            Urgency: ${renderSelect('urgency', task._id, task.urgency, ['low', 'medium', 'high'])}<br>
            <button class="delete-button" onclick="deleteTask('${task._id}')">Delete</button>
        </div>
    `;
}

// Render a dropdown select
function renderSelect(field, id, currentValue, options) {
    return `
        <select onchange="updateTaskField('${id}', '${field}', this.value)">
            ${options.map(option => `
                <option value="${option}" ${option === currentValue ? 'selected' : ''}>${capitalize(option)}</option>
            `).join('')}
        </select>
    `;
}

// Add a new task
async function addTask() {
    const title = document.getElementById('title').value.trim();
    const description = document.getElementById('description').value.trim();
    const status = document.getElementById('status').value;
    const urgency = document.getElementById('urgency').value;

    if (!title || !description) {
        alert('Title and description are required!');
        return;
    }

    try {
        await fetch(API_URL, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({ title, description, status, urgency })
        });
        clearForm();
        loadTasks();
    } catch (error) {
        console.error('Error adding task:', error);
    }
}

// Update a specific field of a task
async function updateTaskField(id, field, value) {
    try {
        await fetch(`${API_URL}/${id}`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify({ [field]: value })
        });
        loadTasks();
    } catch (error) {
        console.error(`Error updating task ${id}:`, error);
    }
}

// Delete a task
async function deleteTask(id) {
    if (!confirm('Are you sure you want to delete this task?')) return;

    try {
        await fetch(`${API_URL}/${id}`, { method: 'DELETE', headers: getAuthHeaders() });
        loadTasks();
    } catch (error) {
        console.error(`Error deleting task ${id}:`, error);
    }
}

// Clear the form inputs
function clearForm() {
    document.getElementById('title').value = '';
    document.getElementById('description').value = '';
}

// Capitalize the first letter of a string
function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

// Get authorization headers
function getAuthHeaders() {
    const token = localStorage.getItem('token');
    return token
        ? { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token }
        : { 'Content-Type': 'application/json' };
}

// Logout functionality
document.getElementById('logout-btn').onclick = function() {
    localStorage.removeItem('token');
    window.location.href = '../login/login.html';
};

// Initial load
loadTasks();