import { Module } from '@nestjs/common';
import { ProjectorsService } from './projectors.service';
import { ProjectorsController } from './projectors.controller';
import { Projector } from './entities/projector.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Theater } from '../theaters/entities/theater.entity';
import { TheatersModule } from 'src/theaters/theaters.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Projector, Theater]),
    TheatersModule,
  ],
  controllers: [ProjectorsController],
  providers: [ProjectorsService],
})
export class ProjectorsModule {}
