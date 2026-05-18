import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { CreateOrderDto } from './application/dtos/create-order.dto';
import { OrderService } from './application/services/order.service';
import { QueryOrderDto } from './application/dtos/query-order.dto';
import { UpdateStatusDto } from './application/dtos/update-status.dto';

@Controller('orders')
export class OrderServiceController {
  constructor(private readonly orderService: OrderService) {}

  //@IsUUID()
  //   @IsNotEmpty()
  //   userId: string;
  //
  //   @IsNotEmpty()
  //   @IsString()
  //   shippingAddress: string;
  //
  //   @IsArray()
  //   @ArrayMinSize(1, { message: 'Order must have at least 1 item' })
  //   @ValidateNested({ each: true })
  //   @Type(() => CreateOrderItemDto)
  //   items: CreateOrderItemDto[];
  //
  //   @IsString()
  //   @IsOptional()
  //   note?: string;
  @Post()
  async createOrder(@Body() dto: CreateOrderDto) {
    await this.orderService.createOrder(dto);
  }

  @Get()
  async getAllOrders(@Query() dto: QueryOrderDto) {
    return this.orderService.findAllOrders(dto);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.orderService.findOne(id);
  }

  @Patch('/status')
  updateStatus(@Body() dto: UpdateStatusDto) {
    return this.orderService.updateStatus(dto);
  }

  @Get(':id/logs')
  getStatusLogs(@Param('id', ParseUUIDPipe) id: string) {
    return this.orderService.getStatusLogs(id);
  }
}
