import { IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';
import { OrderStatus } from '../../domain/enums/order-status.enum';

export class UpdateStatusDto {
  @IsUUID()
  id: string;

  @IsEnum(OrderStatus)
  status: OrderStatus;

  @IsUUID()
  @IsOptional()
  changedBy?: string;

  @IsString()
  @IsOptional()
  reason?: string;
}
