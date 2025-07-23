import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { RefreshTokenPayload } from '../types/auth.types';
import { Usuario } from '../../usuarios/usuario.entity';

@Injectable()
export class RefreshTokenService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  generateRefreshToken(user: Usuario): string {
    const payload: RefreshTokenPayload = {
      id: user.id,
      username: user.nombre,
      tokenVersion: user.tokenVersion,
    };

    return this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_REFRESH_SECRET'),
      expiresIn: this.configService.get('JWT_REFRESH_EXPIRES_IN') || '7d',
    });
  }

  async verifyRefreshToken(token: string): Promise<RefreshTokenPayload | null> {
    try {
      const payload = this.jwtService.verify(token, {
        secret: this.configService.get('JWT_REFRESH_SECRET'),
      });
      return payload as RefreshTokenPayload;
    } catch (error) {
      return null;
    }
  }
}
