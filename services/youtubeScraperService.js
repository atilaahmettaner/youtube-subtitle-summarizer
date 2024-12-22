import scraper from 'youtube-captions-scraper';

export async function getSubtitleSummary(videoId, timeStamps, lang) {
  try {
    const captions = await scraper.getSubtitles({
      videoID: videoId,
      lang: lang
    });

    const filtered = captions.filter(caption => {
      const start = parseFloat(caption.start);
      return timeStamps.some(time => time >= start - 15 && time <= start + 15);
    });

    return filtered.map(x => x.text).join(' ');
  } catch (error) {
    console.error(error);
    return '';
  }
} 