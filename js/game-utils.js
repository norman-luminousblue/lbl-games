// Utility functions for games
// Load image with fallback to emoji
function loadImage(src, fallbackEmoji) {
    return new Promise((resolve) => {
        if (!src) {
            resolve(fallbackEmoji);
            return;
        }
        
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = () => resolve(fallbackEmoji);
        img.src = src;
    });
}

// Draw image or emoji on canvas
function drawCharacter(ctx, character, x, y, size) {
    if (typeof character === 'string') {
        // It's an emoji
        ctx.font = `${size}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(character, x, y);
    } else {
        // It's an image
        ctx.drawImage(character, x - size/2, y - size/2, size, size);
    }
}

// Draw background image or gradient
function drawBackground(ctx, canvas, background, gradientColors) {
    if (background && typeof background !== 'string') {
        // It's an image
        ctx.drawImage(background, 0, 0, canvas.width, canvas.height);
    } else if (gradientColors) {
        // Draw gradient
        const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        gradient.addColorStop(0, gradientColors.start);
        gradient.addColorStop(1, gradientColors.end);
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
}

// Send completion data to Wix (COPPA compliant)
function sendCompletionToWix(activityType, score, timeSpent, theme) {
    // Record in local tracker
    const result = activityTracker.recordActivity(activityType, score, timeSpent, theme);
    
    // Get COPPA-compliant data
    const wixData = activityTracker.getWixData(activityType, score, timeSpent);
    
    // Send to parent window (Wix) - only if we're in an iframe
    try {
        if (window.parent && window.parent !== window) {
            window.parent.postMessage(wixData, '*');
        }
    } catch (error) {
        // Silently fail if postMessage is blocked or window is closing
        console.log('Note: Running standalone, data saved locally only');
    }
    
    return result;
}

// Show achievement notification
function showAchievement(achievement) {
    const notification = document.createElement('div');
    notification.className = 'achievement-notification';
    notification.innerHTML = `
        <div class="achievement-content">
            <div class="achievement-icon">${achievement.icon}</div>
            <div class="achievement-text">
                <div class="achievement-name">${achievement.name}</div>
                <div class="achievement-desc">${achievement.description}</div>
                <div class="achievement-points">+${achievement.points} points</div>
            </div>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => notification.classList.add('show'), 100);
    
    // Remove after 5 seconds
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 5000);
}

// Display progress bar
function displayProgressBar(containerId) {
    const progress = activityTracker.getProgress();
    const container = document.getElementById(containerId);
    
    if (!container) return;
    
    const levelProgress = progress.nextLevelProgress;
    
    container.innerHTML = `
        <div class="progress-container">
            <div class="progress-header">
                <div class="progress-level">Level ${progress.level}</div>
                <div class="progress-points">${progress.totalPoints} points</div>
            </div>
            <div class="progress-bar-container">
                <div class="progress-bar" style="width: ${levelProgress.percentage}%"></div>
            </div>
            <div class="progress-text">${levelProgress.current}/${levelProgress.needed} to next level</div>
            <div class="achievements-count">${progress.achievements.length} achievements unlocked</div>
        </div>
    `;
}

// Apply theme to game
function applyTheme(theme) {
    const root = document.documentElement;
    root.style.setProperty('--primary-color', theme.colors.primary);
    root.style.setProperty('--secondary-color', theme.colors.secondary);
    root.style.setProperty('--accent-color', theme.colors.accent);
    root.style.setProperty('--success-color', theme.colors.success);
    root.style.setProperty('--card-back-color', theme.colors.cardBack);
    
    // Apply background gradient
    if (theme.colors.background.startsWith('linear-gradient')) {
        document.body.style.background = theme.colors.background;
    }
}

// Audio system with theme support
class AudioSystem {
    constructor(theme) {
        this.theme = theme;
        this.enabled = true;
        this.audioContext = null;
        this.backgroundMusic = null;
    }
    
    init() {
        if (!this.audioContext) {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }
    }
    
    playSound(type = 'click') {
        if (!this.enabled) return;
        this.init();
        
        const frequency = this.theme.sounds[type] || 800;
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.frequency.value = frequency;
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.2);
        
        oscillator.start();
        oscillator.stop(this.audioContext.currentTime + 0.2);
    }
    
    startBackgroundMusic() {
        if (!this.enabled || this.backgroundMusic) return;
        this.init();
        
        const now = this.audioContext.currentTime;
        
        // Create oscillators for harmony
        const osc1 = this.audioContext.createOscillator();
        const osc2 = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        osc1.connect(gainNode);
        osc2.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        osc1.type = 'triangle';
        osc2.type = 'sine';
        
        // Gentle melody based on theme
        const baseFreq = this.theme.sounds.click || 800;
        osc1.frequency.value = baseFreq * 0.5;
        osc2.frequency.value = baseFreq * 0.75;
        
        gainNode.gain.setValueAtTime(0.1, now);
        
        osc1.start();
        osc2.start();
        
        this.backgroundMusic = { osc1, osc2, gainNode };
    }
    
    stopBackgroundMusic() {
        if (this.backgroundMusic) {
            this.backgroundMusic.osc1.stop();
            this.backgroundMusic.osc2.stop();
            this.backgroundMusic = null;
        }
    }
    
    toggle() {
        this.enabled = !this.enabled;
        if (!this.enabled) {
            this.stopBackgroundMusic();
        }
        return this.enabled;
    }
}

// CSS for achievements
const achievementStyles = `
<style>
.achievement-notification {
    position: fixed;
    top: 20px;
    right: -400px;
    background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);
    color: #000;
    padding: 20px;
    border-radius: 15px;
    box-shadow: 0 8px 20px rgba(0,0,0,0.3);
    z-index: 10000;
    transition: right 0.3s ease;
    max-width: 350px;
}

.achievement-notification.show {
    right: 20px;
}

.achievement-content {
    display: flex;
    align-items: center;
    gap: 15px;
}

.achievement-icon {
    font-size: 48px;
}

.achievement-text {
    flex: 1;
}

.achievement-name {
    font-size: 20px;
    font-weight: bold;
    margin-bottom: 5px;
}

.achievement-desc {
    font-size: 14px;
    opacity: 0.9;
    margin-bottom: 5px;
}

.achievement-points {
    font-size: 16px;
    font-weight: bold;
    color: #006400;
}

.progress-container {
    background: rgba(255,255,255,0.1);
    border-radius: 10px;
    padding: 15px;
    margin: 10px 0;
}

.progress-header {
    display: flex;
    justify-content: space-between;
    margin-bottom: 10px;
}

.progress-level {
    font-size: 20px;
    font-weight: bold;
}

.progress-points {
    font-size: 18px;
    color: var(--accent-color, #FFD700);
}

.progress-bar-container {
    background: rgba(0,0,0,0.3);
    border-radius: 10px;
    height: 20px;
    overflow: hidden;
    margin-bottom: 5px;
}

.progress-bar {
    background: linear-gradient(90deg, var(--accent-color, #FFD700), var(--primary-color, #00A8E8));
    height: 100%;
    transition: width 0.5s ease;
}

.progress-text {
    text-align: center;
    font-size: 14px;
    opacity: 0.9;
}

.achievements-count {
    text-align: center;
    font-size: 12px;
    margin-top: 5px;
    opacity: 0.8;
}
</style>
`;

// Inject styles
document.head.insertAdjacentHTML('beforeend', achievementStyles);
