# Usage Guide - Video Player App

## Getting Started

### Running the App

1. **Start the development server:**
   ```bash
   npm start
   ```

2. **Choose your platform:**
   - Press `i` for iOS simulator
   - Press `a` for Android emulator
   - Scan QR code with Expo Go app on your physical device

### First Launch

When you first launch the app, you'll see:
- A YouTube-like home screen with sample videos
- Navigation tabs at the top
- Search bar with add button
- Video cards with thumbnails and metadata

## Features Guide

### 1. Playing Videos

#### From Sample Videos
1. Scroll through the video list on the home screen
2. Tap any video card to start playing
3. The video will open in fullscreen player mode

#### Adding Custom Videos
1. Tap the **+** (plus) button next to the search bar
2. Enter a video URL in the modal
3. Supported formats:
   - Direct MP4 URLs: `https://example.com/video.mp4`
   - HLS/M3U8 streams: `https://example.com/stream.m3u8`
   - Other formats: MOV, WebM, etc.
4. Tap "Add Video" to add it to your list

### 2. Video Player Controls

#### Basic Controls

**Play/Pause**
- Tap the large center button
- Or tap notification controls
- Keyboard: Space bar (web)

**Skip Forward (10 seconds)**
- Tap the forward button (right side)
- Or use notification controls

**Skip Backward (10 seconds)**
- Tap the backward button (left side)
- Or use notification controls

**Seek/Scrub**
- Drag the red progress bar slider
- Tap anywhere on the progress bar to jump

**Close Player**
- Tap the down chevron icon (top left)
- Or swipe down (iOS gesture)

#### Advanced Controls

**Quality Selection**
1. Tap the settings icon (top right)
2. Choose from available qualities:
   - Auto (adaptive)
   - 1080p (Full HD)
   - 720p (HD)
   - 480p (SD)
   - 360p (Low)
3. Quality change takes effect immediately

**Playback Speed**
1. Tap the speed indicator (e.g., "1.0x") in top right
2. Select desired speed:
   - 0.25x to 2.0x range
   - Normal = 1.0x
3. Speed changes apply instantly

**Volume Control**
1. Tap the volume icon (bottom left)
2. Slider appears
3. Drag to adjust volume (0% to 100%)
4. Tap mute icon to mute/unmute

**Fullscreen Toggle**
1. Tap the expand icon (bottom right)
2. Switches between normal and fullscreen
3. Tap contract icon to exit fullscreen

**Replay Video**
1. Tap the reload icon (bottom right)
2. Video restarts from beginning
3. Playback settings (speed, quality) are preserved

### 3. Downloading Videos

#### Download Process

1. **Start Download:**
   - While playing a video, tap the download icon (top right)
   - Or from video card menu

2. **Monitor Progress:**
   - Progress bar appears at bottom of player
   - Shows percentage (0-100%)
   - Download happens in background

3. **Completion:**
   - Success alert appears when done
   - Video saved to device gallery
   - Accessible in Photos/Gallery app

#### Download Locations

**iOS:**
- Videos saved to Photos app
- Album: "VideoPlayer"

**Android:**
- Videos saved to Gallery
- Folder: VideoPlayer

#### M3U8/HLS Downloads

For M3U8 streams:
- App parses the playlist
- Downloads highest quality variant
- Merges video segments
- Saves as single file

**Note:** Large videos may take time depending on:
- Video size
- Internet speed
- Device storage

### 4. Background Playback

#### How It Works

1. **Enable Background Audio:**
   - Start playing any video
   - Press home button or switch apps
   - Audio continues playing

2. **Notification Controls:**
   - Persistent notification appears
   - Shows video title and status
   - Control buttons available:
     - Play/Pause
     - Skip Forward
     - Skip Backward

3. **Lock Screen Controls:**
   - **iOS:** Controls on lock screen
   - **Android:** Notification shade controls

#### Requirements

**iOS:**
- Background audio mode enabled (done automatically)
- App must remain in memory

**Android:**
- Foreground service permission (granted automatically)
- Notification permission

### 5. Search and Browse

#### Search Videos
1. Tap search bar at top
2. Type video title or keywords
3. Results filter as you type
4. Tap X to clear search

#### Navigation Tabs

**Home Tab**
- All videos
- Default view

