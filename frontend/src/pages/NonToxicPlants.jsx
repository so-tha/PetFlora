import React, { useState, useEffect } from 'react';
import { plantsAPI } from '../services/api';
import PlantList from '../components/PlantList';
import Sidebar from '../components/Sidebar';
import SearchBar from '../components/SearchBar';
import '../styles/PlantsPage.css';

export default function NonToxicPlants() {
  const [plants, setPlants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [originalPlants, setOriginalPlants] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(12);
  const [filters, setFilters] = useState({ light: 'all', size: 'all' });

  useEffect(() => {
    loadNonToxicPlants();
  }, []);

  const loadNonToxicPlants = async () => {
    try {
      setLoading(true);
      const response = await plantsAPI.getNonToxic();
      setPlants(response.data.plants);
      setOriginalPlants(response.data.plants);
      setCurrentPage(1);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = (plantsToFilter, filterLight, filterSize) => {
    let filtered = plantsToFilter;

    if (filterLight !== 'all') {
      filtered = filtered.filter(p => p.lightRequirements === filterLight);
    }

    if (filterSize !== 'all') {
      filtered = filtered.filter(p => p.size === filterSize);
    }

    return filtered;
  };

  const handleSearch = async (query) => {
    setCurrentPage(1);
    
    if (!query.trim()) {
      const filtered = applyFilters(originalPlants, filters.light, filters.size);
      setPlants(filtered);
      return;
    }

    try {
      const response = await plantsAPI.search(query);
      const nonToxicOnly = response.data.plants.filter(p => !p.toxic);
      const filtered = applyFilters(nonToxicOnly, filters.light, filters.size);
      setPlants(filtered);
    } catch (err) {
      console.error('Erro na busca:', err);
    }
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    setCurrentPage(1);
    
    const filtered = applyFilters(originalPlants, newFilters.light, newFilters.size);
    setPlants(filtered);
  };

  return (
    <div className="plants-page">
      <SearchBar onSearch={handleSearch} />
      
      <div className="plants-container">
        <Sidebar onFilterChange={handleFilterChange} />
        
        <div className="plants-content">
          <div className="content-header">
            <h2>Safe Plants for Your Pet</h2>
            <span className="count">{plants.length} plants Available</span>
          </div>

          <PlantList 
            plants={plants} 
            loading={loading} 
            error={error}
            currentPage={currentPage}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
          />
        </div>
      </div>
    </div>
  );
}

