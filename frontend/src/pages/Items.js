import React, { useEffect, useState, useCallback } from 'react';
import { useData } from '../state/DataContext';
import { Link } from 'react-router-dom';

const PaginationButton = ({ onClick, disabled, children }) => (
  <button 
    onClick={onClick} 
    disabled={disabled}
    style={{ 
      padding: '8px 12px', 
      margin: '0 4px', 
      backgroundColor: disabled ? '#f0f0f0' : '#007bff', 
      color: disabled ? '#888' : 'white',
      border: 'none',
      borderRadius: '4px',
      cursor: disabled ? 'not-allowed' : 'pointer'
    }}
  >
    {children}
  </button>
);

function Items() {
  const { items, pagination, loading, error, fetchItems } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };
  
  // Debounce search term to avoid too many API calls
  useEffect(() => {
    const timerId = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);
    
    return () => {
      clearTimeout(timerId);
    };
  }, [searchTerm]);
  
  const loadItems = useCallback(async (page = 1) => {
    try {
      await fetchItems({ 
        page, 
        limit: pagination.limit, 
        q: debouncedSearchTerm 
      });
    } catch (error) {
      console.error('Failed to fetch items:', error);
    }
  }, [fetchItems, pagination.limit, debouncedSearchTerm]);
  
  useEffect(() => {
    let active = true;
    
    if (active) {
      loadItems(1); // Reset to first page when search changes
    }
    
    return () => {
      active = false;
    };
  }, [debouncedSearchTerm, loadItems]);
  
  const handlePageChange = (newPage) => {
    loadItems(newPage);
  };
  
  const getPageNumbers = () => {
    const { page, totalPages } = pagination;
    const pageNumbers = [];
    
    const maxPages = 5;
    let startPage = Math.max(1, page - Math.floor(maxPages / 2));
    let endPage = Math.min(totalPages, startPage + maxPages - 1);
    
    if (endPage - startPage + 1 < maxPages) {
      startPage = Math.max(1, endPage - maxPages + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }
    
    return pageNumbers;
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Items</h1>
      
      {/* Search input */}
      <div style={{ marginBottom: '20px' }}>
        <input
          type="text"
          placeholder="Search items..."
          value={searchTerm}
          onChange={handleSearchChange}
          style={{ 
            padding: '8px 12px',
            width: '100%',
            maxWidth: '400px',
            borderRadius: '4px',
            border: '1px solid #ccc'
          }}
        />
      </div>
      
      {/* Error message */}
      {error && (
        <div style={{ color: 'red', marginBottom: '20px' }}>
          Error: {error}
        </div>
      )}
      
      {loading ? (
        <p>Loading...</p>
      ) : (
        <>
          {/* Items list */}
          {items.length === 0 ? (
            <p>No items found.</p>
          ) : (
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {items.map(item => (
                <li key={item.id} style={{ 
                  padding: '12px', 
                  marginBottom: '8px', 
                  border: '1px solid #eee',
                  borderRadius: '4px'
                }}>
                  <Link 
                    to={'/items/' + item.id}
                    style={{ 
                      textDecoration: 'none', 
                      color: '#007bff',
                      fontWeight: 'bold',
                      fontSize: '16px'
                    }}
                  >
                    {item.name}
                  </Link>
                  <div style={{ color: '#666', marginTop: '4px' }}>
                    Category: {item.category} | Price: ${item.price}
                  </div>
                </li>
              ))}
            </ul>
          )}
          
          {pagination.totalPages > 1 && (
            <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'center' }}>
              <PaginationButton 
                onClick={() => handlePageChange(1)} 
                disabled={pagination.page === 1}
              >
                First
              </PaginationButton>
              
              <PaginationButton 
                onClick={() => handlePageChange(pagination.page - 1)} 
                disabled={pagination.page === 1}
              >
                Previous
              </PaginationButton>
              
              {getPageNumbers().map(pageNum => (
                <PaginationButton 
                  key={pageNum}
                  onClick={() => handlePageChange(pageNum)}
                  disabled={pagination.page === pageNum}
                  style={{ 
                    backgroundColor: pagination.page === pageNum ? '#0056b3' : '#007bff',
                    fontWeight: pagination.page === pageNum ? 'bold' : 'normal'
                  }}
                >
                  {pageNum}
                </PaginationButton>
              ))}
              
              <PaginationButton 
                onClick={() => handlePageChange(pagination.page + 1)} 
                disabled={pagination.page === pagination.totalPages}
              >
                Next
              </PaginationButton>
              
              <PaginationButton 
                onClick={() => handlePageChange(pagination.totalPages)} 
                disabled={pagination.page === pagination.totalPages}
              >
                Last
              </PaginationButton>
            </div>
          )}
          
          <div style={{ marginTop: '10px', textAlign: 'center', color: '#666' }}>
            {pagination.total > 0 && (
              <>
                Showing {(pagination.page - 1) * pagination.limit + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} items
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default Items;