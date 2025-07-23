import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Resena, ResenaSchema } from './schemas/resena.schema';
import { ResenasLibrosService } from './resenas-libros.service';
import { ResenasLibrosController } from './resenas-libros.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Resena.name, schema: ResenaSchema },
    ]),
    AuthModule,
  ],
  controllers: [ResenasLibrosController],
  providers: [ResenasLibrosService],
  exports: [ResenasLibrosService],
})
export class ResenasLibrosModule {}
