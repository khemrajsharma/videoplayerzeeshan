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
  ScrollView,
} from 'react-native';
import { Video, ResizeMode, Audio } from 'expo-av';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import TrackPlayer, {
  State,
  Event,
  useTrackPlayerEvents,
  usePlaybackState,
} from 'react-native-track-player';
import { SetupService } from '../services/SetupService';
import M3U8DownloadService from '../services/M3U8DownloadService';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const ModernVideoPlayer = ({
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
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showQualityModal, setShowQualityModal] = useState(false);
  const [showSpeedModal, setShowSpeedModal] = useState(false);
  const [selectedQuality, setSelectedQuality] = useState('Auto (recommended)');
  const [playbackSpeed, setPlaybackSpeed] = useState('Normal');
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [volume, setVolume] = useState(1.0);
  const [isScreenLocked, setIsScreenLocked] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const playbackState = usePlaybackState();

  const [qualities, setQualities] = useState([
    { label: 'Auto (recommended)', value: 'auto', url: null },
  ]);
  const [currentVideoUrl, setCurrentVideoUrl] = useState(videoUri);
  const [isChangingQuality, setIsChangingQuality] = useState(false);

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

  // Sync playback status from Video to TrackPlayer
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

  // Setup and cleanup
  useEffect(() => {
    let isMounted = true;
    const init = async () => {
      try {
        await SetupService();
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

  // Parse M3U8 manifest to extract quality options
  useEffect(() => {
    const parseM3U8Manifest = async () => {
      if (videoUri && videoUri.includes('.m3u8')) {
        try {
          const response = await fetch(videoUri);
          const manifestText = await response.text();

          const qualityOptions = [{ label: 'Auto (recommended)', value: 'auto', url: videoUri }];
          const lines = manifestText.split('\n');

          for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            if (line.startsWith('#EXT-X-STREAM-INF:')) {
              const resolutionMatch = line.match(/RESOLUTION=(\d+x\d+)/);
              const bandwidthMatch = line.match(/BANDWIDTH=(\d+)/);

              if (resolutionMatch && lines[i + 1]) {
                const resolution = resolutionMatch[1];
                const height = resolution.split('x')[1];
                const variantUrl = lines[i + 1].trim();

                // Construct full URL if relative
                const fullUrl = variantUrl.startsWith('http')
                  ? variantUrl
                  : videoUri.substring(0, videoUri.lastIndexOf('/') + 1) + variantUrl;

                qualityOptions.push({
                  label: `${height}p`,
                  value: height,
                  url: fullUrl,
                  bandwidth: bandwidthMatch ? parseInt(bandwidthMatch[1]) : 0,
                });
              }
            }
          }

          // Sort by quality (highest first)
          qualityOptions.sort((a, b) => {
            if (a.value === 'auto') return -1;
            if (b.value === 'auto') return 1;
            return parseInt(b.value) - parseInt(a.value);
          });

          setQualities(qualityOptions);
        } catch (error) {
          console.error('Error parsing M3U8 manifest:', error);
        }
      }
    };

    parseM3U8Manifest();
    setCurrentVideoUrl(videoUri);
  }, [videoUri]);

  // Handle track updates when video changes
  useEffect(() => {
    if (currentVideoUrl) {
      loadTrack();
    }
  }, [currentVideoUrl, videoTitle]);

  // Auto-hide controls when video is playing
  useEffect(() => {
    if (status.isPlaying && status.isLoaded && !isScreenLocked) {
      if (controlsTimeout.current) {
        clearTimeout(controlsTimeout.current);
      }
      controlsTimeout.current = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    } else if (!status.isPlaying) {
      if (controlsTimeout.current) {
        clearTimeout(controlsTimeout.current);
      }
    }

    return () => {
      if (controlsTimeout.current) {
        clearTimeout(controlsTimeout.current);
      }
    };
  }, [status.isPlaying, status.isLoaded, isScreenLocked]);

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
    if (isScreenLocked) return;

    try {
      if (status.isPlaying) {
        await TrackPlayer.pause();
        await videoRef.current.pauseAsync();
      } else {
        await TrackPlayer.play();
        try {
          await videoRef.current.playAsync();
        } catch (avError) {
          console.warn('Expo AV play failed:', avError.message);
        }
      }
    } catch (error) {
      console.error('Error toggling play/pause:', error);
    }
  };

  const handleSeek = async (value) => {
    if (isScreenLocked) return;

    try {
      await videoRef.current.setPositionAsync(value);
    } catch (error) {
      console.error('Error seeking:', error);
    }
  };

  const handleSkipForward = async () => {
    if (isScreenLocked) return;

    if (status.positionMillis && status.durationMillis) {
      const newPosition = Math.min(
        status.positionMillis + 10000,
        status.durationMillis
      );
      await handleSeek(newPosition);
    }
  };

  const handleSkipBackward = async () => {
    if (isScreenLocked) return;

    if (status.positionMillis) {
      const newPosition = Math.max(status.positionMillis - 10000, 0);
      await handleSeek(newPosition);
    }
  };

  const showControlsTemporarily = () => {
    if (isScreenLocked) return;

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
    if (!isScreenLocked) {
      showControlsTemporarily();
    }
  };

  const handleQualityChange = async (quality) => {
    try {
      setIsChangingQuality(true);

      // Save current playback position
      const currentPosition = status.positionMillis || 0;
      const wasPlaying = status.isPlaying;

      // Update quality selection
      setSelectedQuality(quality.label);
      setShowQualityModal(false);
      setShowSettingsModal(false);

      // If not auto, switch to specific quality URL
      if (quality.value !== 'auto' && quality.url) {
        setCurrentVideoUrl(quality.url);

        // Wait a bit for the video to load
        setTimeout(async () => {
          try {
            // Restore playback position
            await videoRef.current?.setPositionAsync(currentPosition);

            // Resume playback if it was playing
            if (wasPlaying) {
              await videoRef.current?.playAsync();
            }
          } catch (error) {
            console.error('Error restoring playback:', error);
          }
          setIsChangingQuality(false);
        }, 500);
      } else {
        // Switch back to auto (main manifest)
        setCurrentVideoUrl(videoUri);

        setTimeout(async () => {
          try {
            await videoRef.current?.setPositionAsync(currentPosition);
            if (wasPlaying) {
              await videoRef.current?.playAsync();
            }
          } catch (error) {
            console.error('Error restoring playback:', error);
          }
          setIsChangingQuality(false);
        }, 500);
      }
    } catch (error) {
      console.error('Error changing quality:', error);
      setIsChangingQuality(false);
    }
  };

  const handleSpeedChange = async (speed) => {
    setPlaybackSpeed(speed.label);
    setShowSpeedModal(false);
    setShowSettingsModal(false);

    try {
      await videoRef.current.setRateAsync(speed.value, true);
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

  const toggleScreenLock = () => {
    setIsScreenLocked(!isScreenLocked);
    setShowSettingsModal(false);
    if (!isScreenLocked) {
      setShowControls(false);
    } else {
      setShowControls(true);
    }
  };

  const toggleFullscreen = async () => {
    try {
      if (isFullscreen) {
        // Exit fullscreen - use CONTAIN mode
        await videoRef.current?.setStatusAsync({
          resizeMode: ResizeMode.CONTAIN,
        });
        setIsFullscreen(false);
      } else {
        // Enter fullscreen - use COVER mode to fill screen
        await videoRef.current?.setStatusAsync({
          resizeMode: ResizeMode.COVER,
        });
        setIsFullscreen(true);
      }
    } catch (error) {
      console.error('Error toggling fullscreen:', error);
    }
  };

  const SettingsMenu = () => (
    <View style={styles.settingsMenu}>
      {/* Drag Handle */}
      <View style={styles.dragHandle} />

      {/* Quality Option */}
      <TouchableOpacity
        style={styles.settingsOption}
        onPress={() => {
          setShowSettingsModal(false);
          setTimeout(() => setShowQualityModal(true), 300);
        }}
      >
        <View style={styles.settingsOptionLeft}>
          <MaterialCommunityIcons name="tune" size={24} color="#fff" />
          <Text style={styles.settingsOptionText}>Quality</Text>
        </View>
        <View style={styles.settingsOptionRight}>
          <Text style={styles.settingsOptionValue}>{selectedQuality}</Text>
          <Ionicons name="chevron-forward" size={20} color="#999" />
        </View>
      </TouchableOpacity>

      {/* Playback Speed Option */}
      <TouchableOpacity
        style={styles.settingsOption}
        onPress={() => {
          setShowSettingsModal(false);
          setTimeout(() => setShowSpeedModal(true), 300);
        }}
      >
        <View style={styles.settingsOptionLeft}>
          <MaterialCommunityIcons name="speedometer" size={24} color="#fff" />
          <Text style={styles.settingsOptionText}>Playback speed</Text>
        </View>
        <View style={styles.settingsOptionRight}>
          <Text style={styles.settingsOptionValue}>{playbackSpeed}</Text>
          <Ionicons name="chevron-forward" size={20} color="#999" />
        </View>
      </TouchableOpacity>

      {/* Captions Option */}
      <TouchableOpacity
        style={styles.settingsOption}
        activeOpacity={0.7}
      >
        <View style={styles.settingsOptionLeft}>
          <MaterialCommunityIcons name="closed-caption" size={24} color="#fff" />
          <Text style={styles.settingsOptionText}>Captions</Text>
        </View>
        <View style={styles.settingsOptionRight}>
          <Text style={styles.settingsOptionValue}>Unavailable</Text>
          <Ionicons name="chevron-forward" size={20} color="#999" />
        </View>
      </TouchableOpacity>

      {/* Fullscreen Option */}
      <TouchableOpacity
        style={styles.settingsOption}
        onPress={() => {
          toggleFullscreen();
          setShowSettingsModal(false);
        }}
      >
        <View style={styles.settingsOptionLeft}>
          <Ionicons name={isFullscreen ? "contract" : "expand"} size={24} color="#fff" />
          <Text style={styles.settingsOptionText}>
            {isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
          </Text>
        </View>
      </TouchableOpacity>

      {/* Lock Screen Option */}
      <TouchableOpacity
        style={styles.settingsOption}
        onPress={toggleScreenLock}
      >
        <View style={styles.settingsOptionLeft}>
          <Ionicons name={isScreenLocked ? "lock-closed" : "lock-open"} size={24} color="#fff" />
          <Text style={styles.settingsOptionText}>Lock screen</Text>
        </View>
      </TouchableOpacity>

      {/* More Option */}
      <TouchableOpacity
        style={styles.settingsOption}
        activeOpacity={0.7}
      >
        <View style={styles.settingsOptionLeft}>
          <Ionicons name="settings-outline" size={24} color="#fff" />
          <Text style={styles.settingsOptionText}>More</Text>
        </View>
        <View style={styles.settingsOptionRight}>
          <Ionicons name="chevron-forward" size={20} color="#999" />
        </View>
      </TouchableOpacity>
    </View>
  );

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
          source={{ uri: currentVideoUrl }}
          style={styles.video}
          resizeMode={isFullscreen ? ResizeMode.COVER : ResizeMode.CONTAIN}
          shouldPlay
          onPlaybackStatusUpdate={setStatus}
          useNativeControls={false}
          volume={volume}
          rate={speeds.find(s => s.label === playbackSpeed)?.value || 1.0}
          progressUpdateIntervalMillis={500}
          isLooping={false}
          isMuted={false}
        />

        {/* Screen Lock Indicator */}
        {isScreenLocked && (
          <View style={styles.lockIndicator}>
            <TouchableOpacity
              style={styles.unlockButton}
              onPress={toggleScreenLock}
            >
              <Ionicons name="lock-closed" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
        )}

        {showControls && !isScreenLocked && (
          <>
            {/* Top Bar */}
            <View style={styles.topBar}>
              <TouchableOpacity onPress={onClose} style={styles.topButton}>
                <Ionicons name="chevron-down" size={32} color="white" />
              </TouchableOpacity>

              <View style={styles.topRightButtons}>
                <TouchableOpacity
                  onPress={handleDownload}
                  style={styles.topButton}
                  disabled={isDownloading}
                >
                  {isDownloading ? (
                    <ActivityIndicator size="small" color="white" />
                  ) : (
                    <Ionicons name="arrow-down-circle-outline" size={28} color="white" />
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => setShowSettingsModal(true)}
                  style={styles.topButton}
                >
                  <Ionicons name="settings-outline" size={28} color="white" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Center Controls */}
            <View style={styles.centerControls}>
              <TouchableOpacity
                onPress={handleSkipBackward}
                style={styles.skipButton}
              >
                <Ionicons name="play-skip-back" size={26} color="white" />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handlePlayPause}
                style={styles.playPauseButton}
              >
                <Ionicons
                  name={status.isPlaying ? 'pause' : 'play'}
                  size={44}
                  color="white"
                />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleSkipForward}
                style={styles.skipButton}
              >
                <Ionicons name="play-skip-forward" size={26} color="white" />
              </TouchableOpacity>
            </View>

            {/* Bottom Controls */}
            <View style={styles.bottomControls}>
              {/* Time Display and Fullscreen Button Row */}
              <View style={styles.timeAndButtonRow}>
                <Text style={styles.timeText}>
                  {formatTime(status.positionMillis || 0)} / {formatTime(status.durationMillis || 0)}
                </Text>
                <TouchableOpacity
                  style={styles.bottomButton}
                  onPress={toggleFullscreen}
                >
                  <Ionicons
                    name={isFullscreen ? "contract" : "expand"}
                    size={24}
                    color="white"
                  />
                </TouchableOpacity>
              </View>

              {/* Progress Bar */}
              <View style={styles.progressBarContainer}>
                <Slider
                  style={styles.progressSlider}
                  value={status.positionMillis || 0}
                  minimumValue={0}
                  maximumValue={status.durationMillis || 1}
                  onSlidingComplete={handleSeek}
                  minimumTrackTintColor="#E50914"
                  maximumTrackTintColor="rgba(255,255,255,0.3)"
                  thumbTintColor="#E50914"
                />
              </View>

            </View>
          </>
        )}

        {/* Loading Indicator */}
        {((status.isBuffering || !status.isLoaded || isChangingQuality) && !status.isPlaying) && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#E50914" />
            {isChangingQuality && (
              <Text style={styles.loadingText}>Changing quality...</Text>
            )}
          </View>
        )}
      </TouchableOpacity>

      {/* Settings Modal */}
      <Modal
        visible={showSettingsModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowSettingsModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowSettingsModal(false)}
        >
          <TouchableOpacity
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
          >
            <SettingsMenu />
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

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
          <TouchableOpacity
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
            style={styles.selectionModal}
          >
            <View style={styles.dragHandle} />
            <Text style={styles.modalTitle}>Quality</Text>
            <ScrollView style={styles.optionsList}>
              {qualities.map((item) => (
                <TouchableOpacity
                  key={item.value}
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
                    <Ionicons name="checkmark" size={24} color="#E50914" />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </TouchableOpacity>
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
          <TouchableOpacity
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
            style={styles.selectionModal}
          >
            <View style={styles.dragHandle} />
            <Text style={styles.modalTitle}>Playback speed</Text>
            <ScrollView style={styles.optionsList}>
              {speeds.map((item) => (
                <TouchableOpacity
                  key={item.value.toString()}
                  style={[
                    styles.option,
                    playbackSpeed === item.label && styles.optionSelected,
                  ]}
                  onPress={() => handleSpeedChange(item)}
                >
                  <Text
                    style={[
                      styles.optionText,
                      playbackSpeed === item.label && styles.optionTextSelected,
                    ]}
                  >
                    {item.label}
                  </Text>
                  {playbackSpeed === item.label && (
                    <Ionicons name="checkmark" size={24} color="#E50914" />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </TouchableOpacity>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 16,
    zIndex: 10,
  },
  topRightButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  topButton: {
    padding: 8,
  },
  centerControls: {
    position: 'absolute',
    top: '50%',
    left: 0,
    right: 0,
    transform: [{ translateY: -50 }],
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 50,
  },
  skipButton: {
    width: 60,
    height: 60,
    borderRadius: 35,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  playPauseButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomControls: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingBottom: 20,
    zIndex: 10,
  },
  timeAndButtonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 10,
    marginBottom: 8,
  },
  timeText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  progressBarContainer: {
    // paddingHorizontal: 16,
  },
  progressSlider: {
    width: '100%',
    height: 4,
  },
  bottomButton: {
    padding: 8,
  },
  loadingContainer: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -20 }, { translateY: -20 }],
    alignItems: 'center',
  },
  loadingText: {
    color: 'white',
    fontSize: 14,
    marginTop: 12,
    fontWeight: '500',
  },
  lockIndicator: {
    position: 'absolute',
    left: 20,
    top: '50%',
    transform: [{ translateY: -30 }],
  },
  unlockButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'flex-end',
  },
  settingsMenu: {
    backgroundColor: '#2C2C2C',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 30,
  },
  dragHandle: {
    width: 40,
    height: 5,
    backgroundColor: '#555',
    borderRadius: 3,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 20,
  },
  settingsOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 18,
    paddingHorizontal: 24,
    borderBottomWidth: 0.5,
    borderBottomColor: '#444',
  },
  settingsOptionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  settingsOptionText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '400',
  },
  settingsOptionRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  settingsOptionValue: {
    color: '#999',
    fontSize: 14,
  },
  selectionModal: {
    backgroundColor: '#2C2C2C',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 30,
    maxHeight: '70%',
  },
  modalTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: '600',
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  optionsList: {
    paddingHorizontal: 24,
  },
  option: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: '#3C3C3C',
  },
  optionSelected: {
    backgroundColor: '#444',
  },
  optionText: {
    color: '#fff',
    fontSize: 16,
  },
  optionTextSelected: {
    color: '#fff',
    fontWeight: '600',
  },
});

export default ModernVideoPlayer;

