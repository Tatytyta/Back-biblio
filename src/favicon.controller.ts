import { Controller, Get, Res } from '@nestjs/common';
import { Response } from 'express';
import { join } from 'path';

@Controller()
export class FaviconController {
  @Get('favicon.ico')
  getFavicon(@Res() res: Response): void {
    res.sendFile(join(__dirname, '..', 'public', 'favicon.ico'));
  }
}
