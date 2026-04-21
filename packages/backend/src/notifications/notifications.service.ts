import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as webpush from 'web-push';
import { PrismaService } from '../prisma/prisma.service';
import { SubscribeDto } from './dto/subscribe.dto';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
  ) {
    webpush.setVapidDetails(
      this.config.getOrThrow<string>('VAPID_SUBJECT'),
      this.config.getOrThrow<string>('VAPID_PUBLIC_KEY'),
      this.config.getOrThrow<string>('VAPID_PRIVATE_KEY'),
    );
  }

  async subscribe(userId: string, dto: SubscribeDto) {
    return this.prisma.pushSubscription.upsert({
      where: { endpoint: dto.endpoint },
      update: { p256dhKey: dto.p256dhKey, authKey: dto.authKey, userId },
      create: { userId, endpoint: dto.endpoint, p256dhKey: dto.p256dhKey, authKey: dto.authKey },
    });
  }

  async unsubscribe(userId: string, endpoint: string) {
    await this.prisma.pushSubscription.deleteMany({
      where: { userId, endpoint },
    });
  }

  async sendToUser(userId: string, payload: { title: string; body: string; url?: string }) {
    const subscriptions = await this.prisma.pushSubscription.findMany({
      where: { userId },
    });

    await Promise.allSettled(
      subscriptions.map(async (sub) => {
        try {
          await webpush.sendNotification(
            { endpoint: sub.endpoint, keys: { p256dh: sub.p256dhKey, auth: sub.authKey } },
            JSON.stringify(payload),
          );
        } catch (err: unknown) {
          const status = (err as { statusCode?: number }).statusCode;
          if (status === 410 || status === 404) {
            await this.prisma.pushSubscription.delete({ where: { endpoint: sub.endpoint } });
            this.logger.warn(`Deleted expired subscription for user ${userId}`);
          } else {
            this.logger.error(`Push send failed for user ${userId}: ${(err as Error).message}`);
          }
        }
      }),
    );
  }
}
