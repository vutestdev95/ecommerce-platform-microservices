import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { InventoryService } from './application/services/inventory.service';
import { CreateInventoryDto } from './application/dtos/create-inventory.dto';
import { UpdateStockDto } from './application/dtos/update-stock.dto';
import { ReserveStockDto } from './application/dtos/reserve-stock.dto';
import { Inventory } from './domain/entities/inventory.entity';
import { GrpcMethod } from '@nestjs/microservices';

@Controller('inventory')
export class InventoryServiceController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Post()
  create(@Body() dto: CreateInventoryDto) {
    return this.inventoryService.create(dto);
  }

  @Get()
  findAll(): Promise<Inventory[]> {
    return this.inventoryService.findAll();
  }

  @Get('low-stock')
  findLowStock(@Query('threshold') threshold?: string) {
    return this.inventoryService.findLowStock(
      threshold ? parseInt(threshold, 10) : 10,
    );
  }

  @Get(':productId')
  findByProductId(@Param('productId', ParseUUIDPipe) productId: string) {
    return this.inventoryService.findByProductId(productId);
  }

  @Patch()
  updateStock(@Body() dto: UpdateStockDto) {
    return this.inventoryService.updateStock(dto);
  }

  @Post('reserve')
  @HttpCode(HttpStatus.OK)
  reserve(@Body() dto: ReserveStockDto) {
    return this.inventoryService.reserve(dto);
  }

  @Post('release')
  @HttpCode(HttpStatus.OK)
  release(@Body() dto: ReserveStockDto) {
    return this.inventoryService.release(dto);
  }

  @Post('confirm')
  @HttpCode(HttpStatus.OK)
  confirm(@Body() dto: ReserveStockDto) {
    return this.inventoryService.confirm(dto);
  }

  @GrpcMethod('InventoryService', 'FindByProductId')
  async grpcFindByProductId(data: { productId: string }) {
    const inv = await this.inventoryService.findByProductId(data.productId);
    return this.toGrpcResponse(inv);
  }

  @GrpcMethod('InventoryService', 'Reserve')
  async grpcReserve(data: ReserveStockDto) {
    console.log('gRPC Reserve received:', JSON.stringify(data));

    const inv = await this.inventoryService.reserve(data);
    return this.toGrpcResponse(inv);
  }

  @GrpcMethod('InventoryService', 'Release')
  async grpcRelease(data: ReserveStockDto) {
    const inv = await this.inventoryService.release(data);
    return this.toGrpcResponse(inv);
  }

  @GrpcMethod('InventoryService', 'Confirm')
  async grpcConfirm(data: ReserveStockDto) {
    const inv = await this.inventoryService.confirm(data);
    return this.toGrpcResponse(inv);
  }

  private toGrpcResponse(inv: Inventory) {
    return {
      id: inv.id,
      productId: inv.productId,
      quantity: inv.quantity,
      reservedQuantity: inv.reservedQuantity,
      availableQuantity: inv.quantity - inv.reservedQuantity,
    };
  }
}
