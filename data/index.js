const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const products = require('./new-products');

const app = express();
const PORT = 3131;

// Use CORS middleware
app.use(cors());

// Route to serve products
app.get('/products', (req, res) => {
  res.json(products);
});

// Route to serve the latest file and related data
app.get('/Files/GetFiles', (req, res) => {
  const dirPath = path.join(__dirname, 'path_to_your_directory'); // Replace with your directory path

  // Get all files in the directory
  fs.readdir(dirPath, (err, files) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to read directory' });
    }

    // Sort files by modification time, latest first
    const sortedFiles = files.sort((a, b) => {
      return fs.statSync(path.join(dirPath, b)).mtime - fs.statSync(path.join(dirPath, a)).mtime;
    });

    if (sortedFiles.length === 0) {
      return res.status(404).json({ error: 'No files found' });
    }

    // Get the latest file details
    const latestFile = sortedFiles[0];
    const latestFilePath = path.join(dirPath, latestFile);
    const stats = fs.statSync(latestFilePath);

    res.json({
      FileUrl: `/files/${latestFile}`, 
      ItemsCount: sortedFiles.length.toString(),
      LastModified: stats.mtime.toISOString()
    });
  });
});

// Serve static files if necessary (e.g., serve files from a public directory)
app.use('/files', express.static(path.join(__dirname, 'path_to_your_directory'))); // Replace with your directory path

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

