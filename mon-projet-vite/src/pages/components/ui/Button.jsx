import React from 'react';
import './Button.css';

const Button = ({
  children,
  variant = 'primary',
  size = 'medium',
  loading = false,
  disabled = false,
  onClick,
  type = 'button',
  icon,
  iconPosition = 'left',
  fullWidth = false,
  className = '',
  ...props
}) => {
  const baseClass = 'modern-btn';
  const classes = [
    baseClass,
    `${baseClass}--${variant}`,
    `${baseClass}--${size}`,
    loading && `${baseClass}--loading`,
    disabled && `${baseClass}--disabled`,
    fullWidth && `${baseClass}--full-width`,
    className
  ].filter(Boolean).join(' ');

  return (
    <button
      type={type}
      className={classes}
      onClick={onClick}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <span className="modern-btn__spinner">
          <svg className="modern-btn__spinner-svg" viewBox="0 0 24 24">
            <circle
              cx="12"
              cy="12"
              r="10"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeDasharray="31.416"
              strokeDashoffset="31.416"
            />
          </svg>
        </span>
      )}

      {!loading && icon && iconPosition === 'left' && (
        <span className="modern-btn__icon modern-btn__icon--left">
          {icon}
        </span>
      )}

      <span className="modern-btn__text">
        {children}
      </span>

      {!loading && icon && iconPosition === 'right' && (
        <span className="modern-btn__icon modern-btn__icon--right">
          {icon}
        </span>
      )}

      <span className="modern-btn__ripple"></span>
    </button>
  );
};

export default Button;