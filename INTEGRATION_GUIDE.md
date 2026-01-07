# Guide: Updating Games to Use the New System

## Example: Memory Match Game Integration

Here's how to update an existing game to use themes, difficulty progression, and rewards:

### 1. Add Script References

At the top of your HTML file, before your game scripts:

```html
<script src="js/themes.js"></script>
<script src="js/rewards.js"></script>
<script src="js/game-utils.js"></script>
```

### 2. Initialize Theme and Difficulty

At the start of your game initialization:

```javascript
// Load current theme from storage
const currentTheme = getCurrentTheme();
const themeName = localStorage.getItem('currentTheme') || 'jellyfish';

// Apply theme colors to the page
applyTheme(currentTheme);

// Get current difficulty level for this game type
const difficultyLevel = getDifficultyLevel('matching'); // or 'maze', 'dots', etc.
const difficultyConfig = DIFFICULTY_LEVELS.memory[difficultyLevel - 1];

// Use difficultyConfig to set game parameters
const numberOfPairs = difficultyConfig.pairs; // 6, 8, or 10
```

### 3. Use Theme Characters Instead of Hardcoded Emojis

**Before:**
```javascript
const symbols = ['🪼', '🐙', '🦑', '🦀', '🐠', '🐡'];
```

**After:**
```javascript
const characters = Object.values(currentTheme.characters);
const symbols = characters.slice(0, numberOfPairs);
```

This automatically uses jellyfish for jellyfish theme, monsters for monster theme, etc.

### 4. Use Theme Colors

**Before:**
```javascript
ctx.fillStyle = '#00A8E8';
```

**After:**
```javascript
ctx.fillStyle = currentTheme.colors.primary;
```

Available theme colors:
- `currentTheme.colors.primary` - Main color
- `currentTheme.colors.secondary` - Secondary color
- `currentTheme.colors.accent` - Accent/highlight color
- `currentTheme.colors.success` - Success state color
- `currentTheme.colors.cardBack` - Card back color

### 5. Use Theme Audio

**Before:**
```javascript
playSound(800); // hardcoded frequency
```

**After:**
```javascript
const audioSystem = new AudioSystem(currentTheme);
audioSystem.playSound('click');
audioSystem.playSound('success');
audioSystem.playSound('complete');
```

### 6. Load Background Images

**Before:**
```javascript
// Draw gradient background
const gradient = ctx.createLinearGradient(0, 0, width, height);
gradient.addColorStop(0, '#00A8E8');
gradient.addColorStop(1, '#0077B6');
ctx.fillStyle = gradient;
ctx.fillRect(0, 0, width, height);
```

**After:**
```javascript
// Load and draw theme background (or fallback to gradient)
const backgroundImage = await loadImage(currentTheme.backgrounds.main, null);
drawBackground(ctx, canvas, backgroundImage, {
    start: currentTheme.colors.primary,
    end: currentTheme.colors.secondary
});
```

### 7. Draw Characters

**Before:**
```javascript
ctx.font = '48px Arial';
ctx.fillText('🪼', x, y);
```

**After:**
```javascript
// This handles both images and emojis
const character = await loadImage(currentTheme.characters.main, currentTheme.emoji);
drawCharacter(ctx, character, x, y, 48);
```

### 8. Send Completion Data

**Before:**
```javascript
// At game completion
window.parent.postMessage({
    type: 'GAME_COMPLETE',
    activityType: 'matching',
    score: score,
    timeSpent: timeSpent
}, '*');
```

**After:**
```javascript
// At game completion
const activityType = sessionStorage.getItem('currentActivityType') || 'matching';
const score = calculateScore(); // your scoring logic
const timeSpent = Math.floor((Date.now() - startTime) / 1000);

// This handles everything: local tracking, achievements, and Wix message
const result = sendCompletionToWix(activityType, score, timeSpent, themeName);

// Show any new achievements earned
if (result.newAchievements && result.newAchievements.length > 0) {
    result.newAchievements.forEach(achievement => {
        showAchievement(achievement);
    });
}

// Progress difficulty for next time
progressDifficulty('matching');
```

### 9. Display Progress After Completion

Add to your completion screen:

