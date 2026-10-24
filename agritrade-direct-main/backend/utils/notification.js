import Notification from '../models/Notification.js';

export const createNotification = async (userId, title, message, type = 'system') => {
    try {
        await Notification.create({
            userId,
            title,
            message,
            type
        });
    } catch (error) {
        console.error('Failed to create notification:', error);
        // Don't throw error to avoid breaking main flow
    }
};
