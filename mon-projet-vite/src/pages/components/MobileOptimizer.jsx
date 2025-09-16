import React, { useEffect, useState } from 'react';
import './css/mobile-optimizations.css';

// Hook pour détecter les appareils mobiles
export const useMobile = () => {
    const [isMobile, setIsMobile] = useState(false);
    const [screenSize, setScreenSize] = useState('desktop');

    useEffect(() => {
        const checkDevice = () => {
            const width = window.innerWidth;
            const isMobileDevice = width <= 768;
            setIsMobile(isMobileDevice);

            if (width <= 375) {
                setScreenSize('mobile-sm');
            } else if (width <= 414) {
                setScreenSize('mobile-md');
            } else if (width <= 480) {
                setScreenSize('mobile-lg');
            } else if (width <= 768) {
                setScreenSize('mobile-xl');
            } else if (width <= 1024) {
                setScreenSize('tablet');
            } else {
                setScreenSize('desktop');
            }
        };

        checkDevice();
        window.addEventListener('resize', checkDevice);
        return () => window.removeEventListener('resize', checkDevice);
    }, []);

    return { isMobile, screenSize };
};

// Hook pour gérer l'orientation
export const useOrientation = () => {
    const [orientation, setOrientation] = useState('portrait');

    useEffect(() => {
        const handleOrientationChange = () => {
            setOrientation(window.innerHeight > window.innerWidth ? 'portrait' : 'landscape');
        };

        handleOrientationChange();
        window.addEventListener('resize', handleOrientationChange);
        return () => window.removeEventListener('resize', handleOrientationChange);
    }, []);

    return orientation;
};

// Composant Container Mobile
export const MobileContainer = ({ children, className = '', padding = true }) => {
    const { isMobile } = useMobile();

    return (
        <div className={`${isMobile ? 'mobile-container' : ''} ${padding ? 'p-responsive-md' : ''} ${className}`}>
            {children}
        </div>
    );
};

// Composant Card Mobile
export const MobileCard = ({
    children,
    title,
    icon,
    className = '',
    onClick = null,
    hover = true
}) => {
    const { isMobile } = useMobile();

    return (
        <div
            className={`${isMobile ? 'mobile-card' : 'card'} ${className}`}
            onClick={onClick}
            style={{
                cursor: onClick ? 'pointer' : 'default',
                transform: hover ? undefined : 'none'
            }}
        >
            {(title || icon) && (
                <div className="mobile-card-header">
                    <h3 className="mobile-card-title">{title}</h3>
                    {icon && <div className="mobile-card-icon">{icon}</div>}
                </div>
            )}
            <div className="mobile-card-content">
                {children}
            </div>
        </div>
    );
};

// Composant Button Mobile
export const MobileButton = ({
    children,
    variant = 'primary',
    size = 'normal',
    fullWidth = false,
    className = '',
    ...props
}) => {
    const { isMobile } = useMobile();

    const baseClass = isMobile ? 'mobile-btn' : 'btn';
    const variantClass = isMobile ? `mobile-btn-${variant}` : `btn-${variant}`;
    const sizeClass = size === 'small' ? (isMobile ? 'mobile-btn-small' : 'btn-small') : '';
    const fullWidthClass = fullWidth ? (isMobile ? 'mobile-btn-full' : 'w-full') : '';

    return (
        <button
            className={`${baseClass} ${variantClass} ${sizeClass} ${fullWidthClass} ${className}`}
            {...props}
        >
            {children}
        </button>
    );
};

// Composant Input Mobile
export const MobileInput = ({
    label,
    error,
    className = '',
    type = 'text',
    ...props
}) => {
    const { isMobile } = useMobile();

    return (
        <div className={isMobile ? 'mobile-form-group' : 'form-group'}>
            {label && (
                <label className={isMobile ? 'mobile-form-label' : 'form-label'}>
                    {label}
                </label>
            )}
            <input
                type={type}
                className={`${isMobile ? 'mobile-form-input' : 'form-input'} ${className}`}
                {...props}
            />
            {error && (
                <div className={isMobile ? 'mobile-form-error' : 'form-error'}>
                    {error}
                </div>
            )}
        </div>
    );
};

