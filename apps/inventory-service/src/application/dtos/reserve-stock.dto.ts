import { IsNotEmpty, IsNumber, IsUUID, Min } from 'class-validator';

export class ReserveStockDto {
  @IsNumber()
  @Min(1, { message: 'Quantity must be at least one product.' })
  quantity: number;

  @IsUUID()
  @IsNotEmpty()
  productId: string;
}
