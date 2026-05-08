import React from 'react';
import '../styles/Header.css';

export default function Header({ activeTab, setActiveTab, pageMode, setPageMode }) {
  const handleExploreClick = () => {
    setPageMode('explore');
  };

  const handleMyGardenClick = () => {
    setPageMode('mygarden');
  };

  return (
    <header className="header">
      <div className="header-container">
        <div className="logo">
          <h1>🌿 PetFlora Haven</h1>
        </div>
        
        <nav className="nav">
          <button 
            className={`nav-link ${pageMode === 'explore' ? 'active' : ''}`}
            onClick={handleExploreClick}
          >
            Explore
          </button>
          <button 
            className={`nav-link ${pageMode === 'mygarden' ? 'active' : ''}`}
            onClick={handleMyGardenClick}
          >
            My Garden
          </button>
        </nav>
      </div>

      {pageMode === 'explore' && (
        <>
          <div className="hero">
            <h2 className="hero-title">Discover Your Safe Sanctuary</h2>
            <p className="hero-subtitle">
              Browse our curated selection of pet-safe greenery, carefully vetted by botanical experts and veterinarians.
            </p>
          </div>

          <div className="tab-switcher">
            <button
              className={`tab-item ${activeTab === 'safe' ? 'active' : ''}`}
              onClick={() => setActiveTab('safe')}
            >
              ✅ Safe Plants
            </button>
            <button
              className={`tab-item ${activeTab === 'toxic' ? 'active' : ''}`}
              onClick={() => setActiveTab('toxic')}
            >
              ⚠️ Toxic Plants
            </button>
          </div>
        </>
      )}
    </header>
  );
}
