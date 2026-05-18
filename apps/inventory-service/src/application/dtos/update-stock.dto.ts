import { IsNotEmpty, IsNumber, IsUUID, Min } from 'class-validator';

export class UpdateStockDto {
  @IsNumber()
  @Min(0)
  quantity: number;

  @IsUUID()
  @IsNotEmpty()
  productId: string;
}
