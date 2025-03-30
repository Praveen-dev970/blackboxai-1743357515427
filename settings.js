// Settings page functionality
document.addEventListener('DOMContentLoaded', function() {
    // Load user settings
    loadUserSettings();
    
    // Setup event listeners
    setupSettingsEventListeners();
});

function loadUserSettings() {
    const userData = JSON.parse(localStorage.getItem('healthyStreaksUser')) || {};
    
    // Populate profile form
    if (userData.firstName) document.getElementById('first-name').value = userData.firstName;
    if (userData.lastName) document.getElementById('last-name').value = userData.lastName;
    if (userData.username) document.getElementById('username').value = userData.username;
    if (userData.email) document.getElementById('email').value = userData.email;
    
    // Populate preferences
    if (userData.preferences) {
        if (userData.preferences.darkMode) {
            document.getElementById('dark-mode-toggle').checked = userData.preferences.darkMode;
        }
        if (userData.preferences.notifications) {
            document.getElementById('notifications-toggle').checked = userData.preferences.notifications;
        }
        if (userData.preferences.weeklyReport) {
            document.getElementById('weekly-report-toggle').checked = userData.preferences.weeklyReport;
        }
    }
    
    // Populate goals
    if (userData.goals) {
        if (userData.goals.water) {
            document.getElementById('water-goal').value = userData.goals.water;
        }
        if (userData.goals.calories) {
            document.getElementById('calorie-goal').value = userData.goals.calories;
        }
        if (userData.goals.protein) {
            document.getElementById('protein-goal').value = userData.goals.protein;
        }
    }
}

function setupSettingsEventListeners() {
    // Profile form submission
    document.getElementById('profile-form').addEventListener('submit', function(e) {
        e.preventDefault();
        saveProfileSettings();
    });
    
    // Goals save button
    document.getElementById('save-goals').addEventListener('click', saveHealthGoals);
    
    // Toggle switches
    document.querySelectorAll('.toggle-checkbox').forEach(toggle => {
        toggle.addEventListener('change', function() {
            savePreferences();
        });
    });
    
    // Account actions
    document.getElementById('delete-account').addEventListener('click', confirmAccountDeletion);
    
    // Logout button
    document.getElementById('logout-btn').addEventListener('click', function() {
        clearUserData();
        window.location.href = 'index.html';
    });
}

function saveProfileSettings() {
    const userData = JSON.parse(localStorage.getItem('healthyStreaksUser')) || {};
    
    userData.firstName = document.getElementById('first-name').value;
    userData.lastName = document.getElementById('last-name').value;
    userData.username = document.getElementById('username').value;
    userData.email = document.getElementById('email').value;
    
    localStorage.setItem('healthyStreaksUser', JSON.stringify(userData));
    showToast('Profile updated successfully!', 'success');
}

function savePreferences() {
    const userData = JSON.parse(localStorage.getItem('healthyStreaksUser')) || {};
    
    if (!userData.preferences) {
        userData.preferences = {};
    }
    
    userData.preferences.darkMode = document.getElementById('dark-mode-toggle').checked;
    userData.preferences.notifications = document.getElementById('notifications-toggle').checked;
    userData.preferences.weeklyReport = document.getElementById('weekly-report-toggle').checked;
    
    localStorage.setItem('healthyStreaksUser', JSON.stringify(userData));
    showToast('Preferences saved!', 'success');
}

function saveHealthGoals() {
    const userData = JSON.parse(localStorage.getItem('healthyStreaksUser')) || {};
    
    if (!userData.goals) {
        userData.goals = {};
    }
    
    userData.goals.water = parseInt(document.getElementById('water-goal').value) || 2000;
    userData.goals.calories = parseInt(document.getElementById('calorie-goal').value) || 2000;
    userData.goals.protein = parseInt(document.getElementById('protein-goal').value) || 50;
    
    localStorage.setItem('healthyStreaksUser', JSON.stringify(userData));
    showToast('Health goals updated!', 'success');
}

function confirmAccountDeletion() {
    if (confirm('Are you sure you want to delete your account? All your data will be permanently removed.')) {
        // Clear all user data
        localStorage.removeItem('healthyStreaksUser');
        localStorage.removeItem('userMeals');
        localStorage.removeItem('userAchievements');
        
        // Redirect to index page
        window.location.href = 'index.html';
        showToast('Your account has been deleted', 'info');
    }
}