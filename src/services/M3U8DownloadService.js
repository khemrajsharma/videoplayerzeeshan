import * as FileSystem from 'expo-file-system/legacy';
import * as MediaLibrary from 'expo-media-library';
import { Alert, Platform } from 'react-native';

class M3U8DownloadService {
  constructor() {
    this.downloadQueue = [];
    this.isDownloading = false;
  }

  async parseM3U8(m3u8Url) {
    try {
      const response = await fetch(m3u8Url);
      const m3u8Content = await response.text();
      
      const lines = m3u8Content.split('\n');
      const segments = [];
      let baseUrl = m3u8Url.substring(0, m3u8Url.lastIndexOf('/') + 1);
      
      // Check if this is a master playlist (contains other playlists)
      const isMasterPlaylist = lines.some(line => line.includes('#EXT-X-STREAM-INF'));
      
      if (isMasterPlaylist) {
        // Find the best quality stream (simplified logic)
        for (let i = 0; i < lines.length; i++) {
          if (lines[i].startsWith('#EXT-X-STREAM-INF')) {
            // Get the next line which is the URL
            let variantUrl = lines[i + 1];
            if (variantUrl) {
              variantUrl = variantUrl.trim();
              const fullVariantUrl = variantUrl.startsWith('http') 
                ? variantUrl 
                : baseUrl + variantUrl;
              // Recursively parse the variant playlist
              return this.parseM3U8(fullVariantUrl);
            }
          }
        }
      }

      // Parse segments
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (line && !line.startsWith('#')) {
          const segmentUrl = line.startsWith('http') ? line : baseUrl + line;
          segments.push({ uri: segmentUrl });
        }
      }

      return { segments };
    } catch (error) {
      console.error('Error parsing m3u8:', error);
      throw error;
    }
  }

  async downloadM3U8Video(m3u8Url, onProgress, title = 'video') {
    try {
      // 1. Check Permissions
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        throw new Error('Storage permission is required');
      }

      // 2. Parse Playlist
      const manifest = await this.parseM3U8(m3u8Url);
      if (!manifest.segments || manifest.segments.length === 0) {
        throw new Error('No segments found in playlist');
      }

      // 3. Prepare Directories
      const downloadDir = FileSystem.cacheDirectory + 'hls_segments/';
      await FileSystem.makeDirectoryAsync(downloadDir, { intermediates: true });

      const segmentFiles = [];
      const totalSegments = manifest.segments.length;

      // 4. Download Segments
      for (let i = 0; i < totalSegments; i++) {
        // Check if download was cancelled
        if (!this.isDownloading) break;

        const segment = manifest.segments[i];
        const fileName = `seg_${i}.ts`;
        const fileUri = downloadDir + fileName;

        // Download segment
        await FileSystem.downloadAsync(segment.uri, fileUri);
        segmentFiles.push(fileUri);

        // Update progress
        if (onProgress) {
          onProgress((i + 1) / totalSegments);
        }
      }

      // 5. Merge Segments (if not cancelled)
      if (this.isDownloading && segmentFiles.length > 0) {
        // Use .ts extension as it is technically correct for MPEG-TS stream
        // Using .mp4 for TS content causes Android MediaStore verification to fail
        const fileName = `${title}_${Date.now()}.ts`;
        const outputFile = FileSystem.documentDirectory + fileName;
        
        await this.mergeSegments(segmentFiles, outputFile);

        // 6. Save File
        if (Platform.OS === 'android') {
          // On Android, use StorageAccessFramework to save to Downloads
          // This bypasses MediaStore strict validation issues
          try {
            const permissions = await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();
            
            if (permissions.granted) {
              const uri = await FileSystem.StorageAccessFramework.createFileAsync(
                permissions.directoryUri,
                fileName,
                'video/mp2ts'
              );
              
              const content = await FileSystem.readAsStringAsync(outputFile, { encoding: FileSystem.EncodingType.Base64 });
              await FileSystem.writeAsStringAsync(uri, content, { encoding: FileSystem.EncodingType.Base64 });
              
              Alert.alert('Success', 'Video saved to selected folder!');
            } else {
              // Fallback or user cancelled
              Alert.alert('Permission Denied', 'Could not save video without folder permission.');
            }
          } catch (e) {
            console.error('SAF Error:', e);
            Alert.alert('Save Failed', 'Could not save video using Storage Access Framework.');
          }
        } else {
          // iOS
          const asset = await MediaLibrary.createAssetAsync(outputFile);
          await MediaLibrary.createAlbumAsync('VideoPlayer', asset, false);
          Alert.alert('Success', 'Video saved to Photos!');
        }

        // Cleanup
        await FileSystem.deleteAsync(downloadDir, { idempotent: true });
        
        return { success: true, uri: outputFile };
      }
      
      return { success: false, cancelled: true };

    } catch (error) {
      console.error('M3U8 Download Error:', error);
      Alert.alert('Download Failed', error.message);
      throw error;
    }
  }

  async mergeSegments(segmentFiles, outputFile) {
    try {
      // For binary merging in pure JS/Expo without native modules:
      // We read as Base64 and append. Note: This is memory intensive.
      // A better approach would be native code, but this works for demo.
      
      let mergedBase64 = '';
      
      for (const file of segmentFiles) {
        const content = await FileSystem.readAsStringAsync(file, {
          encoding: FileSystem.EncodingType.Base64
        });
        mergedBase64 += content;
      }

      await FileSystem.writeAsStringAsync(outputFile, mergedBase64, {
        encoding: FileSystem.EncodingType.Base64
      });
      
    } catch (error) {
      console.error('Merge Error:', error);
      throw new Error('Failed to merge video segments');
    }
  }

  async downloadSimpleVideo(videoUrl, onProgress, title = 'video') {
    try {
      const fileName = `${title}_${Date.now()}.mp4`;
      
      if (Platform.OS === 'android') {
        // Android SAF Download
        const permissions = await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();
        if (!permissions.granted) {
          throw new Error('Permission denied');
        }

        // Create file in selected folder
        const uri = await FileSystem.StorageAccessFramework.createFileAsync(
          permissions.directoryUri,
          fileName,
          'video/mp4'
        );

        // Download directly to the URI (if possible) or download to cache then write
        // FileSystem.downloadAsync doesn't support SAF URI directly as destination usually
        // So we download to cache first
        const cacheFile = FileSystem.cacheDirectory + fileName;
        
        const downloadResumable = FileSystem.createDownloadResumable(
          videoUrl,
          cacheFile,
          {},
          (downloadProgress) => {
            const progress = downloadProgress.totalBytesWritten / downloadProgress.totalBytesExpectedToWrite;
            if (onProgress) onProgress(progress);
          }
        );

        await downloadResumable.downloadAsync();

        // Read and write to SAF (Chunked to avoid memory crash?)
        // SAF writeAsStringAsync is the only way in Expo without custom native code
        const content = await FileSystem.readAsStringAsync(cacheFile, { encoding: FileSystem.EncodingType.Base64 });
        await FileSystem.writeAsStringAsync(uri, content, { encoding: FileSystem.EncodingType.Base64 });
        
        // Cleanup cache
        await FileSystem.deleteAsync(cacheFile, { idempotent: true });
        
        Alert.alert('Success', 'Video saved successfully!');
        return { success: true, uri };

      } else {
        // iOS / Default
        const { status } = await MediaLibrary.requestPermissionsAsync();
        if (status !== 'granted') throw new Error('Permission denied');

        const fileUri = FileSystem.documentDirectory + fileName;
        const downloadResumable = FileSystem.createDownloadResumable(
          videoUrl,
          fileUri,
          {},
          (downloadProgress) => {
            const progress = downloadProgress.totalBytesWritten / downloadProgress.totalBytesExpectedToWrite;
            if (onProgress) onProgress(progress);
          }
        );

        const { uri } = await downloadResumable.downloadAsync();
        const asset = await MediaLibrary.createAssetAsync(uri);
        await MediaLibrary.createAlbumAsync('VideoPlayer', asset, false);
        Alert.alert('Success', 'Video saved to Photos!');
        return { success: true, uri };
      }
    } catch (error) {
      console.error('Download Error:', error);
      Alert.alert('Download Failed', error.message);
      throw error;
    }
  }

  async downloadVideo(videoUrl, onProgress, title = 'video') {
    this.isDownloading = true;
    if (videoUrl.includes('.m3u8')) {
      return await this.downloadM3U8Video(videoUrl, onProgress, title);
    } else {
      return await this.downloadSimpleVideo(videoUrl, onProgress, title);
    }
  }

  cancelDownload() {
    this.isDownloading = false;
  }
}

export default new M3U8DownloadService();
