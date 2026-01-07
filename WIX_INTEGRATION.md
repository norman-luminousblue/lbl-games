# Wix Integration Guide - COPPA Compliant Data Handling

## Overview

This guide explains how to receive and store activity completion data from the games in a COPPA-compliant manner.

## Data Flow

```
Game Complete → postMessage → Wix Page → Check Parent Verification → Save to Collection
```

## Important: COPPA Compliance

### What We Can Store (with parent consent)
- Activity completion stats (type, score, time)
- Anonymous session IDs
- Timestamps
- Achievement unlocks

### What We CANNOT Store
- Child's name
- Child's email
- Child's age or birthdate
- Child's location
- Any personally identifiable information (PII)

### Parent Verification Required

Before saving ANY data, you MUST verify:
1. Parent has created account
2. Parent has given consent to track activity data
3. User is logged in with parent credentials OR parent has set permission for child profile

## Wix Collection Structure

### Collection: UserActivityProgress

```javascript
{
  _id: "auto-generated",
  _owner: "parent-user-id",  // The parent's Wix user ID
  sessionId: "session_timestamp_random",  // Anonymous session identifier
  activities: [
    {
      activityType: "matching",
      score: 95,
      timeSpent: 45,
      completedAt: "2026-01-06T12:34:56.789Z",
      theme: "jellyfish",
      difficultyLevel: 2
    }
  ],
  totalActivitiesCompleted: 15,
  totalPoints: 250,
  currentLevel: 6,
  achievements: [
    {
      achievementId: "first_game",
      name: "Getting Started",
      unlockedAt: "2026-01-06T12:00:00.000Z",
      points: 10
    }
  ],
  lastUpdated: "2026-01-06T12:34:56.789Z",
  parentConsent: true,  // REQUIRED - must be true to save data
  consentDate: "2026-01-01T00:00:00.000Z"
}
```

### Collection Permissions

