import express from 'express';
import dotenv from 'dotenv';
import bodyParser from 'body-parser';
import analytics from 'express-google-analytics';
import youtubeRoutes from './routes/youtubeRoutes.js';

dotenv.config();

const app = express();
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(analytics(process.env.GOOGLE_ANALYTICS_TRACKING_ID || ''));

app.get('/', (req, res) => {
  res.render('home');
});

app.use('/youtube', youtubeRoutes);

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});