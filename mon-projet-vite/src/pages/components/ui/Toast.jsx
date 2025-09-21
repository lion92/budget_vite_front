import React, { useState, useEffect, useCallback, useMemo } from 'react';
import ReactDOM from 'react-dom/client';
import './Toast.css';

// Contexte pour gérer les toasts globalement
const toasts = new Set();
const listeners = new Set();

const notifyListeners = () => {
  listeners.forEach(listener => listener([...toasts]));
};

// Toast de debug simple pour mobile
const createSimpleToast = (message, type = 'info') => {
  // Détecter si on est sur mobile
  const isMobile = window.innerWidth <= 768;

  // Supprimer les anciens toasts pour éviter l'accumulation
  const oldToasts = document.querySelectorAll('.simple-toast-debug');
  oldToasts.forEach(old => {
    if (document.body.contains(old)) {
      old.remove();
    }
  });

  // Créer un toast directement dans le DOM pour debug
  const toastEl = document.createElement('div');
  toastEl.className = 'simple-toast-debug';

  const backgroundColor = type === 'error' ? '#ef4444' :
                         type === 'success' ? '#10b981' :
                         type === 'warning' ? '#f59e0b' : '#3b82f6';

  toastEl.style.cssText = `
    position: fixed !important;
    top: ${isMobile ? '16px' : '20px'} !important;
    left: 50% !important;
    transform: translateX(-50%) translateZ(0) !important;
    background: ${backgroundColor} !important;
    color: white !important;
    padding: ${isMobile ? '18px 22px' : '16px 24px'} !important;
    border-radius: ${isMobile ? '14px' : '12px'} !important;
    z-index: 2147483647 !important;
    box-shadow: 0 12px 28px rgba(0,0,0,0.4), 0 6px 16px rgba(0,0,0,0.2) !important;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
    font-size: ${isMobile ? '16px' : '14px'} !important;
    font-weight: ${isMobile ? '600' : '500'} !important;
    max-width: ${isMobile ? '90vw' : '400px'} !important;
    min-width: ${isMobile ? '300px' : '300px'} !important;
    min-height: ${isMobile ? '60px' : '48px'} !important;
    text-align: center !important;
    pointer-events: auto !important;
    opacity: 1 !important;
    visibility: visible !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    width: auto !important;
    height: auto !important;
    border: 2px solid rgba(255,255,255,0.3) !important;
    backdrop-filter: blur(12px) !important;
    -webkit-backdrop-filter: blur(12px) !important;
    animation: simpleToastIn 0.4s cubic-bezier(0.4, 0, 0.2, 1) !important;
    will-change: transform, opacity !important;
    isolation: isolate !important;
    line-height: 1.4 !important;
    text-shadow: 0 1px 2px rgba(0,0,0,0.2) !important;
  `;

  // Ajouter l'animation CSS
  if (!document.getElementById('simple-toast-styles')) {
    const styleEl = document.createElement('style');
    styleEl.id = 'simple-toast-styles';
    styleEl.textContent = `
      @keyframes simpleToastIn {
        from { opacity: 0; transform: translateX(-50%) translateY(-20px); }
        to { opacity: 1; transform: translateX(-50%) translateY(0); }
      }
      .simple-toast-debug {
        user-select: none;
        -webkit-user-select: none;
        -webkit-tap-highlight-color: transparent;
      }
    `;
    document.head.appendChild(styleEl);
  }

  toastEl.textContent = message;
  document.body.appendChild(toastEl);

  // Vérifier que l'élément est bien visible
  setTimeout(() => {
    const rect = toastEl.getBoundingClientRect();
    console.log('Toast position:', {
      top: rect.top,
      left: rect.left,
      width: rect.width,
      height: rect.height,
      visible: rect.width > 0 && rect.height > 0
    });
  }, 100);

  // Auto-remove after 4 seconds avec animation
  setTimeout(() => {
    if (document.body.contains(toastEl)) {
      toastEl.style.animation = 'simpleToastOut 0.3s ease-in forwards';
      toastEl.style.setProperty('animation', 'simpleToastOut 0.3s ease-in forwards', 'important');
      setTimeout(() => {
        if (document.body.contains(toastEl)) {
          document.body.removeChild(toastEl);
        }
      }, 300);
    }
  }, 4000);

  console.log('Simple toast created:', message, 'isMobile:', isMobile);

  // Ajouter l'animation de sortie si elle n'existe pas
  if (!document.querySelector('style[data-toast-out]')) {
    const outStyleEl = document.createElement('style');
    outStyleEl.setAttribute('data-toast-out', 'true');
    outStyleEl.textContent = `
      @keyframes simpleToastOut {
        from { opacity: 1; transform: translateX(-50%) translateY(0); }
        to { opacity: 0; transform: translateX(-50%) translateY(-20px); }
      }
    `;
    document.head.appendChild(outStyleEl);
  }
};

