import React from 'react';
import './Card.css';

const Card = ({
  children,
  variant = 'default',
  hoverable = true,
  padding = 'medium',
  className = '',
  onClick,
  title,
  subtitle,
  image,
  actions,
  loading = false,
  ...props
}) => {
  const baseClass = 'modern-card';
  const classes = [
    baseClass,
    `${baseClass}--${variant}`,
    `${baseClass}--${padding}`,
    hoverable && `${baseClass}--hoverable`,
    loading && `${baseClass}--loading`,
    onClick && `${baseClass}--clickable`,
    className
  ].filter(Boolean).join(' ');

  return (
    <div
      className={classes}
      onClick={onClick}
      tabIndex={onClick ? 0 : undefined}
      role={onClick ? 'button' : undefined}
      {...props}
    >
      {loading && (
        <div className="modern-card__loading-overlay">
          <div className="modern-card__spinner">
            <div className="modern-card__spinner-circle"></div>
          </div>
        </div>
      )}

      {image && (
        <div className="modern-card__image-container">
          <img src={image.src} alt={image.alt || ''} className="modern-card__image" />
        </div>
      )}

      <div className="modern-card__content">
        {(title || subtitle) && (
          <div className="modern-card__header">
            {title && <h3 className="modern-card__title">{title}</h3>}
            {subtitle && <p className="modern-card__subtitle">{subtitle}</p>}
          </div>
        )}

        <div className="modern-card__body">
          {children}
        </div>

        {actions && (
          <div className="modern-card__actions">
            {actions}
          </div>
        )}
      </div>

      <div className="modern-card__gradient-border"></div>
    </div>
  );
};

// Composants spécialisés
export const StatCard = ({
  title,
  value,
  subtitle,
  icon,
  trend,
  trendDirection = 'up',
  className = '',
  ...props
}) => (
  <Card
    className={`stat-card ${className}`}
    variant="stats"
    {...props}
  >
    <div className="stat-card__content">
      <div className="stat-card__header">
        {icon && <div className="stat-card__icon">{icon}</div>}
        <div className="stat-card__info">
          <div className="stat-card__title">{title}</div>
          {subtitle && <div className="stat-card__subtitle">{subtitle}</div>}
        </div>
      </div>

      <div className="stat-card__value">{value}</div>

      {trend && (
        <div className={`stat-card__trend stat-card__trend--${trendDirection}`}>
          <span className="stat-card__trend-icon">
            {trendDirection === 'up' ? '↗' : trendDirection === 'down' ? '↙' : '→'}
          </span>
          <span className="stat-card__trend-value">{trend}</span>
        </div>
      )}
    </div>
  </Card>
);

export const FeatureCard = ({
  icon,
  title,
  description,
  action,
  className = '',
  ...props
}) => (
  <Card
    className={`feature-card ${className}`}
    variant="feature"
    {...props}
  >
    <div className="feature-card__content">
      {icon && <div className="feature-card__icon">{icon}</div>}
      <h4 className="feature-card__title">{title}</h4>
      <p className="feature-card__description">{description}</p>
      {action && <div className="feature-card__action">{action}</div>}
    </div>
  </Card>
);

export { Card };
export default Card;