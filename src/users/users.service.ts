import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { CreateUserDto } from './dto/user.dto';

export type User = {
  id: string;
  name: string;
  email: string;
  password: string;
  role?: 'user' | 'admin';
};

@Injectable()
export class UserService {
  private users: User[] = [];

  async create(dto: CreateUserDto): Promise<User> {
    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const newUser: User = {
      id: uuidv4(),
      ...dto,
      password: hashedPassword,
    };
    this.users.push(newUser);
    return newUser;
  }

  async findByEmail(email: string): Promise<User | undefined> {
    return this.users.find((u) => u.email === email);
  }
}
