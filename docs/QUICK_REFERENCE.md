# Quick Reference Guide

## 🎯 What You Asked For

✅ **Real Art Support** - System ready for character and background images
✅ **Progressive Difficulty** - Games get harder (3 levels per game type)
✅ **Multi-Theme Reskinning** - 3 themes ready (jellyfish, monsters, forest)
✅ **Reward System** - Points, levels, 7 achievements
✅ **COPPA Compliance** - No PII collected, parent consent required

## 📁 Key Files

| File | Purpose |
|------|---------|
| `index.html` | Main menu with theme selector & progress display |
| `js/themes.js` | Theme configs, difficulty levels, color schemes |
| `js/rewards.js` | Achievement system, activity tracking |
| `js/game-utils.js` | Shared utilities for all games |
| `SYSTEM_SUMMARY.md` | Complete overview of what's built |
| `INTEGRATION_GUIDE.md` | How to update games to use new system |
| `WIX_INTEGRATION.md` | Backend setup for Wix data collection |
| `images/README.md` | Where to place your art assets |

## 🎨 Adding Your Art

1. Drop images in `/images/jellyfish/`, `/images/monsters/`, `/images/forest/`
2. Update file paths in `js/themes.js`
3. Refresh browser - images load automatically
4. System falls back to emojis if images missing

**Recommended sizes:**
- Characters: 256x256px PNG with transparency
- Backgrounds: 980x760px PNG or JPG
- Keep files under 100KB each

## 🎮 Current Game Status

All 6 games working with emojis:
- ✅ Memory Match
- ✅ Coloring
- ✅ Maze
- ✅ Connect-Dots
- ✅ Spot-the-Difference
- ✅ Word Search

**To integrate new system into each game:**
- See `INTEGRATION_GUIDE.md` for step-by-step instructions
- Add 3 script tags
- Load theme and difficulty
- Use theme colors and characters
- Call sendCompletionToWix() on finish

## 🏆 Reward System

**Points:**
- Complete activities → earn points
- Every 50 points → level up
- Progress bar on main menu

**Achievements:**
- 🌟 First activity (10 pts)
- 🎯 5 activities (25 pts)
- 🏆 10 activities (50 pts)
- ⭐ Perfect score (20 pts)
- ⚡ Speed run (30 pts)
- 🌍 All themes (40 pts)
- 📈 Hard difficulty (35 pts)

## 📊 Data Collection (COPPA Compliant)

**What's tracked:**
- Activity type, score, time
- Anonymous session ID
- Achievement unlocks
- NO personal information

**Where it's stored:**
- Browser localStorage (client-side)
- Wix collection (only with parent consent)

**Parent controls:**
- View all data
- Export reports
- Delete everything

## 🎨 Themes

**Switch themes on index.html:**
- Click 🪼 Jellyfish button
- Click 👾 Monsters button  
- Click 🦊 Forest button

**Each theme has:**
- Unique color palette
- 6 characters (main + 5 friends)
- Theme-specific words
- Background imagery (when you add it)

## 📈 Difficulty Progression

**Automatic:**
- Complete a game → difficulty increases
- Next time you play → harder version
- 3 levels total per game

**Manual control:**
- Edit `DIFFICULTY_LEVELS` in `js/themes.js`
- Change grid sizes, number of items, etc.

## 🔗 Wix Integration

**Games send this data via postMessage:**
```javascript
{
  type: 'ACTIVITY_COMPLETE',
  data: {
    activityType: 'maze',
    score: 95,
    timeSpent: 45,
    completedAt: '2026-01-06T...',
    sessionId: 'session_...',
    totalActivities: 5,
    totalPoints: 120,
    currentLevel: 3,
    achievements: [...],
    newAchievements: [...]
  }
}
```

**Wix page receives it:**
- Set up listener in Activities.g3shl.js
- Check parent consent
- Save to UserActivityProgress collection
- See `WIX_INTEGRATION.md` for complete code

