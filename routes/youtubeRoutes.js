import { Router } from 'express';
import { fetchVideoData, summarizeVideo } from '../controllers/youtubeController.js';

const router = Router();

router.get('/:id', fetchVideoData);
router.post('/summarize', summarizeVideo);

export default router; 