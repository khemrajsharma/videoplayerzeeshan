import TrackPlayer, { AppKilledPlaybackBehavior, Capability } from 'react-native-track-player';

export const SetupService = async () => {
  let isSetup = false;
  try {
    // this method will only reject if the player has not been setup yet
    await TrackPlayer.getCurrentTrack();
    isSetup = true;
  } catch {
    try {
      await TrackPlayer.setupPlayer();
      await TrackPlayer.updateOptions({
        android: {
          appKilledPlaybackBehavior: AppKilledPlaybackBehavior.StopPlaybackAndRemoveNotification,
          // This is the critical setting for persistent notifications on Android
          stopWithApp: false, 
          alwaysPauseOnInterruption: true,
        },
        capabilities: [
          Capability.Play,
          Capability.Pause,
          Capability.SkipToNext,
          Capability.SkipToPrevious,
          Capability.SeekTo,
        ],
        compactCapabilities: [
          Capability.Play,
          Capability.Pause,
          Capability.SkipToNext,
        ],
        notificationCapabilities: [
          Capability.Play,
          Capability.Pause,
          Capability.SkipToNext,
          Capability.SkipToPrevious,
          Capability.SeekTo,
        ],
        progressUpdateEventInterval: 2,
      });
      isSetup = true;
    } catch (e) {
      if (e.message && e.message.includes('already been initialized')) {
        isSetup = true;
      } else {
        throw e;
      }
    }
  }
  return isSetup;
};

