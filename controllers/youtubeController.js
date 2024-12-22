import { getVideoDetails, getComments, getMostReplayedMarkers } from '../services/youtubeCommentService.js';
import { getSubtitleSummary } from '../services/youtubeScraperService.js';
import { getAiSummary } from '../services/openAiService.js';

export async function fetchVideoData(req, res) {
  try {
    const { id } = req.params;
    const videoDetails = await getVideoDetails(id);
    const comments = await getComments(id);

    return res.status(200).json({ videoDetails, comments });
  } catch (error) {
    console.error('Video verileri alınırken hata:', error);
    return res.status(500).json({ error: 'Video verileri alınırken bir hata oluştu.' });
  }
}

export async function summarizeVideo(req, res) {
  try {
    const { input, selectedLanguage } = req.body;
    
    const replayedMarkers = await getMostReplayedMarkers(input);
    const subtitlesSummary = await getSubtitleSummary(input, replayedMarkers, selectedLanguage);
    const aiResponse = await getAiSummary(selectedLanguage, subtitlesSummary);

    return res.render('index', {
      algo: {
        myData: replayedMarkers,
        aiSummary: aiResponse,
      },
    });
  } catch (error) {
    console.error('Özetleme işlemi sırasında hata:', error);
    return res.status(500).json({ error: 'Özetleme işlemi sırasında bir hata oluştu.' });
  }
} 