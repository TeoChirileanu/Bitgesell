const request = require('supertest');
const express = require('express');
const fs = require('fs').promises;
const itemsRouter = require('../src/routes/items');

jest.mock('fs', () => ({
  promises: {
    readFile: jest.fn(),
    writeFile: jest.fn().mockResolvedValue(undefined)
  }
}));

// Sample test data based on data.json
const testItems = [
  { id: 1, name: "Laptop Pro", category: "Electronics", price: 2499 },
  { id: 2, name: "Noise Cancelling Headphones", category: "Electronics", price: 399 },
  { id: 3, name: "Ultra-Wide Monitor", category: "Electronics", price: 999 },
  { id: 4, name: "4K Monitor", category: "Electronics", price: 1999 },
  { id: 5, name: "5K2K Monitor", category: "Electronics", price: 2999 },
  { id: 6, name: "Ergonomic Chair", category: "Furniture", price: 799 },
  { id: 7, name: "Standing Desk", category: "Furniture", price: 119 }
];

const app = express();
app.use(express.json());
app.use('/api/items', itemsRouter);

app.use((err, req, res, next) => {
  res.status(err.status || 500).json({ error: err.message });
});

describe('Items Router', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    fs.readFile.mockResolvedValue(JSON.stringify(testItems));
  });

  // GET /api/items - Happy Path
  describe('GET /api/items', () => {
    test('should return all items', async () => {
      const response = await request(app).get('/api/items');
      
      expect(response.status).toBe(200);
      expect(response.body.items).toBeDefined();
      expect(response.body.pagination).toBeDefined();
      expect(response.body.items.length).toBe(testItems.length);
      expect(response.body.items).toEqual(testItems);
    });

    test('should return filtered items when search query is provided', async () => {
      const response = await request(app).get('/api/items?q=laptop');
      
      expect(response.status).toBe(200);
      expect(response.body.items).toBeDefined();
      expect(response.body.items.length).toBe(1);
      expect(response.body.items[0].name).toBe(testItems[0].name);
    });

    test('should limit the number of items returned when limit is provided', async () => {
      const response = await request(app).get('/api/items?limit=2');
      
      expect(response.status).toBe(200);
      expect(response.body.items).toBeDefined();
      expect(response.body.items.length).toBe(2);
      expect(response.body.items[0].id).toBe(testItems[0].id);
      expect(response.body.items[1].id).toBe(testItems[1].id);
    });

    test('should handle both search query and limit', async () => {
      const response = await request(app).get('/api/items?q=monitor&limit=2');

      expect(response.status).toBe(200);
      expect(response.body.items).toBeDefined();
      expect(response.body.items.length).toBe(2);
    });
  });

  // GET /api/items/:id - Happy Path
  describe('GET /api/items/:id', () => {
    test('should return a specific item by ID', async () => {
      const response = await request(app).get('/api/items/1');
      
      expect(response.status).toBe(200);
      expect(response.body).toEqual(testItems[0]);
    });

    // Error Case
    test('should return 404 if item is not found', async () => {
      const response = await request(app).get('/api/items/-1');
      
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error', 'Item not found');
    });
  });

  // POST /api/items - Happy Path
  describe('POST /api/items', () => {
    test('should create a new item', async () => {
      const newItem = {
        name: "Mechanical Keyboard",
        category: "Electronics",
        price: 149
      };
      
      const response = await request(app)
        .post('/api/items')
        .send(newItem);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.name).toBe(newItem.name);
      expect(response.body.category).toBe(newItem.category);
      expect(response.body.price).toBe(newItem.price);
    });
  });

  // Error Cases
  describe('Error Handling', () => {
    test('should handle file read errors', async () => {
      const message = 'Failed to read file';
      fs.readFile.mockRejectedValue(new Error(message));
      
      const response = await request(app).get('/api/items');
      
      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe(message);
    });

    test('should handle JSON parse errors', async () => {
      const invalidJson = '!@#$%';
      fs.readFile.mockResolvedValue(invalidJson);
      
      const response = await request(app).get('/api/items');
      
      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Unexpected token ! in JSON at position 0');
    });

    test('should handle file write errors on POST', async () => {
      const message = 'Failed to write file';
      fs.writeFile.mockRejectedValue(new Error(message));
      
      const response = await request(app)
        .post('/api/items')
        .send({ name: "Test Item", category: "Test", price: 100 });
      
      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe(message);
    });
  });
});