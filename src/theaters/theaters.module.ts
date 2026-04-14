import { Module } from '@nestjs/common';
import { TheatersService } from './theaters.service';
import { TheatersController } from './theaters.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Theater } from './entities/theater.entity';
import { Projector } from '../projectors/entities/projector.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Theater,Projector])],
  controllers: [TheatersController],
  providers: [TheatersService],
  exports: [TheatersService], // 👈 necesario
})
export class TheatersModule {}
