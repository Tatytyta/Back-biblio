import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';

@Controller('test-role')
export class TestRoleController {
  
  @UseGuards(JwtAuthGuard)
  @Get()
  public async testRole(@Request() req) {
    return {
      success: true,
      message: 'Información del usuario:',
      userData: {
        id: req.user.id,
        username: req.user.username,
        email: req.user.email,
        role: req.user.role,
      },
      fullUser: req.user,
      timestamp: new Date().toISOString()
    };
  }
}
