# Quick Start Guide

Get your video player app running in 5 minutes!

## Prerequisites Check

Before starting, make sure you have:

- [ ] Node.js (v16+) installed
- [ ] npm or yarn installed
- [ ] Expo CLI (will be installed automatically)
- [ ] iOS Simulator (Mac) or Android Emulator

## Step 1: Verify Installation

Check your project directory:

```bash
cd /Users/khemrajsharma/ServicesProjects/videoplayerzeeshan
ls -la
```

You should see:
- `package.json`
- `App.js`
- `src/` directory
- `node_modules/` directory

## Step 2: Start Development Server

```bash
npm start
```

This will:
- Start Metro bundler
- Show QR code in terminal
- Open Expo DevTools in browser

**Expected output:**
```
› Metro waiting on exp://192.168.x.x:8081
› Scan the QR code above with Expo Go (Android) or the Camera app (iOS)
```

## Step 3: Run on Device/Simulator

### Option A: iOS Simulator (Mac only)

In the terminal, press:
```
i
```

Or run:
```bash
npm run ios
```

**First time:** Simulator may take 2-3 minutes to start.

### Option B: Android Emulator

In the terminal, press:
```
a
```

Or run:
```bash
npm run android
```

**First time:** Build may take 3-5 minutes.

### Option C: Physical Device

1. Install **Expo Go** app:
   - [iOS App Store](https://apps.apple.com/app/expo-go/id982107779)
   - [Google Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent)

2. Scan QR code from terminal with:
   - **iOS:** Camera app
   - **Android:** Expo Go app

## Step 4: Test the App

Once app loads, you should see:

1. **Home Screen** with:
   - App header "VideoPlayer"
   - Search bar
   - Navigation tabs
   - Sample video cards

2. **Test Video Playback:**
   - Tap any video card
   - Video should start playing
   - Controls should appear

3. **Test Controls:**
   - ✅ Play/Pause
   - ✅ Skip forward/backward
   - ✅ Seek bar
   - ✅ Volume control
   - ✅ Quality selection
   - ✅ Speed control

## Step 5: Add Your Own Video

1. Tap the **+** button (next to search)
2. Enter a video URL:

### Test URLs:

**M3U8/HLS Stream:**
```
https://demo.unified-streaming.com/k8s/features/stable/video/tears-of-steel/tears-of-steel.ism/.m3u8
```

**MP4 Video:**
```
http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4
```

3. Tap "Add Video"
4. Video appears at top of list
5. Tap to play

## Common Issues & Quick Fixes

### Issue: "Metro bundler failed to start"

**Fix:**
```bash
# Clear cache and restart
npx expo start -c
```

### Issue: "Module not found"

**Fix:**
```bash
# Reinstall dependencies
rm -rf node_modules
npm install
npm start
```

### Issue: "Can't scan QR code"

**Fix:**
- Make sure phone and computer are on same WiFi
- Try tunnel mode: `npx expo start --tunnel`

### Issue: "iOS Simulator won't open"

**Fix:**
```bash
# Open Xcode and install simulator
xcode-select --install
```

### Issue: "Android emulator not found"

**Fix:**
- Install Android Studio
- Open AVD Manager
- Create a new virtual device
- Start the emulator first, then run app

### Issue: "Video won't play"

**Fix:**
- Check internet connection
- Try a different video URL
- Check console for errors

### Issue: "App crashes on download"

**Fix:**
- Grant storage permissions when prompted
- Check available device storage
- Try downloading smaller video first

## Development Tips

### Hot Reload

Changes to code automatically reload:
- Save file
- App updates in ~1-2 seconds
- Maintains state (usually)

### Shake Gesture

Shake device to open:
- Developer menu
- Toggle performance monitor
- Reload app
- Toggle inspector

### Logs

View logs in terminal where you ran `npm start`

Or use:
```bash
# iOS logs
npx react-native log-ios

# Android logs
npx react-native log-android
```

### Clear Cache

If something's not working:
```bash
npx expo start -c
```

## Next Steps

### Customize Your App

1. **Change colors:**
   - Edit `src/config/videoConfig.js`
   - Modify `THEME.colors.primary`

2. **Add more videos:**
   - Edit `src/screens/HomeScreen.js`
   - Add to `videos` array

3. **Modify controls:**
   - Edit `src/components/EnhancedVideoPlayer.js`
   - Adjust timeout, skip duration, etc.

### Build for Production

#### iOS (requires Mac + Apple Developer account)

```bash
# Install EAS CLI
npm install -g eas-cli

# Login
eas login

# Build
eas build --platform ios
```

#### Android

```bash
# Build APK
eas build --platform android --profile preview

# Or build AAB for Play Store
eas build --platform android
```

### Learn More

- [README.md](./README.md) - Full documentation
- [USAGE_GUIDE.md](./USAGE_GUIDE.md) - User guide
- [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) - API reference

## Success Checklist

After following this guide, you should be able to:

- [x] Start development server
- [x] Run app on simulator/device
- [x] Play sample videos
- [x] Add custom video URLs
- [x] Use all player controls
- [x] Download videos (with permissions)
- [x] Background audio playback
- [x] Control from notifications

## Getting Help

### Console Errors

Check terminal for error messages:
```
Error: ...
  at ...
```

### Expo Diagnostics

Run diagnostics:
```bash
npx expo-doctor
```

### Community Support

- [Expo Forums](https://forums.expo.dev/)
- [React Native Community](https://reactnative.dev/community/overview)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/expo)

## Useful Commands

```bash
# Start with cache clear
npm start -- --clear

# Start with tunnel (for network issues)
npm start -- --tunnel

# Reset project
npx expo start -c

# Check for issues
npx expo-doctor

# Update dependencies
npx expo install --fix

# Run with specific port
npm start -- --port 8082
```

## Environment Variables (Optional)

Create `.env` file in project root:

```env
EXPO_PUBLIC_API_URL=https://your-api.com
EXPO_PUBLIC_ANALYTICS_KEY=your-key
```

Use in code:
```javascript
const apiUrl = process.env.EXPO_PUBLIC_API_URL;
```

---

## Ready to Go! 🚀

Your video player app is now ready for development!

**Start coding:**
```bash
npm start
```

**Need help?** Check the other documentation files.

**Happy coding! 🎉**

