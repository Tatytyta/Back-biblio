import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Biblioteca Backend API is running! 🚀 Version: 2025.07.13.10.31';
  }
}
