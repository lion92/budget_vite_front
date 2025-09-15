import React, { useState, useEffect, useCallback } from 'react';
import ReactDOM from 'react-dom/client';
import './Toast.css';

// Contexte pour gérer les toasts globalement
const toasts = new Set();
const listeners = new Set();

const notifyListeners = () => {
  listeners.forEach(listener => listener([...toasts]));
};

// API pour créer des toasts
export const toast = {
  success: (message, options = {}) => {
    return addToast({ message, type: 'success', ...options });
  },
  error: (message, options = {}) => {
    return addToast({ message, type: 'error', ...options });
  },
  warning: (message, options = {}) => {
    return addToast({ message, type: 'warning', ...options });
  },
  info: (message, options = {}) => {
    return addToast({ message, type: 'info', ...options });
  },
  loading: (message, options = {}) => {
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

  // Si un toast avec le même ID existe déjà, le remplacer
  toasts.forEach(existing => {
    if (existing.id === id) {
      toasts.delete(existing);
    }
  });

  toasts.add(toastObj);
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

  useEffect(() => {
    // Animation d'entrée
    const timer = setTimeout(() => setIsVisible(true), 50);
    return () => clearTimeout(timer);
  }, []);

  const handleRemove = useCallback(() => {
    setIsRemoving(true);
    setTimeout(() => onRemove(toastData.id), 300);
  }, [toastData.id, onRemove]);

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
      `}
      role="alert"
      aria-live={toastData.type === 'error' ? 'assertive' : 'polite'}
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
      </div>

      {toastData.type !== 'loading' && (
        <button
          className="toast__close"
          onClick={handleRemove}
          aria-label="Fermer la notification"
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
    const listener = (newToasts) => {
      setToastList(newToasts);
    };

    listeners.add(listener);
    listener([...toasts]); // Initialiser avec les toasts existants

    return () => {
      listeners.delete(listener);
    };
  }, []);

  const handleRemove = useCallback((id) => {
    removeToast(id);
  }, []);

  if (toastList.length === 0) {
    return null;
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
  const toastRoot = document.createElement('div');
  toastRoot.id = 'toast-root';
  document.body.appendChild(toastRoot);

  const root = ReactDOM.createRoot(toastRoot);
  root.render(<ToastContainer position={position} />);

  return () => {
    root.unmount();
    document.body.removeChild(toastRoot);
  };
};

export default ToastContainer;