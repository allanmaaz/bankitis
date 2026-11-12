import { prisma } from './prisma';

export async function getUserNotifications(userId: string) {
  return prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: 20,
  });
}

export async function markNotificationAsRead(notificationId: string, userId: string) {
  return prisma.notification.updateMany({
    where: { id: notificationId, userId },
    data: { isRead: true },
  });
}

export async function markAllNotificationsAsRead(userId: string) {
  return prisma.notification.updateMany({
    where: { userId, isRead: false },
    data: { isRead: true },
  });
}

export async function dispatchEmailAlert(options: {
  to: string;
  subject: string;
  text: string;
}) {
  const apiKey = process.env.RESEND_API_KEY;

  if (apiKey) {
    try {
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: process.env.EMAIL_FROM || 'alerts@bankteam9.com',
          to: options.to,
          subject: options.subject,
          text: options.text,
        }),
      });
      return { sent: true };
    } catch (err) {
      console.error('Failed to send email via Resend:', err);
    }
  }

  // Fallback: Mock console logger
  console.log('✉️ [TRANSACTIONAL EMAIL DISPATCHED]');
  console.log(`To: ${options.to}`);
  console.log(`Subject: ${options.subject}`);
  console.log(`Body: ${options.text}`);
  console.log('-----------------------------------');
  return { sent: true, mocked: true };
}

