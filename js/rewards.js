// Rewards and achievements system
const ACHIEVEMENTS = {
    firstGame: {
        id: 'first_game',
        name: 'Getting Started',
        description: 'Complete your first activity',
        icon: '🌟',
        points: 10
    },
    fiveGames: {
        id: 'five_games',
        name: 'Explorer',
        description: 'Complete 5 activities',
        icon: '🎯',
        points: 25
    },
    tenGames: {
        id: 'ten_games',
        name: 'Adventurer',
        description: 'Complete 10 activities',
        icon: '🏆',
        points: 50
    },
    perfectScore: {
        id: 'perfect_score',
        name: 'Perfect!',
        description: 'Get 100% on any activity',
        icon: '⭐',
        points: 20
    },
    speedster: {
        id: 'speedster',
        name: 'Speed Master',
        description: 'Complete an activity in under 30 seconds',
        icon: '⚡',
        points: 30
    },
    allThemes: {
        id: 'all_themes',
        name: 'World Traveler',
        description: 'Play activities in all themes',
        icon: '🌍',
        points: 40
    },
    levelUp: {
        id: 'level_up',
        name: 'Level Up',
        description: 'Advance to hard difficulty',
        icon: '📈',
        points: 35
    }
};

// Activity tracking structure (COPPA compliant - no PII)
class ActivityTracker {
    constructor() {
        this.data = this.loadData();
    }
    
    loadData() {
        const saved = localStorage.getItem('activityProgress');
        if (saved) {
            return JSON.parse(saved);
        }
        return {
            totalActivitiesCompleted: 0,
            totalPoints: 0,
            achievements: [],
            activityStats: {}, // { activityType: { completions: 0, bestScore: 0, bestTime: 0, currentStreak: 0 } }
            themesPlayed: [],
            lastPlayedDate: null,
            sessionId: this.generateSessionId()
        };
    }
    
    saveData() {
        localStorage.setItem('activityProgress', JSON.stringify(this.data));
    }
    
    generateSessionId() {
        // Generate anonymous session ID (no PII)
        return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }
    
    recordActivity(activityType, score, timeSpent, theme) {
        // Initialize activity stats if needed
        if (!this.data.activityStats[activityType]) {
            this.data.activityStats[activityType] = {
                completions: 0,
                bestScore: 0,
                bestTime: Infinity,
                currentStreak: 0
            };
        }
        
        const stats = this.data.activityStats[activityType];
        stats.completions++;
        stats.bestScore = Math.max(stats.bestScore, score);
        stats.bestTime = Math.min(stats.bestTime, timeSpent);
        
        // Track theme
        if (!this.data.themesPlayed.includes(theme)) {
            this.data.themesPlayed.push(theme);
        }
        
        // Update totals
        this.data.totalActivitiesCompleted++;
        this.data.lastPlayedDate = new Date().toISOString();
        
        // Check for achievements
        const newAchievements = this.checkAchievements(activityType, score, timeSpent);
        
        this.saveData();
        
        return {
            newAchievements,
            totalPoints: this.data.totalPoints,
            totalCompleted: this.data.totalActivitiesCompleted
        };
    }
    
    checkAchievements(activityType, score, timeSpent) {
        const newAchievements = [];
        
        // First game
        if (this.data.totalActivitiesCompleted === 1 && !this.hasAchievement('first_game')) {
            newAchievements.push(this.unlockAchievement('first_game'));
        }
        
        // Five games
        if (this.data.totalActivitiesCompleted === 5 && !this.hasAchievement('five_games')) {
            newAchievements.push(this.unlockAchievement('five_games'));
        }
        
        // Ten games
        if (this.data.totalActivitiesCompleted === 10 && !this.hasAchievement('ten_games')) {
            newAchievements.push(this.unlockAchievement('ten_games'));
        }
        
        // Perfect score
        if (score === 100 && !this.hasAchievement('perfect_score')) {
            newAchievements.push(this.unlockAchievement('perfect_score'));
        }
        
        // Speed master
        if (timeSpent < 30 && !this.hasAchievement('speedster')) {
            newAchievements.push(this.unlockAchievement('speedster'));
        }
        
        // All themes
        if (this.data.themesPlayed.length >= 3 && !this.hasAchievement('all_themes')) {
            newAchievements.push(this.unlockAchievement('all_themes'));
        }
        
        return newAchievements;
    }
    
    hasAchievement(achievementId) {
        return this.data.achievements.some(a => a.id === achievementId);
    }
    
    unlockAchievement(achievementId) {
        const achievement = Object.values(ACHIEVEMENTS).find(a => a.id === achievementId);
        if (achievement) {
            this.data.achievements.push({
                ...achievement,
                unlockedAt: new Date().toISOString()
            });
            this.data.totalPoints += achievement.points;
            return achievement;
        }
        return null;
    }
    
    getProgress() {
        return {
            totalPoints: this.data.totalPoints,
            totalCompleted: this.data.totalActivitiesCompleted,
            achievements: this.data.achievements,
            level: this.calculateLevel(),
            nextLevelProgress: this.getNextLevelProgress()
        };
    }
    
    calculateLevel() {
        // Level = floor(totalPoints / 50) + 1
        return Math.floor(this.data.totalPoints / 50) + 1;
    }
    
    getNextLevelProgress() {
        const currentPoints = this.data.totalPoints;
        const currentLevel = this.calculateLevel();
        const pointsForCurrentLevel = (currentLevel - 1) * 50;
        const pointsForNextLevel = currentLevel * 50;
        const progress = currentPoints - pointsForCurrentLevel;
        const needed = pointsForNextLevel - pointsForCurrentLevel;
        return {
            current: progress,
            needed: needed,
            percentage: (progress / needed) * 100
        };
    }
    
    // COPPA-compliant data for Wix
    getWixData(activityType, score, timeSpent) {
        return {
            type: 'ACTIVITY_COMPLETE',
            data: {
                activityType: activityType,
                score: score,
                timeSpent: timeSpent,
                completedAt: new Date().toISOString(),
                sessionId: this.data.sessionId,
                totalActivities: this.data.totalActivitiesCompleted,
                // NO personal identifying information
                // NO email, name, age, location, etc.
            }
        };
    }
    
    reset() {
        this.data = {
            totalActivitiesCompleted: 0,
            totalPoints: 0,
            achievements: [],
            activityStats: {},
            themesPlayed: [],
            lastPlayedDate: null,
            sessionId: this.generateSessionId()
        };
        this.saveData();
    }
}

// Initialize global tracker
const activityTracker = new ActivityTracker();
