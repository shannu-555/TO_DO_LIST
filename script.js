// DOM Elements
const taskInput = document.getElementById('taskInput');
const addTaskBtn = document.getElementById('addTaskBtn');
const taskList = document.getElementById('taskList');
const tasksCounter = document.getElementById('tasksCounter');
const clearCompletedBtn = document.getElementById('clearCompleted');
const filterBtns = document.querySelectorAll('.filter-btn');
const themeBtns = document.querySelectorAll('.theme-btn');
const html = document.documentElement;

// State
let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
let currentFilter = 'all';
let currentTheme = localStorage.getItem('theme') || 'light';

// Initialize theme
html.setAttribute('data-theme', currentTheme);
themeBtns.forEach(btn => {
    if (btn.dataset.theme === currentTheme) {
        btn.classList.add('active');
    }
});

// Event Listeners
addTaskBtn.addEventListener('click', addTask);
taskInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') addTask();
});
clearCompletedBtn.addEventListener('click', clearCompleted);

// Theme switcher
themeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const theme = btn.dataset.theme;
        setTheme(theme);
    });
});

// Filter buttons
filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentFilter = btn.dataset.filter;
        renderTasks();
    });
});

// Functions
function setTheme(theme) {
    html.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    currentTheme = theme;
    
    themeBtns.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.theme === theme);
    });
}

function addTask() {
    const taskText = taskInput.value.trim();
    if (taskText) {
        const task = {
            id: Date.now(),
            text: taskText,
            completed: false,
            createdAt: new Date()
        };
        
        // Add animation class to the new task
        const taskElement = createTaskElement(task);
        taskElement.style.opacity = '0';
        taskElement.style.transform = 'translateY(-20px)';
        taskList.insertBefore(taskElement, taskList.firstChild);
        
        // Trigger animation
        requestAnimationFrame(() => {
            taskElement.style.transition = 'all 0.3s ease';
            taskElement.style.opacity = '1';
            taskElement.style.transform = 'translateY(0)';
        });
        
        tasks.unshift(task);
        saveTasks();
        updateTasksCounter();
        taskInput.value = '';
        taskInput.focus();
    }
}

function deleteTask(id) {
    const taskElement = document.querySelector(`[data-id="${id}"]`);
    if (!taskElement) return;
    
    taskElement.style.transition = 'all 0.3s ease';
    taskElement.style.opacity = '0';
    taskElement.style.transform = 'translateX(20px)';
    
    setTimeout(() => {
        tasks = tasks.filter(task => task.id !== id);
        saveTasks();
        renderTasks();
    }, 300);
}

function toggleTask(id) {
    const taskElement = document.querySelector(`[data-id="${id}"]`);
    if (!taskElement) return;
    
    tasks = tasks.map(task => {
        if (task.id === id) {
            const newState = !task.completed;
            // Add transition class
            taskElement.classList.add('transitioning');
            setTimeout(() => {
                taskElement.classList.remove('transitioning');
            }, 300);
            return { ...task, completed: newState };
        }
        return task;
    });
    
    saveTasks();
    renderTasks();
}

function clearCompleted() {
    const completedTasks = document.querySelectorAll('.task-item.completed');
    completedTasks.forEach(task => {
        task.style.transition = 'all 0.3s ease';
        task.style.opacity = '0';
        task.style.transform = 'translateX(20px)';
    });
    
    setTimeout(() => {
        tasks = tasks.filter(task => !task.completed);
        saveTasks();
        renderTasks();
    }, 300);
}

function saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
    updateTasksCounter();
}

function updateTasksCounter() {
    const activeTasks = tasks.filter(task => !task.completed).length;
    const totalTasks = tasks.length;
    tasksCounter.textContent = `${activeTasks} of ${totalTasks} task${totalTasks !== 1 ? 's' : ''} remaining`;
}

function createTaskElement(task) {
    const li = document.createElement('li');
    li.className = `task-item ${task.completed ? 'completed' : ''}`;
    li.dataset.id = task.id;

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.className = 'task-checkbox';
    checkbox.checked = task.completed;
    checkbox.addEventListener('change', () => toggleTask(task.id));

    const span = document.createElement('span');
    span.className = 'task-text';
    span.textContent = task.text;

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'delete-btn';
    deleteBtn.innerHTML = '<i class="fas fa-trash"></i>';
    deleteBtn.title = 'Delete task';
    deleteBtn.addEventListener('click', () => deleteTask(task.id));

    li.appendChild(checkbox);
    li.appendChild(span);
    li.appendChild(deleteBtn);

    return li;
}

function renderTasks() {
    taskList.innerHTML = '';
    
    const filteredTasks = tasks.filter(task => {
        if (currentFilter === 'active') return !task.completed;
        if (currentFilter === 'completed') return task.completed;
        return true;
    });

    if (filteredTasks.length === 0) {
        const emptyState = document.createElement('div');
        emptyState.className = 'empty-state';
        emptyState.innerHTML = `
            <i class="fas fa-clipboard-list"></i>
            <p>No ${currentFilter} tasks found</p>
        `;
        taskList.appendChild(emptyState);
        return;
    }

    filteredTasks.forEach(task => {
        taskList.appendChild(createTaskElement(task));
    });

    updateTasksCounter();
}

// Add some CSS for the empty state
const style = document.createElement('style');
style.textContent = `
    .empty-state {
        text-align: center;
        padding: 2rem;
        color: var(--completed-color);
    }
    .empty-state i {
        font-size: 3rem;
        margin-bottom: 1rem;
        opacity: 0.5;
    }
    .empty-state p {
        font-size: 1.1rem;
    }
    .task-item.transitioning {
        transition: all 0.3s ease;
    }
`;
document.head.appendChild(style);

// Initial render
renderTasks(); 