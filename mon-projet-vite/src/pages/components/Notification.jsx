import { create } from 'zustand';

import * as framerMotion from "framer-motion";
import {AnimatePresence} from "framer-motion";
import React from "react";

const { motion } = framerMotion;

// Store Zustand pour gérer les notifications
const useNotificationStore = create((set) => ({
    notifications: [],
    addNotification: (message, type = 'info') => {
        const id = Date.now();
        set((state) => ({
            notifications: [...state.notifications, { id, message, type }],
        }));

        setTimeout(() => {
            set((state) => ({
                notifications: state.notifications.filter((notif) => notif.id !== id),
            }));
        }, 3000);
    },
}));

// Composant pour afficher les notifications
const Notifications = () => {
    const { notifications } = useNotificationStore();

    return (
        <div className="fixed top-4 right-4 w-80 flex flex-col gap-2 z-50">
            <AnimatePresence>
                {notifications.map(({ id, message, type }) => (
                    <motion.div
                        key={id}
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 50 }}
                        className={`p-3 rounded-lg shadow-md ${
                            type === 'success' ? 'bg-green-500' :
                                type === 'error' ? 'bg-red-500' : 'bg-info-500'
                        }`}
                    >
                        {message}
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
};

export default Notifications;

// Hook pour ajouter une notification
export const useNotify = () => {
    return useNotificationStore((state) => state.addNotification);
};
