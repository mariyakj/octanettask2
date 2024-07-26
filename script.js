document.addEventListener('DOMContentLoaded', () => {
    const taskInput = document.getElementById('task-input');
    const prioritySelect = document.getElementById('priority-select');
    const deadlineInput = document.getElementById('deadline-input');
    const addTaskButton = document.getElementById('add-task-button');
    const taskList = document.getElementById('task-list');
    const completedTaskList = document.getElementById('completed-task-list');
    const filterButtons = document.querySelectorAll('.filter-button');
    const sortButton = document.querySelector('.sort-button[data-sort="deadline"]');
    const progressBar = document.getElementById('progress-bar');

    const CLOSE_TO_DEADLINE_DAYS = 2;

    addTaskButton.addEventListener('click', () => {
        const taskText = taskInput.value.trim();
        const taskPriority = prioritySelect.value;
        const taskDeadline = deadlineInput.value;
        if (taskText) {
            addTask(taskText, taskPriority, taskDeadline);
            taskInput.value = '';
            prioritySelect.value = 'medium';
            deadlineInput.value = '';
            updateProgress();
        }
    });

    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            filterTasks(button.dataset.filter);
        });
    });

    sortButton.addEventListener('click', () => {
        sortTasksByDeadline();
    });

    function addTask(text, priority, deadline) {
        const taskItem = document.createElement('li');
        taskItem.classList.add('task-item');
        taskItem.dataset.priority = priority;
        taskItem.dataset.deadline = deadline;

        const taskLabel = document.createElement('span');
        taskLabel.classList.add('task-label');
        taskLabel.textContent = text;

        const priorityLabel = document.createElement('span');
        priorityLabel.classList.add('task-priority', `priority-${priority}`);
        priorityLabel.textContent = priority.charAt(0).toUpperCase() + priority.slice(1);

        const deadlineLabel = document.createElement('span');
        deadlineLabel.classList.add('task-deadline');
        deadlineLabel.textContent = deadline ? `Due: ${deadline}` : 'No Deadline';

        const completeCheckbox = document.createElement('input');
        completeCheckbox.type = 'checkbox';
        completeCheckbox.classList.add('complete-checkbox');
        completeCheckbox.addEventListener('change', () => {
            if (completeCheckbox.checked) {
                moveToCompleted(taskItem);
            } else {
                moveToPending(taskItem);
            }
            updateProgress();
        });

        taskLabel.appendChild(priorityLabel);
        taskLabel.appendChild(deadlineLabel);

        const taskActions = document.createElement('div');
        taskActions.classList.add('task-actions');

        const deleteButton = document.createElement('button');
        deleteButton.classList.add('delete-task');
        deleteButton.textContent = 'Delete';
        deleteButton.addEventListener('click', () => {
            taskItem.remove();
            updateProgress();
        });

        taskActions.appendChild(completeCheckbox);
        taskActions.appendChild(deleteButton);

        taskItem.appendChild(taskLabel);
        taskItem.appendChild(taskActions);

        taskList.appendChild(taskItem);

        updateProgress();
    }

    function filterTasks(filter) {
        const tasks = taskList.children;
        for (let task of tasks) {
            if (filter === 'all' || task.dataset.priority === filter) {
                task.style.display = '';
            } else {
                task.style.display = 'none';
            }
        }
    }

    function sortTasksByDeadline() {
        const tasks = Array.from(taskList.children);
        tasks.sort((a, b) => {
            const deadlineA = a.dataset.deadline;
            const deadlineB = b.dataset.deadline;

            if (!deadlineA) return 1;
            if (!deadlineB) return -1;
            return new Date(deadlineA) - new Date(deadlineB);
        });

        tasks.forEach(task => taskList.appendChild(task));
    }

    function moveToCompleted(taskItem) {
        taskList.removeChild(taskItem);
        taskItem.classList.add('completed');
        completedTaskList.appendChild(taskItem);
    }

    function moveToPending(taskItem) {
        completedTaskList.removeChild(taskItem);
        taskItem.classList.remove('completed');
        taskList.appendChild(taskItem);
    }

    function updateProgress() {
        const tasks = Array.from(taskList.children);
        const totalTasks = tasks.length + completedTaskList.children.length;
        const completedTasks = completedTaskList.children.length;
        const progressPercentage = totalTasks === 0 ? 0 : (completedTasks / totalTasks) * 100;
        progressBar.style.width = `${progressPercentage}%`;

        const currentDate = new Date();

        tasks.forEach(task => {
            const deadline = task.dataset.deadline;
            const deadlineDate = deadline ? new Date(deadline) : null;
            const taskLabel = task.querySelector('.task-label');

            taskLabel.classList.remove('overdue', 'close-to-deadline');

            if (deadlineDate) {
                const timeDifference = deadlineDate - currentDate;
                const daysToDeadline = timeDifference / (1000 * 60 * 60 * 24);

                if (deadlineDate < currentDate) {
                    taskLabel.classList.add('overdue');
                } else if (daysToDeadline <= CLOSE_TO_DEADLINE_DAYS) {
                    taskLabel.classList.add('close-to-deadline');
                }
            }
        });
    }
});
