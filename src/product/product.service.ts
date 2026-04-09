import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { v4 as uuidv4 } from 'uuid';

type Product = CreateProductDto & { id: string };

@Injectable()
export class ProductService {
  private products: Product[] = [];

  // Create
  createProduct(data: CreateProductDto) {
    const newProduct = {
      id: uuidv4(),
      ...data,
    };

    this.products.push(newProduct);

    return {
      message: 'Product created successfully',
      data: newProduct,
    };
  }

  // Get All
  getAllProducts() {
    return this.products;
  }

  // Get One
  findOne(id: string) {
    const product = this.products.find((p) => p.id === id);

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return product;
  }

  // Update
  update(id: string, updateProductDto: UpdateProductDto) {
    const index = this.products.findIndex((p) => p.id === id);

    if (index === -1) {
      throw new NotFoundException('Product not found');
    }

    this.products[index] = {
      ...this.products[index],
      ...updateProductDto,
    };

    return this.products[index];
  }

  // Delete
  remove(id: string) {
    const index = this.products.findIndex((p) => p.id === id);

    if (index === -1) {
      throw new NotFoundException('Product not found');
    }

    const deletedProduct = this.products[index];
    this.products.splice(index, 1);

    return {
      message: 'Product deleted successfully',
      data: deletedProduct,
    };
  }
}
