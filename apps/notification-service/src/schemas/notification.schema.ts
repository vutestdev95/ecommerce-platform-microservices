import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export enum NotificationType {
  EMAIL = 'email',
  SMS = 'sms',
  PUSH = 'push',
}

@Schema({ timestamps: true })
export class Notification {
  @Prop({ required: true }) userId: string;
  @Prop({ required: true, enum: NotificationType }) type: NotificationType;
  @Prop({ required: true }) title: string;
  @Prop({ required: true }) content: string;
  @Prop({ default: false }) isRead: boolean;
}
export type NotificationDocument = Notification & Document;
export const NotificationSchema = SchemaFactory.createForClass(Notification);
