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
} from 'react-native';
import { Video, ResizeMode } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const VideoPlayer = ({ videoUri, onClose }) => {
  const videoRef = useRef(null);
  const [status, setStatus] = useState({});
  const [showControls, setShowControls] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showQualityModal, setShowQualityModal] = useState(false);
  const [selectedQuality, setSelectedQuality] = useState('Auto');
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [qualities, setQualities] = useState([
    { label: 'Auto', value: 'auto' },
    { label: '1080p', value: '1080' },
    { label: '720p', value: '720' },
    { label: '480p', value: '480' },
    { label: '360p', value: '360' },
  ]);

  let controlsTimeout = useRef(null);

  useEffect(() => {
    setupAudioMode();
    return () => {
      if (controlsTimeout.current) {
        clearTimeout(controlsTimeout.current);
      }
    };
  }, []);

  const setupAudioMode = async () => {
    try {
      const { Audio } = require('expo-av');
      await Audio.setAudioModeAsync({
        staysActiveInBackground: true,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });
    } catch (error) {
      console.log('Error setting audio mode:', error);
    }
  };

  const formatTime = (millis) => {
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
    if (status.isPlaying) {
      await videoRef.current.pauseAsync();
    } else {
      await videoRef.current.playAsync();
    }
  };

  const handleSeek = async (value) => {
    await videoRef.current.setPositionAsync(value);
  };

  const handleSkipForward = async () => {
    if (status.positionMillis && status.durationMillis) {
      const newPosition = Math.min(
        status.positionMillis + 10000,
        status.durationMillis
      );
      await videoRef.current.setPositionAsync(newPosition);
    }
  };

  const handleSkipBackward = async () => {
    if (status.positionMillis) {
      const newPosition = Math.max(status.positionMillis - 10000, 0);
      await videoRef.current.setPositionAsync(newPosition);
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
    }, 3000);
  };

  const handleScreenPress = () => {
    showControlsTemporarily();
  };

  const handleQualityChange = (quality) => {
    setSelectedQuality(quality.label);
    setShowQualityModal(false);
    Alert.alert('Quality Changed', `Video quality set to ${quality.label}`);
  };

  const downloadM3U8 = async () => {
    try {
      // Request permissions
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Storage permission is required to download videos');
        return;
      }

      setIsDownloading(true);
      setDownloadProgress(0);

      // For m3u8 streams, we'll need to parse and download segments
      // This is a simplified version - actual implementation would parse m3u8
      const fileName = `video_${Date.now()}.mp4`;
      const fileUri = FileSystem.documentDirectory + fileName;

      const downloadResumable = FileSystem.createDownloadResumable(
        videoUri,
        fileUri,
        {},
        (downloadProgress) => {
          const progress =
            downloadProgress.totalBytesWritten /
            downloadProgress.totalBytesExpectedToWrite;
          setDownloadProgress(progress);
        }
      );

      const { uri } = await downloadResumable.downloadAsync();
      
      // Save to media library
      const asset = await MediaLibrary.createAssetAsync(uri);
      await MediaLibrary.createAlbumAsync('VideoPlayer', asset, false);

      setIsDownloading(false);
      Alert.alert('Success', 'Video downloaded successfully!');
    } catch (error) {
      setIsDownloading(false);
      Alert.alert('Download Failed', error.message);
      console.error('Download error:', error);
    }
  };

  return (
    <View style={styles.container}>
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
        />

        {showControls && (
          <>
            {/* Top Bar */}
            <View style={styles.topBar}>
              <TouchableOpacity onPress={onClose} style={styles.iconButton}>
                <Ionicons name="chevron-down" size={28} color="white" />
              </TouchableOpacity>
              <View style={styles.topRightButtons}>
                <TouchableOpacity
                  onPress={() => setShowQualityModal(true)}
                  style={styles.iconButton}
                >
                  <Ionicons name="settings-outline" size={24} color="white" />
                  <Text style={styles.qualityText}>{selectedQuality}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={downloadM3U8}
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
            </View>

            {/* Center Controls */}
            <View style={styles.centerControls}>
              <TouchableOpacity
                onPress={handleSkipBackward}
                style={styles.controlButton}
              >
                <Ionicons name="play-back" size={40} color="white" />
                <Text style={styles.skipText}>10s</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handlePlayPause}
                style={[styles.controlButton, styles.playButton]}
              >
                <Ionicons
                  name={status.isPlaying ? 'pause' : 'play'}
                  size={50}
                  color="white"
                />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleSkipForward}
                style={styles.controlButton}
              >
                <Ionicons name="play-forward" size={40} color="white" />
                <Text style={styles.skipText}>10s</Text>
              </TouchableOpacity>
            </View>

            {/* Bottom Controls */}
            <View style={styles.bottomControls}>
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

              <View style={styles.progressContainer}>
                <Text style={styles.timeText}>
                  {formatTime(status.positionMillis || 0)}
                </Text>
                <Slider
                  style={styles.slider}
                  value={status.positionMillis || 0}
                  minimumValue={0}
                  maximumValue={status.durationMillis || 0}
                  onSlidingComplete={handleSeek}
                  minimumTrackTintColor="#FF0000"
                  maximumTrackTintColor="rgba(255,255,255,0.3)"
                  thumbTintColor="#FF0000"
                />
                <Text style={styles.timeText}>
                  {formatTime(status.durationMillis || 0)}
                </Text>
              </View>

              <View style={styles.bottomButtons}>
                <TouchableOpacity style={styles.iconButton}>
                  <Ionicons name="volume-high" size={24} color="white" />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setIsFullscreen(!isFullscreen)}
                  style={styles.iconButton}
                >
                  <Ionicons
                    name={isFullscreen ? 'contract' : 'expand'}
                    size={24}
                    color="white"
                  />
                </TouchableOpacity>
              </View>
            </View>
          </>
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
            <Text style={styles.modalTitle}>Video Quality</Text>
            <FlatList
              data={qualities}
              keyExtractor={(item) => item.value}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.qualityOption,
                    selectedQuality === item.label && styles.qualityOptionSelected,
                  ]}
                  onPress={() => handleQualityChange(item)}
                >
                  <Text
                    style={[
                      styles.qualityOptionText,
                      selectedQuality === item.label &&
                        styles.qualityOptionTextSelected,
                    ]}
                  >
                    {item.label}
                  </Text>
                  {selectedQuality === item.label && (
                    <Ionicons name="checkmark" size={24} color="#FF0000" />
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
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingTop: 50,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  topRightButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  centerControls: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -120 }, { translateY: -40 }],
    flexDirection: 'row',
    alignItems: 'center',
    gap: 40,
  },
  controlButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  playButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 50,
    width: 80,
    height: 80,
  },
  skipText: {
    color: 'white',
    fontSize: 12,
    marginTop: 4,
    fontWeight: 'bold',
  },
  bottomControls: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  slider: {
    flex: 1,
    marginHorizontal: 8,
  },
  timeText: {
    color: 'white',
    fontSize: 12,
    minWidth: 45,
  },
  bottomButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  iconButton: {
    padding: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  qualityText: {
    color: 'white',
    fontSize: 12,
  },
  downloadProgress: {
    marginBottom: 12,
  },
  downloadText: {
    color: 'white',
    fontSize: 12,
    marginBottom: 4,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#282828',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '50%',
  },
  modalTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  qualityOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  qualityOptionSelected: {
    backgroundColor: 'rgba(255,0,0,0.1)',
  },
  qualityOptionText: {
    color: 'white',
    fontSize: 16,
  },
  qualityOptionTextSelected: {
    color: '#FF0000',
    fontWeight: 'bold',
  },
});

export default VideoPlayer;

