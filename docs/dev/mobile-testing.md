# Mobile Testing Guide

This guide explains how to test the mobile responsiveness of the Tepper & Bennett website on your local development machine.

## Quick Start

**IMPORTANT**: This site uses absolute paths and must be served from a web server. Opening `index.html` directly in a browser will not work.

Run the provided script to start a local web server and open the page:

```bash
./start-mobile-test.sh
```

This will:
1. Start a local web server on port 8000
2. Automatically open http://localhost:8000 in your browser
3. Display testing instructions

Press Ctrl+C to stop the server when done.

Then follow the steps below to enable mobile device emulation in your browser.

## Manual Testing Steps

### Method 1: Using Browser DevTools (Recommended)

#### Chrome / Edge

1. **Start a local server** (required):
   ```bash
   # Using Python 3 (recommended)
   python3 -m http.server 8000

   # Or using Python 2
   python -m SimpleHTTPServer 8000

   # Or using Node.js
   npx http-server -p 8000
   ```

2. **Open the page**: Navigate to http://localhost:8000 in your browser

3. **Open DevTools**: Press `Cmd+Option+I` (Mac) or `Ctrl+Shift+I` (Windows/Linux)

4. **Toggle Device Emulation**: Press `Cmd+Shift+M` (Mac) or `Ctrl+Shift+M` (Windows/Linux)
   - Or click the device toolbar icon in the top-left of DevTools

5. **Select a device**: Choose from the dropdown:
   - iPhone SE (375×667) - Small phone
   - iPhone 12 Pro (390×844) - Medium phone
   - iPhone 14 Pro Max (430×932) - Large phone
   - Or set a custom width (e.g., 375px)

5. **Test the layout**:
   - Expand the "Song List" section
   - Verify all 4 columns are visible without horizontal scrolling:
     - Title
     - Performer(s)
     - Rights Administrator
     - ▶ (YouTube link)
   - Test the ▶ button to ensure it's tappable (min 32×32px touch target)
   - Try searching and sorting
   - Test pagination controls

#### Firefox

1. **Start a local server** (required): Same as Chrome instructions above

2. **Open the page**: Navigate to http://localhost:8000 in Firefox

3. **Open DevTools**: Press `Cmd+Option+I` (Mac) or `Ctrl+Shift+I` (Windows/Linux)

4. **Toggle Responsive Design Mode**: Press `Cmd+Option+M` (Mac) or `Ctrl+Shift+M` (Windows/Linux)
   - Or click the responsive design mode icon in DevTools

5. **Select a device or custom dimensions**: Same as Chrome instructions above

6. **Test the layout**: Same test steps as Chrome

#### Safari

1. **Enable Developer Menu** (if not already enabled):
   - Safari → Preferences → Advanced
   - Check "Show Develop menu in menu bar"

2. **Start a local server** (required): Same as Chrome instructions above

3. **Open the page**: Navigate to http://localhost:8000 in Safari

4. **Open Web Inspector**: Press `Cmd+Option+I`

5. **Enter Responsive Design Mode**:
   - Develop menu → Enter Responsive Design Mode
   - Or press `Cmd+Ctrl+R`

6. **Select a device or custom dimensions**: Choose from the device list

7. **Test the layout**: Same test steps as Chrome

## What to Look For

### Layout Requirements

- ✅ **No horizontal scrolling**: The table should fit completely within the viewport
- ✅ **All columns visible**: Title, Performer, Rights Administrator, and YouTube button
- ✅ **YouTube button accessible**: The ▶ symbol should be visible and tappable
- ✅ **Touch-friendly targets**: All interactive elements should be at least 32×32px
- ✅ **Readable text**: Font size should be legible (0.875rem / 14px on mobile)
- ✅ **Proper spacing**: Reduced padding on mobile but still comfortable

### Responsive Breakpoint

- Mobile styles apply at screen widths **below 768px**
- Desktop styles apply at **768px and above**

### Test Different Orientations

1. **Portrait mode** (narrower): Primary use case, ensure no truncation
2. **Landscape mode** (wider): Should have more breathing room

To rotate in DevTools:
- Click the rotate icon in the device toolbar
- Or manually adjust width/height values

## Column Width Distribution (Mobile)

When viewport is under 768px:

- **Title**: 35% of table width
- **Performer**: 30% of table width
- **Rights Administrator**: ~35% of table width
- **YouTube**: 40px fixed width

The table uses `table-layout: fixed` to enforce these widths and prevent overflow.

## Testing Checklist

- [ ] Page loads without errors in browser console
- [ ] Song List section expands/collapses correctly
- [ ] Search functionality works
- [ ] All 4 table columns are visible in portrait mode (375px width)
- [ ] No horizontal scrolling required
- [ ] YouTube ▶ button is visible and clickable
- [ ] YouTube links open in new tab when clicked
- [ ] Sorting by column headers works
- [ ] Pagination controls are functional
- [ ] Text is readable at mobile font sizes
- [ ] Test on actual device (if available) to verify touch interactions

## Testing on Actual Mobile Devices

For the most accurate test, deploy to a test server and access from real devices:

1. **Start a local web server**:
   ```bash
   # Python 3
   python3 -m http.server 8000

   # Or Python 2
   python -m SimpleHTTPServer 8000

   # Or Node.js (if you have http-server installed)
   npx http-server -p 8000
   ```

2. **Find your local IP address**:
   ```bash
   # macOS/Linux
   ifconfig | grep "inet " | grep -v 127.0.0.1

   # Or on macOS
   ipconfig getifaddr en0
   ```

3. **Access from mobile device**:
   - Ensure device is on same WiFi network
   - Open browser on mobile device
   - Navigate to `http://[YOUR_IP]:8000`
   - Example: `http://192.168.1.100:8000`

## Troubleshooting

### Issue: Horizontal scrolling still appears

- Clear browser cache and hard refresh (Cmd+Shift+R or Ctrl+Shift+R)
- Verify you're testing at a width below 768px
- Check browser console for any CSS loading errors
- Ensure `css/mobile.css` is loaded correctly

### Issue: YouTube column header shows "YouTube" instead of "▶"

- Hard refresh the page
- Check that `index.html` has been updated with the new header
- Look for `<th class="py-3 px-4 text-center youtube-header">▶</th>`

### Issue: Layout looks wrong on actual device but fine in DevTools

- User agent matters: Some sites detect actual devices differently
- Check for any JavaScript that modifies layout based on user agent
- Verify meta viewport tag exists: `<meta name="viewport" content="width=device-width, initial-scale=1.0">`

## Recent Changes (Dec 11, 2025)

Fixed mobile table truncation issue:

1. Changed YouTube column header from "YouTube" text to "▶" symbol
2. Set YouTube column to fixed 40px width on mobile
3. Distributed remaining width proportionally across other columns
4. Reduced font size and padding for mobile (0.875rem)
5. Made YouTube button touch-friendly (minimum 32×32px tap target)
6. Used `table-layout: fixed` to prevent column overflow

These changes eliminate the need for horizontal scrolling on mobile devices in portrait mode.
