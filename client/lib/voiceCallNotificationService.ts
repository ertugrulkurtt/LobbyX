import { createNotification } from './notificationService';

export interface VoiceCallNotificationData {
  callId: string;
  fromUserId: string;
  fromUserName: string;
  fromUserAvatar?: string;
  toUserId: string;
  callType: 'voice' | 'video';
  timestamp: string;
}

/**
 * Create voice call notification
 */
export const createVoiceCallNotification = async (
  recipientUserId: string,
  callerUserId: string,
  callerName: string,
  callerAvatar: string,
  callId: string
): Promise<string> => {
  return createNotification({
    userId: recipientUserId,
    type: 'mention', // Using mention type for special handling
    title: 'Gelen Sesli Arama',
    message: `${callerName} sizi arıyor`,
    isRead: false,
    relatedUserId: callerUserId,
    relatedUserName: callerName,
    relatedUserAvatar: callerAvatar,
    actionData: {
      type: 'voice_call',
      callId,
      action: 'incoming'
    }
  });
};

/**
 * Create call ended notification
 */
export const createCallEndedNotification = async (
  recipientUserId: string,
  callerUserId: string,
  callerName: string,
  callerAvatar: string,
  callDuration: number
): Promise<string> => {
  const durationText = callDuration > 0 
    ? `${Math.floor(callDuration / 60)}:${(callDuration % 60).toString().padStart(2, '0')}` 
    : 'Yanıtlanmadı';

  return createNotification({
    userId: recipientUserId,
    type: 'mention',
    title: 'Sesli Arama Sonlandı',
    message: `${callerName} ile arama: ${durationText}`,
    isRead: false,
    relatedUserId: callerUserId,
    relatedUserName: callerName,
    relatedUserAvatar: callerAvatar,
    actionData: {
      type: 'voice_call',
      action: 'ended',
      duration: callDuration
    }
  });
};

export default {
  createVoiceCallNotification,
  createCallEndedNotification
};
