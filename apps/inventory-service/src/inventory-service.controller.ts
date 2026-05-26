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
import { EventPattern, GrpcMethod, Payload } from '@nestjs/microservices';
import type { OrderCancelledEvent } from '@app/shared';
import { OrderEvents } from '@app/shared';

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

  @EventPattern(OrderEvents.Cancelled)
  async handleOrderCancelled(@Payload() data: OrderCancelledEvent) {
    console.log(`🔄 Auto-releasing stock for cancelled order: ${data.orderId}`);
    for (const item of data.items) {
      await this.inventoryService.release({
        productId: item.productId,
        quantity: item.quantity,
      });
      console.log(`  ✅ Released ${item.quantity}x product ${item.productId}`);
    }
    console.log(`🔄 Stock release completed for order: ${data.orderId}`);
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
