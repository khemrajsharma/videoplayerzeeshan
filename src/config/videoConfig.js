// Video Configuration
// Add your video sources here

export const VIDEO_SOURCES = {
  // Sample HLS/M3U8 streams for testing
  sampleStreams: [
    {
      id: 'tears-of-steel',
      title: 'Tears of Steel - HLS Demo',
      url: 'https://demo.unified-streaming.com/k8s/features/stable/video/tears-of-steel/tears-of-steel.ism/.m3u8',
      type: 'hls',
      description: 'Official HLS test stream',
    },
    {
      id: 'apple-hls',
      title: 'Apple HLS Test Stream',
      url: 'https://devstreaming-cdn.apple.com/videos/streaming/examples/img_bipbop_adv_example_fmp4/master.m3u8',
      type: 'hls',
      description: 'Apple official HLS test stream with multiple qualities',
    },
  ],

  // Sample MP4 videos
  sampleVideos: [
    {
      id: 'big-buck-bunny',
      title: 'Big Buck Bunny',
      url: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      type: 'mp4',
      duration: '9:56',
    },
    {
      id: 'elephants-dream',
      title: 'Elephant Dream',
      url: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
      type: 'mp4',
      duration: '10:53',
    },
    {
      id: 'sintel',
      title: 'Sintel',
      url: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
      type: 'mp4',
      duration: '14:48',
    },
  ],
};

// Player Configuration
export const PLAYER_CONFIG = {
  // Auto-hide controls after this duration (milliseconds)
  controlsTimeout: 4000,

  // Skip forward/backward duration (milliseconds)
  skipDuration: 10000,

  // Default volume (0.0 to 1.0)
  defaultVolume: 1.0,

  // Default playback speed
  defaultSpeed: 1.0,

  // Available playback speeds
  playbackSpeeds: [
    { label: '0.25x', value: 0.25 },
    { label: '0.5x', value: 0.5 },
    { label: '0.75x', value: 0.75 },
    { label: 'Normal', value: 1.0 },
    { label: '1.25x', value: 1.25 },
    { label: '1.5x', value: 1.5 },
    { label: '1.75x', value: 1.75 },
    { label: '2x', value: 2.0 },
  ],

  // Available quality options
  qualities: [
    { label: 'Auto', value: 'auto', bandwidth: 0 },
    { label: '1080p', value: '1080', bandwidth: 5000000 },
    { label: '720p', value: '720', bandwidth: 2500000 },
    { label: '480p', value: '480', bandwidth: 1000000 },
    { label: '360p', value: '360', bandwidth: 500000 },
  ],

  // Progress update interval (milliseconds)
  progressUpdateInterval: 500,

  // Enable background audio
  enableBackgroundAudio: true,

  // Enable notifications
  enableNotifications: true,

  // Enable downloads
  enableDownloads: true,
};

// Theme Configuration
export const THEME = {
  colors: {
    primary: '#FF0000',
    background: '#0f0f0f',
    surface: '#1a1a1a',
    card: '#2a2a2a',
    text: '#ffffff',
    textSecondary: '#aaa',
    textTertiary: '#888',
    border: '#3a3a3a',
    error: '#ff4444',
    success: '#00ff00',
  },
  
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
  },

  borderRadius: {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    round: 50,
  },

  fontSize: {
    xs: 12,
    sm: 13,
    md: 15,
    lg: 16,
    xl: 20,
    xxl: 22,
  },
};

export default {
  VIDEO_SOURCES,
  PLAYER_CONFIG,
  THEME,
};

