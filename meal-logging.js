// Meal Logging functionality
document.addEventListener('DOMContentLoaded', function() {
    // Set current time as default
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    document.getElementById('meal-time').value = `${hours}:${minutes}`;
    
    // Setup form submission
    document.getElementById('meal-form').addEventListener('submit', function(e) {
        e.preventDefault();
        saveMeal();
    });
    
    // Setup logout button
    document.getElementById('logout-btn').addEventListener('click', function() {
        clearUserData();
        window.location.href = 'index.html';
    });
    
    // Setup photo upload click handler
    document.querySelector('.border-dashed').addEventListener('click', function() {
        document.getElementById('meal-photo').click();
    });
    
    // Setup photo preview
    document.getElementById('meal-photo').addEventListener('change', function(e) {
        if (e.target.files.length > 0) {
            const file = e.target.files[0];
            if (file.size > 5 * 1024 * 1024) {
                showToast('File size must be less than 5MB', 'error');
                return;
            }
            
            const reader = new FileReader();
            reader.onload = function(event) {
                const preview = document.createElement('img');
                preview.src = event.target.result;
                preview.className = 'w-full h-48 object-cover rounded-lg';
                
                const uploadArea = document.querySelector('.border-dashed');
                uploadArea.innerHTML = '';
                uploadArea.appendChild(preview);
            };
            reader.readAsDataURL(file);
        }
    });
});

function saveMeal() {
    // Get form values
    const mealType = document.querySelector('input[name="meal-type"]:checked').value;
    const mealName = document.getElementById('meal-name').value;
    const mealTime = document.getElementById('meal-time').value;
    const calories = parseInt(document.getElementById('calories').value) || 0;
    const protein = parseInt(document.getElementById('protein').value) || 0;
    const notes = document.getElementById('notes').value;
    
    // Validate required fields
    if (!mealName) {
        showToast('Please enter a meal name', 'error');
        return;
    }
    
    // Calculate points
    const points = calculatePoints(mealType, calories, protein);
    
    // Create meal object
    const meal = {
        id: Date.now(),
        type: mealType,
        name: mealName,
        time: mealTime,
        date: new Date().toISOString().split('T')[0],
        calories: calories,
        protein: protein,
        points: points,
        notes: notes,
        healthyOptions: {
            vegetables: document.getElementById('vegetables').checked,
            wholeGrains: document.getElementById('whole-grains').checked,
            leanProtein: document.getElementById('lean-protein').checked
        },
        timestamp: new Date().toISOString()
    };
    
    // Handle photo if uploaded
    const photoInput = document.getElementById('meal-photo');
    if (photoInput.files.length > 0) {
        const reader = new FileReader();
        reader.onload = function(event) {
            meal.photo = event.target.result;
            saveMealToStorage(meal, points);
        };
        reader.readAsDataURL(photoInput.files[0]);
    } else {
        saveMealToStorage(meal, points);
    }
}

function saveMealToStorage(meal, points) {
    // Save to localStorage
    const meals = JSON.parse(localStorage.getItem('userMeals')) || [];
    meals.push(meal);
    localStorage.setItem('userMeals', JSON.stringify(meals));
    
    // Update user points
    updateUserPoints(points);
    
    // Show success message
    showToast('Meal logged successfully! +' + points + ' points', 'success');
    
    // Redirect to dashboard after short delay
    setTimeout(() => {
        window.location.href = 'dashboard.html';
    }, 1500);
}

function calculatePoints(mealType, calories, protein) {
    let points = 0;
    
    // Base points based on meal type
    switch(mealType) {
        case 'breakfast': points += 10; break;
        case 'lunch': points += 15; break;
        case 'dinner': points += 15; break;
        case 'snack': points += 5; break;
    }
    
    // Bonus for protein content
    if (protein >= 20) points += 5;
    if (protein >= 30) points += 5;
    
    // Bonus for reasonable calorie count
    if (calories > 0 && calories <= 500) points += 10;
    else if (calories > 500 && calories <= 800) points += 5;
    
    // Check healthy options
    const vegetables = document.getElementById('vegetables').checked;
    const wholeGrains = document.getElementById('whole-grains').checked;
    const leanProtein = document.getElementById('lean-protein').checked;
    
    if (vegetables) points += 5;
    if (wholeGrains) points += 5;
    if (leanProtein) points += 5;
    
    // Additional bonus for balanced meal
    if (vegetables && (wholeGrains || leanProtein)) points += 5;
    
    return points;
}

