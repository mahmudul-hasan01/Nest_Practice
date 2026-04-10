import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UserService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  async register(dto: { name: string; email: string; password: string }) {
    const existing = await this.userService.findByEmail(dto.email);
    if (existing) throw new UnauthorizedException('Email already exists');
    const user = await this.userService.create(dto);
    return {
      message: 'User created',
      user: { id: user.id, name: user.name, email: user.email },
    };
  }

  async login(email: string, password: string) {
    const user = await this.userService.findByEmail(email);
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new UnauthorizedException('Invalid credentials');

    const payload = {
      sub: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    };

    const access_token = await this.jwtService.signAsync(payload);

    // const refresh_token = await this.jwtService.signAsync(payload, {
    //   expiresIn: '30d',
    // });

    return {
      access_token,
      // refresh_token,
    };
  }
}
