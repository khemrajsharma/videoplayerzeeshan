import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  Dimensions,
  Modal,
  FlatList,
  ActivityIndicator,
  Alert,
  StatusBar,
} from 'react-native';
import { Video, ResizeMode, Audio } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import { LinearGradient } from 'expo-linear-gradient';
import TrackPlayer, { 
  State, 
  Event, 
  useTrackPlayerEvents,
  usePlaybackState,
} from 'react-native-track-player';
import { SetupService } from '../services/SetupService';
import M3U8DownloadService from '../services/M3U8DownloadService';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const EnhancedVideoPlayer = ({ 
  videoUri, 
  videoTitle = 'Video', 
  onClose,
  onNext = null,
  onPrevious = null,
  hasNext = false,
  hasPrevious = false 
}) => {
  const videoRef = useRef(null);
  const [status, setStatus] = useState({});
  const [showControls, setShowControls] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showQualityModal, setShowQualityModal] = useState(false);
  const [showSpeedModal, setShowSpeedModal] = useState(false);
  const [selectedQuality, setSelectedQuality] = useState('Auto');
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [volume, setVolume] = useState(1.0);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  
  const playbackState = usePlaybackState();

  const [qualities, setQualities] = useState([
    { label: 'Auto', value: 'auto', bandwidth: 0 },
    { label: '1080p', value: '1080', bandwidth: 5000000 },
    { label: '720p', value: '720', bandwidth: 2500000 },
    { label: '480p', value: '480', bandwidth: 1000000 },
    { label: '360p', value: '360', bandwidth: 500000 },
  ]);

  const [speeds, setPlaybackSpeeds] = useState([
    { label: '0.25x', value: 0.25 },
    { label: '0.5x', value: 0.5 },
    { label: '0.75x', value: 0.75 },
    { label: 'Normal', value: 1.0 },
    { label: '1.25x', value: 1.25 },
    { label: '1.5x', value: 1.5 },
    { label: '1.75x', value: 1.75 },
    { label: '2x', value: 2.0 },
  ]);

  let controlsTimeout = useRef(null);

  // Sync TrackPlayer Remote Events
  useTrackPlayerEvents([Event.RemotePlay, Event.RemotePause, Event.RemoteNext, Event.RemotePrevious, Event.RemoteSeek], async (event) => {
    if (event.type === Event.RemotePlay) {
      await videoRef.current?.playAsync();
      await TrackPlayer.play();
    } else if (event.type === Event.RemotePause) {
      await videoRef.current?.pauseAsync();
      await TrackPlayer.pause();
    } else if (event.type === Event.RemoteNext) {
      if (onNext) onNext();
    } else if (event.type === Event.RemotePrevious) {
      if (onPrevious) onPrevious();
    } else if (event.type === Event.RemoteSeek) {
      await videoRef.current?.setPositionAsync(event.position * 1000);
      await TrackPlayer.seekTo(event.position);
    }
  });

  // Sync playback status from Video to TrackPlayer (e.g. buffering, finish)
  useEffect(() => {
    const syncState = async () => {
      if (status.didJustFinish) {
        await TrackPlayer.pause();
        await TrackPlayer.seekTo(0);
        if (onNext && hasNext) {
          onNext();
        }
      }
    };
    syncState();
  }, [status.didJustFinish]);

  // One-time setup and cleanup for the player component
  useEffect(() => {
    let isMounted = true;
    const init = async () => {
      try {
        await SetupService();
        // If the videoUri is already available when we init, load it now
        if (isMounted && videoUri) {
          loadTrack();
        }
      } catch (error) {
        console.error('SetupService error:', error);
      }
    };
    init();

    return () => {
      isMounted = false;
      const destroy = async () => {
        if (controlsTimeout.current) {
          clearTimeout(controlsTimeout.current);
        }
        try {
          // Check if player is setup before resetting to avoid error
          await TrackPlayer.reset();
        } catch (e) {
          // Ignore error if player wasn't setup
        }
      };
      destroy();
    };
  }, []);

  const loadTrack = async () => {
    try {
      // Ensure player is setup before calling any methods
      // We can re-call SetupService safely as it checks internal state
      await SetupService();

      await TrackPlayer.reset();
      
      await TrackPlayer.add({
        id: videoUri,
        url: videoUri,
        title: videoTitle,
        artist: 'Video Player',
        artwork: 'https://via.placeholder.com/300', 
      });
      
      await TrackPlayer.setVolume(0);
      await TrackPlayer.play();
    } catch (error) {
      console.error('TrackPlayer load error:', error);
    }
  };

  // Handle track updates when video changes
  useEffect(() => {
    if (videoUri) {
      loadTrack();
    }
  }, [videoUri, videoTitle]);

  // Auto-hide controls when video is playing
  useEffect(() => {
    if (status.isPlaying && status.isLoaded) {
      // Start the auto-hide timer
      if (controlsTimeout.current) {
        clearTimeout(controlsTimeout.current);
      }
      controlsTimeout.current = setTimeout(() => {
        setShowControls(false);
      }, 3000); // Hide after 3 seconds of playback
    } else if (!status.isPlaying) {
      // Keep controls visible when paused
      if (controlsTimeout.current) {
        clearTimeout(controlsTimeout.current);
      }
    }
    
    return () => {
      if (controlsTimeout.current) {
        clearTimeout(controlsTimeout.current);
      }
    };
  }, [status.isPlaying, status.isLoaded]);

  const setupAudioMode = async () => {
    try {
      await Audio.setAudioModeAsync({
        staysActiveInBackground: true,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
        allowsRecordingIOS: false,
        interruptionModeIOS: 1, // DoNotMix
        interruptionModeAndroid: 2, // DuckOthers (was 1: DoNotMix)
      });
    } catch (error) {
      console.log('Error setting audio mode:', error);
    }
  };

  const formatTime = (millis) => {
    if (!millis) return '0:00';
    const totalSeconds = Math.floor(millis / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handlePlayPause = async () => {
    try {
      if (status.isPlaying) {
        // Pause sequence
        await TrackPlayer.pause();
        await videoRef.current.pauseAsync();
      } else {
        // Play sequence
        await TrackPlayer.play();
        try {
          await videoRef.current.playAsync();
        } catch (avError) {
          console.warn('Expo AV play failed (likely backgrounded):', avError.message);
          // We ignore this error because TrackPlayer is already playing (handling background audio)
          // and expo-av will resume automatically when foregrounded if we leave it in 'play' intent
        }
      }
    } catch (error) {
      console.error('Error toggling play/pause:', error);
    }
  };

  const handleSeek = async (value) => {
    try {
      await videoRef.current.setPositionAsync(value);
    } catch (error) {
      console.error('Error seeking:', error);
    }
  };

  const handleSkipForward = async () => {
    if (status.positionMillis && status.durationMillis) {
      const newPosition = Math.min(
        status.positionMillis + 10000,
        status.durationMillis
      );
      await handleSeek(newPosition);
    }
  };

  const handleSkipBackward = async () => {
    if (status.positionMillis) {
      const newPosition = Math.max(status.positionMillis - 10000, 0);
      await handleSeek(newPosition);
    }
  };

  const showControlsTemporarily = () => {
    setShowControls(true);
    if (controlsTimeout.current) {
      clearTimeout(controlsTimeout.current);
    }
    controlsTimeout.current = setTimeout(() => {
      if (status.isPlaying) {
        setShowControls(false);
      }
    }, 4000);
  };

  const handleScreenPress = () => {
    showControlsTemporarily();
  };

  const handleQualityChange = async (quality) => {
    setSelectedQuality(quality.label);
    setShowQualityModal(false);
    
    // In a real implementation, you would switch to a different stream URL
    // For now, we'll just show a message
    Alert.alert('Quality Changed', `Video quality set to ${quality.label}`);
    
    // You would typically reload the video with the new quality URL
    // await videoRef.current.loadAsync({ uri: newQualityUrl });
  };

  const handleSpeedChange = async (speed) => {
    setPlaybackSpeed(speed.value);
    setShowSpeedModal(false);
    
    try {
      await videoRef.current.setRateAsync(speed.value, true);
      Alert.alert('Speed Changed', `Playback speed set to ${speed.label}`);
    } catch (error) {
      console.error('Error changing playback speed:', error);
    }
  };

  const handleVolumeChange = async (value) => {
    setVolume(value);
    try {
      await videoRef.current.setVolumeAsync(value);
    } catch (error) {
      console.error('Error changing volume:', error);
    }
  };

  const handleDownload = async () => {
    try {
      setIsDownloading(true);
      setDownloadProgress(0);

      await M3U8DownloadService.downloadVideo(
        videoUri,
        (progress) => {
          setDownloadProgress(progress);
        },
        videoTitle
      );

      setIsDownloading(false);
      Alert.alert('Success', 'Video downloaded successfully!');
    } catch (error) {
      setIsDownloading(false);
      Alert.alert('Download Failed', error.message || 'Failed to download video');
      console.error('Download error:', error);
    }
  };

  const handleReplay = async () => {
    try {
      await videoRef.current.replayAsync();
    } catch (error) {
      console.error('Error replaying:', error);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar hidden />
      
      <TouchableOpacity
        style={styles.videoContainer}
        activeOpacity={1}
        onPress={handleScreenPress}
      >
        <Video
          ref={videoRef}
          source={{ uri: videoUri }}
          style={styles.video}
          resizeMode={ResizeMode.CONTAIN}
          shouldPlay
          onPlaybackStatusUpdate={setStatus}
          useNativeControls={false}
          volume={volume}
          rate={playbackSpeed}
          progressUpdateIntervalMillis={500}
          // Enable background playback with media controls
          isLooping={false}
          isMuted={false}
        />

        {showControls && (
          <>
            {/* Top Bar with Gradient */}
            <LinearGradient
              colors={['rgba(0,0,0,0.7)', 'transparent']}
              style={styles.topBar}
            >
              <TouchableOpacity onPress={onClose} style={styles.iconButton}>
                <Ionicons name="chevron-down" size={28} color="white" />
              </TouchableOpacity>
              
              <View style={styles.titleContainer}>
                <Text style={styles.videoTitle} numberOfLines={1}>
                  {videoTitle}
                </Text>
              </View>

              <View style={styles.topRightButtons}>
                <TouchableOpacity
                  onPress={() => setShowSpeedModal(true)}
                  style={styles.iconButton}
                >
                  <Text style={styles.speedText}>{playbackSpeed}x</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  onPress={() => setShowQualityModal(true)}
                  style={styles.iconButton}
                >
                  <Ionicons name="settings-outline" size={24} color="white" />
                </TouchableOpacity>
                
                <TouchableOpacity
                  onPress={handleDownload}
                  style={styles.iconButton}
                  disabled={isDownloading}
                >
                  {isDownloading ? (
                    <ActivityIndicator size="small" color="white" />
                  ) : (
                    <Ionicons name="download-outline" size={24} color="white" />
                  )}
                </TouchableOpacity>
              </View>
            </LinearGradient>

            {/* Center Controls - YouTube Style */}
            <View style={styles.centerControls}>
              <TouchableOpacity
                onPress={handleSkipBackward}
                style={styles.skipButton}
              >
                <View style={styles.skipButtonInner}>
                  <Ionicons name="play-back" size={32} color="white" />
                  <Text style={styles.skipButtonText}>10</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handlePlayPause}
                style={styles.playPauseButton}
              >
                <Ionicons
                  name={status.isPlaying ? 'pause' : 'play'}
                  size={40}
                  color="white"
                />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleSkipForward}
                style={styles.skipButton}
              >
                <View style={styles.skipButtonInner}>
                  <Ionicons name="play-forward" size={32} color="white" />
                  <Text style={styles.skipButtonText}>10</Text>
                </View>
              </TouchableOpacity>
            </View>

            {/* Bottom Controls with Gradient */}
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.7)']}
              style={styles.bottomControls}
            >
              {isDownloading && (
                <View style={styles.downloadProgress}>
                  <Text style={styles.downloadText}>
                    Downloading: {Math.round(downloadProgress * 100)}%
                  </Text>
                  <View style={styles.progressBar}>
                    <View
                      style={[
                        styles.progressFill,
                        { width: `${downloadProgress * 100}%` },
                      ]}
                    />
                  </View>
                </View>
              )}

              {/* YouTube-style Progress Bar */}
              <View style={styles.youtubeProgressContainer}>
                <Slider
                  style={styles.youtubeSlider}
                  value={status.positionMillis || 0}
                  minimumValue={0}
                  maximumValue={status.durationMillis || 1}
                  onSlidingComplete={handleSeek}
                  minimumTrackTintColor="#FF0000"
                  maximumTrackTintColor="rgba(255,255,255,0.4)"
                  thumbTintColor="#FF0000"
                />
              </View>

              {/* YouTube-style Bottom Row */}
              <View style={styles.youtubeBottomRow}>
                <View style={styles.youtubeLeftControls}>
                  <TouchableOpacity 
                    style={styles.youtubeButton}
                    onPress={handlePlayPause}
                  >
                    <Ionicons 
                      name={status.isPlaying ? 'pause' : 'play'} 
                      size={28} 
                      color="white" 
                    />
                  </TouchableOpacity>

                  <TouchableOpacity 
                    style={styles.youtubeButton}
                    onPress={handleSkipForward}
                  >
                    <Ionicons name="play-forward" size={24} color="white" />
                  </TouchableOpacity>

                  <TouchableOpacity 
                    style={styles.youtubeButton}
                    onPress={() => setShowVolumeSlider(!showVolumeSlider)}
                  >
                    <Ionicons 
                      name={volume === 0 ? 'volume-mute' : 'volume-high'} 
                      size={24} 
                      color="white" 
                    />
                  </TouchableOpacity>

                  <Text style={styles.youtubeTimeText}>
                    {formatTime(status.positionMillis || 0)} / {formatTime(status.durationMillis || 0)}
                  </Text>
                </View>

                <View style={styles.youtubeRightControls}>
                  <TouchableOpacity 
                    style={styles.youtubeButton}
                    onPress={() => setShowQualityModal(true)}
                  >
                    <Ionicons name="settings-outline" size={24} color="white" />
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.youtubeButton}
                    onPress={() => setIsFullscreen(!isFullscreen)}
                  >
                    <Ionicons
                      name={isFullscreen ? 'contract' : 'expand'}
                      size={24}
                      color="white"
                    />
                  </TouchableOpacity>
                </View>
              </View>
            </LinearGradient>
          </>
        )}

        {/* Loading Indicator - Only show when buffering or initial load */}
        {(status.isBuffering || !status.isLoaded) && !status.isPlaying && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#FF0000" />
          </View>
        )}
      </TouchableOpacity>

      {/* Quality Selection Modal */}
      <Modal
        visible={showQualityModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowQualityModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowQualityModal(false)}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Video Quality</Text>
              <TouchableOpacity onPress={() => setShowQualityModal(false)}>
                <Ionicons name="close" size={28} color="white" />
              </TouchableOpacity>
            </View>
            <FlatList
              data={qualities}
              keyExtractor={(item) => item.value}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.option,
                    selectedQuality === item.label && styles.optionSelected,
                  ]}
                  onPress={() => handleQualityChange(item)}
                >
                  <Text
                    style={[
                      styles.optionText,
                      selectedQuality === item.label && styles.optionTextSelected,
                    ]}
                  >
                    {item.label}
                  </Text>
                  {selectedQuality === item.label && (
                    <Ionicons name="checkmark-circle" size={24} color="#FF0000" />
                  )}
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Speed Selection Modal */}
      <Modal
        visible={showSpeedModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowSpeedModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowSpeedModal(false)}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Playback Speed</Text>
              <TouchableOpacity onPress={() => setShowSpeedModal(false)}>
                <Ionicons name="close" size={28} color="white" />
              </TouchableOpacity>
            </View>
            <FlatList
              data={speeds}
              keyExtractor={(item) => item.value.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.option,
                    playbackSpeed === item.value && styles.optionSelected,
                  ]}
                  onPress={() => handleSpeedChange(item)}
                >
                  <Text
                    style={[
                      styles.optionText,
                      playbackSpeed === item.value && styles.optionTextSelected,
                    ]}
                  >
                    {item.label}
                  </Text>
                  {playbackSpeed === item.value && (
                    <Ionicons name="checkmark-circle" size={24} color="#FF0000" />
                  )}
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  videoContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  video: {
    width: '100%',
    height: '100%',
  },
  topBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingTop: 50,
    zIndex: 10,
  },
  titleContainer: {
    flex: 1,
    marginHorizontal: 12,
  },
  videoTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  topRightButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  speedText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  centerControls: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -150 }, { translateY: -40 }],
    flexDirection: 'row',
    alignItems: 'center',
    gap: 60,
  },
  skipButton: {
    width: 70,
    height: 70,
    alignItems: 'center',
    justifyContent: 'center',
  },
  skipButtonInner: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  skipButtonText: {
    position: 'absolute',
    color: 'white',
    fontSize: 11,
    fontWeight: 'bold',
    bottom: 2,
  },
  playPauseButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.5)',
  },
  bottomControls: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingBottom: 10,
    zIndex: 10,
  },
  youtubeProgressContainer: {
    paddingHorizontal: 12,
    paddingTop: 8,
  },
  youtubeSlider: {
    width: '100%',
    height: 3,
  },
  youtubeBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  youtubeLeftControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  youtubeRightControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  youtubeButton: {
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  youtubeTimeText: {
    color: 'white',
    fontSize: 13,
    fontWeight: '500',
    marginLeft: 4,
  },
  iconButton: {
    padding: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  downloadProgress: {
    marginBottom: 12,
  },
  downloadText: {
    color: 'white',
    fontSize: 13,
    marginBottom: 6,
    fontWeight: '500',
  },
  progressBar: {
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FF0000',
  },
  loadingContainer: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -20 }, { translateY: -20 }],
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#1a1a1a',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '60%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    color: 'white',
    fontSize: 22,
    fontWeight: 'bold',
  },
  option: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 10,
    marginBottom: 8,
    backgroundColor: '#2a2a2a',
  },
  optionSelected: {
    backgroundColor: 'rgba(255,0,0,0.15)',
    borderWidth: 1,
    borderColor: '#FF0000',
  },
  optionText: {
    color: '#ccc',
    fontSize: 16,
  },
  optionTextSelected: {
    color: '#FF0000',
    fontWeight: 'bold',
  },
});

export default EnhancedVideoPlayer;

