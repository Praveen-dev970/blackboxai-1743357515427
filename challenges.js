// Challenges page functionality
document.addEventListener('DOMContentLoaded', function() {
    // Load user data and challenges
    loadChallengesData();
    
    // Setup event listeners
    setupChallengeEventListeners();
});

function loadChallengesData() {
    // Load user data from localStorage
    const userData = JSON.parse(localStorage.getItem('healthyStreaksUser')) || {};
    
    // Update leaderboard with user data
    updateLeaderboardUserData(userData);
    
    // Load active challenges
    loadActiveChallenges(userData);
}

function updateLeaderboardUserData(userData) {
    // Update the "You" row in the leaderboard
    const userRow = document.querySelector('tbody tr:last-child');
    if (userRow) {
        userRow.querySelector('td:nth-child(3) span').textContent = `${userData.points || 0} pts`;
        userRow.querySelector('td:nth-child(4)').textContent = `${userData.activeChallenges?.length || 0}/3`;
    }
}

function loadActiveChallenges(userData) {
    const challenges = [
        {
            id: 'veggie_lover',
            name: 'Veggie Lover',
            description: 'Eat 5 vegetable servings daily',
            reward: '50 pts + Badge',
            color: 'green',
            progress: 3,
            totalDays: 5,
            joined: userData.activeChallenges?.includes('veggie_lover') || false
        },
        {
            id: 'hydration_hero',
            name: 'Hydration Hero',
            description: 'Drink 2L water daily',
            reward: '75 pts + Badge',
            color: 'blue',
            progress: 4,
            totalDays: 7,
            joined: userData.activeChallenges?.includes('hydration_hero') || false
        },
        {
            id: 'whole_food_week',
            name: 'Whole Food Week',
            description: 'No processed foods',
            reward: '100 pts + Badge',
            color: 'purple',
            progress: 2,
            totalDays: 7,
            joined: userData.activeChallenges?.includes('whole_food_week') || false
        }
    ];

    // Update challenge cards
    challenges.forEach(challenge => {
        const card = document.querySelector(`.challenge-card.border-${challenge.color}-500`);
        if (card) {
            // Update join button based on participation
            const joinBtn = card.querySelector('button');
            if (challenge.joined) {
                joinBtn.textContent = 'Joined';
                joinBtn.className = 'bg-gray-300 text-gray-600 px-3 py-1 rounded-lg text-sm cursor-not-allowed';
                joinBtn.disabled = true;
            }
            
            // Update progress if user is participating
            if (challenge.joined && userData.challengeProgress?.[challenge.id]) {
                const progress = userData.challengeProgress[challenge.id];
                const progressText = card.querySelector('.flex.justify-between.text-sm.text-gray-600.mb-1 span:last-child');
                const progressBar = card.querySelector('.bg-gray-200 .rounded-full');
                
                if (progressText && progressBar) {
                    progressText.textContent = `${progress.daysCompleted}/${challenge.totalDays}`;
                    const percentage = (progress.daysCompleted / challenge.totalDays) * 100;
                    progressBar.style.width = `${percentage}%`;
                }
            }
        }
    });
}

function setupChallengeEventListeners() {
    // Join challenge buttons
    document.querySelectorAll('.challenge-card button:not([disabled])').forEach(button => {
        button.addEventListener('click', function() {
            const card = this.closest('.challenge-card');
            const challengeId = getChallengeIdFromCard(card);
            joinChallenge(challengeId);
        });
    });
    
    // Invite friends button
    document.querySelector('button.bg-green-500').addEventListener('click', function() {
        showToast('Invite link copied to clipboard!', 'info');
    });
    
    // Logout button
    document.getElementById('logout-btn').addEventListener('click', function() {
        clearUserData();
        window.location.href = 'index.html';
    });
}

function getChallengeIdFromCard(card) {
    // Extract challenge ID based on card content
    const title = card.querySelector('h3').textContent;
    return title.toLowerCase().replace(/\s+/g, '_');
}

function joinChallenge(challengeId) {
    const userData = JSON.parse(localStorage.getItem('healthyStreaksUser')) || {};
    
    // Initialize active challenges array if not exists
    if (!userData.activeChallenges) {
        userData.activeChallenges = [];
    }
    
    // Initialize challenge progress if not exists
    if (!userData.challengeProgress) {
        userData.challengeProgress = {};
    }
    
    // Add challenge if not already joined
    if (!userData.activeChallenges.includes(challengeId)) {
        userData.activeChallenges.push(challengeId);
        userData.challengeProgress[challengeId] = {
            daysCompleted: 0,
            startDate: new Date().toISOString()
        };
        
        localStorage.setItem('healthyStreaksUser', JSON.stringify(userData));
        showToast('Challenge joined successfully!', 'success');
        
        // Update UI
        loadActiveChallenges(userData);
        updateLeaderboardUserData(userData);
    }
}

// Function to check and update challenge progress (would be called from other pages)
function updateChallengeProgress(mealData) {
    const userData = JSON.parse(localStorage.getItem('healthyStreaksUser')) || {};
    if (!userData.activeChallenges || userData.activeChallenges.length === 0) return;
    
    const today = new Date().toISOString().split('T')[0];
    let updated = false;
    
    // Check each active challenge
    userData.activeChallenges.forEach(challengeId => {
        const progress = userData.challengeProgress[challengeId];
        
        // Skip if already completed today
        if (progress.lastCompleted === today) return;
        
        // Check challenge conditions
        let conditionMet = false;
        switch(challengeId) {
            case 'veggie_lover':
                // Check if meal contains vegetables
                conditionMet = mealData.healthyOptions?.vegetables;
                break;
            case 'hydration_hero':
                // This would be updated from water intake tracking
                break;
            case 'whole_food_week':
                // Check if meal meets whole food criteria
                conditionMet = mealData.healthyOptions?.vegetables && 
                              mealData.healthyOptions?.wholeGrains &&
                              !mealData.processed;
                break;
        }
        
        if (conditionMet) {
            progress.daysCompleted += 1;
            progress.lastCompleted = today;
            updated = true;
            
            // Check if challenge completed
            const challenge = getChallengeById(challengeId);
            if (challenge && progress.daysCompleted >= challenge.totalDays) {
                completeChallenge(userData, challengeId, challenge);
            }
        }
    });
    
    if (updated) {
        localStorage.setItem('healthyStreaksUser', JSON.stringify(userData));
    }
}

function getChallengeById(challengeId) {
    // This would come from a challenges database
    // For now, we'll use a simple mapping
    const challenges = {
        'veggie_lover': { totalDays: 5, reward: 50 },
        'hydration_hero': { totalDays: 7, reward: 75 },
        'whole_food_week': { totalDays: 7, reward: 100 }
    };
    return challenges[challengeId];
}

function completeChallenge(userData, challengeId, challenge) {
    // Add reward points
    userData.points = (userData.points || 0) + challenge.reward;
    
    // Add achievement
    const achievements = JSON.parse(localStorage.getItem('userAchievements')) || [];
    const achievementName = `${challengeId.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}`;
    
    achievements.push({
        id: challengeId,
        name: achievementName,
        icon: 'medal',
        color: 'yellow-400',
        date: new Date().toISOString()
    });
    
    localStorage.setItem('userAchievements', JSON.stringify(achievements));
    
    // Remove from active challenges
    userData.activeChallenges = userData.activeChallenges.filter(id => id !== challengeId);
    
    showToast(`Challenge completed! You earned ${challenge.reward} points.`, 'success');
}