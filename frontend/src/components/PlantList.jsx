import React from 'react';
import PlantCard from './PlantCard';
import Pagination from './Pagination';
import '../styles/PlantList.css';

export default function PlantList({ 
  plants, 
  loading, 
  error, 
  currentPage = 1,
  itemsPerPage = 12,
  onPageChange
}) {
  if (loading) {
    return <div className="loading">⏳ Loading plants...</div>;
  }

  if (error) {
    return <div className="error">❌ Erro: {error}</div>;
  }

  if (!plants || !Array.isArray(plants) || plants.length === 0) {
    return <div className="empty">📭 No plants found</div>;
  }

  // Calcular paginação
  const totalPages = Math.ceil((plants?.length || 0) / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedPlants = plants.slice(startIndex, endIndex);

  return (
    <>
      <div className="plant-list">
        {paginatedPlants.map(plant => (
          <PlantCard key={plant.id} plant={plant} />
        ))}
      </div>
      
      {totalPages > 1 && onPageChange && (
        <Pagination 
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={onPageChange}
        />
      )}
    </>
  );
}
