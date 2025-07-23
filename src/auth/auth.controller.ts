import {
  Controller,
  Post,
  Body,
  BadRequestException,
  UnauthorizedException,
  ConflictException,
  Get,
  Put,
  Delete,
  Param,
  Query,
  UseGuards,
  Request,
  ParseIntPipe,
  ValidationPipe,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { CreateUsuarioDto } from '../usuarios/dto/create-usuario.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { UpdateProfileDto, ChangePasswordDto, ResetPasswordDto, DeactivateAccountDto } from './dto/update-profile.dto';
import { UpdateUsuarioDto } from '../usuarios/dto/update-usuario.dto';
import { GetUsersDto } from './dto/get-users.dto';
import { SuccessResponseDto } from '../common/dto/response.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { Roles } from './decorators/roles.decorator';
import { GetUser } from './decorators/get-user.decorator';
import { AuthUser } from './types/auth.types';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    try {
      const tokens = await this.authService.login(loginDto);
      if (!tokens) {
        throw new UnauthorizedException('Credenciales inválidas o usuario inactivo');
      }
      return new SuccessResponseDto('Login exitoso', tokens);
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new BadRequestException('Error en el proceso de login');
    }
  }

  @Post('register')
  async register(@Body() createUserDto: CreateUsuarioDto) {
    try {
      const tokens = await this.authService.register(createUserDto);
      if (!tokens) {
        throw new ConflictException('No se pudo registrar el usuario. Verifique que el email no esté en uso');
      }
      return new SuccessResponseDto('Registro exitoso', tokens);
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      throw new BadRequestException('Error en el proceso de registro');
    }
  }

  @Post('refresh')
  async refreshToken(@Body() refreshTokenDto: RefreshTokenDto) {
    try {
      const result = await this.authService.refreshToken(refreshTokenDto);
      if (!result) {
        throw new UnauthorizedException('Refresh token inválido o expirado');
      }
      return new SuccessResponseDto('Token renovado exitosamente', result);
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new BadRequestException('Error al renovar el token');
    }
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  async logout(@GetUser() user: AuthUser) {
    try {
      const result = await this.authService.revokeUserTokens(user.id);
      if (!result) {
        throw new BadRequestException('Error al cerrar sesión');
      }
      return new SuccessResponseDto('Sesión cerrada exitosamente', null);
    } catch (error) {
      throw new BadRequestException('Error al cerrar sesión');
    }
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  async getProfile(@GetUser() user: AuthUser) {
    return new SuccessResponseDto('Perfil obtenido exitosamente', user);
  }

  @Get('verify')
  @UseGuards(JwtAuthGuard)
  async verifyToken(@Request() req) {
    const user = await this.authService.validateUser(req.user.id);
    if (!user) {
      throw new UnauthorizedException('Usuario no válido');
    }
    return new SuccessResponseDto('Token válido', { user });
  }

  // READ - Obtener todos los usuarios (solo admin)
  @Get('users')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('administrador')
  async getAllUsers(@Query(ValidationPipe) query: GetUsersDto) {
    try {
      const users = await this.authService.getAllUsers(query);
      if (!users) {
        throw new BadRequestException('Error al obtener usuarios');
      }
      return new SuccessResponseDto('Usuarios obtenidos exitosamente', users);
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Error al obtener la lista de usuarios');
    }
  }

  // READ - Obtener usuario por ID (solo admin)
  @Get('users/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('administrador')
  async getUserById(@Param('id', ParseIntPipe) id: number) {
    try {
      const user = await this.authService.getUserById(id);
      if (!user) {
        throw new UnauthorizedException('Usuario no encontrado');
      }
      return new SuccessResponseDto('Usuario obtenido exitosamente', user);
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new BadRequestException('Error al obtener el usuario');
    }
  }

  // READ - Obtener estadísticas de usuarios (solo admin)
  @Get('users/stats/overview')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('administrador')
  async getUserStats() {
    try {
      const stats = await this.authService.getUserStats();
      return new SuccessResponseDto('Estadísticas obtenidas exitosamente', stats);
    } catch (error) {
      throw new BadRequestException('Error al obtener las estadísticas');
    }
  }

  // UPDATE - Actualizar mi perfil
  @Put('profile')
  @UseGuards(JwtAuthGuard)
  async updateProfile(
    @GetUser() user: AuthUser,
    @Body(ValidationPipe) updateData: UpdateProfileDto
  ) {
    try {
      const updatedUser = await this.authService.updateProfile(user.id, updateData);
      if (!updatedUser) {
        throw new BadRequestException('Error al actualizar el perfil');
      }
      return new SuccessResponseDto('Perfil actualizado exitosamente', updatedUser);
    } catch (error) {
      if (error instanceof ConflictException || error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Error al actualizar el perfil');
    }
  }

  // UPDATE - Actualizar usuario (solo admin)
  @Put('users/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('administrador')
  async updateUser(
    @Param('id', ParseIntPipe) id: number,
    @Body(ValidationPipe) updateData: UpdateUsuarioDto
  ) {
    try {
      const updatedUser = await this.authService.updateUser(id, updateData);
      if (!updatedUser) {
        throw new BadRequestException('Error al actualizar el usuario');
      }
      return new SuccessResponseDto('Usuario actualizado exitosamente', updatedUser);
    } catch (error) {
      if (error instanceof ConflictException || error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Error al actualizar el usuario');
    }
  }

  // UPDATE - Cambiar mi contraseña
  @Put('change-password')
  @UseGuards(JwtAuthGuard)
  async changePassword(
    @GetUser() user: AuthUser,
    @Body(ValidationPipe) changePasswordDto: ChangePasswordDto
  ) {
    try {
      const result = await this.authService.changePassword(user.id, changePasswordDto);
      if (!result) {
        throw new BadRequestException('Error al cambiar la contraseña');
      }
      return new SuccessResponseDto('Contraseña cambiada exitosamente. Debe volver a iniciar sesión.', null);
    } catch (error) {
      if (error instanceof UnauthorizedException || error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Error al cambiar la contraseña');
    }
  }

  // UPDATE - Resetear contraseña de usuario (solo admin)
  @Put('users/:id/reset-password')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('administrador')
  async resetPassword(
    @Param('id', ParseIntPipe) id: number,
    @Body(ValidationPipe) resetPasswordDto: ResetPasswordDto
  ) {
    try {
      const result = await this.authService.resetPassword(id, resetPasswordDto);
      if (!result) {
        throw new BadRequestException('Error al resetear la contraseña');
      }
      return new SuccessResponseDto('Contraseña reseteada exitosamente', null);
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Error al resetear la contraseña');
    }
  }

  // UPDATE - Activar/Desactivar usuario (solo admin)
  @Put('users/:id/toggle-status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('administrador')
  async toggleUserStatus(@Param('id', ParseIntPipe) id: number) {
    try {
      const user = await this.authService.toggleUserStatus(id);
      if (!user) {
        throw new BadRequestException('Error al cambiar el estado del usuario');
      }
      const status = user.activo ? 'activado' : 'desactivado';
      return new SuccessResponseDto(`Usuario ${status} exitosamente`, user);
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Error al cambiar el estado del usuario');
    }
  }

  // UPDATE - Desactivar mi cuenta
  @Put('deactivate-account')
  @UseGuards(JwtAuthGuard)
  async deactivateAccount(
    @GetUser() user: AuthUser,
    @Body(ValidationPipe) deactivateDto: DeactivateAccountDto
  ) {
    try {
      const result = await this.authService.deactivateAccount(user.id, deactivateDto);
      if (!result) {
        throw new BadRequestException('Error al desactivar la cuenta');
      }
      return new SuccessResponseDto('Cuenta desactivada exitosamente', null);
    } catch (error) {
      if (error instanceof UnauthorizedException || error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Error al desactivar la cuenta');
    }
  }

  // DELETE - Eliminar usuario (solo admin)
  @Delete('users/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('administrador')
  async deleteUser(@Param('id', ParseIntPipe) id: number) {
    try {
      const result = await this.authService.deleteUser(id);
      if (!result) {
        throw new BadRequestException('Error al eliminar el usuario');
      }
      return new SuccessResponseDto('Usuario eliminado exitosamente', null);
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Error al eliminar el usuario');
    }
  }
}
