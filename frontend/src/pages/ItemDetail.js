import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';

function ItemDetail() {
  const { id } = useParams();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    fetch('/api/items/' + id)
      .then(res => res.ok ? res.json() : Promise.reject(res))
      .then(data => {
        setItem(data);
        setLoading(false);
      })
      .catch(err => {
        setError('Failed to load item details');
        setLoading(false);
      });
  }, [id, navigate]);

  if (loading) {
    return (
      <div style={{ 
        padding: '20px',
        maxWidth: '800px',
        margin: '0 auto'
      }}>
        <div style={{ 
          padding: '20px', 
          backgroundColor: '#f9f9f9',
          borderRadius: '4px',
          height: '200px',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{ 
            width: '60%', 
            height: '24px', 
            backgroundColor: '#efefef',
            marginBottom: '16px',
            borderRadius: '4px'
          }}></div>
          <div style={{ 
            width: '40%', 
            height: '18px', 
            backgroundColor: '#efefef',
            marginBottom: '12px',
            borderRadius: '4px'
          }}></div>
          <div style={{ 
            width: '30%', 
            height: '18px', 
            backgroundColor: '#efefef',
            borderRadius: '4px'
          }}></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ 
        padding: '20px',
        maxWidth: '800px',
        margin: '0 auto'
      }}>
        <div style={{ 
          padding: '20px', 
          backgroundColor: '#fff8f8',
          border: '1px solid #ffdddd',
          borderRadius: '4px',
          color: '#d32f2f'
        }}>
          {error}
        </div>
        <div style={{ marginTop: '20px' }}>
          <Link 
            to="/"
            style={{ 
              textDecoration: 'none', 
              color: '#007bff',
              fontWeight: 'bold'
            }}
          >
            &larr; Back to Items
          </Link>
        </div>
      </div>
    );
  }

  if (!item) return null;

  return (
    <div style={{ 
      padding: '20px',
      maxWidth: '800px',
      margin: '0 auto'
    }}>
      <div style={{ 
        padding: '20px', 
        border: '1px solid #eee',
        borderRadius: '4px',
        backgroundColor: '#fff',
        boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
      }}>
        <h1 style={{ 
          color: '#333',
          marginTop: 0,
          fontSize: '24px'
        }}>{item.name}</h1>
        
        <div style={{ 
          padding: '12px',
          backgroundColor: '#f9f9f9',
          borderRadius: '4px',
          marginBottom: '16px'
        }}>
          <p style={{ 
            margin: '8px 0',
            color: '#666'
          }}>
            <strong style={{ color: '#333' }}>Category:</strong> {item.category}
          </p>
          <p style={{ 
            margin: '8px 0',
            color: '#666'
          }}>
            <strong style={{ color: '#333' }}>Price:</strong> <span style={{ color: '#007bff', fontWeight: 'bold' }}>${item.price}</span>
          </p>
        </div>
      </div>
      
      <div style={{ marginTop: '20px' }}>
        <Link 
          to="/"
          style={{ 
            textDecoration: 'none', 
            color: '#007bff',
            fontWeight: 'bold'
          }}
        >
          &larr; Back to Items
        </Link>
      </div>
    </div>
  );
}

export default ItemDetail;