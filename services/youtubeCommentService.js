import { google } from 'googleapis';
import fetch from 'node-fetch';

const apiKey = process.env.YOUTUBE_API_KEY || 'YOUR_API_KEY_HERE';
const youtube = google.youtube({
  version: 'v3',
  auth: apiKey
});

export async function getVideoDetails(videoId) {
  try {
    const { data } = await youtube.videos.list({
      part: 'snippet,contentDetails',
      id: videoId,
      maxResults: 1
    });
    return data.items.length > 0 ? data.items[0] : null;
  } catch (error) {
    console.error('getVideoDetails error:', error);
    throw error;
  }
}

export async function getComments(videoId) {
  try {
    const { data } = await youtube.commentThreads.list({
      part: 'snippet,replies',
      videoId,
      maxResults: 100,
    });
    return data.items || [];
  } catch (error) {
    console.error('getComments error:', error);
    return [];
  }
}

export async function getMostReplayedMarkers(videoId) {
  try {
    const response = await fetch(`https://yt.lemnoslife.com/videos?part=mostReplayed&id=${videoId}`);
    const json = await response.json();
    const markers = parseMarkers(json);
    return markers;
  } catch (error) {
    console.error('getMostReplayedMarkers error:', error);
    return [];
  }
} 