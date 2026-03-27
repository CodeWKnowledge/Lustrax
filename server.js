import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

// Fix for __dirname in ES Modules (type: module)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Serve the static files from the React app build (dist)
app.use(express.static(path.join(__dirname, 'dist')));

// Handles any routing requests that don't match the ones above
// This handles client-side React Router routing seamlessly
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Bind to 0.0.0.0 so the host container can detect the health probe
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Lustrax Jewelries production server is running on port ${PORT}`);
});
