import React, { useRef, useEffect } from 'react';

const StaticChart = ({ children, width = 400, height = 300 }) => {
    const containerRef = useRef(null);

    useEffect(() => {
        if (containerRef.current) {
            const container = containerRef.current;

            // Force les dimensions absolues
            container.style.width = `${width}px`;
            container.style.height = `${height}px`;
            container.style.position = 'relative';
            container.style.overflow = 'hidden';
            container.style.display = 'block';

            // Observer pour empêcher tout changement de style
            const observer = new MutationObserver((mutations) => {
                mutations.forEach((mutation) => {
                    if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
                        const target = mutation.target;
                        if (target.tagName === 'CANVAS') {
                            // Force le canvas à rester en place
                            target.style.position = 'static';
                            target.style.transform = 'none';
                            target.style.top = 'auto';
                            target.style.left = 'auto';
                            target.style.width = '100%';
                            target.style.height = '100%';
                        }
                    }
                });
            });

            observer.observe(container, {
                attributes: true,
                childList: true,
                subtree: true,
                attributeOldValue: true
            });

            return () => observer.disconnect();
        }
    }, [width, height]);

    return (
        <div
            ref={containerRef}
            className="static-chart-wrapper"
            style={{
                width: `${width}px`,
                height: `${height}px`,
                position: 'relative',
                overflow: 'hidden',
                display: 'block',
                margin: '0 auto'
            }}
        >
            {children}
        </div>
    );
};

export default StaticChart;