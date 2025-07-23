import { Injectable, UnauthorizedException, ForbiddenException, BadRequestException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UsuariosService } from '../usuarios/usuarios.service';
import { LoginDto } from './dto/login.dto';
import { CreateUsuarioDto } from '../usuarios/dto/create-usuario.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { UpdateProfileDto, ChangePasswordDto, ResetPasswordDto, DeactivateAccountDto } from './dto/update-profile.dto';
import { UpdateUsuarioDto } from '../usuarios/dto/update-usuario.dto';
import { GetUsersDto } from './dto/get-users.dto';
import { JwtPayload, TokenResponse, RefreshTokenResponse } from './types/auth.types';
import { RefreshTokenService } from './services/refresh-token.service';
import * as bcrypt from 'bcrypt';
import { Usuario } from 'src/usuarios/usuario.entity';

@Injectable()
export class AuthService {
  constructor(
    private readonly usuariosService: UsuariosService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly refreshTokenService: RefreshTokenService,
  ) { }

  async login(loginDto: LoginDto): Promise<TokenResponse | null> {
    try {
      // Intentar buscar por nombre primero, luego por email
      let user: Usuario | null = await this.usuariosService.findByNombre(loginDto.username);
      
      if (!user) {
        // Si no se encuentra por nombre, intentar por email
        user = await this.usuariosService.findByEmail(loginDto.username);
      }
      
      if (!user) return null;
      
      // Verificar si el usuario está activo
      if (!user.activo) return null;
      
      const isValid = await bcrypt.compare(loginDto.password, user.password);
      if (!isValid) return null;
      
      return this.generateTokens(user);
    } catch (err) {
      console.error('Unexpected login error:', err);
      return null;
    }
  }

  async register(createUsuarioDto: CreateUsuarioDto): Promise<TokenResponse | null> {
    try {
      const user = await this.usuariosService.create(createUsuarioDto);
      if (!user) return null;
      
      return this.generateTokens(user);
    } catch (err) {
      console.error('Unexpected register error:', err);
      return null;
    }
  }

