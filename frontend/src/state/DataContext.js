import React, { createContext, useCallback, useContext, useState } from 'react';

const DataContext = createContext();

export function DataProvider({ children }) {
  const [items, setItems] = useState([]);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchItems = useCallback(async ({ page = 1, limit = 10, q = '' } = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      const queryParams = new URLSearchParams();
      queryParams.append('page', page);
      queryParams.append('limit', limit);
      
      if (q) {
        queryParams.append('q', q);
      }
      
      const res = await fetch(`http://localhost:3001/api/items?${queryParams.toString()}`);
      
      if (!res.ok) {
        throw new Error(`API error: ${res.status}`);
      }
      
      const data = await res.json();
      
      setItems(data.items);
      setPagination(data.pagination);
      
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <DataContext.Provider value={{ 
      items, 
      pagination, 
      loading, 
      error, 
      fetchItems 
    }}>
      {children}
    </DataContext.Provider>
  );
}

export const useData = () => useContext(DataContext);