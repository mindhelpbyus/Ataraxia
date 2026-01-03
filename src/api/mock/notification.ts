import { dataService } from '../index';

export interface Notification {
    id: string;
    userId: string;
    title: string;
    message: string;
    type: 'message' | 'appointment' | 'reminder' | 'cancellation' | 'system';
    read: boolean;
    timestamp: string;
    link?: string;
}

export const MockNotificationService = {
    async getNotifications(userId: string): Promise<Notification[]> {
        const allNotifications = await dataService.list('notifications');
        return allNotifications
            .filter((n: any) => n.userId === userId)
            .sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()) as Notification[];
    },

    async markAsRead(notificationId: string): Promise<void> {
        await dataService.update('notifications', notificationId, { read: true });
    },

    async markAllAsRead(userId: string): Promise<void> {
        const notifications = await this.getNotifications(userId);
        const unread = notifications.filter(n => !n.read);
        for (const n of unread) {
            await dataService.update('notifications', n.id, { read: true });
        }
    },

    async createNotification(notification: Omit<Notification, 'id' | 'timestamp' | 'read'>): Promise<Notification> {
        const newNotification = await dataService.create('notifications', {
            ...notification,
            read: false,
            timestamp: new Date().toISOString()
        });
        return newNotification as Notification;
    },

    // Seed some mock notifications if none exist
    async seedMockNotifications(userId: string): Promise<void> {
        const existing = await this.getNotifications(userId);
        if (existing.length === 0) {
            await this.createNotification({
                userId,
                title: 'Welcome to Ataraxia',
                message: 'Your account has been successfully set up.',
                type: 'system'
            });
            await this.createNotification({
                userId,
                title: 'Complete your profile',
                message: 'Please add your license details to start accepting appointments.',
                type: 'reminder'
            });
        }
    }
};
