import { createNotification } from './notificationService';

export const createTestNotification = async (userId: string): Promise<void> => {
  try {
    console.log('Creating test notification for user:', userId);
    
    const notificationId = await createNotification({
      userId: userId,
      type: 'message',
      title: 'Test Bildirimi',
      message: 'Bu bir test bildirimidir.',
      isRead: false,
      relatedUserId: userId,
      relatedUserName: 'Test User',
      actionUrl: '/test'
    });
    
    console.log('Test notification created with ID:', notificationId);
  } catch (error) {
    console.error('Error creating test notification:', error);
  }
};

// Console'dan çağırabilmek için global olarak ekle
(window as any).createTestNotification = createTestNotification;
