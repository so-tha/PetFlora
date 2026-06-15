import React, { createContext, useContext, useState, useCallback } from 'react';
import '../styles/Toast.css';

const ToastContext = createContext(null);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) =>
      prev.map((t) => (t.id === id ? { ...t, isFadingOut: true } : t))
    );
    // Wait for the slide-out/fade-out animation to complete before removing from DOM
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 400);
  }, []);

  const showToast = useCallback((message, type = 'success', title = '') => {
    const id = Date.now() + Math.random().toString(36).substr(2, 9);
    
    let defaultTitle = title;
    if (!title) {
      if (type === 'success') defaultTitle = 'Added to Garden';
      else if (type === 'info') defaultTitle = 'Information';
      else if (type === 'warning') defaultTitle = 'Warning';
      else if (type === 'error') defaultTitle = 'Error';
    }

    const newToast = { id, message, type, title: defaultTitle, isFadingOut: false };
    setToasts((prev) => [...prev, newToast]);

    // Automaticaly start fading out after 3.5 seconds
    const fadeTimer = setTimeout(() => {
      setToasts((prev) =>
        prev.map((t) => (t.id === id ? { ...t, isFadingOut: true } : t))
      );
    }, 3500);

    // Completely remove the toast after the fade animation completes (3.9s total)
    const removeTimer = setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3900);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(removeTimer);
    };
  }, []);

  const getIcon = (type) => {
    switch (type) {
      case 'success':
        return '🌿';
      case 'info':
        return 'ℹ️';
      case 'warning':
        return '⚠️';
      case 'error':
        return '❌';
      default:
        return '🔔';
    }
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="toast-container">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`toast-card ${toast.type} ${toast.isFadingOut ? 'fade-out' : ''}`}
          >
            <div className="toast-icon">{getIcon(toast.type)}</div>
            <div className="toast-body">
              {toast.title && <div className="toast-title">{toast.title}</div>}
              <div className="toast-message">{toast.message}</div>
            </div>
            <button className="toast-close" onClick={() => removeToast(toast.id)}>
              &times;
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
