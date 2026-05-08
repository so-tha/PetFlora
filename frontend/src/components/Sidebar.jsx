import React, { useState } from 'react';
import '../styles/Sidebar.css';

export default function Sidebar({ onFilterChange }) {
  const [lightReq, setLightReq] = useState('all');
  const [sizeReq, setSizeReq] = useState('all');

  const handleLightChange = (value) => {
    setLightReq(value);
    onFilterChange?.({ light: value, size: sizeReq });
  };

  const handleSizeChange = (value) => {
    setSizeReq(value);
    onFilterChange?.({ light: lightReq, size: value });
  };

  return (
    <aside className="sidebar">
      <div className="filter-group">
        <h3 className="filter-title">Light Requirements</h3>
        <label className="filter-option">
          <input 
            type="radio" 
            value="all" 
            checked={lightReq === 'all'}
            onChange={(e) => handleLightChange(e.target.value)}
          />
          <span>All Levels</span>
        </label>
        <label className="filter-option">
          <input 
            type="radio" 
            value="low" 
            checked={lightReq === 'low'}
            onChange={(e) => handleLightChange(e.target.value)}
          />
          <span>Low Light</span>
        </label>
        <label className="filter-option">
          <input 
            type="radio" 
            value="medium" 
            checked={lightReq === 'medium'}
            onChange={(e) => handleLightChange(e.target.value)}
          />
          <span>Medium Light</span>
        </label>
        <label className="filter-option">
          <input 
            type="radio" 
            value="high" 
            checked={lightReq === 'high'}
            onChange={(e) => handleLightChange(e.target.value)}
          />
          <span>High Light</span>
        </label>
      </div>

      <div className="filter-group">
        <h3 className="filter-title">Size</h3>
        <label className="filter-option">
          <input 
            type="radio" 
            value="all" 
            checked={sizeReq === 'all'}
            onChange={(e) => handleSizeChange(e.target.value)}
          />
          <span>All Sizes</span>
        </label>
        <label className="filter-option">
          <input 
            type="radio" 
            value="small" 
            checked={sizeReq === 'small'}
            onChange={(e) => handleSizeChange(e.target.value)}
          />
          <span>Small (Desk)</span>
        </label>
        <label className="filter-option">
          <input 
            type="radio" 
            value="medium" 
            checked={sizeReq === 'medium'}
            onChange={(e) => handleSizeChange(e.target.value)}
          />
          <span>Medium (Floor)</span>
        </label>
        <label className="filter-option">
          <input 
            type="radio" 
            value="large" 
            checked={sizeReq === 'large'}
            onChange={(e) => handleSizeChange(e.target.value)}
          />
          <span>Large (Tree)</span>
        </label>
      </div>
    </aside>
  );
}
