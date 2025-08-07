import React, { useEffect, useState } from 'react';
import { useData } from '../state/DataContext';
import { Link } from 'react-router-dom';

function Items() {
  const { fetchItems } = useData();
  const [items, setItems] = useState([]);
  
  useEffect(() => {
    let active = true;
    
    const fetchData = async () => {
      try {
        const data = await fetchItems();
        if (active) {
          setItems(data);
        }
      } catch (error) {
        if (active) {
          console.error(error);
        }
      }
    };

    fetchData();

    return () => {
      active = false;
    };
  }, [fetchItems]);

  if (!items.length) return <p>Loading...</p>;

  return (
    <ul>
      {items.map(item => (
        <li key={item.id}>
          <Link to={'/items/' + item.id}>{item.name}</Link>
        </li>
      ))}
    </ul>
  );
}

export default Items;