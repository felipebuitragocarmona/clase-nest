import { Module } from '@nestjs/common';
import { SeatsService } from './seats.service';
import { SeatsController } from './seats.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Seat } from './entities/seat.entity';
import { Theater } from 'src/theaters/entities/theater.entity';
import { TheatersService } from 'src/theaters/theaters.service';

@Module({
  imports: [TypeOrmModule.forFeature([Seat, Theater])],
  controllers: [SeatsController],
  providers: [SeatsService, TheatersService],
})
export class SeatsModule {}
