import { 
  createNotification,
  createMessageNotification,
  createFriendRequestNotification,
  createFriendAcceptedNotification 
} from './notificationService';

export const createTestNotifications = async (userId: string) => {
  try {
    console.log('Creating test notifications for user:', userId);

    // Test mesaj bildirimi
    await createMessageNotification(
      userId,
      'test-user-1',
      'TestUser123',
      '',
      'test-conversation-1',
      'Bu bir test mesajıdır! 🎮'
    );

    // Test arkadaşlık isteği
    await createFriendRequestNotification(
      userId,
      'test-user-2',
      'ProGamer999',
      ''
    );

    // Test arkadaşlık kabul bildirimi
    await createFriendAcceptedNotification(
      userId,
      'test-user-3',
      'GameMaster',
      ''
    );

    // Test sistem bildirimi
    await createNotification({
      userId,
      type: 'server_invite',
      title: 'Yeni sunucu daveti',
      message: 'Epic Gamers sunucusuna davet edildiniz!',
      isRead: false,
      relatedUserId: 'test-admin',
      relatedUserName: 'Admin',
      actionUrl: '/servers'
    });

    // Test mention bildirimi
    await createNotification({
      userId,
      type: 'mention',
      title: 'Sizi etiketledi',
      message: 'SpeedRunner sizi bir mesajda etiketledi',
      isRead: false,
      relatedUserId: 'test-user-4',
      relatedUserName: 'SpeedRunner',
      conversationId: 'test-conversation-2',
      actionUrl: '/chat?conversation=test-conversation-2'
    });

    console.log('Test notifications created successfully');
  } catch (error) {
    console.error('Error creating test notifications:', error);
  }
};
