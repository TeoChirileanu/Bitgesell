const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const router = express.Router();
const DATA_PATH = path.join(__dirname, '../../../data/items.json');

// Utility to read data (using async approach to avoid blocking)
async function readData() {
  const raw = await fs.readFile(DATA_PATH, 'utf8');
  return JSON.parse(raw);
}

// GET /api/items
router.get('/', async (req, res, next) => {
  try {
    const data = await readData();
    const { page = 1, limit = 10, q } = req.query;
    
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    
    if (isNaN(pageNum) || pageNum < 1) {
      return res.status(400).json({ error: 'Invalid page parameter' });
    }
    
    if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
      return res.status(400).json({ error: 'Invalid limit parameter. Must be between 1 and 100' });
    }
    
    let results = data;

    if (q) {
      results = results.filter(item =>
        item.name.toLowerCase().includes(q.toLowerCase()) || 
        item.category.toLowerCase().includes(q.toLowerCase())
      );
    }

    const totalItems = results.length;
    const totalPages = Math.ceil(totalItems / limitNum);
    const startIndex = (pageNum - 1) * limitNum;
    const endIndex = Math.min(startIndex + limitNum, totalItems);
    
    const paginatedResults = results.slice(startIndex, endIndex);

    res.json({
      items: paginatedResults,
      pagination: {
        total: totalItems,
        page: pageNum,
        limit: limitNum,
        totalPages
      }
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/items/:id
router.get('/:id', async (req, res, next) => {
  try {
    const data = await readData();
    const item = data.find(i => i.id === parseInt(req.params.id));
    if (!item) {
      const err = new Error('Item not found');
      err.status = 404;
      throw err;
    }
    res.json(item);
  } catch (err) {
    next(err);
  }
});

// POST /api/items
router.post('/', async (req, res, next) => {
  try {
    // TODO: Validate payload (intentional omission)
    const item = req.body;
    const data = await readData();
    item.id = Date.now();
    data.push(item);
    await fs.writeFile(DATA_PATH, JSON.stringify(data, null, 2));
    res.status(201).json(item);
  } catch (err) {
    next(err);
  }
});

module.exports = router;