**Trending Tab**
- Popular videos
- (Placeholder for future implementation)

**Saved Tab**
- Bookmarked videos
- (Placeholder for future implementation)

**Library Tab**
- Watch history
- Downloaded videos
- (Placeholder for future implementation)

### 6. Customization

#### Modifying Video List

Edit `src/screens/HomeScreen.js`:

```javascript
const [videos, setVideos] = useState([
  {
    id: 'unique-id',
    title: 'My Video Title',
    thumbnail: 'https://example.com/thumb.jpg',
    duration: '10:30',
    views: '1.2M',
    uploadTime: '2 days ago',
    channel: 'My Channel',
    url: 'https://example.com/video.m3u8',
  },
  // Add more videos...
]);
```

#### Changing Colors

Edit `src/config/videoConfig.js`:

```javascript
export const THEME = {
  colors: {
    primary: '#FF0000', // Change this for different theme
    background: '#0f0f0f',
    // ... more colors
  },
};
```

#### Adjusting Controls Timeout

Edit `src/components/EnhancedVideoPlayer.js`:

```javascript
controlsTimeout.current = setTimeout(() => {
  if (status.isPlaying) {
    setShowControls(false);
  }
}, 4000); // Change this value (milliseconds)
```

## Troubleshooting

### Video Won't Play

**Possible Causes:**
1. Invalid URL
2. Network issue
3. Unsupported format
4. CORS restrictions (web)

**Solutions:**
- Check URL is accessible
- Test URL in browser first
- Ensure internet connection
- Try different video source

### Download Fails

**Possible Causes:**
1. No storage permission
2. Insufficient storage space
3. Network interruption
4. Invalid m3u8 format

**Solutions:**
- Grant storage permissions
- Free up device storage
- Check internet stability
- Try non-m3u8 format

### Background Audio Stops

**iOS Solutions:**
- Check Background App Refresh is enabled
- Ensure app not force-closed
- Check Do Not Disturb settings

**Android Solutions:**
- Disable battery optimization for app
- Grant notification permissions
- Check Data Saver mode

### Controls Not Appearing

**Solution:**
- Tap anywhere on video screen
- Controls auto-hide after 4 seconds during playback
- Controls stay visible when paused

### Quality Selection Not Working

**Note:**
- Quality selection requires multi-bitrate streams
- Single quality videos show UI but don't switch
- Works best with m3u8/HLS adaptive streams

### Notifications Not Showing

**iOS:**
1. Settings > App > Notifications > Enable
2. Allow notification permission when prompted

**Android:**
1. Settings > Apps > VideoPlayer > Notifications > Enable
2. Grant notification permission

## Best Practices

### For Best Performance

1. **Use HLS/M3U8 for large videos**
   - Better streaming performance
   - Adaptive quality switching
   - Resume capability

2. **Download over WiFi**
   - Faster speeds
   - No data charges
   - More reliable

3. **Clear cache periodically**
   - Free up storage
   - Remove temporary files

4. **Close unused apps**
   - Better background playback
   - Improved performance

### For Better Experience

1. **Use good internet connection**
   - 5+ Mbps for HD
   - 25+ Mbps for 1080p

2. **Keep app updated**
   - Bug fixes
   - New features
   - Performance improvements

3. **Grant permissions**
   - Storage for downloads
   - Notifications for controls
   - Background mode for audio

## Keyboard Shortcuts (Web Only)

- `Space` - Play/Pause
- `→` - Skip forward
- `←` - Skip backward
- `↑` - Volume up
- `↓` - Volume down
- `F` - Toggle fullscreen
- `M` - Toggle mute
- `0-9` - Jump to 0%-90% of video

## Tips and Tricks

1. **Quick Seek**: Tap progress bar instead of dragging for faster seeking

2. **Volume Gesture**: Swipe up/down on left side for volume (feature for future)

3. **Brightness**: Swipe up/down on right side for brightness (feature for future)

4. **Double Tap**: Double tap left/right to skip (feature for future)

5. **Pinch to Zoom**: Pinch to zoom video (feature for future)

## Support

For issues or questions:
1. Check this guide first
2. Review README.md for technical details
3. Check console logs for errors
4. Open an issue with details

---

**Enjoy your video watching experience! 🎥**

