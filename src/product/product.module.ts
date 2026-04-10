// product.module.ts
import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';

@Module({
  imports: [
    MulterModule.register({
      dest: './uploads/products',
    }),
  ],
  controllers: [ProductController],
  providers: [ProductService],
})
export class ProductModule {}

// import { Module } from '@nestjs/common';
// import { ProductService } from './product.service';
// import { ProductController } from './product.controller';

// @Module({
//   controllers: [ProductController],
//   providers: [ProductService],
// })
// export class ProductModule {}
