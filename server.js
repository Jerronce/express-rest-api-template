const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet()); // Security headers
app.use(cors()); // Enable CORS
app.use(morgan('dev')); // Logging
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// In-memory data store (replace with database in production)
let items = [
  { id: 1, name: 'Item 1', description: 'First item', createdAt: new Date() },
  { id: 2, name: 'Item 2', description: 'Second item', createdAt: new Date() }
];
let nextId = 3;

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to Express REST API Template',
    version: '1.0.0',
    endpoints: {
      'GET /api/items': 'Get all items',
      'GET /api/items/:id': 'Get item by ID',
      'POST /api/items': 'Create new item',
      'PUT /api/items/:id': 'Update item',
      'DELETE /api/items/:id': 'Delete item'
    }
  });
});

// GET all items
app.get('/api/items', (req, res) => {
  const { page = 1, limit = 10, search } = req.query;
  let filteredItems = items;

  // Search functionality
  if (search) {
    filteredItems = items.filter(item =>
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.description.toLowerCase().includes(search.toLowerCase())
    );
  }

  // Pagination
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const paginatedItems = filteredItems.slice(startIndex, endIndex);

  res.json({
    total: filteredItems.length,
    page: parseInt(page),
    limit: parseInt(limit),
    data: paginatedItems
  });
});

// GET item by ID
app.get('/api/items/:id', (req, res) => {
  const item = items.find(i => i.id === parseInt(req.params.id));
  
  if (!item) {
    return res.status(404).json({ error: 'Item not found' });
  }
  
  res.json(item);
});

// POST create new item
app.post('/api/items', (req, res) => {
  const { name, description } = req.body;
  
  if (!name) {
    return res.status(400).json({ error: 'Name is required' });
  }
  
  const newItem = {
    id: nextId++,
    name,
    description: description || '',
    createdAt: new Date()
  };
  
  items.push(newItem);
  res.status(201).json(newItem);
});

// PUT update item
app.put('/api/items/:id', (req, res) => {
  const itemIndex = items.findIndex(i => i.id === parseInt(req.params.id));
  
  if (itemIndex === -1) {
    return res.status(404).json({ error: 'Item not found' });
  }
  
  const { name, description } = req.body;
  
  if (name) items[itemIndex].name = name;
  if (description !== undefined) items[itemIndex].description = description;
  items[itemIndex].updatedAt = new Date();
  
  res.json(items[itemIndex]);
});

// DELETE item
app.delete('/api/items/:id', (req, res) => {
  const itemIndex = items.findIndex(i => i.id === parseInt(req.params.id));
  
  if (itemIndex === -1) {
    return res.status(404).json({ error: 'Item not found' });
  }
  
  const deletedItem = items.splice(itemIndex, 1)[0];
  res.json({ message: 'Item deleted successfully', item: deletedItem });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`API documentation available at http://localhost:${PORT}/`);
});