  private generateTokens(user: Usuario): TokenResponse {
    const payload: JwtPayload = { 
      id: user.id, 
      username: user.nombre, 
      email: user.email,
      role: user.role 
    };

    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.refreshTokenService.generateRefreshToken(user);
    
    const expiresIn = this.parseExpirationTime(
      this.configService.get('JWT_EXPIRES_IN') || '1h'
    );

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      expires_in: expiresIn,
      token_type: 'Bearer',
    };
  }

  private parseExpirationTime(expiration: string): number {
    const unit = expiration.slice(-1);
    const value = parseInt(expiration.slice(0, -1));
    
    switch (unit) {
      case 's': return value;
      case 'm': return value * 60;
      case 'h': return value * 60 * 60;
      case 'd': return value * 24 * 60 * 60;
      default: return 3600; // 1 hora por defecto
    }
  }

  async refreshToken(refreshTokenDto: RefreshTokenDto): Promise<RefreshTokenResponse | null> {
    try {
      const payload = await this.refreshTokenService.verifyRefreshToken(refreshTokenDto.refreshToken);
      
      if (!payload) {
        throw new UnauthorizedException('Refresh token inválido');
      }

      const user = await this.usuariosService.findOne(payload.id);
      
      if (!user || !user.activo) {
        throw new UnauthorizedException('Usuario no encontrado o inactivo');
      }

      // Verificar que la versión del token coincida
      if (payload.tokenVersion !== user.tokenVersion) {
        throw new ForbiddenException('Token version inválida');
      }

      const newPayload: JwtPayload = {
        id: user.id,
        username: user.nombre,
        email: user.email,
        role: user.role,
      };

      const newAccessToken = this.jwtService.sign(newPayload);
      const expiresIn = this.parseExpirationTime(
        this.configService.get('JWT_EXPIRES_IN') || '1h'
      );

      return {
        access_token: newAccessToken,
        expires_in: expiresIn,
      };
    } catch (err) {
      console.error('Unexpected refresh token error:', err);
      return null;
    }
  }

  async revokeUserTokens(userId: number): Promise<boolean> {
    try {
      const user = await this.usuariosService.findOne(userId);
      if (!user) return false;

      // Incrementar la versión del token para invalidar todos los refresh tokens
      await this.usuariosService.updateTokenVersion(userId);
      return true;
    } catch (err) {
      console.error('Error revoking tokens:', err);
      return false;
    }
  }

  async validateUser(id: number): Promise<Usuario | null> {
    try {
      const user = await this.usuariosService.findOne(id);
      if (!user || !user.activo) return null;
      return user;
    } catch (err) {
      console.error('Error validating user:', err);
      return null;
    }
  }

  async verifyToken(token: string): Promise<any> {
    try {
      return this.jwtService.verify(token);
    } catch (err) {
      throw new UnauthorizedException('Invalid token');
    }
  }

  // ===============================
  // OPERACIONES CRUD
  // ===============================

  // READ - Obtener todos los usuarios (solo admin)
  async getAllUsers(query: GetUsersDto): Promise<any> {
    try {
      return await this.usuariosService.findAllWithFilters(query);
    } catch (err) {
      console.error('Error al obtener usuarios:', err);
      throw new BadRequestException('Error al obtener la lista de usuarios');
    }
  }

  // READ - Obtener usuario por ID (solo admin)
  async getUserById(id: number): Promise<Usuario | null> {
    try {
      const user = await this.usuariosService.findOne(id);
      if (!user) {
        throw new UnauthorizedException('Usuario no encontrado');
      }
      return user;
    } catch (err) {
      console.error('Error al obtener usuario:', err);
      return null;
    }
  }

  // UPDATE - Actualizar perfil propio
  async updateProfile(userId: number, updateData: UpdateProfileDto): Promise<Usuario | null> {
    try {
      const user = await this.usuariosService.findOne(userId);
      if (!user) {
        throw new UnauthorizedException('Usuario no encontrado');
      }

      // Verificar si el email ya existe (si se está actualizando)
      if (updateData.email && updateData.email !== user.email) {
        const existingUser = await this.usuariosService.findByEmail(updateData.email);
        if (existingUser) {
          throw new ConflictException('El email ya está en uso');
        }
      }

      const updatedUser = await this.usuariosService.update(userId, updateData);
      return updatedUser;
    } catch (err) {
      console.error('Error al actualizar perfil:', err);
      if (err instanceof ConflictException) {
        throw err;
      }
      throw new BadRequestException('Error al actualizar el perfil');
    }
  }

  // UPDATE - Actualizar cualquier usuario (solo admin)
  async updateUser(userId: number, updateData: UpdateUsuarioDto): Promise<Usuario | null> {
    try {
      const user = await this.usuariosService.findOne(userId);
      if (!user) {
        throw new UnauthorizedException('Usuario no encontrado');
      }

      // Verificar si el email ya existe (si se está actualizando)
      if (updateData.email && updateData.email !== user.email) {
        const existingUser = await this.usuariosService.findByEmail(updateData.email);
        if (existingUser) {
          throw new ConflictException('El email ya está en uso');
        }
      }

      const updatedUser = await this.usuariosService.update(userId, updateData);
      
      // Si se desactiva el usuario, revocar todos sus tokens
      if (updateData.activo === false) {
        await this.revokeUserTokens(userId);
      }

      return updatedUser;
    } catch (err) {
      console.error('Error al actualizar usuario:', err);
      if (err instanceof ConflictException) {
        throw err;
      }
      throw new BadRequestException('Error al actualizar el usuario');
    }
  }

  // UPDATE - Cambiar contraseña (usuario autenticado)
  async changePassword(userId: number, changePasswordDto: ChangePasswordDto): Promise<boolean> {
    try {
      const user = await this.usuariosService.findOne(userId);
      if (!user) {
        throw new UnauthorizedException('Usuario no encontrado');
      }

      // Verificar contraseña actual
      const isCurrentPasswordValid = await bcrypt.compare(changePasswordDto.currentPassword, user.password);
      if (!isCurrentPasswordValid) {
        throw new UnauthorizedException('La contraseña actual es incorrecta');
      }

      // Verificar que la nueva contraseña no sea igual a la actual
      const isSamePassword = await bcrypt.compare(changePasswordDto.newPassword, user.password);
      if (isSamePassword) {
        throw new BadRequestException('La nueva contraseña debe ser diferente a la actual');
      }

      // Actualizar contraseña
      const hashedPassword = await bcrypt.hash(changePasswordDto.newPassword, 10);
      await this.usuariosService.update(userId, { password: hashedPassword });

      // Revocar todos los tokens para forzar re-login
      await this.revokeUserTokens(userId);

      return true;
    } catch (err) {
      console.error('Error al cambiar contraseña:', err);
      if (err instanceof UnauthorizedException || err instanceof BadRequestException) {
        throw err;
      }
      throw new BadRequestException('Error al cambiar la contraseña');
    }
  }

  // UPDATE - Resetear contraseña (solo admin)
  async resetPassword(userId: number, resetPasswordDto: ResetPasswordDto): Promise<boolean> {
    try {
      const user = await this.usuariosService.findOne(userId);
      if (!user) {
        throw new UnauthorizedException('Usuario no encontrado');
      }

      // Actualizar contraseña
      const hashedPassword = await bcrypt.hash(resetPasswordDto.newPassword, 10);
      await this.usuariosService.update(userId, { password: hashedPassword });

      // Revocar todos los tokens para forzar re-login
      await this.revokeUserTokens(userId);

      return true;
    } catch (err) {
      console.error('Error al resetear contraseña:', err);
      throw new BadRequestException('Error al resetear la contraseña');
    }
  }

  // UPDATE - Desactivar cuenta propia
  async deactivateAccount(userId: number, deactivateDto: DeactivateAccountDto): Promise<boolean> {
    try {
      const user = await this.usuariosService.findOne(userId);
      if (!user) {
        throw new UnauthorizedException('Usuario no encontrado');
      }

      // Verificar contraseña
      const isPasswordValid = await bcrypt.compare(deactivateDto.password, user.password);
      if (!isPasswordValid) {
        throw new UnauthorizedException('La contraseña es incorrecta');
      }

      // Desactivar cuenta
      await this.usuariosService.update(userId, { activo: false });

      // Revocar todos los tokens
      await this.revokeUserTokens(userId);

      console.log(`Cuenta desactivada para usuario ${userId}. Razón: ${deactivateDto.reason || 'No especificada'}`);
      return true;
    } catch (err) {
      console.error('Error al desactivar cuenta:', err);
      if (err instanceof UnauthorizedException) {
        throw err;
      }
      throw new BadRequestException('Error al desactivar la cuenta');
    }
  }

  // DELETE - Eliminar usuario (solo admin)
  async deleteUser(userId: number): Promise<boolean> {
    try {
      const user = await this.usuariosService.findOne(userId);
      if (!user) {
        throw new UnauthorizedException('Usuario no encontrado');
      }

      // Revocar todos los tokens antes de eliminar
      await this.revokeUserTokens(userId);

      // Eliminar usuario
      const deletedUser = await this.usuariosService.remove(userId);
      
      return deletedUser !== null;
    } catch (err) {
      console.error('Error al eliminar usuario:', err);
      throw new BadRequestException('Error al eliminar el usuario');
    }
  }

  // UPDATE - Activar/Desactivar usuario (solo admin)
  async toggleUserStatus(userId: number): Promise<Usuario | null> {
    try {
      const user = await this.usuariosService.findOne(userId);
      if (!user) {
        throw new UnauthorizedException('Usuario no encontrado');
      }

      const newStatus = !user.activo;
      const updatedUser = await this.usuariosService.update(userId, { activo: newStatus });

      // Si se desactiva, revocar tokens
      if (!newStatus) {
        await this.revokeUserTokens(userId);
      }

      return updatedUser;
    } catch (err) {
      console.error('Error al cambiar estado del usuario:', err);
      throw new BadRequestException('Error al cambiar el estado del usuario');
    }
  }

  // READ - Obtener estadísticas de usuarios (solo admin)
  async getUserStats(): Promise<any> {
    try {
      return await this.usuariosService.getUserStatistics();
    } catch (err) {
      console.error('Error al obtener estadísticas:', err);
      throw new BadRequestException('Error al obtener las estadísticas de usuarios');
    }
  }
}
