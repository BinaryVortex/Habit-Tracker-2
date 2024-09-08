document.addEventListener('DOMContentLoaded', function () {
    const habitInput = document.getElementById('habitInput');
    const addHabitBtn = document.getElementById('addHabitBtn');
    const habitList = document.getElementById('habitList');
    const totalHabitsSpan = document.getElementById('totalHabits');
    const completedHabitsSpan = document.getElementById('completedHabits');
    const completionRateSpan = document.getElementById('completionRate');
    const filterCompletedCheckbox = document.getElementById('filterCompleted');
    const clearCompletedBtn = document.getElementById('clearCompleted');
    const exportBtn = document.getElementById('exportBtn');
    const importInput = document.getElementById('importInput');

    let habits = JSON.parse(localStorage.getItem('habits')) || [];

    function saveToLocalStorage() {
        try {
            localStorage.setItem('habits', JSON.stringify(habits));
        } catch (error) {
            console.error('Error saving to localStorage:', error);
            alert('Failed to save habits. Please try again later.');
        }
    }

    function addHabit() {
        const habitName = habitInput.value.trim();
        if (habitName === '') return;  // Prevent empty habit from being added

        habits.push({
            id: Date.now(), 
            name: habitName, 
            completed: false, 
            datesCompleted: []
        });

        saveToLocalStorage();
        habitInput.value = '';  // Clear input field after adding a habit
        displayHabits();
        updateStatistics();

        // Scroll to the newly added habit if more than 1 habit
        if (habits.length > 1) {
            habitList.scrollTop = habitList.scrollHeight;
        }
    }

    function toggleCompletion(id) {
        const habit = habits.find(h => h.id === id);
        if (!habit) return;

        habit.completed = !habit.completed;
        const today = new Date().toLocaleDateString('en-US');
        if (habit.completed && !habit.datesCompleted.includes(today)) {
            habit.datesCompleted.push(today);
        }

        saveToLocalStorage();
        displayHabits();
        updateStatistics();
    }

    function deleteHabit(id) {
        const index = habits.findIndex(h => h.id === id);
        if (index === -1) return;

        if (confirm(`Are you sure you want to delete "${habits[index].name}"?`)) {
            habits.splice(index, 1);
            saveToLocalStorage();
            displayHabits();
            updateStatistics();
        }
    }

    function editHabit(id, newName) {
        const habit = habits.find(h => h.id === id);
        if (!habit || newName.trim() === '') return;

        habit.name = newName.trim();
        saveToLocalStorage();
        displayHabits();
    }

    function clearCompleted() {
        habits = habits.filter(habit => !habit.completed);
        saveToLocalStorage();
        displayHabits();
        updateStatistics();
    }

    function exportHabits() {
        const csvContent = 'data:text/csv;charset=utf-8,';
        const headers = ['ID', 'Name', 'Completed', 'Dates Completed'];
        const rows = habits.map(habit => [
            habit.id,
            habit.name,
            habit.completed ? 'Yes' : 'No',
            habit.datesCompleted.join(';')
        ]);
        const formattedRows = [headers, ...rows.map(row => row.join(','))].join('\n');
        const encodedUri = encodeURI(csvContent + formattedRows);
        const link = document.createElement('a');
        link.setAttribute('href', encodedUri);
        link.setAttribute('download', 'habits.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    function importHabits(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = function (e) {
            try {
                const importedHabits = JSON.parse(e.target.result);
                habits = importedHabits;
                saveToLocalStorage();
                displayHabits();
                updateStatistics();
                alert('Habits imported successfully!');
            } catch (error) {
                console.error('Error importing habits:', error);
                alert('Failed to import habits. Please ensure the file is valid.');
            }
        };
        reader.readAsText(file);
    }

    function displayHabits() {
        habitList.innerHTML = '';

        const showCompleted = filterCompletedCheckbox.checked;

        habits.forEach(habit => {
            if (!showCompleted && habit.completed) return;

            const li = document.createElement('li');
            li.classList.add('habit-item');
            li.innerHTML = `
                <input type="checkbox" class="habit-checkbox" id="habit${habit.id}" ${habit.completed ? 'checked' : ''}>
                <label for="habit${habit.id}" class="habit-name ${habit.completed ? 'completed' : ''}">
                    ${habit.name}
                    ${habit.completed && habit.datesCompleted.length > 0 ? `<span class="last-completed">Last completed: ${formatDate(habit.datesCompleted[habit.datesCompleted.length - 1])}</span>` : ''}
                </label>
                <div class="habit-actions">
                    <button class="edit-btn">Edit</button>
                    <button class="delete-btn">Delete</button>
                </div>
            `;

            const checkbox = li.querySelector('.habit-checkbox');
            checkbox.addEventListener('change', () => toggleCompletion(habit.id));

            const editBtn = li.querySelector('.edit-btn');
            editBtn.addEventListener('click', () => {
                const newName = prompt('Enter a new name for this habit:', habit.name);
                editHabit(habit.id, newName);
            });

            const deleteBtn = li.querySelector('.delete-btn');
            deleteBtn.addEventListener('click', () => deleteHabit(habit.id));

            habitList.appendChild(li);
        });

        updateStatistics();
    }

    function updateStatistics() {
        const totalHabits = habits.length;
        const completedHabits = habits.filter(habit => habit.completed).length;
        const completionRate = totalHabits > 0 ? ((completedHabits / totalHabits) * 100).toFixed(2) : 0;

        totalHabitsSpan.textContent = totalHabits;
        completedHabitsSpan.textContent = completedHabits;
        completionRateSpan.textContent = `${completionRate}%`;
    }

    function formatDate(dateString) {
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return new Date(dateString).toLocaleDateString('en-US', options);
    }

    addHabitBtn.addEventListener('click', addHabit);
    habitInput.addEventListener('keydown', function (event) {
        if (event.key === 'Enter') {
            addHabit();
        }
    });

    filterCompletedCheckbox.addEventListener('change', displayHabits);
    clearCompletedBtn.addEventListener('click', clearCompleted);
    exportBtn.addEventListener('click', exportHabits);
    importInput.addEventListener('change', importHabits);

    displayHabits();
});
