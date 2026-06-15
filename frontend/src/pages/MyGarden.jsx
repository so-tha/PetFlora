import React, { useState, useEffect } from 'react';
import { useMyGarden } from '../hooks/useMyGarden';
import { useToast } from '../components/Toast';
import ConfirmModal from '../components/ConfirmModal';
import PlantList from '../components/PlantList';
import '../styles/PlantsPage.css';
import '../styles/MyGarden.css';

export default function MyGarden() {
  const { getSavedPlants, removePlant, clearGarden } = useMyGarden();
  const [plants, setPlants] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(12);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    loadGardenPlants();
  }, []);

  const loadGardenPlants = () => {
    const saved = getSavedPlants() || [];
    setPlants(Array.isArray(saved) ? saved : []);
    setCurrentPage(1);
  };

  const handleRemovePlant = (plantId) => {
    const plantToRemove = plants.find(p => p.id === plantId);
    removePlant(plantId);
    loadGardenPlants();
    if (plantToRemove) {
      showToast(`"${plantToRemove.commonNames?.[0] || plantToRemove.scientificName}" removed from your garden.`, 'info', 'Removed');
    }
  };

  const handleClearGarden = () => {
    setIsModalOpen(true);
  };

  const handleConfirmClear = () => {
    clearGarden();
    loadGardenPlants();
    setIsModalOpen(false);
    showToast('All plants have been cleared from your garden.', 'warning', 'Garden Cleared');
  };

  return (
    <div className="plants-page">
      <div className="plants-container my-garden-container">
        <div className="plants-content full-width">
          <div className="content-header">
            <h2>🌿 My Garden</h2>
            <span className="count">{plants.length} plants</span>
          </div>

          {plants.length > 0 && (
            <div className="garden-actions">
              <button 
                className="clear-garden-btn"
                onClick={handleClearGarden}
              >
                🗑️ Clear Garden
              </button>
            </div>
          )}

          {plants.length === 0 ? (
            <div className="empty-garden">
              <div className="empty-icon">🌱</div>
              <h3>Your Garden is Empty</h3>
              <p>Start adding plants from the Safe or Toxic plants sections!</p>
            </div>
          ) : (
            <GardenPlantList 
              plants={plants}
              onRemove={handleRemovePlant}
              currentPage={currentPage}
              itemsPerPage={itemsPerPage}
              onPageChange={setCurrentPage}
            />
          )}
        </div>
      </div>
      <ConfirmModal
        isOpen={isModalOpen}
        title="Clear Garden?"
        message="Are you sure you want to clear your garden? This action cannot be undone."
        confirmText="Clear Garden"
        cancelText="Cancel"
        type="danger"
        onConfirm={handleConfirmClear}
        onCancel={() => setIsModalOpen(false)}
      />
    </div>
  );
}

/**
 * Componente para listar plantas do garden com botão de remover
 */
function GardenPlantList({ plants, onRemove, currentPage, itemsPerPage, onPageChange }) {
  const totalPages = Math.ceil(plants.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedPlants = plants.slice(startIndex, endIndex);

  return (
    <>
      <div className="garden-plants-grid">
        {paginatedPlants.map(plant => (
          <div key={plant.id} className="garden-plant-card">
            <div className="garden-plant-image">
              {plant.imageUrl ? (
                <img 
                  src={plant.imageUrl} 
                  alt={plant.commonNames?.[0] || plant.scientificName}
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextElementSibling.style.display = 'flex';
                  }}
                />
              ) : null}
              <div className="garden-plant-placeholder">🌿</div>
            </div>

            <div className="garden-plant-info">
              <h3>{plant.commonNames?.[0] || 'Plant'}</h3>
              <p className="scientific"><em>{plant.scientificName}</em></p>
              
              <div className="plant-details">
                <span className="badge">
                  {plant.toxic ? '⚠️ Toxic' : '✅ Safe'}
                </span>
                <span className="light-badge">
                  {plant.lightRequirements === 'low' ? '🌑' : 
                   plant.lightRequirements === 'high' ? '🌞' : '🌤️'}
                  {' '}{plant.lightRequirements === 'low' ? 'Low' : 
                       plant.lightRequirements === 'high' ? 'High' : 'Medium'}
                </span>
                <span className="size-badge">
                  {plant.size === 'small' ? '📱' : 
                   plant.size === 'large' ? '🌳' : '🏡'}
                  {' '}{plant.size === 'small' ? 'Small' : 
                      plant.size === 'large' ? 'Large' : 'Medium'}
                </span>
              </div>

              <button 
                className="remove-btn"
                onClick={() => onRemove(plant.id)}
              >
                🗑️ Remove
              </button>
            </div>
          </div>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="pagination-footer">
          <button 
            disabled={currentPage === 1}
            onClick={() => onPageChange(currentPage - 1)}
          >
            ← Previous
          </button>
          <span>{currentPage} / {totalPages}</span>
          <button 
            disabled={currentPage === totalPages}
            onClick={() => onPageChange(currentPage + 1)}
          >
            Next →
          </button>
        </div>
      )}
    </>
  );
}
