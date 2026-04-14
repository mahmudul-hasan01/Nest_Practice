// product.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
  HttpStatus,
  BadRequestException,
  Req,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import type { Request } from 'express'; // ✅ import type

const multerOptions = {
  storage: diskStorage({
    destination: (req, file, cb) => {
      const uploadPath = './uploads/products';
      if (!existsSync(uploadPath)) {
        mkdirSync(uploadPath, { recursive: true });
      }
      cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
      const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
      cb(null, `product-${unique}${extname(file.originalname)}`);
    },
  }),
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowed.includes(file.mimetype)) {
      return cb(
        new BadRequestException('Only jpeg, png, webp images are allowed'),
        false,
      );
    }
    cb(null, true);
  },
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
};

@Controller('product')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  // ── Helper to build full image URL ──────────────────────────
  private getImageUrl(req: Request, imagePath: string | null): string | null {
    if (!imagePath) return null;
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    return `${baseUrl}/${imagePath}`;
  }

  // ── CREATE ───────────────────────────────────────────────────
  @Post()
  @UseInterceptors(FileInterceptor('image', multerOptions))
  async create(
    @Req() req: Request,
    @Body() createProductDto: CreateProductDto,
    @UploadedFile(
      new ParseFilePipe({
        validators: [new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 })],
        fileIsRequired: false,
        errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
      }),
    )
    file: Express.Multer.File,
  ) {
    if (file) {
      // Use file.filename to avoid Windows backslash issues
      createProductDto.image = `uploads/products/${file.filename}`;
    }

    const product = await this.productService.createProduct(createProductDto);

    return {
      ...product,
      image: this.getImageUrl(req, product.image),
    };
  }

  // ── GET ALL ──────────────────────────────────────────────────
  @Get()
  async findAll(@Req() req: Request) {
    const products = await this.productService.products({});

    return products.map((product) => ({
      ...product,
      image: this.getImageUrl(req, product.image),
    }));
  }

  // ── GET ONE ──────────────────────────────────────────────────
  @Get(':id')
  async findOne(@Req() req: Request, @Param('id') id: string) {
    const products = await this.productService.products({ where: { id } });

    return products.map((product) => ({
      ...product,
      image: this.getImageUrl(req, product.image),
    }));
  }

  // ── UPDATE ───────────────────────────────────────────────────
  @Patch(':id')
  @UseInterceptors(FileInterceptor('image', multerOptions))
  async update(
    @Req() req: Request,
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
    @UploadedFile(
      new ParseFilePipe({
        validators: [new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 })],
        fileIsRequired: false,
        errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
      }),
    )
    file: Express.Multer.File,
  ) {
    if (file) {
      // ✅ Use file.filename to avoid Windows backslash issues
      updateProductDto.image = `uploads/products/${file.filename}`;
    }

    const product = await this.productService.updateProduct({
      where: { id },
      data: updateProductDto,
    });

    return {
      ...product,
      image: this.getImageUrl(req, product.image),
    };
  }

  // ── DELETE ───────────────────────────────────────────────────
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.productService.deleteProduct({ id });
  }
}
