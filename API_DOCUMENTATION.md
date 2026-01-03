# API Documentation

## Components

### EnhancedVideoPlayer

Full-featured video player component with all controls and features.

#### Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `videoUri` | string | Yes | - | URL of the video to play (supports MP4, M3U8, etc.) |
| `videoTitle` | string | No | 'Video' | Title displayed in player and notifications |
| `onClose` | function | No | - | Callback function when player is closed |

#### Example Usage

```javascript
import EnhancedVideoPlayer from './src/components/EnhancedVideoPlayer';

<EnhancedVideoPlayer
  videoUri="https://example.com/video.m3u8"
  videoTitle="My Awesome Video"
  onClose={() => console.log('Player closed')}
/>
```

#### Features

- M3U8/HLS streaming support
- Background audio playback
- Notification controls
- Quality selection
- Playback speed control
- Volume control
- Download functionality
- Auto-hiding controls
- Progress tracking
- Skip forward/backward (10s)
- Replay functionality
- Fullscreen toggle

---

### VideoPlayer

Basic video player component (simpler version).

#### Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `videoUri` | string | Yes | - | URL of the video to play |
| `onClose` | function | No | - | Callback function when player is closed |

#### Example Usage

```javascript
import VideoPlayer from './src/components/VideoPlayer';

<VideoPlayer
  videoUri="https://example.com/video.mp4"
  onClose={() => navigation.goBack()}
/>
```

---

### HomeScreen

Main screen component with video list and navigation.

#### Features

- Video grid/list display
- Search functionality
- Add custom videos
- Navigation tabs
- Video card components

#### Example Usage

```javascript
import HomeScreen from './src/screens/HomeScreen';

export default function App() {
  return <HomeScreen />;
}
```

---

### LoadingScreen

Loading screen with app logo and spinner.

#### Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `message` | string | No | 'Loading...' | Message to display under loader |

#### Example Usage

```javascript
import LoadingScreen from './src/components/LoadingScreen';

{isLoading && <LoadingScreen message="Preparing video..." />}
```

---

## Services

### NotificationService

Manages media playback notifications.

#### Methods

##### `requestPermissions()`

Request notification permissions from the user.

**Returns:** `Promise<boolean>` - True if granted

```javascript
const granted = await NotificationService.requestPermissions();
```

##### `showMediaNotification(title, isPlaying)`

Show or update media notification.

**Parameters:**
- `title` (string): Video title
- `isPlaying` (boolean): Current playback state

**Returns:** `Promise<string>` - Notification ID

```javascript
await NotificationService.showMediaNotification('Video Title', true);
```

##### `updateNotification(title, isPlaying)`

Update existing notification.

**Parameters:**
- `title` (string): Video title
- `isPlaying` (boolean): Current playback state

```javascript
await NotificationService.updateNotification('Video Title', false);
```

##### `dismissNotification()`

Dismiss the current notification.

```javascript
await NotificationService.dismissNotification();
```

##### `addNotificationResponseListener(callback)`

Listen for notification interactions.

**Parameters:**
- `callback` (function): Handler function

**Returns:** Subscription object

```javascript
const listener = NotificationService.addNotificationResponseListener(
  (response) => {
    console.log('Notification action:', response.actionIdentifier);
  }
);
```

##### `removeNotificationListener(subscription)`

Remove notification listener.

**Parameters:**
- `subscription`: Subscription object from addNotificationResponseListener

```javascript
NotificationService.removeNotificationListener(listener);
```

---

### M3U8DownloadService

Handles video downloads including M3U8 streams.

#### Methods

##### `downloadVideo(videoUrl, onProgress, title)`

Download any video (automatically detects M3U8).

**Parameters:**
- `videoUrl` (string): Video URL
- `onProgress` (function): Progress callback (receives 0-1)
- `title` (string): Video title for filename

**Returns:** `Promise<object>` - { success, uri }

```javascript
await M3U8DownloadService.downloadVideo(
  'https://example.com/video.m3u8',
  (progress) => console.log(`${progress * 100}%`),
  'MyVideo'
);
```

##### `downloadM3U8Video(m3u8Url, onProgress, title)`

Download M3U8/HLS stream specifically.

**Parameters:**
- `m3u8Url` (string): M3U8 playlist URL
- `onProgress` (function): Progress callback
- `title` (string): Video title

**Returns:** `Promise<object>` - { success, uri }

```javascript
await M3U8DownloadService.downloadM3U8Video(
  'https://example.com/stream.m3u8',
  (progress) => setDownloadProgress(progress),
  'stream'
);
```

