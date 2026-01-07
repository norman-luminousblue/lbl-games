// Theme configurations for all games
const THEMES = {
    jellyfish: {
        name: 'Jellyfish Ocean Adventure',
        colors: {
            primary: '#00A8E8',
            secondary: '#0077B6',
            accent: '#06FFA5',
            background: 'linear-gradient(135deg, #00A8E8 0%, #0077B6 100%)',
            cardBack: '#457B9D',
            success: '#06FFA5'
        },
        emoji: '🪼',
        characters: {
            main: '🪼',  // Replace with image path: '/images/jellyfish/main-character.png'
            friend1: '🐙',  // '/images/jellyfish/octopus.png'
            friend2: '🦑',  // '/images/jellyfish/squid.png'
            friend3: '🦀',  // '/images/jellyfish/crab.png'
            friend4: '🐠',  // '/images/jellyfish/fish1.png'
            friend5: '🐡'   // '/images/jellyfish/fish2.png'
        },
        backgrounds: {
            main: null,  // '/images/jellyfish/ocean-background.png'
            intro: null,
            completion: null
        },
        words: ['JELLYFISH', 'OCEAN', 'CORAL', 'WAVE', 'SHELL', 'FISH', 'CRAB', 'STAR'],
        sounds: {
            click: 800,
            success: 1000,
            complete: 1200
        }
    },
    
    monsters: {
        name: 'Monster Adventure',
        colors: {
            primary: '#7209B7',
            secondary: '#560BAD',
            accent: '#F72585',
            background: 'linear-gradient(135deg, #7209B7 0%, #560BAD 100%)',
            cardBack: '#3C096C',
            success: '#F72585'
        },
        emoji: '👾',
        characters: {
            main: '👾',  // '/images/monsters/main-monster.png'
            friend1: '👻',
            friend2: '🧟',
            friend3: '🦇',
            friend4: '🕷️',
            friend5: '🐉'
        },
        backgrounds: {
            main: null,
            intro: null,
            completion: null
        },
        words: ['MONSTER', 'SCARY', 'SPOOKY', 'NIGHT', 'BEAST', 'GROWL', 'ROAR', 'TEETH'],
        sounds: {
            click: 600,
            success: 900,
            complete: 1100
        }
    },
    
    forest: {
        name: 'Forest Adventure',
        colors: {
            primary: '#2A9D8F',
            secondary: '#264653',
            accent: '#E9C46A',
            background: 'linear-gradient(135deg, #2A9D8F 0%, #264653 100%)',
            cardBack: '#1D3557',
            success: '#E9C46A'
        },
        emoji: '🦊',
        characters: {
            main: '🦊',  // '/images/forest/fox.png'
            friend1: '🦝',
            friend2: '🐻',
            friend3: '🦉',
            friend4: '🐿️',
            friend5: '🦌'
        },
        backgrounds: {
            main: null,
            intro: null,
            completion: null
        },
        words: ['FOREST', 'TREE', 'LEAF', 'BRANCH', 'BIRD', 'NEST', 'PATH', 'DEER'],
        sounds: {
            click: 700,
            success: 950,
            complete: 1150
        }
    }
};

// Difficulty levels
const DIFFICULTY_LEVELS = {
    memory: [
        { level: 1, pairs: 6, timeBonus: 0, name: 'Easy' },
        { level: 2, pairs: 8, timeBonus: 10, name: 'Medium' },
        { level: 3, pairs: 10, timeBonus: 20, name: 'Hard' }
    ],
    coloring: [
        { level: 1, shapes: 8, name: 'Easy' },
        { level: 2, shapes: 13, name: 'Medium' },
        { level: 3, shapes: 20, name: 'Hard' }
    ],
    maze: [
        { level: 1, complexity: 'simple', size: 10, name: 'Easy' },
        { level: 2, complexity: 'medium', size: 12, name: 'Medium' },
        { level: 3, complexity: 'hard', size: 15, name: 'Hard' }
    ],
    dots: [
        { level: 1, dots: 15, name: 'Easy' },
        { level: 2, dots: 20, name: 'Medium' },
        { level: 3, dots: 25, name: 'Hard' }
    ],
    difference: [
        { level: 1, differences: 5, name: 'Easy' },
        { level: 2, differences: 7, name: 'Medium' },
        { level: 3, differences: 10, name: 'Hard' }
    ],
    wordSearch: [
        { level: 1, gridSize: 10, words: 8, name: 'Easy' },
        { level: 2, gridSize: 12, words: 10, name: 'Medium' },
        { level: 3, gridSize: 15, words: 12, name: 'Hard' }
    ]
};

// Get current theme from localStorage or default to jellyfish
function getCurrentTheme() {
    const themeName = localStorage.getItem('currentTheme') || 'jellyfish';
    return THEMES[themeName];
}

// Set current theme
function setCurrentTheme(themeName) {
    if (THEMES[themeName]) {
        localStorage.setItem('currentTheme', themeName);
        return true;
    }
    return false;
}

// Get difficulty level for a game
function getDifficultyLevel(gameType) {
    const key = `difficulty_${gameType}`;
    const level = parseInt(localStorage.getItem(key)) || 1;
    return level;
}

// Update difficulty level
function updateDifficultyLevel(gameType, level) {
    const key = `difficulty_${gameType}`;
    localStorage.setItem(key, level);
}

// Progress to next difficulty level
function progressDifficulty(gameType) {
    const currentLevel = getDifficultyLevel(gameType);
    const difficulties = DIFFICULTY_LEVELS[gameType];
    if (difficulties && currentLevel < difficulties.length) {
        updateDifficultyLevel(gameType, currentLevel + 1);
        return currentLevel + 1;
    }
    return currentLevel;
}
