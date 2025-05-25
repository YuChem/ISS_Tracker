import express from 'express';
import axios from 'axios';
import { createServer } from 'http';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Serve static files from the React app
app.use(express.static(join(__dirname, 'dist')));

// Proxy endpoint for ISS location
app.get('/iss-now/v1/', async (req, res) => {
  try {
    const response = await axios.get('http://api.open-notify.org/iss-now.json');
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching ISS location:', error);
    res.status(500).json({ error: 'Failed to fetch ISS location' });
  }
});

// All other GET requests not handled before will return the React app
app.get('*', (req, res) => {
  res.sendFile(join(__dirname, 'dist', 'index.html'));
});

const server = createServer(app);

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