```javascript
function showCompletionScreen() {
    const progress = activityTracker.getProgress();
    
    completionHTML = `
        <h1>Great Job!</h1>
        <p>Score: ${score}</p>
        <p>Time: ${timeSpent} seconds</p>
        
        <!-- Show overall progress -->
        <div class="progress-info">
            <h2>Level ${progress.level}</h2>
            <p>${progress.totalPoints} points</p>
            <div class="progress-bar">
                <div class="fill" style="width: ${progress.nextLevelProgress.percentage}%"></div>
            </div>
        </div>
        
        <button onclick="backToMenu()">Back to Activities</button>
        <button onclick="playAgain()">Play Again</button>
    `;
    
    document.getElementById('completion-screen').innerHTML = completionHTML;
}

function backToMenu() {
    window.location.href = 'index.html';
}

function playAgain() {
    window.location.reload();
}
```

### 10. Update Intro Screen

Make intro screen dynamic based on theme:

```javascript
function showIntroScreen() {
    const introDiv = document.getElementById('intro-screen');
    introDiv.innerHTML = `
        <div class="emoji">${currentTheme.emoji}</div>
        <h1>${currentTheme.name}</h1>
        <p>Match all the pairs to win!</p>
        <p><strong>Level ${difficultyLevel}:</strong> ${difficultyConfig.name}</p>
        <p>Find ${difficultyConfig.pairs} pairs!</p>
        <button onclick="startGame()">Start Game</button>
        <button onclick="backToMenu()">Back</button>
    `;
}
```

## Complete Example Flow

```javascript
// 1. Load theme and difficulty at page load
const currentTheme = getCurrentTheme();
const themeName = localStorage.getItem('currentTheme') || 'jellyfish';
const activityType = sessionStorage.getItem('currentActivityType') || 'matching';
const difficultyLevel = getDifficultyLevel(activityType);
const difficultyConfig = DIFFICULTY_LEVELS.memory[difficultyLevel - 1];

// 2. Apply theme
applyTheme(currentTheme);

// 3. Initialize audio with theme
const audioSystem = new AudioSystem(currentTheme);

// 4. Load assets
async function loadGameAssets() {
    const characters = [];
    for (let key in currentTheme.characters) {
        const char = await loadImage(
            currentTheme.characters[key],
            currentTheme.characters[key] // fallback to emoji
        );
        characters.push(char);
    }
    return characters;
}

// 5. Create game with themed assets
async function initGame() {
    const characters = await loadGameAssets();
    const gameCharacters = characters.slice(0, difficultyConfig.pairs);
    
    // Your game initialization with themed characters
    createCards(gameCharacters);
}

// 6. Game loop with themed colors
function draw() {
    // Use currentTheme.colors throughout
    ctx.fillStyle = currentTheme.colors.primary;
    // ... your drawing code
}

// 7. Handle completion
function onGameComplete(score, timeSpent) {
    // Send data and get achievement results
    const result = sendCompletionToWix(activityType, score, timeSpent, themeName);
    
    // Show achievements
    if (result.newAchievements) {
        result.newAchievements.forEach(achievement => {
            showAchievement(achievement);
        });
    }
    
    // Progress difficulty
    progressDifficulty(activityType);
    
    // Show completion screen
    showCompletionScreen(score, timeSpent, result);
}
```

## Testing Checklist

- [ ] Game loads with jellyfish theme
- [ ] Switch to monsters theme, game uses monster characters
- [ ] Switch to forest theme, game uses forest characters
- [ ] Complete game, achievements appear
- [ ] Complete game, progress bar updates on index.html
- [ ] Play same game again, difficulty increases
- [ ] Console shows postMessage sent to parent
- [ ] No errors in browser console

## Common Issues

### Images Not Loading
- Check image paths are correct
- Verify images exist in /images folder
- System will fallback to emojis automatically

### Theme Not Applying
- Make sure to call `applyTheme(currentTheme)` after loading theme
- Check CSS variables are being used (e.g., `var(--primary-color)`)

### Difficulty Not Progressing
- Ensure you call `progressDifficulty(activityType)` after completion
- Check localStorage in browser dev tools

### Achievements Not Showing
- Verify `showAchievement()` is called for each achievement
- Check that achievement notification styles are injected (done in game-utils.js)

### Progress Not Updating
- Make sure to call `sendCompletionToWix()` on game completion
- Check that activityTracker is initialized (done in rewards.js)
