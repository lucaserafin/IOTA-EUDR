import express from 'express';
import path from 'path';
import { notarizeRouter } from './routes/notarize';
import { verifyRouter } from './routes/verify';
import { historyRouter } from './routes/history';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// API Routes
app.use('/api', notarizeRouter);
app.use('/api', verifyRouter);
app.use('/api', historyRouter);

// Serve frontend
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

app.get('/verify', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/verify.html'));
});

app.get('/history', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/history.html'));
});

app.listen(PORT, () => {
  console.log(`EUDR MVP running at http://localhost:${PORT}`);
});