##### `downloadSimpleVideo(videoUrl, onProgress, title)`

Download regular video file (MP4, MOV, etc.).

**Parameters:**
- `videoUrl` (string): Direct video URL
- `onProgress` (function): Progress callback
- `title` (string): Video title

**Returns:** `Promise<object>` - { success, uri }

```javascript
await M3U8DownloadService.downloadSimpleVideo(
  'https://example.com/video.mp4',
  (progress) => updateProgress(progress),
  'video'
);
```

##### `parseM3U8(m3u8Url)`

Parse M3U8 playlist manifest.

**Parameters:**
- `m3u8Url` (string): M3U8 URL

**Returns:** `Promise<object>` - Parsed manifest

```javascript
const manifest = await M3U8DownloadService.parseM3U8(
  'https://example.com/playlist.m3u8'
);
console.log(manifest.segments);
```

##### `cancelDownload()`

Cancel ongoing download.

```javascript
M3U8DownloadService.cancelDownload();
```

---

## Utilities

### formatters.js

Utility functions for formatting data.

#### `formatTime(millis)`

Format milliseconds to time string.

**Parameters:**
- `millis` (number): Time in milliseconds

**Returns:** `string` - Formatted time (e.g., "10:30" or "1:05:30")

```javascript
import { formatTime } from './src/utils/formatters';

const timeString = formatTime(630000); // "10:30"
```

#### `formatFileSize(bytes)`

Format bytes to human-readable file size.

**Parameters:**
- `bytes` (number): File size in bytes

**Returns:** `string` - Formatted size (e.g., "1.5 MB")

```javascript
import { formatFileSize } from './src/utils/formatters';

const size = formatFileSize(1572864); // "1.5 MB"
```

#### `formatViewCount(views)`

Format view count to short format.

**Parameters:**
- `views` (number): Number of views

**Returns:** `string` - Formatted count (e.g., "1.2M")

```javascript
import { formatViewCount } from './src/utils/formatters';

const viewsText = formatViewCount(1234567); // "1.2M"
```

#### `formatUploadTime(date)`

Format date to relative time string.

**Parameters:**
- `date` (Date|string): Upload date

**Returns:** `string` - Relative time (e.g., "2 days ago")

```javascript
import { formatUploadTime } from './src/utils/formatters';

const timeAgo = formatUploadTime(new Date('2024-01-01')); // "2 weeks ago"
```

#### `isM3U8(url)`

Check if URL is M3U8/HLS stream.

**Parameters:**
- `url` (string): Video URL

**Returns:** `boolean`

```javascript
import { isM3U8 } from './src/utils/formatters';

if (isM3U8(videoUrl)) {
  // Handle M3U8 stream
}
```

#### `getVideoType(url)`

Get video type from URL.

**Parameters:**
- `url` (string): Video URL

**Returns:** `string` - Type ('hls', 'mp4', 'mov', etc.)

```javascript
import { getVideoType } from './src/utils/formatters';

const type = getVideoType('https://example.com/video.m3u8'); // "hls"
```

#### `isValidVideoUrl(url)`

Validate video URL.

**Parameters:**
- `url` (string): URL to validate

**Returns:** `boolean`

```javascript
import { isValidVideoUrl } from './src/utils/formatters';

if (isValidVideoUrl(inputUrl)) {
  // Proceed with valid URL
}
```

#### `debounce(func, wait)`

Debounce function calls.

**Parameters:**
- `func` (function): Function to debounce
- `wait` (number): Wait time in ms

**Returns:** `function` - Debounced function

```javascript
import { debounce } from './src/utils/formatters';

const debouncedSearch = debounce((query) => {
  searchVideos(query);
}, 500);
```

#### `throttle(func, limit)`

Throttle function execution.

**Parameters:**
- `func` (function): Function to throttle
- `limit` (number): Time limit in ms

**Returns:** `function` - Throttled function

```javascript
import { throttle } from './src/utils/formatters';

const throttledScroll = throttle(() => {
  updateScrollPosition();
}, 100);
```

---

## Configuration

### videoConfig.js

Application configuration settings.

#### VIDEO_SOURCES

Sample video sources for testing.

```javascript
import { VIDEO_SOURCES } from './src/config/videoConfig';

const sampleHLS = VIDEO_SOURCES.sampleStreams[0];
const sampleMP4 = VIDEO_SOURCES.sampleVideos[0];
```

#### PLAYER_CONFIG

Player configuration options.

