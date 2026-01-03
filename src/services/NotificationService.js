import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

class NotificationService {
  constructor() {
    this.notificationId = null;
    this.setupNotificationChannels();
  }

  async setupNotificationChannels() {
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('media-playback', {
        name: 'Media Playback',
        importance: Notifications.AndroidImportance.LOW,
        vibrationPattern: [0],
        sound: null,
        enableVibrate: false,
        showBadge: false,
        lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
      });
    }
  }

  async requestPermissions() {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    return finalStatus === 'granted';
  }

  async showMediaNotification(title, isPlaying, hasNext = false, hasPrevious = false) {
    try {
      await this.requestPermissions();

        const notificationContent = {
        title: title || 'Video Player',
        body: isPlaying ? '▶ Now Playing' : '⏸ Paused',
        data: { type: 'media-control', isPlaying, hasNext, hasPrevious },
        sticky: true,
        categoryIdentifier: 'media-controls',
        color: '#FF0000',
      };

      if (Platform.OS === 'android') {
        notificationContent.channelId = 'media-playback';
        notificationContent.priority = Notifications.AndroidNotificationPriority.LOW;
        
        // Build actions array dynamically based on what's available
        const actions = [];
        
        // Previous button (if available)
        if (hasPrevious) {
          actions.push({
            title: '⏮ Previous',
            identifier: 'previous',
            buttonTitle: 'Previous',
            icon: 'ic_media_previous',
          });
        }
        
        // Play/Pause button
        actions.push({
          title: isPlaying ? '⏸ Pause' : '▶ Play',
          identifier: 'play-pause',
          buttonTitle: isPlaying ? 'Pause' : 'Play',
          icon: isPlaying ? 'ic_media_pause' : 'ic_media_play',
        });
        
        // Next button (if available)
        if (hasNext) {
          actions.push({
            title: '⏭ Next',
            identifier: 'next',
            buttonTitle: 'Next',
            icon: 'ic_media_next',
          });
        }
        
        notificationContent.android = {
          channelId: 'media-playback',
          priority: Notifications.AndroidNotificationPriority.LOW,
          actions: actions,
        };
      }

      if (this.notificationId) {
        await Notifications.dismissNotificationAsync(this.notificationId);
      }

      this.notificationId = await Notifications.scheduleNotificationAsync({
        content: notificationContent,
        trigger: null,
      });

      return this.notificationId;
    } catch (error) {
      console.error('Error showing notification:', error);
      return null;
    }
  }

  async updateNotification(title, isPlaying, hasNext = false, hasPrevious = false) {
    return await this.showMediaNotification(title, isPlaying, hasNext, hasPrevious);
  }

  async dismissNotification() {
    if (this.notificationId) {
      await Notifications.dismissNotificationAsync(this.notificationId);
      this.notificationId = null;
    }
  }

  async setupNotificationCategories() {
    if (Platform.OS === 'ios') {
      await Notifications.setNotificationCategoryAsync('media-controls', [
        {
          identifier: 'previous',
          buttonTitle: '⏮ Previous',
          options: {
            opensAppToForeground: false,
          },
        },
        {
          identifier: 'skip-backward',
          buttonTitle: '⏪ Skip -10s',
          options: {
            opensAppToForeground: false,
          },
        },
        {
          identifier: 'play-pause',
          buttonTitle: '⏯ Play/Pause',
          options: {
            opensAppToForeground: false,
          },
        },
        {
          identifier: 'skip-forward',
          buttonTitle: '⏩ Skip +10s',
          options: {
            opensAppToForeground: false,
          },
        },
        {
          identifier: 'next',
          buttonTitle: '⏭ Next',
          options: {
            opensAppToForeground: false,
          },
        },
      ]);
    }
  }

  addNotificationResponseListener(callback) {
    return Notifications.addNotificationResponseReceivedListener(callback);
  }

  removeNotificationListener(subscription) {
    if (subscription) {
      subscription.remove();
    }
  }
}

export default new NotificationService();

