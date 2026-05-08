import React, { useState } from 'react';
import '../styles/SearchBar.css';

export default function SearchBar({ onSearch }) {
  const [query, setQuery] = useState('');

  const handleSearch = (e) => {
    const value = e.target.value;
    setQuery(value);
    onSearch?.(value);
  };

  return (
    <div className="search-bar">
      <input
        type="text"
        placeholder="Search for plants like 'Boston Fern' or 'Calathea'..."
        value={query}
        onChange={handleSearch}
        className="search-input"
      />
    </div>
  );
}
