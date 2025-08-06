const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const router = express.Router();

const DATA_PATH = path.join(__dirname, '../../../data/items.json');

let statsCache = null;
let lastModified = null;

function calculateStats(items) {
  return {
    total: items.length,
    averagePrice: items.length > 0 ? items.reduce((acc, cur) => acc + cur.price, 0) / items.length : 0
  };
}

async function getFileModTime(filePath) {
  try {
    const stats = await fs.stat(filePath);
    return stats.mtime.getTime();
  } catch (err) {
    return null;
  }
}

// GET /api/stats
router.get('/', async (req, res, next) => {
  try {
    const currentModTime = await getFileModTime(DATA_PATH);

    if (!statsCache || !lastModified || currentModTime !== lastModified) {
      // Cache miss or file changed - recalculate
      const raw = await fs.readFile(DATA_PATH, 'utf8');
      const items = JSON.parse(raw);

      statsCache = calculateStats(items);
      lastModified = currentModTime;
    }

    res.json(statsCache);
  } catch (err) {
    next(err);
  }
});

module.exports = router;