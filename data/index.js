const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');
const products = require('./new-products');
const users = require('./users'); // Import the users list

const app = express();
const PORT = 3131;
const SECRET_KEY = 'your_secret_key'; // Replace with your own secret key

// Use CORS middleware
app.use(cors());

// Middleware to parse JSON bodies
app.use(express.json());

// Login Route with JWT Authentication
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  const storeId = req.headers['store-id'];

  console.log('Received login request:', { username, storeId }); // Log request details

  // Find the user by username
  const user = users.find(u => u.username === username);

  if (!user) {
    return res.status(400).json({ error: 'User not found' });
  }

  // Check if the user is allowed to log in
  if (user.role === 'SalesPerson') {
    return res.status(403).json({ error: 'SalesPerson cannot log in' });
  }

  // Check the provided password
  if (user.password !== password) {
    return res.status(400).json({ error: 'Invalid password' });
  }

  // Generate JWT token
  const token = jwt.sign(
    {
      id: user.id,
      username: user.username, // Use username in the token payload
      role: user.role,
      storeId,
    },
    SECRET_KEY,
    { expiresIn: '1h' }
  );

  // Return the token and role in the response
  res.json({ message: 'Login successful', token, role: user.role });
});


// Route to serve products
app.get('/products', (req, res) => {
  res.json(products);
});

// Route to serve the latest file and related data
app.get('/Files/GetFiles', (req, res) => {
  const dirPath = path.join(__dirname, 'your_directory'); // Replace 'your_directory' with the actual directory path

  fs.readdir(dirPath, (err, files) => {
    if (err) {
      console.error('Failed to read directory:', err.message); // Log error
      return res.status(500).json({ error: 'Failed to read directory' });
    }

    if (files.length === 0) {
      return res.status(404).json({ error: 'No files found' });
    }

    // Sort files by modification time, latest first
    const sortedFiles = files.sort((a, b) => {
      return fs.statSync(path.join(dirPath, b)).mtime - fs.statSync(path.join(dirPath, a)).mtime;
    });

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

app.get('/branchusers', (req, res) => {
  // Assuming you want to return all users or just the ones with specific roles
  const filteredUsers = users.filter(user => user.role === 'Cashier' || user.role === 'Manager' || user.role === 'SalesPerson');

  res.json(filteredUsers);
});

// Serve static files if necessary
app.use('/files', express.static(path.join(__dirname, 'your_directory'))); // Replace 'your_directory' with the actual directory path

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