Set these permissions in Wix:
- **Create**: Members only (when parentConsent is true)
- **Read**: Owner only (parents can only see their own child's data)
- **Update**: Owner only
- **Delete**: Owner only

## Page Code: Activities.g3shl.js

### 1. Check Parent Consent

```javascript
import wixUsers from 'wix-users';
import wixData from 'wix-data';

let parentConsentVerified = false;
let userProgressRecord = null;

$w.onReady(async function () {
    // Check if user is logged in
    if (wixUsers.currentUser.loggedIn) {
        await checkParentConsent();
        setupGameFrameListener();
    } else {
        // Redirect to login or show warning
        $w('#gameFrame').hide();
        $w('#loginMessage').show();
    }
});

async function checkParentConsent() {
    try {
        const userId = wixUsers.currentUser.id;
        
        // Query for existing progress record
        const results = await wixData.query("UserActivityProgress")
            .eq("_owner", userId)
            .find();
        
        if (results.items.length > 0) {
            userProgressRecord = results.items[0];
            parentConsentVerified = userProgressRecord.parentConsent === true;
        } else {
            // No record exists - need to create one with consent
            // This should happen during parent signup/onboarding
            parentConsentVerified = false;
        }
        
        if (!parentConsentVerified) {
            // Show consent form
            await showConsentForm();
        }
    } catch (error) {
        console.error("Error checking parent consent:", error);
        parentConsentVerified = false;
    }
}

async function showConsentForm() {
    // Display a lightbox or section with consent form
    $w('#consentLightbox').show();
    
    $w('#consentButton').onClick(async () => {
        // Create initial progress record with consent
        try {
            userProgressRecord = await wixData.insert("UserActivityProgress", {
                sessionId: generateSessionId(),
                activities: [],
                totalActivitiesCompleted: 0,
                totalPoints: 0,
                currentLevel: 1,
                achievements: [],
                parentConsent: true,
                consentDate: new Date()
            });
            
            parentConsentVerified = true;
            $w('#consentLightbox').hide();
        } catch (error) {
            console.error("Error saving consent:", error);
        }
    });
}

function generateSessionId() {
    return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}
```

### 2. Listen for Game Completion Messages

```javascript
function setupGameFrameListener() {
    $w('#gameFrame').onMessage((event) => {
        if (event.data.type === 'ACTIVITY_COMPLETE') {
            handleActivityCompletion(event.data.data);
        }
    });
}

async function handleActivityCompletion(activityData) {
    // Only save if parent consent is verified
    if (!parentConsentVerified) {
        console.log("Activity completed but parent consent not verified");
        return;
    }
    
    try {
        // Prepare activity entry (NO PII)
        const activityEntry = {
            activityType: activityData.activityType,
            score: activityData.score,
            timeSpent: activityData.timeSpent,
            completedAt: activityData.completedAt || new Date().toISOString(),
            theme: getCurrentTheme(),  // from your theme system
            difficultyLevel: getDifficultyForActivity(activityData.activityType)
        };
        
        // Update the progress record
        if (userProgressRecord) {
            // Add new activity to array
            userProgressRecord.activities.push(activityEntry);
            userProgressRecord.totalActivitiesCompleted = activityData.totalActivities;
            userProgressRecord.lastUpdated = new Date();
            
            // Calculate points and level from local storage data
            // (This syncs with client-side tracking)
            const localProgress = getLocalProgress();
            userProgressRecord.totalPoints = localProgress.totalPoints;
            userProgressRecord.currentLevel = localProgress.level;
            userProgressRecord.achievements = localProgress.achievements;
            
            // Save to Wix database
            await wixData.update("UserActivityProgress", userProgressRecord);
            
            console.log("Activity saved successfully");
            
            // Optional: Show success message to user
            showSuccessMessage(activityEntry);
        }
    } catch (error) {
        console.error("Error saving activity:", error);
    }
}

function getLocalProgress() {
    // Get progress data from iframe's localStorage
    // This requires sending it via postMessage since we can't access iframe localStorage directly
    // For now, we can trust the client-side tracking
    return {
        totalPoints: 0,  // Will be sent in future messages
        level: 1,
        achievements: []
    };
}

function getCurrentTheme() {
    // Get from page state or localStorage
    return localStorage.getItem('currentTheme') || 'jellyfish';
}

function getDifficultyForActivity(activityType) {
    const key = `difficulty_${activityType}`;
    return parseInt(localStorage.getItem(key)) || 1;
}

function showSuccessMessage(activityEntry) {
    // Show a brief success indicator
    $w('#successBanner').text = `Great job! Activity completed!`;
    $w('#successBanner').show();
    
    setTimeout(() => {
        $w('#successBanner').hide();
    }, 3000);
}
```

### 3. Enhanced Data Sync

To get full progress data including points and achievements from the game:

**Update game completion handler to send more data:**

In your game files, update the postMessage:

```javascript
// In game-utils.js, update sendCompletionToWix function
function sendCompletionToWix(activityType, score, timeSpent, theme) {
    const result = activityTracker.recordActivity(activityType, score, timeSpent, theme);
    const progress = activityTracker.getProgress();
    
    const wixData = {
        type: 'ACTIVITY_COMPLETE',
        data: {
            activityType: activityType,
            score: score,
            timeSpent: timeSpent,
            completedAt: new Date().toISOString(),
            sessionId: activityTracker.data.sessionId,
            totalActivities: activityTracker.data.totalActivitiesCompleted,
            // Enhanced data
            totalPoints: progress.totalPoints,
            currentLevel: progress.level,
            achievements: progress.achievements,
            newAchievements: result.newAchievements
        }
    };
    
    if (window.parent !== window) {
        window.parent.postMessage(wixData, '*');
    }
    
    return result;
}
```

**Then in Wix, use the enhanced data:**

```javascript
async function handleActivityCompletion(activityData) {
    if (!parentConsentVerified) return;
    
    try {
        const activityEntry = {
            activityType: activityData.activityType,
            score: activityData.score,
            timeSpent: activityData.timeSpent,
            completedAt: activityData.completedAt,
            theme: getCurrentTheme(),
            difficultyLevel: getDifficultyForActivity(activityData.activityType)
        };
        
        if (userProgressRecord) {
            userProgressRecord.activities.push(activityEntry);
            userProgressRecord.totalActivitiesCompleted = activityData.totalActivities;
            userProgressRecord.totalPoints = activityData.totalPoints;  // From game
            userProgressRecord.currentLevel = activityData.currentLevel;  // From game
            userProgressRecord.achievements = activityData.achievements;  // From game
            userProgressRecord.lastUpdated = new Date();
            
            await wixData.update("UserActivityProgress", userProgressRecord);
            
            // Show new achievements
            if (activityData.newAchievements && activityData.newAchievements.length > 0) {
                showAchievements(activityData.newAchievements);
            }
        }
    } catch (error) {
        console.error("Error saving activity:", error);
    }
}

function showAchievements(achievements) {
    achievements.forEach(achievement => {
        // Show achievement notification in Wix
        $w('#achievementBox').show();
        $w('#achievementIcon').text = achievement.icon;
        $w('#achievementName').text = achievement.name;
        $w('#achievementDesc').text = achievement.description;
        $w('#achievementPoints').text = `+${achievement.points} points`;
        
        setTimeout(() => {
            $w('#achievementBox').hide();
        }, 5000);
    });
}
```

## Parent Dashboard

Create a separate page to show parents their child's progress:

### Page: Parent Dashboard (dashboard.js)

```javascript
import wixData from 'wix-data';
import wixUsers from 'wix-users';

$w.onReady(async function () {
    if (wixUsers.currentUser.loggedIn) {
        await loadProgressData();
    }
});

async function loadProgressData() {
    try {
        const userId = wixUsers.currentUser.id;
        const results = await wixData.query("UserActivityProgress")
            .eq("_owner", userId)
            .find();
        
        if (results.items.length > 0) {
            const progress = results.items[0];
            displayProgress(progress);
        }
    } catch (error) {
        console.error("Error loading progress:", error);
    }
}

function displayProgress(progress) {
    // Display overall stats
    $w('#levelText').text = `Level ${progress.currentLevel}`;
    $w('#pointsText').text = `${progress.totalPoints} points`;
    $w('#activitiesText').text = `${progress.totalActivitiesCompleted} activities completed`;
    
    // Display achievements
    const achievementsHTML = progress.achievements.map(a => `
        <div class="achievement">
            <span class="icon">${a.icon || '🏆'}</span>
            <span class="name">${a.name}</span>
            <span class="points">+${a.points}</span>
        </div>
    `).join('');
    $w('#achievementsList').html = achievementsHTML;
    
    // Display recent activities
    const recentActivities = progress.activities.slice(-10).reverse();
    const activitiesHTML = recentActivities.map(a => `
        <div class="activity">
            <span>${a.activityType}</span>
            <span>Score: ${a.score}</span>
            <span>${new Date(a.completedAt).toLocaleDateString()}</span>
        </div>
    `).join('');
    $w('#recentActivitiesList').html = activitiesHTML;
}
```

## Data Privacy Policy

Make sure your Wix site includes:

1. **Privacy Policy** stating:
   - What data is collected (activity stats only)
   - That NO personal information about children is collected
   - That parent consent is required
   - How data is used (to track child's educational progress)
   - That parents can request data deletion

2. **Consent Form** that includes:
   - Clear explanation of what's tracked
   - Option to opt out
   - Easy way to revoke consent

3. **Data Access** for parents:
   - View all collected data
   - Export data
   - Delete all data

## Testing Checklist

- [ ] User cannot save data without parent consent
- [ ] Parent consent form displays correctly
- [ ] Accepting consent creates UserActivityProgress record
- [ ] Game completion sends postMessage
- [ ] Wix receives and saves activity data
- [ ] NO PII is stored in collection
- [ ] Parent can view progress on dashboard
- [ ] Achievements display correctly
- [ ] Data persists across sessions
- [ ] Parent can delete their data

## Troubleshooting

### Data Not Saving
1. Check parent consent is true
2. Verify user is logged in
3. Check collection permissions
4. Look for errors in browser console

### postMessage Not Received
1. Verify iframe src is correct
2. Check cross-origin settings
3. Ensure event listener is set up correctly

### Achievements Not Showing
1. Check newAchievements array in message data
2. Verify achievement display elements exist
3. Check CSS for visibility

## Security Notes

- Always validate data on server side
- Never trust client-sent scores without verification
- Implement rate limiting to prevent abuse
- Monitor for unusual activity patterns
- Regularly audit stored data for PII
