require('dotenv').config();
const express = require('express');
const cors = require('cors'); // Import cors
const emailRoutes = require('./emailRoutes');

const app = express();

// Enable CORS for all routes
app.use(cors());

// Parse JSON request bodies
app.use(express.json());

// Mount email routes
app.use('/api/emails', emailRoutes);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
