# Notification Media Controls

## Overview
The video player now includes full media controls in the notification, allowing users to control playback directly from the notification shade or lock screen without opening the app.

## Features

### Available Controls
1. **Play/Pause** - Toggle video playback
2. **Skip Backward (-10s)** - Jump back 10 seconds
3. **Skip Forward (+10s)** - Jump forward 10 seconds
4. **Previous** - Go to previous video (when available)
5. **Next** - Go to next video (when available)

### Platform Support
- **Android**: All 5 controls visible in the notification
- **iOS**: Controls available through notification actions

## Implementation Details

### NotificationService Updates

The `NotificationService` has been enhanced to support dynamic media controls:

```javascript
// Show notification with all controls
await NotificationService.updateNotification(
  videoTitle,      // Title of the video
  isPlaying,       // Current playback state
  hasNext,         // Whether next video is available
  hasPrevious      // Whether previous video is available
);
```

### EnhancedVideoPlayer Props

The `EnhancedVideoPlayer` component now accepts additional props for playlist navigation:

```javascript
<EnhancedVideoPlayer
  videoUri={videoUri}
  videoTitle={videoTitle}
  onClose={handleClose}
  // New props for notification controls
  onNext={handleNext}           // Function to call when next is pressed
  onPrevious={handlePrevious}   // Function to call when previous is pressed
  hasNext={true}                // Show/hide next button
  hasPrevious={false}           // Show/hide previous button
/>
```

### HomeScreen Example

The `HomeScreen` demonstrates a complete playlist implementation:

```javascript
const handleVideoPress = (video) => {
  const index = videos.findIndex(v => v.id === video.id);
  setCurrentVideoIndex(index);
  setSelectedVideo(video);
};

const handleNext = () => {
  if (currentVideoIndex < videos.length - 1) {
    const nextIndex = currentVideoIndex + 1;
    setCurrentVideoIndex(nextIndex);
    setSelectedVideo(videos[nextIndex]);
  }
};

const handlePrevious = () => {
  if (currentVideoIndex > 0) {
    const prevIndex = currentVideoIndex - 1;
    setCurrentVideoIndex(prevIndex);
    setSelectedVideo(videos[prevIndex]);
  }
};
```

## Notification Actions

### Android
The notification displays up to 5 action buttons:
- Previous (⏮) - Only shown when `hasPrevious` is true
- Skip Backward (⏪ -10s)
- Play/Pause (▶/⏸)
- Skip Forward (⏩ +10s)
- Next (⏭) - Only shown when `hasNext` is true

### iOS
iOS notification actions are available through:
- Long press on the notification
- 3D Touch (on supported devices)
- Notification Center actions

## Notification Channel

**Android Channel Configuration:**
- Channel ID: `media-playback`
- Importance: LOW (non-intrusive)
- Vibration: Disabled
- Sound: Disabled
- Badge: Disabled

This ensures the notification stays visible but doesn't interrupt the user.

## How It Works

1. **User plays a video** - Notification appears with current video title
2. **Playback state updates** - Notification updates to show play/pause icon
3. **User interacts with notification** - Actions are handled even when app is backgrounded
4. **Navigation controls** - Next/Previous buttons only appear when there are videos to navigate to

## Background Playback

The audio continues playing in the background when the app is minimized, and the notification controls remain functional, allowing seamless control without reopening the app.

## Audio Mode Configuration

The app is configured for background audio playback:
```javascript
await Audio.setAudioModeAsync({
  staysActiveInBackground: true,
  playsInSilentModeIOS: true,
  shouldDuckAndroid: true,
  playThroughEarpieceAndroid: false,
});
```

## Customization

### Adding More Actions
To add custom actions, modify the `NotificationService.js`:

1. Add action to the `actions` array in `showMediaNotification`
2. Handle the action in `handleNotificationResponse` in `EnhancedVideoPlayer.js`

### Changing Skip Duration
Currently set to 10 seconds. To change:
1. Modify `handleSkipForward` and `handleSkipBackward` in `EnhancedVideoPlayer.js`
2. Update button labels in `NotificationService.js`

## Testing

### To Test Notification Controls:
1. Run the app on a physical device or emulator
2. Play any video
3. Press home button to background the app
4. Pull down notification shade
5. Tap notification controls to verify functionality

### Expected Behavior:
- ✅ Play/Pause toggles playback
- ✅ Skip forward/backward seeks video by 10 seconds
- ✅ Next/Previous changes video in playlist
- ✅ Notification updates when video changes
- ✅ Controls work with app backgrounded

## Troubleshooting

### Controls Not Responding
- Ensure notification permissions are granted
- Check that the app is running in background (not killed)
- Verify Audio mode is set for background playback

### Buttons Not Visible
- On Android, check notification channel settings
- Ensure `hasNext` and `hasPrevious` are set correctly
- Verify notification is using the correct category identifier

### iOS Actions Not Showing
- Long press the notification to reveal actions
- Check that notification categories are set up in `setupNotificationCategories()`
- Ensure notification permissions include alerts

## Future Enhancements

Potential improvements:
- [ ] Show video thumbnail in notification
- [ ] Display current playback time
- [ ] Add repeat/shuffle options
- [ ] Support for media session native controls
- [ ] Lockscreen player controls integration
- [ ] Progress bar in notification (Android 13+)

## API Reference

### NotificationService Methods

#### `showMediaNotification(title, isPlaying, hasNext, hasPrevious)`
Shows or updates the media notification.

**Parameters:**
- `title` (string) - Video title
- `isPlaying` (boolean) - Current playback state
- `hasNext` (boolean) - Whether next video exists
- `hasPrevious` (boolean) - Whether previous video exists

**Returns:** Promise<string> - Notification ID

#### `dismissNotification()`
Removes the notification from the notification shade.

**Returns:** Promise<void>

#### `setupNotificationCategories()`
Sets up iOS notification categories with actions.

**Returns:** Promise<void>

### EnhancedVideoPlayer Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| videoUri | string | Yes | Video URL to play |
| videoTitle | string | No | Title displayed in notification |
| onClose | function | Yes | Called when player closes |
| onNext | function | No | Called when next button pressed |
| onPrevious | function | No | Called when previous button pressed |
| hasNext | boolean | No | Shows/hides next button |
| hasPrevious | boolean | No | Shows/hides previous button |

## License
Part of the VideoPlayer project.



