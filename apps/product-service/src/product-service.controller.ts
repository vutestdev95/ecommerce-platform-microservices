import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ProductService } from './application/services/product.service';
import { CategoryService } from './application/services/category.service';
import { CreateProductDto } from './application/dtos/create-product.dto';
import { UpdateProductDto } from './application/dtos/update-product.dto';
import { CreateCategoryDto } from './application/dtos/create-category.dto';
import { QueryProductDto } from './application/dtos/query-product.dto';

@Controller()
export class ProductServiceController {
  constructor(
    private readonly productService: ProductService,
    private readonly categoryService: CategoryService,
  ) {}

  // ════════════════════════════════════
  // CATEGORY ENDPOINTS
  // ════════════════════════════════════

  @Post('categories')
  createCategory(@Body() dto: CreateCategoryDto) {
    return this.categoryService.createCategory(dto);
  }

  @Get('categories')
  findAllCategories() {
    return this.categoryService.findAll();
  }

  @Get('categories/:id')
  findOneCategory(@Param('id', ParseUUIDPipe) id: string) {
    return this.categoryService.findOne(id);
  }

  @Delete('categories/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  removeCategory(@Param('id', ParseUUIDPipe) id: string) {
    return this.categoryService.remove(id);
  }

  // ════════════════════════════════════
  // PRODUCT ENDPOINTS
  // ════════════════════════════════════

  @Post('products')
  createProduct(@Body() dto: CreateProductDto) {
    return this.productService.create(dto);
  }

  @Get('products')
  findAllProducts(@Query() query: QueryProductDto) {
    return this.productService.findAll(query);
  }

  @Get('products/:id')
  findOneProduct(@Param('id', ParseUUIDPipe) id: string) {
    return this.productService.findOne(id);
  }

  @Patch('products/:id')
  updateProduct(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateProductDto,
  ) {
    return this.productService.update(id, dto);
  }

  @Delete('products/:id')
  softDeleteProduct(@Param('id', ParseUUIDPipe) id: string) {
    return this.productService.softDelete(id);
  }

  @Patch('products/:id/restore')
  restoreProduct(@Param('id', ParseUUIDPipe) id: string) {
    return this.productService.restore(id);
  }
}
