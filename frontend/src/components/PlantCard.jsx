import React, { useState, useEffect } from 'react';
import { useMyGarden } from '../hooks/useMyGarden';
import { useToast } from './Toast';
import '../styles/PlantCard.css';

export default function PlantCard({ plant }) {
  const [currentImageUrl, setCurrentImageUrl] = useState(plant.imageUrl);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isInGarden, setIsInGarden] = useState(false);
  const { addPlant, isInGarden: checkIsInGarden } = useMyGarden();
  const { showToast } = useToast();

  useEffect(() => {
    setIsInGarden(checkIsInGarden(plant.id));
  }, [plant.id, checkIsInGarden]);

  useEffect(() => {
    // Reset state for new plant
    setCurrentImageUrl(plant.imageUrl);
    setImageLoaded(false);
    setImageError(false);

    if (plant.imageUrl) {
      return;
    }

    let isMounted = true;

    const fetchImage = async () => {
      const cleanSciName = (name) => {
        if (!name) return '';
        let cleaned = name.replace(/\([^)]*\)/g, '');
        cleaned = cleaned.replace(/\s+\b(spp\b\.?|spp\b|sp\b\.?|species|cv\b\.?|cv|var\b\.?|subsp\b\.?)\s*$/gi, '');
        return cleaned.trim();
      };

      const query = cleanSciName(plant.scientificName) || plant.commonNames?.[0];
      if (!query) return;

      try {
        const response = await fetch(
          `https://api.inaturalist.org/v1/taxa/autocomplete?q=${encodeURIComponent(query)}`
        );
        if (!response.ok) return;
        const data = await response.json();

        if (data.results && data.results.length > 0) {
          const taxon = data.results[0];
          if (taxon.default_photo && taxon.default_photo.medium_url) {
            const imgUrl = taxon.default_photo.medium_url;
            const source = 'iNaturalist';
            const sourceUrl = `https://www.inaturalist.org/taxa/${taxon.id}`;

            if (isMounted) {
              setCurrentImageUrl(imgUrl);
            }

            // Envia de volta para o backend para salvar/fazer cache
            const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
            fetch(`${apiBaseUrl}/api/plants/${plant.id}/image`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                imageUrl: imgUrl,
                imageSource: source,
                imageSourceUrl: sourceUrl
              })
            }).catch(err => console.error('Erro ao fazer cache da imagem:', err));
          }
        }
      } catch (err) {
        console.error('Erro ao buscar imagem no iNaturalist:', err);
      }
    };

    fetchImage();

    return () => {
      isMounted = false;
    };
  }, [plant.id, plant.imageUrl, plant.scientificName, plant.commonNames]);

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
    showToast(`"${plant.commonNames?.[0] || plant.scientificName}" added to your garden!`, 'success');
  };

  return (
    <div className="plant-card">
      <div className="card-image-container">
        {currentImageUrl && !imageError ? (
          <>
            {!imageLoaded && <div className="image-loading">⏳</div>}
            <img
              src={currentImageUrl}
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

