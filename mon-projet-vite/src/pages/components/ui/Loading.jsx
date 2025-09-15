import React from 'react';
import './Loading.css';

// Composant principal de chargement
const Loading = ({
  size = 'medium',
  variant = 'spinner',
  color = 'primary',
  text,
  overlay = false,
  className = '',
  ...props
}) => {
  const baseClass = 'modern-loading';
  const classes = [
    baseClass,
    `${baseClass}--${size}`,
    `${baseClass}--${variant}`,
    `${baseClass}--${color}`,
    overlay && `${baseClass}--overlay`,
    className
  ].filter(Boolean).join(' ');

  const renderSpinner = () => {
    switch (variant) {
      case 'spinner':
        return (
          <div className="modern-loading__spinner">
            <svg className="modern-loading__spinner-svg" viewBox="0 0 50 50">
              <circle
                className="modern-loading__spinner-circle"
                cx="25"
                cy="25"
                r="20"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeDasharray="31.416"
                strokeDashoffset="31.416"
              />
            </svg>
          </div>
        );

      case 'dots':
        return (
          <div className="modern-loading__dots">
            <div className="modern-loading__dot"></div>
            <div className="modern-loading__dot"></div>
            <div className="modern-loading__dot"></div>
          </div>
        );

      case 'pulse':
        return (
          <div className="modern-loading__pulse">
            <div className="modern-loading__pulse-circle"></div>
          </div>
        );

      case 'bars':
        return (
          <div className="modern-loading__bars">
            <div className="modern-loading__bar"></div>
            <div className="modern-loading__bar"></div>
            <div className="modern-loading__bar"></div>
            <div className="modern-loading__bar"></div>
          </div>
        );

      case 'wave':
        return (
          <div className="modern-loading__wave">
            <div className="modern-loading__wave-bar"></div>
            <div className="modern-loading__wave-bar"></div>
            <div className="modern-loading__wave-bar"></div>
            <div className="modern-loading__wave-bar"></div>
            <div className="modern-loading__wave-bar"></div>
          </div>
        );

      case 'skeleton':
        return (
          <div className="modern-loading__skeleton">
            <div className="modern-loading__skeleton-line modern-loading__skeleton-line--title"></div>
            <div className="modern-loading__skeleton-line"></div>
            <div className="modern-loading__skeleton-line"></div>
            <div className="modern-loading__skeleton-line modern-loading__skeleton-line--short"></div>
          </div>
        );

      default:
        return null;
    }
  };

  const content = (
    <div className={classes} {...props}>
      {renderSpinner()}
      {text && <div className="modern-loading__text">{text}</div>}
    </div>
  );

  if (overlay) {
    return (
      <div className="modern-loading-overlay">
        {content}
      </div>
    );
  }

  return content;
};

// Composants spécialisés
export const ButtonLoading = ({ size = 'small', className = '', ...props }) => (
  <Loading
    size={size}
    variant="spinner"
    className={`button-loading ${className}`}
    {...props}
  />
);

export const PageLoading = ({ text = 'Chargement...', className = '', ...props }) => (
  <Loading
    size="large"
    variant="spinner"
    text={text}
    overlay={true}
    className={`page-loading ${className}`}
    {...props}
  />
);

export const CardLoading = ({ className = '', ...props }) => (
  <Loading
    variant="skeleton"
    className={`card-loading ${className}`}
    {...props}
  />
);

export const InlineLoading = ({ text, size = 'small', className = '', ...props }) => (
  <Loading
    size={size}
    variant="dots"
    text={text}
    className={`inline-loading ${className}`}
    {...props}
  />
);

// Composant Skeleton pour des cas spécifiques
export const Skeleton = ({
  width = '100%',
  height = '1rem',
  borderRadius = '0.375rem',
  className = '',
  animated = true,
  ...props
}) => {
  return (
    <div
      className={`skeleton ${animated ? 'skeleton--animated' : ''} ${className}`}
      style={{
        width,
        height,
        borderRadius,
        ...props.style
      }}
      {...props}
    />
  );
};

// Hook pour gérer les états de chargement
export const useLoading = (initialState = false) => {
  const [loading, setLoading] = React.useState(initialState);

  const withLoading = async (asyncFunction) => {
    try {
      setLoading(true);
      const result = await asyncFunction();
      return result;
    } finally {
      setLoading(false);
    }
  };

  return [loading, setLoading, withLoading];
};

export default Loading;