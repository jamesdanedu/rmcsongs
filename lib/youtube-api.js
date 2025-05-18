// YouTube API Utility Functions

/**
 * Extracts the video ID from a YouTube URL
 * @param {string} url - The YouTube URL
 * @returns {string|null} The extracted video ID or null
 */
export function extractVideoId(url) {
  if (!url) return null;

  // Handle different YouTube URL formats
  const patterns = [
    /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/,
    /^([a-zA-Z0-9_-]{11})$/
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) {
      return match[1];
    }
  }

  return null;
}

/**
 * Validates if a given string is a valid YouTube video ID
 * @param {string} videoId - The potential video ID
 * @returns {boolean} Whether the string is a valid YouTube video ID
 */
export function isValidYouTubeVideoId(videoId) {
  if (!videoId) return false;
  return /^[a-zA-Z0-9_-]{11}$/.test(videoId);
}

/**
 * Constructs a full YouTube video URL from a video ID
 * @param {string} videoId - The YouTube video ID
 * @returns {string} The full YouTube video URL
 */
export function getYouTubeVideoUrl(videoId) {
  if (!isValidYouTubeVideoId(videoId)) {
    throw new Error('Invalid YouTube Video ID');
  }
  return `https://www.youtube.com/watch?v=${videoId}`;
}

/**
 * Generates a YouTube video thumbnail URL
 * @param {string} videoId - The YouTube video ID
 * @param {string} [quality='maxresdefault'] - Thumbnail quality 
 * @returns {string} The URL of the YouTube video thumbnail
 */
export function getYouTubeThumbnail(videoId, quality = 'maxresdefault') {
  if (!isValidYouTubeVideoId(videoId)) {
    throw new Error('Invalid YouTube Video ID');
  }

  // Available thumbnail qualities
  const qualities = {
    'default': `https://i.ytimg.com/vi/${videoId}/default.jpg`,
    'hqdefault': `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
    'mqdefault': `https://i.ytimg.com/vi/${videoId}/mqdefault.jpg`,
    'sddefault': `https://i.ytimg.com/vi/${videoId}/sddefault.jpg`,
    'maxresdefault': `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`
  };

  // Fallback to maxresdefault if provided quality is not valid
  return qualities[quality] || qualities['maxresdefault'];
}

/**
 * Generates a YouTube embed URL from a video ID
 * @param {string} videoId - The YouTube video ID
 * @param {Object} [options] - Optional embed parameters
 * @returns {string} The YouTube embed URL
 */
export function getYouTubeEmbedUrl(videoId, options = {}) {
  if (!isValidYouTubeVideoId(videoId)) {
    throw new Error('Invalid YouTube Video ID');
  }

  const defaultOptions = {
    autoplay: 0,
    controls: 1,
    modestbranding: 1,
    rel: 0
  };

  const mergedOptions = { ...defaultOptions, ...options };
  const queryParams = new URLSearchParams(
    Object.entries(mergedOptions)
      .filter(([_, value]) => value !== undefined)
  ).toString();

  return `https://www.youtube.com/embed/${videoId}${queryParams ? `?${queryParams}` : ''}`;
}

/**
 * Searches YouTube for videos using the YouTube Data API
 * @param {string} query - Search query
 * @param {Object} [options] - Search options
 * @returns {Promise<Array>} Array of YouTube video search results
 */
export async function searchYouTubeVideos(query, options = {}) {
  const apiKey = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY;
  if (!apiKey) {
    throw new Error('YouTube API key is not configured');
  }

  const defaultOptions = {
    maxResults: 10,
    type: 'video',
    part: 'snippet'
  };

  const mergedOptions = { ...defaultOptions, ...options };

  const params = new URLSearchParams({
    key: apiKey,
    q: query,
    maxResults: mergedOptions.maxResults,
    type: mergedOptions.type,
    part: mergedOptions.part
  });

  try {
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/search?${params.toString()}`,
      {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      }
    );

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`YouTube API Error: ${response.status} - ${errorBody}`);
    }

    const data = await response.json();
    return data.items.map(item => ({
      id: item.id.videoId,
      title: item.snippet.title,
      description: item.snippet.description,
      thumbnails: item.snippet.thumbnails,
      channelTitle: item.snippet.channelTitle
    }));
  } catch (error) {
    console.error('YouTube search error:', error);
    throw error;
  }
}