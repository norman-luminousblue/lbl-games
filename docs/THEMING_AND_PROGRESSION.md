# Theming and Progression System

## Overview
The activity center now features a comprehensive theming system, progressive difficulty, and a COPPA-compliant rewards system.

## Theme System

### Available Themes
1. **Jellyfish Ocean Adventure** (🪼)
   - Colors: Ocean blues (#00A8E8, #0077B6)
   - Characters: Jellyfish, Octopus, Squid, Crab, Fish
   - Words: Ocean-themed

2. **Monster Adventure** (👾)
   - Colors: Purples (#7209B7, #560BAD)
   - Characters: Monsters, Ghosts, Zombies, Bats, Dragons
   - Words: Spooky-themed

3. **Forest Adventure** (🦊)
   - Colors: Greens (#2A9D8F, #264653)
   - Characters: Fox, Raccoon, Bear, Owl, Squirrel, Deer
   - Words: Nature-themed

### Using Real Art Assets

Currently, the system uses emojis as placeholders. To add your real art:

1. Create an `images` folder structure:
```
/images
  /jellyfish
    main-character.png
    octopus.png
    squid.png
    crab.png
    fish1.png
    fish2.png
    ocean-background.png
    intro-screen.png
    completion-screen.png
  /monsters
    main-monster.png
    ghost.png
    ...
  /forest
    fox.png
    raccoon.png
    ...
```

2. Update `js/themes.js`:
```javascript
characters: {
    main: '/images/jellyfish/main-character.png',
    friend1: '/images/jellyfish/octopus.png',
    // etc.
}
backgrounds: {
    main: '/images/jellyfish/ocean-background.png',
    intro: '/images/jellyfish/intro-screen.png',
    completion: '/images/jellyfish/completion-screen.png'
}
```

3. The `loadImage()` function in `game-utils.js` will automatically fall back to emojis if images fail to load.

### Adding New Themes

Edit `js/themes.js` and add a new theme object:

```javascript
newtheme: {
    name: 'New Theme Name',
    colors: {
        primary: '#HEX',
        secondary: '#HEX',
        accent: '#HEX',
        background: 'linear-gradient(...)',
        cardBack: '#HEX',
        success: '#HEX'
    },
    emoji: '🎯',
    characters: {
        main: '🎯',
        friend1: '🎨',
        // etc.
    },
    backgrounds: {
        main: null,
        intro: null,
        completion: null
    },
    words: ['WORD1', 'WORD2', ...],
    sounds: {
        click: 800,
        success: 1000,
        complete: 1200
    }
}
```

Then update index.html to add the theme button.

## Progressive Difficulty

### How It Works

1. Players start at Level 1 (Easy) for each game type
2. Upon completing a game, difficulty can progress automatically
3. Each game type has 3 difficulty levels: Easy, Medium, Hard

### Difficulty Configurations

Defined in `js/themes.js` under `DIFFICULTY_LEVELS`:

- **Memory Match**: 6, 8, or 10 pairs
- **Maze**: 10x10, 12x12, or 15x15 grid with varying complexity
- **Connect Dots**: 15, 20, or 25 dots
- **Spot Difference**: 5, 7, or 10 differences
- **Word Search**: 10x10, 12x12, or 15x15 grid with 8, 10, or 12 words

### Implementing Difficulty in Games

When creating/updating a game, use:

```javascript
// At start of game
const difficultyLevel = getDifficultyLevel('maze');
const config = DIFFICULTY_LEVELS.maze[difficultyLevel - 1];

// Use config.size, config.pairs, etc. to adjust game
```

To progress difficulty after completion:

```javascript
progressDifficulty('maze'); // Moves to next level
```

## Rewards System

### Points and Levels

- Players earn points for completing activities
- Level = floor(totalPoints / 50) + 1
- Progress bar shows advancement to next level

### Achievements

Tracked in `js/rewards.js`:

1. **Getting Started** (🌟): Complete first activity - 10 points
2. **Explorer** (🎯): Complete 5 activities - 25 points
3. **Adventurer** (🏆): Complete 10 activities - 50 points
4. **Perfect!** (⭐): Get 100% score - 20 points
5. **Speed Master** (⚡): Complete in under 30 seconds - 30 points
6. **World Traveler** (🌍): Play all themes - 40 points
7. **Level Up** (📈): Reach hard difficulty - 35 points

### Adding New Achievements

Edit `ACHIEVEMENTS` in `js/rewards.js`:

```javascript
newAchievement: {
    id: 'achievement_id',
    name: 'Achievement Name',
    description: 'How to earn it',
    icon: '🎉',
    points: 25
}
```

Then add check logic in `ActivityTracker.checkAchievements()`.

## COPPA Compliance

### What Data is Collected

The system collects ONLY:
- Activity type completed
- Score achieved
- Time spent
- Timestamp
- Anonymous session ID
- Total activities count

### What is NOT Collected

- NO names
- NO email addresses
- NO age or birthdate
- NO location data
- NO IP addresses
- NO personal identifiers

### Data Storage

1. **Local Storage**: All user progress stored locally in browser
2. **Wix Integration**: Data sent via postMessage contains only activity stats

### Sending Data to Wix

When a game completes, call:

```javascript
const result = sendCompletionToWix(activityType, score, timeSpent, theme);

// This will:
// 1. Update local progress tracking
// 2. Check for new achievements
// 3. Send COPPA-compliant data to parent window
```

The data structure sent to Wix:

```javascript
{
    type: 'ACTIVITY_COMPLETE',
    data: {
        activityType: 'maze',
        score: 95,
        timeSpent: 45,
        completedAt: '2026-01-06T...',
        sessionId: 'session_...',
        totalActivities: 5
    }
}
```

### Parent Verification

Data should only be saved when parent consent is verified in Wix. The Wix page should:

1. Check if user has parent verification flag
2. Only save to collection if verified
3. Display achievement notifications

## Integration Checklist

### For Each Game

1. Include required scripts:
```html
<script src="js/themes.js"></script>
<script src="js/rewards.js"></script>
<script src="js/game-utils.js"></script>
```

2. Load current theme:
```javascript
const theme = getCurrentTheme();
applyTheme(theme);
```

3. Load difficulty level:
```javascript
const level = getDifficultyLevel('gameType');
const config = DIFFICULTY_LEVELS.gameType[level - 1];
```

4. Use theme assets:
```javascript
// For characters
drawCharacter(ctx, theme.characters.main, x, y, size);

// For backgrounds
drawBackground(ctx, canvas, theme.backgrounds.main, {
    start: theme.colors.primary,
    end: theme.colors.secondary
});
```

5. On game completion:
```javascript
const result = sendCompletionToWix(activityType, score, timeSpent, currentTheme.name);

// Show achievements
if (result.newAchievements.length > 0) {
    result.newAchievements.forEach(achievement => {
        showAchievement(achievement);
    });
}

// Optionally progress difficulty
progressDifficulty(activityType);
```

6. Add "Back to Menu" button:
```javascript
function backToMenu() {
    window.location.href = 'index.html';
}
```

## File Structure

```
/lbl-games
  /js
    themes.js          - Theme configurations and difficulty levels
    rewards.js         - Achievement system and activity tracking
    game-utils.js      - Utility functions for games
  /images              - Art assets organized by theme
    /jellyfish
    /monsters
    /forest
  index.html           - Main hub with theme selector and progress
  memory-match.html    - Individual game files
  ...
```

## Testing

1. **Theme Switching**: Click theme buttons on index.html
2. **Progress Tracking**: Complete activities and check progress bar
3. **Achievements**: Complete activities to unlock achievements
4. **Difficulty**: Complete same game type multiple times
5. **COPPA Compliance**: Check browser console for postMessage data

## Future Enhancements

- [ ] Add counting game with progressive difficulty
- [ ] Add pattern matching game
- [ ] Create theme selection in Wix interface
- [ ] Add parent dashboard to view child progress
- [ ] Export progress reports for parents
- [ ] Add more achievement types
- [ ] Seasonal themes (holidays, etc.)