function updateUserPoints(newPoints) {
    const userData = JSON.parse(localStorage.getItem('healthyStreaksUser')) || {};
    
    // Initialize points if not set
    if (!userData.points) userData.points = 0;
    
    // Update points
    userData.points += newPoints;
    
    // Update streak if this is the first meal today
    updateStreak(userData);
    
    // Check for achievements
    checkPointsAchievement(userData.points);
    checkHealthyEatingAchievement();
    
    // Save updated data
    localStorage.setItem('healthyStreaksUser', JSON.stringify(userData));
}

function updateStreak(userData) {
    const today = new Date().toISOString().split('T')[0];
    const lastMealDate = userData.lastMealDate;
    
    if (!lastMealDate) {
        // First meal ever
        userData.streak = 1;
    } else if (lastMealDate === today) {
        // Already logged today - no streak update
        return;
    } else {
        // Check if consecutive day
        const lastDate = new Date(lastMealDate);
        const currentDate = new Date(today);
        const diffTime = currentDate - lastDate;
        const diffDays = diffTime / (1000 * 60 * 60 * 24);
        
        if (diffDays === 1) {
            // Consecutive day - increment streak
            userData.streak = (userData.streak || 0) + 1;
            checkStreakAchievement(userData.streak);
        } else if (diffDays > 1) {
            // Broken streak - reset to 1
            userData.streak = 1;
        }
    }
    
    userData.lastMealDate = today;
}

function checkPointsAchievement(totalPoints) {
    const achievements = JSON.parse(localStorage.getItem('userAchievements')) || [];
    
    // Check for existing achievement to avoid duplicates
    const hasBronze = achievements.some(a => a.id === 'points_bronze');
    const hasSilver = achievements.some(a => a.id === 'points_silver');
    const hasGold = achievements.some(a => a.id === 'points_gold');
    
    if (totalPoints >= 1000 && !hasGold) {
        achievements.push({
            id: 'points_gold',
            name: 'Gold Foodie',
            icon: 'medal',
            color: 'yellow-400',
            date: new Date().toISOString()
        });
        showToast('Achievement unlocked: Gold Foodie!', 'success');
    } else if (totalPoints >= 500 && !hasSilver) {
        achievements.push({
            id: 'points_silver',
            name: 'Silver Foodie',
            icon: 'medal',
            color: 'gray-400',
            date: new Date().toISOString()
        });
        showToast('Achievement unlocked: Silver Foodie!', 'success');
    } else if (totalPoints >= 100 && !hasBronze) {
        achievements.push({
            id: 'points_bronze',
            name: 'Bronze Foodie',
            icon: 'medal',
            color: 'amber-600',
            date: new Date().toISOString()
        });
        showToast('Achievement unlocked: Bronze Foodie!', 'success');
    }
    
    localStorage.setItem('userAchievements', JSON.stringify(achievements));
}

function checkStreakAchievement(streak) {
    const achievements = JSON.parse(localStorage.getItem('userAchievements')) || [];
    
    const has3Day = achievements.some(a => a.id === 'streak_3');
    const has7Day = achievements.some(a => a.id === 'streak_7');
    const has30Day = achievements.some(a => a.id === 'streak_30');
    
    if (streak >= 30 && !has30Day) {
        achievements.push({
            id: 'streak_30',
            name: '30-Day Streak',
            icon: 'fire',
            color: 'red-500',
            date: new Date().toISOString()
        });
        showToast('Achievement unlocked: 30-Day Streak!', 'success');
    } else if (streak >= 7 && !has7Day) {
        achievements.push({
            id: 'streak_7',
            name: '7-Day Streak',
            icon: 'fire',
            color: 'orange-500',
            date: new Date().toISOString()
        });
        showToast('Achievement unlocked: 7-Day Streak!', 'success');
    } else if (streak >= 3 && !has3Day) {
        achievements.push({
            id: 'streak_3',
            name: '3-Day Streak',
            icon: 'fire',
            color: 'yellow-500',
            date: new Date().toISOString()
        });
        showToast('Achievement unlocked: 3-Day Streak!', 'success');
    }
    
    localStorage.setItem('userAchievements', JSON.stringify(achievements));
}

function checkHealthyEatingAchievement() {
    const vegetables = document.getElementById('vegetables').checked;
    const wholeGrains = document.getElementById('whole-grains').checked;
    const leanProtein = document.getElementById('lean-protein').checked;
    
    if (vegetables && wholeGrains && leanProtein) {
        const achievements = JSON.parse(localStorage.getItem('userAchievements')) || [];
        const hasAchievement = achievements.some(a => a.id === 'balanced_meal');
        
        if (!hasAchievement) {
            achievements.push({
                id: 'balanced_meal',
                name: 'Balanced Meal',
                icon: 'heart',
                color: 'pink-500',
                date: new Date().toISOString()
            });
            showToast('Achievement unlocked: Balanced Meal!', 'success');
            localStorage.setItem('userAchievements', JSON.stringify(achievements));
        }
    }
}