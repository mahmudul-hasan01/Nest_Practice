import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Controller('product')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post()
  create(@Body() createProductDto: CreateProductDto) {
    return this.productService.createProduct(createProductDto);
  }

  // @UseGuards(AuthGuard, RolesGuard)
  // @Roles('admin')
  @Get()
  findAll() {
    return this.productService.products({});
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productService.products({ where: { id } });
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto) {
    return this.productService.updateProduct({
      where: { id },
      data: updateProductDto,
    });
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.productService.deleteProduct({ id });
  }
}
