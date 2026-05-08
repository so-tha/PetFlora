import React, { useState, useEffect } from 'react';
import { useMyGarden } from '../hooks/useMyGarden';
import '../styles/PlantCard.css';

export default function PlantCard({ plant }) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isInGarden, setIsInGarden] = useState(false);
  const { addPlant, isInGarden: checkIsInGarden } = useMyGarden();

  useEffect(() => {
    // Verifica se planta já está no garden
    setIsInGarden(checkIsInGarden(plant.id));
  }, [plant.id, checkIsInGarden]);

  const getSizeLabel = (size) => {
    const sizeMap = {
      'small': 'Small (Desk)',
      'medium': 'Medium (Floor)',
      'large': 'Large (Tree)'
    };
    return sizeMap[size] || 'Medium Size';
  };

  const getLightLabel = (light) => {
    const lightMap = {
      'low': 'Low Light',
      'medium': 'Medium Light',
      'high': 'High Light'
    };
    return lightMap[light] || 'Light Neutral';
  };

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  const handleImageError = () => {
    setImageError(true);
  };

  const handleAddToGarden = () => {
    addPlant(plant);
    setIsInGarden(true);
    // Feedback visual
    alert(`✅ "${plant.commonNames?.[0] || plant.scientificName}" added to your garden!`);
  };

  return (
    <div className="plant-card">
      <div className="card-image-container">
        {plant.imageUrl && !imageError ? (
          <>
            {!imageLoaded && <div className="image-loading">⏳</div>}
            <img
              src={plant.imageUrl}
              alt={plant.commonNames?.[0] || plant.scientificName}
              className={`card-image ${imageLoaded ? 'loaded' : ''}`}
              onLoad={handleImageLoad}
              onError={handleImageError}
            />
          </>
        ) : (
          <div className="card-placeholder">
            <div className="placeholder-icon">🌿</div>
          </div>
        )}
      </div>

      <div className="card-badge">
        {plant.toxic ? '⚠️ NOT SAFE' : '✅ PET SAFE'}
      </div>

      <div className="card-content">
        <h3 className="card-title">{plant.commonNames?.[0] || 'Plant'}</h3>
        
        <p className="card-scientific">
          <em>{plant.scientificName || 'N/A'}</em>
        </p>

        <div className="card-meta">
          <span className="meta-item">
            <strong>Family:</strong> {plant.family || 'Unknown'}
          </span>
        </div>

        {plant.commonNames && plant.commonNames.length > 1 && (
          <div className="card-aliases">
            <strong>Also known as:</strong> {plant.commonNames.slice(1).join(', ')}
          </div>
        )}

        <button 
          className={`card-btn ${isInGarden ? 'in-garden' : ''}`}
          onClick={handleAddToGarden}
          disabled={isInGarden}
        >
          <span>{isInGarden ? '✓' : '+'}</span> 
          {isInGarden ? 'In Garden' : 'Add to Garden'}
        </button>
      </div>
    </div>
  );
}

