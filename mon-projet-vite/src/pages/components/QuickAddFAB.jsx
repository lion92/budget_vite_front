import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BiPlus, BiMinus } from 'react-icons/bi';
import { MdAttachMoney, MdTrendingUp, MdReceipt } from 'react-icons/md';
import './css/QuickAddFAB.css';

const QuickAddFAB = ({ onAddExpense, onAddRevenue, onScanTicket }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth <= 768);
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const toggleMenu = useCallback(() => {
        setIsOpen(prev => !prev);
    }, []);

    const handleAction = useCallback((action) => {
        setIsOpen(false);
        setTimeout(() => {
            action();
        }, 200);
    }, []);

    const actions = [
        {
            id: 'expense',
            label: 'Ajouter dépense',
            icon: <MdAttachMoney size={24} />,
            color: '#ef4444',
            onClick: () => handleAction(onAddExpense)
        },
        {
            id: 'revenue',
            label: 'Ajouter revenu',
            icon: <MdTrendingUp size={24} />,
            color: '#10b981',
            onClick: () => handleAction(onAddRevenue)
        }
    ];

    // Ajouter scan ticket si la fonction est fournie
    if (onScanTicket) {
        actions.push({
            id: 'ticket',
            label: 'Scanner ticket',
            icon: <MdReceipt size={24} />,
            color: '#3b82f6',
            onClick: () => handleAction(onScanTicket)
        });
    }

    return (
        <>
            {/* Overlay pour fermer le menu */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        className="quick-add-overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={toggleMenu}
                    />
                )}
            </AnimatePresence>

            <div className="quick-add-fab-container">
                {/* Boutons d'action */}
                <AnimatePresence>
                    {isOpen && actions.map((action, index) => (
                        <motion.div
                            key={action.id}
                            className="quick-add-action"
                            initial={{
                                opacity: 0,
                                scale: 0,
                                y: 0
                            }}
                            animate={{
                                opacity: 1,
                                scale: 1,
                                y: -(index + 1) * (isMobile ? 70 : 65)
                            }}
                            exit={{
                                opacity: 0,
                                scale: 0,
                                y: 0
                            }}
                            transition={{
                                type: 'spring',
                                stiffness: 400,
                                damping: 25,
                                delay: index * 0.05
                            }}
                        >
                            <button
                                className="quick-add-action-btn"
                                onClick={action.onClick}
                                style={{ backgroundColor: action.color }}
                                aria-label={action.label}
                            >
                                {action.icon}
                            </button>
                            <motion.span
                                className="quick-add-action-label"
                                initial={{ opacity: 0, x: 10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 10 }}
                                transition={{ delay: index * 0.05 + 0.1 }}
                            >
                                {action.label}
                            </motion.span>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {/* Bouton principal */}
                <motion.button
                    className={`quick-add-fab ${isOpen ? 'quick-add-fab--open' : ''}`}
                    onClick={toggleMenu}
                    whileTap={{ scale: 0.9 }}
                    whileHover={{ scale: 1.05 }}
                    aria-label={isOpen ? 'Fermer le menu rapide' : 'Ouvrir le menu rapide'}
                >
                    <motion.div
                        animate={{ rotate: isOpen ? 45 : 0 }}
                        transition={{ type: 'spring', stiffness: 300 }}
                    >
                        {isOpen ? <BiMinus size={28} /> : <BiPlus size={28} />}
                    </motion.div>
                </motion.button>
            </div>
        </>
    );
};

export default QuickAddFAB;
