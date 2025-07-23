import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';

@Controller('test-auth')
export class TestAuthController {
  
  @Get()
  public async testPublico() {
    return {
      success: true,
      message: 'Este endpoint no requiere autenticación',
      timestamp: new Date().toISOString()
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get('protegido')
  public async testProtegido(@Request() req) {
    return {
      success: true,
      message: 'Has accedido correctamente a un endpoint protegido',
      userData: req.user,
      timestamp: new Date().toISOString()
    };
  }
}
