/**
 * Utility functions for formatting and helpers
 */

/**
 * Format milliseconds to time string (HH:MM:SS or MM:SS)
 * @param {number} millis - Time in milliseconds
 * @returns {string} Formatted time string
 */
export const formatTime = (millis) => {
  if (!millis || millis < 0) return '0:00';
  
  const totalSeconds = Math.floor(millis / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

/**
 * Format file size in bytes to human-readable format
 * @param {number} bytes - File size in bytes
 * @returns {string} Formatted file size
 */
export const formatFileSize = (bytes) => {
  if (!bytes || bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
};

/**
 * Format view count to short format (1.2M, 850K, etc.)
 * @param {number} views - Number of views
 * @returns {string} Formatted view count
 */
export const formatViewCount = (views) => {
  if (!views || views === 0) return '0 views';
  
  if (views >= 1000000) {
    return (views / 1000000).toFixed(1) + 'M';
  } else if (views >= 1000) {
    return (views / 1000).toFixed(1) + 'K';
  }
  return views.toString();
};

/**
 * Format upload time to relative time (2 days ago, 1 week ago, etc.)
 * @param {Date|string} date - Date of upload
 * @returns {string} Formatted relative time
 */
export const formatUploadTime = (date) => {
  const now = new Date();
  const uploadDate = new Date(date);
  const diffMs = now - uploadDate;
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);
  const diffWeeks = Math.floor(diffDays / 7);
  const diffMonths = Math.floor(diffDays / 30);
  const diffYears = Math.floor(diffDays / 365);

  if (diffYears > 0) {
    return diffYears === 1 ? '1 year ago' : `${diffYears} years ago`;
  } else if (diffMonths > 0) {
    return diffMonths === 1 ? '1 month ago' : `${diffMonths} months ago`;
  } else if (diffWeeks > 0) {
    return diffWeeks === 1 ? '1 week ago' : `${diffWeeks} weeks ago`;
  } else if (diffDays > 0) {
    return diffDays === 1 ? '1 day ago' : `${diffDays} days ago`;
  } else if (diffHours > 0) {
    return diffHours === 1 ? '1 hour ago' : `${diffHours} hours ago`;
  } else if (diffMinutes > 0) {
    return diffMinutes === 1 ? '1 minute ago' : `${diffMinutes} minutes ago`;
  } else {
    return 'Just now';
  }
};

/**
 * Check if URL is a m3u8/HLS stream
 * @param {string} url - Video URL
 * @returns {boolean} True if m3u8/HLS
 */
export const isM3U8 = (url) => {
  if (!url) return false;
  return url.includes('.m3u8') || url.includes('m3u8');
};

/**
 * Get video type from URL
 * @param {string} url - Video URL
 * @returns {string} Video type (hls, mp4, etc.)
 */
export const getVideoType = (url) => {
  if (!url) return 'unknown';
  
  if (isM3U8(url)) return 'hls';
  if (url.includes('.mp4')) return 'mp4';
  if (url.includes('.mov')) return 'mov';
  if (url.includes('.webm')) return 'webm';
  if (url.includes('.avi')) return 'avi';
  
  return 'unknown';
};

/**
 * Validate video URL
 * @param {string} url - Video URL to validate
 * @returns {boolean} True if valid
 */
export const isValidVideoUrl = (url) => {
  if (!url || typeof url !== 'string') return false;
  
  try {
    const urlObj = new URL(url);
    return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
  } catch (e) {
    return false;
  }
};

/**
 * Generate thumbnail URL from video URL (placeholder function)
 * @param {string} videoUrl - Video URL
 * @returns {string} Thumbnail URL
 */
export const generateThumbnail = (videoUrl) => {
  // In a real app, you would extract the thumbnail from the video
  // or use a service to generate it
  const random = Math.floor(Math.random() * 1000);
  return `https://picsum.photos/400/225?random=${random}`;
};

/**
 * Debounce function to limit rate of function calls
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Debounced function
 */
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

/**
 * Throttle function to limit rate of function execution
 * @param {Function} func - Function to throttle
 * @param {number} limit - Time limit in milliseconds
 * @returns {Function} Throttled function
 */
export const throttle = (func, limit) => {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

export default {
  formatTime,
  formatFileSize,
  formatViewCount,
  formatUploadTime,
  isM3U8,
  getVideoType,
  isValidVideoUrl,
  generateThumbnail,
  debounce,
  throttle,
};

