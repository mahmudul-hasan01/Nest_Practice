import { Injectable } from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client';

@Injectable()
export class PrismaService extends PrismaClient {
  constructor() {
    const connectionString = process.env.DATABASE_URL;

    if (!connectionString || typeof connectionString !== 'string') {
      throw new Error(
        'Missing or invalid DATABASE_URL environment variable. Expected a Postgres connection string like: postgres://user:password@host:5432/dbname',
      );
    }

    const adapter = new PrismaPg({
      connectionString,
    });

    super({ adapter });
  }
}