// API pour créer des toasts
export const toast = {
  success: (message, options = {}) => {
    console.log('Toast.success called with:', message, options);

    // Toujours créer le toast simple en premier (garantie d'affichage)
    createSimpleToast(message, 'success');

    // Puis essayer le système React (pour les fonctionnalités avancées)
    try {
      return addToast({ message, type: 'success', ...options });
    } catch (error) {
      console.warn('React toast failed, using simple fallback:', error);
      return null;
    }
  },
  error: (message, options = {}) => {
    console.log('Toast.error called with:', message, options);

    createSimpleToast(message, 'error');

    try {
      return addToast({ message, type: 'error', ...options });
    } catch (error) {
      console.warn('React toast failed, using simple fallback:', error);
      return null;
    }
  },
  warning: (message, options = {}) => {
    console.log('Toast.warning called with:', message, options);

    createSimpleToast(message, 'warning');

    try {
      return addToast({ message, type: 'warning', ...options });
    } catch (error) {
      console.warn('React toast failed, using simple fallback:', error);
      return null;
    }
  },
  info: (message, options = {}) => {
    console.log('Toast.info called with:', message, options);

    createSimpleToast(message, 'info');

    try {
      return addToast({ message, type: 'info', ...options });
    } catch (error) {
      console.warn('React toast failed, using simple fallback:', error);
      return null;
    }
  },
  loading: (message, options = {}) => {
    console.log('Toast.loading called with:', message, options);
    return addToast({ message, type: 'loading', duration: 0, ...options });
  },
  promise: async (promise, messages, options = {}) => {
    const loadingToast = toast.loading(messages.loading || 'Chargement...', options);

    try {
      const result = await promise;
      toast.success(messages.success || 'Succès!', { ...options, id: loadingToast });
      return result;
    } catch (error) {
      toast.error(messages.error || 'Une erreur est survenue', { ...options, id: loadingToast });
      throw error;
    }
  },
  dismiss: (id) => {
    if (id) {
      toasts.forEach(toast => {
        if (toast.id === id) {
          removeToast(toast.id);
        }
      });
    } else {
      toasts.clear();
      notifyListeners();
    }
  }
};

const addToast = (toastData) => {
  const id = toastData.id || Date.now() + Math.random();
  const duration = toastData.duration !== undefined ? toastData.duration : 5000;

  const toastObj = {
    id,
    message: toastData.message,
    type: toastData.type || 'info',
    duration,
    createdAt: Date.now(),
    ...toastData
  };

  console.log('Adding toast:', toastObj);

  // Si un toast avec le même ID existe déjà, le remplacer
  toasts.forEach(existing => {
    if (existing.id === id) {
      toasts.delete(existing);
    }
  });

  toasts.add(toastObj);
  console.log('Current toasts count:', toasts.size);
  notifyListeners();

  // Auto-dismiss après la durée spécifiée
  if (duration > 0) {
    setTimeout(() => {
      removeToast(id);
    }, duration);
  }

  return id;
};

const removeToast = (id) => {
  toasts.forEach(toast => {
    if (toast.id === id) {
      toasts.delete(toast);
    }
  });
  notifyListeners();
};