```javascript
import { PLAYER_CONFIG } from './src/config/videoConfig';

const timeout = PLAYER_CONFIG.controlsTimeout; // 4000
const speeds = PLAYER_CONFIG.playbackSpeeds;
const qualities = PLAYER_CONFIG.qualities;
```

#### THEME

Theme colors and styling.

```javascript
import { THEME } from './src/config/videoConfig';

const primaryColor = THEME.colors.primary; // "#FF0000"
const spacing = THEME.spacing.md; // 12
```

---

## Constants

### index.js

Application-wide constants.

```javascript
import {
  CONTROLS_TIMEOUT,
  SKIP_DURATION,
  VIDEO_QUALITIES,
  PLAYBACK_SPEEDS,
  PLAYER_STATES,
  ERROR_MESSAGES,
} from './src/constants';

// Use constants
if (playerState === PLAYER_STATES.PLAYING) {
  // Handle playing state
}
```

#### Available Constants

- `CONTROLS_TIMEOUT` - Auto-hide controls duration
- `SKIP_DURATION` - Skip forward/backward duration
- `VIDEO_QUALITIES` - Quality options
- `PLAYBACK_SPEEDS` - Speed options
- `VIDEO_TYPES` - Supported video types
- `NOTIFICATION_ACTIONS` - Notification action IDs
- `DOWNLOAD_STATUS` - Download status values
- `PLAYER_STATES` - Player state values
- `ERROR_MESSAGES` - Error message strings
- `STORAGE_KEYS` - AsyncStorage keys
- `APP_CONFIG` - App configuration

---

## Events and Callbacks

### Video Player Events

The video player emits various events through callbacks:

#### onPlaybackStatusUpdate

Called when playback status changes.

```javascript
<Video
  onPlaybackStatusUpdate={(status) => {
    console.log('Position:', status.positionMillis);
    console.log('Is Playing:', status.isPlaying);
    console.log('Is Buffering:', status.isBuffering);
    console.log('Duration:', status.durationMillis);
  }}
/>
```

#### Status Object Properties

```javascript
{
  isPlaying: boolean,
  positionMillis: number,
  durationMillis: number,
  isBuffering: boolean,
  didJustFinish: boolean,
  volume: number,
  rate: number,
  shouldPlay: boolean,
  isLoaded: boolean,
  ...
}
```

---

## Error Handling

### Common Errors

```javascript
try {
  await videoRef.current.loadAsync({ uri: videoUrl });
} catch (error) {
  if (error.message.includes('network')) {
    // Handle network error
  } else if (error.message.includes('format')) {
    // Handle unsupported format
  } else {
    // Handle other errors
  }
}
```

### Download Errors

```javascript
try {
  await M3U8DownloadService.downloadVideo(url, onProgress, title);
} catch (error) {
  if (error.message.includes('permission')) {
    // Request permissions
  } else if (error.message.includes('storage')) {
    // Handle storage full
  }
}
```

---

## Best Practices

### Memory Management

```javascript
useEffect(() => {
  // Setup
  const subscription = NotificationService.addNotificationResponseListener(handler);
  
  return () => {
    // Cleanup
    NotificationService.removeNotificationListener(subscription);
    NotificationService.dismissNotification();
  };
}, []);
```

### Performance Optimization

```javascript
// Use debounce for search
const debouncedSearch = useMemo(
  () => debounce((query) => searchVideos(query), 300),
  []
);

// Use throttle for progress updates
const throttledUpdate = useMemo(
  () => throttle((progress) => updateProgress(progress), 100),
  []
);
```

### Error Boundaries

```javascript
class ErrorBoundary extends React.Component {
  componentDidCatch(error, errorInfo) {
    console.error('Video player error:', error, errorInfo);
  }
  
  render() {
    return this.props.children;
  }
}

// Usage
<ErrorBoundary>
  <EnhancedVideoPlayer {...props} />
</ErrorBoundary>
```

---

## TypeScript Support

While this project uses JavaScript, here are TypeScript type definitions for reference:

```typescript
// Video Player Props
interface VideoPlayerProps {
  videoUri: string;
  videoTitle?: string;
  onClose?: () => void;
}

// Video Object
interface Video {
  id: string;
  title: string;
  thumbnail: string;
  duration: string;
  views: string;
  uploadTime: string;
  channel: string;
  url: string;
}

// Download Progress Callback
type ProgressCallback = (progress: number) => void;

// Notification Response
interface NotificationResponse {
  actionIdentifier: string;
  notification: Notification;
}
```

---

For more information, see:
- [README.md](./README.md) - Project overview
- [USAGE_GUIDE.md](./USAGE_GUIDE.md) - User guide

