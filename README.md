# Video Player - YouTube-like React Native App

A full-featured video player application built with React Native and Expo, designed to provide a YouTube-like experience with advanced playback controls, background audio, and m3u8 streaming support.

## 🎥 Features

### Core Features
- **M3U8/HLS Streaming Support**: Play adaptive bitrate streaming videos
- **Background Audio Playback**: Continue playing audio when app is minimized
- **Media Controls**: Play, pause, forward (10s), backward (10s), replay
- **Bitrate/Quality Selection**: Switch between different video qualities (Auto, 1080p, 720p, 480p, 360p)
- **Playback Speed Control**: Adjust speed from 0.25x to 2x
- **Volume Control**: Adjustable volume slider
- **Download Functionality**: Download m3u8 videos and regular video files
- **Notification Controls**: Control playback from system notifications

### UI Features
- **YouTube-like Interface**: Modern, dark-themed UI similar to YouTube
- **Custom Video Player**: Full-featured video player with custom controls
- **Auto-hide Controls**: Controls automatically hide during playback
- **Progress Bar**: Visual progress indicator with time stamps
- **Fullscreen Support**: Toggle fullscreen mode
- **Loading Indicators**: Show buffering and download progress

## 📦 Installation

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Expo CLI
- iOS Simulator or Android Emulator (or physical device)

### Setup

1. Navigate to the project directory:
```bash
cd /Users/khemrajsharma/ServicesProjects/videoplayerzeeshan
```

2. Install dependencies (already done):
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

4. Run on your preferred platform:
```bash
# iOS
npm run ios

# Android
npm run android

# Web
npm run web
```

## 🎮 Usage

### Playing Videos

1. **From Home Screen**: Tap any video card to start playing
2. **Add Custom Video**: 
   - Tap the '+' button in the search bar
   - Enter a video URL (supports MP4, M3U8, and other formats)
   - Tap "Add Video"

### Video Controls

- **Play/Pause**: Tap the center play button
- **Skip Forward/Backward**: Tap the forward/backward buttons (10-second increments)
- **Seek**: Drag the progress bar slider
- **Volume**: Tap volume icon and adjust slider
- **Quality**: Tap settings icon to change video quality
- **Speed**: Tap speed indicator (e.g., "1.0x") to change playback speed
- **Download**: Tap download icon to save video to device
- **Fullscreen**: Tap expand icon to toggle fullscreen mode

### Background Playback

- Video audio continues playing when you:
  - Minimize the app
  - Lock the device
  - Switch to another app
- Control playback from:
  - System notification
  - Lock screen controls (iOS)
  - Notification shade (Android)

## 📁 Project Structure

```
videoplayerzeeshan/
├── src/
│   ├── components/
│   │   ├── VideoPlayer.js          # Basic video player component
│   │   └── EnhancedVideoPlayer.js  # Full-featured player with all controls
│   ├── services/
│   │   ├── NotificationService.js  # Handle media notifications
│   │   └── M3U8DownloadService.js  # M3U8 parsing and downloading
│   └── screens/
│       └── HomeScreen.js           # Main home screen with video list
├── App.js                          # Root component
├── app.json                        # Expo configuration
└── package.json                    # Dependencies
```

## 🛠️ Technical Details

### Dependencies

- **expo-av**: Video and audio playback
- **expo-notifications**: Background notifications
- **expo-media-library**: Media storage access
- **expo-file-system**: File operations for downloads
- **expo-linear-gradient**: UI gradients
- **@react-native-community/slider**: Custom sliders
- **m3u8-parser**: Parse m3u8 playlist files
- **react-native-track-player**: Enhanced audio playback

### Audio Configuration

The app is configured for background audio playback with:
- iOS: UIBackgroundModes includes "audio"
- Android: FOREGROUND_SERVICE permission
- Audio mode: staysActiveInBackground enabled

### Permissions

#### iOS
- Background audio playback
- Media library access
- Notifications

#### Android
- Internet access
- External storage read/write
- Foreground service for background playback
- Notifications

## 🎨 Customization

### Changing Theme Colors

Edit the color values in component styles:
- Primary color: `#FF0000` (YouTube red)
- Background: `#0f0f0f` (Dark)
- Secondary background: `#1a1a1a`
- Text: `white`, `#ccc`, `#aaa`

### Adding More Quality Options

In `EnhancedVideoPlayer.js`, modify the `qualities` array:

```javascript
const [qualities, setQualities] = useState([
  { label: 'Auto', value: 'auto', bandwidth: 0 },
  { label: '4K', value: '2160', bandwidth: 15000000 },
  { label: '1080p', value: '1080', bandwidth: 5000000 },
  // ... add more
]);
```

### Custom Video Sources

Add videos in `HomeScreen.js`:

```javascript
const [videos, setVideos] = useState([
  {
    id: 'unique-id',
    title: 'Video Title',
    thumbnail: 'https://...',
    duration: '10:30',
    views: '1.2M',
    uploadTime: '2 days ago',
    channel: 'Channel Name',
    url: 'https://your-video-url.m3u8',
  },
  // ... more videos
]);
```

## 📱 Supported Formats

### Video Formats
- MP4
- M3U8 (HLS)
- MOV
- WebM
- And other formats supported by expo-av

### Streaming Protocols
- HLS (HTTP Live Streaming)
- Progressive download
- Adaptive bitrate streaming

## 🐛 Known Issues & Limitations

1. **M3U8 Download**: The current implementation provides a simplified version of m3u8 downloading. For production, consider using FFmpeg or similar tools for proper segment merging.

2. **Quality Switching**: Quality switching requires multiple stream URLs. The current implementation shows the UI but needs actual variant playlists.

3. **Background Playback**: Some features may vary between iOS and Android due to platform differences.

## 🚀 Future Enhancements

- [ ] Picture-in-Picture mode
- [ ] Chromecast support
- [ ] Subtitle/Caption support
- [ ] Playlist management
- [ ] Watch history
- [ ] Favorites/Bookmarks
- [ ] Comments and likes
- [ ] User authentication
- [ ] Video recommendations
- [ ] Offline playback queue

## 📄 License

This project is created for educational purposes.

## 🤝 Contributing

Feel free to submit issues and enhancement requests!

## 📧 Support

For questions and support, please open an issue in the repository.

---

**Built with ❤️ using React Native and Expo**

