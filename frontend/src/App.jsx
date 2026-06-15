import React, { useState } from 'react';
import Header from './components/Header';
import NonToxicPlants from './pages/NonToxicPlants';
import ToxicPlants from './pages/ToxicPlants';
import MyGarden from './pages/MyGarden';
import { ToastProvider } from './components/Toast';
import './App.css';

export default function App() {
  const [activeTab, setActiveTab] = useState('safe');
  const [pageMode, setPageMode] = useState('explore'); // 'explore' ou 'mygarden'

  return (
    <ToastProvider>
      <div className="app">
        <Header 
          activeTab={activeTab} 
          setActiveTab={setActiveTab}
          pageMode={pageMode}
          setPageMode={setPageMode}
        />
        
        <main className="app-main">
          {pageMode === 'mygarden' && <MyGarden />}
          
          {pageMode === 'explore' && (
            <>
              {activeTab === 'safe' && <NonToxicPlants />}
              {activeTab === 'toxic' && <ToxicPlants />}
            </>
          )}
        </main>
      </div>
    </ToastProvider>
  );
}
