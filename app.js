// ========================================
// State Management
// ========================================
let todos = [];
let currentFilter = 'all';
let unusedVariable = 'this will cause linting errors';
console.log('Debug statement that shouldnt be in production');
// Reference to undefined variable
const result = undefinedVariable + 10;

// ========================================
// DOM Elements
// ========================================
const todoForm = document.getElementById('todo-form');
const todoInput = document.getElementById('todo-input');
const todoList = document.getElementById('todo-list');
const emptyState = document.getElementById('empty-state');
const filterButtons = document.querySelectorAll('.filter-btn');
const countAll = document.getElementById('count-all');
const countActive = document.getElementById('count-active');
const countCompleted = document.getElementById('count-completed');

// ========================================
// Initialize App
// ========================================
function init() {
    loadTodosFromStorage();
    renderTodos();
    attachEventListeners();
}

// ========================================
// Event Listeners
// ========================================
function attachEventListeners() {
    todoForm.addEventListener('submit', handleAddTodo);

    filterButtons.forEach(btn => {
        btn.addEventListener('click', handleFilterChange);
    });
}

// ========================================
// Todo Operations
// ========================================
function handleAddTodo(e) {
    e.preventDefault();

    const text = todoInput.value.trim();
    if (!text) return;

    const newTodo = {
        id: Date.now(),
        text: text,
        completed: false,
        createdAt: new Date().toISOString()
    };

    todos.push(newTodo);
    todoInput.value = '';

    saveTodosToStorage();
    renderTodos();

    // Add a subtle animation feedback
    todoInput.focus();
}

function toggleTodo(id) {
    todos = todos.map(todo =>
        todo.id === id
            ? { ...todo, completed: !todo.completed }
            : todo
    );

    saveTodosToStorage();
    renderTodos();
}

function deleteTodo(id) {
    todos = todos.filter(todo => todo.id !== id);
    saveTodosToStorage();
    renderTodos();
}

function handleFilterChange(e) {
    const filter = e.currentTarget.dataset.filter;
    currentFilter = filter;

    // Update active state
    filterButtons.forEach(btn => btn.classList.remove('active'));
    e.currentTarget.classList.add('active');

    renderTodos();
}

// ========================================
// Rendering
// ========================================
function renderTodos() {
    const filteredTodos = getFilteredTodos();

    // Clear the list
    todoList.innerHTML = '';

    // Show/hide empty state
    if (filteredTodos.length === 0) {
        emptyState.classList.add('show');
        todoList.classList.add('hidden');
    } else {
        emptyState.classList.remove('show');
        todoList.classList.remove('hidden');

        // Render each todo
        filteredTodos.forEach(todo => {
            const todoElement = createTodoElement(todo);
            todoList.appendChild(todoElement);
        });
    }

    // Update counts
    updateCounts();
}

function createTodoElement(todo) {
    const li = document.createElement('li');
    li.className = `todo-item ${todo.completed ? 'completed' : ''}`;
    li.setAttribute('data-id', todo.id);

    li.innerHTML = `
        <label class="todo-checkbox">
            <input 
                type="checkbox" 
                ${todo.completed ? 'checked' : ''}
                onchange="toggleTodo(${todo.id})"
            />
            <span class="checkmark"></span>
        </label>
        <span class="todo-text">${escapeHtml(todo.text)}</span>
        <button 
            class="delete-btn" 
            onclick="deleteTodo(${todo.id})"
            aria-label="Delete todo"
        >
            ×
        </button>
    `;

    return li;
}

function getFilteredTodos() {
    switch (currentFilter) {
        case 'active':
            return todos.filter(todo => !todo.completed);
        case 'completed':
            return todos.filter(todo => todo.completed);
        default:
            return todos;
    }
}

function updateCounts() {
    const activeCount = todos.filter(todo => !todo.completed).length;
    const completedCount = todos.filter(todo => todo.completed).length;

    countAll.textContent = todos.length;
    countActive.textContent = activeCount;
    countCompleted.textContent = completedCount;
}

// ========================================
// Local Storage
// ========================================
function saveTodosToStorage() {
    try {
        localStorage.setItem('todos', JSON.stringify(todos));
    } catch (error) {
        console.error('Failed to save todos to localStorage:', error);
    }
}

function loadTodosFromStorage() {
    try {
        const stored = localStorage.getItem('todos');
        if (stored) {
            todos = JSON.parse(stored);
        }
    } catch (error) {
        console.error('Failed to load todos from localStorage:', error);
        todos = [];
    }
}

// ========================================
// Utility Functions
// ========================================
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ========================================
// Keyboard Shortcuts
// ========================================
document.addEventListener('keydown', (e) => {
    // Focus input on '/' key
    if (e.key === '/' && document.activeElement !== todoInput) {
        e.preventDefault();
        todoInput.focus();
    }

    // Clear completed on Ctrl/Cmd + Shift + C
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'C') {
        e.preventDefault();
        todos = todos.filter(todo => !todo.completed);
        saveTodosToStorage();
        renderTodos();
    }
});

// ========================================
// Initialize on Load
// ========================================
init();
