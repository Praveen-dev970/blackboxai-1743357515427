// Rewards page functionality
document.addEventListener('DOMContentLoaded', function() {
    // Load user data and rewards
    loadRewardsData();
    
    // Setup event listeners
    setupRewardsEventListeners();
});

function loadRewardsData() {
    // Load user data from localStorage
    const userData = JSON.parse(localStorage.getItem('healthyStreaksUser')) || {};
    const achievements = JSON.parse(localStorage.getItem('userAchievements')) || [];
    
    // Update points balance
    document.getElementById('points-balance').textContent = userData.points || '0';
    
    // Load badges
    loadBadges(achievements);
    
    // Update badge count
    document.getElementById('badge-count').textContent = `${achievements.length}/12 collected`;
}

function loadBadges(achievements) {
    const badgesContainer = document.getElementById('badges-container');
    badgesContainer.innerHTML = '';
    
    // Define all possible badges
    const allBadges = [
        { id: 'first_meal', name: 'First Meal', icon: 'utensils', color: 'gray-400', description: 'Logged your first meal' },
        { id: 'streak_3', name: '3-Day Streak', icon: 'fire', color: 'yellow-500', description: 'Maintained a 3-day healthy eating streak' },
        { id: 'streak_7', name: '7-Day Streak', icon: 'fire', color: 'orange-500', description: 'Maintained a 7-day healthy eating streak' },
        { id: 'streak_30', name: '30-Day Streak', icon: 'fire', color: 'red-500', description: 'Maintained a 30-day healthy eating streak' },
        { id: 'points_bronze', name: 'Bronze Foodie', icon: 'medal', color: 'amber-600', description: 'Earned 100 points' },
        { id: 'points_silver', name: 'Silver Foodie', icon: 'medal', color: 'gray-400', description: 'Earned 500 points' },
        { id: 'points_gold', name: 'Gold Foodie', icon: 'medal', color: 'yellow-400', description: 'Earned 1000 points' },
        { id: 'veggie_lover', name: 'Veggie Lover', icon: 'carrot', color: 'green-400', description: 'Completed Veggie Lover challenge' },
        { id: 'hydration_hero', name: 'Hydration Hero', icon: 'tint', color: 'blue-400', description: 'Completed Hydration Hero challenge' },
        { id: 'whole_food_week', name: 'Whole Food Week', icon: 'leaf', color: 'green-500', description: 'Completed Whole Food Week challenge' },
        { id: 'balanced_meal', name: 'Balanced Meal', icon: 'heart', color: 'pink-500', description: 'Logged a perfectly balanced meal' },
        { id: 'early_bird', name: 'Early Bird', icon: 'sun', color: 'yellow-300', description: 'Logged breakfast 5 days in a row' }
    ];
    
    // Create badge elements
    allBadges.forEach(badge => {
        const hasBadge = achievements.some(a => a.id === badge.id);
        
        const badgeElement = document.createElement('div');
        badgeElement.className = 'text-center';
        badgeElement.innerHTML = `
            <div class="badge-card ${hasBadge ? `bg-${badge.color.replace('-', '')}-100` : 'bg-gray-100'} 
                rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-2 relative">
                <i class="fas fa-${badge.icon} text-3xl ${hasBadge ? `text-${badge.color}` : 'text-gray-400'}"></i>
                ${hasBadge ? '' : '<i class="fas fa-lock absolute text-gray-300 text-xl"></i>'}
            </div>
            <p class="text-sm font-medium ${hasBadge ? 'text-gray-800' : 'text-gray-500'}">${badge.name}</p>
        `;
        
        // Add tooltip for description
        badgeElement.title = badge.description;
        
        badgesContainer.appendChild(badgeElement);
    });
}

function setupRewardsEventListeners() {
    // Redeem buttons
    document.querySelectorAll('.bg-green-500').forEach(button => {
        button.addEventListener('click', function() {
            const rewardCard = this.closest('.bg-white');
            const rewardName = rewardCard.querySelector('h3').textContent;
            const rewardPoints = parseInt(rewardCard.querySelector('span').textContent);
            
            redeemReward(rewardName, rewardPoints);
        });
    });
    
    // Logout button
    document.getElementById('logout-btn').addEventListener('click', function() {
        clearUserData();
        window.location.href = 'index.html';
    });
}

function redeemReward(rewardName, pointsCost) {
    const userData = JSON.parse(localStorage.getItem('healthyStreaksUser')) || {};
    
    // Check if user has enough points
    if (!userData.points || userData.points < pointsCost) {
        showToast(`You need ${pointsCost} points to redeem this reward`, 'error');
        return;
    }
    
    // Deduct points
    userData.points -= pointsCost;
    localStorage.setItem('healthyStreaksUser', JSON.stringify(userData));
    
    // Show success message
    showToast(`Success! You've redeemed: ${rewardName}`, 'success');
    
    // Update points display
    document.getElementById('points-balance').textContent = userData.points;
    
    // In a real app, this would generate a coupon code or similar
    setTimeout(() => {
        showToast(`Your reward code: HS${Math.floor(1000 + Math.random() * 9000)}`, 'info');
    }, 1500);
}