// Composant Toast individuel
const ToastItem = ({ toast: toastData, onRemove }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    // Animation d'entrée
    const timer = setTimeout(() => setIsVisible(true), 50);
    return () => clearTimeout(timer);
  }, []);

  const handleRemove = useCallback(() => {
    setIsRemoving(true);
    setTimeout(() => onRemove(toastData.id), 300);
  }, [toastData.id, onRemove]);

  // Gestion du swipe sur mobile
  const handleTouchStart = useCallback((e) => {
    const isMobile = window.innerWidth <= 768;
    if (!isMobile) return;

    const touch = e.touches[0];
    e.target.startX = touch.clientX;
  }, []);

  const handleTouchMove = useCallback((e) => {
    const isMobile = window.innerWidth <= 768;
    if (!isMobile || !e.target.startX) return;

    const touch = e.touches[0];
    const diff = touch.clientX - e.target.startX;

    // Seulement swipe vers la droite
    if (diff > 0) {
      setSwipeOffset(Math.min(diff, 100));
    }
  }, []);

  const handleTouchEnd = useCallback((e) => {
    const isMobile = window.innerWidth <= 768;
    if (!isMobile) return;

    if (swipeOffset > 50) {
      handleRemove();
    } else {
      setSwipeOffset(0);
    }
    e.target.startX = null;
  }, [swipeOffset, handleRemove]);

  // Vérifier si le contenu est long
  const isLongContent = useMemo(() => {
    const messageLength = (toastData.message || '').length;
    const descriptionLength = (toastData.description || '').length;
    return messageLength > 80 || descriptionLength > 120;
  }, [toastData.message, toastData.description]);

  const toggleExpanded = useCallback(() => {
    setIsExpanded(prev => !prev);
  }, []);

  const getIcon = () => {
    switch (toastData.type) {
      case 'success':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
            <polyline points="22,4 12,14.01 9,11.01"/>
          </svg>
        );
      case 'error':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <circle cx="12" cy="12" r="10"/>
            <line x1="15" y1="9" x2="9" y2="15"/>
            <line x1="9" y1="9" x2="15" y2="15"/>
          </svg>
        );
      case 'warning':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
            <line x1="12" y1="9" x2="12" y2="13"/>
            <line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
        );
      case 'info':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="16" x2="12" y2="12"/>
            <line x1="12" y1="8" x2="12.01" y2="8"/>
          </svg>
        );
      case 'loading':
        return (
          <div className="toast__loading-spinner">
            <svg width="20" height="20" viewBox="0 0 24 24">
              <circle
                cx="12"
                cy="12"
                r="10"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeDasharray="31.416"
                strokeDashoffset="31.416"
                className="toast__loading-circle"
              />
            </svg>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div
      className={`
        toast
        toast--${toastData.type}
        ${isVisible ? 'toast--visible' : ''}
        ${isRemoving ? 'toast--removing' : ''}
        ${isExpanded ? 'toast--expanded' : ''}
        ${isLongContent ? 'toast--long-content' : ''}
      `}
      role="alert"
      aria-live={toastData.type === 'error' ? 'assertive' : 'polite'}
      style={{
        touchAction: 'pan-y',
        transform: swipeOffset > 0 ? `translateX(${swipeOffset}px)` : undefined,
        opacity: swipeOffset > 0 ? Math.max(0.3, 1 - swipeOffset / 100) : undefined,
        transition: swipeOffset === 0 ? 'all 0.3s ease' : 'none'
      }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div className="toast__icon">
        {getIcon()}
      </div>

      <div className="toast__content">
        {typeof toastData.message === 'string' ? (
          <p className="toast__message">{toastData.message}</p>
        ) : (
          toastData.message
        )}

        {toastData.description && (
          <p className="toast__description">{toastData.description}</p>
        )}

        {isLongContent && (
          <button
            className="toast__expand-btn"
            onClick={toggleExpanded}
            aria-label={isExpanded ? "Réduire le message" : "Afficher le message complet"}
          >
            {isExpanded ? "Moins" : "Plus"}
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              style={{
                marginLeft: '4px',
                transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 0.2s ease'
              }}
            >
              <path d="M6 9l6 6 6-6"/>
            </svg>
          </button>
        )}
      </div>

      {toastData.type !== 'loading' && (
        <button
          className="toast__close"
          onClick={handleRemove}
          aria-label="Fermer la notification"
          style={{
            touchAction: 'manipulation',
            WebkitTapHighlightColor: 'transparent'
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      )}

      {toastData.duration > 0 && toastData.type !== 'loading' && (
        <div
          className="toast__progress"
          style={{
            animationDuration: `${toastData.duration}ms`,
            animationPlayState: isVisible ? 'running' : 'paused'
          }}
        />
      )}
    </div>
  );
};

// Conteneur principal des toasts
const ToastContainer = ({ position = 'top-right' }) => {
  const [toastList, setToastList] = useState([]);

  useEffect(() => {
    console.log('ToastContainer mounted with position:', position);

    const listener = (newToasts) => {
      console.log('ToastContainer received new toasts:', newToasts);
      setToastList(newToasts);
    };

    listeners.add(listener);
    listener([...toasts]); // Initialiser avec les toasts existants

    return () => {
      console.log('ToastContainer unmounting');
      listeners.delete(listener);
    };
  }, []);

  const handleRemove = useCallback((id) => {
    console.log('Removing toast:', id);
    removeToast(id);
  }, []);

  console.log('ToastContainer rendering with', toastList.length, 'toasts');

  if (toastList.length === 0) {
    return (
      <div
        className={`toast-container toast-container--${position}`}
        style={{
          position: 'fixed',
          zIndex: 50000,
          pointerEvents: 'none'
        }}
      >
        {/* Container vide mais présent pour debug */}
      </div>
    );
  }

  return (
    <div className={`toast-container toast-container--${position}`}>
      {toastList.map(toastData => (
        <ToastItem
          key={toastData.id}
          toast={toastData}
          onRemove={handleRemove}
        />
      ))}
    </div>
  );
};

// Hook pour utiliser les toasts dans les composants
export const useToast = () => {
  return toast;
};

// Fonction pour initialiser le système de toast
export const initToast = (position = 'top-right') => {
  // Vérifier si le toast est déjà initialisé
  const existingRoot = document.getElementById('toast-root');
  if (existingRoot) {
    console.log('Toast system already initialized');
    return () => {};
  }

  // Détecter si on est sur mobile pour ajuster la position
  const isMobile = window.innerWidth <= 768;
  const mobilePosition = isMobile ? 'top-center' : position;

  const toastRoot = document.createElement('div');
  toastRoot.id = 'toast-root';
  toastRoot.style.cssText = `
    pointer-events: none !important;
    position: fixed !important;
    z-index: 50000 !important;
    top: 0 !important;
    left: 0 !important;
    width: 100% !important;
    height: 100% !important;
    isolation: isolate !important;
  `;

  document.body.appendChild(toastRoot);

  // Ajouter styles CSS pour éviter les conflits
  if (!document.getElementById('toast-system-styles')) {
    const styleEl = document.createElement('style');
    styleEl.id = 'toast-system-styles';
    styleEl.textContent = `
      #toast-root {
        pointer-events: none !important;
        z-index: 50000 !important;
        isolation: isolate !important;
      }

      #toast-root * {
        pointer-events: auto !important;
      }

      .toast-container {
        pointer-events: none !important;
        position: fixed !important;
        z-index: 50001 !important;
      }

      .toast-container--top-center {
        top: 20px !important;
        left: 50% !important;
        transform: translateX(-50%) !important;
      }

      .toast-container--top-right {
        top: 20px !important;
        right: 20px !important;
      }

      .toast {
        pointer-events: auto !important;
        z-index: 50002 !important;
      }
    `;
    document.head.appendChild(styleEl);
  }

  try {
    const root = ReactDOM.createRoot(toastRoot);
    root.render(<ToastContainer position={mobilePosition} />);

    console.log('Toast system initialized successfully with position:', mobilePosition);

    return () => {
      try {
        root.unmount();
        if (document.body.contains(toastRoot)) {
          document.body.removeChild(toastRoot);
        }
      } catch (error) {
        console.error('Error cleaning up toast system:', error);
      }
    };
  } catch (error) {
    console.error('Error initializing toast system:', error);
    return () => {};
  }
};

export default ToastContainer;