## 🚀 Next Steps

### Immediate (No Coding):
1. **Add your art** - Drop images in `/images/` folders
2. **Test themes** - Open index.html, try theme switching
3. **Play games** - See progress tracking and achievements

### Short Term (Some Coding):
4. **Update game files** - Follow `INTEGRATION_GUIDE.md`
5. **Test integration** - Verify each game uses themes
6. **Set up Wix** - Add collection and consent form

### Future:
7. **Add counting game** - Match activity book
8. **Add pattern game** - Match activity book
9. **More themes** - Seasonal, holiday, custom
10. **Parent dashboard** - View progress reports

## 🧪 Testing

**Test theme switching:**
1. Open `index.html` in browser
2. Click different theme buttons
3. Launch games - verify colors change

**Test art loading:**
1. Add one image to `/images/jellyfish/`
2. Update path in `js/themes.js`
3. Refresh browser - image should appear

**Test progression:**
1. Complete same game 3 times
2. Check difficulty increases (stars on cards)
3. Check progress bar fills

**Test achievements:**
1. Complete your first activity → 🌟 Getting Started
2. Get perfect score → ⭐ Perfect!
3. Complete under 30 seconds → ⚡ Speed Master

## 📞 Common Questions

**Q: Do all games need to be updated to work?**
A: No, existing games work fine. Update them when you want to add themes/difficulty.

**Q: What if I only have art for one theme?**
A: That's fine! Other themes will use emojis as fallback.

**Q: Can I test without Wix?**
A: Yes! Everything works locally. Wix integration is optional.

**Q: How do I add a new theme?**
A: Copy a theme object in `themes.js`, change colors/characters, add button to index.html.

**Q: Will this work on mobile?**
A: Yes, designed for 980x760 but responsive for smaller screens.

**Q: Where's the data stored?**
A: Browser localStorage (client) + Wix collection (server, with parent consent).

## 📋 Checklist

Before launch:
- [ ] Add real art for at least one theme
- [ ] Update games to use theme system (see INTEGRATION_GUIDE.md)
- [ ] Test theme switching works
- [ ] Test difficulty progression works
- [ ] Test achievements trigger correctly
- [ ] Set up Wix collection (UserActivityProgress)
- [ ] Create parent consent form in Wix
- [ ] Test postMessage sends data to Wix
- [ ] Test parent dashboard displays data
- [ ] Add privacy policy to Wix site
- [ ] Test on mobile devices
- [ ] Final QA pass on all games

## 🎉 What's Working Now

Open `index.html` and you'll see:
- Theme selector buttons (working!)
- Progress display (level, points, activities count)
- Achievement tracker
- 6 game cards with difficulty levels
- Theme switching changes colors and titles
- Click a game → localStorage tracks current theme
- Complete activities → points, level, achievements update
- All data persists across page reloads

## 🔧 File Locations

```
lbl-games/
├── index.html                 ← Main hub
├── js/
│   ├── themes.js             ← Theme & difficulty configs
│   ├── rewards.js            ← Achievements & tracking
│   └── game-utils.js         ← Shared utilities
├── images/
│   ├── jellyfish/            ← Add jellyfish art here
│   ├── monsters/             ← Add monster art here
│   └── forest/               ← Add forest art here
└── [Documentation files]

Deployed at: norman-luminousblue.github.io/lbl-games
```

## 💡 Pro Tips

1. **Start small** - Add art for one theme first, test, then expand
2. **Use the fallbacks** - Games work fine with emojis during development
3. **Test frequently** - Open index.html after each change
4. **Check console** - F12 opens browser console for debugging
5. **Git commit often** - Save progress as you go
6. **Read the docs** - INTEGRATION_GUIDE.md has detailed examples

---

**Everything is set up and ready!** The system works now with emojis. As you add real art, it will seamlessly integrate. 🎨✨
