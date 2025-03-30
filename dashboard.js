// Dashboard-specific functionality
document.addEventListener('DOMContentLoaded', function() {
    // Load user data
    loadDashboardData();
    
    // Set up event listeners
    setupEventListeners();
});

function loadDashboardData() {
    // Load user data from localStorage
    const userData = JSON.parse(localStorage.getItem('healthyStreaksUser')) || {};
    
    // Update UI with user data
    if (userData.username) {
        document.getElementById('username').textContent = userData.username;
    }
    
    if (userData.streak) {
        document.getElementById('streak-count').textContent = userData.streak;
    }
    
    if (userData.points) {
        document.getElementById('points-count').textContent = userData.points;
    }
    
    if (userData.waterGoal) {
        document.getElementById('water-goal').textContent = userData.waterGoal;
    }
    
    if (userData.waterIntake) {
        document.getElementById('water-count').textContent = `${userData.waterIntake}/${userData.waterGoal}ml`;
    }
    
    // Load today's meals
    loadTodaysMeals();
    
    // Load recent achievements
    loadRecentAchievements();
}

function loadTodaysMeals() {
    const meals = JSON.parse(localStorage.getItem('userMeals')) || [];
    const today = new Date().toISOString().split('T')[0];
    const todaysMeals = meals.filter(meal => meal.date === today);
    
    const mealsList = document.getElementById('meals-list');
    const noMealsMessage = document.getElementById('no-meals-message');
    
    if (todaysMeals.length > 0) {
        noMealsMessage.classList.add('hidden');
        
        todaysMeals.forEach(meal => {
            const mealItem = document.createElement('div');
            mealItem.className = 'flex items-center justify-between p-4 bg-gray-50 rounded-lg';
            mealItem.innerHTML = `
                <div class="flex items-center space-x-4">
                    <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                        <i class="fas fa-${getMealIcon(meal.type)} text-green-500"></i>
                    </div>
                    <div>
                        <h4 class="font-medium text-gray-800">${meal.name}</h4>
                        <p class="text-sm text-gray-500">${meal.time}</p>
                    </div>
                </div>
                <div class="text-right">
                    <p class="font-medium text-green-500">+${meal.points} pts</p>
                    <p class="text-xs text-gray-500">${meal.calories} cal</p>
                </div>
            `;
            mealsList.appendChild(mealItem);
        });
    } else {
        noMealsMessage.classList.remove('hidden');
    }
}

function getMealIcon(mealType) {
    switch(mealType) {
        case 'breakfast': return 'sun';
        case 'lunch': return 'hamburger';
        case 'dinner': return 'moon';
        default: return 'utensils';
    }
}

function loadRecentAchievements() {
    const achievements = JSON.parse(localStorage.getItem('userAchievements')) || [];
    const achievementsList = document.getElementById('achievements-list');
    
    // Clear existing achievements
    achievementsList.innerHTML = '';
    
    // Add recent achievements (last 4)
    const recentAchievements = achievements.slice(-4).reverse();
    
    if (recentAchievements.length > 0) {
        recentAchievements.forEach(achievement => {
            const achievementItem = document.createElement('div');
            achievementItem.className = 'text-center';
            achievementItem.innerHTML = `
                <div class="bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-2">
                    <i class="fas fa-${achievement.icon} text-2xl text-${achievement.color}"></i>
                </div>
                <p class="text-sm font-medium">${achievement.name}</p>
            `;
            achievementsList.appendChild(achievementItem);
        });
    } else {
        // Show placeholder if no achievements
        achievementsList.innerHTML = `
            <div class="col-span-4 text-center py-4 text-gray-400">
                <i class="fas fa-medal text-4xl mb-2"></i>
                <p>No achievements yet</p>
                <p class="text-xs mt-1">Complete challenges to earn achievements</p>
            </div>
        `;
    }
}

function setupEventListeners() {
    // Water intake buttons
    document.querySelectorAll('[data-ml]').forEach(button => {
        button.addEventListener('click', function() {
            const ml = parseInt(this.getAttribute('data-ml'));
            updateWaterIntake(ml);
        });
    });
    
    // Logout button
    document.getElementById('logout-btn').addEventListener('click', function() {
        clearUserData();
        window.location.href = 'index.html';
    });
}

function updateWaterIntake(ml) {
    const userData = JSON.parse(localStorage.getItem('healthyStreaksUser')) || {};
    
    // Initialize water intake if not set
    if (!userData.waterIntake) userData.waterIntake = 0;
    if (!userData.waterGoal) userData.waterGoal = 2000;
    
    // Update water intake
    userData.waterIntake += ml;
    
    // Check for overflow
    if (userData.waterIntake > userData.waterGoal) {
        userData.waterIntake = userData.waterGoal;
    }
    
    // Save updated data
    localStorage.setItem('healthyStreaksUser', JSON.stringify(userData));
    
    // Update UI
    document.getElementById('water-count').textContent = `${userData.waterIntake}/${userData.waterGoal}ml`;
    
    // Check for achievement
    checkWaterAchievement(userData.waterIntake, userData.waterGoal);
}

function checkWaterAchievement(currentIntake, goal) {
    const percentage = (currentIntake / goal) * 100;
    const achievements = JSON.parse(localStorage.getItem('userAchievements')) || [];
    
    // Check for existing achievement to avoid duplicates
    const hasAchievement = achievements.some(a => a.id === 'water_goal');
    
    if (percentage >= 100 && !hasAchievement) {
        // Add new achievement
        achievements.push({
            id: 'water_goal',
            name: 'Hydration Hero',
            icon: 'tint',
            color: 'blue-400',
            date: new Date().toISOString()
        });
        
        localStorage.setItem('userAchievements', JSON.stringify(achievements));
        showToast('Achievement unlocked: Hydration Hero!', 'success');
        loadRecentAchievements();
    }
}