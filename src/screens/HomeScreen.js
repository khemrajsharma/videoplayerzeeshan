import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  TextInput,
  SafeAreaView,
  StatusBar,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import EnhancedVideoPlayer from '../components/EnhancedVideoPlayer';

const HomeScreen = () => {
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddVideo, setShowAddVideo] = useState(false);
  const [customVideoUrl, setCustomVideoUrl] = useState('');

  // Sample video data - in a real app, this would come from an API
  const [videos, setVideos] = useState([
    {
      id: '1',
      title: 'Sample HLS Stream',
      thumbnail: 'https://picsum.photos/400/225?random=1',
      duration: '10:30',
      views: '1.2M',
      uploadTime: '2 days ago',
      channel: 'Tech Channel',
      url: 'https://demo.unified-streaming.com/k8s/features/stable/video/tears-of-steel/tears-of-steel.ism/.m3u8',
    },
    {
      id: '2',
      title: 'Big Buck Bunny',
      thumbnail: 'https://picsum.photos/400/225?random=2',
      duration: '9:56',
      views: '850K',
      uploadTime: '5 days ago',
      channel: 'Animation Studio',
      url: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    },
    {
      id: '3',
      title: 'Elephant Dream',
      thumbnail: 'https://picsum.photos/400/225?random=3',
      duration: '10:53',
      views: '2.5M',
      uploadTime: '1 week ago',
      channel: 'Orange Films',
      url: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    },
    {
      id: '4',
      title: 'Sintel Movie',
      thumbnail: 'https://picsum.photos/400/225?random=4',
      duration: '14:48',
      views: '3.2M',
      uploadTime: '2 weeks ago',
      channel: 'Blender Foundation',
      url: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
    },
  ]);

  const handleVideoPress = (video) => {
    const index = videos.findIndex(v => v.id === video.id);
    setCurrentVideoIndex(index);
    setSelectedVideo(video);
  };

  const handleClosePlayer = () => {
    setSelectedVideo(null);
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

  const handleAddCustomVideo = () => {
    if (customVideoUrl.trim()) {
      const newVideo = {
        id: Date.now().toString(),
        title: 'Custom Video',
        thumbnail: 'https://picsum.photos/400/225?random=' + Date.now(),
        duration: '0:00',
        views: '0',
        uploadTime: 'Just now',
        channel: 'My Videos',
        url: customVideoUrl.trim(),
      };
      setVideos([newVideo, ...videos]);
      setCustomVideoUrl('');
      setShowAddVideo(false);
    }
  };

  const renderVideoCard = ({ item }) => (
    <TouchableOpacity
      style={styles.videoCard}
      onPress={() => handleVideoPress(item)}
      activeOpacity={0.8}
    >
      <View style={styles.thumbnailContainer}>
        <Image source={{ uri: item.thumbnail }} style={styles.thumbnail} />
        <View style={styles.durationBadge}>
          <Text style={styles.durationText}>{item.duration}</Text>
        </View>
      </View>
      
      <View style={styles.videoInfo}>
        <View style={styles.channelAvatar}>
          <Ionicons name="person-circle" size={36} color="#666" />
        </View>
        
        <View style={styles.videoDetails}>
          <Text style={styles.videoTitle} numberOfLines={2}>
            {item.title}
          </Text>
          <Text style={styles.videoMeta}>
            {item.channel} • {item.views} views • {item.uploadTime}
          </Text>
        </View>
        
        <TouchableOpacity style={styles.moreButton}>
          <Ionicons name="ellipsis-vertical" size={20} color="#ccc" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  if (selectedVideo) {
    return (
      <EnhancedVideoPlayer
        videoUri={selectedVideo.url}
        videoTitle={selectedVideo.title}
        onClose={handleClosePlayer}
        onNext={handleNext}
        onPrevious={handlePrevious}
        hasNext={currentVideoIndex < videos.length - 1}
        hasPrevious={currentVideoIndex > 0}
      />
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Ionicons name="play-circle" size={32} color="#FF0000" />
          <Text style={styles.logoText}>VideoPlayer</Text>
        </View>
        
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.headerButton}>
            <Ionicons name="notifications-outline" size={24} color="white" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerButton}>
            <Ionicons name="person-circle-outline" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#888" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search videos..."
            placeholderTextColor="#888"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color="#888" />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => setShowAddVideo(true)}
        >
          <Ionicons name="add-circle" size={28} color="#FF0000" />
        </TouchableOpacity>
      </View>

      {/* Navigation Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity style={[styles.tab, styles.tabActive]}>
          <Ionicons name="home" size={20} color="#FF0000" />
          <Text style={[styles.tabText, styles.tabTextActive]}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tab}>
          <Ionicons name="trending-up" size={20} color="#ccc" />
          <Text style={styles.tabText}>Trending</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tab}>
          <Ionicons name="bookmark" size={20} color="#ccc" />
          <Text style={styles.tabText}>Saved</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tab}>
          <Ionicons name="library" size={20} color="#ccc" />
          <Text style={styles.tabText}>Library</Text>
        </TouchableOpacity>
      </View>

      {/* Video List */}
      <FlatList
        data={videos}
        renderItem={renderVideoCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.videoList}
        showsVerticalScrollIndicator={false}
      />

      {/* Add Video Modal */}
      <Modal
        visible={showAddVideo}
        transparent
        animationType="slide"
        onRequestClose={() => setShowAddVideo(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.addVideoModal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Video URL</Text>
              <TouchableOpacity onPress={() => setShowAddVideo(false)}>
                <Ionicons name="close" size={28} color="white" />
              </TouchableOpacity>
            </View>
            
            <Text style={styles.modalDescription}>
              Enter a video URL (supports MP4, M3U8, and other formats)
            </Text>
            
            <TextInput
              style={styles.urlInput}
              placeholder="https://example.com/video.m3u8"
              placeholderTextColor="#888"
              value={customVideoUrl}
              onChangeText={setCustomVideoUrl}
              autoCapitalize="none"
              autoCorrect={false}
            />
            
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setCustomVideoUrl('');
                  setShowAddVideo(false);
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalButton, styles.addButtonModal]}
                onPress={handleAddCustomVideo}
                disabled={!customVideoUrl.trim()}
              >
                <LinearGradient
                  colors={customVideoUrl.trim() ? ['#FF0000', '#CC0000'] : ['#555', '#444']}
                  style={styles.gradientButton}
                >
                  <Text style={styles.addButtonText}>Add Video</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f0f',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#1a1a1a',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 16,
  },
  headerButton: {
    padding: 4,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2a2a2a',
    borderRadius: 25,
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    color: 'white',
    fontSize: 15,
  },
  addButton: {
    padding: 4,
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: '#1a1a1a',
    paddingHorizontal: 8,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#2a2a2a',
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    gap: 6,
  },
  tabActive: {
    borderBottomWidth: 2,
    borderBottomColor: '#FF0000',
  },
  tabText: {
    color: '#ccc',
    fontSize: 13,
    fontWeight: '500',
  },
  tabTextActive: {
    color: '#FF0000',
    fontWeight: 'bold',
  },
  videoList: {
    paddingVertical: 8,
  },
  videoCard: {
    marginBottom: 16,
  },
  thumbnailContainer: {
    position: 'relative',
    width: '100%',
    aspectRatio: 16 / 9,
    backgroundColor: '#2a2a2a',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  durationBadge: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.8)',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
  },
  durationText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  videoInfo: {
    flexDirection: 'row',
    padding: 12,
    gap: 12,
  },
  channelAvatar: {
    width: 36,
    height: 36,
  },
  videoDetails: {
    flex: 1,
  },
  videoTitle: {
    color: 'white',
    fontSize: 15,
    fontWeight: '500',
    marginBottom: 4,
    lineHeight: 20,
  },
  videoMeta: {
    color: '#aaa',
    fontSize: 13,
  },
  moreButton: {
    padding: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  addVideoModal: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    color: 'white',
    fontSize: 22,
    fontWeight: 'bold',
  },
  modalDescription: {
    color: '#aaa',
    fontSize: 14,
    marginBottom: 20,
    lineHeight: 20,
  },
  urlInput: {
    backgroundColor: '#2a2a2a',
    color: 'white',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#3a3a3a',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    borderRadius: 8,
    overflow: 'hidden',
  },
  cancelButton: {
    backgroundColor: '#2a2a2a',
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    color: '#ccc',
    fontSize: 16,
    fontWeight: '600',
  },
  addButtonModal: {},
  gradientButton: {
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default HomeScreen;

