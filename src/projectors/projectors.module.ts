import { Module } from '@nestjs/common';
import { ProjectorsService } from './projectors.service';
import { ProjectorsController } from './projectors.controller';
import { Projector } from './entities/projector.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Theater } from '../theaters/entities/theater.entity';
import { TheatersService } from 'src/theaters/theaters.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Projector, Theater])
],
  controllers: [ProjectorsController],
  providers: [ProjectorsService, TheatersService],
})
export class ProjectorsModule {}
