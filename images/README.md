# Image Assets Guide

## Folder Structure

Place your art assets in these folders:

```
/images
  /jellyfish
    - main-character.png      (The jellyfish main character)
    - octopus.png             (Friend character 1)
    - squid.png               (Friend character 2)
    - crab.png                (Friend character 3)
    - fish1.png               (Friend character 4)
    - fish2.png               (Friend character 5)
    - ocean-background.png    (Main background scene)
    - intro-screen.png        (Optional: Intro screen background)
    - completion-screen.png   (Optional: Completion screen background)
    
  /monsters
    - main-monster.png        (The main monster character)
    - ghost.png               (Friend character 1)
    - zombie.png              (Friend character 2)
    - bat.png                 (Friend character 3)
    - spider.png              (Friend character 4)
    - dragon.png              (Friend character 5)
    - spooky-background.png   (Main background scene)
    - intro-screen.png        (Optional: Intro screen background)
    - completion-screen.png   (Optional: Completion screen background)
    
  /forest
    - fox.png                 (The fox main character)
    - raccoon.png             (Friend character 1)
    - bear.png                (Friend character 2)
    - owl.png                 (Friend character 3)
    - squirrel.png            (Friend character 4)
    - deer.png                (Friend character 5)
    - forest-background.png   (Main background scene)
    - intro-screen.png        (Optional: Intro screen background)
    - completion-screen.png   (Optional: Completion screen background)
```

## Image Specifications

### Character Images
- **Format**: PNG with transparency (preferred) or JPG
- **Size**: 256x256px to 512x512px recommended
- **Style**: Consistent art style across all characters in a theme
- **Background**: Transparent preferred, or white/theme-appropriate color
- **File Size**: Under 100KB per image (optimize for web)

### Background Images
- **Format**: PNG or JPG
- **Size**: 980x760px (matches game iframe dimensions)
- **Style**: Matching the theme's color palette
- **File Size**: Under 500KB (optimize for fast loading)

### Color Palettes (for reference)

**Jellyfish Theme:**
- Primary: #00A8E8 (bright blue)
- Secondary: #0077B6 (deep blue)
- Accent: #06FFA5 (aqua green)

**Monster Theme:**
- Primary: #7209B7 (purple)
- Secondary: #560BAD (dark purple)
- Accent: #F72585 (pink)

**Forest Theme:**
- Primary: #2A9D8F (teal green)
- Secondary: #264653 (dark teal)
- Accent: #E9C46A (golden yellow)

## What Happens If Images Are Missing?

The system is designed with fallbacks:
- If character images don't load → uses emoji placeholders
- If background images don't load → uses gradient backgrounds
- Games work perfectly without images (current state)

## Adding Your Art

1. **Prepare your images** according to specs above
2. **Place files** in appropriate theme folders
3. **Update** `js/themes.js` with correct file paths
4. **Test** by loading index.html in browser
5. **Deploy** by committing and pushing to GitHub

## Example: Adding Jellyfish Images

If you have a file called `jellyfish-character.png`:

1. Place it in `/images/jellyfish/main-character.png`
2. Edit `js/themes.js`:
   ```javascript
   jellyfish: {
       // ... other config
       characters: {
           main: 'images/jellyfish/main-character.png',  // Updated!
           friend1: '🐙',  // Still using emoji until you add octopus.png
           // ...
       }
   }
   ```
3. Refresh browser - jellyfish image appears!

## Testing Your Images

1. Open `index.html` in browser
2. Select the theme you added images for
3. Click a game
4. Check if characters display correctly
5. Look in browser console for any loading errors

## Optimization Tips

- Use PNG-8 instead of PNG-24 when possible
- Compress images with tools like TinyPNG
- Keep character images under 50KB each
- Keep backgrounds under 300KB
- Test on mobile devices for performance

## Common Issues

**Image not showing?**
- Check file path in themes.js matches actual file name
- Check file extension (.png vs .PNG)
- Look for errors in browser console (F12)
- Verify file is in correct folder

**Image too slow to load?**
- Reduce file size using compression
- Consider smaller dimensions
- Use JPG for photographs, PNG for illustrations

**Image looks pixelated?**
- Use larger source image (512x512px for characters)
- Use vector format (SVG) if possible
- Ensure image matches game display size

## Need Help?

The system includes automatic fallbacks, so:
- You can add images gradually (one theme at a time)
- You can test as you go
- Games continue working even if images fail to load
- No coding required - just drop images in folders and update paths!
