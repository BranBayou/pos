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
// Login Route with JWT Authentication
app.post('/login', (req, res) => {
  const { username, password } = req.body; // Expect username and password in the body
  const storeId = req.headers['store-id'];

  // Find the user by full name
  const user = users.find(u => u.fullName === username);

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
      fullName: user.fullName,
      role: user.role,
      storeId,
    },
    SECRET_KEY,
    { expiresIn: '1h' }
  );

  res.json({ message: 'Login successful', token });
});


// Route to get branch users (protected route)
app.get('/User/BranchUsers', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, SECRET_KEY);

    const allowedUsers = users.filter(user => user.role !== 'SalesPerson');
    
    res.json(allowedUsers);
  } catch (ex) {
    res.status(400).json({ error: 'Invalid token.' });
  }
});


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