// Composant Select Mobile
export const MobileSelect = ({
    label,
    options = [],
    error,
    className = '',
    ...props
}) => {
    const { isMobile } = useMobile();

    return (
        <div className={isMobile ? 'mobile-form-group' : 'form-group'}>
            {label && (
                <label className={isMobile ? 'mobile-form-label' : 'form-label'}>
                    {label}
                </label>
            )}
            <select
                className={`${isMobile ? 'mobile-form-input mobile-form-select' : 'form-input form-select'} ${className}`}
                {...props}
            >
                {options.map((option, index) => (
                    <option key={index} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
            {error && (
                <div className={isMobile ? 'mobile-form-error' : 'form-error'}>
                    {error}
                </div>
            )}
        </div>
    );
};

// Composant Modal Mobile
export const MobileModal = ({
    isOpen,
    onClose,
    title,
    children,
    className = ''
}) => {
    const { isMobile } = useMobile();

    useEffect(() => {
        if (isOpen) {
            document.body.classList.add('no-scroll');
        } else {
            document.body.classList.remove('no-scroll');
        }

        return () => document.body.classList.remove('no-scroll');
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div
            className={isMobile ? 'mobile-modal-overlay' : 'modal-overlay'}
            onClick={onClose}
        >
            <div
                className={`${isMobile ? 'mobile-modal' : 'modal'} ${className}`}
                onClick={(e) => e.stopPropagation()}
            >
                {isMobile && <div className="mobile-modal-handle" />}
                {title && (
                    <div className={isMobile ? 'mobile-modal-header' : 'modal-header'}>
                        <h2 className={isMobile ? 'mobile-modal-title' : 'modal-title'}>
                            {title}
                        </h2>
                    </div>
                )}
                <div className={isMobile ? 'mobile-modal-content' : 'modal-content'}>
                    {children}
                </div>
            </div>
        </div>
    );
};

// Composant List Mobile
export const MobileList = ({ items = [], className = '', onItemClick = null }) => {
    const { isMobile } = useMobile();

    return (
        <ul className={`${isMobile ? 'mobile-list' : 'list'} ${className}`}>
            {items.map((item, index) => (
                <li
                    key={index}
                    className={isMobile ? 'mobile-list-item' : 'list-item'}
                    onClick={() => onItemClick && onItemClick(item, index)}
                    style={{ cursor: onItemClick ? 'pointer' : 'default' }}
                >
                    {item.icon && (
                        <div className={isMobile ? 'mobile-list-icon' : 'list-icon'}>
                            {item.icon}
                        </div>
                    )}
                    <div className={isMobile ? 'mobile-list-content' : 'list-content'}>
                        <div className={isMobile ? 'mobile-list-title' : 'list-title'}>
                            {item.title}
                        </div>
                        {item.subtitle && (
                            <div className={isMobile ? 'mobile-list-subtitle' : 'list-subtitle'}>
                                {item.subtitle}
                            </div>
                        )}
                    </div>
                    {item.action && (
                        <div className={isMobile ? 'mobile-list-action' : 'list-action'}>
                            {item.action}
                        </div>
                    )}
                </li>
            ))}
        </ul>
    );
};

// Composant Grid Mobile
export const MobileGrid = ({
    children,
    columns = 1,
    className = '',
    gap = 'normal'
}) => {
    const { isMobile } = useMobile();

    const getGridClass = () => {
        if (!isMobile) return `grid-cols-${columns}`;

        // Sur mobile, adapte automatiquement
        if (columns > 2) return 'mobile-grid-1';
        if (columns === 2) return 'mobile-grid-2';
        return 'mobile-grid-1';
    };

    return (
        <div className={`${isMobile ? 'mobile-grid' : 'grid'} ${getGridClass()} ${className}`}>
            {children}
        </div>
    );
};

// Composant Toast Mobile
export const MobileToast = ({
    message,
    type = 'info',
    isVisible,
    onClose,
    autoClose = true,
    duration = 3000
}) => {
    const { isMobile } = useMobile();

    useEffect(() => {
        if (isVisible && autoClose) {
            const timer = setTimeout(onClose, duration);
            return () => clearTimeout(timer);
        }
    }, [isVisible, autoClose, duration, onClose]);

    if (!isVisible) return null;

    return (
        <div
            className={`${isMobile ? 'mobile-toast' : 'toast'} ${isMobile ? `mobile-toast-${type}` : `toast-${type}`}`}
            onClick={onClose}
        >
            {message}
        </div>
    );
};

// Composant FloatingActionButton
export const FloatingActionButton = ({
    icon,
    onClick,
    className = '',
    position = 'bottom-right'
}) => {
    const { isMobile } = useMobile();

    if (!isMobile) return null;

    return (
        <button
            className={`mobile-fab ${className}`}
            onClick={onClick}
            aria-label="Action rapide"
        >
            {icon}
        </button>
    );
};

// Composant Table Mobile avec mode carte
export const MobileTable = ({
    data = [],
    columns = [],
    className = '',
    onRowClick = null
}) => {
    const { isMobile } = useMobile();

    if (!isMobile) {
        // Table normale pour desktop
        return (
            <table className={`table ${className}`}>
                <thead>
                    <tr>
                        {columns.map((col, index) => (
                            <th key={index}>{col.header}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {data.map((row, rowIndex) => (
                        <tr
                            key={rowIndex}
                            onClick={() => onRowClick && onRowClick(row, rowIndex)}
                            style={{ cursor: onRowClick ? 'pointer' : 'default' }}
                        >
                            {columns.map((col, colIndex) => (
                                <td key={colIndex}>
                                    {col.accessor ? row[col.accessor] : col.render(row)}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        );
    }

    // Mode carte pour mobile
    return (
        <div className="mobile-table-cards">
            {data.map((row, index) => (
                <div
                    key={index}
                    className="mobile-table-card"
                    onClick={() => onRowClick && onRowClick(row, index)}
                    style={{ cursor: onRowClick ? 'pointer' : 'default' }}
                >
                    <div className="mobile-table-card-content">
                        {columns.map((col, colIndex) => (
                            <div key={colIndex} className="mobile-table-card-row">
                                <span className="mobile-table-card-label">
                                    {col.header}
                                </span>
                                <span className="mobile-table-card-value">
                                    {col.accessor ? row[col.accessor] : col.render(row)}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
};

// Componet principal MobileOptimizer
const MobileOptimizer = ({ children }) => {
    const { isMobile, screenSize } = useMobile();
    const orientation = useOrientation();

    useEffect(() => {
        // Ajouter les classes CSS au body
        document.body.classList.add('mobile-optimized');
        document.body.setAttribute('data-screen-size', screenSize);
        document.body.setAttribute('data-orientation', orientation);

        return () => {
            document.body.classList.remove('mobile-optimized');
            document.body.removeAttribute('data-screen-size');
            document.body.removeAttribute('data-orientation');
        };
    }, [screenSize, orientation]);

    return (
        <div className={`mobile-optimizer ${isMobile ? 'is-mobile' : 'is-desktop'}`}>
            {children}
        </div>
    );
};

export default MobileOptimizer;