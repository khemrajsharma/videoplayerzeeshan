/**
 * Application Constants
 */

// Player Controls
export const CONTROLS_TIMEOUT = 4000; // milliseconds
export const SKIP_DURATION = 10000; // milliseconds
export const PROGRESS_UPDATE_INTERVAL = 500; // milliseconds

// Video Quality
export const VIDEO_QUALITIES = {
  AUTO: 'auto',
  UHD_4K: '2160',
  FULL_HD: '1080',
  HD: '720',
  SD: '480',
  LOW: '360',
};

// Playback Speeds
export const PLAYBACK_SPEEDS = {
  VERY_SLOW: 0.25,
  SLOW: 0.5,
  SLOWER: 0.75,
  NORMAL: 1.0,
  FASTER: 1.25,
  FAST: 1.5,
  VERY_FAST: 2.0,
};

// File Types
export const VIDEO_TYPES = {
  HLS: 'hls',
  MP4: 'mp4',
  MOV: 'mov',
  WEBM: 'webm',
  AVI: 'avi',
};

// Notification Actions
export const NOTIFICATION_ACTIONS = {
  PLAY_PAUSE: 'play-pause',
  SKIP_FORWARD: 'skip-forward',
  SKIP_BACKWARD: 'skip-backward',
};

// Audio Modes (iOS)
export const IOS_AUDIO_MODES = {
  DO_NOT_MIX: 1,
  DUCK_OTHERS: 2,
  MIX_WITH_OTHERS: 3,
};

// Android Importance Levels
export const ANDROID_IMPORTANCE = {
  MIN: 1,
  LOW: 2,
  DEFAULT: 3,
  HIGH: 4,
};

// Download Status
export const DOWNLOAD_STATUS = {
  IDLE: 'idle',
  DOWNLOADING: 'downloading',
  PAUSED: 'paused',
  COMPLETED: 'completed',
  FAILED: 'failed',
};

// Player States
export const PLAYER_STATES = {
  IDLE: 'idle',
  LOADING: 'loading',
  READY: 'ready',
  PLAYING: 'playing',
  PAUSED: 'paused',
  BUFFERING: 'buffering',
  ERROR: 'error',
  ENDED: 'ended',
};

// Error Messages
export const ERROR_MESSAGES = {
  NO_INTERNET: 'No internet connection',
  VIDEO_NOT_FOUND: 'Video not found',
  PLAYBACK_ERROR: 'Playback error occurred',
  DOWNLOAD_FAILED: 'Download failed',
  PERMISSION_DENIED: 'Permission denied',
  INVALID_URL: 'Invalid video URL',
  UNSUPPORTED_FORMAT: 'Unsupported video format',
};

// Storage Keys
export const STORAGE_KEYS = {
  WATCH_HISTORY: '@watch_history',
  FAVORITES: '@favorites',
  SETTINGS: '@settings',
  QUALITY_PREFERENCE: '@quality_preference',
  SPEED_PREFERENCE: '@speed_preference',
  VOLUME_PREFERENCE: '@volume_preference',
};

// App Config
export const APP_CONFIG = {
  APP_NAME: 'VideoPlayer',
  VERSION: '1.0.0',
  MAX_HISTORY_ITEMS: 100,
  MAX_FAVORITES: 500,
  CACHE_SIZE_LIMIT: 1024 * 1024 * 500, // 500 MB
};

export default {
  CONTROLS_TIMEOUT,
  SKIP_DURATION,
  PROGRESS_UPDATE_INTERVAL,
  VIDEO_QUALITIES,
  PLAYBACK_SPEEDS,
  VIDEO_TYPES,
  NOTIFICATION_ACTIONS,
  IOS_AUDIO_MODES,
  ANDROID_IMPORTANCE,
  DOWNLOAD_STATUS,
  PLAYER_STATES,
  ERROR_MESSAGES,
  STORAGE_KEYS,
  APP_CONFIG,
};

