const request = require('supertest');
const express = require('express');
const itemsRouter = require('../src/routes/items');

// Create a test app
const app = express();
app.use(express.json());
app.use('/api/items', itemsRouter);

describe('Items API Pagination and Search', () => {
  // Test default pagination (page=1, limit=10)
  test('GET /api/items returns first page with default pagination', async () => {
    const response = await request(app).get('/api/items');
    
    expect(response.status).toBe(200);
    expect(response.body.items).toBeDefined();
    expect(response.body.pagination).toBeDefined();
    expect(response.body.pagination.page).toBe(1);
    expect(response.body.pagination.limit).toBe(10);
    expect(response.body.items.length).toBeLessThanOrEqual(10);
  });

  // Test custom pagination
  test('GET /api/items with custom pagination parameters', async () => {
    const response = await request(app).get('/api/items?page=2&limit=5');
    
    expect(response.status).toBe(200);
    expect(response.body.items).toBeDefined();
    expect(response.body.pagination).toBeDefined();
    expect(response.body.pagination.page).toBe(2);
    expect(response.body.pagination.limit).toBe(5);
    expect(response.body.items.length).toBeLessThanOrEqual(5);
  });

  // Test search functionality
  test('GET /api/items with search query', async () => {
    const searchTerm = 'desk';
    const response = await request(app).get(`/api/items?q=${searchTerm}`);
    
    expect(response.status).toBe(200);
    expect(response.body.items).toBeDefined();
    
    // All returned items should contain the search term in name or category
    response.body.items.forEach(item => {
      const nameMatch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
      const categoryMatch = item.category.toLowerCase().includes(searchTerm.toLowerCase());
      expect(nameMatch || categoryMatch).toBe(true);
    });
  });

  // Test search with pagination
  test('GET /api/items with search query and pagination', async () => {
    const searchTerm = 'electronics';
    const response = await request(app).get(`/api/items?q=${searchTerm}&page=1&limit=3`);
    
    expect(response.status).toBe(200);
    expect(response.body.items).toBeDefined();
    expect(response.body.pagination).toBeDefined();
    expect(response.body.pagination.page).toBe(1);
    expect(response.body.pagination.limit).toBe(3);
    expect(response.body.items.length).toBeLessThanOrEqual(3);
    
    // All returned items should be in the Electronics category
    response.body.items.forEach(item => {
      expect(item.category.toLowerCase()).toBe(searchTerm.toLowerCase());
    });
  });

  // Test invalid pagination parameters
  test('GET /api/items with invalid page parameter', async () => {
    const response = await request(app).get('/api/items?page=invalid');
    
    expect(response.status).toBe(400);
    expect(response.body.error).toBeDefined();
  });

  test('GET /api/items with invalid limit parameter', async () => {
    const response = await request(app).get('/api/items?limit=invalid');
    
    expect(response.status).toBe(400);
    expect(response.body.error).toBeDefined();
  });

  test('GET /api/items with out-of-range limit parameter', async () => {
    const response = await request(app).get('/api/items?limit=101');
    
    expect(response.status).toBe(400);
    expect(response.body.error).toBeDefined();
  });

  // Test empty search results
  test('GET /api/items with search query that returns no results', async () => {
    const response = await request(app).get('/api/items?q=nonexistentitem');
    
    expect(response.status).toBe(200);
    expect(response.body.items).toBeDefined();
    expect(response.body.items.length).toBe(0);
    expect(response.body.pagination.total).toBe(0);
  });
});