import app from './app.js';
import request from 'supertest';

describe('GET /', () => {
  it('responds with 200 status code', async () => {
    const response = await request(app).get('/');
    expect(response.statusCode).toBe(200);
  });
});

describe('POST /', () => {
  it('responds with 200 status code', async () => {
    const response = await request(app).post('/').send({ input: 'XqVC-lBeG2U', lang: 'en' });
    expect(response.statusCode).toBe(200);
  });
  it('responds with error message for invalid YouTube link', async () => {
    const response = await request(app).post('/').send({ input: 'invalid-link', lang: 'en' });
    expect(response.text).toContain('Hatalı bir YouTube bağlantısı girdiniz!');
  });

  it('responds with summary data for valid YouTube link', async () => {
    const response = await request(app).post('/').send({ input: 'XqVC-lBeG2U', lang: 'en' });
    expect(response.text).toContain('timeStamps');
    expect(response.text).toContain('aiSummary');
    expect(response.text).toContain('title');
    expect(response.text).toContain('summ');
    expect(response.text).toContain('longSub');
    expect(response.text).toContain('input');
    expect(response.text).toContain('myData');
    expect(response.text).toContain('secondsData');
    expect(response.text).toContain('secondstoMin');
  });
});

describe('convertToSeconds', () => {
  it('converts minutes and seconds to seconds', () => {
    const result = app.convertToSeconds(['1:30', '2:45', '3:15']);
    expect(result).toEqual(['90.000', '165.000', '195.000']);
  });
});

describe('getYouTubeId', () => {
  it('extracts video ID from YouTube link', () => {
    const result = app.getYouTubeId('https://www.youtube.com/watch?v=XqVC-lBeG2U');
    expect(result).toBe('XqVC-lBeG2U');
  });

  it('extracts video ID from shortened YouTube link', () => {
    const result = app.getYouTubeId('https://youtu.be/XqVC-lBeG2U');
    expect(result).toBe('XqVC-lBeG2U');
  });

  it('returns error for invalid YouTube link', () => {
    const result = app.getYouTubeId('invalid-link');
    expect(result).toBe('error');
  });
});

describe('langDet', () => {
  it('returns AI summary for Turkish language', async () => {
    const result = await app.langDet('tr', 'This is a test summary.');
    expect(result).toContain('Bu video transkripsiyonunu özetleyebilir misin:');
    expect(result).toContain('This is a test summary.');
  });

  it('returns AI summary for English language', async () => {
    const result = await app.langDet('en', 'This is a test summary.');
    expect(result).toContain('summarize the transcription of this video?:');
    expect(result).toContain('This is a test summary.');
  });
});

describe('getTitle', () => {
  it('returns video title for valid video ID', async () => {
    const result = await app.getTitle('XqVC-lBeG2U');
    expect(result).toBe('Test Video');
  });
});