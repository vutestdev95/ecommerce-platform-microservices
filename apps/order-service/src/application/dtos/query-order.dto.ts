import { IsEnum, IsNumber, IsOptional, IsUUID, Min } from 'class-validator';
import { OrderStatus } from '../../domain/enums/order-status.enum';
import { Type } from 'class-transformer';

export class QueryOrderDto {
  @IsOptional()
  @IsUUID()
  userId?: string;

  @IsOptional()
  @IsEnum(OrderStatus)
  status?: OrderStatus;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit?: number = 20;
}
