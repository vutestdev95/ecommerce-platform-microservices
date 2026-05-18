import { IsEnum, IsOptional, IsUUID } from 'class-validator';
import { OrderStatus } from '../../domain/enums/order-status.enum';
import { PaginationDto } from '@app/shared';

export class QueryOrderDto extends PaginationDto {
  @IsOptional()
  @IsUUID()
  userId?: string;

  @IsOptional()
  @IsEnum(OrderStatus)
  status?: OrderStatus;
}
