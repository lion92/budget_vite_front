import React, { useState, useRef, useEffect } from 'react';
import './Input.css';

const Input = ({
  type = 'text',
  label,
  placeholder,
  value,
  onChange,
  onBlur,
  onFocus,
  error,
  success,
  disabled = false,
  required = false,
  icon,
  iconPosition = 'left',
  size = 'medium',
  variant = 'default',
  helperText,
  maxLength,
  autoComplete,
  className = '',
  ...props
}) => {
  const [focused, setFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const inputRef = useRef(null);

  const baseClass = 'modern-input';
  const wrapperClasses = [
    `${baseClass}-wrapper`,
    `${baseClass}-wrapper--${size}`,
    `${baseClass}-wrapper--${variant}`,
    focused && `${baseClass}-wrapper--focused`,
    error && `${baseClass}-wrapper--error`,
    success && `${baseClass}-wrapper--success`,
    disabled && `${baseClass}-wrapper--disabled`,
    value && `${baseClass}-wrapper--filled`,
    className
  ].filter(Boolean).join(' ');

  const inputClasses = [
    baseClass,
    icon && `${baseClass}--with-icon`,
    icon && `${baseClass}--icon-${iconPosition}`
  ].filter(Boolean).join(' ');

  const handleFocus = (e) => {
    setFocused(true);
    onFocus?.(e);
  };

  const handleBlur = (e) => {
    setFocused(false);
    onBlur?.(e);
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const inputType = type === 'password' && showPassword ? 'text' : type;

  return (
    <div className={wrapperClasses}>
      {label && (
        <label className="modern-input__label" htmlFor={props.id}>
          {label}
          {required && <span className="modern-input__required">*</span>}
        </label>
      )}

      <div className="modern-input__field-wrapper">
        {icon && iconPosition === 'left' && (
          <div className="modern-input__icon modern-input__icon--left">
            {icon}
          </div>
        )}

        <input
          ref={inputRef}
          type={inputType}
          className={inputClasses}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          disabled={disabled}
          required={required}
          maxLength={maxLength}
          autoComplete={autoComplete}
          {...props}
        />

        {type === 'password' && (
          <button
            type="button"
            className="modern-input__password-toggle"
            onClick={togglePasswordVisibility}
            tabIndex={-1}
            aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
          >
            {showPassword ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                <line x1="1" y1="1" x2="23" y2="23"/>
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>
            )}
          </button>
        )}

        {icon && iconPosition === 'right' && !type === 'password' && (
          <div className="modern-input__icon modern-input__icon--right">
            {icon}
          </div>
        )}
      </div>

      {(error || success || helperText) && (
        <div className="modern-input__feedback">
          {error && (
            <div className="modern-input__error">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <circle cx="12" cy="12" r="10"/>
                <line x1="15" y1="9" x2="9" y2="15"/>
                <line x1="9" y1="9" x2="15" y2="15"/>
              </svg>
              <span>{error}</span>
            </div>
          )}
          {success && !error && (
            <div className="modern-input__success">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <polyline points="20,6 9,17 4,12"/>
              </svg>
              <span>{success}</span>
            </div>
          )}
          {helperText && !error && !success && (
            <div className="modern-input__helper">
              {helperText}
            </div>
          )}
        </div>
      )}

      {maxLength && (
        <div className="modern-input__counter">
          <span className={value?.length > maxLength * 0.8 ? 'modern-input__counter--warning' : ''}>
            {value?.length || 0}/{maxLength}
          </span>
        </div>
      )}
    </div>
  );
};

// Composant TextArea
export const TextArea = ({
  label,
  placeholder,
  value,
  onChange,
  onBlur,
  onFocus,
  error,
  success,
  disabled = false,
  required = false,
  rows = 4,
  resize = 'vertical',
  maxLength,
  helperText,
  className = '',
  ...props
}) => {
  const [focused, setFocused] = useState(false);

  const baseClass = 'modern-textarea';
  const wrapperClasses = [
    `${baseClass}-wrapper`,
    focused && `${baseClass}-wrapper--focused`,
    error && `${baseClass}-wrapper--error`,
    success && `${baseClass}-wrapper--success`,
    disabled && `${baseClass}-wrapper--disabled`,
    value && `${baseClass}-wrapper--filled`,
    className
  ].filter(Boolean).join(' ');

  const handleFocus = (e) => {
    setFocused(true);
    onFocus?.(e);
  };

  const handleBlur = (e) => {
    setFocused(false);
    onBlur?.(e);
  };

  return (
    <div className={wrapperClasses}>
      {label && (
        <label className="modern-textarea__label" htmlFor={props.id}>
          {label}
          {required && <span className="modern-textarea__required">*</span>}
        </label>
      )}

      <div className="modern-textarea__field-wrapper">
        <textarea
          className={baseClass}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          disabled={disabled}
          required={required}
          rows={rows}
          maxLength={maxLength}
          style={{ resize }}
          {...props}
        />
      </div>

      {(error || success || helperText) && (
        <div className="modern-textarea__feedback">
          {error && (
            <div className="modern-textarea__error">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <circle cx="12" cy="12" r="10"/>
                <line x1="15" y1="9" x2="9" y2="15"/>
                <line x1="9" y1="9" x2="15" y2="15"/>
              </svg>
              <span>{error}</span>
            </div>
          )}
          {success && !error && (
            <div className="modern-textarea__success">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <polyline points="20,6 9,17 4,12"/>
              </svg>
              <span>{success}</span>
            </div>
          )}
          {helperText && !error && !success && (
            <div className="modern-textarea__helper">
              {helperText}
            </div>
          )}
        </div>
      )}

      {maxLength && (
        <div className="modern-textarea__counter">
          <span className={value?.length > maxLength * 0.8 ? 'modern-textarea__counter--warning' : ''}>
            {value?.length || 0}/{maxLength}
          </span>
        </div>
      )}
    </div>
  );
};

export default Input;